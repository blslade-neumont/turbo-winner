import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map, switchMap, startWith, distinctUntilChanged } from 'rxjs/operators';
import { User } from 'models';
import { decodeJwt } from '../utils/decode-jwt';
import { getCookie } from '../utils/get-cookie';
import { setCookie } from '../utils/set-cookie';
import { deleteCookie } from '../utils/delete-cookie';
import areEqual = require('lodash.isequal');

export const AUTH_TOKEN_LOCAL_STORAGE = 'auth-token';
export const AUTH_TOKEN_COOKIE = 'auth-token';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) {
        this.init();
    }
    
    get apiRoot() {
        return CONFIG.websocketUrl;
    }
    
    private init() {
        this._currentToken = new BehaviorSubject<string | null>(this.token);
        window.addEventListener('storage', (e) => {
            let key = e.key!;
            if (key == AUTH_TOKEN_LOCAL_STORAGE) this.sendNextToken();
        });
        
        this.currentTokenObservable.pipe(
            map(token => {
                this.token = token;
                if (!token) return null;
                let userJson = decodeJwt(token);
                if (!userJson) {
                    console.error(`The server sent an invalid auth token. Could not log in.`);
                    this.logOut();
                    return null;
                }
                return User.fromJson(userJson);
            }),
            switchMap(user => this.http.get<Partial<User>>(
                `${this.apiRoot}/current-profile`,
                { headers: { 'Authorization': `Bearer ${this.token}` } }
            ).pipe(
                map(val => User.fromJson(val)),
                startWith(user)
            )),
            distinctUntilChanged(areEqual)
        ).subscribe(this._currentUserSubject);
        this.currentUserObservable = this._currentUserSubject.asObservable();
    }
    
    /**
     * The currently stored token. In most cases, you should use currentTokenObservable instead.
     */
    get token(): string | null {
        return getCookie(AUTH_TOKEN_COOKIE) || localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE) || null;
    }
    /**
     * The currently stored token. In most cases, you should use currentTokenObservable instead.
     */
    set token(tok: string | null) {
        if (tok) {
            localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE, tok);
            setCookie(AUTH_TOKEN_COOKIE, tok);
        }
        else {
            localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE);
            deleteCookie(AUTH_TOKEN_COOKIE);
        }
    }
    
    private _currentToken: Subject<string | null>;
    public get currentTokenObservable(): Observable<string | null> {
        return this._currentToken.asObservable();
    }
    
    private clearToken() {
        if (this.token) {
            this.token = null;
            this.sendNextToken();
        }
    }
    private updateToken(newToken: string | null) {
        if (!newToken) this.clearToken();
        else {
            let prev = this.token;
            this.token = newToken;
            if (prev !== newToken) this.sendNextToken();
        }
    }
    private sendNextToken() {
        this._currentToken.next(this.token);
    }
    
    logIn() {
        this.oauthLogin('google');
    }
    
    public oauthUrl(oauthSource: string) {
        let url = `${CONFIG.websocketUrl}/oauth/${oauthSource}`;
        return url;
    }
    public oauthLogin(oauthSource: string) {
        let width = 400,
            height = 600,
            left = window.screenX + window.innerWidth / 2 - width / 2,
            top = window.screenY + window.innerHeight / 2 - height / 2;
        window.open(this.oauthUrl(oauthSource), 'oauth', `resizeable, width=${width}, height=${height}, left=${left}, top=${top}`);
        return false;
    }
    
    logOut() {
        this.clearToken();
    }
    
    private _currentUserSubject: Subject<User | null> = new BehaviorSubject<User | null>(null);
    currentUserObservable: Observable<User | null>;
}
