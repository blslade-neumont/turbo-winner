import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentBase } from 'utils/components';

@Component({
    templateUrl: './play.html',
    styleUrls: ['./play.scss']
})
export class PlayComponent extends ComponentBase {
    constructor() {
        super();
    }
}
