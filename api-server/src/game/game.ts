import { Player } from './player';
import { io } from '../sockets';

type Socket = SocketIO.Socket;

export class Game {
    constructor() {
        this.init();
    }
    
    private init() {
        setInterval(() => {
            let delta = 1 / 30; //CHEAT, we should use an actual delta here
            let players = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
            for (let p of players) {
                p.tick(delta);
            }
            
            for (let p of players) {
                p.networkTick(delta);
            }
        }, 1000 / 30);
    }
    
    players = new Map<number, Player>();
    
    addPlayer(player: Player) {
        let isPreexisting = this.players.get(player.playerId) === player;
        
        if (!isPreexisting) {
            //TODO: assign sensible values to player.x, player.y
        }
        
        //Send initial player state to the new player
        player.socket.emit('assign-player-id', player.playerId, player.getDetails(true));
        
        //Send other players' state to the new player
        let otherPlayers = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        for (let p of otherPlayers) {
            this.sendPlayerUpdate(p, true, player.socket);
        }
        
        if (!isPreexisting) {
            //Send the new player's initial state to the other players
            this.sendPlayerUpdate(player);
        }
        
        //Add the new player to the game world
        this.players.set(player.playerId, player);
        player.game = this;
    }
    removePlayer(player: Player) {
        this.players.delete(player.playerId);
        player.game = null;
        io!.emit('remove-player', player.playerId);
    }
    
    sendPlayerUpdate(player: Player, force = false, socket: Socket | null = null) {
        let detailsPacket = player.getDetails(force);
        if (!detailsPacket) return;
        if (socket) socket.emit('update-player', player.playerId, detailsPacket);
        else io!.emit('update-player', player.playerId, detailsPacket);
    }
}
