import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, CircleCollisionMask } from "engine";

export type BlockDetailsT = {
    x: number,
    y: number,
    radius: number
};

export class Block extends GameObject {
    constructor(details: BlockDetailsT) {
        super("Block", {renderDepth: 100});
        this.x = details.x;
        this.y = details.y;
        this.coverRadius = details.radius;
        this.mask = new CircleCollisionMask(this, this.coverRadius, undefined, 1500);
        this.mask.isFixed = true;
    }
    
    private color : string = "#968053";
    public coverRadius : number;
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(0, 0, this.coverRadius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 2.5/96;
        context.strokeStyle = "#003300";
        context.stroke();
    }
}
