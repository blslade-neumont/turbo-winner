import { PlayerDetailsT } from './packet-meta';
import cloneDeep = require('lodash.clonedeep');
import { Game } from './game';
import { isSignificantlyDifferent } from '../util/is-significantly-different';
import { CircleT } from '../util/circle';

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

export class Player {
    constructor(
        readonly playerId: number,
        readonly socket: Socket
    ) { }
    
    public game: Game | null;
    
    x = 0;
    y = 0;
    hspeed = 0;
    vspeed = 0;
    forward = { x: 1, y: 0 };
    inputAcceleration = { x: 0, y: 0 };
    color = chooseRandomColor();
    health = MAX_PLAYER_HEALTH;
    
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
    }
    
    takeDamage(amount: number): void{
        this.health -= amount; // todo: clamp here? todo again: check death here
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
            health: this.health
        };
        let details = <Partial<PlayerDetailsT>>cloneDeep(currentDetails);
        if (!force) {
            if (this.previousDetails) {
                if (!isSignificantlyDifferent(details.x!, this.previousDetails.x)) { delete details.x; }
                if (!isSignificantlyDifferent(details.y!, this.previousDetails.y)) { delete details.y; }
                if (!isSignificantlyDifferent(details.hspeed!, this.previousDetails.hspeed, .1)) { delete details.hspeed; }
                if (!isSignificantlyDifferent(details.vspeed!, this.previousDetails.vspeed, .1)) { delete details.vspeed; }
                if (details.color === this.previousDetails.color) { delete details.color; }
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
                if (!isSignificantlyDifferent(details.health!, this.previousDetails.health)){
                    delete details.health;
                }
            }
            this.previousDetails = currentDetails;
        }
        if (!Object.keys(details).length) { return null; }
        return details;
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
    }
    
    getCollisionCircle(): CircleT {
        return {x: this.x, y: this.y, r: PLAYER_RADIUS};
    }
}
