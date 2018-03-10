import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ComponentBase } from 'utils/components';
import { AuthService } from 'services';
import { User } from 'models';
import { Result } from 'utils/result';

@Component({
    selector: 'page-nav',
    templateUrl: './page-nav.html',
    styleUrls: ['./page-nav.scss']
})
export class PageNavComponent extends ComponentBase {
    constructor(
        private auth: AuthService
    ) {
        super();
    }
    
    currentUserObservable: Observable<Result<User>>;
    
    ngOnInit() {
        super.ngOnInit();
        this.currentUserObservable = this.auth.currentUserObservable;
    }
}
