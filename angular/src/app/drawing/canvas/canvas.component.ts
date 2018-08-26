import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Vec2D, NewCanvasDrawingEvent } from '../../interface/canvas.interfaces';
import { DrawingWebrtcService } from '../drawing-webrtc.service';

@Component({
	selector: 'ARTC-canvas',
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, AfterViewInit {

	// TODO input new drawing point from other person
	@Output() newDrawingPoint = new EventEmitter<NewCanvasDrawingEvent>();

	@ViewChild('canvas') canvas;

	private canvasRC: CanvasRenderingContext2D;

	private lastPoint: Vec2D = null;
	private lastPointOtherPerson: Vec2D = null;

	private isDrawing: boolean = false;
	private mouseLeaveWhileDrawing: boolean = false;

	constructor(private drawingWebrtcService: DrawingWebrtcService) { }

	ngOnInit() {

	}

	ngAfterViewInit() {
		this.canvasRC = this.canvas.nativeElement.getContext('2d');

		this.drawingWebrtcService.getIncomminPoints().subscribe((point: NewCanvasDrawingEvent) => {
			this.newDrawPoint(point.newPos.x, point.newPos.y, point.prevPos, true);
		});
	}

	public setIsDrawing(newValue: boolean) {
		this.isDrawing = newValue;
		if (!newValue) {
			this.lastPoint = null;
		}
	}

	public onCanvasMouseDown(event) {
		this.setIsDrawing(true);
		const x = event.pageX - this.canvas.nativeElement.offsetLeft;
		const y = event.pageY - this.canvas.nativeElement.offsetTop;
		this.newDrawPoint(x, y, this.lastPoint);
		event.preventDefault();
	}

	public onCanvasMouseRelease() {
		this.setIsDrawing(false);
	}

	public onCanvasMouseEnter() {

	}

	public onCanvasMouseLeave() {
		this.setIsDrawing(false);
	}

	public onMouseMove(event) {
		if (!this.isDrawing) {
			return;
		}
		const x = event.pageX - this.canvas.nativeElement.offsetLeft;
		const y = event.pageY - this.canvas.nativeElement.offsetTop;
		this.newDrawPoint(x, y, this.lastPoint);
	}

	public onTouchmove(event: TouchEvent ) {
		const touch = event.touches[0];
		const x = touch.pageX - this.canvas.nativeElement.offsetLeft;
		const y = touch.pageY - this.canvas.nativeElement.offsetTop;
		this.newDrawPoint(x, y, this.lastPoint);
	}

	public clear() {
		this.canvasRC.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
	}

	private newDrawPoint(x, y, lastPoint, otherPersonDrawing: boolean = false) {
		const radius = 5;

		this.canvasRC.beginPath();
		this.canvasRC.arc(x, y, radius, 0, 2 * Math.PI);
		this.canvasRC.closePath();
		this.canvasRC.fill();

		if (lastPoint) {
			this.canvasRC.beginPath();
			this.canvasRC.moveTo(lastPoint.x, lastPoint.y);
			this.canvasRC.lineTo(x, y);
			this.canvasRC.lineWidth = radius * 2;
			this.canvasRC.stroke();
		}

		if (!otherPersonDrawing) {
			const points: NewCanvasDrawingEvent = {
				newPos: { x, y },
				prevPos: lastPoint
			};
			this.newDrawingPoint.emit(points); // todo send directly to service?
			this.lastPoint = { x, y };
		}
	}

}
