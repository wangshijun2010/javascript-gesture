/*
 * Continuous Recognition and Visualization of Pen Strokes and Touch-Screen Gestures
 * Version: 2.0
 *
 * If you use this code for your research then please remember to cite our paper:
 * 
 * Kristensson, P.O. and Denby, L.C. 2011. Continuous recognition and visualization
 * of pen strokes and touch-screen gestures. In Procceedings of the 8th Eurographics
 * Symposium on Sketch-Based Interfaces and Modeling (SBIM 2011). ACM Press: 95-102.
 * 
 * Copyright (C) 2011 by Per Ola Kristensson, University of St Andrews, UK.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

/**
 * A continuous gesture recognizer. Outputs a probability distribution over
 * a set of template gestures as a function of received sampling points.
 * 
 * History:
 * Version 1.0 (August 12, 2011)   - Initial public release
 * Version 2.0 (September 6, 2011) - Simplified the public interface, simplified
 *                                   internal implementation.
 * 
 * For details of its operation, see the paper referenced below.
 * 
 * Documentation is here: http://pokristensson.com/increc.html
 * 
 * Copyright (C) 2011 Per Ola Kristensson, University of St Andrews, UK.
 * 
 * If you use this code for your research then please remember to cite our paper:
 * 
 * Kristensson, P.O. and Denby, L.C. 2011. Continuous recognition and visualization
 * of pen strokes and touch-screen gestures. In Procceedings of the 8th Eurographics
 * Symposium on Sketch-Based Interfaces and Modeling (SBIM 2011). ACM Press: 95-102.
 * 
 * @author Per Ola Kristensson
 * @author Leif Denby
 *
 */
public class ContinuousGestureRecognizer {
	
	/* Beginning of public interface */
	
	/**
	 * Defines a template gesture / stroke.
	 * 
	 * @author Per Ola Kristensson
	 *
	 */
	public static class Template {
		
		/**
		 * The identifier for this template gesture / stroke.
		 */
		public String id;
		/**
		 * A sequence of points that defines this template
		 * gesture / stroke.
		 */
		public List<Pt> pts = new ArrayList<Pt>();
		
		/**
		 * Creates a template gesture / stroke.
		 * 
		 * @param id the identifier for this template gesture / stroke
		 * @param points the sequence of points that define this
		 * template gesture / stroke
		 */
		public Template(String id, List<Pt> points) {
			this.id = id;
			this.pts = points;
		}

	}
	
	/**
	 * Defines a point with optional waypoint information.
	 * 
	 * @author Per Ola Kristensson
	 *
	 */
	public static class Pt {

		/**
		 * The horizontal component of this point.
		 */
		public int x;
		/**
		 * The vertical component of this point.
		 */
		public int y;

		/**
		 * Creates a point.
		 * 
		 * @param x the horizontal component of this point
		 * @param y the vertical component of this point
		 */
		public Pt(int x, int y) {
			this(x, y, false);
		}
		
		/**
		 * Creates a point.
		 * 
		 * @param x the horizontal component of this point
		 * @param y the vertical component of this point
		 */
		public Pt(int x, int y, boolean waypoint) {
			this.x = x;
			this.y = y;
		}
		
	}
	
	/**
	 * Holds a recognition result.
	 * 
	 * @author Per Ola Kristensson
	 *
	 */
	public static class Result implements Comparable<Result> {
		
		/**
		 * The template associated with this recognition result.
		 */
		public Template template;
		/**
		 * The probability associated with this recognition result.
		 */
		public double prob;
		/**
		 * The point sequence associated with this recognition result.
		 */
		public List<Pt> pts;

		private Result(Template template, double prob, List<Pt> pts) {
			this.template = template;
			this.prob = prob;
			this.pts = pts;
		}
		
		@Override
		public int compareTo(Result r) {
			if (prob == r.prob) {
				return 0;
			}
			else if (prob < r.prob) {
				return 1;
			}
			else {
				return -1;
			}
		}
		
	}
	
	/**
	 * Creates an instance of a continuous gesture recognizer.
	 *
	 * @param templates the set of templates the recognizer will recognize
	 */
	public ContinuousGestureRecognizer(List<Template> templates) {
		this(templates, 5);
	}
	
	/**
	 * Creates an instance of a continuous gesture recognizer.
	 *
	 * @param templates the set of templates the recognizer will recognize
	 * @param samplePointDistance the distance between sampling points in the normalized space
	 * (1000 x 1000 units)
	 */
	public ContinuousGestureRecognizer(List<Template> templates, int samplePointDistance) {
		this.samplePointDistance = samplePointDistance;
		setTemplateSet(templates);
	}
	
	/**
	 * Sets the set of templates this recognizer will recognize.
	 * 
	 * @param templates the set of templates this recognizer will recognize
	 */
	public void setTemplateSet(List<Template> templates) {
		patterns.clear();
		for (Template t : templates) {
			normalize(t.pts);
			patterns.add(new Pattern(t, generateEquiDistantProgressiveSubSequences(t.pts, 200)));
		}
		for (Pattern pattern : patterns) {
			List<List<Pt>> segments = new ArrayList<List<Pt>>();
			for (List<Pt> pts : pattern.segments) {
				List<Pt> newPts = deepCopyPts(pts);
				normalize(newPts);
				segments.add(resample(newPts, getResamplingPointCount(newPts, samplePointDistance)));
			}
			pattern.segments = segments;
		}
	}

	/**
	 * Outputs a list of templates and their associated probabilities for the given input.
	 * 
	 * @param input a list of input points
	 * @return a list of templates and their associated probabilities
	 */
	public List<Result> recognize(List<Pt> input) {
		return recognize(input, DEFAULT_BETA, DEFAULT_LAMBDA, DEFAULT_KAPPA, DEFAULT_E_SIGMA);
	}

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
	public List<Result> recognize(List<Pt> input, double beta, double lambda, double kappa, double e_sigma) {
		if (input.size() < 2) {
			throw new IllegalArgumentException("input must consist of at least two points");
		}
		List<IncrementalResult> incResults = getIncrementalResults(input, beta, lambda, kappa, e_sigma);
		List<Result> results = getResults(incResults);
		Collections.sort(results);	
		return results;
	}
	
	/**
	 * Normalizes a point sequence so that it is scaled and centred within a defined box.
	 * 
	 * (This method was implemented and exposed in the public interface to ease the
	 * implementation of the demonstrator. This method is not used by the recognition
	 * algorithm.) 
	 * 
	 * @param pts an input point sequence
	 * @param x the horizontal component of the upper-left corner of the defined box
	 * @param y the vertical component of the upper-left corner of the defined box
	 * @param width the width of the defined box
	 * @param height the height of the defined box
	 * @return a newly created point sequence that is centred and fits within the defined box 
	 */
	public static List<Pt> normalize(List<Pt> pts, int x, int y, int width, int height) {
		List<Pt> outPts = deepCopyPts(pts);
		scaleTo(outPts, new Rect(0, 0, width - x, height - y));
		Centroid c = getCentroid(outPts);
		translate(outPts, -c.x, -c.y);
		translate(outPts, width - x, height - y);
		return outPts;
	}
	
	/* End of public interface */
	
	private static double DEFAULT_E_SIGMA = 200.0;
	private static double DEFAULT_BETA = 400.0;
	private static double DEFAULT_LAMBDA = 0.4;
	private static double DEFAULT_KAPPA = 1.0;
	private static final int MAX_RESAMPLING_PTS = 1000;
	private static Rect normalizedSpace = new Rect(0, 0, 1000, 1000);
	private int samplePointDistance;
	private List<Pattern> patterns = new ArrayList<Pattern>();
	
	private List<Result> getResults(List<IncrementalResult> incrementalResults) {
		List<Result> results = new ArrayList<Result>(incrementalResults.size());
		for (IncrementalResult ir : incrementalResults) {
			Result r = new Result(ir.pattern.template, ir.prob, ir.pattern.segments.get(ir.indexOfMostLikelySegment));
			results.add(r);
		}
		return results;
	}
	
	private List<IncrementalResult> getIncrementalResults(List<Pt> input, double beta, double lambda, double kappa, double e_sigma) {
		List<IncrementalResult> results = new ArrayList<IncrementalResult>();
		List<Pt> unkPts = deepCopyPts(input);
		normalize(unkPts);
		for (Pattern pattern : patterns) {
			IncrementalResult result = getIncrementalResult(unkPts, pattern, beta, lambda, e_sigma);
			List<Pt> lastSegmentPts = pattern.segments.get(pattern.segments.size()-1);
			double completeProb = getLikelihoodOfMatch(resample(unkPts, lastSegmentPts.size()), lastSegmentPts, e_sigma, e_sigma/beta, lambda);
			double x = 1 - completeProb;
			result.prob *= (1 + kappa*Math.exp(-x*x));
			results.add(result);
		}
		marginalizeIncrementalResults(results);
		return results;
	}
	
	private static void marginalizeIncrementalResults(List<IncrementalResult> results) {
		double totalMass = 0.0d;
		for (IncrementalResult r : results) {
			totalMass+= r.prob; 
		}
		for (IncrementalResult r : results) {
			r.prob/= totalMass;
		}
	}

	private static IncrementalResult getIncrementalResult(List<Pt> unkPts, Pattern pattern, double beta, double lambda, double e_sigma) {
		List<List<Pt>> segments = pattern.segments;
		double maxProb = 0.0d;
		int maxIndex = -1;
		for (int i = 0, n = segments.size(); i < n; i++) {
			List<Pt> pts = segments.get(i);
			int samplingPtCount = pts.size();
			List<Pt> unkResampledPts = resample(unkPts, samplingPtCount);
			double prob = getLikelihoodOfMatch(unkResampledPts, pts, e_sigma, e_sigma/beta, lambda);
			if (prob > maxProb) {
				maxProb = prob;
				maxIndex = i;
			}
		}
		return new IncrementalResult(pattern, maxProb, maxIndex);
	}
	
	private static List<Pt> deepCopyPts(List<Pt> pts) {
		List<Pt> newPts = new ArrayList<Pt>(pts.size());
		for (Pt pt : pts) {
			newPts.add(new Pt(pt.x, pt.y));
		}
		return newPts;
	}
	
	private static void normalize(List<Pt> pts) {
		scaleTo(pts, normalizedSpace);
		Centroid c = getCentroid(pts);
		translate(pts, -c.x, -c.y);
	}
	
	private static void scaleTo(List<Pt> pts, Rect targetBounds) {
		Rect bounds = getBoundingBox(pts);
		double a1 = (double)(targetBounds.width);
		double a2 = (double)(targetBounds.height);
		double b1 = (double)(bounds.width);
		double b2 = (double)(bounds.height);
		double scale = Math.sqrt(a1 * a1 + a2 * a2) / Math.sqrt(b1 * b1 + b2 * b2);
		scale(pts, scale, scale, bounds.x, bounds.y);
	}
	
	private static void scale(List<Pt> pts, double sx, double sy, double originX, double originY) {
		translate(pts, -originX, -originY);
		scale(pts, sx, sy);
		translate(pts, originX, originY);
	}
	
	private static void scale(List<Pt> pts, double sx, double sy) {
		for (Pt pt : pts) {
			pt.x*= sx;
			pt.y*= sy;
		}
	}
	
	private static void translate(List<Pt> pts, double dx, double dy) {
		for (Pt pt : pts) {
			pt.x+= Math.floor(dx);
			pt.y+= Math.floor(dy);
		}
	}
	
	private static Rect getBoundingBox(List<Pt> pts) {
		int minX = Integer.MAX_VALUE;
		int minY = Integer.MAX_VALUE;
		int maxX = Integer.MIN_VALUE;
		int maxY = Integer.MIN_VALUE;
		for (Pt pt : pts) {
			int x = pt.x;
			int y = pt.y;
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
		return new Rect(minX, minY, (maxX - minX), (maxY - minY));
	}
	
	private static Centroid getCentroid(List<Pt> pts) {
		double totalMass = pts.size();
		double xIntegral = 0.0;
		double yIntegral = 0.0;
		for (Pt pt : pts) {
			xIntegral+= pt.x;
			yIntegral+= pt.y;
		}
		return new Centroid(xIntegral / totalMass, yIntegral / totalMass);
	}
	
	private static List<List<Pt>> generateEquiDistantProgressiveSubSequences(List<Pt> pts, int ptSpacing) {
		List<List<Pt>> sequences = new ArrayList<List<Pt>>();
		int nSamplePoints = getResamplingPointCount(pts, ptSpacing);
		List<Pt> resampledPts = resample(pts, nSamplePoints);
		for (int i = 1, n = resampledPts.size(); i < n; i++) {
			List<Pt> seq = deepCopyPts(resampledPts.subList(0, i+1));
			sequences.add(seq);
		}
		return sequences;
	}
	
	private static int getResamplingPointCount(List<Pt> pts, int samplePointDistance) {
		double len = getSpatialLength(pts);
		return (int)(len / samplePointDistance) + 1;
	}
	
	private static double getSpatialLength(List<Pt> pts) {
		double len = 0.0d;
		Iterator<Pt> i = pts.iterator();
		if (i.hasNext()) {
			Pt p0 = i.next();
			while (i.hasNext()) {
				Pt p1 = i.next();
				len+= distance(p0, p1);
				p0 = p1;
			}
		}
		return len;
	}
	
	private static double distance(Pt p1, Pt p2) {
		return distance((int)p1.x, (int)p1.y, (int)p2.x, (int)p2.y);
	}

	private static int distance(int x1, int y1, int x2, int y2) {
		if ((x2 -= x1) < 0) {
			x2 = -x2;
		}
		if ((y2 -= y1) < 0) {
			y2 = -y2;
		}
		return (x2 + y2 - (((x2 > y2) ? y2 : x2) >> 1) );
	}
	
	private static double getLikelihoodOfMatch(List<Pt> pts1, List<Pt> pts2, double eSigma, double aSigma, double lambda) {
		if (eSigma == 0 || eSigma < 0) {
			throw new IllegalArgumentException("eSigma must be positive");
		}
		if (aSigma == 0 || eSigma < 0) {
			throw new IllegalArgumentException("aSigma must be positive");
		}
		if (lambda < 0 || lambda > 1) {
			throw new IllegalArgumentException("lambda must be in the range between zero and one");
		}
		double x_e = getEuclidianDistance(pts1, pts2);
		double x_a = getTurningAngleDistance(pts1, pts2);
		return Math.exp(- (x_e * x_e / (eSigma * eSigma) * lambda + x_a * x_a / (aSigma * aSigma) * (1 - lambda)));
	}

	private static double getEuclidianDistance(List<Pt> pts1, List<Pt> pts2) {
		if (pts1.size() != pts2.size()) {
			throw new IllegalArgumentException("lists must be of equal lengths, cf. " + pts1.size() + " with " + pts2.size());
		}
		int n = pts1.size();
		double td = 0;
		for (int i = 0; i < n; i++) {
			td+= getEuclideanDistance(pts1.get(i), pts2.get(i));
		}
		return td / n;
	}
	
	private static double getTurningAngleDistance(List<Pt> pts1, List<Pt> pts2) {
		if (pts1.size() != pts2.size()) {
			throw new IllegalArgumentException("lists must be of equal lengths, cf. " + pts1.size() + " with " + pts2.size());
		}
		int n = pts1.size();
		double td = 0;
		for (int i = 0; i < n - 1; i++) {
			td+= Math.abs(getTurningAngleDistance(pts1.get(i), pts1.get(i + 1), pts2.get(i), pts2.get(i + 1)));
		}
		if (Double.isNaN(td)) {
			return 0.0;
		}
		return td / (n - 1);
	}
	
	private static double getEuclideanDistance(Pt pt1, Pt pt2) {
		return Math.sqrt(getSquaredEuclidenDistance(pt1, pt2));
	}
	
	private static double getSquaredEuclidenDistance(Pt pt1, Pt pt2) {
		return (pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y);
	}
	
	private static double getTurningAngleDistance(Pt ptA1, Pt ptA2, Pt ptB1, Pt ptB2) {		
		double len_a = getEuclideanDistance(ptA1, ptA2);
		double len_b = getEuclideanDistance(ptB1, ptB2);
		if (len_a == 0 || len_b == 0) {
			return 0.0;
		}
		else {
			float cos = (float)(((ptA1.x - ptA2.x) * (ptB1.x - ptB2.x) + (ptA1.y - ptA2.y)*(ptB1.y - ptB2.y) ) / (len_a * len_b));
			if (Math.abs(cos) > 1.0) {
				return 0.0;
			}
			else {
				return Math.acos(cos);
			}
		}
	}
	
	private static List<Pt> resample(List<Pt> points, int numTargetPoints) {
		List<Pt> r = new ArrayList<Pt>();
		int[] inArray = toArray(points);
		int[] outArray = new int[numTargetPoints * 2];
		
		resample(inArray, outArray, points.size(), numTargetPoints);
		for (int i = 0, n = outArray.length; i < n; i+= 2) {
			r.add(new Pt(outArray[i], outArray[i + 1], false));
		}
		return r;
	}

	private static int[] toArray(List<Pt> points) {
		int[] out = new int[points.size() * 2];
		for (int i = 0, n = points.size() * 2; i < n; i+= 2) {
			out[i] = (int)points.get(i / 2).x;
			out[i + 1] = (int)points.get(i / 2).y;
		}
		return out;
	}
	
	private static void resample(int[] template, int[] buffer, int n, int numTargetPoints) {
		int[] segment_buf = new int[MAX_RESAMPLING_PTS];

		double l, segmentLen, horizRest, verticRest, dx, dy;
		int x1, y1, x2, y2;
		int i, m, a, segmentPoints, j, maxOutputs, end;

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
							buffer[a] = (int) (x1 + horizRest);
							buffer[a + 1] = (int) (y1 + verticRest);
							horizRest = 0.0;
							verticRest = 0.0;
							a += 2;
						}
					}
					else {
						if (a < maxOutputs) {
							buffer[a] = (int) (x1 + j * dx);
							buffer[a + 1] = (int) (y1 + j * dy);
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
	}
	
	private static double getSegmentPoints(int[] pts, int n, double length, int[] buffer) {
		int i, m;
		int x1, y1, x2, y2, ps;
		double rest, currentLen;

		m = n * 2;
		rest = 0.0f;
		x1 = pts[0];
		y1 = pts[1];
		for (i = 2; i < m; i += 2) {
			x2 = pts[i];
			y2 = pts[i + 1];
			currentLen = distance(x1, y1, x2, y2);
			currentLen += rest;
			rest = 0.0f;
			ps = (int) ((currentLen / length));
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
	}

	private static int getSpatialLength(int[] pat, int n) {
		int l;
		int i, m;
		int x1, y1, x2, y2;

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
	}

	private static class Pattern {
		Template template;
		private List<List<Pt>> segments;
		private Pattern(Template template, List<List<Pt>> segments) {
			this.template = template;
			this.segments = segments;
		}
	}
	
	private static class Rect {
		private int x;
		private int y;
		private int width;
		private int height;
		private Rect(int x, int y, int width, int height) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
	}
	
	private static class Centroid {
		private double x;
		private double y;
		private Centroid(double x, double y) {
			this.x = x;
			this.y = y;
		}
	}
	
	private static class IncrementalResult {
		private Pattern pattern;
		private double prob;
		private int indexOfMostLikelySegment;
		private IncrementalResult(Pattern pattern, double prob, int indexOfMostLikelySegment) {
			this.pattern = pattern;
			this.prob = prob;
			this.indexOfMostLikelySegment = indexOfMostLikelySegment;
		}
	}

}
