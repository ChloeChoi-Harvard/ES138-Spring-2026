/**
 * Compilation: CirclePackingBinLattice.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Implements optimized circle packing using spatial grid (bin lattice) for
 * collision detection. Divides canvas into uniform grid cells and only tests
 * circles within neighboring cells, dramatically reducing collision checks.
 * 
 * Algorithm: Rejection sampling with spatial grid optimization
 * - Generate random circle with constrained position
 * - Insert into spatial grid based on position
 * - Test collision only against circles in neighboring cells
 * - Accept if no collision, repeat until target reached
 * 
 * Optimization: Spatial grid reduces collision checks from O(n) to O(k) where
 * k is the average number of circles in adjacent cells (typically << n).
 *
 * For additional information, see:
 * https://www.red3d.com/cwr/papers/2000/pip.pdf
 * https://natureofcode.com/autonomous-agents/
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const TARGET_COUNT = 250;     // desired number of circles to pack
const MIN_R = 6;              // minimum circle radius in pixels
const MAX_R = 30;             // maximum circle radius in pixels
const PADDING = 1.5;          // minimum spacing between circle edges in pixels
const MAX_ATTEMPTS = 200000;  // upper limit on placement attempts to prevent infinite loops

// Global state
let circles = [];  // array of successfully placed circle objects

// Spatial grid for optimized collision detection
let grid = new Map();  // maps cell coordinates to arrays of circles
let CELL_SIZE;         // size of each grid cell in pixels

/**
 * Initialize canvas and spatial grid
 * @effects creates canvas, sets drawing to static mode, and initializes grid cell size
 */
function setup() {
  createCanvas(500, 700);
  noLoop();
  
  // Cell size = maximum possible interaction distance
  // Any two circles cannot collide if they're in non-adjacent cells
  CELL_SIZE = MAX_R * 2 + PADDING;
}

/**
 * Main rendering loop
 * @requires setup() has been called
 * @effects sets background, packs circles, draws them, and displays stats
 */
function draw() {
  background(226, 185, 130);  // background color
  packCircles();
  
  // Draw all successfully placed circles
  fill(73, 65, 64);  // circle color
  noStroke();
  for (const c of circles) {
    circle(c.x, c.y, c.r * 2);
  }
  
  // Uncomment to display placement statistics in top-left corner
  fill(255);
  textSize(14);
  text(`Placed: ${circles.length}/${TARGET_COUNT}`, 12, 20);
}

/**
 * Main packing algorithm using rejection sampling with spatial grid
 * 
 * Algorithm:
 * 1. Clear circles array and spatial grid
 * 2. Generate random candidate circle with constrained position
 * 3. Use spatial grid to test collision only with nearby circles
 * 4. If no collision, add circle to array and insert into grid
 * 5. Repeat until TARGET_COUNT reached or MAX_ATTEMPTS exceeded
 * 
 * The spatial grid dramatically reduces collision checks by partitioning
 * space into cells and only testing circles in adjacent cells.
 * 
 * @requires global constants TARGET_COUNT, MAX_ATTEMPTS are positive
 * @effects modifies global circles array and grid with successfully packed circles
 */
function packCircles() {
  circles = [];  // reset to empty array
  grid.clear();  // clear spatial grid
  let attempts = 0;
  
  while (circles.length < TARGET_COUNT && attempts < MAX_ATTEMPTS) {
    attempts++;
    const candidate = makeRandomCircle();
    
    if (!collidesGrid(candidate)) {
      circles.push(candidate);
      insertIntoGrid(candidate);
    }
  }
}

/**
 * Generate a random circle with constrained position
 * 
 * Position is constrained to keep entire circle within canvas bounds.
 * Radius is randomly selected from [MIN_R, MAX_R].
 * 
 * @returns {Object} circle object with {x, y, r} properties
 */
function makeRandomCircle() {
  const r = random(MIN_R, MAX_R);
  
  return {
    x: random(r, width - r),   // constrain x to keep circle in bounds
    y: random(r, height - r),  // constrain y to keep circle in bounds
    r: r
  };
}

/**
 * Check collision using spatial grid
 * 
 * Algorithm:
 * 1. Determine which grid cell the candidate occupies
 * 2. Check candidate against circles in that cell and 8 neighboring cells
 * 3. Use standard circle-circle distance test for each nearby circle
 * 
 * This reduces collision checks from O(n) to O(k) where k is the number
 * of circles in the 9-cell neighborhood (typically very small).
 * 
 * @param {Object} c - circle to test with {x, y, r} properties
 * @returns {boolean} true if circle collides with any existing circle
 */
function collidesGrid(c) {
  const cx = floor(c.x / CELL_SIZE);
  const cy = floor(c.y / CELL_SIZE);
  
  // Check this cell + 8 neighboring cells (3×3 grid)
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const key = cellKey(cx + dx, cy + dy);
      const bucket = grid.get(key);
      if (!bucket) continue;
      
      // Test against all circles in this cell
      for (const o of bucket) {
        const minDist = c.r + o.r + PADDING;
        const dx = c.x - o.x;
        const dy = c.y - o.y;
        
        if (dx * dx + dy * dy < minDist * minDist) {
          return true;  // collision detected
        }
      }
    }
  }
  
  return false;  // no collisions in neighboring cells
}

/**
 * Insert circle into spatial grid
 * 
 * Determines which grid cell the circle occupies based on its center
 * position and adds it to that cell's bucket.
 * 
 * @param {Object} c - circle to insert with {x, y, r} properties
 * @effects modifies global grid by adding circle to appropriate cell
 */
function insertIntoGrid(c) {
  const cx = floor(c.x / CELL_SIZE);
  const cy = floor(c.y / CELL_SIZE);
  const key = cellKey(cx, cy);
  
  if (!grid.has(key)) grid.set(key, []);
  grid.get(key).push(c);
}

/**
 * Generate unique key for grid cell coordinates
 * 
 * @param {number} x - cell x-coordinate
 * @param {number} y - cell y-coordinate
 * @returns {string} unique string identifier for cell
 */
function cellKey(x, y) {
  return `${x},${y}`;
}