import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera, MouseButton, pointDirection, GameScene, pointDistance2 } from "engine";
import { Player } from './player';
import { TurboWinnerGame } from '../../turbo-winner-game';
import { Bullet } from '../bullet/bullet';

const DEFAULT_MAX_FIRE_COOLDOWN = 1/4;

export class LocalPlayer extends Player {
    constructor(playerId: number) {
        super("LocalPlayer", playerId, -20);
    }
    
    private ignoreMouseDown = false;
    onAddToScene() {
        super.onAddToScene();
        //If the mouse is down when the local player is created, then we should ignore it until the player releases it
        //Otherwise the player is "trigger-happy" when they first click the button to join the game
        this.ignoreMouseDown = this.events.isMouseButtonDown(MouseButton.Left);
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
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
        this.forward = {x: toMouse.x / toMouseLen, y: toMouse.y / toMouseLen};
        
        // get forward-relative movement inputs, and normalize them to ensure pressing multiple keys does not increase player move speed
        let input = {x: 0, y: 0};
        
        if (this.events.isKeyDown("KeyW")) --input.y;
        if (this.events.isKeyDown("KeyA")) --input.x;
        if (this.events.isKeyDown("KeyS")) ++input.y;
        if (this.events.isKeyDown("KeyD")) ++input.x;
        
        let inputLen2 = pointDistance2(0, 0, input.x, input.y);
        if (inputLen2 <= 1) this.inputAcceleration = input;
        else {
            let inputLen = Math.sqrt(inputLen2);
            this.inputAcceleration = { x: input.x / inputLen, y: input.y / inputLen };
        }
        
        super.tick(delta);
        
        this.timeUntilNextUpdate -= delta;
        this.timeUntilFullUpdate -= delta;
        if (this.timeUntilNextUpdate <= 0) {
            let detailsPacket = this.getDetails(this.timeUntilFullUpdate <= 0);
            if (!!detailsPacket) this.io.emit('update-player', this.playerId, detailsPacket);
            this.timeUntilNextUpdate = 1 / 10;
            if (this.timeUntilFullUpdate <= 0) this.timeUntilFullUpdate = 3;
        }
        
        this.fireBulletTick(delta);
    }
    
    fireBulletTick(delta : number) {
        if (this.events.isMouseButtonDown(MouseButton.Left)) {
            if (this.ignoreMouseDown) return false;
            if (this.fireCooldown <= 0) {
                let bullet = new Bullet({
                    x: this.x,
                    y: this.y,
                    direction: pointDirection(0, 0, this.forward.x, this.forward.y),
                    ignorePlayerId: this.playerId
                });
                this.scene.addObject(bullet);
                this.io.emit('fire-bullet', bullet.getDetails());
                this.fireCooldown = DEFAULT_MAX_FIRE_COOLDOWN;
            }
        }
        else this.ignoreMouseDown = false;
        // Subtract from fire rate timer
        this.fireCooldown -= delta;
    }
}
