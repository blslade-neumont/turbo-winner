import { PlayerDetailsT } from './packet-meta';
import cloneDeep = require('lodash.clonedeep');
import { Game } from './game';
import { isSignificantlyDifferent } from '../util/is-significantly-different';
import { CircleT } from '../util/circle';
import { EventEmitter } from 'events';

type Socket = SocketIO.Socket;

const COLORS = [
    'red',
    'green',
    'blue',
    'orange',
    'pink',
    'purple',
    'black',
    'white'
];
function chooseRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const ATTACKER_TTL: number = 30;
export const PLAYER_ACCELERATION: number = 5;
export const PLAYER_FRICTION: number = 3.0;
export const MAX_PLAYER_HEALTH: number = 100;
export const PLAYER_RADIUS = 0.5;
export const INVULN_ON_START = 5;
export const RESPAWN_TIME = 10;
export const PLAYER_REMOVAL_TIME = 10;
export const TARGET_ASSIGNMENT_TIME = 100;

export class Player extends EventEmitter {
    constructor(
        readonly playerId: number,
        readonly socket: Socket
    ) {
        super();
    }
    
    public game: Game | null;
    
    googleId: string;
    
    x = 0;
    y = 0;
    hspeed = 0;
    vspeed = 0;
    forward = { x: 1, y: 0 };
    inputAcceleration = { x: 0, y: 0 };
    color = chooseRandomColor();
    health = MAX_PLAYER_HEALTH;
    invulnTime = INVULN_ON_START;
    respawnTime = 0;
    isDead = false;
    forcePlayerUpdate: boolean = false;
    ignorePlayerTimer = 0.0;
    isDisconnected = false;
    timeUntilRemoval = 0;
    score = 0;
    targetID = -1;
    attackers: Array<{id: number, timer: number}> = []
    displayName: string;
    didAttackersChange: boolean = true;
    
    isInvulnerable(): boolean{
        return this.invulnTime > 0.0;
    }
    
    randomizePosition() {
        let minDist = 10/96;
        let maxDist = 1000/96;
        let radius = Math.floor(Math.random() * maxDist) + minDist;
        let theta = Math.floor(Math.random() * (Math.PI * 2));
        
        this.x = Math.cos(theta) * radius;
        this.y = Math.sin(theta) * radius;
    }
    
    private targetAssignmentTimer: number;
    private targetRef: Player;
    
    tick(delta: number) {
        // adjust the player's velocity according to the inputs specified
        let moveAmount = PLAYER_ACCELERATION * delta;
        let movement = { x: this.inputAcceleration.x * moveAmount, y: this.inputAcceleration.y * moveAmount };
        
        this.hspeed += movement.x;
        this.vspeed += movement.y;
        
        // framerate-independent friction
        let xRatio = 1 / (1 + (delta * PLAYER_FRICTION));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;
        
        this.x += this.hspeed * delta;
        this.y += this.vspeed * delta;
        
        this.invulnTime = Math.max(this.invulnTime - delta, 0.0);
        
        if (this.isDead) {
            this.respawnTime -= delta;
            if (this.respawnTime <= 0.0){
                this.isDead = false;
                this.randomizePosition();
                this.health = MAX_PLAYER_HEALTH;
                this.invulnTime = INVULN_ON_START;
                this.forcePlayerUpdate = true;
                this.ignorePlayerTimer = 1.0;
            }
            
            this.respawnTime = Math.max(this.respawnTime, 0.0);
            this.respawnTime = Math.min(this.respawnTime, RESPAWN_TIME);
        }
        
        this.ignorePlayerTimer = Math.max(this.ignorePlayerTimer - delta, 0.0);
        this.updateAttackers(delta);
        
        if (this.isDisconnected) {
            this.timeUntilRemoval -= delta;
            if (this.timeUntilRemoval <= 0) this.removeFromGame();
        }
        
        this.targetAssignmentTimer -= delta;
        if(this.targetID === -1 ||
           this.targetRef.isDead || 
           this.targetAssignmentTimer <= 0 || 
           (this.game !== null && !this.game.players.has(this.targetID))){
            this.assignTarget();
            this.targetAssignmentTimer = TARGET_ASSIGNMENT_TIME;
        }
    }

    attackedByPlayer(player: Player): boolean{
        return this.attackers.find((attacker) => attacker.id == player.playerId) !== undefined;
    }
    
    private updateAttackers(delta: number){
        let attackersToRemove: Array<{id: number, timer: number}> = [];
        for(let i = 0; i < this.attackers.length; ++i){
            let attacker = this.attackers[i];
            attacker.timer -= delta;
            if (attacker.timer <= 0.0){
                attackersToRemove.push(attacker);
            }
        }
        
        for (let i = 0; i < attackersToRemove.length; ++i){
            this.removeAttacker(attackersToRemove[i]);
        }
    }
    
    private removeAttacker(attacker: {id: number, timer: number}): void {
        let idx = this.attackers.indexOf(attacker);
        if (idx !== -1) this.attackers.splice(idx, 1);
        this.didAttackersChange = true;
    }
    
    private removeFromGame() {
        if (!this.game) return;
        this.game.removePlayer(this);
        this.emit('removeFromGame');
    }
    
    addAttacker(attacker: Player){
        let checkIndex = this.attackers.findIndex((value) => value.id == attacker.playerId );
        
        if (checkIndex === -1){
            this.attackers.push({ id: attacker.playerId, timer: ATTACKER_TTL});
        } else {
            this.attackers[checkIndex].timer = ATTACKER_TTL;
        }
        
        this.didAttackersChange = true;
    }
    
    removeAttackerPlayer(attacker: Player): void {
        let idx = this.attackers.findIndex((value) => value.id == attacker.playerId);
        if (idx !== -1) this.attackers.splice(idx, 1);
        this.didAttackersChange = true;
    }
    
    takeDamage(amount: number, attacker: Player|undefined): boolean {
        if (this.isDead) { return false; }
        
        if (attacker !== undefined) {
            this.addAttacker(attacker);
        }
        
        this.health -= amount; // todo: clamp here? todo again: check death here
        if (this.health <= 0.0) {
            this.health = 0.0;
            this.respawnTime = RESPAWN_TIME;
            this.isDead = true;
            this.attackers = [];
            this.didAttackersChange = true;
            if (this.isDisconnected) this.removeFromGame();
            return true;
        }
        return false;
    }
    
    assignTarget(){
        let players = this.game !== null ? Array.from(this.game!.players.keys()).map(pid => this.game!.players.get(pid)!) : [];
        players = players.filter(p => p.playerId !== this.playerId);
        players = players.filter(p => !p.isDead);
        players = players.filter(p => !p.isDisconnected);
        
        if (players.length <= 0) { this.targetID = -1; }
        else if (players.length === 1) { this.targetID = players[0].playerId; this.targetRef = players[0];}
        else {
            let workingArray:Array<number> = []
            let sumLogs: number = 0.0
            const min: number = 10;
            for (let i = 0; i < players.length; ++i){
               workingArray[i] = Math.log2(players[i].score + min);
               sumLogs += workingArray[i];
            }
            
            for (let i = 0; i < players.length; ++i){
                workingArray[i] /= sumLogs;
            }
            
            for (let i = 1; i < players.length; ++i){
                workingArray[i] = workingArray[i - 1] + workingArray[i];
            }
            
            let choice: number = Math.random()
            
            let chosenIndex = players.length - 1;
            for (let i = chosenIndex; i >= 0; --i){
                if (choice <= workingArray[i]){
                    chosenIndex = i;
                }
            }

            this.targetID = players[chosenIndex].playerId;
            this.targetRef = players[chosenIndex];
        }
    }
    
    timeUntilNextUpdate = 1 / 10;
    timeUntilFullUpdate = 3;
    networkTick(delta: number) {
        if (!this.game) { throw new Error(`This player is not attached to a game.`); }
        
        this.timeUntilNextUpdate -= delta;
        this.timeUntilFullUpdate -= delta;
        if (this.timeUntilNextUpdate <= 0) {
            this.game.sendPlayerUpdate(this, this.timeUntilFullUpdate <= 0);
            this.timeUntilNextUpdate = 1 / 10;
            if (this.timeUntilFullUpdate <= 0) this.timeUntilFullUpdate = 3;
        }
    }
    
    private previousDetails: PlayerDetailsT;
    getDetails(force: boolean = false): Partial<PlayerDetailsT> | null {
        let currentDetails: PlayerDetailsT = {
            x: this.x,
            y: this.y,
            hspeed: this.hspeed,
            vspeed: this.vspeed,
            color: this.color,
            forward: this.forward,
            accel: this.inputAcceleration,
            health: this.health,
            invulnTime: this.invulnTime,
            isDead: this.isDead,
            respawnTime: this.respawnTime,
            ignoreAuthority: this.forcePlayerUpdate,
            isDisconnected: this.isDisconnected,
            timeUntilRemoval: this.timeUntilRemoval,
            score: this.score,
            targetID: this.targetID,
            displayName: this.displayName,
            attackers: this.attackers
        };
        
        let details = <Partial<PlayerDetailsT>>cloneDeep(currentDetails);
        if (!details.ignoreAuthority) delete details.ignoreAuthority;
        if (!force) {
            if (this.previousDetails) {
                if (!isSignificantlyDifferent(details.x!, this.previousDetails.x)) { delete details.x; }
                if (!isSignificantlyDifferent(details.y!, this.previousDetails.y)) { delete details.y; }
                if (!isSignificantlyDifferent(details.hspeed!, this.previousDetails.hspeed, .1)) { delete details.hspeed; }
                if (!isSignificantlyDifferent(details.vspeed!, this.previousDetails.vspeed, .1)) { delete details.vspeed; }
                if (!isSignificantlyDifferent(details.score!, this.previousDetails.score)) { delete details.score; }
                if (details.targetID === this.previousDetails.targetID) { delete details.targetID; }
                if (details.color === this.previousDetails.color) { delete details.color; }
                if (details.isDead === this.previousDetails.isDead) { delete details.isDead; }
                if (this.previousDetails.forward &&
                    !isSignificantlyDifferent(details.forward!.x, this.previousDetails.forward.x) &&
                    !isSignificantlyDifferent(details.forward!.y, this.previousDetails.forward.y)
                ) {
                    delete details.forward;
                }
                if (this.previousDetails.accel &&
                    !isSignificantlyDifferent(details.accel!.x, this.previousDetails.accel.x) &&
                    !isSignificantlyDifferent(details.accel!.y, this.previousDetails.accel.y)
                ) {
                    delete details.accel;
                }
                if (this.previousDetails.displayName === details.displayName){
                    delete details.displayName;
                }
                if (!this.didAttackersChange){ // TODO: ONLY SEND TO LOCAL PLAYER
                    delete details.attackers;
                }
                if (!isSignificantlyDifferent(details.health!, this.previousDetails.health)) { delete details.health; }
                if (details.invulnTime! <= this.previousDetails.invulnTime && !this.forcePlayerUpdate) { delete details.invulnTime; } // need to force sending of invuln time for player respawn... <= optimization was making it only ever send once, when we want it sent each time the player goes invulnerable
                if (details.respawnTime! <= this.previousDetails.respawnTime && !this.forcePlayerUpdate) { delete details.respawnTime; }
                if (details.isDisconnected === this.previousDetails.isDisconnected) { delete details.isDisconnected; }
                if (!details.isDisconnected || details.timeUntilRemoval! < this.previousDetails.timeUntilRemoval) { delete details.timeUntilRemoval; }
                Object.assign(this.previousDetails, details);
                if (details.isDisconnected) this.previousDetails.timeUntilRemoval = 0;
            }
            else this.previousDetails = currentDetails;
        }
        
        this.forcePlayerUpdate = false; // only force once
        this.didAttackersChange = false; // only force send attackers once

        if (!Object.keys(details).length) { return null; }
        return details;
    }
    /**
     * Strip out any properties or flags from a PlayerDetailsT packet received from the client that owns this player that the server has authority over.
     * For example, clients do not have authority to set their own health, so the health property will be stripped.
     * @param vals The packet received from the client
     */
    sanitizeDetails(vals: Partial<PlayerDetailsT> | null): Partial<PlayerDetailsT> | null {
        if (!vals) return null;
        if (this.ignorePlayerTimer > 0.0) return null;
        delete vals.health;
        delete vals.invulnTime;
        delete vals.isDead;
        delete vals.respawnTime;
        delete vals.ignoreAuthority;
        delete vals.isDisconnected;
        delete vals.timeUntilRemoval;
        delete vals.score;
        delete vals.targetID;
        delete vals.attackers;
        if (!Object.keys(vals).length) return null;
        return vals;
    }
    
    setDetails(vals: Partial<PlayerDetailsT> | null) {
        if (!vals) return;
        if (typeof vals.x !== 'undefined') { this.x = vals.x; }
        if (typeof vals.y !== 'undefined') { this.y = vals.y; }
        if (typeof vals.hspeed !== 'undefined') { this.hspeed = vals.hspeed; }
        if (typeof vals.vspeed !== 'undefined') { this.vspeed = vals.vspeed; }
        if (typeof vals.color !== 'undefined') { this.color = vals.color; }
        if (typeof vals.forward !== 'undefined') { this.forward = vals.forward; }
        if (typeof vals.accel !== 'undefined') { this.inputAcceleration = vals.accel; }
        if (typeof vals.health !== 'undefined') { this.health = vals.health; }
        if (typeof vals.invulnTime !== 'undefined') { this.invulnTime = vals.invulnTime; }
        if (typeof vals.isDead !== 'undefined') { this.isDead = vals.isDead; }
        if (typeof vals.respawnTime !== 'undefined') { this.respawnTime = vals.respawnTime; }
        if (typeof vals.isDisconnected !== 'undefined') { this.isDisconnected = vals.isDisconnected; }
        if (typeof vals.timeUntilRemoval !== 'undefined') { this.timeUntilRemoval = vals.timeUntilRemoval; }
        if (typeof vals.score !== 'undefined') { this.score = vals.score; }
        if (typeof vals.targetID !== 'undefined') { this.targetID = vals.targetID; }
        if (typeof vals.displayName !== 'undefined') { this.displayName = vals.displayName }
        if (typeof vals.attackers !== 'undefined') { this.attackers = vals.attackers }
    }
    
    getCollisionCircle(): CircleT {
        return {x: this.x, y: this.y, r: PLAYER_RADIUS};
    }
}
