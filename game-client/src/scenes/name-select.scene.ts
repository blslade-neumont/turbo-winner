import { GameScene, Camera, GameEvent } from 'engine';
import { NameMenuObject } from '../objects/name-menu';
import { ButtonObject } from '../objects/button';
import { TurboWinnerGame } from '../turbo-winner-game';

export class NameSelectScene extends GameScene {
    constructor() {
        super();
    }
    
    private nameMenu: NameMenuObject;
    
    private initialized = false;
    
    private finalizeNameSelection() {
        if (!(this.game instanceof TurboWinnerGame)) throw new Error(`Can't set playerDisplayName on the current game.`);
        this.game.playerDisplayName = this.nameMenu.getName();
        this.game.advanceToGame();
    }
    
    handleEvent(event: GameEvent) {
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
