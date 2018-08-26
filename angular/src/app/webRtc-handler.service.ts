
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { ChatMessages } from './interface/chat-messages.interface';
import { DataChannelPacket } from './interface/data-channel-packet.interface';

import { Subject, Observable } from 'rxjs';
import { VortexWebRTC } from './vortex-webrtc/vortexWebRTC';

@Injectable()
export class WebRtcHandlerService {

	loginId = null;
	loggedIn = false;
	otherUserId;
	localVideoStream = null;
	wsConnection;

	chatMessages: ChatMessages[] = [];

	newIncommingVideoStreamSubject: Subject<any> = new Subject();
	fileTransferProgressSubject: Subject<number> = new Subject();

	incommingFile: boolean = false;
	incommingFileMetadata = null;
	incommingFileBuffer = [];
	incommingFileBufferSize = 0;

	vortexWebRTC: VortexWebRTC;

	constructor(
		private _router: Router
	) { }

	initialize() {
		
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

		switch (data.type) {
			case 'login':
				this.handleLogin(data.success);
				break;
			default:
				break;
		}

	}

	hangUp() {
		this.vortexWebRTC.hangUp();
	}

	isConnected() {
		return this.vortexWebRTC.isConnected;
	}

	handleLogin(success) {
		if (!success) {
			console.warn('username taken!');
			return;
		}

		this.loggedIn = true;
		this._router.navigate(['video']);
	}

	setupOwnVideostreamAndPeerConnection() {

		if (!this.loggedIn) {
			this._router.navigate(['']);
			return null;
		}

		// consider moving
		this.vortexWebRTC.getUnhandledJsonDataPackets().subscribe((next) => {
			console.log('TODO getUnhandledJsonDataPackets ', next);
		});

		return this.vortexWebRTC.initWebRTC({ video: true, audio: false }).pipe(
			tap((stream) => {
				this.localVideoStream = stream;
			}));

	}

	getNewIncommingVideoStreamSubject() {
		return this.vortexWebRTC.getNewIncommingVideoStreamSubject();
	}

	getIncommingMessagesObservable(): Observable<any> {
		return this.vortexWebRTC.getIncommingMessagesObservable();
	}

	getLocalVideoStream() {
		return this.localVideoStream;
	}

	// move to class?
	sendMessageToServer(message) {
		if (!this.wsConnection) {
			console.error('WS connection not started');
			return;
		}

		// attach the other peer username to our messages
		if (this.otherUserId) {
			message.name = this.otherUserId;
		}

		this.wsConnection.send(JSON.stringify(message));
	}

	setLogin(newId) {
		if (newId.length > 0) {
			this.loginId = newId;
			this.sendMessageToServer({
				type: 'login',
				name: this.loginId
			});
			this.vortexWebRTC.setLoginId(this.loginId);
		}
	}

	callUser(otherUserId) {
		if (otherUserId.length > 0) {
			this.otherUserId = otherUserId;


			this.vortexWebRTC.callUser(otherUserId);

		}
	}

	sendChatMessageDataChannel(message) {
		this.vortexWebRTC.sendChatMessageDataChannel(message);
	}

	getLocalChatMessages() {
		return this.vortexWebRTC.getLocalChatMessages();
	}

	sendFile(file) {

		this.vortexWebRTC.sendFile(file);

	}

	getFileTransferProgressSubject() {
		return this.vortexWebRTC.getFileTransferProgressSubject();
	}

	getWebRtcConnectedChange() {
		return this.vortexWebRTC.getWebRtcConnectedChange();
	}

}
