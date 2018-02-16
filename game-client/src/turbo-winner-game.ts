import { Game, GameOptions, KeyboardAbstractButtonProvider } from 'engine';
import { StartScene } from './scenes/start.scene';

export type Socket = SocketIOClient.Socket;

export class TurboWinnerGame extends Game {
    constructor(
        readonly io: Socket,
        opts?: GameOptions
    ) {
        super(opts);
        this.initAbstractButtons();
    }
    
    private initAbstractButtons() {
        let kbProvider = new KeyboardAbstractButtonProvider(this.eventQueue);
        
        kbProvider.bindAbstractButton('move-left', 'KeyA', 'ArrowLeft');
        kbProvider.bindAbstractButton('move-right', 'KeyD', 'ArrowRight');
        kbProvider.bindAbstractButton('move-up', 'KeyW', 'ArrowUp');
        kbProvider.bindAbstractButton('move-down', 'KeyS', 'ArrowDown');
        
        kbProvider.bindAbstractButton('submit', 'Enter', 'Space');
        kbProvider.bindAbstractButton('return', 'Escape');
        
        this.eventQueue.addAbstractButtonProvider(kbProvider);
    }
    
    start() {
        super.start();
        this.changeScene(new StartScene());
    }
}
