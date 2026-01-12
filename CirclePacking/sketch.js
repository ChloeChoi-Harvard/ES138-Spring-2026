/**
 * Compilation: CirclePacking.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Implements random circle packing algorithm using rejection sampling.
 * Repeatedly generates random circles and places them if they don't
 * overlap with existing circles or canvas boundaries.
 * 
 * Algorithm: Brute-force rejection sampling
 * - Generate random circle (position and radius)
 * - Accept if no collisions detected
 * - Repeat until target count reached or max attempts exceeded
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const TARGET_COUNT = 250;    // desired number of circles to pack
const MIN_R = 6;             // minimum circle radius in pixels
const MAX_R = 30;            // maximum circle radius in pixels
const PADDING = 1.5;         // minimum spacing between circle edges in pixels
const MAX_ATTEMPTS = 200000; // upper limit on placement attempts to prevent infinite loops

// Global state
let circles = [];  // array of successfully placed Circle objects

/**
 * Initialize canvas
 * @effects creates canvas and sets drawing to static mode
 */
function setup() {
  createCanvas(500, 700);
  noLoop();
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
  for (const circle of circles) {
    circle.draw();
  }
  
  // Uncomment to display placement statistics in top-left corner
  // fill(255);
  // textSize(14);
  // text(`Placed: ${circles.length}/${TARGET_COUNT}`, 12, 20);
}

/**
 * Main packing algorithm using rejection sampling
 * 
 * Algorithm:
 * 1. Clear existing circles array
 * 2. Generate random candidate circle (position constrained to canvas)
 * 3. Test if candidate collides with any existing circles
 * 4. If no collision, add to circles array
 * 5. Repeat until TARGET_COUNT reached or MAX_ATTEMPTS exceeded
 * 
 * @requires global constants TARGET_COUNT, MAX_ATTEMPTS are positive
 * @effects modifies global circles array with successfully packed Circle objects
 */
function packCircles() {
  circles = [];  // reset to empty array
  let attempts = 0;
  
  while (circles.length < TARGET_COUNT && attempts < MAX_ATTEMPTS) {
    attempts++;
    const candidate = new Circle();
    
    if (!candidate.collides(circles)) {
      circles.push(candidate);
    }
  }
}

/**
 * Circle class
 * 
 * Represents a circle with random position and radius.
 */
class Circle {
  /**
   * Constructor - creates circle with random position and radius
   * @effects initializes circle with random radius in [MIN_R, MAX_R]
   *          and random position constrained inside canvas
   */
  constructor() {
    this.radius = random(MIN_R, MAX_R);  // random radius
    
    // Constrain position to keep entire circle within canvas bounds
    this.position = createVector(
      random(this.radius, width - this.radius),   // x-position
      random(this.radius, height - this.radius)   // y-position
    );
  }
  
  /**
   * Check collision with array of other circles
   * 
   * @param {Circle[]} otherCircles - array of circles to test against
   * @requires otherCircles is an array of Circle objects
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
   * Check collision with a single circle using distance test
   * 
   * Algorithm: Two circles collide if distance between centers
   *            is less than sum of their radii plus padding
   * 
   * Optimization: Uses squared distances to avoid expensive sqrt()
   * 
   * @param {Circle} other - circle to test collision against
   * @requires other is a Circle object with position and radius
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
   * Render circle to canvas
   * @effects draws filled circle at this.position with diameter = 2 * radius
   */
  draw() {
    // circle() takes center coordinates and diameter (not radius)
    circle(this.position.x, this.position.y, this.radius * 2);
  }
}