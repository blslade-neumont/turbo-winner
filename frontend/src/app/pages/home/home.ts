import { Component } from '@angular/core';
import { ComponentBase } from 'utils/components';

@Component({
    templateUrl: './home.html',
    styleUrls: ['./home.scss']
})
export class HomeComponent extends ComponentBase {
    constructor() {
        super();
    }
}
