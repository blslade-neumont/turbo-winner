import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Declarations
import { PlayComponent } from './pages/play/play';

//Imports
import { SharedModule } from 'shared/shared.module';

//Routing
const routerConfig: Routes = [
    {path: '', component: PlayComponent}
];

@NgModule({
    declarations: [
        PlayComponent
    ],
    imports: [
        RouterModule.forChild(routerConfig), SharedModule.forRoot()
    ],
    exports: [
        PlayComponent
    ]
})
export class PlayModule {
}
