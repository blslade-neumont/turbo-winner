import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'utils/components';
import { SocketService, AuthService } from 'services';

import { TurboWinnerGame } from 'game-client';
import { DefaultGraphicsAdapter } from 'engine';

@Component({
    templateUrl: './play.html',
    styleUrls: ['./play.scss']
})
export class PlayComponent extends ComponentBase {
    constructor(
        private socketService: SocketService,
        private auth: AuthService
    ) {
        super();
    }
    
    @ViewChild('gameCanvas') gameCanvasEl: ElementRef;
    
    private game: TurboWinnerGame | null = null;
    
    ngAfterViewInit() {
        super.ngAfterViewInit();
        
        let canvas = <HTMLCanvasElement>this.gameCanvasEl.nativeElement;
        let graphicsAdapter = new DefaultGraphicsAdapter();
        (<any>graphicsAdapter)._canvas = canvas; //HACK HACK
        
        this.subscriptions.push(this.auth.currentUserObservable.pipe(take(1)).subscribe(cuser => {
            let playerColor: string = '';
            let playerDisplayName: string = '';
            if (cuser) {
                playerColor = cuser.color;
                playerDisplayName = cuser.nickname;
            }
            this.game = new TurboWinnerGame(this.socketService.io, {
                graphicsAdapter: graphicsAdapter,
                moveCanvas: false,
                playerColor: playerColor,
                playerDisplayName: playerDisplayName,
                authToken: this.auth.token
            });
            this.game.start();
        }));
    }
    
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.game) {
            this.game.stop();
            this.game = null;
        }
    }
}
