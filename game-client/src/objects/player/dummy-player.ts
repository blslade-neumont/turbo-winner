import { Player, RESPAWN_TIME, PLAYER_ACCELERATION } from './player';
import { PlayerDetailsT } from './player-meta';
import { lerp } from '../../util/lerp';
import cloneDeep = require('lodash.clonedeep');

type LerpPlayerDetails = {
    x: number,
    y: number,
    forward: { x: number, y: number }
};

export class DummyPlayer extends Player {
    constructor(playerId: number) {
        super("DummyPlayer", playerId);
        this.lastDetails = { x: this.x, y: this.y, forward: this.forward };
        this.target = { x: this.x, y: this.y, forward: this.forward };
    }
    
    private lastDetails: LerpPlayerDetails;
    private target : LerpPlayerDetails;
    private lerpTime = 1/10;
    private timer = 0.0;
    private hasSetDetails: boolean = false;
    tick(delta: number): void {
        this.timer += delta;
        let perc: number = this.timer / this.lerpTime;
        if (this.timer < this.lerpTime){
            this.lerpToTarget(perc, delta);
            this.invulnTime -= delta;
            this.lerpScore();
            if (this.isDead){
                this.respawnTime -= delta;
                this.respawnTime = Math.max(this.respawnTime, 0.0);
                this.respawnTime = Math.min(this.respawnTime, RESPAWN_TIME);
            }
        } else {
            super.tick(delta);
        }
    }
    
    lerpToTarget(perc: number, delta: number){
        this.updateTarget(delta);
        this.x = lerp(this.lastDetails.x, this.target.x, perc);
        this.y = lerp(this.lastDetails.y, this.target.y, perc);
        
        let fx: number = lerp(this.lastDetails.forward.x, this.target.forward.x, perc);
        let fy: number = lerp(this.lastDetails.forward.y, this.target.forward.y, perc);
        let fLen: number = Math.sqrt(fx*fx+fy*fy);
        this.forward = fLen === 0.0 ? {x: 0, y: 0} : {x: fx/fLen, y: fy/fLen};
    }
    
    updateTarget(delta: number): void {
        // adjust the player's velocity according to the inputs specified
        let moveAmount = PLAYER_ACCELERATION * delta;
        let movement = { x: this.inputAcceleration.x * moveAmount, y: this.inputAcceleration.y * moveAmount };
        
        this.hspeed += movement.x;
        this.vspeed += movement.y;
        
        // framerate-independent friction
        const friction: number = 3.0;
        let xRatio: number = 1 / (1 + (delta * friction));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;
        
        this.target.x += delta * this.hspeed;
        this.target.y += delta * this.vspeed;
    }
    
    sanitizeDetails(vals: Partial<PlayerDetailsT> | null): Partial<PlayerDetailsT> | null {
        return vals;
    }
    setDetails(vals: PlayerDetailsT | null): void {
        if (!vals) { return; }
        
        // lerp properties
        if (typeof vals.x !== "undefined") { this.target.x = vals.x; this.lastDetails.x = this.x; }
        if (typeof vals.y !== "undefined") { this.target.y = vals.y; this.lastDetails.y = this.y; }
        if (typeof vals.forward !== "undefined") { this.target.forward = vals.forward; this.lastDetails.forward = this.forward; }
        
        // the rest we keep as-is
        let nolerpVals = cloneDeep(vals);
        delete nolerpVals.x;
        delete nolerpVals.y;
        delete nolerpVals.forward;
        super.setDetails(nolerpVals);
        
        this.timer = 0.0;
        if (!this.hasSetDetails || vals.ignoreAuthority) {
            this.hasSetDetails = true;
            this.timer = this.lerpTime;
            Object.assign(this.lastDetails, vals);
            this.lerpToTarget(1, 0);
        }
    }
}
