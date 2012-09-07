/**
 * app.js
 *
 * @author	 wangshijun <wangshijun2010@gmail.com>
 * @copyright	(c) 2012 wangshijun <wangshijun2010@gmail.com>
 * @package	default
 * @subpackage	default
 */

var points = [];
var isStroke = false;
var canvas = null;
var context = null;
var recognizer = null;

var Point = gesture.Point;
var Template = gesture.Template;

window.addEventListener("load", onload, false);

// Grab the indicator elements
function onload(event) {
	canvas = document.querySelector('#canvas');
	context = canvas.getContext('2d');

	canvas.width = 480;
	canvas.height = 300;

	canvas.addEventListener("mousedown", onmousedown, false);
	canvas.addEventListener("mouseup", onmouseup, false);
	canvas.addEventListener("mousemove", onmousemove, false);

	// console.dir(canvas);
	createRecognizer();
}

// Enter stroke mode when mouse down
function onmousedown(event){
	isStroke = true;
	points = [];

	var event = getEvent(event);
	// context.strokeStyle = 'rgba(0,0,0,0.5)';
	// context.beginPath();
	// context.arc(event._x, event._y, 8, 0, 2*Math.PI);
	// context.stroke();

	context.strokeStyle = 'rgba(255,64,64,0.5)';
	context.lineWidth = 8;
	context.miterLimit = 0.1;
	context.beginPath();
	context.moveTo(event._x, event._y);
}

// Leave stroke mode when mouse up
function onmouseup(event){
	isStroke = false;
	// var results = recognizer.recognize(points);
	// console.log(results);
	// console.log(results[0].template.id);
	points = [];
}

// Track stroke history when mouse move
function onmousemove(event) {
	if (isStroke === true) {
		// console.log(event);
		var event = getEvent(event);
		points.push({x: event.pageX, y: event.pageY});

		context.lineTo(event._x, event._y);
		context.lineCap = "round";
		context.stroke();

		var current = recognizer.recognize(points)[0].template.id;
		var templates = document.querySelectorAll(".template");

		for (var i=0, n=templates.length; i<n; i++) {
			if (templates[i].id == current) {
				templates[i].className = "template current";
			} else {
				templates[i].className = "template";
			}
		}
	}
}

// We need to prevent default when a right mouse click is triggerred
function getEvent(event, preventDefault) {
	var event = event || window.event;
	var preventDefault = preventDefault || false;
	preventDefault && event.preventDefault();

	event._x = (event.offsetX == undefined) ? event.layerX : event.offsetX;
	event._y = (event.offsetY == undefined) ? event.layerY : event.offsetY;

	// event._x = event._x - canvas.offsetLeft;
	// event._y = event._y - canvas.offsetTop;

	return event;
}

// Note: the coordinate system in the browser is different from the mathmatic ones
function createRecognizer() {
	var templates = [
		// Directions
		new Template("south", [new Point(0,0), new Point(0,1)]),
		new Template("north", [new Point(0,1), new Point(0,0)]),
		new Template("east", [new Point(0,0), new Point(1,0)]),
		new Template("west", [new Point(1,0), new Point(0,0)]),
		new Template("south-west", [new Point(0,0), new Point(-1,1)]),
		new Template("south-east", [new Point(0,0), new Point(1,1)]),
		new Template("north-west", [new Point(0,0), new Point(-1,-1)]),
		new Template("north-east", [new Point(0,0), new Point(1,-1)]),

		// Gestures
		new Template("right-down", [new Point(0,0), new Point(1,0), new Point(1,1)]),
		new Template("right-up", [new Point(0,0), new Point(1,0), new Point(1,-1)]),
		new Template("left-down", [new Point(1,0), new Point(0,0), new Point(0,1)]),
		new Template("left-up", [new Point(1,0), new Point(0,0), new Point(0,-1)]),
		new Template("down-left", [new Point(1,0), new Point(1,1), new Point(0,1)]),
		new Template("down-right", [new Point(0,0), new Point(0,1), new Point(1,1)]),
		new Template("up-left", [new Point(0,1), new Point(0,0), new Point(-1,0)]),
		new Template("up-right", [new Point(0,1), new Point(0,0), new Point(1,1)]),
	];

	recognizer = new gesture.Recognizer(templates, 10, false);

	var templates = [
		new Template("south", [new Point(50,15), new Point(50,85)]),
		new Template("north", [new Point(50,85), new Point(50,15)]),
		new Template("east", [new Point(15,50), new Point(85,50)]),
		new Template("west", [new Point(85,50), new Point(15,50)]),
		new Template("south-west", [new Point(85,15), new Point(15, 85)]),
		new Template("south-east", [new Point(15,15), new Point(85,85)]),
		new Template("north-west", [new Point(85,85), new Point(15,15)]),
		new Template("north-east", [new Point(15,85), new Point(85,15)]),

		// Gestures
		new Template("right-down", [new Point(15,15), new Point(85,15), new Point(85,85)]),
		new Template("right-up", [new Point(15,85), new Point(85,85), new Point(85,15)]),
		new Template("left-down", [new Point(85,15), new Point(15,15), new Point(15,85)]),
		new Template("left-up", [new Point(85,85), new Point(15,85), new Point(15,15)]),
		new Template("down-left", [new Point(85,15), new Point(85,85), new Point(15,85)]),
		new Template("down-right", [new Point(15,15), new Point(15,85), new Point(85,85)]),
		new Template("up-left", [new Point(85,85), new Point(85,15), new Point(15,15)]),
		new Template("up-right", [new Point(15,85), new Point(15,15), new Point(85,15)]),
	];
	drawTemplates(templates);

	console.log(recognizer);
}

// Draw templates on small canvas
function drawTemplates(templates) {
	var container = document.querySelector("#templates");
	for (var i=0, n=templates.length; i<n; i++) {
		drawTemplate(container, templates[i]);
	}
}

function drawTemplate(container, template) {
	var canvas = document.createElement("canvas");
	var points = template.points;
	var context = canvas.getContext("2d");

	canvas.className = "template";
	canvas.title = template.id;
	canvas.id = template.id;

	canvas.width = 100;
	canvas.height = 100;

	context.lineWidth = 5;
	context.miterLimit = 0.1;

	context.fond = "Microsoft Yahei";
	context.fillText(template.id, 15, 15);

	context.strokeStyle = 'rgba(0,0,0,0.5)';
	context.beginPath();
	context.arc(points[0].x, points[0].y, 5, 0, 2*Math.PI);
	context.stroke();

	context.strokeStyle = 'rgba(255,64,64,0.5)';
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);

	for (var i=0, n=points.length; i<n; i++) {
		context.lineTo(points[i].x, points[i].y);
		context.lineCap = "round";
		context.stroke();
	}

	container.appendChild(canvas);
}