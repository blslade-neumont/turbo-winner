import { GameObject, CircleCollisionMask, clamp } from 'engine';
import { PlayerDetailsT } from './player-meta';
import { isSignificantlyDifferent } from '../../util/is-significantly-different';
import { HealthBar, ScoreDisplay, ScorePopup, NameTag } from './decorators';
import cloneDeep = require('lodash.clonedeep');

export const PLAYER_ACCELERATION: number = 5;
export const PLAYER_FRICTION: number = 3.0;
export const MAX_PLAYER_HEALTH: number = 100;
export const PLAYER_RADIUS: number = 0.5;
export const INVULN_ON_START: number = 5;
export const RESPAWN_TIME = 10;
export const PLAYER_REMOVAL_TIME = 10;
export const SCORE_LERP_TIME = 2.0;

export abstract class Player extends GameObject {
    constructor(
        name: string,
        readonly playerId: number,
        renderDepth: number = -10
    ) {
        super(name, { renderDepth: renderDepth });
        this.mask = new CircleCollisionMask(this, PLAYER_RADIUS);
    }
    
    public score: number = 0;
    public targetScore: number = 0;
    public color: string;
    public displayName: string;
    public forward = { x: 1, y: 0 };
    public inputAcceleration = { x: 0, y: 0 };
    public health: number = MAX_PLAYER_HEALTH;
    public invulnTime: number = INVULN_ON_START;
    public isDead: boolean = false;
    public respawnTime: number = 0.0;
    
    public isDisconnected = false;
    public timeUntilRemoval = 0;
    
    public targetID = -1;
    public attackers: Array<{id: number, timer: number}> = []

    private healthBar: HealthBar = new HealthBar(this);
    private scoreDisplay: ScoreDisplay = new ScoreDisplay(this);
    private nameTag: NameTag = new NameTag(this);
    private scoreLerpTime: number = 0.0;
    private lastScore: number = 0;
    private scoreLerping: boolean = false;
    protected accelerationMultiplier = 1.0;
    
    onAddToScene() {
        super.onAddToScene();
        this.scene.addObject(this.healthBar);
        this.scene.addObject(this.scoreDisplay);
        this.scene.addObject(this.nameTag);
    }
    
    onRemoveFromScene() {
        super.onRemoveFromScene();
        this.healthBar.scene.removeObject(this.healthBar);
        this.scoreDisplay.scene.removeObject(this.scoreDisplay);
        this.nameTag.scene.removeObject(this.nameTag);
    }
    
    isInvulnerable(): boolean {
        return this.invulnTime > 0.0;
    }
    
    renderPlayerCircle(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.arc(0, 0, PLAYER_RADIUS, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5/this.scene!.camera!.zoomScale;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    renderPlayerPointer(context: CanvasRenderingContext2D): void {
        const lineLength: number = 64/this.scene!.camera!.zoomScale;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength*this.forward.x, lineLength*this.forward.y);
        context.lineWidth = 5/this.scene!.camera!.zoomScale;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    renderDisconnectAnimation(context: CanvasRenderingContext2D): void {
        let removalPercent = clamp((PLAYER_REMOVAL_TIME - this.timeUntilRemoval) / PLAYER_REMOVAL_TIME, 0, 1);
        if (!removalPercent) return;
        let popupPercent = clamp((PLAYER_REMOVAL_TIME - this.timeUntilRemoval) * 3, 0, 1);
        
        context.save();
        try {
            context.scale(PLAYER_RADIUS, PLAYER_RADIUS);
            context.translate(1.5, -1);
            context.scale(.25, .25);
            let popupScale = Math.sqrt(popupPercent);
            context.scale(popupPercent, popupPercent);
            
            context.strokeStyle = 'black';
            context.fillStyle = 'white';
            context.lineWidth = 24 / this.scene!.camera!.zoomScale;
            
            context.beginPath();
            context.ellipse(.4, 0, 2.5, 2.5, -.5 * Math.PI, 0, 2 * Math.PI);
            context.fill();
            
            context.beginPath();
            context.ellipse(.4, 0, 2.5, 2.5, -.5 * Math.PI, 0, 2 * Math.PI * removalPercent);
            context.stroke();
            
            context.fillRect(-.5, -1, 1, 2);
            context.strokeRect(-.5, -1, 1, 2);
            
            context.fillStyle = 'black';
            context.beginPath();
            context.moveTo(.5, -1);
            context.lineTo(1.2, -1.3);
            context.lineTo(1.2, 1.3);
            context.lineTo(.5, 1);
            context.closePath();
            context.fill();
            context.stroke();
        }
        finally {
            context.restore();
        }
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
            if (this.isDisconnected) this.renderDisconnectAnimation(context);
        }
        finally {
            context.globalAlpha = prevGlobalAlpha;
        }
    }
    
    attackedByPlayer(player: Player): boolean{
        return this.attackers.find((attacker) => attacker.id == player.playerId) !== undefined;
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
            ignoreAuthority: false,
            isDisconnected: this.isDisconnected,
            timeUntilRemoval: this.timeUntilRemoval,
            score: this.score,
            targetID: this.targetID,
            displayName: this.displayName,
            attackers: this.attackers,
            accelerationMultiplier: this.accelerationMultiplier
        };
        
        let details: Partial<PlayerDetailsT> = <Partial<PlayerDetailsT>>cloneDeep(currentDetails);
        // client doesn't have authority to update any of these fields or set these flags
        delete details.health;
        delete details.invulnTime;
        delete details.isDead;
        delete details.respawnTime;
        delete details.ignoreAuthority;
        delete details.isDisconnected;
        delete details.timeUntilRemoval;
        delete details.score;
        delete details.targetID;
        delete details.attackers;
        
        if (!force) {
            if (this.previousDetails) {
                if (!isSignificantlyDifferent(details.x!, this.previousDetails.x)) { delete details.x; }
                if (!isSignificantlyDifferent(details.y!, this.previousDetails.y)) { delete details.y; }
                if (!isSignificantlyDifferent(details.hspeed!, this.previousDetails.hspeed, .1)) { delete details.hspeed; }
                if (!isSignificantlyDifferent(details.vspeed!, this.previousDetails.vspeed, .1)) { delete details.vspeed; }
                if (!isSignificantlyDifferent(details.accelerationMultiplier!, this.previousDetails.accelerationMultiplier)) { delete details.accelerationMultiplier; }
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
                if(this.previousDetails.displayName === details.displayName){
                    delete details.displayName;
                }
                Object.assign(this.previousDetails, details);
            }
            else this.previousDetails = currentDetails;
        }
        
        if (!Object.keys(details).length) { return null; }
        return details;
    }
    /**
     * Strip out any properties or flags from a PlayerDetailsT packet received from the server that this player has authority over.
     * For example, the LocalPlayer will strip position and speed updates, because the LocalPlayer has authority over it.
     * @param vals The packet received from the server
     */
    abstract sanitizeDetails(vals: Partial<PlayerDetailsT> | null): Partial<PlayerDetailsT> | null;
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
        if (typeof vals.isDisconnected !== 'undefined') { this.isDisconnected = vals.isDisconnected; }
        if (typeof vals.timeUntilRemoval !== 'undefined') { this.timeUntilRemoval = vals.timeUntilRemoval; }
        if (typeof vals.score !== 'undefined') { this.targetScore = vals.score; this.scoreLerpTime = SCORE_LERP_TIME; this.lastScore = this.score; this.scoreLerping = true; }
        if (typeof vals.targetID !== 'undefined') { this.targetID = vals.targetID; }
        if (typeof vals.displayName !== 'undefined') { this.displayName = vals.displayName; }
        if (typeof vals.attackers !== 'undefined') { this.attackers = vals.attackers; }
        if (typeof vals.accelerationMultiplier !== 'undefined') { this.accelerationMultiplier = vals.accelerationMultiplier; }
    }
    
    lerpScore(delta: number){
        this.scoreLerpTime -= delta;
        if (this.scoreLerpTime <= 0.0){
            this.scoreLerping = false;
            this.scoreLerpTime = 0.0;
        }
        if (this.score !== this.targetScore){
            let t: number = this.scoreLerpTime / SCORE_LERP_TIME;
            this.score = Math.floor(t*this.lastScore + (1.0-t)*this.targetScore);
        }
    }
    
    tick(delta: number): void {
        // adjust the player's velocity according to the inputs specified
        let moveAmount: number = PLAYER_ACCELERATION * delta * this.accelerationMultiplier;
        let movement: {x: number, y: number}  = { x: this.inputAcceleration.x * moveAmount, y: this.inputAcceleration.y * moveAmount };
        
        this.hspeed += movement.x;
        this.vspeed += movement.y;
        
        // framerate-independent friction
        let xRatio: number = 1 / (1 + (delta * PLAYER_FRICTION));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;
        
        super.tick(delta);
        
        this.invulnTime = Math.max(this.invulnTime - delta, 0.0);
        this.lerpScore(delta);
                
        if (this.isDead) {
            this.respawnTime = clamp(this.respawnTime - delta, 0, RESPAWN_TIME);
        }
        
        if (this.isDisconnected) {
            this.timeUntilRemoval = clamp(this.timeUntilRemoval - delta, 0, PLAYER_REMOVAL_TIME);
        }
    }
}
