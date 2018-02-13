import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera} from "engine";

export class Player extends GameObject{
    private color: string = "purple";
    private forward: {x: number, y: number};

    constructor(color: string){
        super("Player");
        this.color = color;
    }

    renderPlayerCircle(context : CanvasRenderingContext2D){
        context.beginPath();
        context.arc(0, 0, 48, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }

    renderPlayerPointer(context : CanvasRenderingContext2D){
        const lineLength = 64;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength*this.forward.x, lineLength*this.forward.y);
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            this.renderPlayerCircle(context);
            this.renderPlayerPointer(context);
        }
    }

    tick(delta: number){
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
        let input = {x: 0, y: 0}
        if (keyboard.isKeyDown("KeyW")){ input = {x: input.x + this.forward.x, y: input.y + this.forward.y}; }
        if (keyboard.isKeyDown("KeyA")){ input = {x: input.x + this.forward.y, y: input.y - this.forward.x}; }
        if (keyboard.isKeyDown("KeyS")){ input = {x: input.x - this.forward.x, y: input.y - this.forward.y}; }
        if (keyboard.isKeyDown("KeyD")){ input = {x: input.x - this.forward.y, y: input.y + this.forward.x}; }

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
    }
}