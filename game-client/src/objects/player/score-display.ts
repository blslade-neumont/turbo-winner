import { GameObject } from "engine";
import { Player, MAX_PLAYER_HEALTH } from "./player";


export class ScoreDisplay extends GameObject {
    
    constructor(player : Player){
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
        this.renderText(context, "24px Arial", "Score: " + this.player.score.toFixed(0), {x: 0, y: -100});
    }
    
    renderText(context : CanvasRenderingContext2D, fontStyle : string, text : string, position : {x: number, y: number}, color = "black"){
        context.font = fontStyle;
        context.textAlign = "center";
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
    }
    

}
