/**
 * Compilation: RecursiveSquaresGrid_Brush.js
 * Dependencies: p5.js, p5.brush
 * Data files: none
 * 
 * Generates a grid of nested square frames with brush-stroke aesthetics.
 * Uses object-oriented programming with inheritance to create two 
 * recursive frame squares. Each recursive square contains
 * randomly nested frames that draw inward with decreasing size.

 * Algorithm:
 * - Create grid of tiles with specified columns, rows, and size
 * - For each tile, randomly select frame and background colors from palette
 * - Draw recursive frames that decrease in size by fixed ratio per level
 * - Use p5.brush for organic, hand-drawn aesthetic
 * 
 * Class hierarchy:
 * - Tile (parent): base class with position and size
 * - RecursiveSquare (child): tile with nested frames drawn recursively
 * - TileGrid: manages grid layout and tile generation
 * 
 * For additional information, see:
 * https://p5-brush.cargo.site/
 * https://github.com/acamposuribe/p5.brush
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const GRID_COLS = 10;           // number of columns in grid
const GRID_ROWS = 10;           // number of rows in grid
const GRID_PADDING = 40;        // padding around grid edges in pixels

// Recursive frame parameters
const FRAME_LEVELS = 4;         // number of nested frames per tile
const FRAME_SIZE_RATIO = 0.2;   // size reduction per frame level (1/5 of tile size)
const MIN_DEPTH = 2;            // minimum recursion depth
const MAX_DEPTH = 5;            // maximum recursion depth

// Stroke parameters
const MIN_STROKE_WEIGHT = 1;    // minimum brush stroke weight
const MAX_STROKE_WEIGHT = 2;    // maximum brush stroke weight

// Color palette - cool blues to warm cream
const PALETTE = [
  "#0B132B",  // darkest navy
  "#1C2541",  // deep blue
  "#3A506B",  // medium blue-grey
  "#5BC0BE",  // bright teal
];

const BACKGROUND_COLOR = 242;   // light grey background

// Global grid instance
let grid;

/**
 * Parent class representing a basic tile with position and size
 */
class Tile {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
}

/**
 * Child class representing a square with nested recursive frames
 */
class RecursiveSquare extends Tile {
  constructor(x, y, size, strokeColor, bgColor, levels) {
    super(x, y, size);
    this.strokeColor = strokeColor;
    this.bgColor = bgColor;
    this.levels = levels || FRAME_LEVELS;
  }

  draw() {
    push();
    translate(this.x, this.y);

    // Draw background fill (brush)
    brush.noStroke();
    brush.set(brush.box()[5], this.bgColor, 1);
    brush.rect(0, 0, this.size, this.size);

    // Set up stroke for frames (brush)
    brush.stroke(this.strokeColor);
    brush.noFill();

    // Calculate starting size for first frame
    const initialSize = this.size - (this.size * FRAME_SIZE_RATIO);
    const depth = random(MIN_DEPTH, MAX_DEPTH);

    // Start recursive drawing
    this.drawFrame(initialSize, depth);

    pop();
  }

  drawFrame(size, depth) {
    if (depth <= 0) {
      return;
    }

    // Randomly skip drawing this frame (creates variation)
    const shouldDraw = random(0, 1);

    if (shouldDraw) {
      brush.strokeWeight(random(MIN_STROKE_WEIGHT, MAX_STROKE_WEIGHT));

      // Center the frame within the tile
      const centerX = this.size / 2;
      const centerY = this.size / 2;
      const x = centerX - size / 2;
      const y = centerY - size / 2;

      brush.rect(x, y, size, size);
    }

    // Recursively draw next inner frame
    const nextSize = size - (this.size * FRAME_SIZE_RATIO);
    this.drawFrame(nextSize, depth - 1);
  }
}

/**
 * Manages a grid of tiles with generation and rendering
 */
class TileGrid {
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

  generate(palette) {
    this.tiles = [];

    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const x = this.margin + i * this.tileSize;
        const y = this.margin + j * this.tileSize;

        // Pick 2 unique colors: one for stroke, one for background
        const colors = this.pickTwoUnique(palette);
        const strokeColor = colors[0];
        const bgColor = colors[1];

        this.tiles.push(
          new RecursiveSquare(x, y, this.tileSize, strokeColor, bgColor, FRAME_LEVELS)
        );
      }
    }
  }

  draw() {
    for (let tile of this.tiles) {
      tile.draw();
    }
  }
}

/**
 * Convert PALETTE hex strings into p5.Color objects (beginner-friendly)
 * @returns {p5.Color[]} array of p5.Color objects
 */
function buildColorPalette() {
  let colorPalette = [];

  for (let i = 0; i < PALETTE.length; i++) {
    let c = color(PALETTE[i]);
    colorPalette.push(c);
  }

  return colorPalette;
}

/**
 * Initialize canvas and create grid
 */
function setup() {
  createCanvas(600, 600, WEBGL);

  print(brush.box()); // debug: print available brush types
  noStroke();
  background(BACKGROUND_COLOR);
  noLoop();

  // Calculate tile size based on canvas and padding
  const usableWidth = width - GRID_PADDING * 2;
  const tileSize = floor(usableWidth / GRID_COLS);

  // Create grid
  grid = new TileGrid(GRID_COLS, GRID_ROWS, tileSize, GRID_PADDING);

  // Build palette in a beginner-friendly way
  let colorPalette = buildColorPalette();

  // Generate tiles
  grid.generate(colorPalette);
}

/**
 * Main rendering loop
 */
function draw() {
  background(BACKGROUND_COLOR);
  translate(-width / 2, -height / 2);  // adjust for WEBGL center origin
  grid.draw();
}
