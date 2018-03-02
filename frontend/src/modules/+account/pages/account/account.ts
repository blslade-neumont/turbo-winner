import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { tap, switchMap, debounceTime } from 'rxjs/operators';
import { ComponentBase } from 'utils/components';
import { AuthService } from 'services';
import { User } from 'models';
import { colors } from 'dbs';

const AUTOSAVE_DEBOUNCE_MILLIS = 600;

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
        if (this.color === val) return;
        this._colorOverride = val;
        if (this.currentUser && this.currentUser.color === this._colorOverride) delete this._colorOverride;
        this._autosaveSubject.next(void(0));
    }
    
    private _nicknameOverride: string | undefined;
    get nickname(): string | null {
        if (typeof this._nicknameOverride !== 'undefined') return this._nicknameOverride;
        return (this.currentUser && this.currentUser.nickname) || null;
    }
    set nickname(val: string | null) {
        if (!val) return;
        if (this.nickname === val) return;
        this._nicknameOverride = val;
        if (this.currentUser && this.currentUser.nickname === this._nicknameOverride) delete this._nicknameOverride;
        this._autosaveSubject.next(void(0));
    }
    
    private _autosaveSubject = new Subject<void>();
    isDirty = false;
    isSaving = false;
    wasSaved = false;
    
    ngOnInit() {
        super.ngOnInit();
        
        this.subscriptions.push(this.auth.currentUserObservable.subscribe(cuser => {
            this.currentUser = cuser;
        }));
        
        let autosaveObservable = this._autosaveSubject.pipe(
            tap(() => (this.isDirty = true, this.isSaving = false)),
            debounceTime(AUTOSAVE_DEBOUNCE_MILLIS),
            switchMap(() => {
                this.isDirty = false;
                this.isSaving = true;
                return this.save();
            }),
            tap(() => (this.isSaving = false, this.wasSaved = true))
        );
        this.subscriptions.push(autosaveObservable.subscribe());
    }
    
    save() {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 500);
        });
    }
    
    logIn() {
        this.auth.logIn();
    }
    
    logOut() {
        this.auth.logOut();
    }
}
