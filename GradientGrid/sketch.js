/**
 * Compilation: GradientGrid.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Generates a grid of rectangles with vertical gradients.
 * 
 * Algorithm: Deterministic animated pattern generation
 * - Create uniform grid with horizontal spacing between rectangles
 * - Apply time-based vertical offset to gradient calculations
 * - Even columns: blue → yellow → blue (mirrored gradient)
 * - Odd columns: blue → red → yellow → red → blue (mirrored gradient)
 * - Scroll position wraps continuously to create infinite loop
 * 
 * Mirror technique: Gradients peak at center (0.5) and fade toward edges (0, 1),
 * creating symmetric color transitions.
 *
 * For additional information, see:
 * https://p5js.org/reference/p5/lerp/
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const COLS = 25;       // number of columns in grid
const ROWS = 25;       // number of rows in grid
const GAP_X = 5;       // horizontal spacing between rectangles in pixels

// Animation parameters
// Set to 0 for no animation.
const SCROLL_SPEED = 0.002;  // scroll increment per frame (smaller = slower)

// Global state
let rectW, rectH;      // rectangle dimensions in pixels
let scroll = 0;        // current scroll position in [0, 1)

// Color palette
let blue, yellow, red;

/**
 * Initialize canvas and compute layout
 * @effects creates canvas, calculates rectangle dimensions, and initializes color palette
 */
function setup() {
  createCanvas(400, 400);
  
  // Calculate rectangle dimensions accounting for gaps
  const totalGapW = GAP_X * (COLS - 1);
  rectW = (width - totalGapW) / COLS;
  rectH = height / ROWS;
  
  noStroke();
  
  // Initialize color palette
  blue = color(0, 80, 255);
  yellow = color(255, 230, 0);
  red = color(255, 50, 50);
}

/**
 * Main rendering loop with continuous animation
 * 
 * Algorithm:
 * 1. Increment scroll position and wrap to [0, 1) range
 * 2. For each grid cell:
 *    a. Calculate base vertical position normalized to [0, 1]
 *    b. Apply scroll offset to create downward motion
 *    c. Select gradient based on column parity (even/odd)
 *    d. Compute color from gradient function
 *    e. Draw rectangle with computed color
 * 
 * The scroll offset creates the illusion of continuous downward movement
 * by shifting the gradient mapping for each rectangle.
 * 
 * @requires setup() has been called
 * @effects animates scrolling gradient pattern across grid
 */
function draw() {
  background(220);  // light gray background
  
  // Update scroll position with wraparound
  scroll = (scroll + SCROLL_SPEED) % 1;
  
  // Render grid
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      // Calculate rectangle position
      const x = i * (rectW + GAP_X);
      const y = j * rectH;
      
      // Normalize vertical position to [0, 1] based on rectangle center
      const baseT = (y + rectH / 2) / height;
      
      // Apply scroll offset for downward motion and wrap to [0, 1)
      const t = (baseT - scroll + 1) % 1;
      
      // Select gradient based on column parity
      let c;
      if (i % 2 === 0) {
        // Even columns: blue → yellow → blue
        c = gradient1(t);
      } else {
        // Odd columns: blue → red → yellow → red → blue
        c = gradient2(t);
      }
      
      fill(c);
      rect(x, y, rectW, rectH);
    }
  }
}

/**
 * Gradient Helper Functions
 * 
 * These functions create mirrored color gradients that peak at the center
 * and fade toward the edges, producing symmetric color transitions.
 */

/**
 * Mirror transformation for gradient parameter
 * 
 * Converts linear [0, 1] input into mirrored [0, 1, 0] output.
 * Creates peak at center (t = 0.5) and valleys at edges (t = 0, 1).
 * 
 * Algorithm:
 * 1. Compute distance from center (0.5)
 * 2. Normalize distance to [0, 1] range
 * 3. Invert to create peak at center
 * 
 * @param {number} t - input value in [0, 1]
 * @returns {number} mirrored value in [0, 1], peaks at 0.5
 */
function mirrorT(t) {
  const distFromCenter = abs(t - 0.5);
  return 1 - (distFromCenter / 0.5);
}

/**
 * Base gradient 1: blue → yellow
 * 
 * Linear interpolation between blue and yellow.
 * Used as the base for the mirrored gradient1.
 * 
 * @param {number} u - interpolation parameter in [0, 1]
 * @returns {p5.Color} interpolated color
 */
function gradient1Base(u) {
  return lerpColor(blue, yellow, u);
}

/**
 * Gradient 1: blue → yellow → blue (mirrored)
 * 
 * @param {number} t - gradient position in [0, 1]
 * @returns {p5.Color} gradient color at position t
 */
function gradient1(t) {
  const u = mirrorT(t);
  return gradient1Base(u);
}

/**
 * Base gradient 2: blue → red → yellow
 * 
 * Two-stage linear interpolation:
 * - [0.0, 0.5]: blue → red
 * - [0.5, 1.0]: red → yellow
 * 
 * Used as the base for the mirrored gradient2.
 * 
 * @param {number} u - interpolation parameter in [0, 1]
 * @returns {p5.Color} interpolated color
 */
function gradient2Base(u) {
  if (u < 0.5) {
    const v = u / 0.5;  // normalize to [0, 1]
    return lerpColor(blue, red, v);
  } else {
    const v = (u - 0.5) / 0.5;  // normalize to [0, 1]
    return lerpColor(red, yellow, v);
  }
}

/**
 * Gradient 2: blue → red → yellow → red → blue (mirrored)
 * 
 * @param {number} t - gradient position in [0, 1]
 * @returns {p5.Color} gradient color at position t
 */
function gradient2(t) {
  const u = mirrorT(t);
  return gradient2Base(u);
}