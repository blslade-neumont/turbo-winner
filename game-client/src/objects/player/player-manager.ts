import { GameObject, GraphicsAdapter, GameScene, FollowCamera } from 'engine';
import { TurboWinnerGame } from '../../turbo-winner-game';
import { PlayerDetailsT } from './player-meta';
import { Player } from './player';
import { DummyPlayer } from './dummy-player';
import { LocalPlayer } from './local-player';
import { NetworkManager } from '../network-manager';

export class PlayerManager extends GameObject {
    constructor(
        private networkManager: NetworkManager,
        private preferredColor: string,
        private displayName: string,
        private authToken: string | null
    ) {
        super(`PlayerManager`, { shouldRender: false });
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    private _localPlayerId: number;
    public get localPlayerId() : number {
        return this._localPlayerId;
    }
    
    onSceneEnter() {
        super.onSceneEnter();
        this.setUp();
    }
    private setUp() {
        this.joinGame();
        this.io.on('connect', () => this.joinGame());
        
        this.io.on('disconnect', () => {
            this.networkManager.isConnected = false;
        });
        
        this.io.on('assign-player-id', (pid: number, details: PlayerDetailsT) => {
            this.networkManager.isConnected = true;
            this.clearWorldAndCreateLocalPlayer(pid, details);
        });
        
        this.io.on('update-player', (pid: number, details: Partial<PlayerDetailsT>) => {
            this.updatePlayer(pid, details);
        });
        
        this.io.on('remove-player', (pid: number) => {
            if (pid !== this._localPlayerId) this.removePlayer(pid);
        });
    }
    private joinGame() {
        this.io.emit('join-game', {
            color: this.preferredColor,
            displayName: this.displayName,
            authToken: this.authToken
        });
    }
    
    onSceneExit() {
        super.onSceneExit();
        this.takeDown();
    }
    private takeDown() {
        this.io.emit('leave-game');
    }
    
    private players = new Map<number, Player>();
    getPlayerMapping(): Map<number, Player> {
        return this.players;
    }
    
    private localPlayer: LocalPlayer | null = null;
    private clearWorldAndCreateLocalPlayer(pid: number, details: PlayerDetailsT) {
        //Delete all current players
        let allPlayers = Array.from(this.players.keys()).map(pid => this.players.get(pid)!);
        allPlayers.forEach(player => {
            this.scene!.removeObject(player);
        });
        this.players.clear();
        
        if (CONFIG.debugLog.playerCreate) console.log(`Creating local player: ${pid}`);
        
        //Create new local player
        this._localPlayerId = pid;
        this.localPlayer = new LocalPlayer(pid);
        this.scene!.addObject(this.localPlayer);
        let camera = <FollowCamera>this.scene!.camera!;
        camera.follow = this.localPlayer;
        this.players.set(pid, this.localPlayer);
        
        //Initialize the local player with the correct values (do not sanitize)
        this.updatePlayer(pid, details, false);
    }
    
    private updatePlayer(pid: number, details: Partial<PlayerDetailsT> | null, sanitize = true) {
        if (CONFIG.debugLog.playerUpdate) console.log(`Updating player: ${pid}`);
        let player = this.players.get(pid);
        if (!player) {
            if (CONFIG.debugLog.playerCreate) console.log(`Creating dummy player: ${pid}`);
            player = new DummyPlayer(pid);
            this.players.set(pid, player);
            this.scene!.addObject(player);
        }
        if (sanitize) { details = player.sanitizeDetails(details); }
        player.setDetails(details);
    }
    
    private removePlayer(pid: number) {
        let player = this.players.get(pid);
        if (player) {
            this.players.delete(pid);
            this.scene!.removeObject(player);
        }
    }
    
    getDummyPlayers(): DummyPlayer[] {
        let players = this.game !== null ? Array.from(this.players.keys()).map(pid => this.players.get(pid)!) : [];
        return <DummyPlayer[]>players.filter(p => p.playerId !== this.localPlayerId && p instanceof DummyPlayer);
    }
}
