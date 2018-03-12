import { BlockDetailsT } from "./packet-meta";
import { CircleT } from '../util/circle';
import { Game } from "./game";


export class Block {
    private radius : number;
    
    private x : number;
    private y : number;
    private hspeed : number = 0;
    private vspeed : number = 0;
    
    constructor(details: BlockDetailsT) {
        Object.assign(this, details);
    }
    
    public game : Game | null;
    
    randomizePosition() {
        let minDist = 5;
        let maxDist = 50;
        let radius = Math.floor(Math.random() * maxDist) + minDist;
        let theta = Math.floor(Math.random() * (Math.PI * 2));
        
        this.x = Math.cos(theta) * radius;
        this.y = Math.sin(theta) * radius;
    }
    
    getCollisionCircle(): CircleT {
        return {x: this.x, y: this.y, r: this.radius};
    }
    
    getDetails(): BlockDetailsT{
        return {x: this.x, y: this.y, radius: this.radius};
    }
}
