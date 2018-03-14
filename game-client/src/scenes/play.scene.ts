import { GameScene, FollowCamera, GameEvent, GraphicsAdapter, DefaultGraphicsAdapter, pointDistance } from 'engine';
import { TurboWinnerGame } from '../turbo-winner-game';
import { CustomCursor } from '../objects/custom-cursor';
import { BulletManager } from '../objects/bullet/bullet-manager';
import { NetworkManager } from '../objects/network-manager';
import { PlayerManager } from '../objects/player/player-manager';
import { Flower } from '../objects/flower';
import { Bullet } from '../objects/bullet';
import { Player, DummyPlayer } from '../objects/player';

const FLOWER_COUNT = 300;
const MAX_FLOWER_DIST = 50;

export class PlayScene extends GameScene {
    constructor(
        private playerColor: string,
        private displayName: string,
        private authToken: string | null
    ) {
        super();
    }
    
    private initialized = false;
    networkManager: NetworkManager;
    private playerManager: PlayerManager;
    private bulletManager: BulletManager;
    private customCursor: CustomCursor;
    
    getCursor() {
        return ['none'];
    }
    
    getLocalPlayerID(): number {
        return this.playerManager.localPlayerId;
    }
    
    getPlayerByID(id: number): Player | undefined {
        return this.playerManager.getPlayerMapping().get(id);
    }
    
    getDummyPlayers(): DummyPlayer[] {
        return this.playerManager.getDummyPlayers();
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        let camera = this.camera = new FollowCamera(this);
        camera.floorCenterPosition = false;
        camera.maxZoomScale = 96;
        camera.zoomScale = 96; // arbitrary
        camera.clearColor = `#a3b35b`;
        
        for (let i = 0; i < FLOWER_COUNT; ++i) {
            let x: number, y: number;
            do {
                x = ((Math.random() * 2) - 1) * MAX_FLOWER_DIST;
                y = ((Math.random() * 2) - 1) * MAX_FLOWER_DIST;
            }
            while (pointDistance(x, y, 0, 0) > MAX_FLOWER_DIST)
            let obj = new Flower({ x: x, y: y });
            this.addObject(obj);
        }
        
        this.customCursor = new CustomCursor("#b22222");
        this.addObject(this.customCursor);
        
        this.networkManager = new NetworkManager();
        this.addObject(this.networkManager);
        this.playerManager = new PlayerManager(this.networkManager, this.playerColor, this.displayName, this.authToken);
        this.addObject(this.playerManager);
        this.bulletManager = new BulletManager(this.playerManager);
        this.addObject(this.bulletManager);
    }
    
    render(adapter: GraphicsAdapter) {
        if (adapter instanceof DefaultGraphicsAdapter) {
            let openPercent = this.networkManager.messageOpenAmount;
            let context = adapter.context!;
            if (openPercent > 0) {
                let filter = `grayscale(${Math.floor(openPercent * 100)}%)`;// blur(${Math.floor(openPercent * 200) / 100}px)`;
                (<any>context).filter = filter;
            } 
            else (<any>context).filter = 'none';
        }
        
        super.render(adapter);
    }
    
    localFireBullet(bullet: Bullet): void {
        this.addObject(bullet);
        this.bulletManager.addBullet(bullet);
    }
}
