import { GameScene, Camera } from 'engine';

export class StartScene extends GameScene {
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
    
    private blue = 0;
    
    tick(delta: number) {
        super.tick(delta);
        
        this.blue += delta * 120;
        let actualBlue = Math.abs(Math.floor(this.blue % 512) - 256);
        if (this.initialized) this.camera.clearColor = `rgb(0, 0, ${actualBlue})`;
    }
}
