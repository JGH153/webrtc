import { Component, OnInit } from '@angular/core';

import { WebsocketHandlerService } from './../websocket-handler.service';

@Component({
  selector: 'artc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginId = "";

    constructor(
        private _websocketHandler: WebsocketHandlerService
    ) { }

    ngOnInit() {

        //templateUrlq

        // setTimeout(() => {
        //     this._websocketHandler.setLogin(Math.random().toString());
        // }, 100);

    }

    onLogin(){
        console.log(this.loginId);
        this._websocketHandler.setLogin(this.loginId)
    }

}
