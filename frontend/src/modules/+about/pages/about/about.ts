import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ComponentBase } from 'utils/components';

@Component({
    templateUrl: './about.html',
    styleUrls: ['./about.scss']
})
export class AboutComponent extends ComponentBase {
    constructor(
        private http: HttpClient
    ) {
        super();
    }
}
