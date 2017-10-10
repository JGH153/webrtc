import { Component, OnInit } from '@angular/core';

import { WebsocketHandlerService } from './websocket-handler.service';

@Component({
    selector: 'ARTC-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
    title = 'ARTC';

    constructor(
        private _websocketHandler: WebsocketHandlerService
    ) { }

    ngOnInit() {
        this._websocketHandler.initialize();
    }
}
