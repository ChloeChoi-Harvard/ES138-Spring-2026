/**
 * Compilation: IrregularShapeCirclePacking.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Implements irregular packing algorithm using circle approximation collision detection.
 * Generates randomly sized and oriented lens-shaped leaves, using multiple circles
 * along each leaf's centerline to approximate its shape for efficient collision
 * detection via rejection sampling.
 * 
 * Algorithm: Brute-force rejection sampling with circle approximation
 * - Generate random leaf (position, size, rotation)
 * - Approximate leaf shape with 3-6 circles along centerline
 * - Accept if leaf doesn't collide with existing leaves
 * - Repeat until target count reached or max attempts exceeded
 * 
 * Collision detection: Circle-to-circle tests are faster than polygon-to-polygon,
 * making this approximation effective for irregular shapes.
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const TARGET_COUNT = 140;    // desired number of leaves to pack
const MIN_LEN = 40;          // minimum leaf length in pixels
const MAX_LEN = 140;         // maximum leaf length in pixels
const MIN_WID = 14;          // minimum leaf width in pixels
const MAX_WID = 46;          // maximum leaf width in pixels
const PADDING = 5;           // minimum spacing between leaf edges in pixels
const MAX_ATTEMPTS = 250000; // upper limit on placement attempts to prevent infinite loops
const POINTS_PER_SIDE = 14;  // number of points per half-curve for lens polygon

// Global state
let leaves = [];  // array of successfully placed Leaf objects

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
 * @effects sets background, packs leaves, and draws them
 */
function draw() {
  background(221, 196, 135);  // tan background
  packLeaves();
  
  // Draw all successfully placed leaves
  fill(68, 44, 41);  // dark brown leaf color
  noStroke();
  for (const leaf of leaves) {
    leaf.draw();
    // Uncomment to visualize circle approximations:
    // leaf.drawCircles();
  }
  
  // Uncomment to display placement statistics in top-left corner
  // fill(255);
  // textSize(14);
  // text(`Placed: ${leaves.length}/${TARGET_COUNT}`, 12, 20);
}

/**
 * Main packing algorithm using rejection sampling
 * 
 * Algorithm:
 * 1. Clear existing leaves array
 * 2. Generate random candidate leaf with random size and rotation
 * 3. Position is automatically constrained to keep leaf within canvas
 * 4. Test if candidate collides with existing leaves
 * 5. If no collision, add to leaves array
 * 6. Repeat until TARGET_COUNT reached or MAX_ATTEMPTS exceeded
 * 
 * @requires global constants TARGET_COUNT, MAX_ATTEMPTS are positive
 * @effects modifies global leaves array with successfully packed Leaf objects
 */
function packLeaves() {
  leaves = [];  // reset to empty array
  let attempts = 0;
  
  while (leaves.length < TARGET_COUNT && attempts < MAX_ATTEMPTS) {
    attempts++;
    const candidate = new Leaf();
    
    if (!candidate.collides(leaves)) {
      leaves.push(candidate);
    }
  }
}

/**
 * Leaf class
 * 
 * Represents a lens-shaped leaf with random position, size, and rotation.
 */
class Leaf {
  /**
   * Constructor - creates leaf with random properties
   * @effects initializes leaf with random size in [MIN_LEN, MAX_LEN] × [MIN_WID, MAX_WID],
   *          random rotation angle, position constrained to keep entire leaf within canvas,
   *          and generates circle approximation
   */
  constructor() {
    // Generate random size and rotation first
    this.len = random(MIN_LEN, MAX_LEN);  // leaf length
    this.wid = random(MIN_WID, MAX_WID);  // leaf width
    this.angle = random(TWO_PI);          // rotation angle
    
    // Calculate safe radius: diagonal of leaf's bounding box
    const halfLen = this.len * 0.5;
    const halfWid = this.wid * 0.5;
    const safeRadius = sqrt(halfLen * halfLen + halfWid * halfWid);
    
    // Constrain position to keep entire leaf within canvas bounds
    this.position = createVector(
      random(safeRadius, width - safeRadius),   // x-position
      random(safeRadius, height - safeRadius)   // y-position
    );
    
    this.circles = this.generateCircles(); // circle approximation for collision
  }
  
  /**
   * Generate circle approximation for this leaf
   * 
   * Algorithm:
   * - Determines number of circles based on leaf length (3-6 circles)
   * - Distributes circles evenly along centerline from tip to tip
   * - Applies sinusoidal taper to circle radii (larger in middle, smaller at tips)
   * - Transforms circles from local to world coordinates
   * 
   * This approximation allows fast circle-to-circle collision tests instead of
   * expensive polygon-to-polygon tests.
   * 
   * @returns {Object[]} array of circle objects with {x, y, r} in world coordinates
   */
  generateCircles() {
    const numCircles = this.getNumCircles();
    const halfLen = this.len * 0.5;
    const baseRadius = max(this.wid * 0.55, 2);
    
    const localCircles = [];
    
    // Distribute circles along the centerline with margin at tips
    const margin = baseRadius * 0.35;
    const leftEdge = -halfLen + margin;
    const rightEdge = halfLen - margin;
    
    for (let i = 0; i < numCircles; i++) {
      const t = i / (numCircles - 1);  // parameter from 0 to 1
      const localX = lerp(leftEdge, rightEdge, t);
      
      // Taper radius toward leaf tips using sine curve
      const taper = 0.55 + 0.45 * sin(PI * t);
      const radius = baseRadius * taper;
      
      localCircles.push({ x: localX, y: 0, r: radius });
    }
    
    return this.transformCirclesToWorld(localCircles);
  }
  
  /**
   * Determine number of circles based on leaf size
   * @returns {number} number of circles (3-6) to use for this leaf
   */
  getNumCircles() {
    if (this.len < 70) return 3;
    if (this.len < 95) return 4;
    if (this.len < 115) return 5;
    return 6;
  }
  
  /**
   * Transform circles from local to world coordinates
   * 
   * Applies rotation and translation to convert from leaf's local
   * coordinate system (centered, aligned along x-axis) to world
   * canvas coordinates.
   * 
   * @param {Object[]} localCircles - circles in local coordinates {x, y, r}
   * @returns {Object[]} circles in world coordinates {x, y, r}
   */
  transformCirclesToWorld(localCircles) {
    const cosA = cos(this.angle);
    const sinA = sin(this.angle);
    const worldCircles = [];
    
    for (const circle of localCircles) {
      // Apply rotation matrix and translation
      const worldX = circle.x * cosA - circle.y * sinA + this.position.x;
      const worldY = circle.x * sinA + circle.y * cosA + this.position.y;
      worldCircles.push({ x: worldX, y: worldY, r: circle.r });
    }
    
    return worldCircles;
  }
  
  /**
   * Check collision with array of other leaves
   * 
   * @param {Leaf[]} otherLeaves - array of leaves to test against
   * @requires otherLeaves is an array of Leaf objects
   * @returns {boolean} true if this leaf overlaps with any leaf in array
   */
  collides(otherLeaves) {
    for (const other of otherLeaves) {
      if (this.collidesWithLeaf(other)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check collision with a single other leaf using circle approximation
   * 
   * Algorithm: Tests all pairs of circles between the two leaves.
   * Two circles collide if distance between centers is less than
   * sum of their radii plus padding.
   * 
   * Optimization: Uses squared distances to avoid expensive sqrt()
   * 
   * @param {Leaf} other - leaf to test collision against
   * @requires other is a Leaf object with circles array
   * @returns {boolean} true if any circle pairs overlap, false otherwise
   */
  collidesWithLeaf(other) {
    // Test all circle pairs between leaves
    for (const circleA of this.circles) {
      for (const circleB of other.circles) {
        const radiusSum = circleA.r + circleB.r + PADDING;
        const dx = circleA.x - circleB.x;
        const dy = circleA.y - circleB.y;
        const distSquared = dx * dx + dy * dy;
        
        // Collision occurs when distance² < radiusSum²
        if (distSquared < radiusSum * radiusSum) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * Get the polygon points for this leaf in world coordinates
   * 
   * @returns {Object[]} array of {x, y} points defining leaf outline
   */
  getPolygon() {
    const local = this.getLocalPolygon();
    return this.rotateAndTranslate(local);
  }
  
  /**
   * Build lens shape polygon in local coordinates
   * 
   * Algorithm: Creates symmetric lens by computing top sine curve,
   * then mirroring it for bottom half. This creates an organic,
   * eye-shaped leaf with smooth curves.
   * 
   * The top curve uses sin(π*t) for a smooth bulge, starting and
   * ending at zero. The bottom curve mirrors this by flipping y-values.
   * 
   * @returns {Object[]} array of {x, y} points in local coordinates (centered, horizontal)
   */
  getLocalPolygon() {
    const pts = [];
    const halfLen = this.len * 0.5;
    const halfWid = this.wid * 0.5;
    
    // Build top curve using sine function
    const topCurve = [];
    for (let i = 0; i <= POINTS_PER_SIDE; i++) {
      const t = i / POINTS_PER_SIDE;  // parameter from 0 to 1
      const x = -halfLen + t * this.len;
      const y = halfWid * sin(PI * t);  // sine creates symmetric bulge
      topCurve.push({ x, y });
    }
    
    // Add top curve to points array
    for (const p of topCurve) {
      pts.push(p);
    }
    
    // Mirror for bottom curve (reverse order, flip y-coordinate)
    for (let i = topCurve.length - 1; i >= 0; i--) {
      pts.push({ 
        x: topCurve[i].x, 
        y: -topCurve[i].y 
      });
    }
    
    return pts;
  }
  
  /**
   * Rotate and translate polygon points from local to world coordinates
   * 
   * Applies 2D rotation matrix followed by translation.
   * 
   * @param {Object[]} poly - polygon points in local coordinates
   * @returns {Object[]} polygon points in world coordinates
   */
  rotateAndTranslate(poly) {
    const out = [];
    const cosA = cos(this.angle);
    const sinA = sin(this.angle);
    
    for (const p of poly) {
      // Apply rotation matrix and translation
      const x = p.x * cosA - p.y * sinA + this.position.x;
      const y = p.x * sinA + p.y * cosA + this.position.y;
      out.push({ x, y });
    }
    
    return out;
  }
  
  /**
   * Render leaf polygon to canvas
   * @effects draws filled polygon shape at transformed position and rotation
   */
  draw() {
    const poly = this.getPolygon();
    beginShape();
    for (const p of poly) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
  
  /**
   * Debug visualization of circle approximation
   * 
   * Draws semi-transparent red circles showing the collision approximation.
   * Useful for understanding and debugging the circle-based collision system.
   * 
   * @effects draws circle outlines over the leaf for debugging
   */
  drawCircles() {
    push();
    noFill();
    stroke(255, 0, 0, 100);  // semi-transparent red
    strokeWeight(1);
    for (const c of this.circles) {
      circle(c.x, c.y, c.r * 2);
    }
    pop();
  }
}