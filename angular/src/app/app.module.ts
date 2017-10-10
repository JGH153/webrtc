import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthenticatedGuard }  from './authentication.guard';

import { WebsocketHandlerService } from './websocket-handler.service';

import { LoginComponent } from './login/login.component';
import { VideoClientComponent } from './video-client/video-client.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    VideoClientComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
      WebsocketHandlerService,
      AuthenticatedGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
