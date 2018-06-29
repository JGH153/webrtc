import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'ARTC-image-manipulation',
  templateUrl: './image-manipulation.component.html',
  styleUrls: ['./image-manipulation.component.scss']
})
export class ImageManipulationComponent implements OnInit {

	@ViewChild('canvas') canvas;
	data;
	imageData;
	orginaleImageData;
	ctx;
	edgeThreshold = 100;

	constructor() { }

	ngOnInit() {

		var img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = 'assets/engine.png';
		img.onload = () => {
			this.draw(img);
		};

	}

	draw(img) {
		var canvas = this.canvas.nativeElement;
		this.ctx = canvas.getContext('2d');
		this.ctx.drawImage(img, 0, 0);
		img.style.display = 'none';
		this.imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.data = this.imageData.data;
		this.orginaleImageData = this.imageData;
		console.log('img online', this.data)

	}

	greyscale() {
		console.log("grey");
		for (var i = 0; i < this.data.length; i += 4) {
			var avg = (this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3;
			this.data[i]     = avg; // red
			this.data[i + 1] = avg; // green
			this.data[i + 2] = avg; // blue
		  }
		  this.ctx.putImageData(this.imageData, 0, 0);
	}

	invert() {
		console.log("invert");
		for (var i = 0; i < this.data.length; i += 4) {
			this.data[i]     = 255 - this.data[i];     // red
			this.data[i + 1] = 255 - this.data[i + 1]; // green
			this.data[i + 2] = 255 - this.data[i + 2]; // blue
		}
		this.ctx.putImageData(this.imageData, 0, 0);
	}

	getPixelDataPoint(x, y, data) {

	}

	pixelateImage() {
		const dataCopy = this.data.slice(0);
		for (var i = 0; i < this.data.length; i += (4 * 2)) {
			let targetPixelIndex = i - 4;
			if(i < 0) {
				continue;
			}
			this.data[i]     = dataCopy[targetPixelIndex];     // red
			this.data[i + 1] = dataCopy[targetPixelIndex + 1]; // green
			this.data[i + 2] = dataCopy[targetPixelIndex + 2]; // blue
			// this.data[i + 3] = 100; // alpha
		}
		this.ctx.putImageData(this.imageData, 0, 0);
	}

	changeImg() {
		// console.log("changeImg");
		// const change = 100;
		const dataCopy = this.data.slice(0);
		for (var i = 0; i < this.data.length; i += 4) {

			// const x = (i / 4) % this.canvas.nativeElement.width;
			// const y = Math.floor((i / 4) / this.canvas.nativeElement.height);

			const y = Math.floor((i/4) / this.canvas.nativeElement.width);
			const x = (i/4) - (y * this.canvas.nativeElement.width);

			// console.log(x, y);
			const moveFactor = 12;
			let targetPixelIndex = i - (4 * moveFactor);
			targetPixelIndex -= (this.canvas.nativeElement.width * 4) * moveFactor;

			// console.log(this.data[i], targetPixelIndex);

			if(targetPixelIndex < 0) {
				targetPixelIndex += this.data.length	
			}
			
			// https://stackoverflow.com/questions/13660723/get-x-and-y-pixel-coordinates-when-iterating-over-html5-canvas-getimagedata/20445915
			// https://stackoverflow.com/questions/45963306/html5-canvas-how-to-get-adjacent-pixels-position-from-the-linearized-imagedata

			this.data[i]     = dataCopy[targetPixelIndex];     // red
			this.data[i + 1] = dataCopy[targetPixelIndex + 1]; // green
			this.data[i + 2] = dataCopy[targetPixelIndex + 2]; // blue
			// this.data[i + 3] = 100; // alpha
		}
		this.ctx.putImageData(this.imageData, 0, 0);
		// console.log('done');
	}

	onChangeThreshold() {
		console.log('change');
		setTimeout(() => {
			this.edgeDetector();
		});
	}

	edgeDetector() {


		console.log("starting");
		// TODO copy of data
		const dataCopy = this.data.slice(0);
		for (let y = 0; y < this.canvas.nativeElement.height; y ++) {
			for (let x = 0; x < this.canvas.nativeElement.width; x ++) {
				if (this.isPixelAtEdge(dataCopy, x, y)){
					this.setPixelColor(
						this.data, x, y, 255, 255, 255
					);
				} else {
					this.setPixelColor(
						this.data, x, y, 0, 0, 0
					);
				}
			}		
		}

		const imageDataCopy = new ImageData(
			new Uint8ClampedArray(this.orginaleImageData.data),
			this.canvas.nativeElement.width,
			this.canvas.nativeElement.height
		)

		this.ctx.putImageData(this.imageData, 0, 0);
		this.imageData = imageDataCopy;

		

		console.log("ending");
	}

	isPixelAtEdge(data, x, y){
		const greycolor = this.getPixelGreyValue(data, x, y);

		const hEdge = 	this.getPixelGreyValue(data, x-1, y-1) * -1 +
						this.getPixelGreyValue(data, x-1,   y) * -2 +
						this.getPixelGreyValue(data, x-1, y+1) * -1 +
						this.getPixelGreyValue(data, x+1, y-1) *  1 +
						this.getPixelGreyValue(data, x+1,   y) *  2 +
						this.getPixelGreyValue(data, x+1, y+1) *  1;

		const vEdge = 	this.getPixelGreyValue(data, x-1, y-1) * -1 +
						this.getPixelGreyValue(data, x,   y-1) * -2 +
						this.getPixelGreyValue(data, x+1, y-1) * -1 +
						this.getPixelGreyValue(data, x-1, y+1) *  1 +
						this.getPixelGreyValue(data, x,   y+1) *  2 +
						this.getPixelGreyValue(data, x+1, y+1) *  1;

		const edginess = Math.sqrt(hEdge*hEdge + vEdge*vEdge);
		const threshold = this.edgeThreshold;

		return edginess > threshold;
	}

	getPixelGreyValue(data, x, y) {
		const index = (x + (y * this.canvas.nativeElement.width)) * 4;
		const greycolor = (data[index] + data[index + 1] + data[index + 2]) / 3;
		return greycolor;
	}

	getPixelColor(data, x, y) {
		const index = (x + (y * this.canvas.nativeElement.width)) * 4;
		return this.getPixelColorAtIndex(data, index);
	}

	getPixelColorAtIndex(data, index) {
		return {
			"red": data[index],
			"green": data[index + 1],
			"blue": data[index + 2],
			"alpha": data[index + 3],
		}
	}

	setPixelColor(data, x, y, red, green, blue, alpha = 255){
		const index = (x + (y * this.canvas.nativeElement.width)) * 4;
		return this.setPixelColorAtIndex(data, index, red, green, blue, alpha);
	}

	setPixelColorAtIndex(data, index, red, green, blue, alpha = 255){
		data[index] = red; 
		data[index + 1] = green; 
		data[index + 2] = blue; 
		data[index + 3] = alpha; 
	}

}
