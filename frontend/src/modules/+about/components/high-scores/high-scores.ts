import { Component } from '@angular/core';
import { ComponentBase } from 'utils/components';

@Component({
    selector: 'high-scores',
    templateUrl: './high-scores.html',
    styleUrls: ['./high-scores.scss']
})
export class HighScoresComponent extends ComponentBase {
    constructor() {
        super();
    }
}
