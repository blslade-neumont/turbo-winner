import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter } from "engine";

export class Tile extends GameObject{
    constructor(){
        super("Tile", { renderDepth: 100 });
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        context.fillStyle = "orange";
        context.fillRect(0, 0, (1/3), (1/3));
    }
}
