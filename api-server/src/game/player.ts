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

export const PLAYER_ACCELERATION: number = 350.0;
export const PLAYER_FRICTION: number = 3.0;
export const MAX_PLAYER_HEALTH: number = 100;
export const PLAYER_RADIUS = 48;
export const INVULN_ON_START = 5;
export const RESPAWN_TIME = 10;
export const PLAYER_REMOVAL_TIME = 10;

export class Player extends EventEmitter {
    constructor(
        readonly playerId: number,
        readonly socket: Socket
    ) {
        super();
    }
    
    public game: Game | null;
    
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
    
    isInvulnerable(): boolean{
        return this.invulnTime > 0.0;
    }
    
    randomizePosition() {
        let minDist = 10;
        let maxDist = 1000;
        let radius = Math.floor(Math.random() * 1000) + 10;
        let theta = Math.floor(Math.random() * (Math.PI * 2)) + 0;
        
        this.x = Math.cos(theta) * radius;
        this.y = Math.sin(theta) * radius;
    }
    
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
        
        if (this.isDisconnected) {
            this.timeUntilRemoval -= delta;
            if (this.timeUntilRemoval <= 0) this.removeFromGame();
        }
    }
    
    private removeFromGame() {
        if (!this.game) return;
        this.game.removePlayer(this);
        this.emit('removeFromGame');
    }
    
    takeDamage(amount: number): boolean {
        if (this.isDead) { return false; }
        this.health -= amount; // todo: clamp here? todo again: check death here
        if (this.health <= 0.0) {
            this.health = 0.0;
            this.respawnTime = RESPAWN_TIME;
            this.isDead = true;
            if (this.isDisconnected) this.removeFromGame();
            return true;
        }
        return false;
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
            score: this.score
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
    }
    
    getCollisionCircle(): CircleT {
        return {x: this.x, y: this.y, r: PLAYER_RADIUS};
    }
}
