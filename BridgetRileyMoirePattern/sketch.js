/**
 * Compilation: BridgetRileyMoirePattern.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Generates a moire pattern of Bridget Riley with triangular tiles. 
 * Each column contains three vertical segments where triangle tips 
 * sweep from right-to-left, then left-to-right, then right-to-left.
 * Segment lengths change linearly across columns while maintaining 
 * constant total height.
 * 
 * Algorithm: moire pattern
 * - Divide canvas into uniform grid (COLS × ROWS)
 * - For each column, compute three segment lengths that sum to ROWS
 * - Within each segment, interpolate triangle tip position
 * - Segment 1 grows, Segment 2 grows, Segment 3 shrinks proportionally
 * 
 * Mathematical constraint: G3 = G1 + G2 ensures total height remains constant.
 *
 * For additional information, see:
 * https://www.w3schools.com/js/js_switch.asp
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const COLS = 10;       // number of columns in grid
const ROWS = 40;       // number of rows in grid (constant across all columns)

// Growth parameters for segment transitions
const G1 = 1;          // growth rate of segment 1 per column
const G2 = 2;          // growth rate of segment 2 per column
const G3 = G1 + G2;    // shrinkage rate of segment 3 per column

// Base segment sizes for column 0
const BASE1 = 9;       // initial length of segment 1 in rows
const BASE2 = 3;       // initial length of segment 2 in rows
const BASE3 = ROWS - (BASE1 + BASE2);  // initial length of segment 3 in rows

/**
 * Represents a single triangular tile with drawing capability
 */
class Tile {
  /**
   * Create a new tile
   * @param {number} col - column index
   * @param {number} row - row index
   * @param {number} tileW - tile width in pixels
   * @param {number} tileH - tile height in pixels
   */
  constructor(col, row, tileW, tileH) {
    this.xLeft = col * tileW;
    this.xRight = this.xLeft + tileW;
    this.yTop = row * tileH;
    this.yBottom = this.yTop + tileH;
  }
  
  /**
   * Draw the triangle with tip at normalized position
   * @param {number} tipPosition - normalized x-position of tip (0 = left, 1 = right)
   * @effects draws triangle to canvas
   */
  drawTriangle(tipPosition) {
    const xTip = lerp(this.xLeft, this.xRight, tipPosition);
    triangle(
      this.xLeft, this.yTop,      // top-left corner
      this.xRight, this.yTop,     // top-right corner
      xTip, this.yBottom          // bottom tip at interpolated position
    );
  }
}

/**
 * Initialize canvas
 * @effects creates canvas and sets drawing to static mode
 */
function setup() {
  createCanvas(400, 400);
  noLoop();
}

/**
 * Determine which segment a row belongs to
 * @param {number} r - row index
 * @param {number} rA - last row of segment 1
 * @param {number} rB - last row of segment 2
 * @returns {number} segment number (1, 2, or 3)
 */
function getSegment(r, rA, rB) {
  if (r <= rA) return 1;
  if (r <= rB) return 2;
  return 3;
}

/**
 * Main rendering loop
 * 
 * Algorithm:
 * 1. Calculate tile dimensions from canvas size and grid parameters
 * 2. For each column, compute segment lengths using linear growth/shrinkage
 * 3. For each row in column, determine which segment it belongs to
 * 4. Interpolate triangle tip position based on segment direction and position
 * 5. Draw triangle with top edge spanning tile width, bottom point at interpolated position
 * 
 * Pattern:
 * - Segment 1: Tips sweep from right to left
 * - Segment 2: Tips sweep from left to right
 * - Segment 3: Tips sweep from right to left 
 * 
 * @requires setup() has been called
 * @effects draws triangular tile pattern to canvas
 */
function draw() {
  background(220, 210, 190);  // tan background
  noStroke();
  fill(0);  // black triangles
  
  const tileW = width / COLS;   // tile width in pixels
  const tileH = height / ROWS;  // tile height in pixels
  
  // Traverse each column
  for (let c = 0; c < COLS; c++) {
    // Compute segment lengths for this column
    // Segment lengths change linearly: s1 and s2 grow, s3 shrinks
    // Constraint: s1 + s2 + s3 = ROWS (maintained by G3 = G1 + G2)
    const s1 = BASE1 + G1 * c;
    const s2 = BASE2 + G2 * c;
    const s3 = BASE3 - G3 * c;
    
    // Calculate row indices for segment boundaries
    const rA = s1 - 1;          // last row of segment 1
    const rB = s1 + s2 - 1;     // last row of segment 2
    const rC = ROWS - 1;        // last row of segment 3
    
    // Traverse each row in this column
    for (let r = 0; r < ROWS; r++) {
      let tipPosition;  // normalized x-position of triangle tip (0 = left, 1 = right)
      
      // Determine which segment this row belongs to and interpolate tip position
      const segment = getSegment(r, rA, rB);
      
      switch(segment) {
        case 1:
          // Segment 1: right -> left transition
          const t1 = r / rA;
          tipPosition = lerp(1, 0, t1);
          break;
          
        case 2:
          // Segment 2: left -> right transition
          const t2 = (r - rA) / (rB - rA);
          tipPosition = lerp(0, 1, t2);
          break;
          
        case 3:
          // Segment 3: right -> left transition
          const t3 = (r - rB) / (rC - rB);
          tipPosition = lerp(1, 0, t3);
          break;
      }
      
      // Create and draw tile
      const tile = new Tile(c, r, tileW, tileH);
      tile.drawTriangle(tipPosition);
    }
  }
}