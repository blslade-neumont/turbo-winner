import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent } from "engine";

export class ColorMenuObject extends GameObject {
    private radius : number = 32;
    private spacing : number = 64;
    //Selected 0 is reserved for none selected
    private selected : number = 1;
    private colors : Array<string> = [];
    private numExtras : number = 4;
    private defaultStyle : string = "72px Arial";
    private title : string;
    private selectMessage : string;
    
    constructor(radius = 32, position = {x: 0, y: 0}, spacing = 64 ){
        super("ColorMenuObject");
        this.radius = radius;
        this.spacing = spacing;
        this.y = position.y;
        this.x = position.x;
        
        this.colors = ["#800000",
                       "#ff0000",
                       "#ffc0cb", 
                       "#ff7f50", 
                       "#ffa500", 
                       "#a52a2a",
                       "#ffff00", 
                       "#DFFF00", 
                       "#00ff00", 
                       "#008000", 
                       "#00ffff", 
                       "#008080", 
                       "#0000ff", 
                       "#000080", 
                       "#800080", 
                       "#ff00ff", 
                       "#ffffff", 
                       "#808080", 
                       "#000000"];
        
        this.selected = Math.floor(Math.random() * this.colors.length) + 0;
        
        this.title = "Turbo Winner";
        this.selectMessage = "Please select a color:";
    }
    
    getColor(logicIndex : number){
        return this.colors[this.logicIndexToArrayIndex(logicIndex)];
    }
    
    handleEvent(event : GameEvent){
        if(event.type == "mouseButtonPressed"){
            return this.determineSelected();
        }
        if (event.type === 'abstractButtonTyped') {
            if (event.name === 'move-left') {
                this.selected = this.wrapColor(this.selected - 1);
                return true;
            }
            else if (event.name === 'move-right') {
                this.selected = this.wrapColor(this.selected + 1);
                return true;
            }
        }
        return super.handleEvent(event);
    }
    
    getSelectedColor(){
        return this.colors[this.selected];
    }
    
    uglyIndexMath(absoluteLogicIndex: number){
        return 1-(absoluteLogicIndex/(this.numExtras+1));
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        for (let i = 1; i <= this.numExtras; ++i){
            let percent = this.uglyIndexMath(i);
            this.renderOption(context, this.getColor(-i), this.posForObject(-i), percent);
            this.renderBorder(context, 10*percent);
            this.renderOption(context, this.getColor(i), this.posForObject(i), percent);
            this.renderBorder(context, 10*percent);
        }
        
        this.renderOption(context, this.getColor(0), {x: 0, y: 0}, 1);
        this.renderBorder(context, 10);
        
        this.renderText(context, this.defaultStyle, this.title, {x: 0, y: -256});
        this.renderText(context, "48px Arial", this.selectMessage, {x: 0, y: -200});
    }
    
    wrapColor(n : number) {
        let x = Math.floor(this.colors.length);
        let y = Math.floor(n);
        return ((y % x) + x) % x;
    }
    
    logicIndexToArrayIndex(logicIndex: number) : number{
        return this.wrapColor(this.selected + logicIndex);
    }
    
    spacingForObject(logicIndex: number){
        let sum = 0.0;
        let absoluteLogicIndex = Math.abs(logicIndex);
        let sign = Math.sign(logicIndex);
        for (let i = 1; i <= absoluteLogicIndex; ++i){
            sum += this.uglyIndexMath(i);
        }
        return sum * this.spacing * sign;
    }
    
    posForObject(logicIndex: number) : {x: number, y: number} {
        let arrayIndex : number = this.logicIndexToArrayIndex(logicIndex);
        return {x: this.spacingForObject(logicIndex), y: 0};
    }
    
    renderText(context : CanvasRenderingContext2D, fontStyle : string, text : string, position : {x: number, y: number}, color = "black"){
        context.font = fontStyle;
        context.textAlign = "center";
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
    }
    
    renderOption(context : CanvasRenderingContext2D, color : string, position : {x: number, y: number}, radiusMod = 1, alpha = "ff"){
        context.beginPath();
        context.arc(position.x, position.y, this.radius * radiusMod, 0, 2 * Math.PI, false);
        context.fillStyle = color + alpha;
        context.fill();
    }
    
    renderBorder(context : CanvasRenderingContext2D, width : number, alpha = "ff"){
        context.lineWidth = width;
        context.strokeStyle = "#000000" + alpha;
        context.stroke();
    }
    
    determineSelected(){
        let mouseWorldPos = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        let mousePos = {x: mouseWorldPos[0], y: mouseWorldPos[1]};
        for (let i = 1; i <= this.numExtras; ++i){
            let rightPos = this.posForObject(i);
            let leftPos = {x: -rightPos.x, y: -rightPos.y};
            
            if (this.inCircle(leftPos, mousePos, this.uglyIndexMath(i))){
                this.selected = this.wrapColor(this.selected - i);
                return true;
            }
            
            if (this.inCircle(rightPos, mousePos, this.uglyIndexMath(i))){
                this.selected = this.wrapColor(this.selected + i);
                return true;
            }
        }
        
        return false;
    }
    
    inSelectedCircle(){
        let mouseWorldPos = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        let mousePos = {x: mouseWorldPos[0], y: mouseWorldPos[1]};
        return this.inCircle({x: this.x, y: this.y}, mousePos, 1.5);
    }
    
    inCircle(circlePosition : {x: number, y: number}, mouseWorldPos : {x: number, y: number}, radiusMod : number){
        let toMousePos = {x: mouseWorldPos.x - circlePosition.x, y: mouseWorldPos.y - circlePosition.y};
        let radius = this.radius * radiusMod;
        return (radius * radius) > (toMousePos.x * toMousePos.x + toMousePos.y * toMousePos.y);
    }
}
