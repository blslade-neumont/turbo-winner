import { GameObject,GraphicsAdapter,DefaultGraphicsAdapter, GameEvent } from "engine";
import { ColorOptionObject } from "objects/color-option";

export class ColorMenuObject extends GameObject{

    private numOptions : number = 1;
    private radius : number = 32;
    private position : {x: number, y: number} = {x: 0, y: 0};
    private spacing : number = 32;
    //Selected 0 is reserved for none selected
    private selected : number = 0;
    private options : Array<ColorOptionObject>;

    constructor(numOptions = 1, radius = 32, position = {x: 0, y: 0}, spacing = 32 ){
        super("ColorMenuObject");
        this.numOptions = numOptions;
        this.radius = radius;
        this.position = position;
        this.spacing = spacing;
    }

    start(){
        
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            for (let k = 0; k < this.numOptions; k++) {
                this.renderOption(context, "yellow");
                if(k + 1 == this.selected)this.renderBorder(context);
            }
        }
    }

    handleEvent(event : GameEvent){
        if(event.type == "mouseButtonPressed"){
            this.selected = this.determineSelected();
        }
    }

    determineSelected(){
        for (let k = 0; k < this.numOptions; k++) {
            let position = this.getPosition(k);
            let toMouseLen = 0;
            if(this.radius >= toMouseLen){
                
            }
        }
        return 0;
    }

    getPosition(index : number){

        return {x: 0, y: 0};
    }

    renderOption(context : CanvasRenderingContext2D, color : string){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    renderBorder(context : CanvasRenderingContext2D){
        context.fillStyle = "black";
        context.fillRect(-2, -2, 36, 36);
    }
}