

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
    
    x = 0;
    y = 0;
    hspeed = 0;
    vspeed = 0;
    forward = { x: 1, y: 0 };
    color = chooseRandomColor();
    
    tick(delta: number) {
        this.x += this.hspeed * delta;
        this.y += this.vspeed * delta;
    }
    
    getDetails(): any {
        return {
            x: this.x,
            y: this.y,
            hspeed: this.hspeed,
            vspeed: this.vspeed,
            color: this.color,
            forward: this.forward
        };
    }
    setDetails(details: any) {
        this.x = details.x;
        this.y = details.y;
        this.hspeed = details.hspeed;
        this.vspeed = details.vspeed;
        this.color = details.color;
        this.forward = details.forward;
    }
}
