import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameObjectOptions } from "engine";

export class Bullet extends GameObject{

    private radius : number = 6;

    constructor(opts?: GameObjectOptions) {
        super("Butllet", opts);
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            context.arc(this.x, this.y, this.radius, 0 , 2 * Math.PI, false);
            context.fillStyle = "#000000";
            context.fill();
        }
    }

}
