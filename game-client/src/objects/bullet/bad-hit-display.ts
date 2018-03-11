import { GameObject, pointDirection } from 'engine';
import { Player, PLAYER_RADIUS } from '../player/player';
import { DummyPlayer } from '../player/dummy-player';
import { lerp } from '../../util/lerp';
import { isSignificantlyDifferent } from '../../util/is-significantly-different';
import { Poolable } from '../object-pooler';

export const LINE_LENGTH = 48/96;
export const PERPENDICULAR_OFFSET = 48/96;
export const BACK_OFFSET = 32/96;

export class BadHitDisplay extends Poolable {
    private player: Player;
    private timer: number = 0.0;
    
    getTimer(){
        return this.timer;
    }
    
    constructor(player: Player) {
        super("BadHitIndicator", {renderDepth: -150});
        this.player = player;
    }
    
    public canBeFoundBy<T>(object: T): boolean {
        if (object instanceof DummyPlayer) {
            return false;
        } else {
            throw new Error("Cannot find BadHitDisplay by (whatever T is)");
        }
    }

    protected onEnable(args: any[]){
        this.timer = args[0];
        this.x = args[1];
        this.y = args[2];
    }
    
    tick(delta: number): void{
        super.tick(delta);
        this.timer = Math.max(this.timer - delta, 0.0);
        if (this.timer <= 0.0 && this.isEnabled()) { this.disable(); }
    }

    clamp(val: number, low: number, hi: number) : number{
        return Math.max(Math.min(val, hi), low);
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        if(!this.player.isDead && this.enabled){
            this.renderPointer(context);
        }
    }
    
    renderPointer(context: CanvasRenderingContext2D): void{
        context.save();
        try{
            let zoomScale = 1 / this.scene!.camera!.zoomScale;
            context.translate(this.x * zoomScale, this.y * zoomScale);
            context.scale(zoomScale, zoomScale);
            context.font = "bold 104px Arial";
            context.textAlign = "center";
            context.fillStyle = "#b22222";
            let str = String.fromCharCode(parseInt('0xd7', 16));
            context.fillText(str, 0.0, 0.0);
            context.strokeStyle = "#003300";
            context.lineWidth = 2;
            context.strokeText(str, 0.0, 0.0);
        }finally{
            context.restore();
        }
    }
}
