/**
 * Compilation: NonuniformGrid.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Generates a non-uniform grid pattern with variable column widths 
 * and row heights.Each grid cell contains a nested inner rectangle 
 * with random offset and corner connections. 
 * 
 * Algorithm: Random grid generation with scaling
 * - Generate random base dimensions for columns and rows
 * - Scale dimensions proportionally to fit canvas
 * - For each cell, draw outer rectangle with nested inner rectangle
 * - Inner rectangles have random margins and positional offsets
 * - Connect outer and inner rectangle corners with diagonal lines
 * 
 * Scaling approach: Random base dimensions are normalized and scaled to fill
 * the canvas exactly, maintaining aspect ratios while fitting bounds.
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const COLS = 5;  // number of columns in grid
const ROWS = 4;  // number of rows in grid

// Random dimension parameters
const MIN_BASE_DIM = 20;   // minimum base dimension for columns/rows
const MAX_BASE_DIM = 100;  // maximum base dimension for columns/rows

// Inner rectangle parameters
const MIN_MARGIN = 0.3;    // minimum margin as fraction of cell size
const MAX_MARGIN = 0.4;    // maximum margin as fraction of cell size
const MAX_OFFSET = 0.3;    // maximum random offset as fraction of cell size

// Global state
let baseColWidths = [];    // random base widths for each column
let baseRowHeights = [];   // random base heights for each row

/**
 * Initialize canvas and generate grid
 * @effects creates canvas, generates random grid dimensions, and sets drawing to static mode
 */
function setup() {
  createCanvas(400, 400);
  generateRandomGrid();
  noLoop();
}

/**
 * Main rendering loop
 * 
 * Algorithm:
 * 1. Calculate total base dimensions (sum of random column widths and row heights)
 * 2. Compute scaling factors to fit canvas (width/totalBaseW, height/totalBaseH)
 * 3. For each cell in grid:
 *    a. Scale base dimensions to actual pixel dimensions
 *    b. Draw outer rectangle at calculated position
 *    c. Draw inner rectangle with random margin and offset
 *    d. Connect corners of outer and inner rectangles
 * 
 * The scaling ensures that regardless of random base dimensions, the grid
 * always fills the entire canvas exactly.
 * 
 * @requires setup() has been called and grid dimensions generated
 * @effects draws random grid pattern with nested rectangles to canvas
 */
function draw() {
  background(250);  // off-white background
  stroke(0);        // black outlines
  noFill();
  
  // Calculate total base dimensions
  let totalBaseW = 0;
  for (let i = 0; i < baseColWidths.length; i++) {
    totalBaseW += baseColWidths[i];
  }
  
  let totalBaseH = 0;
  for (let j = 0; j < baseRowHeights.length; j++) {
    totalBaseH += baseRowHeights[j];
  }
  
  // Compute scaling factors to fit canvas
  // These convert base units to pixel dimensions
  const scaleX = width / totalBaseW;
  const scaleY = height / totalBaseH;
  
  // Render grid cells
  let y = 0;
  for (let r = 0; r < ROWS; r++) {
    const rowH = baseRowHeights[r] * scaleY;
    let x = 0;
    
    for (let c = 0; c < COLS; c++) {
      const colW = baseColWidths[c] * scaleX;
      
      // Draw cell with nested inner rectangle and corner connections
      drawCellWithInner(x, y, colW, rowH);
      
      x += colW;
    }
    
    y += rowH;
  }
}

/**
 * Generate random base dimensions for grid
 * 
 * Creates random widths for each column and random heights for each row.
 * These base dimensions will be scaled to fit the canvas during rendering.
 * 
 * @effects populates global baseColWidths and baseRowHeights arrays with random values
 */
function generateRandomGrid() {
  baseColWidths = [];
  baseRowHeights = [];
  
  // Generate random base width for each column
  for (let i = 0; i < COLS; i++) {
    baseColWidths.push(random(MIN_BASE_DIM, MAX_BASE_DIM));
  }
  
  // Generate random base height for each row
  for (let j = 0; j < ROWS; j++) {
    baseRowHeights.push(random(MIN_BASE_DIM, MAX_BASE_DIM));
  }
}

/**
 * Draw a grid cell with nested inner rectangle and corner connections
 * 
 * Algorithm:
 * 1. Draw outer rectangle at cell position
 * 2. Calculate inner rectangle dimensions with random margin
 * 3. Apply random positional offset to inner rectangle
 * 4. Draw inner rectangle with random fill shade
 * 5. Connect corresponding corners of outer and inner rectangles
 * 
 * The random margin (30-40% of cell size) and offset (±30% of cell size)
 * create organic variation while maintaining clear visual relationships.
 * 
 * @param {number} x - x-coordinate of cell's top-left corner
 * @param {number} y - y-coordinate of cell's top-left corner
 * @param {number} w - width of cell in pixels
 * @param {number} h - height of cell in pixels
 * @effects draws outer rectangle, inner rectangle, and connecting lines
 */
function drawCellWithInner(x, y, w, h) {
  // Draw outer rectangle
  fill(250);  // off-white fill
  rect(x, y, w, h);
  
  // Calculate inner rectangle dimensions with random margin
  const margin = random(MIN_MARGIN, MAX_MARGIN);
  const iw = w * (1 - 2 * margin);
  const ih = h * (1 - 2 * margin);
  
  // Apply random offset (±30% of cell dimensions)
  const offsetX = random(-w * MAX_OFFSET, w * MAX_OFFSET);
  const offsetY = random(-h * MAX_OFFSET, h * MAX_OFFSET);
  
  // Calculate inner rectangle position (centered + offset)
  const ix = x + w * margin + offsetX;
  const iy = y + h * margin + offsetY;
  
  // Draw inner rectangle with random grayscale fill
  fill(random(230, 250));
  rect(ix, iy, iw, ih);
  
  // Draw corner connections between outer and inner rectangles
  line(x, y, ix, iy);                      // top-left to top-left
  line(x + w, y, ix + iw, iy);             // top-right to top-right
  line(x + w, y + h, ix + iw, iy + ih);    // bottom-right to bottom-right
  line(x, y + h, ix, iy + ih);             // bottom-left to bottom-left
}