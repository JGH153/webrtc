import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { WebsocketHandlerService } from './../websocket-handler.service';

@Component({
  selector: 'artc-video-client',
  templateUrl: './video-client.component.html',
  styleUrls: ['./video-client.component.scss']
})
export class VideoClientComponent implements OnInit {

    ownStream = null;
    otherStream = null;
    callTargetId = "b";
    connected = false;
    chatInputMessage = "";
    myUsername = "";

    localMessages;

    constructor(
      private _websocketHandler: WebsocketHandlerService,
      public ref: ChangeDetectorRef
    ) { }

    ngOnInit() {

        this.myUsername = this._websocketHandler.loginId;

        this._websocketHandler.setupOwnVideostreamAndPeerConnection().then((stream => {
            this.ownStream = this._websocketHandler.getLocalVideoStream();

            //TODO SUB TO NEW messages
            setTimeout(() => {

                this._websocketHandler.getIncommingMessagesObservable().subscribe(next => {
                    this.handleNewMessages();
                })

            }, 0);

        }))

        this._websocketHandler.getNewIncommingVideoStreamSubject().subscribe(next => {
            this.handleSetStream(next);
        })



    }

    handleNewMessages(){
        this.localMessages = this._websocketHandler.getLocalChatMessages();
        this.ref.detectChanges();
    }

    handleSetStream(next){
        this.otherStream = next;
        this.connected = true;
        //need to manually trigger check
        this.ref.detectChanges();
    }

    callUser(){
        this._websocketHandler.callUser(this.callTargetId);
    }

    sendMessage(){
        if(this._websocketHandler.isConnected){
            this._websocketHandler.sendMessageDataChannel(this.chatInputMessage);
            this.handleNewMessages();
            this.chatInputMessage = "";
            this.ref.detectChanges();
        }

    }

    hangUp(){
        this._websocketHandler.hangUp();
    }

}
