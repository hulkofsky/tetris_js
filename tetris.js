const canvas = document.getElementById('board');
const context = canvas.getContext("2d");
const linecount = document.getElementById('lines');
const clear = window.getComputedStyle(canvas).getPropertyValue('background-color');
const boardWidth = 10;
const boardHeight = 20;
const squreWidth = 24;
canvas.width = boardWidth * squreWidth;
canvas.height = boardHeight * squreWidth;

let board = [];
for (let row = 0; row < boardHeight; row++) {
	board[row] = [];
	for (let col = 0; col < boardWidth; col++) {
		board[row][col] = "";
	}
}

function newPiece() {
	const p = pieces[parseInt(Math.random() * pieces.length, 10)];
	return new Piece(p[0], p[1]);
}

function drawSquare(x, y) {
	context.fillRect(x * squreWidth, y * squreWidth, squreWidth, squreWidth);
	const ss = context.strokeStyle;
	context.strokeStyle = "#555";
	context.strokeRect(x * squreWidth, y * squreWidth, squreWidth, squreWidth);
	context.strokeStyle = ss;
}

function Piece(patterns, color) {
	this.pattern = patterns[0];
	this.patterns = patterns;
	this.patterni = 0;

	this.color = color;

	this.x = boardWidth/2-parseInt(Math.ceil(this.pattern.length/2), 10);
	this.y = -2;
}

Piece.prototype.rotate = function() {
	let nudge = 0;
	const nextPattern = this.patterns[(this.patterni + 1) % this.patterns.length];

	if (this.collides(0, 0, nextPattern)) {
		// Check kickback
		nudge = this.x > boardWidth / 2 ? -1 : 1;
	}

	if (!this.collides(nudge, 0, nextPattern)) {
		this.undraw();
		this.x += nudge;
		this.patterni = (this.patterni + 1) % this.patterns.length;
		this.pattern = this.patterns[this.patterni];
		this.draw();
	}
};

const WALL = 1;
const BLOCK = 2;
Piece.prototype.collides = function(dx, dy, pat) {
	for (let ix = 0; ix < pat.length; ix++) {
		for (let iy = 0; iy < pat.length; iy++) {
			if (!pat[ix][iy]) {
				continue;
			}

			let x = this.x + ix + dx;
			let y = this.y + iy + dy;
			if (y >= boardHeight || x < 0 || x >= boardWidth) {
				return WALL;
			}
			if (y < 0) {
				continue;
			}
			if (board[y][x] !== "") {
				return BLOCK;
			}
		}
	}

	return 0;
};

Piece.prototype.down = function() {
	if (this.collides(0, 1, this.pattern)) {
		this.lock();
		piece = newPiece();
	} else {
		this.undraw();
		this.y++;
		this.draw();
	}
};

Piece.prototype.moveRight = function() {
	if (!this.collides(1, 0, this.pattern)) {
		this.undraw();
		this.x++;
		this.draw();
	}
};

Piece.prototype.moveLeft = function() {
	if (!this.collides(-1, 0, this.pattern)) {
		this.undraw();
		this.x--;
		this.draw();
	}
};

let lines = 0;
let done = false;
Piece.prototype.lock = function() {
	for (let ix = 0; ix < this.pattern.length; ix++) {
		for (let iy = 0; iy < this.pattern.length; iy++) {
			if (!this.pattern[ix][iy]) {
				continue;
			}

			if (this.y + iy < 0) {
				alert("GG WP!");
				done = true;
				return;
			}
			board[this.y + iy][this.x + ix] = this.color;
		}
	}

	let nlines = 0;
	for (let y = 0; y < boardHeight; y++) {
		let line = true;
		for (let x = 0; x < boardWidth; x++) {
			line = line && board[y][x] !== "";
		}
		if (line) {
			for (let y2 = y; y2 > 1; y2--) {
				for (let x = 0; x < boardWidth; x++) {
					board[y2][x] = board[y2-1][x];
				}
			}
			for (let x = 0; x < boardWidth; x++) {
				board[0][x] = "";
			}
			nlines++;
		}
	}

	if (nlines > 0) {
		lines += nlines;
		drawBoard();
		linecount.textContent = "Lines: " + lines;
	}
};

Piece.prototype.fill = function(color) {
	let fs = context.fillStyle;
	context.fillStyle = color;
	let x = this.x;
	let y = this.y;
	for (let ix = 0; ix < this.pattern.length; ix++) {
		for (let iy = 0; iy < this.pattern.length; iy++) {
			if (this.pattern[ix][iy]) {
				drawSquare(x + ix, y + iy);
			}
		}
	}
	context.fillStyle = fs;
};

Piece.prototype.undraw = function(context) {
	this.fill(clear);
};

Piece.prototype.draw = function(context) {
	this.fill(this.color);
};

const pieces = [
	[figures.I, "cyan"],
	[figures.J, "blue"],
	[figures.L, "orange"],
	[figures.O, "yellow"],
	[figures.S, "green"],
	[figures.T, "purple"],
	[figures.Z, "red"]
];

let piece = null;

let dropStart = Date.now();
let downI = {};
document.body.addEventListener("keydown", function (e) {
	if (downI[e.keyCode] !== null) {
		clearInterval(downI[e.keyCode]);
	}
	key(e.keyCode);
	downI[e.keyCode] = setInterval(key.bind(this, e.keyCode), 200);
}, false);
document.body.addEventListener("keyup", function (e) {
	if (downI[e.keyCode] !== null) {
		clearInterval(downI[e.keyCode]);
	}
	downI[e.keyCode] = null;
}, false);

function key(k) {
	if (done) {
		return;
	}
	if (k == 38) { // Player pressed up
		piece.rotate();
		dropStart = Date.now();
	}
	if (k == 40) { // Player holding down
		piece.down();
	}
	if (k == 37) { // Player holding left
		piece.moveLeft();
		dropStart = Date.now();
	}
	if (k == 39) { // Player holding right
		piece.moveRight();
		dropStart = Date.now();
	}
}

function drawBoard() {
	const fillStyle = context.fillStyle;
	for (let y = 0; y < boardHeight; y++) {
		for (let x = 0; x < boardWidth; x++) {
			context.fillStyle = board[y][x] || clear;
			drawSquare(x, y, squreWidth, squreWidth);
		}
	}
	context.fillStyle = fillStyle;
}

function main() {
	const now = Date.now();
	const delta = now - dropStart;

	if (delta > 500) {
		piece.down();
		dropStart = now;
	}

	if (!done) {
		requestAnimationFrame(main);
	}
}

piece = newPiece();
drawBoard();
linecount.textContent = "Lines: 0";
main();