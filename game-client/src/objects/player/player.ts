import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera } from "engine";
import { PlayerDetailsT } from './player-meta';
import { isSignificantlyDifferent } from '../../util/is-significantly-different';
import cloneDeep = require('lodash.clonedeep');

export abstract class Player extends GameObject {
    constructor(
        name: string,
        readonly playerId: number
    ) {
        super(name);
    }
    
    public color: string;
    public forward = { x: 1, y: 0 };
    
    renderPlayerCircle(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(0, 0, 48, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    renderPlayerPointer(context: CanvasRenderingContext2D) {
        const lineLength = 64;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(lineLength*this.forward.x, lineLength*this.forward.y);
        context.lineWidth = 5;
        context.strokeStyle = "#003300";
        context.stroke();
    }
    
    renderImpl(adapter: GraphicsAdapter) {
        if (adapter instanceof DefaultGraphicsAdapter) {
            let context = adapter.context;
            if (!context) return;
            this.renderPlayerCircle(context);
            this.renderPlayerPointer(context);
        }
    }
    
    private previousDetails: PlayerDetailsT = <any>{};
    getDetails(force = false): Partial<PlayerDetailsT> | null {
        let currentDetails: PlayerDetailsT = {
            x: this.x,
            y: this.y,
            hspeed: this.hspeed,
            vspeed: this.vspeed,
            color: this.color,
            forward: this.forward
        };
        let details = <Partial<PlayerDetailsT>>cloneDeep(currentDetails);
        if (!force) {
            if (this.previousDetails) {
                if (!isSignificantlyDifferent(details.x!, this.previousDetails.x)) delete details.x;
                if (!isSignificantlyDifferent(details.y!, this.previousDetails.y)) delete details.y;
                if (!isSignificantlyDifferent(details.hspeed!, this.previousDetails.hspeed)) delete details.hspeed;
                if (!isSignificantlyDifferent(details.vspeed!, this.previousDetails.vspeed)) delete details.vspeed;
                if (details.color === this.previousDetails.color) delete details.color;
                if (this.previousDetails.forward &&
                    !isSignificantlyDifferent(details.forward!.x, this.previousDetails.forward.x) &&
                    !isSignificantlyDifferent(details.forward!.y, this.previousDetails.forward.y)
                ) {
                    delete details.forward;
                }
            }
            this.previousDetails = currentDetails;
        }
        if (!Object.keys(details).length) return null;
        return details;
    }
    setDetails(vals: Partial<PlayerDetailsT> | null) {
        if (!vals) return;
        if (typeof vals.x !== 'undefined') this.x = vals.x;
        if (typeof vals.y !== 'undefined') this.y = vals.y;
        if (typeof vals.hspeed !== 'undefined') this.hspeed = vals.hspeed;
        if (typeof vals.vspeed !== 'undefined') this.vspeed = vals.vspeed;
        if (typeof vals.color !== 'undefined') this.color = vals.color;
        if (typeof vals.forward !== 'undefined') this.forward = vals.forward;
    }

    tick(delta: number){
        // framerate-independent friction
        const friction = 3.0;
        let xRatio = 1 / (1 + (delta * friction));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;
        super.tick(delta);
    }
}
