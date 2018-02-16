import { Player } from './player';
import { io } from '../sockets';
import { PlayerDetailsT } from './packet-meta';

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

        //Values used to put new Player within a certain radius of something
            //Change the minDist and maxDist to change how far or how close they will spawn to desired point (desired point is 0.0 right now)
        let minDist = 10;
        let maxDist = 1000;
        let radius = Math.floor(Math.random() * 1000) + 10;
        let theta = Math.floor(Math.random() * (Math.PI * 2)) + 0;
        
        if (!isPreexisting) {
            //TODO: assign sensible values to player.x, player.y //Done?

            //make edits to this later if we want to change center location
            player.x = Math.cos(theta) * radius;
            player.y = Math.sin(theta) * radius;
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
    
    
    // randomPlayerStartPostion(details : PlayerDetailsT, maxDistance : number) {
    //     let radius = Math.floor(Math.random() * maxDistance) + 10;
    //     let theta = Math.floor(Math.random() * (Math.PI * 2)) + 0;

    //     details.x = Math.cos(theta) * radius;
    //     details.y = Math.sin(theta) * radius;
    // }

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
