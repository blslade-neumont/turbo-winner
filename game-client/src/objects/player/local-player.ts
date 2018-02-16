import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera, MouseButton, pointDirection, GameScene } from "engine";
import { Player } from './player';
import { TurboWinnerGame } from '../../turbo-winner-game';
import { Bullet } from '../bullet/bullet';

const DEFAULT_MAX_FIRE_COOLDOWN = 1/4;

export class LocalPlayer extends Player {
    constructor(playerId: number) {
        super("LocalPlayer", playerId);
    }
    
    private ignoreMouseDown = false;
    addToScene(scene: GameScene) {
        super.addToScene(scene);
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
        const acceleration = 350.0;
        
        // get the screen space mouse coords (potential for refactor later - couldn't find "screen to world" or "world to screen" helpers for camera in engine)
        let mousePosWorld = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        
        // calculate normalized forward vector from mouse and player locations
        let toMouse = {x: mousePosWorld[0] - this.x, y: mousePosWorld[1] - this.y};
        let toMouseLen = Math.sqrt(toMouse.x*toMouse.x + toMouse.y*toMouse.y);
        this.forward = {x: toMouse.x / toMouseLen, y: toMouse.y / toMouseLen};
        
        // get forward-relative movement inputs, and normalize them to ensure pressing multiple keys does not increase player move speed
        let keyboard = this.game.eventQueue;
        let input = {x: 0, y: 0};
        
        if (keyboard.isKeyDown("KeyW")){ input = {x: input.x, y: input.y - 1}; }
        if (keyboard.isKeyDown("KeyA")){ input = {x: input.x - 1, y: input.y}; }
        if (keyboard.isKeyDown("KeyS")){ input = {x: input.x, y: input.y + 1}; }
        if (keyboard.isKeyDown("KeyD")){ input = {x: input.x + 1, y: input.y}; }
        
        let inputLen = Math.sqrt(input.x*input.x + input.y*input.y);
        let inputNormalized = inputLen == 0 ? input : {x: input.x/inputLen, y: input.y/inputLen};
        
        // adjust the player's velocity according to the inputs specified
        let moveAmount = acceleration * delta;
        let movement = {x: inputNormalized.x * moveAmount, y:inputNormalized.y * moveAmount};
        
        this.hspeed += movement.x;
        this.vspeed += movement.y;
        
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
