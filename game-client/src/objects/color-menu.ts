import { GameObject,GraphicsAdapter,DefaultGraphicsAdapter, GameEvent } from "engine";
import { ColorOptionObject } from "objects/color-option";

export class ColorMenuObject extends GameObject{

    private radius : number = 32;
    private spacing : number = 64;
    //Selected 0 is reserved for none selected
    private selected : number = 0;
    private colors : Array<string>;
    private leftPosition : {x: number, y: number};
    private centerPosition : {x: number, y: number};
    private rightPosition : {x: number, y: number};

    constructor(radius = 32, position = {x: 0, y: 0}, spacing = 64 ){
        super("ColorMenuObject");
        this.radius = radius;
        this.spacing = spacing;
        this.y = position.y;
        this.x = position.x;
        this.leftPosition =  {x: -this.spacing, y: 0};
        this.centerPosition =  {x: 0, y: 0};
        this.rightPosition =  {x: this.spacing, y: 0}; 
    }

    start(){

        //for (let k = 0; k < this.numOptions; k++) {
        this.colors.push("red");
        this.colors.push("orange");
        this.colors.push("yellow");
        this.colors.push("green");
        this.colors.push("blue");
        this.colors.push("purple");
        //}

    }

    getColor(index : number){
        return this.colors[index];
    }

    handleEvent(event : GameEvent){
        if(event.type == "mouseButtonPressed"){
            this.selected = this.determineSelected();
            return true;
        }
        if(event.type == "keyPressed"){
            if(event.code == "KeyA"){
                this.selected = this.wrapColor(this.selected - 1);
                return true;
            }
            if(event.code == "KeyD"){
                this.selected = this.wrapColor(this.selected + 1);
                return true;
            }
        }
        return super.handleEvent(event);
    }

    getSelectedColor(){
        return this.colors[this.selected];
    }

    render(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            let leftIndex = this.wrapColor(this.selected - 1);
            let rightIndex = this.wrapColor(this.selected + 1);
            this.renderOption(context, this.getColor(leftIndex), this.leftPosition);
            this.renderOption(context, this.getColor(this.selected), this.centerPosition);
            this.renderBorder(context, this.centerPosition);
            this.renderOption(context, this.getColor(rightIndex), this.rightPosition);
        }
    }

    wrapColor(n : number){
        let x = Math.floor(this.colors.length);
        let y = Math.floor(n);
        return ((y % x) + x) % x;
    }

    renderOption(context : CanvasRenderingContext2D, color : string, position : {x: number, y: number}){
        context.beginPath();
        context.arc(this.x + position.x, this.y + position.y, this.radius, 0, 2 * Math.PI, false);
        
        context.fill();
    }

    renderBorder(context : CanvasRenderingContext2D, position : {x: number, y: number}){
        context.beginPath();
        context.arc(this.x + position.x, this.y + position.y, this.radius + 4, 0, 2 * Math.PI, false);
        context.strokeStyle = "black";
        context.stroke();
    }

    determineSelected(){
        let mouseWorldPos = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        let mousePos = {x: mouseWorldPos[0], y: mouseWorldPos[1]};
        if(this.inCircle(this.leftPosition, mousePos)){
            return this.wrapColor(this.selected -1);
        }
        if(this.inCircle(this.rightPosition, mousePos)){
            return this.wrapColor(this.selected +1);
        }
        return this.selected;
    }

    inCircle(circlePosition : {x: number, y: number}, mouseWorldPos : {x: number, y: number}){
        let toMousePos = {x: mouseWorldPos.x - circlePosition.x, y: mouseWorldPos.y - circlePosition.y};
        return (this.radius * this.radius) > (toMousePos.x * toMousePos.x + toMousePos.y * toMousePos.y);
    }
}