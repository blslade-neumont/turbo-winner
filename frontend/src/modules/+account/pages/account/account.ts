import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ComponentBase } from 'utils/components';
import { AuthService } from 'services';
import { User } from 'models';
import { colors } from 'dbs';

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
    
    colors = colors;
    
    currentUser: User | null;
    
    private _colorOverride: string | undefined;
    get color(): string | null {
        if (typeof this._colorOverride !== 'undefined') return this._colorOverride;
        return (this.currentUser && this.currentUser.color) || null;
    }
    set color(val: string | null) {
        if (!val) return;
        this._colorOverride = val;
        if (this.currentUser && this.currentUser.color === this._colorOverride) delete this._colorOverride;
    }
    
    private _nicknameOverride: string | undefined;
    get nickname(): string | null {
        if (typeof this._nicknameOverride !== 'undefined') return this._nicknameOverride;
        return (this.currentUser && this.currentUser.nickname) || null;
    }
    set nickname(val: string | null) {
        if (!val) return;
        this._nicknameOverride = val;
        if (this.currentUser && this.currentUser.nickname === this._nicknameOverride) delete this._nicknameOverride;
    }
    
    ngOnInit() {
        super.ngOnInit();
        this.subscriptions.push(this.auth.currentUserObservable.subscribe(cuser => {
            this.currentUser = cuser;
        }));
    }
    
    logIn() {
        this.auth.logIn();
    }
    
    logOut() {
        this.auth.logOut();
    }
}
