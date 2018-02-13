import { GameScene, Camera } from 'engine';

export class PlayScene extends GameScene {
    constructor() {
        super();
    }
    
    private initialized = false;
    
    start() {
        super.start();
        
        if (this.initialized) return;
        this.initialized = true;
        
        let camera = this.camera = new Camera(this);
        camera.clearColor = 'black';
    }
    
    private red = 0;
    
    tick(delta: number) {
        super.tick(delta);
        
        this.red += delta * 120;
        let actualRed = Math.abs(Math.floor(this.red % 512) - 256);
        if (this.initialized) this.camera!.clearColor = `rgb(${actualRed}, 0, 0 )`;
    }
}
