import { GameObject } from "engine";
import { Player, MAX_PLAYER_HEALTH } from "./player";

export const SCORE_ANIMATION_TIME = 3.0;
export const BIG_SCORE_SCALE = 3.0;
export class ScorePopup extends GameObject {
    
    constructor(player : Player){
        super("PlayerScorePopup", { renderDepth: -275 });
        this.player = player;
    }
    
    private player : Player;
    private display: boolean = false;
    private scale: number = 0.0;
    private timer: number = 0.0;
    private scoreText: string = "+0";
    private scoreColor: string = "Green";
    
    tick(delta: number){
        this.x = this.player.x;
        this.y = this.player.y;
        
        if (this.display){
            this.timer -= delta;
            let t = this.timer/SCORE_ANIMATION_TIME;
            this.scale = t*BIG_SCORE_SCALE;
            if (this.timer <= 0.0){
                this.display = false;
                this.timer = 0.0;
                this.scale = 0.0;
            }
        }
        
        super.tick(delta);
    }
    
    beginAnimation(changeInScore: number): void{
        if (this.display) {return;}
        if (changeInScore > 0){
            this.scoreText = "+" + changeInScore;
            this.scoreColor = "Green";
            this.timer = SCORE_ANIMATION_TIME;
            this.display = true;
            this.scale = BIG_SCORE_SCALE;
        } else if (changeInScore < 0){
            this.scoreText = "" + changeInScore;
            this.scoreColor = "Red";
            this.timer = SCORE_ANIMATION_TIME;
            this.display = true;
            this.scale = BIG_SCORE_SCALE;
        } // do nothing for score changes of 0
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        if (this.display){
            this.renderPopup(context);
        }
    }
    
    renderPopup(context: CanvasRenderingContext2D): void{
        context.save();
        try{
            context.translate(50 / this.scene!.camera!.zoomScale, -100 / this.scene!.camera!.zoomScale);
            context.scale(this.scale / this.scene!.camera!.zoomScale, this.scale  / this.scene!.camera!.zoomScale);
            this.renderText(context, "48px Arial", this.scoreText, {x: 0, y: 0});
        }finally{
            context.restore();
        }
    }
    
    renderText(context : CanvasRenderingContext2D, fontStyle : string, text : string, position : {x: number, y: number}){
        context.font = fontStyle;
        context.textAlign = "center";
        context.fillStyle = this.scoreColor;
        context.fillText(text, position.x, position.y);
    }
    
}
