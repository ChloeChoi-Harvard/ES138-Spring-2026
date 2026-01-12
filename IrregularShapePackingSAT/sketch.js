/**
 * Compilation: IrregularShapePackingSAT.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Implements leaf packing algorithm using Separating Axis Theorem (SAT)
 * for precise polygon-to-polygon collision detection. Generates randomly
 * sized and oriented lens-shaped leaves via rejection sampling.
 * 
 * Algorithm: Brute-force rejection sampling with SAT collision detection
 * - Generate random leaf with constrained position
 * - Test collision using SAT (exact polygon overlap detection)
 * - Accept if no collision, repeat until target reached
 * 
 * SAT: Two convex polygons overlap if and only if there is no separating
 * axis between them. More accurate than circle approximation but slower.
 *
 * For additional information, see:
 * https://dyn4j.org/2010/01/sat/
 * https://youtu.be/-EsWKT7Doww
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const TARGET_COUNT = 110;    // desired number of leaves to pack
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
 * 2. Generate random candidate leaf with constrained position
 * 3. Test if candidate collides with existing leaves using SAT
 * 4. If no collision, add to leaves array
 * 5. Repeat until TARGET_COUNT reached or MAX_ATTEMPTS exceeded
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
 * Uses SAT for exact polygon collision detection.
 */
class Leaf {
  /**
   * Constructor - creates leaf with random properties
   * @effects initializes leaf with random size in [MIN_LEN, MAX_LEN] × [MIN_WID, MAX_WID],
   *          random rotation angle, and position constrained to keep entire leaf within canvas
   */
  constructor() {
    this.len = random(MIN_LEN, MAX_LEN);
    this.wid = random(MIN_WID, MAX_WID);
    this.angle = random(TWO_PI);
    
    // Calculate safe radius: diagonal of leaf's bounding box
    const halfLen = this.len * 0.5;
    const halfWid = this.wid * 0.5;
    const safeRadius = sqrt(halfLen * halfLen + halfWid * halfWid);
    
    // Constrain position to keep entire leaf within canvas bounds
    this.position = createVector(
      random(safeRadius, width - safeRadius),
      random(safeRadius, height - safeRadius)
    );
    
    this.polygon = null;  // cached polygon (computed on first access)
  }
  
  /**
   * Get the polygon points (cached for performance)
   * @returns {Object[]} array of {x, y} points in world coordinates
   */
  getPolygon() {
    if (!this.polygon) {
      const local = this.getLocalPolygon();
      this.polygon = this.rotateAndTranslate(local);
    }
    return this.polygon;
  }
  
  /**
   * Build lens shape in local coordinates
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
    const halfLen = this.len * 0.5;
    const halfWid = this.wid * 0.5;
    
    // Build top curve using sine function
    const topCurve = [];
    for (let i = 0; i <= POINTS_PER_SIDE; i++) {
      const t = i / POINTS_PER_SIDE;
      const x = -halfLen + t * this.len;
      const y = halfWid * sin(PI * t);
      topCurve.push({ x, y });
    }
    
    // Combine top curve + mirrored bottom
    const pts = [];
    for (const p of topCurve) {
      pts.push(p);
    }
    
    // Mirror for bottom (reverse order, flip y)
    for (let i = topCurve.length - 1; i >= 0; i--) {
      pts.push({ 
        x: topCurve[i].x, 
        y: -topCurve[i].y 
      });
    }
    
    return pts;
  }
  
  /**
   * Rotate and translate polygon from local to world coordinates
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
      const x = p.x * cosA - p.y * sinA + this.position.x;
      const y = p.x * sinA + p.y * cosA + this.position.y;
      out.push({ x, y });
    }
    
    return out;
  }
  
  /**
   * Check collision with array of other leaves using SAT
   * @param {Leaf[]} otherLeaves - array of leaves to test against
   * @requires otherLeaves is an array of Leaf objects
   * @returns {boolean} true if this leaf overlaps with any leaf in array
   */
  collides(otherLeaves) {
    const polyA = this.getPolygon();
    
    for (const other of otherLeaves) {
      const polyB = other.getPolygon();
      
      if (this.polygonsOverlapSAT(polyA, polyB)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * SAT collision detection between two convex polygons
   * 
   * Tests all potential separating axes (perpendicular to each edge of both polygons).
   * If a separating axis exists, polygons don't overlap. If no separating axis exists,
   * polygons must overlap.
   * 
   * @param {Object[]} polyA - first polygon's vertices
   * @param {Object[]} polyB - second polygon's vertices
   * @returns {boolean} true if polygons overlap, false otherwise
   */
  polygonsOverlapSAT(polyA, polyB) {
    // Check for separating axis using polyA's edges
    if (this.hasSeparatingAxis(polyA, polyB)) {
      return false;
    }
    
    // Check for separating axis using polyB's edges
    if (this.hasSeparatingAxis(polyB, polyA)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if there exists a separating axis from poly1's edges
   * 
   * Algorithm: For each edge of poly1:
   * 1. Compute perpendicular axis (rotate edge 90°)
   * 2. Normalize axis to unit vector
   * 3. Project both polygons onto this axis
   * 4. Check if projections have a gap (including padding)
   * 5. If gap exists, this is a separating axis
   * 
   * @param {Object[]} poly1 - polygon whose edges define potential axes
   * @param {Object[]} poly2 - polygon to test for separation
   * @returns {boolean} true if a separating axis is found, false otherwise
   */
  hasSeparatingAxis(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
      const j = (i + 1) % poly1.length;
      
      // Edge vector from vertex i to vertex j
      const ex = poly1[j].x - poly1[i].x;
      const ey = poly1[j].y - poly1[i].y;
      
      // Perpendicular axis (rotate edge 90° counterclockwise)
      let ax = -ey;
      let ay = ex;
      
      // Normalize to unit vector
      const mag = sqrt(ax * ax + ay * ay);
      ax /= mag;
      ay /= mag;
      
      // Project both polygons onto this axis
      const proj1 = this.projectPolygon(poly1, ax, ay);
      const proj2 = this.projectPolygon(poly2, ax, ay);
      
      // Check for gap in projections (accounting for padding)
      if (
        proj1.max + PADDING < proj2.min ||
        proj2.max + PADDING < proj1.min
      ) {
        return true;  // found a separating axis
      }
    }
    
    return false;
  }
  
  /**
   * Project polygon onto an axis and find min/max extents
   * 
   * Algorithm: Dot product of each vertex with the axis gives the
   * scalar projection. Track minimum and maximum projections to
   * get the 1D interval that the polygon occupies on this axis.
   * 
   * @param {Object[]} poly - polygon vertices to project
   * @param {number} ax - x-component of unit axis vector
   * @param {number} ay - y-component of unit axis vector
   * @returns {Object} {min, max} representing the projection interval
   */
  projectPolygon(poly, ax, ay) {
    let minVal = this.dot(poly[0], ax, ay);
    let maxVal = minVal;
    
    for (let i = 1; i < poly.length; i++) {
      const val = this.dot(poly[i], ax, ay);
      minVal = min(minVal, val);
      maxVal = max(maxVal, val);
    }
    
    return { min: minVal, max: maxVal };
  }
  
  /**
   * Dot product: project point onto axis
   * @param {Object} point - point with x and y coordinates
   * @param {number} ax - x-component of axis vector
   * @param {number} ay - y-component of axis vector
   * @returns {number} scalar projection of point onto axis
   */
  dot(point, ax, ay) {
    return point.x * ax + point.y * ay;
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
}