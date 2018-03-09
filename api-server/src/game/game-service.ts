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
    
    inGameMap = new Map<string, Player | null>();
    
    game: Game;
    
    //TODO: allow multiple games to occur at the same time if there are too many players
    chooseGame() {
        return this.game;
    }
    
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
            //If the auth has changed, ensure the game and player reflect the new auth token
            if (game && player && player.socket !== socket) game = player = null;
            let user: User | null = (opts.authToken && parseAuthToken(opts.authToken)) || null;
            if (user) {
                let userPlayer = this.inGameMap.get(user.googleId)
                if (userPlayer) {
                    if (!userPlayer.isDisconnected) {
                        socket.emit('already-in-game');
                        return;
                    }
                    [game, player] = [userPlayer.game, userPlayer];
                    if (player.socket) player.socket.emit('already-in-game');
                    player.socket = socket;
                }
            }
            else if (player && player.googleId) {
                player.socket = null;
                game = player = null;
            }
            
            //If the socket doesn't have a game and player assigned, create a new player in the default game
            if (!game) game = this.chooseGame();
            if (!player) {
                player = game.createPlayerWithUniqueID(socket);
                player.once('removeFromGame', async () => {
                    if (!player || player.socket !== socket) return;
                    if (user) {
                        this.inGameMap.set(user.googleId, null);
                        await Users.update({ googleId: user.googleId }, {
                            $set: {
                                score: player.score,
                                color: player.color,
                                nickname: player.displayName
                            }
                        });
                    }
                    player = null;
                    game = null;
                });
            }
            
            //Update the player color and display name in case the client provides new values
            if (opts.color) player.color = opts.color;
            player.displayName = opts.displayName;
            
            //Update the initial player score from the database in case the socket provided an auth token
            if (user) {
                this.inGameMap.set(user.googleId, player);
                user = (await Users.findOne({ googleId: user.googleId }))!;
                if (!user.score || isNaN(user.score)) { player.score = 0; }
                else { player.score = user.score; }
                player.googleId = user.googleId;
            }
            
            //Finally, add the player to the game (even if it was not created as part of these steps)
            game.addPlayer(player);
        }
        socket.on('join-game', handleJoinGame.bind(this));
        
        function beginRemovePlayer(this: GameService) {
            if (game && player) {
                if (player.socket) console.log(`${player.socket.id} left the game or disconnected`);
                game.beginRemovePlayer(player);
            }
        }
        socket.on('leave-game', beginRemovePlayer.bind(this));
        socket.on('disconnect', beginRemovePlayer.bind(this));
    }
}
