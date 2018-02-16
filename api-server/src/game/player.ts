import { PlayerDetailsT } from './packet-meta';
import cloneDeep = require('lodash.clonedeep');
import { Game } from './game';
import { isSignificantlyDifferent } from '../util/is-significantly-different';

type Socket = SocketIO.Socket;

const COLORS = [
    'red',
    'green',
    'blue',
    'orange',
    'pink',
    'purple',
    'black',
    'white'
];
function chooseRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export class Player {
    constructor(
        readonly playerId: number,
        readonly socket: Socket
    ) { }
    
    public game: Game | null;
    
    x = 0;
    y = 0;
    hspeed = 0;
    vspeed = 0;
    forward = { x: 1, y: 0 };
    color = chooseRandomColor();
    
    tick(delta: number) {
        // framerate-independent friction
        const friction = 3.0;
        let xRatio = 1 / (1 + (delta * friction));
        this.hspeed *= xRatio;
        this.vspeed *= xRatio;

        this.x += this.hspeed * delta;
        this.y += this.vspeed * delta;
    }
    
    timeUntilNextUpdate = 1 / 10;
    timeUntilFullUpdate = 3;
    networkTick(delta: number) {
        if (!this.game) throw new Error(`This player is not attached to a game.`);
        
        this.timeUntilNextUpdate -= delta;
        this.timeUntilFullUpdate -= delta;
        if (this.timeUntilNextUpdate <= 0) {
            this.game.sendPlayerUpdate(this, this.timeUntilFullUpdate <= 0);
            this.timeUntilNextUpdate = 1 / 10;
            if (this.timeUntilFullUpdate <= 0) this.timeUntilFullUpdate = 3;
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
}
