import { GameObject } from "engine";
import { TurboWinnerGame } from "../../turbo-winner-game";
import { BulletDetailsT } from "./bullet-meta";
import { Bullet } from "./bullet";
import { PlayerManager } from "../player/player-manager";

export class BulletManager extends GameObject {
    constructor(private playerManager: PlayerManager) {
        super(`BulletManager`, { shouldRender: false });
    }

    get io() {
        return (<TurboWinnerGame>this.game).io;
    }

    onAddToScene(): void {
        super.onAddToScene();
        this.init();
    }

    private bullets: Array<Bullet> = [];

    private init(): void {
        this.io.on("create-bullet", (details: BulletDetailsT) => {
            if(this.playerManager.localPlayerId === details.ignorePlayerId) { return; }
            let bullet: Bullet = new Bullet(details);
            this.bullets.push(bullet);
            this.scene.addObject(bullet);
        });
    }

    addBullet(bullet: Bullet): void {
        this.bullets.push(bullet);
    }

    getBullets(): Array<Bullet>{
        return this.bullets;
    }
}
