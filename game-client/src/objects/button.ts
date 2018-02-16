import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, MouseButton, GameScene, GameObjectOptions} from "engine";
import { ColorRectangleObject } from '../objects/color-rectangle';

type ChangeButtonOptions = GameObjectOptions & {
    width?: number,
    height?: number,
    color?: string,
    text?: string,
    action: () => void
};

export class ButtonObject extends GameObject {
    private hover : boolean;
    private color : string;
    
    private _h : number;
    private _w : number;
    
    public action: () => void;
    
    public text: string;
    
    constructor(opts: ChangeButtonOptions) {
        super("ChangeButton", opts);
        this._w = typeof opts.width === 'undefined' ? 50 : opts.width;
        this._h = typeof opts.height === 'undefined' ? 50 : opts.height;
        this.color = opts.color || 'blue';
        this.text = opts.text || '';
        this.action = opts.action;
    }
    
    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            context.fillStyle = this.color;
            context.fillRect(0, 0, this._w, this._h);
            context.lineWidth = 2;
            context.strokeStyle = "#130000";
        }
    }
    
    handleEvent(event : GameEvent){
        if (this.hover && event.type == "mouseButtonPressed" && event.button == MouseButton.Left){
            this.action();
            return true;
        }
        return super.handleEvent(event);
    }
    
    tick(delta : number){
        let  mousePosWorld = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        
        if(mousePosWorld[0] >= this.x && mousePosWorld[0] <= this._w  &&
             mousePosWorld[1] >= this.y && mousePosWorld[1] <= this._h){
                this.hover = true;
        }
        if(this.hover){
            this.color = "#FF0D1A";
        }
        else this.color = "#872216";
    }
}
