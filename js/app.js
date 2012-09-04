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

// Grab the indicator elements
window.addEventListener("load", function(event) {
	pagex = document.querySelector("#pagex");
	pagey = document.querySelector("#pagey");
	canvas = document.querySelector('#canvas');
	context = canvas.getContext('2d');

	canvas.width = 500;
	canvas.height = 500;

	// console.dir(canvas);
}, false);

// Enter stroke mode when mouse down
window.addEventListener("mousedown", function(event){
	isStroke = true;
	points = [];

	var event = getStrokeEvent(event);
	context.strokeStyle = 'rgba(255,0,0,0.5)';
	context.lineWidth = 10;
	context.miterLimit = 0.1;
	context.beginPath();
	context.moveTo(event._x, event._y);
}, false);

// Leave stroke mode when mouse up
window.addEventListener("mouseup", function(event){
	isStroke = false;
	points = [];
}, false);

// Track stroke history when mouse move
window.addEventListener("mousemove", function(event) {
	if (isStroke === true) {
		// console.log(event);
		var event = getStrokeEvent(event);
		pagex && (pagex.innerHTML = event.pageX);
		pagey && (pagey.innerHTML = event.pageY);
		points.push({x: event.pageX, y: event.pageY});

		context.lineTo(event._x, event._y);
		context.lineCap = "round";
		context.stroke();
	}
}, false);

// We need to prevent default when a right mouse click is triggerred
function getStrokeEvent(event, preventDefault) {
	var event = event || window.event;
	var preventDefault = preventDefault || false;
	preventDefault && event.preventDefault();

	event._x = (event.offsetX == undefined) ? event.layerX : event.offsetX;
	event._y = (event.offsetY == undefined) ? event.layerY : event.offsetY;

	// event._x = event._x - canvas.offsetLeft;
	// event._y = event._y - canvas.offsetTop;

	return event;
}