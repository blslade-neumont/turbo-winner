import { Component } from '@angular/core';
import { ComponentBase } from 'utils/components';

const DELAY_MILLIS = 1000;

@Component({
    templateUrl: './home.html',
    styleUrls: ['./home.scss']
})
export class HomeComponent extends ComponentBase {
    constructor() {
        super();
    }
}
