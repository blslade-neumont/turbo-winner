import { Game, GameOptions } from 'engine';
import { StartScene } from './scenes/start.scene';

export type Socket = SocketIOClient.Socket;

export class TurboWinnerGame extends Game {
    constructor(
        readonly io: Socket,
        opts?: GameOptions
    ) {
        super(opts);
    }

    start() {
        super.start();
        this.changeScene(new StartScene());
    }
}
