import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera} from "engine";

export class CustomCursor extends GameObject{
    private color: string = "purple";
    
    constructor(color: string) {
        super("Player");
        this.color = color;
    }
    
    renderMouseCircle(context : CanvasRenderingContext2D){
        context.beginPath();
        context.arc(0, 0, 16, 0, 2 * Math.PI, false);
        context.strokeStyle = this.color
        context.stroke();
        context.lineWidth = 5;
        context.strokeStyle = this.color;
        context.stroke();
    }
    
    renderMouseCross(context : CanvasRenderingContext2D){
        const lineLength = 24;
        context.beginPath();
        context.moveTo(-24, 0);
        context.lineTo(lineLength, 0);
        context.lineWidth = 5;
        context.strokeStyle = this.color;
        context.stroke();
        context.beginPath();
        context.moveTo(0, -24);
        context.lineTo(0, lineLength);
        context.lineWidth = 5;
        context.strokeStyle = this.color;
        context.stroke();
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        this.renderMouseCircle(context);
        this.renderMouseCross(context);
    }
    
    tick(delta: number){
        super.tick(delta);
        
        // get the screen space mouse coords (potential for refactor later - couldn't find "screen to world" or "world to screen" helpers for camera in engine)
        let mousePosWorld = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        this.x = mousePosWorld[0];
        this.y = mousePosWorld[1];
    }
}
