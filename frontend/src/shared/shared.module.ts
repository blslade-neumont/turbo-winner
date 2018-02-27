import { NgModule, ModuleWithProviders } from '@angular/core';

//Declarations
import { NgLet } from './directives/ng-let.directive';

import { InspectPipe } from './pipes/inspect.pipe';

//Imports
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";

const imported_modules = [FormsModule, CommonModule, HttpClientModule];
export const exported_modules = [FormsModule, CommonModule, HttpClientModule];

@NgModule({
    declarations: [
        NgLet,
        
        InspectPipe
    ],
    imports: [
        ...imported_modules
    ],
    exports: [
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
