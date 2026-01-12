/**
 * Compilation: UniformGrid.js
 * Dependencies: p5.js
 * Data files: none
 *
 * Generates a uniform rectangular grid pattern.
 *
 * Algorithm: Grid generation
 * - Calculate cell dimensions from canvas size and grid parameters
 * - Draw vertical lines at regular intervals across canvas height
 * - Draw horizontal lines at regular intervals across canvas width
 * - Lines span entire canvas dimension (edge to edge)
 *
 * For additional information, see:
 * https://en.wikipedia.org/wiki/Grid_(graphic_design)
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const ROWS = 80; // number of horizontal divisions (vertical lines)
const COLS = 40; // number of vertical divisions (horizontal lines)

/**
 * Initialize canvas and render grid
 * @effects creates canvas, sets drawing style, and draws grid pattern
 */
function setup() {
  createCanvas(400, 400);

  background(245); // light gray background
  strokeWeight(0.25); // thin lines

  drawGrid();
}

/**
 * Draw uniform grid pattern
 *
 * Algorithm:
 * 1. Calculate cell height (canvas height / number of rows)
 * 2. Draw vertical lines at regular intervals (one per row boundary)
 * 3. Calculate cell width (canvas width / number of columns)
 * 4. Draw horizontal lines at regular intervals (one per column boundary)
 *
 * Note: Number of lines = number of divisions + 1 (includes edges)
 *
 * @effects draws complete grid of horizontal and vertical lines to canvas
 */
function drawGrid() {
  const cellHeight = height / ROWS; // spacing between horizontal lines
  const cellWidth = width / COLS; // spacing between vertical lines

  // Draw horizontal lines (parallel to x-axis)
  for (let y = 0; y <= ROWS; y++) {
    const yPos = y * cellHeight;
    line(0, yPos, width, yPos);
  }

  // Draw vertical lines (parallel to y-axis)
  for (let x = 0; x <= COLS; x++) {
    const xPos = x * cellWidth;
    line(xPos, 0, xPos, height);
  }
}
