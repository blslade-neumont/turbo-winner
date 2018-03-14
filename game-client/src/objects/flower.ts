import { GameObject, GameObjectOptions } from 'engine';
import merge = require('lodash.merge');

const POSSIBLE_FLOWER_COLORS = ['red', 'orange', 'yellow', 'purple', 'blue'];
function randomFlowerColor(): string {
    //Really hacky way to give a weighted random. TODO: fix
    while (true) {
        for (let color of POSSIBLE_FLOWER_COLORS) {
            if (Math.random() < .6) return color;
        }
    }
}

export class Flower extends GameObject {
    constructor(opts: GameObjectOptions) {
        super("Tile", merge({ renderDepth: 100 }, opts));
        this.color = randomFlowerColor();
        this.radius = .075 + (Math.random() * .03);
    }
    
    private color: string;
    private radius: number;
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        context.fillStyle = this.color;
        const PETAL_COUNT = 5;
        for (let q = 0; q < PETAL_COUNT; q++) {
            let angle = q * ((2 * Math.PI) / PETAL_COUNT);
            let dist = this.radius * 1.5;
            let x = Math.cos(angle) * dist;
            let y = Math.sin(angle) * dist;
            
            context.beginPath();
            context.ellipse(x, y, this.radius, this.radius, 0, 0, 2 * Math.PI);
            context.fill();
        }
        
        context.fillStyle = 'green';
        context.beginPath();
        context.ellipse(0, 0, this.radius * .7, this.radius * .7, 0, 0, 2 * Math.PI);
        context.fill();
    }
}
