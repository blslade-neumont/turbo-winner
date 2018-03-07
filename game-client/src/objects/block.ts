import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, CircleCollisionMask } from "engine";

export const BLOCK_FRICTION : number = 5.0;

export class Block extends GameObject{
    constructor(){
        super("Block", {renderDepth: 100});
    }
    
    private color : string = "#968053";
    public coverRadius : number = this.randomBlockRadius();
    
    //Potentially have this server-side so that everyone has the same size block
    randomBlockRadius() : number {
        let rad : number = 1;
        
        // let radChoice : number = Math.floor(Math.random() * 4) + 0;
        // switch(radChoice) { 
        //     case 0: { 
        //        rad = 0.25;
        //        break; 
        //     } 
        //     case 1: { 
        //        rad = 0.5;
        //        break; 
        //     } 
        //     case 2: { 
        //        rad = 1.0;
        //        break; 
        //     } 
        //     case 3: {
        //         rad = 1.5;
        //         break;
        //     }
        //  } 
        
        return rad;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        this.mask = new CircleCollisionMask(this, this.coverRadius, undefined, 1500);
        
        context.beginPath();
        context.arc(0, 0, this.coverRadius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 2.5/96;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    tick(delta : number) : void{
        let xRatio: number = 1 / (1 + (delta * BLOCK_FRICTION));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;
    }
    
}
