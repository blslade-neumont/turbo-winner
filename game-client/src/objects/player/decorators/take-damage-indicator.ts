import { GameObject, clamp } from 'engine';
import { Player } from '../player';

export class TakeDamageIndicator extends GameObject {
    constructor(private player: Player) {
        super('TakeDamageIndicator', {
            renderCamera: 'none',
            renderDepth: -500
        });
    }
    
    private prevHealth = 0;
    private takeDamageIndicator = 0;
    
    tick(delta: number) {
        super.tick(delta);
        if (this.player.health < this.prevHealth) this.takeDamageIndicator = 1;
        this.prevHealth = this.player.health;
        this.takeDamageIndicator -= delta * 4;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        let [canvasWidth, canvasHeight] = this.game.canvasSize;
        
        let amt = clamp(this.takeDamageIndicator, 0, 1);
        if (amt !== 0) {
            let prevAlpha = context.globalAlpha;
            try {
                context.globalAlpha *= amt * .5;
                context.fillStyle = 'red';
                context.fillRect(0, 0, canvasWidth, canvasHeight);
            }
            finally {
                context.globalAlpha = prevAlpha;
            }
        }
    }
}
