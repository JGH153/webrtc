import { Injectable } from '@angular/core';
import { VortexWebRTC } from '../vortex-webrtc/vortexWebRTC';
import { MatchDataPacket } from '../vortex-webrtc/models';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { NewCanvasDrawingEvent } from '../interface/canvas.interfaces';

const POINTS_TYPE = 'points';

@Injectable({
	providedIn: 'root'
})
export class DrawingWebrtcService {

	myId = null;
	otherId = null;
	matchUserId = null;

	wsConnection;
	loggedIn = false;
	vortexWebRTC: VortexWebRTC;

	isCaller: boolean = false;

	private connected = new BehaviorSubject<boolean>(false);
	private incomminPoints = new Subject<NewCanvasDrawingEvent>();

	constructor() { }

	// TODO change to auto connect/login
	connectToSingalingServer(): any {

		this.wsConnection = new WebSocket('ws://localhost:9065/');
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

		// consider moving
		this.vortexWebRTC.getUnhandledJsonDataPackets().subscribe((next) => {
			if (next.type === POINTS_TYPE) {
				this.onIncommingPoints(next.data as NewCanvasDrawingEvent);
			} else {
				console.warn('unknown type');
			}
		});

		this.vortexWebRTC.getWebRtcConnectedChange().subscribe((isConnected) => {
			console.log('isConnected: ', isConnected);
			this.connected.next(isConnected);
		});
	}

	isConnected() {
		return this.connected.asObservable();
	}

	getIncomminPoints() {
		return this.incomminPoints.asObservable();
	}

	handleNewSocketMessage(newMessage) {

		const data = JSON.parse(newMessage.data);

		switch (data.type) {
			case 'match':
				this.handleMatchMessage(data as MatchDataPacket);
				break;
			default:
				break;
		}

	}

	handleMatchMessage(data: MatchDataPacket) {
		this.vortexWebRTC.setLoginId(data.yourUserId, true);

		this.vortexWebRTC.initWebRTC({ video: false, audio: false }).subscribe((next) => {

			this.vortexWebRTC.getIncommingMessagesObservable().subscribe(newMessages => {
				console.log('newMessages!', newMessages);
			});

			if (data.matchId) {
				console.log('calling other user ', data.matchId);
				this.matchUserId = data.matchId;
				this.vortexWebRTC.callUser(data.matchId);
				this.isCaller = true;
			} else {
				console.log('no match, waiting');
			}
		});


	}

	sendNewPoints(points: NewCanvasDrawingEvent) {
		this.vortexWebRTC.sendCustomJsonDataOverDataChannel({
			data: points,
			type: POINTS_TYPE
		});
	}

	onIncommingPoints(newPoint: NewCanvasDrawingEvent) {
		this.incomminPoints.next(newPoint);
	}

}
