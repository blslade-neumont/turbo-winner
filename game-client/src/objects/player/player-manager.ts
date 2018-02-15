import { GameObject, GraphicsAdapter, GameScene, FollowCamera } from 'engine';
import { TurboWinnerGame } from '../../turbo-winner-game';
import { PlayerDetailsT } from './packet-meta';
import { Player } from './player';
import { DummyPlayer } from './dummy-player';
import { LocalPlayer } from './local-player';

export class PlayerManager extends GameObject {
    constructor(private preferredColor: string) {
        super(`PlayerManager`);
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    addToScene(scene: GameScene) {
        super.addToScene(scene);
        this.init();
    }
    
    private localPlayerId: number;
    
    private init() {
        this.io.emit('join-game', {
            color: this.preferredColor
        });
        
        this.io.on('assign-player-id', (pid: number, details: PlayerDetailsT) => {
            if (pid !== this.localPlayerId) {
                if (this.localPlayerId) this.removeLocalPlayer();
                this.createLocalPlayer(pid, details);
            }
            else this.updatePlayer(pid, details);
        });
        
        this.io.on('update-player', (pid: number, details: PlayerDetailsT) => {
            if (pid !== this.localPlayerId) this.updatePlayer(pid, details);
        });
        
        this.io.on('remove-player', (pid: number) => {
            if (pid !== this.localPlayerId) this.removePlayer(pid);
        });
    }
    
    private players = new Map<number, Player>();
    
    private localPlayer: LocalPlayer | null = null;
    private removeLocalPlayer() {
        if (CONFIG.debugLog.playerCreate) console.log(`Removing local player`);
        this.players.delete(this.localPlayerId);
        if (this.localPlayer) this.scene!.removeObject(this.localPlayer!);
        let camera = <FollowCamera>this.scene!.camera;
        camera.follow = <any>null;
        this.localPlayerId = 0;
        this.localPlayer = null;
    }
    private createLocalPlayer(pid: number, details: PlayerDetailsT) {
        if (CONFIG.debugLog.playerCreate) console.log(`Creating local player: ${pid}`);
        this.localPlayerId = pid;
        this.localPlayer = new LocalPlayer(pid);
        this.localPlayer.setDetails(details);
        this.scene!.addObject(this.localPlayer);
        let camera = <FollowCamera>this.scene!.camera!;
        camera.follow = this.localPlayer;
        this.players.set(pid, this.localPlayer);
    }
    
    private updatePlayer(pid: number, details: PlayerDetailsT) {
        if (CONFIG.debugLog.playerUpdate) console.log(`Updating player: ${pid}`);
        let player = this.players.get(pid);
        if (!player) {
            if (CONFIG.debugLog.playerCreate) console.log(`Creating dummy player: ${pid}`);
            player = new DummyPlayer(pid);
            this.players.set(pid, player);
            this.scene!.addObject(player);
        }
        player.setDetails(details);
    }
    
    private removePlayer(pid: number) {
        let player = this.players.get(pid);
        if (player) {
            this.players.delete(pid);
            this.scene!.removeObject(player);
        }
    }
    
    render(adapter: GraphicsAdapter) { ; }
}
