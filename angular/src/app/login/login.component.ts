import { Component, OnInit } from '@angular/core';

import { WebRtcHandlerService } from '../webRtc-handler.service';

@Component({
	selector: 'artc-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	loginId = '';

	constructor(
		private _websocketHandler: WebRtcHandlerService
	) { }

	ngOnInit() {

		// for autologin testing
		// setTimeout(() => {
		//     this._websocketHandler.setLogin(Math.random().toString());
		// }, 100);

	}

	onLogin() {
		this._websocketHandler.setLogin(this.loginId);
	}

}
