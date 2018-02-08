import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';

//Declarations
import { AppComponent } from './pages/app/app';
import { LayoutComponent } from './pages/layout/layout';
import { HomeComponent } from './pages/home/home';

import { AboutComponent } from './pages/about/about';

import { NotFoundComponent } from './pages/not-found/not-found';

import { PageHeaderComponent } from './components/page-header/page-header';
import { PageFooterComponent } from './components/page-footer/page-footer';
import { PageNavComponent } from './components/page-nav/page-nav';

//Imports
import { ServicesModule } from 'services/services.module';
import { SharedModule } from 'shared/shared.module';
import { BrowserModule } from "@angular/platform-browser";

//Routing
const routerConfig: Routes = [
    {path: '', component: LayoutComponent, children: [
        {path: '', component: HomeComponent, pathMatch: 'full'},
        {path: 'about', component: AboutComponent},
        {path: 'play', loadChildren: '../modules/+play/play.module#PlayModule'},
        {path: '**', component: NotFoundComponent}
    ]}
];

const module_exports = [AppComponent, LayoutComponent, HomeComponent,
                        AboutComponent,
                        NotFoundComponent,
                        
                        PageHeaderComponent, PageFooterComponent, PageNavComponent];

@NgModule({
    declarations: [...module_exports],
    imports: [RouterModule.forRoot(routerConfig), ServicesModule, SharedModule.forRoot(), BrowserModule],
    bootstrap: [AppComponent]
})
export class AppModule {
}
