import { GameVersion } from './game-version';

export class GameService {
    constructor(
        readonly io: SocketIO.Server
    ) { }
    
    async start() {
        this.io.on('connection', socket => {
            socket.emit('game-version', GameVersion);
        });
        
        setInterval(() => {
            this.io.emit('time', new Date().valueOf());
        }, 1000);
    }
}
