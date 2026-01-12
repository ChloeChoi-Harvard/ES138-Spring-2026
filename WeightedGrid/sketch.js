/**
 * Compilation: WeightedGrid.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Generates a grid pattern where certain lines are emphasized with 
 * greater stroke weight at regular intervals. 
 * 
 * Algorithm: Grid with weighted intervals
 * - Draw horizontal lines with regular spacing
 * - Every Nth horizontal line uses thick stroke weight
 * - Draw vertical lines with regular spacing  
 * - Every Nth vertical line uses thick stroke weight
 * - Default lines are thin, major interval lines are thick
 * 
 * Visual hierarchy: Major grid lines (thick) create primary divisions,
 * while minor grid lines (thin) provide finer subdivisions.
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const NUM_VERTICAL = 4;          // total number of vertical lines
const NUM_HORIZONTAL = 180;      // total number of horizontal lines

// Weight intervals
const MAJOR_STEP_VERTICAL = 1;      // every Nth vertical line is thick
const MAJOR_STEP_HORIZONTAL = 20;   // every Nth horizontal line is thick

// Stroke weights
const THIN_WEIGHT = 0.25;   // stroke weight for minor grid lines
const THICK_WEIGHT = 1.5;   // stroke weight for major grid lines

/**
 * Initialize canvas and render weighted grid
 * @effects creates canvas, sets background and stroke, draws grid pattern
 */
function setup() {
  createCanvas(500, 500);
  background(245);  // light gray background
  stroke(0);        // black lines
  
  drawHorizontals();
  drawVerticals();
}

/**
 * Draw horizontal lines with weighted intervals
 * 
 * Algorithm:
 * 1. Calculate vertical spacing for horizontal lines
 * 2. For each line position:
 *    a. Determine if this is a major interval line
 *    b. Set appropriate stroke weight (thick or thin)
 *    c. Draw line spanning full canvas width
 * 
 * Major lines occur at intervals of MAJOR_STEP_HORIZONTAL,
 * creating visual emphasis on every Nth row.
 * 
 * @effects draws horizontal lines across canvas with variable weights
 */
function drawHorizontals() {
  for (let j = 0; j <= NUM_HORIZONTAL; j++) {
    // Determine stroke weight based on major step interval
    let weight = THIN_WEIGHT;  // default to thin
    if (j % MAJOR_STEP_HORIZONTAL === 0) {
      weight = THICK_WEIGHT;   // major interval uses thick weight
    }
    
    strokeWeight(weight);
    const y = (j * height) / NUM_HORIZONTAL;
    line(0, y, width, y);
  }
}

/**
 * Draw vertical lines with weighted intervals
 * 
 * Algorithm:
 * 1. Calculate horizontal spacing for vertical lines
 * 2. For each line position:
 *    a. Determine if this is a major interval line
 *    b. Set appropriate stroke weight (thick or thin)
 *    c. Draw line spanning full canvas height
 * 
 * Major lines occur at intervals of MAJOR_STEP_VERTICAL,
 * creating visual emphasis on every Nth column.
 * 
 * @effects draws vertical lines across canvas with variable weights
 */
function drawVerticals() {
  for (let j = 0; j <= NUM_VERTICAL; j++) {
    // Determine stroke weight based on major step interval
    let weight = THIN_WEIGHT;  // default to thin
    if (j % MAJOR_STEP_VERTICAL === 0) {
      weight = THICK_WEIGHT;   // major interval uses thick weight
    }
    
    strokeWeight(weight);
    const x = (j * width) / NUM_VERTICAL;  // use width for x-coordinate
    line(x, 0, x, height);
  }
}