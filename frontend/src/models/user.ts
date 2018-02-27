import { WeakModel } from './weak-model';

export class User extends WeakModel {
    constructor(json: any) {
        super(json);
    }
    
    static fromJson(json: any): User | null {
        if (!json) return null;
        return new User(json);
    }
    
    googleId: string;
    displayName: string;
    nickname: string;
    color: string;
    score: number;
    
    deserialize(json: any) {
        this.googleId = json.googleId;
        this.displayName = json.displayName;
        this.nickname = json.nickname;
        this.color = json.color;
        this.score = json.score;
    }
    serialize(json: any) {
        json.googleId = this.googleId;
        json.displayName = this.displayName;
        json.nickname = this.nickname;
        json.color = this.color;
        json.score = this.score;
    }
}
