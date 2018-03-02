import { GameObject } from "engine";
import { Player, MAX_PLAYER_HEALTH } from "./player";


export class HealthBar extends GameObject {
    
    constructor(player : Player){
        super("PlayerHealthBar", { renderDepth: -200 });
        this.player = player;
    }
    
    private player : Player;
    
    tick(delta: number){
        this.x = this.player.x;
        this.y = this.player.y;
        super.tick(delta);
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        if(!this.player.isDead){
            this.renderPlayerHealth(context);
        }
    }
    
    renderPlayerHealth(context: CanvasRenderingContext2D): void {
        const MAX_HB_WIDTH: number = 1;
        const HB_OFFSET: number = -.75;
        const HB_HEIGHT: number = .166;
        const HB_STROKE: number = .04166;
        const HB_LEFT: number = (MAX_HB_WIDTH / -2);
        const HB_INNER_MAX_WIDTH: number = MAX_HB_WIDTH - HB_STROKE;
        const HB_INNER_HEIGHT: number = HB_HEIGHT - HB_STROKE;

        // gray bar black stroke bg
        context.fillStyle = "gray";
        context.fillRect(HB_LEFT, HB_OFFSET, MAX_HB_WIDTH, HB_HEIGHT);
        context.lineWidth = HB_STROKE;
        context.strokeStyle = "#003300";
        context.strokeRect(HB_LEFT, HB_OFFSET, MAX_HB_WIDTH, HB_HEIGHT);

        let healthPerc: number = (this.player.health / MAX_PLAYER_HEALTH);
        healthPerc = healthPerc < 0.0 ? 0.0 : (healthPerc > 1.0 ? 1.0 : healthPerc);

        // red bar no stroke
        context.fillStyle = "red";
        context.fillRect(HB_LEFT + HB_STROKE/2, HB_OFFSET + HB_STROKE/2,
                         healthPerc* HB_INNER_MAX_WIDTH, HB_INNER_HEIGHT);
    }
    
    
}
