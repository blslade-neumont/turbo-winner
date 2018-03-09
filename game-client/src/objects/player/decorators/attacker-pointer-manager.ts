import { GameObject, pointDirection } from 'engine';
import { Player, PLAYER_RADIUS } from '../player';
import { AttackerPointer } from './attacker-pointer';
import { DummyPlayer } from '../';

const INITIAL_POOL_SIZE = 10;

export class AttackerPointerManager extends GameObject {
    private player: Player;
    private attackerPointers: Array<AttackerPointer> = [];
    
    constructor(player: Player) {
        super("AttackerPointer", {renderDepth: -150});
        this.player = player;
        this.initAttackerPointers();
    }
    
    onAddToScene() {
        super.onAddToScene();
        for (let i = 0; i < this.attackerPointers.length; ++i){
            this.scene.addObject(this.attackerPointers[i]);
        }
    }
    
    onRemoveFromScene() {
        super.onRemoveFromScene();
        for (let i = 0; i < this.attackerPointers.length; ++i){
            let attackerPointer = this.attackerPointers[i];
            attackerPointer.scene.removeObject(attackerPointer);
        }
    }
    
    replaceAttackers(newAttackers: Array<{id:number, timer:number}>, dummyPlayers: Array<DummyPlayer>){
        for (let i = 0; i < this.attackerPointers.length; ++i){
            this.attackerPointers[i].disablePointer();
        }
        
        for (let i = 0; i < newAttackers.length; ++i){
            let thisDummy = dummyPlayers.find((value) => value.playerId === newAttackers[i].id);
            if (thisDummy) { this.attackerPointers[i].enablePointer(thisDummy, newAttackers[i].timer); }
        }
    }
    
    removeAttackerPointer(attacker: DummyPlayer){
        let foundIndex = this.attackerPointers.findIndex((value) => {
            return value.isAttacker(attacker);
        });  
        
        if (foundIndex !== -1){
            this.attackerPointers[foundIndex].disablePointer();
        }
    }
    
    addAttackerPointer(attacker: DummyPlayer, timer: number){
        if (!this.tryToActivateDisabledPointer(attacker, timer)){
            this.makeNewPointer(attacker, timer);
        }
    }

    tryToActivateDisabledPointer(attacker: DummyPlayer, timer: number): boolean {
        for (let i = 0; i < this.attackerPointers.length; ++i){
            let attackerPointer = this.attackerPointers[i];
            if (!attackerPointer.isEnabled()){
                attackerPointer.enablePointer(attacker, timer);
                return true;
            }
        }
        
        return false;
    }
    
    makeNewPointer(attacker: DummyPlayer, timer: number){
        let newPointer = new AttackerPointer(this.player);
        this.attackerPointers.push(newPointer);
        newPointer.enablePointer(attacker, timer);
        
        if (this.scene){
            this.scene.addObject(newPointer);
        }
    }
    
    initAttackerPointers(){
        for (let i = 0; i < INITIAL_POOL_SIZE; ++i){
            let newPointer = new AttackerPointer(this.player);
            newPointer.disablePointer();
            this.attackerPointers.push(newPointer);
        }    
    }
    
    render(){
        // DO NOT CALL SUPER ON PURPOSE FOR THIS OBJECT TO PREVENT DRAWING PLACEHOLDER OBJECT
    }
    
    
}
