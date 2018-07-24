import { Component, OnInit } from '@angular/core';

import { WebRtcHandlerService } from './webRtc-handler.service';

@Component({
	selector: 'ARTC-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'ARTC';

	constructor(
		private _websocketHandler: WebRtcHandlerService
	) { }

	ngOnInit() {
		this._websocketHandler.initialize();
	}
}
