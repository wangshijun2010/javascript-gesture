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

// Grab the indicator elements
window.addEventListener("DOMContentLoaded", function() {
	pagex = document.querySelector("#pagex");
	pagey = document.querySelector("#pagey");
}, false);

// Enter stroke mode when mouse down
window.addEventListener("mousedown", function(){
	isStroke = true;
	points = [];
}, false);

// Leave stroke mode when mouse up
window.addEventListener("mouseup", function(){
	isStroke = false;
	points = [];
}, false);

// Track stroke history when mouse move
window.addEventListener("mousemove", function(event) {
	if (isStroke === true) {
		var event = event || window.event;
		pagex && (pagex.innerHTML = event.pageX);
		pagey && (pagey.innerHTML = event.pageY);
		points.push({x: event.pageX, y: event.pageY});
		console.log(event);
	}
}, false);