import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

interface Vec2D {
	x: number;
	y: number;
}

@Component({
	selector: 'ARTC-drawing',
	templateUrl: './drawing.component.html',
	styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit, AfterViewInit {

	@ViewChild('canvas') canvas;

	private canvasRC: CanvasRenderingContext2D;

	private lastPoint: Vec2D = null;

	private isDrawing: boolean = false;
	private mouseLeaveWhileDrawing: boolean = false;

	constructor() { }

	ngOnInit() {

	}

	ngAfterViewInit() {
		this.canvasRC = this.canvas.nativeElement.getContext('2d');
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
		this.newDrawPoint(x, y);
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
		this.newDrawPoint(x, y);
	}

	public onTouchmove(event: TouchEvent ) {
		const touch = event.touches[0];
		const x = touch.pageX - this.canvas.nativeElement.offsetLeft;
		const y = touch.pageY - this.canvas.nativeElement.offsetTop;
		this.newDrawPoint(x, y);
	}

	public clear() {
		this.canvasRC.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
	}

	private newDrawPoint(x, y) {
		const radius = 5;

		this.canvasRC.beginPath();
		this.canvasRC.arc(x, y, radius, 0, 2 * Math.PI);
		this.canvasRC.closePath();
		this.canvasRC.fill();

		if (this.lastPoint) {
			this.canvasRC.beginPath();
			this.canvasRC.moveTo(this.lastPoint.x, this.lastPoint.y);
			this.canvasRC.lineTo(x, y);
			this.canvasRC.lineWidth = radius * 2;
			this.canvasRC.stroke();
		}

		this.lastPoint = {x, y};
	}

}
