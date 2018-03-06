import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent } from 'engine';

const MAX_LENGTH = 16;

export class NameMenuObject extends GameObject {
    constructor(){
        super("NameMenuObject", { renderDepth: -300 });
    }
    
    private nameConstruct = "";
    
    getName(): string{
        return this.nameConstruct;
    }
    
    handleEvent(event: GameEvent){
        if(event.type === "keyTyped"){
            if(event.key === "Backspace" && this.nameConstruct !== ""){
                this.nameConstruct = this.nameConstruct.substring(0, this.nameConstruct.length - 1);
                return true;
            }else if((this.charInRange(event.key, "a", "z") || this.charInRange(event.key, "A", "Z")) &&
                     this.nameConstruct.length < MAX_LENGTH){
                this.nameConstruct += event.key;
                return true;
            }
        }
        
        return super.handleEvent(event);
    }
    
    charInRange(key: string, lowerBound: string, higherBound: string){
        if(key.length !== 1) return false;
        return (key.charCodeAt(0) >= lowerBound.charCodeAt(0)) && (key.charCodeAt(0) <= higherBound.charCodeAt(0));
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        this.renderBackground(context);
        this.renderText(context, "72px Arial", "Please Enter Name:", {x: 0, y: -120});
        this.renderText(context, "72px Arial", this.nameConstruct, {x: 0, y: 0});
    }
    
    renderBackground(context: CanvasRenderingContext2D){
        const WIDTH = 700;
        const HEIGHT = 150;
        const LEFT = -WIDTH/2;
        const TOP = -HEIGHT/2;
        
        context.fillStyle = "white";
        context.fillRect(LEFT, TOP, WIDTH, HEIGHT);
        
        context.lineWidth = 5;
        context.strokeStyle = "black";
        context.strokeRect(LEFT, TOP, WIDTH, HEIGHT);
    }
    
    renderText(context : CanvasRenderingContext2D, fontStyle : string, text : string, position : {x: number, y: number}, color = "black"){
        context.font = fontStyle;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = color;
        context.fillText(text, position.x, position.y);
    }
}
