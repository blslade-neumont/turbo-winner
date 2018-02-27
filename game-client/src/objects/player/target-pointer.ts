import { GameObject } from "engine";
import { Player, PLAYER_RADIUS } from "./player";
import { DummyPlayer } from "./dummy-player";


export const LINE_LENGTH = 64;
export const PERPENDICULAR_OFFSET = 64;
export const BACK_OFFSET = 48;

export class TargetPointer extends GameObject {
    
    private player: Player;
    private targetPlayer: DummyPlayer | undefined;
    private targetDirection: {x: number, y: number};
    
    constructor(player: Player){
        super("TargetPointer", {renderDepth: -150});
        this.player = player;
        
    }
    
    onAddToScene(){
        this.targetPlayer = this.findTargetPlayer(this.player.targetID);
    }
    
    tick(delta: number): void{
        super.tick(delta);
        
        if(this.targetPlayer !== undefined){
            this.calculateTargetDirection();
            this.snapToTarget();
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
    
    snapToTarget(){
        let targetOffset = PLAYER_RADIUS + LINE_LENGTH;
        let bounds = this.scene.camera!.bounds;
        
        this.x = this.clamp(this.targetPlayer!.x, bounds.left, bounds.right) - targetOffset * this.targetDirection.x;
        this.y = this.clamp(this.targetPlayer!.y, bounds.bottom, bounds.top) - targetOffset * this.targetDirection.y;
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
        let lineWidth = 10;
        let pointOffset = 2.5;
        
        let endPos = {x: LINE_LENGTH*this.targetDirection.x, y: LINE_LENGTH*this.targetDirection.y };
        let perpendicularVec = {x: this.targetDirection.y, y: -this.targetDirection.x};
        
        context.moveTo(endPos.x - (pointOffset)*perpendicularVec.x, endPos.y - (pointOffset)*perpendicularVec.y);
        
        context.lineTo(endPos.x + (perpendicularVec.x*PERPENDICULAR_OFFSET) - (this.targetDirection.x*BACK_OFFSET),
                       endPos.y + (perpendicularVec.y*PERPENDICULAR_OFFSET) - (this.targetDirection.y*BACK_OFFSET) );
        context.moveTo(endPos.x - (pointOffset)*-perpendicularVec.x, endPos.y - (pointOffset)*-perpendicularVec.y);
        context.lineTo(endPos.x + (-perpendicularVec.x*PERPENDICULAR_OFFSET) - (this.targetDirection.x*BACK_OFFSET),
                       endPos.y + (-perpendicularVec.y*PERPENDICULAR_OFFSET) - (this.targetDirection.y*BACK_OFFSET) );
        
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
