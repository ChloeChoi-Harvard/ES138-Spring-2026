/**
 * Compilation: OOPTileGrid.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Generates a randomized grid of decorative square tiles with different
 * patterns. Implements object-oriented design with inheritance, creating
 * four tile types: solid, striped, checkered, and recursive nested frames.
 * 
 * Algorithm: Random tile generation with OOP pattern
 * - Define base Tile class with position and size
 * - Extend with specialized tile types (solid, striped, checkered, recursive)
 * - Generate grid by randomly selecting tile type for each position
 * - Apply colors from palette to each tile
 * - Render complete grid of tiles
 * 
 * Architecture: Uses class inheritance with base Tile class and specialized
 * subclasses. TileGrid manages the collection and layout of tiles.
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const GRID_COLS = 10;     // number of columns in grid
const GRID_ROWS = 10;     // number of rows in grid
const GRID_PADDING = 40;  // padding around grid in pixels

// Tile pattern configuration
const CHECKERED_CELLS = 4;      // number of cells per side in checkered pattern
const RECURSIVE_LEVELS = 4;     // number of nested frames in recursive pattern
const STRIPE_DIVISOR = 8;       // stripe width = tile size / divisor

// Color palette
const PALETTE = [
  "#0B132B",  // dark navy
  "#1C2541",  // navy
  "#3A506B",  // blue-gray
  "#5BC0BE",  // teal
  "#F3EEEA"   // off-white
];

// Global state
let grid;  // TileGrid instance

/**
 * Initialize canvas and generate tile grid
 * @effects creates canvas, calculates grid dimensions, and generates initial tile pattern
 */
function setup() {
  createCanvas(600, 600);
  noStroke();
  background(242);  // light gray background
  noLoop();
  
  // Calculate tile dimensions
  const usableSpace = width - GRID_PADDING * 2;
  const tileSize = floor(usableSpace / GRID_COLS);
  
  // Create and generate grid
  grid = new TileGrid(GRID_COLS, GRID_ROWS, tileSize, GRID_PADDING);
  
  let colorPalette = [];
  for (let i = 0; i < PALETTE.length; i++) {
    let c = color(PALETTE[i]);
    colorPalette.push(c);
  }

  grid.generate(colorPalette);
}

/**
 * Main rendering loop
 * @requires setup() has been called
 * @effects draws background and all tiles in grid
 */
function draw() {
  background(242);
  grid.draw();
}

/**
 * Handle keyboard input for saving
 * @effects saves canvas as PNG when 's' or 'S' is pressed
 */
function keyTyped() {
  if (key === 's' || key === 'S') {
    saveCanvas('oop-squares', 'png');
  }
}

/**
 * Base Tile class
 * 
 * Abstract base class representing a square tile at a specific position.
 * Provides common properties (position, size) inherited by all tile types.
 */
class Tile {
  /**
   * Constructor - creates base tile
   * 
   * @param {number} x - x-coordinate of tile's top-left corner
   * @param {number} y - y-coordinate of tile's top-left corner
   * @param {number} size - width and height of square tile in pixels
   */
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
}

/**
 * SolidSquare class
 * 
 * Tile filled with a single solid color.
 */
class SolidSquare extends Tile {
  /**
   * Constructor - creates solid color tile
   * 
   * @param {number} x - x-coordinate of tile's top-left corner
   * @param {number} y - y-coordinate of tile's top-left corner
   * @param {number} size - width and height of square tile in pixels
   * @param {p5.Color} c - fill color for tile
   */
  constructor(x, y, size, c) {
    super(x, y, size);
    this.c = c;
  }
  
  /**
   * Draw solid tile
   * @effects draws filled square at tile position
   */
  draw() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.c);
    rect(0, 0, this.size, this.size);
    pop();
  }
}

/**
 * StripedSquare class
 * 
 * Tile with horizontal stripes alternating between background and stripe colors.
 * Stripe width adapts to tile size for visual consistency.
 */
class StripedSquare extends Tile {
  /**
   * Constructor - creates horizontally striped tile
   * 
   * @param {number} x - x-coordinate of tile's top-left corner
   * @param {number} y - y-coordinate of tile's top-left corner
   * @param {number} size - width and height of square tile in pixels
   * @param {p5.Color} cBg - background color
   * @param {p5.Color} cStripe - stripe color
   */
  constructor(x, y, size, cBg, cStripe) {
    super(x, y, size);
    this.cBg = cBg;
    this.cStripe = cStripe;
    this.stripeW = max(2, floor(this.size / STRIPE_DIVISOR));
  }
  
  /**
   * Draw striped tile
   * 
   * Algorithm:
   * 1. Fill background with base color
   * 2. Draw horizontal stripes at regular intervals
   * 3. Stripe spacing = 2 × stripe width (creates 50% coverage)
   * 
   * @effects draws background with horizontal stripe pattern
   */
  draw() {
    push();
    translate(this.x, this.y);
    noStroke();
    
    // Draw background
    fill(this.cBg);
    rect(0, 0, this.size, this.size);
    
    // Draw horizontal stripes
    fill(this.cStripe);
    for (let yy = 0; yy < this.size; yy += this.stripeW * 2) {
      rect(0, yy, this.size, this.stripeW);
    }
    
    pop();
  }
}

/**
 * CheckeredSquare class
 * 
 * Tile with checkerboard pattern alternating between two colors.
 * Number of cells is configurable, creating finer or coarser patterns.
 */
class CheckeredSquare extends Tile {
  /**
   * Constructor - creates checkered tile
   * 
   * @param {number} x - x-coordinate of tile's top-left corner
   * @param {number} y - y-coordinate of tile's top-left corner
   * @param {number} size - width and height of square tile in pixels
   * @param {p5.Color} cA - first checkerboard color
   * @param {p5.Color} cB - second checkerboard color
   * @param {number} cells - number of cells per side (default: 4)
   */
  constructor(x, y, size, cA, cB, cells) {
    super(x, y, size);
    this.cA = cA;
    this.cB = cB;
    this.cells = cells || CHECKERED_CELLS;
  }
  
  /**
   * Draw checkered tile
   * 
   * Algorithm:
   * 1. Calculate cell size (tile size / number of cells)
   * 2. For each cell in grid:
   *    a. Determine color based on position parity (i + j)
   *    b. Even sum uses color A, odd sum uses color B
   *    c. Draw filled rectangle at cell position
   * 
   * @effects draws checkerboard pattern with alternating colors
   */
  draw() {
    push();
    translate(this.x, this.y);
    noStroke();
    
    const cellSize = this.size / this.cells;
    for (let i = 0; i < this.cells; i++) {
      for (let j = 0; j < this.cells; j++) {
        // Alternate colors based on position sum parity
        fill((i + j) % 2 === 0 ? this.cA : this.cB);
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
    
    pop();
  }
}

/**
 * RecursiveSquare class
 * 
 * Tile with nested concentric square frames, creating depth through recursion.
 * Each frame is randomly sized and weighted, with some frames occasionally
 * skipped for visual variety.
 */
class RecursiveSquare extends Tile {
  /**
   * Constructor - creates recursive nested frame tile
   * 
   * @param {number} x - x-coordinate of tile's top-left corner
   * @param {number} y - y-coordinate of tile's top-left corner
   * @param {number} size - width and height of square tile in pixels
   * @param {p5.Color} cStroke - stroke color for frames
   * @param {p5.Color} cBg - background color
   * @param {number} levels - number of nested frames (default: 4)
   */
  constructor(x, y, size, cStroke, cBg, levels) {
    super(x, y, size);
    this.cStroke = cStroke;
    this.cBg = cBg;
    this.levels = levels || RECURSIVE_LEVELS;
  }
  
  /**
   * Draw recursive nested frame tile
   * 
   * Algorithm:
   * 1. Fill background
   * 2. Call recursive helper to draw nested frames
   * 3. Each recursion draws one frame and calls itself for inner frame
   * 
   * @effects draws background with nested square frames
   */
  draw() {
    push();
    translate(this.x, this.y);
    
    // Draw background
    fill(this.cBg);
    noStroke();
    rect(0, 0, this.size, this.size);
    
    // Draw nested frames
    stroke(this.cStroke);
    noFill();
    
    this.drawFrame(this.size - this.size / 5, random(2, 5));
    
    pop();
  }
  
  /**
   * Recursive helper to draw nested frames
   * 
   * Algorithm (recursive):
   * 1. Base case: if depth ≤ 0, return
   * 2. Randomly decide whether to skip this frame
   * 3. If not skipped, draw centered square with random stroke weight
   * 4. Recurse with smaller size and decremented depth
   * 
   * The random skipping creates irregular nesting patterns.
   * 
   * @param {number} size - current frame size in pixels
   * @param {number} depth - remaining recursion depth
   * @effects draws one frame and recursively draws inner frames
   */
  drawFrame(size, depth) {
    // Base case: stop recursion
    if (depth <= 0) {
      return;
    }
    
    // Randomly skip some frames for variety
    const skip = random(0, 1);
    
    rectMode(CENTER);
    if (skip) {
      strokeWeight(random(1, 4));
      rect(this.size / 2, this.size / 2, size, size);
    }
    
    // Recursive call with smaller size
    this.drawFrame(size - this.size / 5, depth - 1);
  }
}

/**
 * TileGrid class
 * 
 * Manages a grid of tiles, handling layout, generation, and rendering.
 * Responsible for positioning tiles and randomly selecting tile types.
 */
class TileGrid {
  /**
   * Constructor - creates tile grid manager
   * 
   * @param {number} cols - number of columns in grid
   * @param {number} rows - number of rows in grid
   * @param {number} tileSize - width and height of each tile in pixels
   * @param {number} margin - padding around grid in pixels (default: 0)
   */
  constructor(cols, rows, tileSize, margin) {
    this.cols = cols;
    this.rows = rows;
    this.tileSize = tileSize;
    this.margin = margin || 0;
    this.tiles = [];
  }

  /**
   * Pick 2 unique colors from a palette.
   * @param {p5.Color[]} palette
   * @returns {[p5.Color, p5.Color]}
   */
  pickTwoUnique(palette) {
    const a = random(palette);
    let b = random(palette);
    while (b === a) {
      b = random(palette);
    }
    return [a, b];
  }
  
  /**
   * Generate random tile arrangement
   * 
   * Algorithm:
   * 1. Clear existing tiles array
   * 2. For each grid position (row, column):
   *    a. Calculate pixel position from grid coordinates
   *    b. Randomly select tile type (0-3: solid, striped, checkered, recursive)
   *    c. Randomly select colors from palette
   *    d. Create appropriate tile instance with selected parameters
   *    e. Add tile to collection
   * 
   * Each tile type has different color requirements:
   * - Solid: one color
   * - Striped: background + stripe color
   * - Checkered: two colors
   * - Recursive: background + stroke color
   * 
   * @param {p5.Color[]} palette - array of colors to use for tiles
   * @effects populates tiles array with randomly generated tiles
   */
  generate(palette) {
    this.tiles = [];
    
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        // Calculate tile position
        const x = this.margin + i * this.tileSize;
        const y = this.margin + j * this.tileSize;
        
        // Randomly select tile type
        const tileType = floor(random(4));
        
        if (tileType === 0) {
          // Solid tile
          this.tiles.push(new SolidSquare(x, y, this.tileSize, random(palette)));
        } else if (tileType === 1) {
          // Striped tile
          const [bg, stripe] = this.pickTwoUnique(palette);
          this.tiles.push(new StripedSquare(x, y, this.tileSize, bg, stripe));
        } else if (tileType === 2) {
          // Checkered tile
          const [colorA, colorB] = this.pickTwoUnique(palette);
          this.tiles.push(new CheckeredSquare(x, y, this.tileSize, colorA, colorB, CHECKERED_CELLS));
        } else {
          // Recursive tile
          const [stroke, bg] = this.pickTwoUnique(palette);
          this.tiles.push(new RecursiveSquare(x, y, this.tileSize, stroke, bg, RECURSIVE_LEVELS));
        }
      }
    }
  }
  
  /**
   * Draw all tiles in grid
   * @effects renders all tiles to canvas
   */
  draw() {
    for (const tile of this.tiles) {
      tile.draw();
    }
  }
}
