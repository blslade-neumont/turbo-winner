import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter} from "engine";
export class Tile extends GameObject{
    constructor(){
        super("Tile");
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            context.fillStyle = "orange";
            context.fillRect(0, 0, 32, 32);
        }
    }

    tick(delta: number){
        super.tick(delta);
    }
}