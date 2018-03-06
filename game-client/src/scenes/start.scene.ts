import { GameScene, Camera, GameEvent } from 'engine';
import { PlayScene } from './play.scene';
import { NameScene } from './name.scene';
import { ColorMenuObject } from '../objects/color-menu';
import { ButtonObject } from '../objects/button';

export class StartScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private colorMenu : ColorMenuObject;
    
    private finalizeColorSelection() {
        this.game.changeScene(new NameScene(this.colorMenu.getSelectedColor()));
    }
    
    handleEvent(event : GameEvent){
        if ((event.type === 'abstractButtonPressed' && event.name === 'submit') ||
            (event.type == 'mouseButtonPressed' && this.colorMenu.inSelectedCircle())
        ) {
            this.finalizeColorSelection();
            return true;
        }
        
        return super.handleEvent(event);
    }
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        this.colorMenu = new ColorMenuObject(96, {x: 0, y: 0}, 325);
        this.addObject(this.colorMenu);
        
        this.addObject(new ButtonObject({
            x: -100,
            y: 200,
            width: 200,
            height: 60,
            text: 'Next',
            action: () => this.finalizeColorSelection()
        }));
        
        let camera = this.camera = new Camera(this);
        camera.clearColor = 'rgb(128, 255, 64)';
    }
}
