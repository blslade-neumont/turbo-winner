import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera} from "engine";

export abstract class Player extends GameObject {
    constructor(
        name: string,
        readonly playerId: number,
        public color: string,
        x: number,
        y: number
    ) {
        super(name, {
            x: x,
            y: y
        });
    }
    
    public forward: { x: number, y: number };
    
    renderPlayerCircle(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(0, 0, 48, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    renderPlayerPointer(context: CanvasRenderingContext2D) {
        const lineLength = 64;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength*this.forward.x, lineLength*this.forward.y);
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    renderImpl(adapter: GraphicsAdapter) {
        if (adapter instanceof DefaultGraphicsAdapter) {
            let context = adapter.context!;
            this.renderPlayerCircle(context);
            this.renderPlayerPointer(context);
        }
    }
    
    getDetails(): any {
        return {
            x: this.x,
            y: this.y,
            hspeed: this.hspeed,
            vspeed: this.vspeed,
            color: this.color,
            forward: this.forward
        };
    }
}
