import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameObjectOptions } from 'engine';
import merge = require('lodash.merge');

const DEFAULT_BULLET_SPEED = 1200;
const DEFAULT_TIME_TO_LIVE = 3;

type BulletOpts = GameObjectOptions & {
    direction: number, //Optional in GameObjectOptions, but required here
    ignorePlayerId: number,
    ttl?: number
};

export class Bullet extends GameObject {
    private radius : number = 6;
    private ttl: number;
    private _ignorePlayerId: number;
    
    constructor(opts: BulletOpts) {
        super("Bullet", merge({}, opts, {
            speed: DEFAULT_BULLET_SPEED
        }));
        this.ttl = typeof opts.ttl === 'undefined' ? DEFAULT_TIME_TO_LIVE : opts.ttl;
        this._ignorePlayerId = opts.ignorePlayerId;
    }
    
    get ignorePlayerId() {
        return this._ignorePlayerId;
    }
    
    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            context.beginPath();
            context.arc(0, 0, this.radius, 0 , 2 * Math.PI, false);
            context.fillStyle = "#000000";
            context.fill();
        }
    }
    
    tick(delta: number) {
        super.tick(delta);
        this.ttl -= delta;
        if (this.ttl <= 0) this.scene.removeObject(this);
    }
}
