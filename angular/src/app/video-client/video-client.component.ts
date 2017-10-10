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
    connected = "No"

    constructor(
      private _websocketHandler: WebsocketHandlerService,
      public ref: ChangeDetectorRef
    ) { }

    ngOnInit() {

        //templateUrl
        // setTimeout(() => {
        //     this._websocketHandler.setLogin("a");
        // }, 100);


        this._websocketHandler.setupOwnVideostreamAndPeerConnection().then((stream => {
            this.ownStream = this._websocketHandler.getLocalVideoStream();
            //TODO handle other persions video feed
            console.log("haha");
        }))

        this._websocketHandler.getNewIncommingVideoStreamSubject().subscribe(next => {
            this.handleSetStream(next);
        })

    }

    handleSetStream(next){
        this.otherStream = next;
        this.connected = "Connected";
        //need to manually trigger check
        this.ref.detectChanges();
    }

    callUser(){
        this._websocketHandler.callUser(this.callTargetId);
    }

    hangUp(){

    }

}
