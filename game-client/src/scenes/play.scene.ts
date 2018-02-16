import { GameScene, FollowCamera } from 'engine';
import { TurboWinnerGame } from '../turbo-winner-game';
import { CustomCursor } from '../objects/custom-cursor';
import { PlayerManager } from '../objects/player/player-manager';
import { Tile } from '../objects/tile';
import { BulletManager } from '../objects/bullet/bullet-manager';

export class PlayScene extends GameScene {
    constructor(color : string) {
        super();
        this.playerColor = color;
    }
    
    private initialized = false;
    private playerColor = 'yellow';
    private playerManager: PlayerManager;
    private bulletManager: BulletManager;
    private customCursor: CustomCursor;
    
    getCursor() {
        return ['none'];
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        this.customCursor = new CustomCursor("#ff0000")
        this.addObject(this.customCursor);
        
        for (let i = 0; i < 50; ++i){
            let obj = new Tile();
            obj.x = i % 10 * 50;
            obj.y = -250 + i*50;
            this.addObject(obj);
        }
        
        let camera = this.camera = new FollowCamera(this);
        camera.zoomScale = 1; // arbitrary
        camera.clearColor = `rgb(128, 255, 64)`;
        
        this.playerManager = new PlayerManager(this.playerColor);
        this.bulletManager = new BulletManager(this.playerManager);
        this.addObject(this.playerManager);
        this.addObject(this.bulletManager);
    }
}
