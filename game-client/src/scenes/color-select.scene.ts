import { GameScene, Camera, GameEvent } from 'engine';
import { ColorMenuObject } from '../objects/color-menu';
import { ButtonObject } from '../objects/button';
import { TurboWinnerGame } from '../turbo-winner-game';

export class ColorSelectScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private colorMenu : ColorMenuObject;
    
    private finalizeColorSelection() {
        if (!(this.game instanceof TurboWinnerGame)) throw new Error(`Can't set playerColor on the current game.`);
        this.game.playerColor = this.colorMenu.getSelectedColor();
        this.game.advanceToGame();
    }
    
    handleEvent(event: GameEvent) {
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
