import { GameScene, Camera } from 'engine';
import { Player } from '../objects/player';
import { CustomCursor } from '../objects/custom-cursor';

export class PlayScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private playerColorToDoReplaceWithFromColorSelectScene = 'yellow';
    private testPlayer: Player;
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        let camera = this.camera = new Camera(this);
        camera.clearColor = 'black';
        camera.zoomScale = 1; // arbitrary
        camera.clearColor = `rgb(128, 255, 64)`
        this.testPlayer = new Player(this.playerColorToDoReplaceWithFromColorSelectScene);
        this.addObject(this.testPlayer);
        this.addObject(new CustomCursor("#ff0000"));
        Object.defineProperty(this, "cursor", {get:()=>["none"]});

    }
        
    tick(delta: number) {
        super.tick(delta);
    }
}
