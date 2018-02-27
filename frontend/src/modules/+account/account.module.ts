import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Declarations
import { AccountComponent } from './pages/account/account';

//Imports
import { SharedModule } from 'shared/shared.module';

//Routing
const routerConfig: Routes = [
    {path: '', component: AccountComponent}
];

@NgModule({
    declarations: [
        AccountComponent
    ],
    imports: [
        RouterModule.forChild(routerConfig), SharedModule.forRoot()
    ],
    exports: [
        AccountComponent
    ]
})
export class AccountModule {
}
