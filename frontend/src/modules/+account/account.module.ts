import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Declarations
import { AccountComponent } from './pages/account/account';

import { ColorOptionComponent } from './components/color-option/color-option';

//Imports
import { SharedModule } from 'shared/shared.module';

//Routing
const routerConfig: Routes = [
    {path: '', component: AccountComponent}
];

@NgModule({
    declarations: [
        AccountComponent,
        
        ColorOptionComponent
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
