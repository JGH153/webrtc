import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { DataChannelPacket, ChatMessages } from './models';

export class VortexWebRTC {

	public isConnected: boolean = false;

	private wsConnection: WebSocket;
	private authenticated: boolean = false;
	private localVideoStream: MediaStream = null;
	private myRtcConnection;//: RTCPeerConnection;
	private myDataChannel;

	private loginId;
	private otherUserId;
	private chatMessages:ChatMessages[] = [];

	private incommingMessageObservable:Observable<any>; //TODO add interface
	private newIncommingVideoStreamSubject:Subject<any> = new Subject();

	private fileTransferProgressSubject:Subject<number> = new Subject();
	
	private unhandledJsonDataPackets:Subject<DataChannelPacket> = new Subject();

	private incommingFile:boolean = false;
    private incommingFileMetadata = null;
    private incommingFileBuffer = [];
	private incommingFileBufferSize = 0;

	constructor() {

	}

	public addWsConnection(wsConnection: WebSocket) {
		this.wsConnection = wsConnection;
	}

	public getIncommingMessagesObservable(): Observable<any>{
		return this.incommingMessageObservable;
	}
	
	// TODO make sure it is set befor connecting!
	public setLoginId(id) {
		this.loginId = id;
	}

	public handleNewSocketMessage(newMessage){
		const data = JSON.parse(newMessage.data);

		switch(data.type) {
            case "login":
                this.handleLogin(data.success);
				break;

				//when somebody wants to call us
			case "offer":
                this.handleOffer(data.offer, data.name);
				break;
				
				// answer to an offer
			case "answer":
                this.handleAnswer(data.answer);
				break;
				
				 //when a remote peer sends an ice candidate to us
			case "candidate":
				 this.handleCandidate(data.candidate);
				 break;

			case "leave":
                this.handleLeave();
                break;

            default:
                break;
        };
	}

	public hangUp() {
		this.sendMessageToServer({
            type: "leave"
        });
        this.handleLeave();
	}

	public initWebRTC(audioVideoSettings: MediaStreamConstraints) {

		if(!this.authenticated) {
			console.error('Need to be authenticated before initWebRTC');
		}

		if(audioVideoSettings.audio || audioVideoSettings.video) {

			return this.setupGetUserMedia(audioVideoSettings);
			
		} else {
			// ONLY data channel! TODO
		}

	}

	public callUser(callUserWithId) {

		this.otherUserId = callUserWithId;

		this.myRtcConnection.createOffer().then(offer => {
			//console.log("SEND OFFER-------------!!")
			this.sendMessageToServer({
				type: "offer",
				offer: offer
			});

			return this.myRtcConnection.setLocalDescription(offer);
		}).then(() => {

		})

	}

	public getNewIncommingVideoStreamSubject() {
		return this.newIncommingVideoStreamSubject;
	}

	public getUnhandledJsonDataPackets() {
		return this.unhandledJsonDataPackets;
	}

	public sendChatMessageDataChannel(message){
        if(this.myDataChannel){
            //console.log("sending message")
            this.addChatMessage(message, true);
            let sendObject:DataChannelPacket = {
                type: "chat",
                data: message
            };
            this.myDataChannel.send( JSON.stringify(sendObject ));
        }
	}
	
	public getLocalChatMessages(){
        return this.chatMessages;
    }

	public sendFile(file){

		//send headsup about file
        let sendObject:DataChannelPacket = {
            type: "file",
            data: {
                fileName: file.name,
                fileSizeTotal: file.size
            }
        };

        this.myDataChannel.send(JSON.stringify(sendObject));

        this.sendFileChunck(file, 0);

	}

	public getFileTransferProgressSubject(){
        return this.fileTransferProgressSubject;
    }

	private sendFileChunck(file, offset){

        let chunckSize = 16384; //16 kb

        let fileReader = new FileReader();
        fileReader.onload = (event) => {
            // console.log("sending")
            // console.log((<any>event.target).result)
            this.myDataChannel.send((<any>event.target).result);

            this.fileTransferProgressSubject.next(offset / file.size);

            if(file.size > offset + (<any>event.target).result.byteLength){
                //console.log("more to send");
                setTimeout(() => {
                    this.sendFileChunck(file, offset + chunckSize);
                }, 0)
            }else{
                this.myDataChannel.send(1); //100%
                //console.log("all sendt")
            }
        };

        let fileSlice = file.slice(offset, offset + chunckSize);
        fileReader.readAsArrayBuffer(fileSlice);
    }

	private handleLogin(success){
        this.authenticated = true;
	}
	
	//when somebody sends us an offer
	private handleOffer(offer, name) {

        this.otherUserId = name;
        this.myRtcConnection.setRemoteDescription(offer);

        this.myRtcConnection.createAnswer((answer) => {
            this.sendMessageToServer({
                type: "answer",
                answer: answer
            });

            return this.myRtcConnection.setLocalDescription(answer);
        }, (error) => {
            console.log("error:");
            console.log(error)
        }).then(() => {
            // console.log("handleOffer done!")
        }, (error) => {
            console.log("error:");
            console.log(error)
        })

	}

	//when we got an answer from a remote user
    private handleAnswer(answer) {
        this.myRtcConnection.setRemoteDescription(answer);
	}
	
	//when we got an ice candidate from a remote user
	private handleCandidate(candidate) {

        this.myRtcConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {

        })
	}
	
	private handleLeave() {

        this.otherUserId = null;
        this.isConnected = false;
        this.newIncommingVideoStreamSubject.next(null);
        this.myRtcConnection.close();
        this.myRtcConnection = null;

    }

	private setupGetUserMedia(audioVideoSettings: MediaStreamConstraints) {

		return new Observable(observer => {
			navigator.mediaDevices.getUserMedia(audioVideoSettings).then(stream => {

				this.localVideoStream = stream;
				this.setupPeerConnection(this.localVideoStream);
				this.setupDataChannel();
				observer.next(this.localVideoStream);

			},
			error => {
				console.log("can't get media!")
				console.log(error)
				observer.next(null);
			});
		});

	}

	private setupPeerConnection(stream: MediaStream){

        //using Google public stun server
        var configuration = {
            iceServers: [{ urls: "stun:stun2.1.google.com:19302" }]
        };

        this.myRtcConnection = new RTCPeerConnection(configuration);

		// setup stream listening
		stream.getTracks().forEach((currentTrack: MediaStreamTrack) => {
			this.myRtcConnection.addTrack(currentTrack);
		})

        this.myRtcConnection.ontrack = (event) => {
			// can use ps over 0 of more steams/viedos
            this.newIncommingVideoStreamSubject.next(event.streams[0]);
            this.isConnected = true;
        };

        // Setup ice handling
        this.myRtcConnection.onicecandidate = (event) => {
            if (event.candidate) {
                //console.log("onicecandidate")
                this.sendMessageToServer({
                    type: "candidate",
                    candidate: event.candidate
                });
            }
        };

	}
	
	private setupDataChannel(){

		this.incommingMessageObservable = new Observable(observer => {

            this.myRtcConnection.ondatachannel = (event) => {
                let receiveChannel = event.channel;
                receiveChannel.onmessage = (event) => {

					if(event.data instanceof ArrayBuffer || event.data instanceof Blob){
                        //binary data file incomming!
                        if(!this.incommingFile){
                            console.log("Not expecting a file, returning!");
                            return;
                        }

                        if(event.data instanceof ArrayBuffer){
                            let returnValue = this.handleIncommingFileArrayBuffer(event.data);
                            if(returnValue){
                                observer.next(returnValue);
                            }
                        }else if(event.data instanceof Blob){
                            //firefox recives as blob and we need to convert
                            let fileReader = new FileReader();
                            fileReader.onload = (event) => {
                                let returnValue = this.handleIncommingFileArrayBuffer((<any>event.target).result);
                                if(returnValue){
                                    observer.next(returnValue);
                                }
                            };
                            fileReader.readAsArrayBuffer(event.data);
                        }

					}else{
						// TODO TRY CATCH
						let dataObject:DataChannelPacket = JSON.parse(event.data);
						this.handleJsonDataChannelMessage(dataObject, event, observer);
					}

				};
            };

            () => {console.log("unsub!")}
        });

		// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel
		// Reliable(ordered) is now default
		let dataChannelOptions = {
		};

        this.myDataChannel = this.myRtcConnection.createDataChannel("myDataChannel", dataChannelOptions);

	}

	private handleIncommingFileArrayBuffer(arrayBuffer){

        this.incommingFileBuffer.push(arrayBuffer);
        this.incommingFileBufferSize += arrayBuffer.byteLength;

        this.fileTransferProgressSubject.next(this.incommingFileBufferSize / this.incommingFileMetadata.fileSizeTotal);

        if(this.incommingFileBufferSize === this.incommingFileMetadata.fileSizeTotal){
            //console.log("entire file done");
            let recivedFile = new Blob(this.incommingFileBuffer);

            this.incommingFileBuffer = [];
            this.incommingFileBufferSize = 0;

            let newFileObject = {
                fileName: this.incommingFileMetadata.fileName,
                fileBlob: recivedFile
            }

            //TODO add interface
            let nextObject = {
                type: "file",
                data: newFileObject
            }

            this.incommingFile = false;

            return nextObject;

        }

        return null;

    }

	private handleJsonDataChannelMessage(jsonMessage: DataChannelPacket, event, observer) {

		if(jsonMessage.type == 'chat'){
			this.addChatMessage(jsonMessage.data, false);
			let nextObject = {
				type: "chat",
				data: event.data
			}
			observer.next(nextObject)
		}else if(jsonMessage.type == 'file'){

			if(this.incommingFile){
				console.log("File already incomming!");
				return;
			}

			this.incommingFile = true;
			this.incommingFileMetadata  = {
				fileName: jsonMessage.data.fileName,
				fileSizeTotal: jsonMessage.data.fileSizeTotal
			}
			console.log("Ready to recive file!");

		}else{
			console.log("unknown type: " + jsonMessage.type );
			this.unhandledJsonDataPackets.next(jsonMessage);
		}

	}

	private addChatMessage(newMessage, myselfAuthor){

        let author = this.otherUserId;
        if(myselfAuthor){
            author = this.loginId;
        }

        this.chatMessages.push({
            author: author,
            message: newMessage
        });
    }
	
	private sendMessageToServer(message){
        if(!this.wsConnection){
            console.error("WS connection not started");
            return;
        }

        console.log("Sending message to server: ")
        console.log(message)

        //attach the other peer username to our messages
        if (this.otherUserId) {
            message.name = this.otherUserId;
        }

        this.wsConnection.send( JSON.stringify(message) );
    }

}