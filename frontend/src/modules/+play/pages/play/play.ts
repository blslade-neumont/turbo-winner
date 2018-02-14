import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentBase } from 'utils/components';
import { SocketService } from 'services';

import { TurboWinnerGame } from 'game-client';
import { DefaultGraphicsAdapter } from 'engine';

@Component({
    templateUrl: './play.html',
    styleUrls: ['./play.scss']
})
export class PlayComponent extends ComponentBase {
    constructor(
        private socketService: SocketService
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
        
        this.game = new TurboWinnerGame(this.socketService.io, {
            graphicsAdapter: graphicsAdapter,
            moveCanvas: false
        });
        this.game.start();
    }
    
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this.game) {
            this.game.stop();
            this.game = null;
        }
    }
}
