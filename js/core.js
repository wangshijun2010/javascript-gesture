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

window.gesture = {};

gesture.Template = function(id, points) {
	this.id = id;
	this.points = points;
};

gesture.Point = function(x, y) {
	this.x = x;
	this.y = y;
};

gesture.Center = function(x, y) {
	this.x = x;
	this.y = y;
};

gesture.Rectangle = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

gesture.Result = function(template, probability, points) {
	this.template = template;
	this.probability = probability;
	this.points = points;
};

gesture.IncrementalResult = function(template, probability, indexOfMostLikelySegment) {
	this.template = template;
	this.probability = probability;
	this.indexOfMostLikelySegment = indexOfMostLikelySegment;
};

gesture.Pattern = function(template, segments) {
	this.template = template;
	this.segments = segments;
};

gesture.Recognizer = function(templates, samplePointDistance, debug) {
	// class variables
	this.patterns = [];
	this.samplePointDistance = samplePointDistance || 10;
	this.normalizedSpace = new gesture.Rectangle(0, 0, 1000, 1000);
	this.debug = debug === undefined ? false : debug;

	// default performance paramters
	this.DEFAULT_E_SIGMA = 200.0;
	this.DEFAULT_BETA = 400.0;
	this.DEFAULT_LAMBDA = 0.4;
	this.DEFAULT_KAPPA = 1.0;

	// normalize templates
	this.setTemplates(templates);
}

gesture.Recognizer.prototype = {
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
	recognize: function(input, beta, lambda, kappa, e_sigma) {
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
		results.sort(function(resultA, resultB) {
			if (resultA.probability == resultB.probability) {
				return 0;
			} else if (resultA.probability < resultB.probability) {
				return 1;
			} else {
				return -1;
			}

		});

		return results;
	},

	/**
	 * Set templates to match a stroke against
	 * @param {array} templates array of template objects
	 */
	setTemplates: function(templates) {
		this.patterns = [];
		for (var i=0, length = templates.length; i<length; i++) {
			templates[i].points = this._normalize(templates[i].points);
			var segments = this.generateEquiDistantProgressiveSubSequences(templates[i].points, 200);
			this.patterns.push(new gesture.Pattern(templates[i], segments));
		}
		for (var i=0, length = this.patterns.length; i<length; i++) {
			var segments = [];
			for (var j=0, n = this.patterns[i].segments.length; j<n; j++) {
				var newPoints = this._normalize(this.deepCopyPoints(this.patterns[i].segments[j]));
				var resamplePointCount = this.getResamplingPointCount(newPoints, this.samplePointDistance);
				segments.push(this.resample(newPoints, resamplePointCount));
			}
			this.patterns[i].segments = segments;
		}
	},

	getResults: function(incrementalResults) {
		var results = [];
		for (var i=0, n = incrementalResults.length; i<n; i++) {
			results.push(new gesture.Result(
				incrementalResults[i].pattern.template,
				incrementalResults[i].probability,
				incrementalResults[i].pattern.segments[incrementalResults[i].indexOfMostLikelySegment])
			);
		}
		return results;
	},

	getIncrementalResults: function(input, beta, lambda, kappa, e_sigma) {
		var results = [];
		var unkPts = this._normalize(this.deepCopyPts(input));
		for (var i=0, n = this.patterns.length; i<n; i++) {
			var result = this.getIncrementalResult(unkPts, this.patterns[i], beta, lambda, e_sigma);
			var lastSegmentPts = this.patterns[i].segments[this.patterns[i].segments.length-1];
			var completeProb = this.getLikelihoodOfMatch(this.resample(unkPts, lastSegmentPts.length), lastSegmentPts, e_sigma, e_sigma/beta, lambda);
			var x = 1 - completeProb;
			result.probability *= (1 + kappa*Math.exp(-x*x));
			results.push(result);
		}
		this.marginalizeIncrementalResults(results);
		return results;
	},

	marginalizeIncrementalResults: function(results) {
		var total = 0;
		for (var i=0, n = results.length; i<n; i++) {
			total += results[i].probability;
		}
		for (var i=0, n = results.length; i<n; i++) {
			results[i].probability /= total;
		}
	},

	getIncrementalResult: function(unkPts, pattern, beta, lambda, e_sigma) {
		var segments = pattern.segments;
		var maxProb = 0.0;
		var maxIndex = -1;
		for (var i = 0, n = segments.length; i < n; i++) {
			var points = segments[i];
			var samplingPtCount = points.length;
			var unkResampledPts = this.resample(unkPts, samplingPtCount);
			var probability = this.getLikelihoodOfMatch(unkResampledPts, points, e_sigma, e_sigma/beta, lambda);
			if (probability > maxProb) {
				maxProb = probability;
				maxIndex = i;
			}
		}
		return new gesture.IncrementalResult(pattern, maxProb, maxIndex);
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
	normalize: function(points, x, y, width, height) {
		var newPoints = this.deepCopyPoints(points);
		newPoints = this.scaleTo(newPoints, new gesture.Rectangle(0, 0, width - x, height - y));
		var center = this.getCenter(newPoints);
		newPoints = this.translate(newPoints, -center.x, -center.y);
		newPoints = this.translate(newPoints, width - x, height - y);
		return newPoints;
	},

	_normalize: function(points) {
		var newPoints = this.scaleTo(points, this.normalizedSpace);
		var center = this.getCenter(newPoints);
		return this.translate(newPoints, -center.x, -center.y);
	},

	/**
	 * 复制1个点序列
	 * @param  {array} points 点序列
	 * @return {array}
	 */
	deepCopyPoints: function(points) {
		var newPoints = [];
		for (var i=0, length = points.length; i<length; i++) {
			newPoints.push(new gesture.Point(points[i].x, points[i].y));
		}
		return newPoints;
	},

	/**
	 * 将点序列缩放到指定的坐标区域中
	 * @param  {array} points       点序列
	 * @param  {object} targetBounds 边界
	 * @return {array}
	 */
	scaleTo: function(points, targetBounds) {
		var bounds = this.getBoundingBox(points);
		var area = bounds.width * bounds.width + bounds.height * bounds.height;
		var targetArea = targetBounds.width * targetBounds.width + targetBounds.height * targetBounds.height;
		var scale = Math.sqrt(targetArea) / Math.sqrt(area);
		return this.scale(points, scale, scale, bounds.x, bounds.y);
	},

	/**
	 * 点序列缩放, 不改变点序列的左下边界位置
	 * @param  {array} points  点序列
	 * @param  {number} sx      横轴缩放比例
	 * @param  {number} sy      纵轴缩放比例
	 * @param  {number} originX 原始左边界位置
	 * @param  {number} originY 原始下边界位置
	 * @return {array}
	 */
	scale: function(points, sx, sy, originX, originY) {
		var points = this.translate(points, -originX, -originY);
		for (var i=0, length = points.length; i<length; i++) {
			points[i].x *= sx;
			points[i].y *= sy;
		}
		var points = this.translate(points, originX, originY);
		return points;
	},

	/**
	 * 点序列平移, 指定纵轴和横轴方向平移量
	 * @param  {array} points 点序列
	 * @param  {number} dx     横轴平移量
	 * @param  {number} dy     纵轴平移量
	 * @return {array}
	 */
	translate: function(points, dx, dy) {
		var dx = Math.floor(dx);
		var dy = Math.floor(dy);
		for (var i=0, length = points.length; i<length; i++) {
			points[i].x += dx;
			points[i].y += dy;
		}
		return points;
	},

	/**
	 * 计算点序列的边界
	 * @param  {array} points point set
	 * @return {object}
	 */
	getBoundingBox: function(points) {
		var minX = Number.MAX_VALUE;
		var minY = Number.MAX_VALUE;
		var maxX = Number.MIN_VALUE;
		var maxY = Number.MIN_VALUE;
		for (var i=0, length = points.length; i<length; i++) {
			var x = points[i].x;
			var y = points[i].y;
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
		return new gesture.Rectangle(minX, minY, (maxX - minX), (maxY - minY));
	},

	/**
	 * 计算的点序列的中心
	 * @param  {array} points
	 * @return {object}
	 */
	getCenter: function(points) {
		var length = points.length;
		var totalX = 0;
		var totalY = 0;
		for (var i=0, length = points.length; i<length; i++) {
			totalX += points[i].x;
			totalY += points[i].y;
		}
		return new gesture.Center(totalX / length, totalY / length);
	},

	/**
	 * 从原始的点序列中重新抽样计算连续子序列
	 * @param  {array} points       原始点序列
	 * @param  {number} pointSpacing 抽样间距
	 * @return {array}              抽样后的点序列的连续子序列子集
	 */
	generateEquiDistantProgressiveSubSequences: function(points, pointSpacing) {
		var sequences = [];
		var nSamplePoints = this.getResamplingPointCount(points, pointSpacing);
		var resampledPoints = this.resample(points, nSamplePoints);
		for (var i = 1, n = resampledPoints.length; i < n; i++) {
			sequences.push(this.deepCopyPoints(resampledPoints.slice(0, i+1)));
		}
		return sequences;
	},

	/**
	 * 计算重新抽样的点个数
	 * @param  {array} points              原始点序列
	 * @param  {number} samplePointDistance 抽样距离
	 * @return {number}
	 */
	getResamplingPointCount: function(points, samplePointDistance) {
		var length = this.getSpatialLength(points);
		return (length / samplePointDistance) + 1;
	},

	getSpatialLength: function(points) {
		var length = 0;
		var previous = next = null;
		for (var i=0, n = points.length; i<n-1; i++) {
			previous = points[i];
			next = points[++i];
			length += this.distance(previous, next);
		}
		return length;
	},

	distance: function(point1, point2) {
		return this._distance(point1.x, point1.y, point2.x, point2.y);
	},

	_distance: function(x1, y1, x2, y2) {
		if ((x2 -= x1) < 0) {
			x2 = -x2;
		}
		if ((y2 -= y1) < 0) {
			y2 = -y2;
		}
		return (x2 + y2 - (((x2 > y2) ? y2 : x2) >> 1) );
	},

	/**
	 * 计算两个点序列之间的相似度
	 * @param  {array} points1
	 * @param  {array} points2
	 * @param  {number} eSigma
	 * @param  {number} aSigma
	 * @param  {number} lambda
	 * @return {number}
	 */
	getLikelihoodOfMatch: function(points1, points2, eSigma, aSigma, lambda) {
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

	/**
	 * 计算两个点序列间的欧氏距离
	 * @param  {array} points1
	 * @param  {array} points2
	 * @return {number}
	 */
	getEuclidianDistance: function(points1, points2) {
		if (points1.length != points2.length) {
			new Error("lists must be of equal lengths, cf. " + points1.length + " with " + points2.length);
		}

		totalDistance = 0;
		for (var i = 0, n=points1.length; i < n; i++) {
			totalDistance += this._getEuclideanDistance(points1[i], points2[i]);
		}

		return totalDistance / points1.length;
	},

	/**
	 * 计算两个点序列间的夹角
	 * @param  {array} points1
	 * @param  {array} points2
	 * @return {number}
	 */
	getTurningAngleDistance: function(points1, points2) {
		if (points1.length != points2.length) {
			new Error("Recognizer.getTurningAngleDistance: point sequences must be of equal lengths");
		}

		var n = points1.length;
		var totalDistance = 0;

		for (var i = 0; i < n - 1; i++) {
			totalDistance += Math.abs(this._getTurningAngleDistance(points1[i], points1.get[i+1], points2[i], points2[i+1]));
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
	_getEuclideanDistance: function(point1, point2) {
		return Math.sqrt(this._getSquaredEuclidenDistance(point1, point2));
	},
	_getSquaredEuclidenDistance: function(point1, point2) {
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
	_getTurningAngleDistance: function(pointA1, pointA2, pointB1, pointB2) {
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

	/**
	 * 从点序列中重新抽取指定数量的点
	 * @param  {array} points          点序列
	 * @param  {number} numTargetPoints 新样本的点个数
	 * @return {array}                 新的点序列
	 */
	resample: function(points, numTargetPoints) {
		var newPoints = [];
		var inArray = this._toArray(points);
		var outArray = [];

		outArray = this._resample(inArray, outArray, points.length, numTargetPoints);
		for (var i = 0, n = outArray.length; i < n; i+= 2) {
			newPoints.push(new gesture.Point(outArray[i], outArray[i+1]));
		}

		return newPoints;
	},

	/**
	 * 把点序列转化为两倍大的数组,相邻的量个数字仍为1个点
	 * @param  {array} points 点序列
	 * @return {array}
	 */
	_toArray: function(points) {
		var out = [];
		for (var i = 0, n = points.length * 2; i < n; i+= 2) {
			out[i] = points[i/2].x;
			out[i + 1] = points[i/2].y;
		}
		return out;
	},

	/**
	 * 从数组中重新抽样
	 * @param  {array} template        母本
	 * @param  {array} buffer          样本缓冲区
	 * @param  {number} n               母本长度
	 * @param  {number} numTargetPoints 样本长度
	 * @return {void}
	 */
	_resample: function(template, buffer, n, numTargetPoints) {
		var segment_buf = [];

		var m = n * 2;

		var l = this._getSpatialLength(template, n);
		var segmentLen = l / (numTargetPoints - 1);

		this._getSegmentPoints(template, n, segmentLen, segment_buf);

		var a = 0;
		var horizRest = 0;
		var verticRest = 0;

		var x1 = template[0];
		var y1 = template[1];

		var maxOutputs = numTargetPoints * 2;

		for (var i = 2; i < m; i += 2) {
			var x2 = template[i];
			var y2 = template[i + 1];
			var segmentPoints = segment_buf[(i / 2) - 1];
			var dx = -1.0;
			var dy = -1.0;
			if (segmentPoints - 1 <= 0) {
				dx = 0.0;
				dy = 0.0;
			} else {
				dx = (x2 - x1) / segmentPoints;
				dy = (y2 - y1) / segmentPoints;
			}
			if (segmentPoints > 0) {
				for (var j = 0; j < segmentPoints; j++) {
					if (j == 0) {
						if (a < maxOutputs) {
							buffer[a] =  (x1 + horizRest);
							buffer[a + 1] =  (y1 + verticRest);
							horizRest = 0.0;
							verticRest = 0.0;
							a += 2;
						}
					} else {
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

		var end = (numTargetPoints * 2) - 2;
		if (a < end) {
			for (i = a; i < end; i += 2) {
				buffer[i] = (buffer[i - 2] + template[m - 2]) / 2;
				buffer[i + 1] = (buffer[i - 1] + template[m - 1]) / 2;
			}
		}

		buffer[maxOutputs - 2] = template[m - 2];
		buffer[maxOutputs - 1] = template[m - 1];

		return buffer;
	},

	_getSegmentPoints: function(points, n, length, buffer) {
		var ps, rest, currentLen;

		var m = n * 2;
		var rest = 0;
		var x1 = points[0];
		var y1 = points[1];
		for (i = 2; i < m; i += 2) {
			var x2 = points[i];
			var y2 = points[i + 1];
			currentLen = this._distance(x1, y1, x2, y2);
			currentLen += rest;
			rest = 0.0;
			ps = Math.floor((currentLen / length));
			if (ps == 0) {
				rest += currentLen;
			} else {
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

	_getSpatialLength: function(pat, n) {
		var l = 0;
		var m = 2 * n;
		if (m > 2) {
			var x1 = pat[0];
			var y1 = pat[1];
			for (var i = 2; i < m; i += 2) {
				var x2 = pat[i];
				var y2 = pat[i + 1];
				l += this._distance(x1, y1, x2, y2);
				x1 = x2;
				y1 = y2;
			}
			return l;
		} else {
			return 0;
		}
	},

	/**
	 * Print message to console
	 * @param  {mixed} message
	 * @return {void}
	 */
	log: function(message) {
		this.debug && window.console && window.console.log(message);
	},
};

})(window);
