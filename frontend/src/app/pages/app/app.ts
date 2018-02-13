import { Component } from '@angular/core';
import { ComponentBase } from 'utils/components';
import { AuthService, SocketService } from 'services';

@Component({
    selector: 'app',
    templateUrl: './app.html',
    styleUrls: ['./app.scss']
})
export class AppComponent extends ComponentBase {
    constructor(
        auth: AuthService,
        socketService: SocketService
    ) {
        super();
    }
}
