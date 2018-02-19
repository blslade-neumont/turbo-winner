import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameObjectOptions } from 'engine';
import merge = require('lodash.merge');
import { BulletDetailsT } from './bullet-meta';
import { Player } from '../player/player';

const DEFAULT_BULLET_SPEED = 1200;
const DEFAULT_TIME_TO_LIVE = 3;

type BulletOpts = GameObjectOptions & {
    ignorePlayerId: number,
    ttl?: number
};

export class Bullet extends GameObject {
    private radius : number = 6;
    private ttl: number;
    private _ignorePlayerId: number;
    
    constructor(opts: BulletOpts) {
        super("Bullet", merge({
            speed: DEFAULT_BULLET_SPEED,
            renderDepth: -50
        }, opts));
        this.ttl = typeof opts.ttl === 'undefined' ? DEFAULT_TIME_TO_LIVE : opts.ttl;
        this._ignorePlayerId = opts.ignorePlayerId;
    }
    
    get ignorePlayerId() {
        return this._ignorePlayerId;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(0, 0, this.radius, 0 , 2 * Math.PI, false);
        context.fillStyle = "#000000";
        context.fill();
    }
    
    getDetails() {
        let currentDetails: BulletDetailsT = {
            x: this.x,
            y: this.y,
            hspeed: this.hspeed,
            vspeed: this.vspeed,
            ignorePlayerId: this.ignorePlayerId,
        };
        return currentDetails;
    }

    tick(delta: number) {
        super.tick(delta);
        this.ttl -= delta;
        if (this.ttl <= 0) { this.scene.removeObject(this); }
    }

    getCollisionCircle(): {x: number, y: number, r: number}{
        return {x: this.x, y: this.y, r: this.radius};
    }

    ignores(playerId: number): boolean{
        return this.ignorePlayerId === playerId;
    }
}
