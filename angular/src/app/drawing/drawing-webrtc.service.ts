import { Injectable } from '@angular/core';
import { VortexWebRTC } from '../vortex-webrtc/vortexWebRTC';

@Injectable()
export class DrawingWebrtcService {

	myId = null;
	otherId = null;

	wsConnection;
	loggedIn = false;
	vortexWebRTC: VortexWebRTC;

	constructor() { }

	// TODO change to auto connect/login
	connectToSingalingServer(): any {

		this.wsConnection = new WebSocket('ws://localhost:9095/');
		this.wsConnection.onopen = () => {
			// connected
		};
		this.wsConnection.onerror = (error) => {
			console.log('Got error', error);
		};
		this.wsConnection.onmessage = (newMessage) => {
			this.handleNewSocketMessage(newMessage);
			// send message to lib
			this.vortexWebRTC.handleNewSocketMessage(newMessage);
		};

		this.vortexWebRTC = new VortexWebRTC();
		this.vortexWebRTC.addWsConnection(this.wsConnection);

	}

	handleNewSocketMessage(newMessage) {

		const data = JSON.parse(newMessage.data);
		console.log(newMessage);

		// switch (data.type) {
		// 	case 'login':
		// 		this.handleLogin(data.success);
		// 		break;
		// 	default:
		// 		break;
		// }

	}


}
