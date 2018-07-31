import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NewCanvasDrawingEvent } from '../interface/canvas.interfaces';
import { DrawingWebrtcService } from './drawing-webrtc.service';

@Component({
	selector: 'ARTC-drawing',
	templateUrl: './drawing.component.html',
	styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit, AfterViewInit {

	public showCanvas = false;

	constructor(private drawingWebrtcService: DrawingWebrtcService) { }

	ngOnInit() {
		this.drawingWebrtcService.connectToSingalingServer();
		this.showCanvas = true;
	}

	ngAfterViewInit() {

	}

	onNewDrawingPoint(points: NewCanvasDrawingEvent) {
		console.log(points);
	}

}
