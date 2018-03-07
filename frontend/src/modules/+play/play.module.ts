import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Declarations
import { PlayComponent } from './pages/play/play';
import { AuthErrorComponent } from './pages/auth-error/auth-error';

//Imports
import { SharedModule } from 'shared/shared.module';

//Routing
const routerConfig: Routes = [
    {path: '', pathMatch: 'full', component: PlayComponent},
    {path: 'auth-error', component: AuthErrorComponent}
];

@NgModule({
    declarations: [
        PlayComponent, AuthErrorComponent
    ],
    imports: [
        RouterModule.forChild(routerConfig), SharedModule.forRoot()
    ],
    exports: []
})
export class PlayModule {
}
