import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthenticatedGuard } from './authentication.guard';

import { WebRtcHandlerService } from './webRtc-handler.service';

import { LoginComponent } from './login/login.component';
import { VideoClientComponent } from './video-client/video-client.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ImageManipulationComponent } from './image-manipulation/image-manipulation.component';
import { DrawingComponent } from './drawing/drawing.component';
import { CanvasComponent } from './drawing/canvas/canvas.component';
import { DrawingWebrtcService } from './drawing/drawing-webrtc.service';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		VideoClientComponent,
		NavbarComponent,
		ImageManipulationComponent,
		DrawingComponent,
		CanvasComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule
	],
	providers: [
		WebRtcHandlerService,
		AuthenticatedGuard,
		DrawingWebrtcService
	],
	bootstrap: [
		AppComponent
	]
})
export class AppModule { }
