import { Component } from '@angular/core';
import { ComponentBase } from 'utils/components';

@Component({
    templateUrl: './auth-error.html',
    styleUrls: ['./auth-error.scss']
})
export class AuthErrorComponent extends ComponentBase {
    constructor() {
        super();
    }
}
