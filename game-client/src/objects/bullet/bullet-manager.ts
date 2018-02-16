import { GameObject, GameScene, GraphicsAdapter } from "engine";
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
    
    addToScene(scene: GameScene) {
        super.addToScene(scene);
        this.init();
    }
    
    private init() {
        this.io.on('create-bullet', (details: BulletDetailsT) => {
            if(this.playerManager.localPlayerId === details.ignorePlayerId) return;
            this.scene.addObject(new Bullet(details));
        });
    }
}
