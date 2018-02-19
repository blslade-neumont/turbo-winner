import { BulletDetailsT } from "./packet-meta";
import { Player } from "./player";
import { CircleT } from "../util/circle";
import { Game } from "./game";

const DEFAULT_BULLET_SPEED = 1200;
const DEFAULT_TIME_TO_LIVE = 3;
export const BULLET_DAMAGE = 5;

export class Bullet {
    private radius : number = 6;
    private ttl: number;
    private x: number;
    private y: number;
    private hspeed: number;
    private vspeed: number;
    private ignorePlayerId: number;
    
    constructor(details: BulletDetailsT) {
        this.ttl = DEFAULT_TIME_TO_LIVE;
        Object.assign(this, details);
    }
    
    public game: Game | null;
    
    tick(delta: number): void {
        this.x += delta * this.hspeed;
        this.y += delta * this.vspeed;
        
        this.ttl -= delta;
        if (this.ttl <= 0 && this.game) this.game.removeBullet(this);
    }
    
    getCollisionCircle(): CircleT {
        return {x: this.x, y: this.y, r: this.radius};
    }
    
    shouldIgnorePlayer(player: Player): boolean;
    shouldIgnorePlayer(playerId: number): boolean;
    shouldIgnorePlayer(player: Player | number): boolean {
        if (player instanceof Player) player = player.playerId;
        return this.ignorePlayerId === player;
    }
}
