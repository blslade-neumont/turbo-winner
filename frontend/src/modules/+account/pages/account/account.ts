import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ComponentBase } from 'utils/components';
import { AuthService } from 'services';
import { User } from 'models';

@Component({
    templateUrl: './account.html',
    styleUrls: ['./account.scss']
})
export class AccountComponent extends ComponentBase {
    constructor(
        private auth: AuthService
    ) {
        super();
    }
    
    currentUserObservable: Observable<User | null>;
    
    ngOnInit() {
        super.ngOnInit();
        this.currentUserObservable = this.auth.currentUserObservable;
    }
    
    logIn() {
        this.auth.logIn();
    }
    
    logOut() {
        this.auth.logOut();
    }
}
