import { GameObject,GraphicsAdapter,DefaultGraphicsAdapter, GameEvent } from "engine";

export class ColorOptionObject extends GameObject{

    private color : string = "pink";
    private selected : boolean = false;
    private radius : number = 32;

    constructor(color = "#ff69b4"){
        super("ColorOption");
        this.color = color;
    }

    renderImpl(adapter : GraphicsAdapter){

    }

    getColor(){
        return this.color;
    }

    handleEvent(event : GameEvent){
        this.selected = event.type == "mouseButtonPressed";
    }

    renderOption(context : CanvasRenderingContext2D){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
    }

    renderBorder(context : CanvasRenderingContext2D){
        context.beginPath();
        context.arc(this.x, this.y, this.radius + 4, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
    }
}