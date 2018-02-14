import { Player } from './player';
import { io } from '../sockets';

type Socket = SocketIO.Socket;

export class Game {
    constructor() {
        this.init();
    }
    
    private init() {
        setInterval(() => {
            let delta = 1 / 10; //CHEAT, we should use an actual delta here
            let pids = Array.from(this.players.keys());
            for (let pid of pids) {
                let p = this.players.get(pid)!;
                p.tick(delta);
                this.sendPlayerUpdate(p);
            }
        }, 1000 / 10);
    }
    
    players = new Map<number, Player>();
    
    addPlayer(player: Player) {
        player.socket.emit('assign-player-id', player.playerId, player.getDetails());
        let pids = Array.from(this.players.keys());
        for (let pid of pids) {
            let p = this.players.get(pid)!;
            this.sendPlayerUpdate(p, player.socket);
        }
        this.sendPlayerUpdate(player);
        this.players.set(player.playerId, player);
    }
    removePlayer(player: Player) {
        this.players.delete(player.playerId);
        io!.emit('remove-player', player.playerId);
    }
    
    sendPlayerUpdate(player: Player, socket: Socket | null = null) {
        if (socket) socket.emit('update-player', player.playerId, player.getDetails());
        else io!.emit('update-player', player.playerId, player.getDetails());
    }
}
