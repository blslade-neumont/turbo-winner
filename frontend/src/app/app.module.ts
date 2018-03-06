import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';

//Declarations
import { AppComponent } from './pages/app/app';
import { LayoutComponent } from './pages/layout/layout';
import { HomeComponent } from './pages/home/home';

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
    {path: 'play', loadChildren: '../modules/+play/play.module#PlayModule'},
    {path: '', component: LayoutComponent, children: [
        {path: '', component: HomeComponent, pathMatch: 'full'},
        {path: 'about', loadChildren: '../modules/+about/about.module#AboutModule'},
        {path: 'account', loadChildren: '../modules/+account/account.module#AccountModule'},
        {path: '**', component: NotFoundComponent}
    ]}
];

@NgModule({
    declarations: [
        AppComponent, LayoutComponent, HomeComponent,
        NotFoundComponent,
        
        PageHeaderComponent, PageFooterComponent, PageNavComponent
    ],
    imports: [RouterModule.forRoot(routerConfig), ServicesModule, SharedModule.forRoot(), BrowserModule],
    bootstrap: [AppComponent]
})
export class AppModule {
}
