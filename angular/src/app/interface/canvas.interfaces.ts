export interface Vec2D {
	x: number;
	y: number;
}

export interface NewCanvasDrawingEvent {
	prevPos: Vec2D;
	newPos: Vec2D;
}
