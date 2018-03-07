import { GameObject } from 'engine';
import { Player, MAX_PLAYER_HEALTH } from '../player';

export class ScoreDisplay extends GameObject {
    constructor(player: Player) {
        super("PlayerScore", { renderDepth: -250 });
        this.player = player;
    }
    
    private player : Player;
    
    tick(delta: number){
        this.x = this.player.x;
        this.y = this.player.y;
        super.tick(delta);
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        this.renderPlayerScore(context);
    }
    
    renderPlayerScore(context: CanvasRenderingContext2D): void {
        context.save();
        try{
            context.translate(0, -100 / this.scene!.camera!.zoomScale);
            context.scale(1 / this.scene!.camera!.zoomScale, 1 / this.scene!.camera!.zoomScale);
            this.renderText(context, "24px Arial", "Score: " + this.player.score.toFixed(0), {x: 0, y: 0});
        }finally{
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
