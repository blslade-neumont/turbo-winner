import { GameObject, pointDirection } from 'engine';
import { Player, PLAYER_RADIUS } from '../player';
import { DummyPlayer } from '../dummy-player';
import { lerp } from '../../../util/lerp';
import { isSignificantlyDifferent } from '../../../util/is-significantly-different';

export const LINE_LENGTH = 48/96;
export const PERPENDICULAR_OFFSET = 48/96;
export const BACK_OFFSET = 32/96;
export const TIMER_FLASH_THRESHOLD = 5.0;

export class AttackerPointer extends GameObject {
    private player: Player;
    private attacker: DummyPlayer | undefined;
    private toLocalPlayer: {x: number, y: number};
    private lastOffet: {x: number, y: number};
    private enabled: boolean = false;
    private timer: number = 0.0;
    
    getTimer(){
        return this.timer;
    }
    
    constructor(player: Player) {
        super("AttackerPointer", {renderDepth: -150});
        this.player = player;
        this.lastOffet = {x: 0, y: 0};
    }
    
    isAttacker(attacker: DummyPlayer){
        if (!this.attacker) { return false; }
        return this.attacker.playerId === attacker.playerId;
    }
    
    enablePointer(attacker: DummyPlayer, timer: number){
        this.attacker = attacker;
        this.enabled = true;
        this.timer = timer;
        this.initPos();
    }
    
    initPos(){
        let targetOffset = PLAYER_RADIUS + LINE_LENGTH;
        this.calculateTargetDirection();
        let bounds = this.scene.camera!.bounds;
        let clampedVec = this.clampToCardinal(bounds);
                
        this.x = clampedVec.x + targetOffset * this.toLocalPlayer.x;
        this.y = clampedVec.y + targetOffset * this.toLocalPlayer.y;
    }
    
    disablePointer(){
        this.attacker = undefined;
        this.enabled = false;
    }
    
    isEnabled(): boolean{
        return this.enabled;
    }

    tick(delta: number): void{
        super.tick(delta);
        
        if(this.attacker !== undefined){
            this.calculateTargetDirection();
            this.snapToTarget(delta);
        }
        
        this.timer = Math.max(this.timer - delta, 0.0);
    }
    
    calculateTargetDirection(){
        let toTarget = {x: this.player!.x  - this.attacker!.x, y: this.player!.y - this.attacker!.y};
        let toTargetLen = Math.sqrt(toTarget.x*toTarget.x + toTarget.y*toTarget.y);
        let normalToTarget = {x: toTarget.x / toTargetLen, y: toTarget.y / toTargetLen};
        this.toLocalPlayer = normalToTarget;
    }

    snapToTarget(delta: number){
        let targetOffset = PLAYER_RADIUS + LINE_LENGTH;
        let bounds = this.scene.camera!.bounds;
        
        let clampedVec = this.clampToCardinal(bounds);
                
        // TODO: Replace with better lerp
        let toPos = {x: clampedVec.x + targetOffset * this.toLocalPlayer.x, y: clampedVec.y + targetOffset * this.toLocalPlayer.y};
        let offset = {x: toPos.x - this.attacker!.x, y: toPos.y - this.attacker!.y};
        
        this.x = lerp(this.x, toPos.x, 5 * delta);
        this.y = lerp(this.y, toPos.y, 5 * delta);

        // for use next frame
        this.lastOffet = {x: this.x - this.attacker!.x, y: this.y - this.attacker!.y};
    }
    
    clampToCardinal(bounds:{left: number;right: number;top: number;bottom: number;}): {x: number, y:number, lerpOffset: boolean}{
        let xClamped = this.clamp(this.attacker!.x, bounds.left - PLAYER_RADIUS, bounds.right + PLAYER_RADIUS);
        let yClamped = this.clamp(this.attacker!.y, bounds.bottom - PLAYER_RADIUS, bounds.top + PLAYER_RADIUS);
        
        return {x: xClamped, y: yClamped, lerpOffset: (isSignificantlyDifferent(xClamped, this.attacker!.x) || isSignificantlyDifferent(yClamped, this.attacker!.y))};
    }
    
    clamp(val: number, low: number, hi: number) : number{
        return Math.max(Math.min(val, hi), low);
    }
    
    getRenderAlpha(): number {
        let showPercent = 1;
        if (this.timer > 0 && this.timer <= TIMER_FLASH_THRESHOLD) { showPercent = Math.abs((((Math.sqrt(this.timer) * 100) % 7) / 3.5) - 1); }
        return showPercent;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        if(!this.player.isDead && this.enabled){
            let alpha = this.getRenderAlpha();
            if (!alpha) return;
            
            let prevGlobalAlpha = context.globalAlpha;
            try {
                context.globalAlpha *= alpha;
                
                this.renderPointer(context);
            }
            finally {
                context.globalAlpha = prevGlobalAlpha;
            }
        }
    }
    
    renderPointer(context: CanvasRenderingContext2D): void{
        context.beginPath();
        let lineWidth = 10 / this.scene!.camera!.zoomScale;
        let pointOffset = 2.5 / this.scene!.camera!.zoomScale;
        
        let perpendicularVec = {x: this.toLocalPlayer.y, y: -this.toLocalPlayer.x};
        
        context.moveTo(-(pointOffset)*perpendicularVec.x, -(pointOffset)*perpendicularVec.y);
        
        context.lineTo((perpendicularVec.x*PERPENDICULAR_OFFSET) - (this.toLocalPlayer.x*BACK_OFFSET),
                       (perpendicularVec.y*PERPENDICULAR_OFFSET) - (this.toLocalPlayer.y*BACK_OFFSET) );
                       
        context.moveTo(pointOffset*perpendicularVec.x, pointOffset*perpendicularVec.y);
        context.lineTo((-perpendicularVec.x*PERPENDICULAR_OFFSET) - (this.toLocalPlayer.x*BACK_OFFSET),
                       (-perpendicularVec.y*PERPENDICULAR_OFFSET) - (this.toLocalPlayer.y*BACK_OFFSET) );
        
        context.lineWidth = lineWidth;
        context.strokeStyle = "#FF0000";
        context.stroke();
    }
}
