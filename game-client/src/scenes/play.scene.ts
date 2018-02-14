import { GameScene, FollowCamera } from 'engine';
import { TurboWinnerGame } from '../turbo-winner-game';
import { Player } from '../objects/player/player';
import { LocalPlayer } from '../objects/player/local-player';
import { DummyPlayer } from '../objects/player/dummy-player';
import { CustomCursor } from '../objects/custom-cursor';
import { PlayerManager } from '../objects/player-manager';
import { Tile } from '../objects/tile';

export class PlayScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private playerColorToDoReplaceWithFromColorSelectScene = 'yellow';
    private playerManager: PlayerManager;
    private customCursor: CustomCursor;
    
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
        
        this.playerManager = new PlayerManager(this.playerColorToDoReplaceWithFromColorSelectScene);
        this.addObject(this.playerManager);
        
        Object.defineProperty(this, "cursor", {get:()=>["none"]});
    }
}
