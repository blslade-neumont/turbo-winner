import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera } from "engine";
import { Player } from './player';
import { TurboWinnerGame } from "../../turbo-winner-game";

export class LocalPlayer extends Player {
    constructor(
        playerId: number,
        color: string,
        x: number,
        y: number
    ) {
        super("LocalPlayer", playerId, color, x, y);
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    private timeUntilNextUpdate = 1 / 10;
    tick(delta: number) {
        super.tick(delta);
        
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
        
        // framerate-independent friction
        const friction = 3.0;
        let xRatio = 1 / (1 + (delta * friction));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;
        
        this.timeUntilNextUpdate -= delta;
        if (this.timeUntilNextUpdate <= 0) {
            this.io.emit('update-player', this.playerId, this.getDetails());
            this.timeUntilNextUpdate = 1 / 10;
        }
    }
}