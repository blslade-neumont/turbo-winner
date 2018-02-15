import { GameVersion } from './game-version';
import { Game } from './game';
import { Player } from './player';

export class GameService {
    constructor(
        readonly io: SocketIO.Server
    ) { }
    
    nextPlayerId: number = 1000;
    game: Game;
    
    async start() {
        console.log(`Game version: ${GameVersion}`);
        
        this.game = new Game();
        
        this.io.on('connection', socket => {
            console.log(`Client connected: ${socket.id}`);
            
            socket.emit('game-version', GameVersion);
            
            let player: Player | null = null;
            socket.on('join-game', opts => {
                let color = opts.color;
                if (!player) player = new Player(this.nextPlayerId++, socket);
                if (color) player.color = color;
                this.game.addPlayer(player);
            });
            
            socket.on('update-player', (pid: number, details: any) => {
                if (!player || player.playerId !== pid) return;
                player.setDetails(details);
            });
            
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
                if (player) {
                    this.game.removePlayer(player);
                    player = null;
                }
            });
        });
    }
}
