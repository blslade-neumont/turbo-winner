import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, MouseButton, GameScene, GameObjectOptions} from "engine";
import { ColorRectangleObject } from '../objects/color-rectangle';

type ChangeButtonOptions = GameObjectOptions & {
    width?: number,
    height?: number,
    text?: string,
    action: () => void
};

const COLOR_DEFAULT = '#872216';
const COLOR_HOVER = '#FF0D1A';
const OUTLINE_COLOR = '#130000';
const OUTLINE_WIDTH = 2;
const COLOR_TEXT = 'white';
const TEXT_FONT = '24pt Cambria';

export class ButtonObject extends GameObject {
    private hover : boolean;
    
    private _h : number;
    private _w : number;
    
    public action: () => void;
    
    public text: string;
    
    constructor(opts: ChangeButtonOptions) {
        super("ChangeButton", opts);
        this._w = typeof opts.width === 'undefined' ? 50 : opts.width;
        this._h = typeof opts.height === 'undefined' ? 50 : opts.height;
        this.text = opts.text || '';
        this.action = opts.action;
    }
    
    renderImplContext2d(context: CanvasRenderingContext2D) {
        context.fillStyle = this.hover ? COLOR_HOVER : COLOR_DEFAULT;
        context.fillRect(0, 0, this._w, this._h);
        context.lineWidth = OUTLINE_WIDTH;
        context.strokeStyle = OUTLINE_COLOR;
        context.stroke();
        
        context.fillStyle = COLOR_TEXT;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = TEXT_FONT;
        context.fillText(this.text, this._w / 2, this._h / 2);
    }
    
    handleEvent(event : GameEvent){
        if (this.hover && event.type == "mouseButtonPressed" && event.button == MouseButton.Left){
            this.action();
            return true;
        }
        return super.handleEvent(event);
    }
    
    tick(delta : number){
        let mousePosWorld = this.scene.camera!.transformPixelCoordinates(this.game.eventQueue.mousePosition);
        
        this.hover = false;
        if(mousePosWorld[0] >= this.x && mousePosWorld[0] <= this.x + this._w  &&
             mousePosWorld[1] >= this.y && mousePosWorld[1] <= this.y + this._h){
                this.hover = true;
        }
    }
}
