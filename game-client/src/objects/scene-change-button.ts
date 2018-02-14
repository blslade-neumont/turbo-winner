import {GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, MouseButton, GameScene} from "engine";
import { ColorRectangleObject } from '../objects/color-rectangle';
export class ChangeButton extends GameObject{

    private hover : boolean;
    private color : string;
    private _h : number;
    private _w : number;
    public newScene : GameScene;

    constructor(position : Int8Array, height : number, width : number){
        super("ChangeButton");
        this.x = position[0];
        this.y = position[1];
        this._h = height;
        this._w = width;
    }

    renderImpl(adapter : GraphicsAdapter){
        if(adapter instanceof DefaultGraphicsAdapter){
            let context = adapter.context!;
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this._w, this._h)
            context.lineWidth = 2;
            context.strokeStyle = "#130000"
        }
    }

    handleEvent(event : GameEvent){
        if (this.hover && event.type == "mouseButtonPressed" && event.button == MouseButton.Left){
            //start the game/go to main game scene
            this.game.changeScene(this.newScene);
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
            this.color = "#FF0D1A"
        }
        else this.color = "#872216";
    }
    
}