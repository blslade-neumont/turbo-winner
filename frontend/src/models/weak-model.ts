

export abstract class WeakModel {
    constructor(json: any) {
        if (json === null) throw new Error(`Can't create a model from null!`);
        this._id = json._id;
        this.deserialize(json);
    }
    
    protected abstract deserialize(json: any): void;
    protected abstract serialize(json: any): void;
    
    private _id: string;
    
    get id(): string {
        return this._id;
    }
    set id(val: string) {
        this._id = val;
    }
    
    toJson(): any {
        return this.toJSON();
    }
    private toJSON(): any {
        let obj: any = {};
        obj._id = this._id;
        this.serialize(obj);
        return obj;
    }
}
