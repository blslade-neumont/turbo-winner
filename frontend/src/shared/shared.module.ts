import { NgModule, ModuleWithProviders } from '@angular/core';

//Declarations
import { LayoutComponent } from './components/layout/layout';
import { PageHeaderComponent } from './components/page-header/page-header';
import { PageFooterComponent } from './components/page-footer/page-footer';
import { PageNavComponent } from './components/page-nav/page-nav';

import { NgLet } from './directives/ng-let.directive';

import { InspectPipe } from './pipes/inspect.pipe';

//Imports
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from '@angular/router';

const imported_modules = [FormsModule, CommonModule, HttpClientModule, RouterModule];
export const exported_modules = [FormsModule, CommonModule, HttpClientModule];

@NgModule({
    declarations: [
        LayoutComponent, PageHeaderComponent, PageFooterComponent, PageNavComponent,
        
        NgLet,
        
        InspectPipe
    ],
    imports: [
        ...imported_modules
    ],
    exports: [
        LayoutComponent,
        
        NgLet,
        
        InspectPipe,
        
        ...exported_modules
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: SharedModule };
    }
}
