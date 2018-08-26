import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NewCanvasDrawingEvent } from '../interface/canvas.interfaces';
import { DrawingWebrtcService } from './drawing-webrtc.service';

@Component({
	selector: 'ARTC-drawing',
	templateUrl: './drawing.component.html',
	styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit, AfterViewInit {

	public showCanvas = false;
	public callTargetId;
	public loading = true;

	constructor(private drawingWebrtcService: DrawingWebrtcService, public ref: ChangeDetectorRef) { }

	ngOnInit() {
		this.drawingWebrtcService.connectToSingalingServer();
		this.showCanvas = true;
	}

	ngAfterViewInit() {
		this.drawingWebrtcService.isConnected().subscribe((isConnected) => {
			this.loading = !isConnected;
			this.ref.detectChanges();
		});
	}

	isConnected() {
		return this.drawingWebrtcService.isConnected();
	}

	onNewDrawingPoint(points: NewCanvasDrawingEvent) {
		this.drawingWebrtcService.sendNewPoints(points);
	}

}
