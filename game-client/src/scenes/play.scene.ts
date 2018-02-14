import { GameScene, Camera, FollowCamera } from 'engine';
import { Player } from '../objects/player';
import { CustomCursor } from '../objects/custom-cursor';
import { Tile } from '../objects/tile';

export class PlayScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private playerColorToDoReplaceWithFromColorSelectScene = 'yellow';
    private testPlayer: Player;
    private customCursor: CustomCursor;

    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        

        this.testPlayer = new Player(this.playerColorToDoReplaceWithFromColorSelectScene);
        this.addObject(this.testPlayer);
        this.customCursor = new CustomCursor("#ff0000")
        this.addObject(this.customCursor);
        Object.defineProperty(this, "cursor", {get:()=>["none"]});
        for (let i = 0; i < 50; ++i){
            let obj = new Tile();
            obj.x = i % 10 * 50;
            obj.y = -250 + i*50;
            this.addObject(obj);
        }

        let camera = this.camera = new FollowCamera(this);
        camera.clearColor = 'black';
        camera.zoomScale = 1; // arbitrary
        camera.clearColor = `rgb(128, 255, 64)`
        camera.follow = this.testPlayer;
    }
        
    tick(delta: number) {
        super.tick(delta);
    }
}
