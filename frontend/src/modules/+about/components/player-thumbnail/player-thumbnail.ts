import { Component, Input } from '@angular/core';
import { ComponentBase } from 'utils/components';

@Component({
    selector: 'player-thumbnail',
    templateUrl: './player-thumbnail.html',
    styleUrls: ['./player-thumbnail.scss']
})
export class PlayerThumbnailComponent extends ComponentBase {
    constructor() {
        super();
    }
    
    @Input() color: string = 'white';
}
