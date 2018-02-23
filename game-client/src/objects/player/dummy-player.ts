import { Player, RESPAWN_TIME, PLAYER_ACCELERATION } from "./player";
import { PlayerDetailsT } from "./player-meta";

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
        console.log("x: " + this.lastDetails.x + ", y: " + this.lastDetails.y);
        if (this.timer < this.lerpTime){
            this.lerpToTarget(perc, delta);
            this.invulnTime -= delta;
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
        this.x = this.lerpTo(this.lastDetails.x, this.target.x, perc);
        this.y = this.lerpTo(this.lastDetails.y, this.target.y, perc);
        
        let fx: number = this.lerpTo(this.lastDetails.forward.x, this.target.forward.x, perc);
        let fy: number = this.lerpTo(this.lastDetails.forward.y, this.target.forward.y, perc);
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
    
    lerpTo(from : number, to : number, perc : number): number {
        let t : number = perc < 0.0 ? 0.0 : (perc > 1.0 ? 1.0 : perc);
        return (from * (1-t)) + (to*t);
    }
    
    setDetails(vals: PlayerDetailsT | null): void {
        if (!vals) { return; }
        
        // lerp properties
        if (typeof vals.x !== "undefined") { this.target.x = vals.x; this.lastDetails.x = this.x; }
        if (typeof vals.y !== "undefined") { this.target.y = vals.y; this.lastDetails.y = this.y; }
        if (typeof vals.forward !== "undefined") { this.target.forward = vals.forward; this.lastDetails.forward = this.forward; }
        
        // the rest we keep as-is
        if (typeof vals.hspeed !== "undefined") { this.hspeed = vals.hspeed; }
        if (typeof vals.vspeed !== "undefined") { this.vspeed = vals.vspeed; }
        if (typeof vals.color !== "undefined")  { this.color = vals.color; }
        if (typeof vals.accel !== "undefined")  { this.inputAcceleration = vals.accel; }
        
        if (typeof vals.health !== "undefined") { this.health = vals.health; }
        if (typeof vals.invulnTime !== "undefined") { this.invulnTime = vals.invulnTime; }
        
        if (typeof vals.isDead !== "undefined") { this.isDead = vals.isDead; }
        if (typeof vals.respawnTime !== "undefined") { this.respawnTime = vals.respawnTime; }

        this.timer = 0.0;
        if (!this.hasSetDetails || vals.ignoreAuthority) {
            this.hasSetDetails = true;
            this.timer = this.lerpTime;
            this.lerpToTarget(1, 0);
            this.forceLastDetails(vals); // fix for teleport bug
        }
    }
    
    forceLastDetails(vals: PlayerDetailsT | null): void{
        if (!vals) {return;}
        if (typeof vals.x !== "undefined") { this.lastDetails.x = vals.x; }
        if (typeof vals.y !== "undefined") { this.lastDetails.y = vals.y; }
        if (typeof vals.forward !== "undefined") { this.lastDetails.forward = vals.forward; }
    }
}
