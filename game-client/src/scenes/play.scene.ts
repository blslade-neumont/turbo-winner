import { GameScene, FollowCamera, GameEvent, GraphicsAdapter, DefaultGraphicsAdapter } from 'engine';
import { TurboWinnerGame } from '../turbo-winner-game';
import { CustomCursor } from '../objects/custom-cursor';
import { BulletManager } from '../objects/bullet/bullet-manager';
import { NetworkManager } from '../objects/network-manager';
import { PlayerManager } from '../objects/player/player-manager';
import { Tile } from '../objects/tile';
import { StartScene } from './start.scene';
import { Bullet } from "../objects/bullet";
import { Player } from "../objects/player";

export class PlayScene extends GameScene {
    constructor(color : string) {
        super();
        this.playerColor = color;
    }
    
    private initialized = false;
    private playerColor = 'yellow';
    private networkManager: NetworkManager;
    private playerManager: PlayerManager;
    private bulletManager: BulletManager;
    private customCursor: CustomCursor;
    
    getCursor() {
        return ['none'];
    }
    
    get io() {
        return (<TurboWinnerGame>this.game).io;
    }
    
    handleEvent(event: GameEvent) {
        if ((event.type === 'abstractButtonPressed' && event.name === 'return')) {
            this.game.changeScene(new StartScene());
            return true;
        }
        
        return super.handleEvent(event);
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
        
        this.networkManager = new NetworkManager();
        this.addObject(this.networkManager);
        this.playerManager = new PlayerManager(this.networkManager, this.playerColor);
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

    tick(delta: number){
        super.tick(delta);
        this.bulletCollisionCheck(delta);
    }

    localFireBullet(bullet: Bullet): void {
        this.addObject(bullet);
        this.bulletManager.addBullet(bullet);
    }

    bulletCollisionCheck(delta: number): void{
        let bulletRef: Array<Bullet> = this.bulletManager.getBullets();
        let players: Map<number, Player> = this.playerManager.getPlayerMapping();
        for (let i = 0; i < bulletRef.length; ++i){
            let currentBullet: Bullet = bulletRef[i];
            let currentKey = players.keys();
            let next;

            do
            {
                next = currentKey.next();
                let playerID: number = next.value;
                let player: Player|undefined = players.get(playerID);

                if (player && !currentBullet.ignores(playerID)){
                    if (this.circlesCollide(bulletRef[i].getCollisionCircle(), player.getCollisionCircle())) {
                        this.removeObject(currentBullet);
                        console.log("hit");
                        bulletRef.splice(i, 1);
                        --i; // bullet removed from array - index changed
                        continue;
                    }
                }
            } while (!next.done);
        }
    }

    circlesCollide(circleOne: {x: number, y: number, r: number}, circleTwo: {x: number, y: number, r: number}): boolean {
        let diffVector: {x: number, y: number} = {x: circleOne.x - circleTwo.x, y: circleOne.y - circleTwo.y};
        let radiusSum: number = circleOne.r + circleTwo.r;
        return (diffVector.x*diffVector.x+diffVector.y*diffVector.y) < (radiusSum*radiusSum);
    }
}
