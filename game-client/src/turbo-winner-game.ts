import { Game, GameOptions, KeyboardAbstractButtonProvider } from 'engine';
import { ColorSelectScene } from './scenes/color-select.scene';
import { NameSelectScene } from './scenes/name-select.scene';
import { PlayScene } from './scenes/play.scene';

type Socket = SocketIOClient.Socket;

export type TurboWinnerGameOptions = GameOptions & {
    playerColor?: string,
    playerDisplayName?: string,
    authToken?: string | null
};

export class TurboWinnerGame extends Game {
    constructor(
        readonly io: Socket,
        opts?: TurboWinnerGameOptions
    ) {
        super(opts);
        
        if (opts) {
            if (typeof opts.playerColor !== 'undefined') this.playerColor = opts.playerColor;
            if (typeof opts.playerDisplayName !== 'undefined') this.playerDisplayName = opts.playerDisplayName;
            if (typeof opts.authToken !== 'undefined') this.authToken = opts.authToken;
        }
        
        this.initAbstractButtons();
    }
    
    playerColor: string | null = null;
    playerDisplayName: string | null = null;
    authToken: string | null = null;
    
    private initAbstractButtons() {
        let kbProvider = new KeyboardAbstractButtonProvider(this.eventQueue);
        
        kbProvider.bindAbstractButton('move-left', 'KeyA', 'ArrowLeft');
        kbProvider.bindAbstractButton('move-right', 'KeyD', 'ArrowRight');
        kbProvider.bindAbstractButton('move-up', 'KeyW', 'ArrowUp');
        kbProvider.bindAbstractButton('move-down', 'KeyS', 'ArrowDown');
        
        kbProvider.bindAbstractButton('submit', 'Enter', 'Space');
        kbProvider.bindAbstractButton('alt-submit', 'Enter');
        kbProvider.bindAbstractButton('return', 'Escape');
        
        this.eventQueue.addAbstractButtonProvider(kbProvider);
    }
    
    start() {
        super.start();
        this.advanceToGame();
    }
    
    advanceToGame() {
        if (!this.playerColor) this.changeScene(new ColorSelectScene());
        else if (!this.playerDisplayName) this.changeScene(new NameSelectScene());
        else this.changeScene(new PlayScene(this.playerColor, this.playerDisplayName, this.authToken));
    }
}
