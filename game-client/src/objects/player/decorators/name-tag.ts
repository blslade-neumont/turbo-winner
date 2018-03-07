import { GameObject, pointDirection } from 'engine';
import { Player, PLAYER_RADIUS } from '../player';

export class NameTag extends GameObject {
    constructor(player: Player) {
        super("NameTag", {renderDepth: -175});
        this.player = player;
    }
    
    private player : Player;
    
    tick(delta: number) {
        this.x = this.player.x;
        this.y = this.player.y;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        this.renderNameTag(context);
    }
    
    renderNameTag(context: CanvasRenderingContext2D): void {
        context.save();
        try {
            context.translate(0, -128 / this.scene!.camera!.zoomScale);
            context.scale(1 / this.scene!.camera!.zoomScale, 1 / this.scene!.camera!.zoomScale);
            this.renderText(context, "24px Arial", this.player.displayName, {x: 0, y: 0});
        }
        finally {
            context.restore();
        }
    }
    
    renderText(context : CanvasRenderingContext2D, fontStyle : string, text : string, position : {x: number, y: number}, color = "black"){
        context.font = fontStyle;
        context.textAlign = "center";
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
    }
}
