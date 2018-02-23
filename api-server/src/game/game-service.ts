import { GameVersion } from './game-version';
import { Game } from './game';
import { Player } from './player';
import { BulletDetailsT, PlayerDetailsT } from './packet-meta';
import { io } from '../sockets';

type Socket = SocketIO.Socket;

export class GameService {
    constructor(
        readonly io: SocketIO.Server
    ) { }
    
    game: Game;
    
    async start() {
        console.log(`Game version: ${GameVersion}`);
        
        this.game = new Game();
        this.game.start();
        
        this.io.on('connection', this.handleSocketConnection.bind(this));
    }
    
    private handleSocketConnection(socket: Socket) {
        console.log(`Client connected: ${socket.id}`);
        socket.emit('game-version', GameVersion);
        
        let game: Game | null = null;
        let player: Player | null = null;
        
        socket.on('join-game', opts => {
            let color = opts.color;
            if (!game) game = this.game;
            if (!player) {
                player = game.createPlayerWithUniqueID(socket);
                player.once('removeFromGame', () => {
                    player = null;
                    game = null;
                });
            }
            if (color) player.color = color;
            game.addPlayer(player);
        });
        
        function beginRemovePlayer() {
            if (game && player) game.beginRemovePlayer(player);
        }
        
        socket.on('leave-game', beginRemovePlayer);
        
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            beginRemovePlayer();
        });
    }
}
