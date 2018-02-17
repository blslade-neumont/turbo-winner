import { GameObject } from 'engine';

export class NetworkManager extends GameObject {
    constructor() {
        super('NetworkManager', { renderDepth: -2000, renderCamera: 'none' });
    }
    
    messageOpenAmount = 1;
    isConnected = false;
    wasConnected = false;
    
    tick(delta: number) {
        super.tick(delta);
        
        if (this.isConnected) {
            if (!this.wasConnected) this.messageOpenAmount = 0;
            else this.messageOpenAmount = Math.max(0, this.messageOpenAmount - delta);
            this.wasConnected = true;
        }
        else this.messageOpenAmount = Math.min(1, this.messageOpenAmount + delta);
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        (<any>context).filter = 'none';
        if (this.messageOpenAmount === 0) return;
        
        let prevGlobalAlpha = context.globalAlpha;
        try {
            context.globalAlpha = this.messageOpenAmount * prevGlobalAlpha;
            let [wid, hit] = [this.game.canvas!.width, this.game.canvas!.height];
            
            context.fillStyle = 'blue';
            context.font = '24pt Cambria';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            let message = this.wasConnected ? `Connection lost, attempting to reconnect...` : 'Connecting to game server...';
            context.fillText(message, wid / 2, hit / 2);
        }
        finally {
            context.globalAlpha = prevGlobalAlpha;
        }
    }
}
