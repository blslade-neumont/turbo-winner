import { Player } from "./player";
import { PlayerDetailsT } from "./packet-meta";

export class DummyPlayer extends Player {
    constructor(playerId: number) {
        super("DummyPlayer", playerId);
        this.lastDetails = {x: this.x, y: this.y, hspeed: this.hspeed, vspeed: this.vspeed, forward: this.forward, color: this.color};
        this.target = {x: this.x, y: this.y, hspeed: this.hspeed, vspeed: this.vspeed, forward: this.forward, color: this.color};
    }

    private lastDetails: PlayerDetailsT;
    private target : PlayerDetailsT;
    private lerpTime = 1/10;
    private timer = 0.0;
    private hasSetDetails: boolean = false;
    tick(delta: number): void {
        this.timer += delta;
        let perc: number = this.timer / this.lerpTime;

        if (this.timer < this.lerpTime){
            this.lerpToTarget(perc, delta);
        } else {
            super.tick(delta);
        }
    }

    lerpToTarget(perc: number, delta: number){
        this.updateTarget(delta);

        this.x = this.lerpTo(this.lastDetails.x, this.target.x, perc);
        this.y = this.lerpTo(this.lastDetails.y, this.target.y, perc);

        this.hspeed = this.lerpTo(this.lastDetails.hspeed, this.target.hspeed, perc);
        this.vspeed = this.lerpTo(this.lastDetails.vspeed, this.target.vspeed, perc);

        let fx: number = this.lerpTo(this.lastDetails.forward.x, this.target.forward.x, perc);
        let fy: number = this.lerpTo(this.lastDetails.forward.y, this.target.forward.y, perc);
        let fLen: number = Math.sqrt(fx*fx+fy*fy);
        this.forward = fLen === 0.0 ? {x: 0, y: 0} : {x: fx/fLen, y: fy/fLen};
    }

    updateTarget(delta: number): void {
        // framerate-independent friction
        const friction: number = 3.0;
        let xRatio: number = 1 / (1 + (delta * friction));
        this.target.hspeed *= xRatio;
        this.target.vspeed *= xRatio;
        this.target.x += delta * this.target.hspeed;
        this.target.y += delta * this.target.vspeed;
    }

    lerpTo(from : number, to : number, perc : number): number {
        let t : number = perc < 0.0 ? 0.0 : (perc > 1.0 ? 1.0 : perc);
        return (from * (1-t)) + (to*t);
    }

    setDetails(vals: Partial<PlayerDetailsT> | null): void {
        if (!vals) { return; }
        if (typeof vals.x !== "undefined") { this.target.x = vals.x; this.lastDetails.x = this.x; }
        if (typeof vals.y !== "undefined") { this.target.y = vals.y; this.lastDetails.y = this.y; }
        if (typeof vals.hspeed !== "undefined") { this.target.hspeed = vals.hspeed; this.lastDetails.hspeed = this.hspeed; }
        if (typeof vals.vspeed !== "undefined") { this.target.vspeed = vals.vspeed; this.lastDetails.vspeed = this.vspeed; }
        if (typeof vals.color !== "undefined")  { this.color = vals.color; }
        if (typeof vals.forward !== "undefined") { this.target.forward = vals.forward; this.lastDetails.forward = this.forward; }
        this.timer = 0.0;
        if (!this.hasSetDetails) { this.hasSetDetails = true; this.timer = this.lerpTime; this.lerpToTarget(1, 0); }
    }
}
