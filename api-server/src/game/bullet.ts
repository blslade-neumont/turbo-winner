import { BulletDetailsT } from "./packet-meta";

const DEFAULT_BULLET_SPEED = 1200;
const DEFAULT_TIME_TO_LIVE = 3;
export const BULLET_DAMAGE = 5;

export class Bullet {
    private radius : number = 6;
    private ttl: number;
    private _ignorePlayerId: number;
    private x: number;
    private y: number;
    private hspeed: number;
    private vspeed: number;
    private ignorePlayerId: number;
    
    constructor(details: BulletDetailsT) {
        this.ttl = DEFAULT_TIME_TO_LIVE;
        this._ignorePlayerId = details.ignorePlayerId;
        this.x = details.x;
        this.y = details.y;
        this.hspeed = details.hspeed;
        this.vspeed = details.vspeed;
        this.ignorePlayerId = details.ignorePlayerId;
    }

    tick(delta: number): void{
        this.x += delta * this.hspeed;
        this.y += delta * this.vspeed;
    }

    getCollisionCircle(): {x: number, y: number, r: number}{
        return {x: this.x, y: this.y, r: this.radius};
    }

    ignores(playerId: number): boolean{
        return this.ignorePlayerId === playerId;
    }
}