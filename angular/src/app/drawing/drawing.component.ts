import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

@Component({
	selector: 'ARTC-drawing',
	templateUrl: './drawing.component.html',
	styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit, AfterViewInit {

	@ViewChild('canvas') canvas;

	private canvasRC: CanvasRenderingContext2D;

	constructor() { }

	ngOnInit() {

	}

	ngAfterViewInit() {

		this.canvasRC = this.canvas.nativeElement.getContext('2d');

		console.log(this.canvasRC);

		// this.canvasRC.beginPath();
		// this.canvasRC.arc(30, 30, 5, 0, 2 * Math.PI);
		// this.canvasRC.closePath();
		// this.canvasRC.fill();

		// this.canvasRC.beginPath();
		// this.canvasRC.arc(60, 60, 5, 0, 2 * Math.PI);
		// this.canvasRC.closePath();
		// this.canvasRC.fill();
		// ctx.dr
	}

	onMouseMove(event) {
		const x = event.pageX - this.canvas.nativeElement.offsetLeft;
		const y = event.pageY - this.canvas.nativeElement.offsetTop;
		// console.log(event, x, y);

		const radius = 5;

		this.canvasRC.beginPath();
		this.canvasRC.arc(x, y, radius, 0, 2 * Math.PI);
		this.canvasRC.closePath();
		this.canvasRC.fill();
	}

}
