import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subject } from 'rxjs/Subject';
import { debounceTime, filter as rxFilter } from "rxjs/operators";
import { AuthService } from './auth.service';
import ioStatic = require('socket.io-client');

type Socket = SocketIOClient.Socket;

@Injectable()
export class SocketService {
    constructor(
        private auth: AuthService
    ) {
        this.init();
    }
    
    private init() {
        this._io = ioStatic(CONFIG.websocketUrl, {
            transports: ['websocket']
        });
        
        this.io.on('game-version', (version: string) => {
            console.log(`Version: ${version}`);
        });
    }
    
    private _io: Socket;
    get io() {
        return this._io;
    }
    
    streamEvent(event: string): Observable<any>;
    streamEvent(event: string, filter: (val: any) => boolean): Observable<any>;
    public streamEvent(event: string, filter?: (val: any) => boolean) {
        let observable = new Observable((subscriber) => {
            this.io.on(event, (...args: any[]) => {
                subscriber.next([...args]);
            });
        });
        if (filter) observable = observable.pipe(rxFilter(filter));
        return observable;
    }
}
