import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
        socketService: SocketService,
        private router: Router
    ) {
        super();
        (<any>window).router = this.router;
    }
    
    ngOnInit(){
        if (CONFIG.forceHttps && document.location.protocol === 'http:') {
            document.location.href = document.location.href.replace('http:', 'https:');
        }
        super.ngOnInit();
    }
}
