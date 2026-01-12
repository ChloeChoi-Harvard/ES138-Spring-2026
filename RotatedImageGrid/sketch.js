/**
 * Compilation: RotatedImageGrid.js
 * Dependencies: p5.js
 * Data files: Asset.png
 * 
 * Creates a grid of randomly rotated images. Each grid cell contains
 * the same image rotated by 0°, 90°, 180°, or 270°. The image is
 * centered within each cell and scaled to fit the cell dimensions.
 * 
 * Algorithm:
 * - Load image during preload phase
 * - Calculate grid dimensions based on canvas size
 * - For each grid cell:
 *   - Translate to cell center
 *   - Apply random 90° rotation
 *   - Draw image centered at origin
 * 
 * Image placement: Uses CENTER mode to rotate around image center
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
const GRID_SIZE = 4;           // number of rows and columns in grid

// Rotation configuration
const ROTATION_ANGLES = [0, 1, 2, 3];  // rotation multipliers for 90° increments

// Image file path
const IMAGE_PATH = 'Asset.png';

// Global variables
let img;          // loaded image
let cellWidth;    // width of each grid cell
let cellHeight;   // height of each grid cell

/**
 * Preload image before setup runs
 * @effects loads image into memory
 */
function preload() {
  img = loadImage(IMAGE_PATH);
}

/**
 * Initialize canvas and calculate grid dimensions
 * @effects creates canvas, sets angle mode, calculates cell dimensions
 */
function setup() {
  angleMode(DEGREES);
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(BACKGROUND_COLOR);
  
  // Calculate cell dimensions
  cellWidth = width / GRID_SIZE;
  cellHeight = height / GRID_SIZE;
  
  // Draw static grid
  drawRotatedGrid();
  
  noLoop();
}

/**
 * Draw grid of randomly rotated images
 * 
 * Algorithm:
 * 1. Traverse grid in row-major order
 * 2. For each cell:
 *    a. Calculate cell center position
 *    b. Save transformation state
 *    c. Translate to cell center
 *    d. Set image mode to CENTER
 *    e. Apply random 90° rotation (0°, 90°, 180°, or 270°)
 *    f. Draw image at origin (appears at cell center due to translation)
 *    g. Restore transformation state
 * 
 * @effects renders grid of rotated images to canvas
 */
function drawRotatedGrid() {
  for (let x = 0; x < width; x += cellWidth) {
    for (let y = 0; y < height; y += cellHeight) {
      push();
      
      // Translate to center of current cell
      translate(x + cellWidth / 2, y + cellHeight / 2);
      
      // Set image drawing mode to center
      imageMode(CENTER);
      
      // Apply random rotation in 90° increments
      const rotationMultiplier = random(ROTATION_ANGLES);
      rotate(90 * rotationMultiplier);
      
      // Draw image centered at origin
      image(img, 0, 0, cellWidth, cellHeight);
      
      pop();
    }
  }
}