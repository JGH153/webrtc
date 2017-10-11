import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { ChatMessages } from './interface/chat-messages.interface';

import 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WebsocketHandlerService {

    loginId = null;
    loggedIn = false;
    otherUserId;
    localVideoStream = null;
    wsConnection;
    myRtcConnection;
    myDataChannel;
    incommingMessageObservable:Observable<string>;
    isConnected = false;

    chatMessages:ChatMessages[] = [];

    newIncommingVideoStreamSubject:Subject<any> = new Subject();

    constructor(
        private _router: Router
    ) {}

    initialize(){
        this.wsConnection = new WebSocket('ws://192.168.8.145:9095/');

        this.wsConnection.onopen = () => {
           console.log("Connected to the signaling server");
        };
        this.wsConnection.onerror = (error) => {
            console.log("Got error", error);
        };
        this.wsConnection.onmessage = (newMessage) => {
            this.handleNewSocketMessage(newMessage)
        }

        console.log("WS init")
    }

    handleNewSocketMessage(newMessage){
        let data = JSON.parse(newMessage.data);
        // console.log("New message from server!");
        // console.log(data)
        //console.log("Got message", newMessage.data);

        switch(data.type) {
            case "login":
                this.handleLogin(data.success);
                break;
                //when somebody wants to call us
            case "offer":
                this.handleOffer(data.offer, data.name);
                break;
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

    //when somebody sends us an offer
    handleOffer(offer, name) {

        if(this.myRtcConnection == null && this.localVideoStream !== null){
            this.setupPeerConnection(this.localVideoStream);
            this.setupDataChannel();
        }else if(this.localVideoStream === null){
            console.log("No local video stream");
            return;
        }

        this.otherUserId = name;
        this.myRtcConnection.setRemoteDescription(new RTCSessionDescription(offer));

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
    handleAnswer(answer) {
        this.myRtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    //when we got an ice candidate from a remote user
    handleCandidate(candidate) {

        this.myRtcConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {

        })
    }

    handleLeave() {

        this.otherUserId = null;
        this.isConnected = false;
        this.newIncommingVideoStreamSubject.next(null);
        this.myRtcConnection.close();
        this.myRtcConnection = null;

    }

    hangUp(){
        this.sendMessageToServer({
            type: "leave"
        });
        this.handleLeave();
    }

    //TODO check if getmedia is supported and provide error
    handleLogin(success){
        if(!success){
            console.log("username taken!");
            return;
        }

        this.loggedIn = true;
        this._router.navigate(['video']);
    }

    setupOwnVideostreamAndPeerConnection(){

        if(!this.loggedIn){
            this._router.navigate(['']);
            return null;
        }

        let returnPromise = new Promise((resolve, reject) => {

            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {

                this.localVideoStream = stream;

                this.setupPeerConnection(this.localVideoStream);
                this.setupDataChannel();

                resolve(true);

            },
            error => {
                console.log("can't get media!")
                console.log(error)
            });

        });

        return returnPromise;

    }

    getNewIncommingVideoStreamSubject(){
        return this.newIncommingVideoStreamSubject;
    }

    setupPeerConnection(stream){

        //using Google public stun server
        var configuration = {
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
        };

        this.myRtcConnection = new RTCPeerConnection(configuration);

        // setup stream listening
        this.myRtcConnection.addStream(stream);

        //when a remote user adds stream to the peer connection, we display it
        //new but only in firefox
        // this.myRtcConnection.ontrack = (event) => {
        //     console.log("incomming stream, need to handle! NEW--->")
        //     console.log(event.stream)
        //     this.newIncommingVideoStreamSubject.next(event.stream[0])
        // };

        //depricated?
        this.myRtcConnection.onaddstream = (event) => {
            //console.log("incomming stream, need to handle!")
            this.newIncommingVideoStreamSubject.next(event.stream);
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

    setupDataChannel(){
        //setup recive data channel
        // this.myRtcConnection.ondatachannel = function(event) {
        //     var receiveChannel = event.channel;
        //     receiveChannel.onmessage = function(event) {
        //         console.log("ondatachannel message:", event.data);
        //         console.log(event);
        //     };
        // };

        this.incommingMessageObservable = new Observable(observer => {

            this.myRtcConnection.ondatachannel = (event) => {
                let receiveChannel = event.channel;
                receiveChannel.onmessage = (event) => {
                    //console.log("ondatachannel message:", event.data);
                    this.addChatMessage(event.data, false);
                    observer.next(event.data)
                };
            };

            () => {console.log("unsub!")}
        });

        let dataChannelOptions = {
            reliable:true
        };

        this.myDataChannel = this.myRtcConnection.createDataChannel("myDataChannel", dataChannelOptions);

        // this.myDataChannel.onerror = function (error) {
        //     console.log("Error:", error);
        // };

        // this.myDataChannel.onmessage = function (event) {
        //     console.log("Got message:", event.data);
        // };
    }

    getIncommingMessagesObservable(): Observable<string>{
        return this.incommingMessageObservable;
    }

    getLocalVideoStream(){
        return this.localVideoStream;
    }

    sendMessageToServer(message){
        if(!this.wsConnection){
            console.error("WS connection not started");
            return;
        }

        // console.log("Sending message to server: ")
        // console.log(message)

        //attach the other peer username to our messages
        if (this.otherUserId) {
            message.name = this.otherUserId;
        }

        this.wsConnection.send( JSON.stringify(message) );
    }

    setLogin(newId){
        if(newId.length > 0){
            this.loginId = newId;
            this.sendMessageToServer({
                type: "login",
                name: this.loginId
            });
        }
    }

    callUser(otherUserId){
        if(otherUserId.length > 0){
            this.otherUserId = otherUserId;

            if(this.myRtcConnection == null && this.localVideoStream !== null){
                this.setupPeerConnection(this.localVideoStream);
                this.setupDataChannel();
            }else if(this.localVideoStream === null){
                console.log("No local video stream");
                return;
            }

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
    }

    sendMessageDataChannel(message){
        if(this.myDataChannel){
            //console.log("sending message")
            this.addChatMessage(message, true);
            this.myDataChannel.send(message);
        }
    }

    addChatMessage(newMessage, myselfAuthor){

        let author = this.otherUserId;
        if(myselfAuthor){
            author = this.loginId;
        }

        this.chatMessages.push({
            author: author,
            message: newMessage
        });
    }

    getLocalChatMessages(){
        return this.chatMessages;
    }

}
