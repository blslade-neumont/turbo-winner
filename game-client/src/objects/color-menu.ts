import { GameObject,GraphicsAdapter,DefaultGraphicsAdapter, GameEvent } from "engine";

export class ColorMenuObject extends GameObject{

    private radius : number = 32;
    private spacing : number = 64;
    //Selected 0 is reserved for none selected
    private selected : number = 1;
    private colors : Array<string> = [];
    private leftPosition : {x: number, y: number};
    private centerPosition : {x: number, y: number};
    private rightPosition : {x: number, y: number};
    private cycleTimer : number = 1;
    private cycleMax : number = 1;
    private cycleHeld : number = 0.1;
    private defaultStyle : string = "72px Arial";
    private title : string;
    private selectMessage : string;

    constructor(radius = 32, position = {x: 0, y: 0}, spacing = 64 ){
        super("ColorMenuObject");
        this.radius = radius;
        this.spacing = spacing;
        this.y = position.y;
        this.x = position.x;
        this.leftPosition =  {x: -this.spacing, y: 0};
        this.centerPosition =  {x: 0, y: -radius/2};
        this.rightPosition =  {x: this.spacing, y: 0}; 

        this.colors.push("maroon", "red", "pink", "coral", "orange", "brown","yellow", "#DFFF00", "lime", "green", "cyan", "teal", "blue", "navy", "purple", "magenta", "white", "gray", "black");

        this.title = "Turbo Winner";
        this.selectMessage = "Please select a color:";

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
                this.cycleTimer = this.cycleMax;
                return true;
            }
            if(event.code == "KeyD"){
                this.selected = this.wrapColor(this.selected + 1);
                this.cycleTimer = this.cycleMax;
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
            this.renderBorder(context, this.leftPosition, 5);
            this.renderOption(context, this.getColor(this.selected), this.centerPosition, 1.5);
            this.renderBorder(context, this.centerPosition, 10);
            this.renderOption(context, this.getColor(rightIndex), this.rightPosition);
            this.renderBorder(context, this.rightPosition, 5);

            this.renderText(context, this.defaultStyle, this.title, {x: 0, y: -256});
            this.renderText(context, "48px Arial", this.selectMessage, {x: 0, y: -200});
        }
    }

    wrapColor(n : number){
        let x = Math.floor(this.colors.length);
        let y = Math.floor(n);
        return ((y % x) + x) % x;
    }

    renderText(context : CanvasRenderingContext2D, fontStyle : string, text : string, position : {x: number, y: number}, color = "black"){
        context.font = fontStyle;
        context.textAlign = "center";
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
    }

    renderOption(context : CanvasRenderingContext2D, color : string, position : {x: number, y: number}, radiusMod = 1){
        context.beginPath();
        context.arc(this.x + position.x, this.y + position.y, this.radius * radiusMod, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
    }

    renderBorder(context : CanvasRenderingContext2D, position : {x: number, y: number}, width : number){
        context.lineWidth = width;
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

    inSelectedCircle(){
        let mouseWorldPos = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        let mousePos = {x: mouseWorldPos[0], y: mouseWorldPos[1]};
        return this.inCircle(this.centerPosition, mousePos, 1.5);
    }

    inCircle(circlePosition : {x: number, y: number}, mouseWorldPos : {x: number, y: number}, radiusMod = 1){
        let toMousePos = {x: mouseWorldPos.x - circlePosition.x, y: mouseWorldPos.y - circlePosition.y};
        let radius = this.radius * radiusMod;
        return (radius * radius) > (toMousePos.x * toMousePos.x + toMousePos.y * toMousePos.y);
    }

    tick(delta : number){
        let keyboard = this.game.eventQueue;
        this.cycleTimer = this.cycleTimer > 0 ? this.cycleTimer - delta : 0;
        if(keyboard.isKeyDown("KeyA") && this.cycleTimer <= 0){
            this.selected = this.wrapColor(this.selected - 1);
            this.cycleTimer = this.cycleHeld;
        }else if(keyboard.isKeyDown("KeyD") && this.cycleTimer <= 0){
            this.selected = this.wrapColor(this.selected + 1);
            this.cycleTimer = this.cycleHeld;
        }
    }
}