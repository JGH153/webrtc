import { Injectable, Inject, EventEmitter } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationExtras } from '@angular/router';

import { WebRtcHandlerService } from './webRtc-handler.service';

import { Observable } from 'rxjs';

// This needs to be Injectable in order to be able to inject other services in the constructor...
@Injectable()
export class AuthenticatedGuard implements CanActivate {

	canActivateEE = new EventEmitter<boolean>();

	constructor(
		private _websocketHandler: WebRtcHandlerService,
		private _router: Router
	) {
		// console.log("online!");
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

		if (this._websocketHandler.loggedIn) {
			return true;
		} else {
			this._router.navigate(['login']);
			return false;
		}

	}

}
