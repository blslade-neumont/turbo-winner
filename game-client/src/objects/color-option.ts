import { GameObject,GraphicsAdapter,DefaultGraphicsAdapter, GameEvent } from "engine";

export class ColorOptionObject extends GameObject{

    private color : string = "pink";
    private selected : boolean = false;
    private size : number = 32;

    constructor(color = "#ff69b4", size = 32){
        super("ColorOption");
        this.color = color;
        this.size = size;
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            if(this.selected) this.renderBorder(context);
            this.renderOption(context);
        }
    }

    handleEvent(event : GameEvent){
        this.selected = event.type == "mouseButtonPressed";
    }

    renderOption(context : CanvasRenderingContext2D){
        context.fillStyle = this.color;
        context.fillRect(0, 0, this.size, this.size);
    }

    renderBorder(context : CanvasRenderingContext2D){
        context.fillStyle = "black";
        context.fillRect(-2, -2, 36, 36);
    }
}