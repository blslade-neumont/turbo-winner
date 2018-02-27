import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { User } from 'models';

@Injectable()
export class AuthService {
    constructor() {
        this.init();
    }
    
    private init() {
        this.currentUserObservable = this._cuserSubject.asObservable();
        this._cuserSubject.next(null);
    }
    
    logIn() {
        console.log(`Logging in`);
    }
    
    logOut() {
        console.log(`Logging out`);
    }
    
    private _cuserSubject = new ReplaySubject<User | null>(1);
    currentUserObservable: Observable<User | null>;
}
