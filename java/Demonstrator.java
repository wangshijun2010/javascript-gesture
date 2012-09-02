/*
 * Demonstrator of
 * Continuous Recognition and Visualization of Pen Strokes and Touch-Screen Gestures
 * Version: 1.1
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
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Container;
import java.awt.Desktop;
import java.awt.Dimension;
import java.awt.EventQueue;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GridLayout;
import java.awt.Insets;
import java.awt.RenderingHints;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.font.TextLayout;
import java.awt.geom.Rectangle2D;
/* Begin conditional compilation block: Only for JFrame */
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
/* End conditional compilation block: Only for JFrame */
import java.awt.image.BufferedImage;
import java.net.URI;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
/* Begin conditional compilation block: Only for JFrame */
import java.util.Locale;
/* End conditional compilation block: Only for JFrame */

import javax.swing.ButtonGroup;
import javax.swing.Icon;
import javax.swing.ImageIcon;
/* Begin conditional compilation block: Only for JApplet */
//import javax.swing.JApplet;
/* End conditional compilation block: Only for JApplet */
/* Begin conditional compilation block: Only for JFrame */
import javax.swing.JFrame;
/* End conditional compilation block: Only for JFrame */
import javax.swing.JLabel;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButtonMenuItem;
/* Begin conditional compilation block: Only for JFrame */
import javax.swing.UIManager;
/* End conditional compilation block: Only for JFrame */
import javax.swing.border.EtchedBorder;
import javax.swing.border.LineBorder;
import javax.swing.border.TitledBorder;

/**
 * Demonstrator to be used in conjunction with: ContinuousGestureRecognizer.java.
 * 
 * History:
 * Version 1.0 (August 12, 2011)   - Initial public release
 * Version 1.1 (September 6, 2011) - Added random stroke set, code simplified, better graphics.
 *                                 
 * 
 * Copyright (C) 2011 Per Ola Kristensson, University of St Andrews, UK.
 * 
 * Documentation is here: http://pokristensson.com/increc.html
 * 
 * If you use this code for your research then please remember to cite our paper:
 * 
 * Kristensson, P.O. and Denby, L.C. 2011. Continuous recognition and visualization
 * of pen strokes and touch-screen gestures. In Procceedings of the 8th Eurographics
 * Symposium on Sketch-Based Interfaces and Modeling (SBIM 2011). ACM Press: 95-102.
 * 
 * @author Per Ola Kristensson
 *
 */
@SuppressWarnings("serial")
/* Begin conditional compilation block: Only for JFrame */
public class Demonstrator extends JFrame {
/* End conditional compilation block: Only for JFrame */
/* Begin conditional compilation block: Only for JApplet */
//public class Demonstrator extends JApplet {
/* End conditional compilation block: Only for JApplet */
	
	/* Begin conditional compilation block: Only for JFrame */
	private static final String WINDOW_TITLE = "Demonstrator of Continuous Recognition and Visualization of Pen Strokes and Touch-Screen Gestures";
	/* End conditional compilation block: Only for JFrame */
	private static final String STROKE_SET1 = "Randomly Generated Strokes";
	private static final String STROKE_SET2 = "Eight Directional Straight Line Strokes";
	private static final String STROKE_SET3 = "The Stroke Set in Fig. 5 in the Paper (p. 99, Proc. SBIM 2011)";
	private static final String PROBABILITY_LABEL = "Probability";
	
	/* Begin conditional compilation block: Only for JFrame */
	private WindowListener windowListener = new WindowAdapter() {
		@Override
		public void windowClosing(WindowEvent e) {
			System.exit(0);
		}
	};
	/* End conditional compilation block: Only for JFrame */
	
	/**
	 * Constructs the demonstrator.
	 * 
	 * Creates a window and provides the system with two template sets for
	 * the user to play with.
	 */
	public Demonstrator() {
		/* Begin conditional compilation block: Only for JFrame */
		addWindowListener(windowListener);
		setTitle(WINDOW_TITLE);
		/* End conditional compilation block: Only for JFrame */
		Container contentPane = getContentPane();
		contentPane.setLayout(new BorderLayout());
		List<ContinuousGestureRecognizer.Template> templates = generateTwoProgressiveRandomTemplates();
		final UpdatePane updatePane = new UpdatePane(templates);
		updatePane.setBorder(new TitledBorder(new EtchedBorder(), STROKE_SET1));
		contentPane.add(updatePane, BorderLayout.SOUTH);
		final InputPane inputPane = new InputPane(templates, updatePane);
		inputPane.setPreferredSize(new Dimension(200, 200));
		contentPane.add(inputPane, BorderLayout.CENTER);
		JMenuBar menuBar = new JMenuBar();
		JMenu menu1 = new JMenu("Gesture Set");
		menuBar.add(menu1);
		JMenuItem menuItem11 = new JRadioButtonMenuItem(STROKE_SET1, true);
		menuItem11.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				List<ContinuousGestureRecognizer.Template> templates = generateTwoProgressiveRandomTemplates();
				updatePane.setTemplates(templates);
				inputPane.setTemplates(templates);
				updatePane.setBorder(new TitledBorder(new EtchedBorder(), STROKE_SET1));
			}
		});
		menu1.add(menuItem11);
		JMenuItem menuItem12 = new JRadioButtonMenuItem(STROKE_SET2, false);
		menuItem12.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				List<ContinuousGestureRecognizer.Template> templates = generateDirectionalTemplates();
				updatePane.setTemplates(templates);
				inputPane.setTemplates(templates);
				updatePane.setBorder(new TitledBorder(new EtchedBorder(), STROKE_SET2));
			}
		});
		menu1.add(menuItem12);
		JMenuItem menuItem13 = new JRadioButtonMenuItem(STROKE_SET3, false);
		menuItem13.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				List<ContinuousGestureRecognizer.Template> templates = generateFig5Templates();
				updatePane.setTemplates(templates);
				inputPane.setTemplates(templates);
				updatePane.setBorder(new TitledBorder(new EtchedBorder(), STROKE_SET3));
			}
		});
		menu1.add(menuItem13);
		ButtonGroup buttonGroup = new ButtonGroup();
		buttonGroup.add(menuItem11);
		buttonGroup.add(menuItem12);
		buttonGroup.add(menuItem13);
		JMenu menu2 = new JMenu("Help");
		menuBar.add(menu2);
		JMenuItem menuItem21 = new JMenuItem("Read Research Paper (PDF)");
		menuItem21.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				try {
					Desktop.getDesktop().browse(new URI("http://pokristensson.com/pubs/KristenssonDenbySBIM2011.pdf"));
				}
				catch (Exception ex) {
					JOptionPane.showMessageDialog(null, "Cannot open URL", "Error", JOptionPane.ERROR_MESSAGE, null);
				}
			}
		});
		menu2.add(menuItem21);
		JMenuItem menuItem22 = new JMenuItem("About Demonstrator");
		menuItem22.addActionListener(new ActionListener() {
			@Override
			public void actionPerformed(ActionEvent e) {
				ImageIcon icon = null;
				try {
					icon = new ImageIcon(new URL("http://www.st-andrews.ac.uk/media/crest.gif"));
				}
				catch (Exception ex) {
				}
				String msg = 
					"Demonstrator\n" +
					"Version 1.1\n" +
					"Copyright (C) 2011 Per Ola Kristensson, University of St Andrews, UK\n" +
					"\n" +
					"Written by Per Ola Kristensson\n" +
					"<pok@st-andrews.ac.uk>\n" +
					"School of Computer Science\n" +
					"University of St Andrews\n" +
					"\n" +
					"Reference:\n" +
					"Kristensson, P.O. and Denby, L.C. 2011. Continuous\n" +
					"recognition and visualization of pen strokes and\n" +
					"touch-screen gestures. In Proceedings of the 8th\n" +
					"Eurographics Symposium on Sketch-Based Interfaces\n" +
					"and Modeling (SBIM 2011). ACM Press: 95-102.\n" +
					"\n";
				JOptionPane.showMessageDialog(null, msg, "About Demonstrator", JOptionPane.INFORMATION_MESSAGE, icon);
			}
		});
		menu2.add(menuItem22);
		setJMenuBar(menuBar);
		/* Begin conditional compilation block: Only for JFrame */
		pack();
		setLocationByPlatform(true);
		/* End conditional compilation block: Only for JFrame */
		setVisible(true);
	}

		
	/* Begin conditional compilation block: Only for JFrame */
	/**
	 * Creates the demonstrator.
	 * 
	 * @param args command-line arguments; this parameter is ignored
	 */
	public static void main(String[] args) {
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		}
		catch (Exception e) {
		}
		Locale.setDefault(Locale.US);
		EventQueue.invokeLater(new Runnable() {
			@Override
			public void run() {
				new Demonstrator();
			}
		});
	}
	/* End conditional compilation block: Only for JFrame */
	
	/* Begin conditional compilation block: Only for JApplet */
//	@Override
//	public void init() {
//		EventQueue.invokeLater(new Runnable() {
//			@Override
//			public void run() {
//				new Demonstrator();
//			}
//		});
//	}
	/* End conditional compilation block: Only for JApplet */
	
	/**
	 * This class shows recognition updates for all templates registered.
	 * 
	 * It can handle an arbitrary amount of templates. Updates are done by
	 * calling setValue with a template id and the new probability the template
	 * is associated with. 
	 * 
	 * @author Per Ola Kristensson
	 *
	 */
	private static class UpdatePane extends JPanel {
		
		private LinkedHashMap<String, JLabel> labelMap = new LinkedHashMap<String, JLabel>();
		DecimalFormat f = new DecimalFormat("0.00000");
		
		private UpdatePane(List<ContinuousGestureRecognizer.Template> templates) {
			super();
			setTemplates(templates);
		}
		
		private void setTemplates(List<ContinuousGestureRecognizer.Template> templates) {
			labelMap.clear();
			removeAll();
			int cells = templates.size() * 2;
			int rows = cells / 4;
			setLayout(new GridLayout(rows, 8));
			for (ContinuousGestureRecognizer.Template t : templates) {
				JLabel l = new JLabel(createIconForTemplate(t));
				l.setBorder(new TitledBorder(t.id));
				add(l);
				JLabel v = new JLabel(" ");
				v.setBorder(new TitledBorder(PROBABILITY_LABEL));
				add(v);
				labelMap.put(t.id.toLowerCase(), v);
			}
			revalidate();
		}
		
		private Icon createIconForTemplate(ContinuousGestureRecognizer.Template template) {
			BufferedImage bImg = new BufferedImage(100, 100, BufferedImage.TYPE_INT_ARGB);
			Graphics2D g2d = bImg.createGraphics();
			g2d.setColor(Color.WHITE);
			g2d.fillRect(0, 0, bImg.getWidth(), bImg.getHeight());
			List<ContinuousGestureRecognizer.Pt> pts = ContinuousGestureRecognizer.normalize(template.pts, Math.round(bImg.getWidth() * 0.25f), Math.round(bImg.getHeight() * 0.25f), Math.round(bImg.getWidth() * 0.75f), Math.round(bImg.getHeight() * 0.75f));
			paintTemplate(g2d, Color.BLACK, pts);
			g2d.dispose();
			ImageIcon icon = new ImageIcon(bImg);
			return icon;
		}
		
		private void paintTemplate(Graphics2D g2d, Color color, List<ContinuousGestureRecognizer.Pt> pts) {
			g2d.setColor(color);
			Object oldAAHint = g2d.getRenderingHint(RenderingHints.KEY_ANTIALIASING);
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			Iterator<ContinuousGestureRecognizer.Pt> i = pts.iterator();
			if (i.hasNext()) {
				ContinuousGestureRecognizer.Pt pt0 = i.next();
				g2d.drawOval(pt0.x - 5, pt0.y - 5, 10, 10);
				while (i.hasNext()) {
					ContinuousGestureRecognizer.Pt pt1 = i.next();
					g2d.drawLine(pt0.x, pt0.y, pt1.x, pt1.y);
					pt0 = pt1;
				}
			}
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, oldAAHint);
		}
		
		private void resetValues() {
			for (JLabel l : labelMap.values()) {
				l.setText(" ");
				l.setBorder(new TitledBorder(PROBABILITY_LABEL));
			}
		}
		
		private void highlightValue(String id) {
			JLabel h = labelMap.get(id.toLowerCase());
			for (JLabel l : labelMap.values()) {
				if (l == h) {
					l.setBorder(new TitledBorder(new LineBorder(Color.BLACK, 2), PROBABILITY_LABEL));
				}
				else {
					l.setBorder(new TitledBorder(PROBABILITY_LABEL));
				}
			}
		}
		
		private void setValue(String id, double value) {
			JLabel v = labelMap.get(id.toLowerCase());
			if (v != null) {
				v.setText(f.format(value));
			}
		}
		
	}

	/**
	 * This class does the following:
	 * 
	 * 1. Keeps track of pointer events---up, down, drag.
	 * 2. Calls the recognizer when drag or up events have occurred.
	 * 3. Delegates recognition results to the update pane above.
	 * 
	 * @author Per Ola Kristensson
	 *
	 */
	private static class InputPane extends JPanel {
		
		private MouseListener mouseListener = new MouseAdapter() {
			@Override
			public void mousePressed(MouseEvent e) {
				handlePress(e.getX(), e.getY());
			}
			@Override
			public void mouseReleased(MouseEvent e) {
				handleRelease(e.getX(), e.getY());
			}
		};
		private MouseMotionListener mouseMotionListener = new MouseAdapter() {
			@Override
			public void mouseDragged(MouseEvent e) {
				handleDrag(e.getX(), e.getY());
			}
		};
		
		ContinuousGestureRecognizer recognizer = null;
		List<ContinuousGestureRecognizer.Pt> input = new ArrayList<ContinuousGestureRecognizer.Pt>();
		private UpdatePane updatePane = null;
		
		private InputPane(List<ContinuousGestureRecognizer.Template> templates, UpdatePane updatePane) {
			super();
			if (templates == null) {
				throw new NullPointerException("templates cannot be null");
			}
			if (updatePane == null) {
				throw new NullPointerException("updatePane cannot be null");
			}
			this.updatePane = updatePane;
			addMouseListener(mouseListener);
			addMouseMotionListener(mouseMotionListener);
			/*
			 * Creates the continuous gesture recognizer for the template set. This
			 * template set can be changed later by calling the recognizer's
			 * setTemplateSet method. The second parameter is the distance between
			 * sampling points in the normalized gesture space (1000 x 1000 units).
			 * A lower value improves precision at the cost of increased memory and
			 * processing time.
			 */
			recognizer = new ContinuousGestureRecognizer(templates, 5);
		}
		
		private void setTemplates(List<ContinuousGestureRecognizer.Template> templates) {
			recognizer.setTemplateSet(templates);
		}
		
		private void handlePress(int x, int y) {
			input.clear();
			input.add(new ContinuousGestureRecognizer.Pt(x, y, false));
			repaint();
		}
		
		private void handleDrag(int x, int y) {
			input.add(new ContinuousGestureRecognizer.Pt(x, y, false));
			recognize();
			repaint();
		}
		
		private void handleRelease(int x, int y) {
			input.add(new ContinuousGestureRecognizer.Pt(x, y, false));
			input.clear();
			recognize();
			updatePane.resetValues();
			repaint();
		}
		
		private void recognize() {
			if (input == null || input.size() < 2) {
				return;
			}
			List<ContinuousGestureRecognizer.Result> results = recognizer.recognize(input);
			if (results == null) {
				return;
			}
			for (ContinuousGestureRecognizer.Result r : results) {
				updatePane.setValue(r.template.id, r.prob);
			}
			if (results.size() > 0) {
				updatePane.highlightValue(results.get(0).template.id);
			}
		}
		
		@Override
		protected void paintComponent(Graphics g) {
			Graphics2D g2d = (Graphics2D)g;
			paintBackground(g2d, Color.WHITE);
			paintInput(g2d, Color.BLACK);
		}
		
		private void paintBackground(Graphics2D g2d, Color color) {
			g2d.setColor(color);
			Insets insets = getInsets();
			Dimension d = getSize();
			int w = d.width - (insets.left + insets.right);
			int h = d.height - (insets.top + insets.bottom);
			g2d.fillRect(0, 0, w, h);
			Object oldAAHint = g2d.getRenderingHint(RenderingHints.KEY_ANTIALIASING);
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			Font font = new Font("SanSerif", Font.BOLD, 48);
			TextLayout layout = new TextLayout("Draw here", font, g2d.getFontRenderContext());
			Rectangle2D bounds = layout.getBounds();
			int x = w / 2 - (int)Math.round((bounds.getWidth()) / 2.0d);
			int y = h / 2 - (int)Math.round((bounds.getHeight()) / 2.0d) + (int)Math.round(bounds.getHeight());
			g2d.setColor(Color.LIGHT_GRAY);
			layout.draw(g2d, x, y);
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, oldAAHint);
		}
		
		private void paintInput(Graphics2D g2d, Color color) {
			g2d.setColor(color);
			Object oldAAHint = g2d.getRenderingHint(RenderingHints.KEY_ANTIALIASING);
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			Iterator<ContinuousGestureRecognizer.Pt> i = input.iterator();
			if (i.hasNext()) {
				ContinuousGestureRecognizer.Pt pt0 = i.next();
				g2d.drawOval(pt0.x - 5, pt0.y - 5, 10, 10);
				while (i.hasNext()) {
					ContinuousGestureRecognizer.Pt pt1 = i.next();
					g2d.drawLine(pt0.x, pt0.y, pt1.x, pt1.y);
					pt0 = pt1;
				}
			}
			g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, oldAAHint);
		}
		
	}
	
	private static List<ContinuousGestureRecognizer.Template> generateTwoProgressiveRandomTemplates() {
		List<ContinuousGestureRecognizer.Template> templates = new ArrayList<ContinuousGestureRecognizer.Template>();
		for (int i = 1; i < 9; i++) {
			if (i < 3) {
				templates.add(generateRandomTemplate(null, "Random " + Integer.toString(i), 2));
			}
			else {
				templates.add(generateRandomTemplate(templates.get(i - 3).pts, "Random " + Integer.toString(i), 1));
			}
		}
		return templates;
	}
	
	private static ContinuousGestureRecognizer.Template generateRandomTemplate(List<ContinuousGestureRecognizer.Pt> base, String id, int maxPoints) {
		List<ContinuousGestureRecognizer.Pt> points = new ArrayList<ContinuousGestureRecognizer.Pt>();
		if (base != null) {
			for (ContinuousGestureRecognizer.Pt pt : base) {
				points.add(new ContinuousGestureRecognizer.Pt(pt.x, pt.y));
			}
		}
		for (int i = 0; i < maxPoints; i++) {
			int x = -500 + (int)Math.round(Math.random() * 1000.0d);
			int y = -500 + (int)Math.round(Math.random() * 1000.0d);
			points.add(new ContinuousGestureRecognizer.Pt(x, y));
		}
		return new ContinuousGestureRecognizer.Template(id, points);
	}

	private static List<ContinuousGestureRecognizer.Template> generateDirectionalTemplates() {
		List<ContinuousGestureRecognizer.Template> directionalTemplates = new ArrayList<ContinuousGestureRecognizer.Template>();
		List<ContinuousGestureRecognizer.Pt> nPoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		nPoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		nPoints.add(new ContinuousGestureRecognizer.Pt(0, -1));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("North", nPoints));
		List<ContinuousGestureRecognizer.Pt> sPoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		sPoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		sPoints.add(new ContinuousGestureRecognizer.Pt(0, 1));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("South", sPoints));
		List<ContinuousGestureRecognizer.Pt> wPoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		wPoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		wPoints.add(new ContinuousGestureRecognizer.Pt(-1, 0));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("West", wPoints));
		List<ContinuousGestureRecognizer.Pt> ePoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		ePoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		ePoints.add(new ContinuousGestureRecognizer.Pt(1, 0));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("East", ePoints));
		List<ContinuousGestureRecognizer.Pt> nwPoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		nwPoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		nwPoints.add(new ContinuousGestureRecognizer.Pt(-1, -1));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("NorthWest", nwPoints));
		List<ContinuousGestureRecognizer.Pt> nePoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		nePoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		nePoints.add(new ContinuousGestureRecognizer.Pt(1, -1));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("NorthEast", nePoints));
		List<ContinuousGestureRecognizer.Pt> swPoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		swPoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		swPoints.add(new ContinuousGestureRecognizer.Pt(-1, 1));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("SouthWest", swPoints));
		List<ContinuousGestureRecognizer.Pt> sePoints = new ArrayList<ContinuousGestureRecognizer.Pt>();
		sePoints.add(new ContinuousGestureRecognizer.Pt(0, 0));
		sePoints.add(new ContinuousGestureRecognizer.Pt(1, 1));
		directionalTemplates.add(new ContinuousGestureRecognizer.Template("SouthEast", sePoints));
		return directionalTemplates;
	}
	
	private static List<ContinuousGestureRecognizer.Template> generateFig5Templates() {
		List<ContinuousGestureRecognizer.Template> fig5Templates = new ArrayList<ContinuousGestureRecognizer.Template>();
		List<ContinuousGestureRecognizer.Pt> t1Points = new ArrayList<ContinuousGestureRecognizer.Pt>();
		t1Points.add(new ContinuousGestureRecognizer.Pt(0, 0));
		t1Points.add(new ContinuousGestureRecognizer.Pt(0, 1));
		fig5Templates.add(new ContinuousGestureRecognizer.Template("Template 1", t1Points));
		List<ContinuousGestureRecognizer.Pt> t2Points = new ArrayList<ContinuousGestureRecognizer.Pt>();
		t2Points.add(new ContinuousGestureRecognizer.Pt(0, 0));
		t2Points.add(new ContinuousGestureRecognizer.Pt(0, 1));
		t2Points.add(new ContinuousGestureRecognizer.Pt(1, 1));
		fig5Templates.add(new ContinuousGestureRecognizer.Template("Template 2", t2Points));
		List<ContinuousGestureRecognizer.Pt> t3Points = new ArrayList<ContinuousGestureRecognizer.Pt>();
		t3Points.add(new ContinuousGestureRecognizer.Pt(0, 0));
		t3Points.add(new ContinuousGestureRecognizer.Pt(0, 1));
		t3Points.add(new ContinuousGestureRecognizer.Pt(-1, 1));
		fig5Templates.add(new ContinuousGestureRecognizer.Template("Template 3", t3Points));
		List<ContinuousGestureRecognizer.Pt> t4Points = new ArrayList<ContinuousGestureRecognizer.Pt>();
		t4Points.add(new ContinuousGestureRecognizer.Pt(0, 0));
		t4Points.add(new ContinuousGestureRecognizer.Pt(0, 1));
		t4Points.add(new ContinuousGestureRecognizer.Pt(1, 1));
		t4Points.add(new ContinuousGestureRecognizer.Pt(1, 2));
		fig5Templates.add(new ContinuousGestureRecognizer.Template("Template 4", t4Points));
		return fig5Templates;
	}

}
