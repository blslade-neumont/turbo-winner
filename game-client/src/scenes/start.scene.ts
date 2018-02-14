import { GameScene, Camera, GameEvent } from 'engine';
import { PlayScene } from './play.scene';
import { ColorRectangleObject } from '../objects/color-rectangle';
import { ColorMenuObject } from '../objects/color-menu';

export class StartScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private colorMenu : ColorMenuObject;
    
    handleEvent(event : GameEvent){
        if (event.type == 'keyPressed' && (event.code == 'Space' || event.code == 'Enter')){
            this.game.changeScene(new PlayScene(this.colorMenu.getSelectedColor()));
            return true;
        }
        // TODO: ASK SHOULD WE DO THIS?
        // if(event.type == 'mouseButtonPressed' && this.colorMenu.inSelectedCircle()){
        //     this.game.changeScene(new PlayScene(this.colorMenu.getSelectedColor()));
        // }

        return super.handleEvent(event);
    }

    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;

        this.colorMenu = new ColorMenuObject(64, {x: 0, y: 0}, 256);
        this.addObject(this.colorMenu);
        
        
        let camera = this.camera = new Camera(this);
        camera.clearColor = 'grey';
    }
    
    tick(delta: number) {
        super.tick(delta);
    }
}
