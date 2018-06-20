import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { WebRtcHandlerService } from '../webRtc-handler.service';

import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'artc-video-client',
  templateUrl: './video-client.component.html',
  styleUrls: ['./video-client.component.scss']
})
export class VideoClientComponent implements OnInit {

    ownStream = null;
    otherStream = null;
    callTargetId = "b";
    connected = false; //DEBUG set back to false
    chatInputMessage = "";
    myUsername = "";
    sendFilesInput;
    downloadProgress = 0;
    files = [];

    localMessages;

    constructor(
      private _websocketHandler: WebRtcHandlerService,
      public ref: ChangeDetectorRef,
      private sanitizer:DomSanitizer
    ) { }

    ngOnInit() {

        this.myUsername = this._websocketHandler.loginId;

        this._websocketHandler.setupOwnVideostreamAndPeerConnection().subscribe((stream => {

			if (stream) {
				this.ownStream = stream;
			}

            //TODO SUB TO NEW messages
            setTimeout(() => {

                this._websocketHandler.getIncommingMessagesObservable().subscribe(next => {
                    if(next.type == 'chat'){
                        this.handleNewMessages();
                    }else if(next.type == 'file'){
                        console.log("New file!");
                        let fileName = next.data.fileName;
                        let hrefObject = URL.createObjectURL(next.data.fileBlob)
                        console.log(fileName);
                        this.files.push({
                            href: hrefObject,
                            name: fileName
                        });
                        console.log(this.files)
                        this.ref.detectChanges();
                    }else{
                        console.log("unknown type: " + next.type)
                    }

                })

            }, 0);

        }))

        this._websocketHandler.getNewIncommingVideoStreamSubject().subscribe(next => {
            this.handleSetStream(next);
        })

        this._websocketHandler.getFileTransferProgressSubject().subscribe(next => {
            // console.log("NEXT!" + next)
            this.downloadProgress = Math.floor(next*100);
            this.ref.detectChanges();
		});
		
		this._websocketHandler.getWebRtcConnectedChange().subscribe(next => {
			this.connected = next;
			this.ref.detectChanges();
		})



    }

    handleNewMessages(){
        this.localMessages = this._websocketHandler.getLocalChatMessages();
        this.ref.detectChanges();
    }

    handleSetStream(next){
        this.otherStream = next;
        //need to manually trigger check
        this.ref.detectChanges();
    }

    callUser(){
        this._websocketHandler.callUser(this.callTargetId);
    }

    sendMessage(){
        if(this._websocketHandler.isConnected()){
            this._websocketHandler.sendChatMessageDataChannel(this.chatInputMessage);
            this.handleNewMessages();
            this.chatInputMessage = "";
            this.ref.detectChanges();
        }
    }

    hangUp(){
        this._websocketHandler.hangUp();
    }

    someFilesSelected(event){

        this.downloadProgress = 0;
        let file = event.target.files[0];

        this._websocketHandler.sendFile(file);

    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

}
