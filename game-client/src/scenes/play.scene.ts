import { GameScene, FollowCamera } from 'engine';
import { Player } from '../objects/player/player';
import { LocalPlayer } from '../objects/player/local-player';
import { DummyPlayer } from '../objects/player/dummy-player';
import { CustomCursor } from '../objects/custom-cursor';
import { Tile } from '../objects/tile';
import { TurboWinnerGame } from '../turbo-winner-game';

type PlayerDetailsT = {
    x: number,
    y: number,
    color: string,
    forward: { x: number, y: number },
    hspeed: number,
    vspeed: number
};

export class PlayScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    private playerColorToDoReplaceWithFromColorSelectScene = 'yellow';
    private customCursor: CustomCursor;
    
    private localPlayerId: number;
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        this.customCursor = new CustomCursor("#ff0000")
        this.addObject(this.customCursor);
        
        for (let i = 0; i < 50; ++i){
            let obj = new Tile();
            obj.x = i % 10 * 50;
            obj.y = -250 + i*50;
            this.addObject(obj);
        }
        
        let camera = this.camera = new FollowCamera(this);
        camera.zoomScale = 1; // arbitrary
        camera.clearColor = `rgb(128, 255, 64)`;
        
        this.io.emit('join-game', {
            color: this.playerColorToDoReplaceWithFromColorSelectScene
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
        
        Object.defineProperty(this, "cursor", {get:()=>["none"]});
    }
    
    private players = new Map<number, Player>();
    
    private localPlayer: LocalPlayer | null = null;
    private removeLocalPlayer() {
        this.players.delete(this.localPlayerId);
        if (this.localPlayer) this.removeObject(this.localPlayer!);
        let camera = <FollowCamera>this.camera;
        camera.follow = <any>null;
        this.localPlayerId = 0;
        this.localPlayer = null;
    }
    private createLocalPlayer(pid: number, details: PlayerDetailsT) {
        this.localPlayerId = pid;
        this.localPlayer = new LocalPlayer(pid, details.color, details.x, details.y);
        this.localPlayer.forward = details.forward;
        this.addObject(this.localPlayer);
        let camera = <FollowCamera>this.camera;
        camera.follow = this.localPlayer;
        this.players.set(pid, this.localPlayer);
    }
    
    private updatePlayer(pid: number, details: PlayerDetailsT) {
        let player = this.players.get(pid);
        if (!player) {
            player = new DummyPlayer(pid, details.color, details.x, details.y);
            this.players.set(pid, player);
            this.addObject(player);
        }
        else {
            player.color = details.color;
            [player.x, player.y] = [details.x, details.y];
        }
        player.forward = details.forward;
        [player.hspeed, player.vspeed] = [details.hspeed, details.vspeed];
    }
    
    private removePlayer(pid: number) {
        let player = this.players.get(pid);
        if (player) {
            this.players.delete(pid);
            this.removeObject(player);
        }
    }
}
