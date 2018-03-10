import { GameObject, GameObjectOptions } from 'engine';

export abstract class Poolable extends GameObject{
    protected enabled: boolean = false;
    
    constructor(name: string, opts: GameObjectOptions|undefined){
        super(name, opts);
    }
    
    public disable(): void{
        this.enabled = false;
        this.onDisable();
    }
    
    protected onDisable():void{
        
    }
    
    public enable(args : any[]): void{
        this.enabled = true;
        this.onEnable(args);
    }
    
    protected onEnable(args : any[]): void{
    }
    
    public abstract canBeFoundBy<T>(object: T): boolean;
    
    public isEnabled(): boolean {
        return this.enabled;
    }
    
}

export class ObjectPooler<T extends Poolable, ARGT> extends GameObject {
    private param: ARGT;
    private pooledObjects: Array<T> = [];

    private getNew() : T {
        return new this.testType(this.param);
    }
    
    constructor(param: ARGT, initialPoolSize: number, private testType: new (value: ARGT) => T) {
        super("ObjectPooler", {renderDepth: -150});
        this.param = param;
        this.initObjects(initialPoolSize);
    }
    
    onAddToScene() {
        super.onAddToScene();
        for (let i = 0; i < this.pooledObjects.length; ++i){
            this.scene.addObject(this.pooledObjects[i]);
        }
    }
    
    onRemoveFromScene() {
        super.onRemoveFromScene();
        for (let i = 0; i < this.pooledObjects.length; ++i){
            let attackerPointer = this.pooledObjects[i];
            attackerPointer.scene.removeObject(attackerPointer);
        }
    }
    
    replacePooledObjects(objectArgs: any[][]): void{
        for (let i = 0; i < this.pooledObjects.length; ++i){
            this.pooledObjects[i].disable();
        }
        
        for (let i = 0; i < objectArgs.length; ++i){
            this.add(objectArgs[i]);
        }
        
    }
    
    removeObject(object: T){
        let foundIndex = this.pooledObjects.findIndex((value) => {
            return value.canBeFoundBy(value);
        });  
        
        if (foundIndex !== -1){
            this.pooledObjects[foundIndex].disable();
        }
    }
    
    add(args : any[]){
        if (!this.tryToActivateDisabledObject(args)){
            this.makeNewObject(args);
        }
    }

    private tryToActivateDisabledObject(args : any[]): boolean {
        for (let i = 0; i < this.pooledObjects.length; ++i){
            let testObject = this.pooledObjects[i];
            if (!testObject.isEnabled()){
                testObject.enable(args);
                return true;
            }
        }
        
        return false;
    }
    
    private makeNewObject(args : any[]){
        let newObject = this.getNew();
        this.pooledObjects.push(newObject);
        newObject.enable(args);
        
        if (this.scene){
            this.scene.addObject(newObject);
        }
    }
    
    initObjects(initialPoolSize: number): void{
        for (let i = 0; i < initialPoolSize; ++i){
            let newObj = this.getNew();
            newObj.disable();
            this.pooledObjects.push(newObj);
        }    
    }
    
    render(){
        // DO NOT CALL SUPER ON PURPOSE FOR THIS OBJECT TO PREVENT DRAWING PLACEHOLDER OBJECT
    }
    
    
}
