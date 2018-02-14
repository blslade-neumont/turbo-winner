import { GameObject, GraphicsAdapter, DefaultGraphicsAdapter, GameEvent, Camera } from "engine";
import { Player } from './player';

export class DummyPlayer extends Player {
    constructor(
        playerId: number,
        color: string,
        x: number,
        y: number
    ) {
        super("DummyPlayer", playerId, color, x, y);
    }
}
