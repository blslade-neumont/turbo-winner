import { GameObject, CircleCollisionMask } from "engine";
import { PlayerDetailsT } from "./player-meta";
import { isSignificantlyDifferent } from "../../util/is-significantly-different";
import cloneDeep = require("lodash.clonedeep");
import { HealthBar } from "./health-bar";

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
    private healthBar: HealthBar;
    
    onAddToScene(){
        super.onAddToScene();
        this.healthBar = new HealthBar(this);
        this.scene.addObject(this.healthBar);
    }
    
    onRemoveFromScene(){
        this.healthBar.scene.removeObject(this.healthBar);
    }
    
    isInvulnerable(): boolean{
        return this.invulnTime > 0.0;
    }
    
    renderPlayerCircle(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.arc(0, 0, PLAYER_RADIUS, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }

    renderPlayerPointer(context: CanvasRenderingContext2D): void {
        const lineLength: number = 64;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength*this.forward.x, lineLength*this.forward.y);
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    getRenderAlpha(): number {
        let showPercent = 1;
        if (this.invulnTime > 0) showPercent = Math.abs((((Math.sqrt(this.invulnTime) * 100) % 7) / 3.5) - 1);
        return this.isDead ? (this.respawnTime / RESPAWN_TIME) : showPercent;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        let alpha = this.getRenderAlpha();
        if (!alpha) return;
        
        let prevGlobalAlpha = context.globalAlpha;
        try {
            context.globalAlpha *= alpha;
            
            this.renderPlayerCircle(context);
            this.renderPlayerPointer(context);
        }
        finally {
            context.globalAlpha = prevGlobalAlpha;
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
        // client doesn't have authority to update any of these fields or set these flags
        delete details.health;
        delete details.invulnTime;
        delete details.isDead;
        delete details.respawnTime;
        delete details.ignoreAuthority;
        
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
        
        if (!Object.keys(details).length) { return null; }
        return details;
    }
    /**
     * Strip out any properties or flags from a PlayerDetailsT packet received from the server that this player has authority over.
     * For example, the LocalPlayer will strip position and speed updates, because the LocalPlayer has authority over it.
     * @param vals The packet received from the server
     */
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
        
        if (this.isDead){
            this.respawnTime -= delta;
            this.respawnTime = Math.max(this.respawnTime, 0.0);
            this.respawnTime = Math.min(this.respawnTime, RESPAWN_TIME);
        }
    }
}
