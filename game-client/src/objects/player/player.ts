import { GameObject, CircleCollisionMask } from "engine";
import { PlayerDetailsT } from "./player-meta";
import { isSignificantlyDifferent } from "../../util/is-significantly-different";
import cloneDeep = require("lodash.clonedeep");

export const PLAYER_ACCELERATION: number = 350.0;
export const PLAYER_FRICTION: number = 3.0;
export const MAX_PLAYER_HEALTH: number = 100;
export const PLAYER_RADIUS: number = 48;
export const INVULN_ON_START: number = 5;
export const RESPAWN_TIME = 10;

export abstract class Player extends GameObject {
    constructor(
        name: string,
        readonly playerId: number,
        renderDepth: number = -10
    ) {
        super(name, { renderDepth: renderDepth });
        this.mask = new CircleCollisionMask(this, PLAYER_RADIUS);
    }

    public color: string;
    public forward = { x: 1, y: 0 };
    public inputAcceleration = { x: 0, y: 0 };
    public health: number = MAX_PLAYER_HEALTH;
    public invulnTime: number = INVULN_ON_START;
    public isDead: boolean = false;
    public respawnTime: number = 0.0;
    private show: boolean = true;
    private alpha: string = "FF";
    
    isInvulnerable(): boolean{
        return this.invulnTime > 0.0;
    }
    
    renderPlayerCircle(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.arc(0, 0, PLAYER_RADIUS, 0, 2 * Math.PI, false);
        context.fillStyle = this.color + this.alpha;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#003300" + this.alpha;
        context.stroke();
    }

    renderPlayerPointer(context: CanvasRenderingContext2D): void {
        const lineLength: number = 64;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength*this.forward.x, lineLength*this.forward.y);
        context.lineWidth = 5;
        context.strokeStyle = "#003300" + this.alpha;
        context.stroke();
    }

    renderPlayerHealth(context: CanvasRenderingContext2D): void {
        const MAX_HB_WIDTH: number = 96;
        const HB_OFFSET: number = -72;
        const HB_HEIGHT: number = 16;
        const HB_STROKE: number = 4;
        const HB_LEFT: number = (MAX_HB_WIDTH / -2);
        const HB_INNER_MAX_WIDTH: number = MAX_HB_WIDTH - HB_STROKE;
        const HB_INNER_HEIGHT: number = HB_HEIGHT - HB_STROKE;

        // gray bar black stroke bg
        context.fillStyle = "gray";
        context.fillRect(HB_LEFT, HB_OFFSET, MAX_HB_WIDTH, HB_HEIGHT);
        context.lineWidth = HB_STROKE;
        context.strokeStyle = "#003300";
        context.strokeRect(HB_LEFT, HB_OFFSET, MAX_HB_WIDTH, HB_HEIGHT);

        let healthPerc: number = (this.health / MAX_PLAYER_HEALTH);
        healthPerc = healthPerc < 0.0 ? 0.0 : (healthPerc > 1.0 ? 1.0 : healthPerc);

        // red bar no stroke
        context.fillStyle = "red";
        context.fillRect(HB_LEFT + HB_STROKE/2, HB_OFFSET + HB_STROKE/2,
                         healthPerc* HB_INNER_MAX_WIDTH, HB_INNER_HEIGHT);
    }
    
    alphaFromState(): void{
        if (this.isDead){
            this.alpha = Math.floor(256.0 * (this.respawnTime / RESPAWN_TIME)).toString(16);
        } else {
            this.alpha = "FF"
        }
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        this.alphaFromState();
        
        if (this.show) {
            this.renderPlayerCircle(context);
            this.renderPlayerPointer(context);
        }
        if (!this.isDead){
            this.renderPlayerHealth(context);
        }
    }

    private previousDetails: PlayerDetailsT = <any>{};
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
            ignoreAuthority: false // server doesn't care about this
        };
        let details: Partial<PlayerDetailsT> = <Partial<PlayerDetailsT>>cloneDeep(currentDetails);
        if (!force) {
            if (this.previousDetails) {
                if (!isSignificantlyDifferent(details.x!, this.previousDetails.x)) { delete details.x; }
                if (!isSignificantlyDifferent(details.y!, this.previousDetails.y)) { delete details.y; }
                if (!isSignificantlyDifferent(details.hspeed!, this.previousDetails.hspeed, .1)) { delete details.hspeed; }
                if (!isSignificantlyDifferent(details.vspeed!, this.previousDetails.vspeed, .1)) { delete details.vspeed; }
                if (details.color === this.previousDetails.color)  { delete details.color; }
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
            }
            this.previousDetails = currentDetails;
        }
        delete details.health; // client don't send health to server.
        delete details.invulnTime; // client don't send invuln time to server
        delete details.isDead; // client don't send dead boolean to server
        delete details.respawnTime; // client don't send respawn timer to server
        delete details.ignoreAuthority; // server doesn't care about this
        
        if (!Object.keys(details).length) { return null; }
        return details;
    }
    sanitizeDetails(vals: Partial<PlayerDetailsT> | null): Partial<PlayerDetailsT> | null {
        return vals;
    }
    setDetails(vals: Partial<PlayerDetailsT> | null): void {
        if (!vals) { return; }
        if (typeof vals.x !== "undefined") { this.x = vals.x; }
        if (typeof vals.y !== "undefined") { this.y = vals.y; }
        if (typeof vals.hspeed !== "undefined") { this.hspeed = vals.hspeed; }
        if (typeof vals.vspeed !== "undefined") { this.vspeed = vals.vspeed; }
        if (typeof vals.color !== "undefined") { this.color = vals.color; }
        if (typeof vals.forward !== "undefined") { this.forward = vals.forward; }
        if (typeof vals.accel !== "undefined") { this.inputAcceleration = vals.accel; }
        if (typeof vals.health !== "undefined") { this.health = vals.health; }
        if (typeof vals.invulnTime !== "undefined") { this.invulnTime = vals.invulnTime; }
        if (typeof vals.isDead !== "undefined") { this.isDead = vals.isDead; }
        if (typeof vals.respawnTime !== "undefined") { this.respawnTime = vals.respawnTime; }
    }

    tick(delta: number): void {
        // adjust the player's velocity according to the inputs specified
        let moveAmount: number = PLAYER_ACCELERATION * delta;
        let movement: {x: number, y: number}  = { x: this.inputAcceleration.x * moveAmount, y: this.inputAcceleration.y * moveAmount };

        this.hspeed += movement.x;
        this.vspeed += movement.y;

        // framerate-independent friction
        let xRatio: number = 1 / (1 + (delta * PLAYER_FRICTION));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;

        super.tick(delta);

        this.invulnTime -= delta;
        this.invulnTime = this.invulnTime < 0.0 ? 0.0 : this.invulnTime;
        this.show = Math.sqrt(this.invulnTime) * 100 % 7 < 2;

        if (this.isDead){
            this.respawnTime -= delta;
            this.respawnTime = Math.max(this.respawnTime, 0.0);
            this.respawnTime = Math.min(this.respawnTime, RESPAWN_TIME);
        }
    }
}
