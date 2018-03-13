import { BlockDetailsT, BlockTypeT } from './packet-meta';
import { CircleT } from '../util/circle';
import { Game } from "./game";

export class Block {
    x: number;
    y: number;
    
    radius: number;
    type: BlockTypeT;
    
    constructor(details: BlockDetailsT) {
        Object.assign(this, details);
    }
    
    public game : Game | null;
    
    randomizePosition(fromPos: { x: number, y: number} = { x: 0, y: 0 }, minDist = 5, maxDist = 50) {
        let radius = (Math.random() * (maxDist - minDist)) + minDist;
        let theta = Math.random() * (Math.PI * 2);
        
        this.x = fromPos.x + (Math.cos(theta) * radius);
        this.y = fromPos.y + (Math.sin(theta) * radius);
    }
    
    getCollisionCircle(): CircleT {
        return {x: this.x, y: this.y, r: this.radius};
    }
    
    getDetails(): BlockDetailsT {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            type: this.type
        };
    }
}
