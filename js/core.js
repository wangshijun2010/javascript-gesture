/**
 * gesture.js: Continuous Recognition and Visualization of Pen Strokes and Touch-Screen Gestures
 *
 * @author	 wangshijun <wangshijun2010@gmail.com>
 * @copyright	(c) 2012 wangshijun <wangshijun2010@gmail.com>
 * @package	wangshijun2010@gmail.com
 * @subpackage	default
 * @link https://github.com/wangshijun2010/javascript-gesture
 */

(function(){

var Template = function(id, points) {
	this.id = id;
	this.points = points;
};

var Po= function(x, y) {
	this.x = x;
	this.y = y;
};

var Center = function(x, y) {
	this.x = x;
	this.y = y;
};

var Rectangle = function(x, y) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

var Result = function(template, probability, points) {
	this.template = template;
	this.probability = probability;
	this.points = points;
};

var Pattern = function(template, segments) {
	this.template = template;
	this.segments = segments;
};

var Recognizer = function(templates, samplePointDistance, debug) {
	// class variables
	this.patterns = [];
	this.samplePointDistance = samplePointDistance || 5;
	this.normalizedSpace = new Rectangle(0, 0, 1000, 1000);
	this.debug = debug === undefined ? false : debug;

	// default performance paramters
	this.DEFAULT_E_SIGMA = 200.0;
	this.DEFAULT_BETA = 400.0;
	this.DEFAULT_LAMBDA = 0.4;
	this.DEFAULT_KAPPA = 1.0;
	this.MAX_RESAMPLING_points = 1000;

	// normalize templates
	this.setTemplates(templates);
}

Recognizer.prototype = {
	/**
	 * Outputs a list of templates and their associated probabilities for the given input.
	 *
	 * @param input a list of input points
	 * @param beta a parameter, see the paper for details
	 * @param lambda a parameter, see the paper for details
	 * @param kappa a parameter, see the paper for details
	 * @param e_sigma a parameter, see the paper for details
	 * @return a list of templates and their associated probabilities
	 */
	recognize: function (input, beta, lambda, kappa, e_sigma) {
		if (input.length < 2) {
			new Error("Recognizer.recognize: input size must be greater than 2");
		}

		var beta = beta || this.DEFAULT_BETA;
		var lambda = lambda || this.DEFAULT_LAMBDA;
		var kappa = kappa || this.DEFAULT_KAPPA;
		var e_sigma = e_sigma || this.DEFAULT_E_SIGMA;

		var incResults = this.getIncrementalResults(input, beta, lambda, kappa, e_sigma);
		var results = this.getResults(incResults);

		// TODO: sort the results

		return results;
	},

	/**
	 * Set templates to match a stroke against
	 * @param {array} templates array of template objects
	 */
	setTemplates: function (templates) {
		this.patterns = [];
		for (var i=0, length = templates.length; i<length; i++) {
			templates[i].points = this.normalize(templates[i].points);
			this.patterns.push(new Pattern(templates[i], this.generateEquiDistantProgressiveSubSequences(templates[i].points, 200)));
		}
		for (var i=0, length = this.patterns.length; i<length; i++) {
			var segments = [];
			for (List<Pt> pts : pattern.segments) {
				var newPoints = this.deepCopyPts(pts);
				normalize(newPts);
				segments.add(resample(newPts, getResamplingPointCount(newPts, samplePointDistance)));
			}
			pattern.segments = segments;
		}
	},

	/**
	 * Normalizes a posequence so that it is scaled and centred within a defined box.
	 *
	 * (This method was implemented and exposed in the public interface to ease the
	 * implementation of the demonstrator. This method is not used by the recognition
	 * algorithm.)
	 *
	 * @param points an input posequence
	 * @param x the horizontal component of the upper-left corner of the defined box
	 * @param y the vertical component of the upper-left corner of the defined box
	 * @param width the width of the defined box
	 * @param height the height of the defined box
	 * @return a newly created posequence that is centred and fits within the defined box
	 */
	normalize: function (points, x, y, width, height) {
		var result = this.deepCopyPts(points);
		result = this.scaleTo(result, new Rectangle(0, 0, width - x, height - y));
		var center = this.getCenter(result);
		result = this.translate(result, -center.x, -center.y);
		result = this.translate(result, width - x, height - y);
		return result;
	},

	deepCopyPts: function (points) {
		var newPoints = [];
		for (var i=0, length = points.length; i<length; i++) {
			newPoints.push(new Point(points[i].x, points[i].y));
		}
		return newPoints;
	},

	scaleTo: function(points, targetBounds) {
		var bounds = this.getBoundingBox(points);
		var area = bounds.width * bounds.width + bounds.height * bounds.height;
		var targetArea = targetBounds.width * targetBounds.width + targetBounds.height * targetBounds.height;
		var scale = Math.sqrt(targetArea) / Math.sqrt(area);
		return this.scale(points, scale, scale, bounds.x, bounds.y);
	},

	scale: function(points, sx, sy, originX, originY) {
		var points = this.translate(points, -originX, -originY);
		for (var i=0, length = points.length; i<length; i++) {
			points[i].x *= sx;
			points[i].y *= sy;
		}
		var points = this.translate(points, originX, originY);
		return points;
	},

	translate: function (points, dx, dy) {
		var dx = Math.floor(dx);
		var dy = Math.floor(dy);
		for (var i=0, length = points.length; i<length; i++) {
			points[i].x += dx;
			points[i].y += dy;
		}
		return points;
	},

	/**
	 * Get bounding of point set
	 * @param  {array} points point set
	 * @return {object}
	 */
	getBoundingBox: function (points) {
		var minX = Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxX = Number.MIN_VALUE;
		var maxY = Number.MIN_VALUE;
		for (var i=0, length = points.length; i<length; i++) {
			x = points[i].x;
			y = points[i].y;
			if (x < minX) {
				minX = x;
			}
			if (x > maxX) {
				maxX = x;
			}
			if (y < minY) {
				minY = y;
			}
			if (y > maxY) {
				maxY = y;
			}
		}
		return new Rectangle(minX, minY, (maxX - minX), (maxY - minY));
	},

	getCenter: function (points) {
		var length = points.length;
		var totalX = 0;
		var totalY = 0;
		for (var i=0, length = points.length; i<length; i++) {
			totalX += points[i].x;
			totalY += points[i].y;
		}
		return new Center(totalX / length, totalY / length);
	},

	generateEquiDistantProgressiveSubSequences: function (points, pointSpacing) {
		var sequences = [];
		var nSamplePoints = this.getResamplingPointCount(points, pointSpacing);
		var resampledPoints = this.resample(points, nSamplePoints);
		for (var i = 1, n = resampledPoints.length; i < n; i++) {
			seq = this.deepCopypoints(resampledPoints.subList(0, i+1));
			sequences.push(seq);
		}
		return sequences;
	},

	getResamplingPointCount: function (points, samplePointDistance) {
		var len = this.getSpatialLength(points);
		return (len / samplePointDistance) + 1;
	},

	getSpatialLength: function (points) {
		var length = 0;
		var previous = next = null;
		for (var i=0, n = points.length; i<n-1; i++) {
			previous = points[i];
			next = points[++i];
			length += this.distance(previous, next);
		}
		return length;
	},

	distance: function (point1, point2) {
		return distance(point1.x, point1.y, point2.x, point2.y);
	},

	distance: function (x1, y1, x2, y2) {
		if ((x2 -= x1) < 0) {
			x2 = -x2;
		}
		if ((y2 -= y1) < 0) {
			y2 = -y2;
		}
		return (x2 + y2 - (((x2 > y2) ? y2 : x2) >> 1) );
	},

	getLikelihoodOfMatch: function (points1, points2, eSigma, aSigma, lambda) {
		if (eSigma == 0 || eSigma < 0) {
			new Error("eSigma must be positive");
		}
		if (aSigma == 0 || eSigma < 0) {
			new Error("aSigma must be positive");
		}
		if (lambda < 0 || lambda > 1) {
			new Error("lambda must be in the range between zero and one");
		}
		var x_e = this.getEuclidianDistance(points1, points2);
		var x_a = this.getTurningAngleDistance(points1, points2);
		return Math.exp(- (x_e * x_e / (eSigma * eSigma) * lambda + x_a * x_a / (aSigma * aSigma) * (1 - lambda)));
	},

	getEuclidianDistance: function (points1, points2) {
		if (points1.length != points2.length) {
			new Error("lists must be of equal lengths, cf. " + points1.length + " with " + points2.length);
		}

		totalDistance = 0;
		for (var i = 0, n=points1.length; i < n; i++) {
			totalDistance += this._getEuclideanDistance(points1[i], points2[i]);
		}
		return totalDistance / points1.length;
	},

	getTurningAngleDistance: function (points1, points2) {
		if (points1.length != points2.length) {
			new Error("lists must be of equal lengths, cf. " + points1.length + " with " + points2.length);
		}

		var n = points1.length;
		var totalDistance = 0;
		for (var i = 0; i < n - 1; i++) {
			totalDistance += Math.abs(this._getTurningAngleDistance(points1[i], points1.get[i+1], points2[i], points2[i + 1]));
		}

		if (Math.isNaN(totalDistance)) {
			return 0;
		}

		return totalDistance / (n - 1);
	},

	/**
	 * 计算两个点的欧几里得距离
	 * @param  {Point} point1
	 * @param  {Point} point2
	 * @return {Number}
	 */
	_getEuclideanDistance: function (point1, point2) {
		return Math.sqrt(this._getSquaredEuclidenDistance(point1, point2));
	},
	_getSquaredEuclidenDistance: function (point1, point2) {
		return (point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y);
	},

	/**
	 * 计算两个向量的夹角
	 * @param  {Point} pointA1
	 * @param  {Point} pointA2
	 * @param  {Point} pointB1
	 * @param  {Point} pointB2
	 * @return {Number}
	 */
	_getTurningAngleDistance: function (pointA1, pointA2, pointB1, pointB2) {
		var length_a = this._getEuclideanDistance(pointA1, pointA2);
		var length_b = this._getEuclideanDistance(pointB1, pointB2);

		if (length_a == 0 || length_b == 0) {
			return 0.0;
		} else {
			var cos = ((pointA1.x - pointA2.x) * (pointB1.x - pointB2.x) + (pointA1.y - pointA2.y)*(pointB1.y - pointB2.y) ) / (length_a * length_b);
			if (Math.abs(cos) > 1.0) {
				return 0.0;
			} else {
				return Math.acos(cos);
			}
		}
	},

	resample: function (points, numTargetPoints) {
		r = new ArrayList<Pt>();
		inArray = toArray(points);
		outArray = new int[numTargetPoints * 2];

		resample(inArray, outArray, points.length, numTargetPoints);
		for (i = 0, n = outArray.length; i < n; i+= 2) {
			r.add(new Pt(outArray[i], outArray[i + 1], false));
		}
		return r;
	},

	toArray: function (points) {
		out = new int[points.length * 2];
		for (i = 0, n = points.length * 2; i < n; i+= 2) {
			out[i] = points.get(i / 2).x;
			out[i + 1] = points.get(i / 2).y;
		}
		return out;
	},

	resample: function (template, buffer, n, numTargetPoints) {
		segment_buf = new int[MAX_RESAMPLING_points];

		l, segmentLen, horizRest, verticRest, dx, dy;
		x1, y1, x2, y2;
		i, m, a, segmentPoints, j, maxOutputs, end;

		m = n * 2;
		l = getSpatialLength(template, n);
		segmentLen = l / (numTargetPoints - 1);
		getSegmentPoints(template, n, segmentLen, segment_buf);
		horizRest = 0.0f;
		verticRest = 0.0f;
		x1 = template[0];
		y1 = template[1];
		a = 0;
		maxOutputs = numTargetPoints * 2;
		for (i = 2; i < m; i += 2) {
			x2 = template[i];
			y2 = template[i + 1];
			segmentPoints = segment_buf[(i / 2) - 1];
			dx = -1.0f;
			dy = -1.0f;
			if (segmentPoints - 1 <= 0) {
				dx = 0.0f;
				dy = 0.0f;
			}
			else {
				dx = (x2 - x1) / (double) (segmentPoints);
				dy = (y2 - y1) / (double) (segmentPoints);
			}
			if (segmentPoints > 0) {
				for (j = 0; j < segmentPoints; j++) {
					if (j == 0) {
						if (a < maxOutputs) {
							buffer[a] =  (x1 + horizRest);
							buffer[a + 1] =  (y1 + verticRest);
							horizRest = 0.0;
							verticRest = 0.0;
							a += 2;
						}
					}
					else {
						if (a < maxOutputs) {
							buffer[a] =  (x1 + j * dx);
							buffer[a + 1] =  (y1 + j * dy);
							a += 2;
						}
					}
				}
			}
			x1 = x2;
			y1 = y2;
		}
		end = (numTargetPoints * 2) - 2;
		if (a < end) {
			for (i = a; i < end; i += 2) {
				buffer[i] = (buffer[i - 2] + template[m - 2]) / 2;
				buffer[i + 1] = (buffer[i - 1] + template[m - 1]) / 2;
			}
		}
		buffer[maxOutputs - 2] = template[m - 2];
		buffer[maxOutputs - 1] = template[m - 1];
	},

	getSegmentPoints: function (points, n, length, buffer) {
		i, m;
		x1, y1, x2, y2, ps;
		rest, currentLen;

		m = n * 2;
		rest = 0.0f;
		x1 = points[0];
		y1 = points[1];
		for (i = 2; i < m; i += 2) {
			x2 = points[i];
			y2 = points[i + 1];
			currentLen = distance(x1, y1, x2, y2);
			currentLen += rest;
			rest = 0.0f;
			ps =  ((currentLen / length));
			if (ps == 0) {
				rest += currentLen;
			}
			else {
				rest += currentLen - (ps * length);
			}
			if (i == 2 && ps == 0) {
				ps = 1;
			}
			buffer[(i / 2) - 1] = ps;
			x1 = x2;
			y1 = y2;
		}
		return rest;
	},

	getSpatialLength: function (pat, n) {
		l;
		i, m;
		x1, y1, x2, y2;

		l = 0;
		m = 2 * n;
		if (m > 2) {
			x1 = pat[0];
			y1 = pat[1];
			for (i = 2; i < m; i += 2) {
				x2 = pat[i];
				y2 = pat[i + 1];
				l += distance(x1, y1, x2, y2);
				x1 = x2;
				y1 = y2;
			}
			return l;
		}
		else {
			return 0;
		}
	},

	/**
	 * Print message to console
	 * @param  {mixed} message
	 * @return {void}
	 */
	log: function (message) {
		this.debug && window.console && window.console.log(message);
	},
};

})(window);
