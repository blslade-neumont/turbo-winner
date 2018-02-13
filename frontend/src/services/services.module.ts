import { NgModule } from '@angular/core';

//Providers
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';

@NgModule({
    providers: [
        AuthService,
        SocketService
    ]
})
export class ServicesModule {
}
