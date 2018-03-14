import { GameObject, CircleCollisionMask, GameObjectOptions, clamp } from 'engine';
import { BlockDetailsT, BlockTypeT } from './packet-meta';
import merge = require('lodash.merge');
import { lerp } from '../../util/lerp';

export type BlockOptions = GameObjectOptions & BlockDetailsT;

type LeafT = {
    direction: number,
    width: number,
    length: number,
    segments: number,
    relativeScale: number,
    relativeScaleTo: number
};

const PALM_TREE_LEAVES_COLOR = '#3f771280';

export class BlockOverlay extends GameObject {
    constructor(opts: BlockOptions) {
        super("Block", merge({renderDepth: -250}, opts));
        this.coverRadius = opts.radius;
        this.type = opts.type;
        
        if (this.type === 'palm-tree') {
            let segmentNum = Math.floor(Math.random() * 6) + 12;
            for (let q = 0; q < segmentNum; q++) {
                this.leaves.push({
                    direction: ((Math.PI * 2) / segmentNum) * q + Math.random() / 3,
                    width: (Math.random() * .2) + .8,
                    length: (Math.random() * 1.0) + 3.0,
                    segments: 10 + Math.floor(5 * Math.random()),
                    relativeScale: 1,
                    relativeScaleTo: 1
                });
            }
        }
    }
    
    coverRadius: number;
    type: BlockTypeT;
    
    private leaves: LeafT[] = [];
    
    tick(delta: number) {
        super.tick(delta);
        
        for (let leaf of this.leaves) {
            leaf.relativeScaleTo += ((Math.random() * 2) - 1) * delta;
            leaf.relativeScaleTo = clamp(leaf.relativeScaleTo, .8, 1.2);
            leaf.relativeScale = lerp(leaf.relativeScale, leaf.relativeScaleTo, delta);
        }
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        switch (this.type) {
        case 'boulder': this.renderBoulder(context); break;
        case 'palm-tree': this.renderPalmTree(context); break;
        default: throw new Error(`Unknown block type: ${this.type}`);
        }
    }
    
    private renderBoulder(context: CanvasRenderingContext2D) {
        ;
    }
    
    private renderPalmTree(context: CanvasRenderingContext2D) {
        context.fillStyle = PALM_TREE_LEAVES_COLOR;
        context.lineWidth = 1/96;
        
        let bounds = this.scene!.camera!.bounds;
        bounds.left -= 5;
        bounds.right += 5;
        bounds.top += 5;
        bounds.bottom -= 5;
                
        if (this.x < bounds.left || this.x > bounds.right || this.y > bounds.top || this.y < bounds.bottom) { return; }
        
        for (let leaf of this.leaves) {
            context.save();
            try {
                context.rotate(leaf.direction);
                let hscale = Math.sqrt(leaf.length) / 12;
                hscale *= leaf.relativeScale;
                context.scale(hscale, leaf.width * .8);
                context.translate(this.coverRadius / hscale, 0);
                
                context.beginPath();
                context.moveTo(0, 0);
                for (let q = 0; q < leaf.segments; q++) {
                    context.lineTo(q - .5, Math.sqrt((leaf.segments - q) / leaf.segments));
                    context.lineTo(q, Math.sqrt((leaf.segments - q) / leaf.segments) * .333);
                }
                for (let q = leaf.segments; q >= 0; q--) {
                    context.lineTo(q, -Math.sqrt((leaf.segments - q) / leaf.segments) * .333);
                    context.lineTo(q - .5, -Math.sqrt((leaf.segments - q) / leaf.segments));
                }
                context.fill();
            }
            finally {
                context.restore();
            }
        }
    }
}
