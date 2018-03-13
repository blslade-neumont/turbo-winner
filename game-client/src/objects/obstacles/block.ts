import { GameObject, CircleCollisionMask, GameObjectOptions } from 'engine';
import { BlockDetailsT, BlockTypeT } from './packet-meta';
import merge = require('lodash.merge');

export type BlockOptions = GameObjectOptions & BlockDetailsT;

const BOULDER_COLOR = '#968053';
const BOULDER_STROKE_COLOR = '#003300';
const PALM_TREE_TRUNK_COLOR = 'yellow';
const PALM_TREE_LEAVES_COLOR = 'green';

export class Block extends GameObject {
    constructor(opts: BlockOptions) {
        super("Block", merge({renderDepth: 100}, opts));
        this.coverRadius = opts.radius;
        this.mask = new CircleCollisionMask(this, this.coverRadius);
        this.mask.isFixed = true;
        this.type = opts.type;
    }
    
    coverRadius: number;
    type: BlockTypeT;
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        switch (this.type) {
        case 'boulder': this.renderBoulder(context); break;
        case 'palm-tree': this.renderPalmTree(context); break;
        default: throw new Error(`Unknown block type: ${this.type}`);
        }
    }
    
    private renderBoulder(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(0, 0, this.coverRadius, 0, 2 * Math.PI, false);
        context.fillStyle = BOULDER_COLOR;
        context.fill();
        context.lineWidth = 2.5/96;
        context.strokeStyle = BOULDER_STROKE_COLOR;
        context.stroke();
    }
    
    private renderPalmTree(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(0, 0, this.coverRadius, 0, 2 * Math.PI, false);
        context.fillStyle = PALM_TREE_TRUNK_COLOR;
        context.fill();
        
        context.fillStyle = PALM_TREE_LEAVES_COLOR;
    }
}
