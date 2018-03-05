import { GameObject, DefaultGraphicsAdapter, GameEvent, Camera, MouseButton, pointDirection, GameScene, pointDistance2 } from "engine";
import { Player } from "./player";
import { TurboWinnerGame } from "../../turbo-winner-game";
import { Bullet } from "../bullet/bullet";
import { PlayerDetailsT } from "./player-meta";
import { PlayScene } from "../..";
import { TargetPointer } from "./target-pointer";
import { TakeDamageIndicator } from "./take-damage-indicator";
import { ScorePopup } from "./score-popup";

const DEFAULT_MAX_FIRE_COOLDOWN = 1/4;

export class LocalPlayer extends Player {
    constructor(playerId: number) {
        super("LocalPlayer", playerId, -20);
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    get networkManager() {
        return (<PlayScene>this.scene).networkManager;
    }
    
    private targetPointer: TargetPointer = new TargetPointer(this);
    private damageIndicator: TakeDamageIndicator = new TakeDamageIndicator(this);
    private scorePopup: ScorePopup = new ScorePopup(this);

    private ignoreMouseDown = false;
    onAddToScene(): void {
        super.onAddToScene();
        // if the mouse is down when the local player is created, then we should ignore it until the player releases it
        // otherwise the player is "trigger-happy" when they first click the button to join the game
        this.ignoreMouseDown = this.events.isMouseButtonDown(MouseButton.Left);
        this.scene.addObject(this.targetPointer);
        this.scene.addObject(this.damageIndicator);
        this.scene.addObject(this.scorePopup);

    }
    onRemoveFromScene(): void {
        super.onRemoveFromScene();
        this.targetPointer.scene.removeObject(this.targetPointer);
        this.damageIndicator.scene.removeObject(this.damageIndicator);
        this.scorePopup.scene.removeObject(this.scorePopup);
    }
    
    get canMove() {
        if (this.isDead) return false;
        if (!this.networkManager.isConnected) return false;
        return true;
    }
    
    private fireCooldown = 0;
    private timeUntilNextUpdate = 1 / 10;
    private timeUntilFullUpdate = 3;
    tick(delta: number) {
        // get the screen space mouse coords (potential for refactor later - couldn't find "screen to world" or "world to screen" helpers for camera in engine)
        let mousePosWorld = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        
        // calculate normalized forward vector from mouse and player locations
        let toMouse = {x: mousePosWorld[0] - this.x, y: mousePosWorld[1] - this.y};
        let toMouseLen = Math.sqrt(toMouse.x*toMouse.x + toMouse.y*toMouse.y);
        if (this.canMove) {this.forward = {x: toMouse.x / toMouseLen, y: toMouse.y / toMouseLen};}
        
        // get forward-relative movement inputs, and normalize them to ensure pressing multiple keys does not increase player move speed
        let input = {x: 0, y: 0};
        
        if (this.canMove) {
            if (this.events.isAbstractButtonDown("move-up")) { --input.y; }
            if (this.events.isAbstractButtonDown("move-left")) { --input.x; }
            if (this.events.isAbstractButtonDown("move-down")) { ++input.y; }
            if (this.events.isAbstractButtonDown("move-right")) { ++input.x; }    
        }
        
        let inputLen2 = pointDistance2(0, 0, input.x, input.y);
        if (inputLen2 <= 1) { this.inputAcceleration = input; }
        else {
            let inputLen = Math.sqrt(inputLen2);
            this.inputAcceleration = { x: input.x / inputLen, y: input.y / inputLen };
        }
        
        super.tick(delta);
        
        this.timeUntilNextUpdate -= delta;
        this.timeUntilFullUpdate -= delta;
        if (this.timeUntilNextUpdate <= 0) {
            let detailsPacket = this.getDetails(this.timeUntilFullUpdate <= 0);
            if (!!detailsPacket) { this.io.emit("update-player", this.playerId, detailsPacket); }
            this.timeUntilNextUpdate = 1 / 10;
            if (this.timeUntilFullUpdate <= 0) { this.timeUntilFullUpdate = 3; }
        }
        
        this.fireBulletTick(delta);
    }
    
    fireBulletTick(delta : number) {
        if (this.events.isMouseButtonDown(MouseButton.Left)) {
            if (this.ignoreMouseDown) { return false; }
            if (this.fireCooldown <= 0 && !this.isInvulnerable() && this.canMove) {
                let bullet: Bullet = new Bullet({
                    x: this.x,
                    y: this.y,
                    direction: pointDirection(0, 0, this.forward.x, this.forward.y),
                    ignorePlayerId: this.playerId
                });
                (<PlayScene>this.scene).localFireBullet(bullet);
                this.io.emit("fire-bullet", bullet.getDetails());
                this.fireCooldown = DEFAULT_MAX_FIRE_COOLDOWN;
            }
        } else { this.ignoreMouseDown = false; }
        // subtract from fire rate timer
        this.fireCooldown -= delta;
    }
    
    renderRespawnTimer(context: CanvasRenderingContext2D): void {
        context.save();
        try{
            context.translate(0, 150 / this.scene!.camera!.zoomScale);
            context.scale(1 / this.scene!.camera!.zoomScale, 1 / this.scene!.camera!.zoomScale);
            context.font = "72px Arial";
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText("Respawning in: " + this.respawnTime.toFixed(1), 0.0, 0.0);
        }finally{
            context.restore();
        }

    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void{
        super.renderImplContext2d(context);
        if (this.isDead) {this.renderRespawnTimer(context);}
    }
    
    sanitizeDetails(vals: Partial<PlayerDetailsT> | null): Partial<PlayerDetailsT> | null {
        if (!vals) return null;
        if (vals.ignoreAuthority) return vals;
        
        let newVals = <Partial<PlayerDetailsT>>{};
        if (typeof vals.color !== "undefined") { newVals.color = vals.color; }
        if (typeof vals.health !== "undefined") { newVals.health = vals.health; }
        if (typeof vals.isDead !== "undefined") { newVals.isDead = vals.isDead; }
        if (typeof vals.invulnTime !== "undefined") { newVals.invulnTime = vals.invulnTime; }
        if (typeof vals.respawnTime !== "undefined") { newVals.respawnTime = vals.respawnTime; }
        if (typeof vals.isDisconnected !== "undefined") { newVals.isDisconnected = vals.isDisconnected; }
        if (typeof vals.timeUntilRemoval !== "undefined") { newVals.timeUntilRemoval = vals.timeUntilRemoval; }
        if (typeof vals.score !== "undefined") { newVals.score = vals.score; this.scorePopup.beginAnimation(vals.score - this.score); }
        if (typeof vals.targetID !== "undefined") { newVals.targetID = vals.targetID; }
        
        if (!Object.keys(newVals).length) return null;
        return newVals;
    }
}
