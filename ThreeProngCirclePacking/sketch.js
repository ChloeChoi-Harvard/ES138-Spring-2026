/**
 * Compilation: ThreeProngCirclePacking.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Implements circle packing with three-pronged radial patterns.
 * Each packed circle contains three equally-spaced lines (prongs) 
 * radiating from the center at 120-degree intervals, creating
 * a triskelion-like pattern.
 * 
 * Algorithm: Brute-force rejection sampling with rotation variance
 * - Generate random circle with random rotation angle
 * - Accept if no collisions detected with existing circles
 * - Repeat until target count reached or max attempts exceeded
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const TARGET_COUNT = 50;     // desired number of prong circles to pack
const MAX_ATTEMPTS = 60000;  // upper limit on placement attempts to prevent infinite loops
const PRONG_LEN = 50;        // length of each prong from center to edge in pixels
const PRONG_W = 12;          // width/thickness of prong stroke in pixels
const PADDING = 3;           // minimum spacing between circle edges in pixels
const CIRCLE_R = PRONG_LEN;  // circle radius equals prong length (prongs reach edge)

// Global state
let prongCircles = [];  // array of successfully placed ProngCircle objects

/**
 * Initialize canvas
 * @effects creates canvas, sets angle mode to radians, and sets drawing to static mode
 */
function setup() {
  createCanvas(500, 700);
  angleMode(RADIANS);
  noLoop();
}

/**
 * Main rendering loop
 * @requires setup() has been called
 * @effects sets background, packs prong circles, draws them, and displays stats
 */
function draw() {
  background(193, 216, 239);  // blue background
  packProngCircles();
  
  // Draw all successfully placed prong circles
  for (const pc of prongCircles) {
    pc.draw();
  }
  
  // Uncomment to display placement statistics in top-left corner
  // noStroke();
  // fill(0);
  // textSize(12);
  // text(`Placed: ${prongCircles.length}/${TARGET_COUNT}`, 10, 20);
}

/**
 * Main packing algorithm using rejection sampling
 * 
 * Algorithm:
 * 1. Clear existing prong circles array
 * 2. Generate random candidate circle with random rotation
 * 3. Test if candidate collides with any existing circles
 * 4. If no collision, add to prong circles array
 * 5. Repeat until TARGET_COUNT reached or MAX_ATTEMPTS exceeded
 * 
 * @requires global constants TARGET_COUNT, MAX_ATTEMPTS are positive
 * @effects modifies global prongCircles array with successfully packed ProngCircle objects
 */
function packProngCircles() {
  prongCircles = [];  // reset to empty array
  let attempts = 0;
  
  while (prongCircles.length < TARGET_COUNT && attempts < MAX_ATTEMPTS) {
    attempts++;
    const candidate = new ProngCircle();
    
    if (!candidate.collides(prongCircles)) {
      prongCircles.push(candidate);
    }
  }
}

/**
 * ProngCircle class
 * 
 * Represents a circle containing three equally-spaced radial lines (prongs)
 * that extend from the center to the edge at 120-degree intervals.
 */
class ProngCircle {
  /**
   * Constructor - creates prong circle with random position and rotation
   * @effects initializes circle with fixed radius CIRCLE_R,
   *          random position constrained inside canvas,
   *          and random rotation angle in [0, 2π]
   */
  constructor() {
    this.radius = CIRCLE_R;
    
    // Constrain position to keep entire circle within canvas bounds
    this.position = createVector(
      random(this.radius, width - this.radius),   // x-position
      random(this.radius, height - this.radius)   // y-position
    );
    
    this.rotation = random(TWO_PI);  // random rotation for visual variety
  }
  
  /**
   * Check collision with array of other prong circles
   * 
   * @param {ProngCircle[]} otherCircles - array of circles to test against
   * @requires otherCircles is an array of ProngCircle objects
   * @returns {boolean} true if this circle overlaps with any circle in array
   */
  collides(otherCircles) {
    for (const other of otherCircles) {
      if (this.collidesWithCircle(other)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check collision with a single prong circle using distance test
   * 
   * Algorithm: Two circles collide if distance between centers
   *            is less than sum of their radii plus padding
   * 
   * Optimization: Uses squared distances to avoid expensive sqrt()
   * 
   * @param {ProngCircle} other - circle to test collision against
   * @requires other is a ProngCircle object with position and radius
   * @returns {boolean} true if circles overlap, false otherwise
   */
  collidesWithCircle(other) {
    // Minimum allowed distance between centers (sum of radii + padding)
    const minDist = this.radius + other.radius + PADDING;
    
    // Calculate distance components
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    
    // Compare squared distances (avoids sqrt for performance)
    // Collision occurs when distance² < minDist²
    return dx * dx + dy * dy < minDist * minDist;
  }
  
  /**
   * Render three-pronged pattern to canvas
   * 
   * Draws three lines radiating from circle center at 120-degree intervals.
   * Each line extends from center to circle edge (length = radius).
   * 
   * @effects draws three stroked lines at this.position with rotation offset
   */
  draw() {
    push();
    
    // Optional: Draw the circle boundary (uncomment to see)
    // noFill();
    // stroke(73, 86, 105, 50);
    // strokeWeight(1);
    // circle(this.position.x, this.position.y, this.radius * 2);
    
    // Configure prong appearance
    stroke(73, 86, 105);  // dark blue-gray color
    strokeWeight(PRONG_W);
    strokeCap(SQUARE);
    
    const step = TWO_PI / 3;  // 120 degrees apart (360° / 3 prongs)
    
    // Draw three prongs
    for (let i = 0; i < 3; i++) {
      const angle = this.rotation + step * i;
      
      // Start point at circle center
      const x1 = this.position.x;
      const y1 = this.position.y;
      
      // End point at edge of circle
      const x2 = this.position.x + cos(angle) * PRONG_LEN;
      const y2 = this.position.y + sin(angle) * PRONG_LEN;
      
      line(x1, y1, x2, y2);
    }
    
    pop();
  }
}