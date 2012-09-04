/**
 * app.js
 *
 * @author	 wangshijun <wangshijun2010@gmail.com>
 * @copyright	(c) 2012 wangshijun <wangshijun2010@gmail.com>
 * @package	default
 * @subpackage	default
 */

var pagex = null;
var pagey = null;
var points = [];
var isStroke = false;
var canvas = null;
var context = null;
var recognizer = null;

window.addEventListener("load", onload, false);
window.addEventListener("mousedown", onmousedown, false);
window.addEventListener("mouseup", onmouseup, false);
window.addEventListener("mousemove", onmousemove, false);

// Grab the indicator elements
function onload(event) {
	pagex = document.querySelector("#pagex");
	pagey = document.querySelector("#pagey");
	canvas = document.querySelector('#canvas');
	context = canvas.getContext('2d');

	canvas.width = 500;
	canvas.height = 500;

	// console.dir(canvas);
	test();
}

// Enter stroke mode when mouse down
function onmousedown(event){
	isStroke = true;
	points = [];

	var event = getEvent(event);
	context.strokeStyle = 'rgba(255,0,0,0.5)';
	context.lineWidth = 10;
	context.miterLimit = 0.1;
	context.beginPath();
	context.moveTo(event._x, event._y);
}

// Leave stroke mode when mouse up
function onmouseup(event){
	isStroke = false;
	var results = recognizer.recognize(points);
	console.log(results);
	console.log(results.shift().template.id);
	points = [];
}

// Track stroke history when mouse move
function onmousemove(event) {
	if (isStroke === true) {
		// console.log(event);
		var event = getEvent(event);
		pagex && (pagex.innerHTML = event.pageX);
		pagey && (pagey.innerHTML = event.pageY);
		points.push({x: event.pageX, y: event.pageY});

		context.lineTo(event._x, event._y);
		context.lineCap = "round";
		context.stroke();

		// console.log(recognizer.recognize(points).shift().template.id);
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

function test() {
	var templates = [
		new gesture.Template("north", [new gesture.Point(0,0), new gesture.Point(0,1), new gesture.Point(0,2)]),
		new gesture.Template("south", [new gesture.Point(0,2), new gesture.Point(0,1), new gesture.Point(0,0)]),
		new gesture.Template("east", [new gesture.Point(0,0), new gesture.Point(1,0), new gesture.Point(2,0)]),
		new gesture.Template("west", [new gesture.Point(2,0), new gesture.Point(1,0), new gesture.Point(0,0)]),
	];

	recognizer = new gesture.Recognizer(templates, 10, true);

	console.log(recognizer);
}