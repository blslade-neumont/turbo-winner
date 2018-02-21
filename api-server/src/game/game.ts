import { Player } from './player';
import { Bullet, BULLET_DAMAGE } from "./bullet";
import { io } from '../sockets';
import { PlayerDetailsT, BulletDetailsT } from './packet-meta';
import { doCirclesCollide } from '../util/do-circles-collide';

type Socket = SocketIO.Socket;

export class Game {
    constructor() { }
    
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
        let players = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        
        for (let p of players) {
            p.tick(delta);
        }
        for (let b of this.bullets) {
            b.tick(delta);
        }
        this.bulletCollisionCheck(delta);
        
        for (let p of players) {
            p.networkTick(delta);
        }
    }
    
    players = new Map<number, Player>();
    
    addPlayer(player: Player) {
        let isPreexisting = this.players.get(player.playerId) === player;
        
        //Values used to put new Player within a certain radius of something
            //Change the minDist and maxDist to change how far or how close they will spawn to desired point (desired point is 0.0 right now)
        let minDist = 10;
        let maxDist = 1000;
        let radius = Math.floor(Math.random() * 1000) + 10;
        let theta = Math.floor(Math.random() * (Math.PI * 2)) + 0;
        
        if (!isPreexisting) {
            player.x = Math.cos(theta) * radius;
            player.y = Math.sin(theta) * radius;
        }
        
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
    removePlayer(player: Player) {
        this.players.delete(player.playerId);
        player.game = null;
        io!.emit('remove-player', player.playerId);
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
                
                player.takeDamage(BULLET_DAMAGE);
                bulletsToRemove.push(bullet);
                break; // bullet gone -> stop checking players -> go to next bullet
            }
        }
        
        for (let bullet of bulletsToRemove) {
            this.removeBullet(bullet);
        }
    }
}
