import { GameScene, Camera, GameEvent } from 'engine';
import { PlayScene } from './play.scene';
import { ButtonObject } from '../objects/button';
import { NameMenuObject } from '../objects/name-menu';

export class NameScene extends GameScene {
    constructor(color: string) {
        super();
        this.color = color;
    }
    
    private color: string;
    private nameMenu: NameMenuObject;
    
    private initialized = false;
    
    private finalizeNameSelection() {
        this.game.changeScene(new PlayScene(this.color, this.nameMenu.getName()));
    }
    
    handleEvent(event : GameEvent){
        if (event.type === 'abstractButtonPressed' && event.name === 'alt-submit') {
            this.finalizeNameSelection();
            return true;
        }
        
        return super.handleEvent(event);
    }
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        this.nameMenu = new NameMenuObject();
        this.addObject(this.nameMenu);
        
                
        this.addObject(new ButtonObject({
            x: -100,
            y: 200,
            width: 200,
            height: 60,
            text: 'Done',
            action: () => this.finalizeNameSelection()
        }));
        
        let camera = this.camera = new Camera(this);
        camera.clearColor = 'rgb(128, 255, 64)';
    }
}
