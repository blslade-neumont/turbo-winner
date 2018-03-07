import { GameVersion } from './game-version';
import { Game } from './game';
import { Player } from './player';
import { BulletDetailsT, PlayerDetailsT } from './packet-meta';
import { io } from '../sockets';
import { parseAuthToken } from '../util/parse-auth-token';
import { User, Users } from '../models/user';

type Socket = SocketIO.Socket;

type GameJoinOptions = {
    color?: string,
    displayName: string,
    authToken?: string | null
};

export class GameService {
    constructor(
        readonly io: SocketIO.Server
    ) { }
    
    inGameMap = new Map<string, boolean>();
    
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
        
        async function handleJoinGame(this: GameService, opts: GameJoinOptions) {
            let user: User | null = (opts.authToken && parseAuthToken(opts.authToken)) || null;
            if (user) {
                if (this.inGameMap.get(user.googleId)) {
                    socket.send('already-in-game');
                    return;
                }
                this.inGameMap.set(user.googleId, true);
            }
            if (!game) game = this.game;
            if (!player) {
                player = game.createPlayerWithUniqueID(socket);
                player.once('removeFromGame', async () => {
                    if (user) {
                        this.inGameMap.set(user.googleId, false);
                        await Users.update({ googleId: user.googleId }, {
                            $set: {
                                score: player!.score,
                                color: player!.color,
                                nickname: player!.displayName
                            }
                        });
                    }
                    player = null;
                    game = null;
                });
            }
            if (opts.color) player.color = opts.color;
            player.displayName = opts.displayName;
            if (user) {
                user = (await Users.findOne({ googleId: user.googleId }))!;
                player.score = user.score;
                player.googleId = user.googleId;
            }
            game.addPlayer(player);
        }
        socket.on('join-game', handleJoinGame.bind(this));
        
        function beginRemovePlayer(this: GameService) {
            if (game && player) {
                console.log(`${player.socket.id} left the game or disconnected`);
                game.beginRemovePlayer(player);
            }
        }
        socket.on('leave-game', beginRemovePlayer.bind(this));
        socket.on('disconnect', beginRemovePlayer.bind(this));
    }
}
