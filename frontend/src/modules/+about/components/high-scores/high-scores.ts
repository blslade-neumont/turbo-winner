import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { interval as rxjsInterval } from 'rxjs/observable/interval';
import { of as rxjsOf } from 'rxjs/observable/of';
import { map, tap, startWith, switchMap, catchError } from 'rxjs/operators';
import { ComponentBase } from 'utils/components';

export type HighscoreResult = {
    nickname: string,
    color: string,
    score: number
};

const REFRESH_INTERVAL = 10 * 60 * 1000; //10 minutes

@Component({
    selector: 'high-scores',
    templateUrl: './high-scores.html',
    styleUrls: ['./high-scores.scss']
})
export class HighScoresComponent extends ComponentBase {
    constructor(
        private http: HttpClient
    ) {
        super();
    }
    
    get apiRoot() {
        return CONFIG.websocketUrl;
    }
    
    ngOnInit() {
        super.ngOnInit();
        this.resultsObservable = rxjsInterval(REFRESH_INTERVAL).pipe(
            startWith(0),
            tap(() => this.isLoading = true),
            switchMap(() => {
                return this.http.get<HighscoreResult[]>(`${this.apiRoot}/highscores`).pipe(
                    tap(() => this.isLoading = false)
                )
            }),
            catchError(() => (this.isLoading = false, rxjsOf(null))),
            startWith([])
        );
    }
    
    isLoading = false;
    resultsObservable: Observable<HighscoreResult[] | null>;
}
