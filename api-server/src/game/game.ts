import { Player, PLAYER_REMOVAL_TIME } from './player';
import { Bullet, BULLET_DAMAGE } from "./bullet";
import { io } from '../sockets';
import { PlayerDetailsT, BulletDetailsT } from './packet-meta';
import { doCirclesCollide } from '../util/do-circles-collide';
import { EventEmitter } from 'events';

type Socket = SocketIO.Socket;

export const KILL_TARGET_SCORE_BONUS = 50;
export const KILL_INNOCENT_SCORE_PENALTY = 100;
export const DEATH_SCORE_PENALTY = 10;

export class Game extends EventEmitter {
    constructor() {
        super();
    }
    
    private _lastTime: Date;
    private _gameTickInterval: any = null;
    start() {
        this._lastTime = new Date();
        this._gameTickInterval = setInterval(() => this.onTick(), 1000 / 30);
    }
    stop() {
        if (this._gameTickInterval) {
            clearInterval(this._gameTickInterval);
            this._gameTickInterval = null;
        }
    }
    
    private onTick() {
        let now = new Date();
        let delta = (now.valueOf() - this._lastTime.valueOf()) / 1000; //Seconds since last tick
        this._lastTime = now;
        let players: Player[];
        
        players = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        for (let p of players) {
            p.tick(delta);
        }
        for (let b of this.bullets) {
            b.tick(delta);
        }
        this.bulletCollisionCheck(delta);
        
        //Some players may have been removed in a previous step, so recalculate players
        players = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        for (let p of players) {
            p.networkTick(delta);
        }
    }
    
    players = new Map<number, Player>();
    
    nextPlayerId: number = 1000;
    createPlayerWithUniqueID(socket: Socket) {
        return new Player(this.nextPlayerId++, socket);
    }
    
    addPlayer(player: Player) {
        let prev = this.players.get(player.playerId) || null;
        let isPreexisting = prev === player;
        if (!isPreexisting && !!prev) throw new Error(`A player with that ID already exists!`);
        
        if (!player.socket) throw new Error(`Can't add a player without a socket.`);
        player.isDisconnected = false;
        player.timeUntilRemoval = 0;
        this.attachSocketEvents(player);
        
        if (!isPreexisting) player.randomizePosition();
        
        //Send initial player state to the new player
        player.socket.emit('assign-player-id', player.playerId, player.getDetails(true));
        
        //Send other players' state to the new player
        let otherPlayers = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        for (let p of otherPlayers) {
            this.sendPlayerUpdate(p, true, player.socket);
        }
        
        if (!isPreexisting) {
            //Send the new player's initial state to the other players
            this.sendPlayerUpdate(player);
        }
        
        //Add the new player to the game world
        this.players.set(player.playerId, player);
        player.game = this;
    }
    beginRemovePlayer(player: Player) {
        this.detachSocketEvents(player);
        player.isDisconnected = true;
        player.timeUntilRemoval = PLAYER_REMOVAL_TIME;
    }
    removePlayer(player: Player) {
        this.players.delete(player.playerId);
        player.game = null;
        io!.emit('remove-player', player.playerId);
    }
    
    private attachSocketEvents(player: Player) {
        let socket = player.socket!;
        
        socket.on('update-player', (pid: number, details: Partial<PlayerDetailsT> | null) => {
            if (!details || !player || player.playerId !== pid) return;
            details = player.sanitizeDetails(details);
            player.setDetails(details);
        });
        
        socket.on('fire-bullet', (details: BulletDetailsT) =>{
            if(!player || player.playerId !== details.ignorePlayerId) return;
            this.addBullet(details);
            io!.emit('create-bullet', details);
        });
    }
    private detachSocketEvents(player: Player) {
        let socket = player.socket!;
        player.socket = null;
        socket.removeAllListeners('update-player');
        socket.removeAllListeners('fire-bullet');
    }
    
    sendPlayerUpdate(player: Player, force = false, socket: Socket | null = null) {
        let detailsPacket = player.getDetails(force);
        if (!detailsPacket) return;
        if (socket) socket.emit('update-player', player.playerId, detailsPacket);
        else io!.emit('update-player', player.playerId, detailsPacket);
    }
    
    bullets: Bullet[] = [];
    addBullet(details: BulletDetailsT): void {
        let bullet = new Bullet(details);
        this.bullets.push(bullet);
        bullet.game = this;
    }
    removeBullet(bullet: Bullet): void {
        let idx = this.bullets.indexOf(bullet);
        if (idx !== -1) this.bullets.splice(idx, 1);
        bullet.game = null;
    }
    
    bulletCollisionCheck(delta: number): void {
        let players = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        
        //Rather than modifying the array while we're iterating through it,
        //keep track of bullets that should be removed and delete them afterwards
        let bulletsToRemove = [];
        
        for (let bullet of this.bullets) {
            for (let player of players) {
                if (bullet.shouldIgnorePlayer(player)) continue;
                if (player.isInvulnerable()) continue;
                if (!doCirclesCollide(bullet.getCollisionCircle(), player.getCollisionCircle())) continue;
                
                this.handleBulletHit(bullet, player);
                bulletsToRemove.push(bullet);
                break; // bullet gone -> stop checking players -> go to next bullet
            }
        }
        
        for (let bullet of bulletsToRemove) {
            this.removeBullet(bullet);
        }
    }
    
    handleBulletHit(bullet: Bullet, playerWhoDied: Player): void{
        let shooter: Player|undefined = this.players.get(bullet.getIgnoreId());
        let damageWasLethal: boolean = playerWhoDied.takeDamage(BULLET_DAMAGE, shooter);
        
        if (damageWasLethal){
            if (typeof shooter !== "undefined"){
                let playerWasInnocent = this.playerWasInnocent(shooter, playerWhoDied);
                if (shooter.targetID == playerWhoDied.playerId){
                    shooter.score += KILL_TARGET_SCORE_BONUS;
                } else if (playerWasInnocent){
                    shooter.score = Math.max(shooter.score - KILL_INNOCENT_SCORE_PENALTY, 0.0);
                } 
                
                if (!playerWasInnocent){
                    // if kill someone who attacked you, you got revenge, remove them from attackers
                    shooter.removeAttackerPlayer(playerWhoDied);
                }
            }
            
            playerWhoDied.score = Math.max(playerWhoDied.score - DEATH_SCORE_PENALTY, 0.0);
        }
    }
    
    playerWasInnocent(shooter:Player, playerWhoDied:Player): boolean {
        return !shooter.attackedByPlayer(playerWhoDied);
    }
}
