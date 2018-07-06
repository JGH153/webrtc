import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

@Component({
	selector: 'ARTC-drawing',
	templateUrl: './drawing.component.html',
	styleUrls: ['./drawing.component.scss']
})
export class DrawingComponent implements OnInit, AfterViewInit {

	@ViewChild('canvas') canvas;

	constructor() { }

	ngOnInit() {
		
	}

	ngAfterViewInit() {
		console.log(this.canvas.nativeElement);
	}

}
