import { GameVersion } from './game-version';

export class GameService {
    constructor(
        readonly io: SocketIO.Server
    ) { }
    
    async start() {
        console.log(`Game version: ${GameVersion}`);
        
        this.io.on('connection', socket => {
            console.log(`Client connected: ${socket.id}`);
            socket.emit('game-version', GameVersion);
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
        
        setInterval(() => {
            this.io.emit('time', new Date().valueOf());
        }, 1000);
    }
}
