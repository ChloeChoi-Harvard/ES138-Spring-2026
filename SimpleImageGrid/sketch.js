/**
 * Compilation: SimpleImageGrid.js
 * Dependencies: p5.js
 * Data files: Asset.png
 * 
 * Creates a simple grid of tiled images. Each grid cell contains
 * the same image scaled to fit the cell dimensions. 
 * 
 * Algorithm:
 * - Load image during preload phase
 * - Calculate grid dimensions based on canvas size
 * - Draw image in each grid cell at calculated positions
 * 
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Canvas configuration
const CANVAS_WIDTH = 400;      // canvas width in pixels
const CANVAS_HEIGHT = 400;     // canvas height in pixels
const BACKGROUND_COLOR = 220;  // light gray background

// Grid configuration
const GRID_COLS = 4;           // number of columns in grid
const GRID_ROWS = 4;           // number of rows in grid

// Image file path
const IMAGE_PATH = 'Asset.png';

// Global variables
let img;  // loaded image

/**
 * Preload image before setup runs
 * @effects loads image into memory
 */
function preload() {
  img = loadImage(IMAGE_PATH);
}

/**
 * Initialize canvas
 * @effects creates canvas and sets background
 */
function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(BACKGROUND_COLOR);
  
  // Draw static grid
  drawImageGrid();
  
  noLoop();
}

/**
 * Draw grid of tiled images
 * 
 * Algorithm:
 * 1. Calculate cell dimensions from canvas size and grid parameters
 * 2. Traverse grid in row-major order
 * 3. For each cell, draw image at calculated position
 *    scaled to fit cell dimensions
 * 
 * @effects renders grid of images to canvas
 */
function drawImageGrid() {
  const cellWidth = width / GRID_COLS;
  const cellHeight = height / GRID_ROWS;
  
  for (let x = 0; x < width; x += cellWidth) {
    for (let y = 0; y < height; y += cellHeight) {
      image(img, x, y, cellWidth, cellHeight);
    }
  }
}