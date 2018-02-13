import { GameScene, Camera, GameEvent } from 'engine';
import { PlayScene } from './play.scene';
import { ColorRectangleObject } from '../objects/color-rectangle';

export class StartScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    
    handleEvent(event : GameEvent){
        if (event.type == 'keyPressed' && event.code == 'Space'){
            this.game.changeScene(new PlayScene());
            return true;
        }

        return super.handleEvent(event);
    }

    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;

        this.addObject(new ColorRectangleObject());
        
        let camera = this.camera = new Camera(this);
        camera.clearColor = 'black';
    }
    
    private blue = 0;
    
    tick(delta: number) {
        super.tick(delta);
        
        this.blue += delta * 120;
        let actualBlue = Math.abs(Math.floor(this.blue % 512) - 256);
        if (this.initialized) this.camera!.clearColor = `rgb(0, 0, ${actualBlue})`;
    }
}
