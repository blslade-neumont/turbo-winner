import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Declarations
import { AboutComponent } from './pages/about/about';

import { AboutTurboWinnerComponent } from './components/about-turbo-winner/about-turbo-winner';
import { HighScoresComponent } from './components/high-scores/high-scores';
import { PlayerThumbnailComponent } from './components/player-thumbnail/player-thumbnail';

//Imports
import { SharedModule } from 'shared/shared.module';

//Routing
const routerConfig: Routes = [
    {path: '', component: AboutComponent}
];

@NgModule({
    declarations: [
        AboutComponent,
        
        AboutTurboWinnerComponent, HighScoresComponent, PlayerThumbnailComponent
    ],
    imports: [
        RouterModule.forChild(routerConfig), SharedModule.forRoot()
    ],
    exports: []
})
export class AboutModule {
}
