import { GameObject, pointDirection } from "engine";
import { Player, PLAYER_RADIUS } from "./player";
import { DummyPlayer } from "./dummy-player";
import { lerp } from '../../util/lerp';

export const LINE_LENGTH = 64;
export const PERPENDICULAR_OFFSET = 64;
export const BACK_OFFSET = 48;

export class TargetPointer extends GameObject {
    
    private player: Player;
    private targetPlayer: DummyPlayer | undefined;
    private targetDirection: {x: number, y: number};
    private lastOffet: {x: number, y: number};
    private lastPlayer: {x: number, y: number};
    
    constructor(player: Player){
        super("TargetPointer", {renderDepth: -150});
        this.player = player;
        this.lastOffet = {x: 0, y: 0};
        this.lastPlayer = {x: this.player.x, y: this.player.y};
    }
    
    onAddToScene(){
        this.targetPlayer = this.findTargetPlayer(this.player.targetID);
    }
    
    tick(delta: number): void{
        super.tick(delta);
        
        if(this.targetPlayer !== undefined){
            this.calculateTargetDirection();
            this.snapToTarget(delta);
        }
        
        if(this.player.targetID !== -1 || this.targetPlayer === undefined || this.player.targetID !== this.targetPlayer.playerId){
            this.targetPlayer = this.findTargetPlayer(this.player.targetID);
        }
    }
    
    calculateTargetDirection(){
        let toTarget = {x: this.targetPlayer!.x  - this.player.x, y: this.targetPlayer!.y - this.player.y};
        let toTargetLen = Math.sqrt(toTarget.x*toTarget.x + toTarget.y*toTarget.y);
        let normalToTarget = {x: toTarget.x / toTargetLen, y: toTarget.y / toTargetLen};
        this.targetDirection = normalToTarget;
    }
    
    snapToTarget(delta: number){
        let targetOffset = PLAYER_RADIUS;
        let bounds = this.scene.camera!.bounds;
        
        let clampedVec = this.clampToCardinal(bounds);
        
        
        // TODO: Replace with better lerp
        let toPos = {x: clampedVec.x - targetOffset * this.targetDirection.x, y: clampedVec.y - targetOffset * this.targetDirection.y};
        let offset = {x: toPos.x - this.player.x, y: toPos.y - this.player.y};
        
        if (clampedVec.lerpOffset){
            this.x = this.player.x + lerp(this.lastOffet.x, offset.x, 1.5 * delta);
            this.y = this.player.y + lerp(this.lastOffet.y, offset.y, 1.5 * delta);    
        } else {
            this.x = lerp(this.x, toPos.x, 3.5 * delta);
            this.y = lerp(this.y, toPos.y, 3.5 * delta);
        }

        // for use next frame
        this.lastOffet = {x: this.x - this.player.x, y: this.y - this.player.y};
        this.lastPlayer = {x: this.player.x, y: this.player.y};
    }
    
    clampToCardinal(bounds:{left: number;right: number;top: number;bottom: number;}): {x: number, y:number, lerpOffset: boolean}{
        let xClamped = this.clamp(this.targetPlayer!.x, bounds.left - PLAYER_RADIUS, bounds.right + PLAYER_RADIUS);
        let yClamped = this.clamp(this.targetPlayer!.y, bounds.bottom - PLAYER_RADIUS, bounds.top + PLAYER_RADIUS);
        
        let xClampSign = Math.sign(xClamped - this.player.x);
        let yClampSign = Math.sign(yClamped - this.player.y);
        
        let xTolerance = (bounds.right - bounds.left) * 0.25;
        let yTolerance = (bounds.top - bounds.bottom) * 0.25;
        let xTClamped = this.clamp(xClamped, bounds.left + xTolerance, bounds.right - xTolerance);
        let yTClamped = this.clamp(yClamped, bounds.bottom + yTolerance, bounds.top - yTolerance);
        
        let doLerpOffset: boolean = true;
        if(xTClamped !== this.targetPlayer!.x && yTClamped !== this.targetPlayer!.y){
            if(!(xClamped === this.targetPlayer!.x && yClamped === this.targetPlayer!.y)){
                this.targetDirection.x = xClampSign*1/Math.SQRT2;
                this.targetDirection.y = yClampSign*1/Math.SQRT2;
                xClamped = (xClampSign <= 0) ? (bounds.left) : (bounds.right);
                yClamped = (yClampSign <= 0) ? (bounds.bottom) : (bounds.top);
            } else {
                doLerpOffset = false;
            }
        }else if(xClamped !== this.targetPlayer!.x){
            yClamped = (bounds.bottom + bounds.top) / 2;
            xClamped -= xClampSign * (PLAYER_RADIUS / 2);
            this.targetDirection.x = xClampSign;
            this.targetDirection.y = 0;
        }else if(yClamped !== this.targetPlayer!.y){
            xClamped = (bounds.left + bounds.right) / 2;
            yClamped -= yClampSign * (PLAYER_RADIUS / 2);
            this.targetDirection.x = 0;
            this.targetDirection.y = yClampSign;
        } else {
            doLerpOffset = false;
        }
        
        return {x: xClamped, y: yClamped, lerpOffset: doLerpOffset};
    }
    
    clamp(val: number, low: number, hi: number) : number{
        return Math.max(Math.min(val, hi), low);
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D): void {
        if(!this.player.isDead && this.player.targetID !== -1){
            this.renderPointer(context);
        }
    }
    
    renderPointer(context: CanvasRenderingContext2D): void{
        context.beginPath();
        let lineWidth = 0.104166;
        let pointOffset = 2.5;
        
        let perpendicularVec = {x: this.targetDirection.y, y: -this.targetDirection.x};
        
        context.moveTo(-(pointOffset)*perpendicularVec.x, -(pointOffset)*perpendicularVec.y);
        
        context.lineTo((perpendicularVec.x*PERPENDICULAR_OFFSET) - (this.targetDirection.x*BACK_OFFSET),
                       (perpendicularVec.y*PERPENDICULAR_OFFSET) - (this.targetDirection.y*BACK_OFFSET) );
                       
        context.moveTo(pointOffset*perpendicularVec.x, pointOffset*perpendicularVec.y);
        context.lineTo((-perpendicularVec.x*PERPENDICULAR_OFFSET) - (this.targetDirection.x*BACK_OFFSET),
                       (-perpendicularVec.y*PERPENDICULAR_OFFSET) - (this.targetDirection.y*BACK_OFFSET) );
        
        context.lineWidth = lineWidth;
        context.strokeStyle = "#FFFFFF";
        context.stroke();
    }
    
    findTargetPlayer(targetID: number | undefined) : DummyPlayer | undefined{
        if(targetID === -1) return;
        let dummyObjects: Array<DummyPlayer> = [];
        dummyObjects = this.game.scene!.findObjects(d => d.name == "DummyPlayer") as DummyPlayer[];
        return dummyObjects.find(d => d.playerId == this.player.targetID);
    }
}
