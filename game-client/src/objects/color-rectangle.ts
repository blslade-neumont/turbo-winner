import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter} from "engine";
export class ColorRectangleObject extends GameObject{
    constructor(){
        super("ColorRectangle");
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            context.fillStyle = "green";
            context.fillRect(0, 0, 32, 32);
        }
    }

    tick(delta: number){
        super.tick(delta);
        this.x += delta * 50;
    }
}