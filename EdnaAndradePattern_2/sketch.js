/**
 * Compilation: EdnaAndradePattern_2.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Builds upon EdnaAndradePattern_1. Tiles the arc fan pattern.
 * Additional mirroring is done every other column to create 
 * a continuous tessellating pattern.
 * 
 * Algorithm: Tiled pattern generation with alternating mirroring
 * - Create reusable arc tile that draws in local coordinates
 * - For each grid position, translate to tile origin
 * - Apply horizontal mirroring to odd columns
 * - Draw tile in local coordinate system
 * 
 * Mirroring technique: Odd columns translate to right edge then scale(-1,1)
 * to flip the tile horizontally within its own bounding box.
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const COLS = 3;        // number of columns in grid
const ROWS = 4;        // number of rows in grid

// Tile configuration
const TILE_W = 200;    // tile width in pixels
const TILE_H = 100;    // tile height in pixels
const NUM_LINES = 13;  // number of lines in each arc fan

// Global state
let tile;  // reusable tile object

/**
 * Initialize canvas and render tiled pattern
 * @effects creates canvas, initializes tile object, and draws grid pattern
 */
function setup() {
  createCanvas(COLS * TILE_W, ROWS * TILE_H);
  noLoop();
  
  background("#F4F3F1");  // off-white background
  stroke(120);            // gray stroke
  strokeWeight(0.75);
  
  // Create reusable tile (no position stored - draws in local coordinates)
  tile = new ArcTile(TILE_W, TILE_H, NUM_LINES);
  
  // Render grid of tiles
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE_W;
      const y = r * TILE_H;
      
      push();
      
      // Position tile at grid coordinates
      translate(x, y);
      
      // Mirror odd columns for alternating pattern
      // Uncomment this
      // if (c % 2 === 1) {
      //   translate(TILE_W, 0);  // move to right edge
      //   scale(-1, 1);          // flip horizontally
      // }
      
      // Draw tile in local (0,0) to (w,h) coordinate system
      tile.drawLocal();
      
      pop();
    }
  }
}

function draw() {
  // Static pattern - no animation
}

/**
 * ArcTile class
 * 
 * Represents a tile that draws mirrored arc fans in local coordinates.
 * The tile draws two quarter-circle arcs from opposite corners with
 * connecting lines between corresponding arc points.
 */
function ArcTile(w, h, n) {
  this.w = w;          // tile width
  this.h = h;          // tile height
  this.n = n;          // number of lines per fan
  this.radius = min(w, h);  // arc radius
  
  /**
   * Draw tile in local coordinate system
   * 
   * Algorithm:
   * 1. Generate points along quarter-circle from top-left (0,0)
   * 2. Mirror points to bottom-right corner
   * 3. Reverse mirrored points for crossing pattern
   * 4. Draw radial lines from both corners
   * 5. Draw connectors between corresponding points
   * 
   * @effects draws arc fan pattern in local coordinates (0,0) to (w,h)
   */
  this.drawLocal = function () {
    // Generate left fan points from top-left corner
    const leftPts = [];
    for (let i = 0; i < this.n; i++) {
      const ang = lerp(0, HALF_PI, i / (this.n - 1));
      leftPts.push({ 
        x: this.radius * cos(ang), 
        y: this.radius * sin(ang) 
      });
    }
    
    // Mirror to bottom-right corner
    const rightPts = [];
    for (let i = 0; i < leftPts.length; i++) {
      const p = leftPts[i];
      rightPts.push({ 
        x: this.w - p.x,   // horizontal reflection
        y: this.h - p.y    // vertical reflection
      });
    }
    
    // Reverse for crossing pattern
    rightPts.reverse();
    
    // Draw both fans and connectors
    for (let i = 0; i < this.n; i++) {
      line(0, 0, leftPts[i].x, leftPts[i].y);                      // left fan
      line(this.w, this.h, rightPts[i].x, rightPts[i].y);         // right fan
      line(leftPts[i].x, leftPts[i].y, rightPts[i].x, rightPts[i].y);  // connector
    }
  };
}