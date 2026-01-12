/**
 * Compilation: WEBGLCubes.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Creates a 3D grid of cubes with smaller cubes attached at random corners
 * 
 * Algorithm:
 * - Generate grid of large cubes with calculated spacing
 * - For each large cube, randomly select 2-3 corners from 8 possibilities
 * - Attach smaller cubes at selected corners
 * - Render with custom face coloring: front transparent, back black, sides white
 * 
 * Rendering style:
 * - Orthographic camera for isometric appearance
 * - No fill on front faces (transparent)
 * - Black fill on back faces
 * - White fill on side, top, and bottom faces
 * 
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Canvas configuration
const CANVAS_WIDTH = 600;       // canvas width in pixels
const CANVAS_HEIGHT = 600;      // canvas height in pixels
const BACKGROUND_COLOR = 175;   // medium gray background

// Grid configuration
const GRID_COLS = 4;            // number of columns in grid
const GRID_ROWS = 4;            // number of rows in grid

// Large cube dimensions
const LARGE_CUBE_WIDTH = 80;    // width of large cube
const LARGE_CUBE_HEIGHT = 80;   // height of large cube
const LARGE_CUBE_DEPTH = 80;    // depth of large cube

// Small cube configuration
const SMALL_CUBE_SCALE = 0.4;   // small cube size as fraction of large cube
const MIN_SMALL_CUBES = 2;      // minimum number of small cubes per large cube
const MAX_SMALL_CUBES = 3;      // maximum number of small cubes per large cube

// Camera configuration
const CAMERA_X = 50;            // camera x-position
const CAMERA_Y = -50;           // camera y-position (negative = above)
const CAMERA_Z = 200;           // camera z-position (distance)

// Face colors
const BACK_FACE_COLOR = 0;      // black for back faces
const SIDE_FACE_COLOR = 255;    // white for side faces

// All 8 corner positions as sign multipliers (-1 or 1)
const CORNER_POSITIONS = [
  { signX: -1, signY: -1, signZ:  1 },  // front-top-left
  { signX:  1, signY: -1, signZ:  1 },  // front-top-right
  { signX:  1, signY:  1, signZ:  1 },  // front-bottom-right
  { signX: -1, signY:  1, signZ:  1 },  // front-bottom-left
  { signX: -1, signY: -1, signZ: -1 },  // back-top-left
  { signX:  1, signY: -1, signZ: -1 },  // back-top-right
  { signX:  1, signY:  1, signZ: -1 },  // back-bottom-right
  { signX: -1, signY:  1, signZ: -1 }   // back-bottom-left
];

// Global grid instance
let grid;

/**
 * Represents a small cube attached to a corner
 */
class SmallCube {
  /**
   * Create a new small cube at corner position
   * @param {number} x - x-offset from large cube center
   * @param {number} y - y-offset from large cube center
   * @param {number} z - z-offset from large cube center
   * @param {number} size - cube size in all dimensions
   */
  constructor(x, y, z, size) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
  }
  
  /**
   * Draw the small cube
   * @effects renders custom-colored cube at position
   */
  draw() {
    push();
    translate(this.x, this.y, this.z);
    drawCustomBox(this.size, this.size, this.size);
    pop();
  }
}

/**
 * Represents a single cell containing one large cube and its small cubes
 */
class CubeCell {
  /**
   * Create a new cube cell with random corner attachments
   * @param {number} row - row index in grid
   * @param {number} col - column index in grid
   */
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.largeCubeWidth = LARGE_CUBE_WIDTH;
    this.largeCubeHeight = LARGE_CUBE_HEIGHT;
    this.largeCubeDepth = LARGE_CUBE_DEPTH;
    this.smallCubes = [];
    
    this.generateSmallCubes();
  }
  
  /**
   * Generate small cubes at random corners
   * 
   * Algorithm:
   * 1. Calculate dimensions of large and small cubes
   * 2. Shuffle corner positions randomly
   * 3. Select random number of corners (2-3)
   * 4. For each selected corner:
   *    a. Calculate position offset from large cube center
   *    b. Create small cube at that position
   * 
   * @effects populates smallCubes array with SmallCube instances
   */
  generateSmallCubes() {
    // Calculate half-dimensions
    const halfWidth = this.largeCubeWidth / 2;
    const halfHeight = this.largeCubeHeight / 2;
    const halfDepth = this.largeCubeDepth / 2;
    
    // Calculate small cube size and half-size
    const smallCubeSize = this.largeCubeWidth * SMALL_CUBE_SCALE;
    const halfSmallSize = smallCubeSize / 2;
    
    // Randomly shuffle corner positions
    const shuffledCorners = shuffle(CORNER_POSITIONS.slice());
    
    // Randomly select 2 or 3 corners
    const numSmallCubes = floor(random(MIN_SMALL_CUBES, MAX_SMALL_CUBES + 1));
    
    // Create small cubes at selected corners
    for (let i = 0; i < numSmallCubes; i++) {
      const corner = shuffledCorners[i];
      
      // Calculate position: corner of large cube minus half of small cube
      const x = corner.signX * (halfWidth - halfSmallSize);
      const y = corner.signY * (halfHeight - halfSmallSize);
      const z = corner.signZ * (halfDepth - halfSmallSize);
      
      this.smallCubes.push(new SmallCube(x, y, z, smallCubeSize));
    }
  }
  
  /**
   * Draw the cube cell (large cube and all small cubes)
   * @param {number} worldX - x-position in world space
   * @param {number} worldY - y-position in world space
   * @effects renders large cube and all attached small cubes
   */
  draw(worldX, worldY) {
    push();
    translate(worldX, worldY, 0);
    
    // Draw large cube
    drawCustomBox(this.largeCubeWidth, this.largeCubeHeight, this.largeCubeDepth);
    
    // Draw all small cubes
    for (const smallCube of this.smallCubes) {
      smallCube.draw();
    }
    
    pop();
  }
}

/**
 * Manages a grid of cube cells
 */
class CubeGrid {
  /**
   * Create a new cube grid
   * @param {number} cols - number of columns
   * @param {number} rows - number of rows
   */
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.cells = [];
    
    this.generateCells();
  }
  
  /**
   * Generate all cube cells in grid
   * @effects populates cells array with CubeCell instances
   */
  generateCells() {
    for (let i = 0; i < this.cols; i++) {
      this.cells[i] = [];
      for (let j = 0; j < this.rows; j++) {
        this.cells[i][j] = new CubeCell(j, i);
      }
    }
  }
  
  /**
   * Draw all cells in grid
   * 
   * Algorithm:
   * 1. Calculate total grid dimensions
   * 2. Calculate offset to center grid in world space
   * 3. For each cell:
   *    a. Calculate world position from grid coordinates
   *    b. Draw cell at that position
   * 
   * @effects renders all cube cells in grid layout
   */
  draw() {
    const totalWidth = this.cols * LARGE_CUBE_WIDTH;
    const totalHeight = this.rows * LARGE_CUBE_HEIGHT;
    
    // Calculate offset to center grid
    const offsetX = -totalWidth / 2 + LARGE_CUBE_WIDTH / 2;
    const offsetY = -totalHeight / 2 + LARGE_CUBE_HEIGHT / 2;
    
    // Draw each cell
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const worldX = offsetX + i * LARGE_CUBE_WIDTH;
        const worldY = offsetY + j * LARGE_CUBE_HEIGHT;
        
        this.cells[i][j].draw(worldX, worldY);
      }
    }
  }
}

/**
 * Draw custom box with specific face colors
 * 
 * Face coloring:
 * - Front face: no fill (transparent)
 * - Back face: black fill
 * - Side/top/bottom faces: white fill
 * 
 * Algorithm:
 * 1. Calculate half-dimensions for vertex positioning
 * 2. Draw front face with no fill
 * 3. Draw back face with black fill
 * 4. Draw four side faces with white fill
 * 5. Draw top and bottom faces with white fill
 * 
 * @param {number} w - box width
 * @param {number} h - box height
 * @param {number} d - box depth
 * @effects renders custom-colored box centered at origin
 */
function drawCustomBox(w, h, d) {
  const halfW = w / 2;
  const halfH = h / 2;
  const halfD = d / 2;
  
  // Front face (transparent - no fill)
  noFill();
  beginShape();
  vertex(-halfW, -halfH,  halfD);
  vertex( halfW, -halfH,  halfD);
  vertex( halfW,  halfH,  halfD);
  vertex(-halfW,  halfH,  halfD);
  endShape(CLOSE);
  
  // Back face (black)
  fill(BACK_FACE_COLOR);
  beginShape();
  vertex(-halfW, -halfH, -halfD);
  vertex( halfW, -halfH, -halfD);
  vertex( halfW,  halfH, -halfD);
  vertex(-halfW,  halfH, -halfD);
  endShape(CLOSE);
  
  // Side faces (white)
  fill(SIDE_FACE_COLOR);
  
  // Right face
  beginShape();
  vertex( halfW, -halfH,  halfD);
  vertex( halfW, -halfH, -halfD);
  vertex( halfW,  halfH, -halfD);
  vertex( halfW,  halfH,  halfD);
  endShape(CLOSE);
  
  // Left face
  beginShape();
  vertex(-halfW, -halfH, -halfD);
  vertex(-halfW, -halfH,  halfD);
  vertex(-halfW,  halfH,  halfD);
  vertex(-halfW,  halfH, -halfD);
  endShape(CLOSE);
  
  // Top face
  beginShape();
  vertex(-halfW, -halfH, -halfD);
  vertex( halfW, -halfH, -halfD);
  vertex( halfW, -halfH,  halfD);
  vertex(-halfW, -halfH,  halfD);
  endShape(CLOSE);
  
  // Bottom face
  beginShape();
  vertex(-halfW,  halfH,  halfD);
  vertex( halfW,  halfH,  halfD);
  vertex( halfW,  halfH, -halfD);
  vertex(-halfW,  halfH, -halfD);
  endShape(CLOSE);
}

/**
 * Initialize canvas and generate cube grid
 * @effects creates WebGL canvas, sets camera, generates grid
 */
function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);
  
  // Generate cube grid with corner attachments
  grid = new CubeGrid(GRID_COLS, GRID_ROWS);
}

/**
 * Main rendering loop
 * @effects draws background, sets camera, renders cube grid
 */
function draw() {
  background(BACKGROUND_COLOR);
  
  // Set orthographic projection for diagram-style view
  ortho();
  camera(CAMERA_X, CAMERA_Y, CAMERA_Z);
  
  // Disable fill for wireframe edges
  noFill();
  
  // Draw the cube grid
  grid.draw();
}