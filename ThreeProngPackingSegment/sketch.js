/**
 * Compilation: ThreeProngPackingSegment.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Implements three-pronged pattern packing using precise segment-to-segment
 * collision detection. Each element consists of three line segments radiating
 * from a center point at 120-degree intervals.
 * 
 * Algorithm: Brute-force rejection sampling with segment collision
 * - Generate random three-prong element with constrained position
 * - Test collision using segment-to-segment distance calculations
 * - Accept if minimum distance exceeds clearance threshold
 * - Repeat until target count reached or max attempts exceeded
 * 
 * Collision detection: Computes exact distance between line segments using
 * geometric algorithms. More precise than circle bounding but more expensive.
 *
 * For additional information, see:
 * https://en.wikipedia.org/wiki/Skew_lines#Distance
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const TARGET_COUNT = 50;     // desired number of three-prong elements to pack
const MAX_ATTEMPTS = 60000;  // upper limit on placement attempts to prevent infinite loops
const PRONG_LEN = 50;        // length of each prong from center to tip in pixels
const PRONG_W = 12;          // width/thickness of prong stroke in pixels
const PADDING = 3;           // minimum spacing between prong edges in pixels

// Global state
let prongs = [];  // array of successfully placed ThreeProng objects

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
 * @effects sets background, packs prongs, and draws them with stats
 */
function draw() {
  background(193, 216, 239);  // blue background
  packProngs();
  
  // Draw all prongs
  stroke(73, 86, 105);  // dark blue-gray color
  strokeWeight(PRONG_W);
  strokeCap(SQUARE);
  
  for (const prong of prongs) {
    prong.draw();
  }
  
  // Uncomment to display placement statistics in top-left corner
  fill(255);
  noStroke();
  textSize(14);
  text(`Placed: ${prongs.length}/${TARGET_COUNT}`, 12, 20);
}

/**
 * Main packing algorithm using rejection sampling
 * 
 * Algorithm:
 * 1. Clear existing prongs array
 * 2. Generate random candidate three-prong with constrained position
 * 3. Test if candidate segments collide with existing prong segments
 * 4. If no collision (minimum distance > clearance), add to prongs array
 * 5. Repeat until TARGET_COUNT reached or MAX_ATTEMPTS exceeded
 * 
 * @requires global constants TARGET_COUNT, MAX_ATTEMPTS are positive
 * @effects modifies global prongs array with successfully packed ThreeProng objects
 */
function packProngs() {
  prongs = [];  // reset to empty array
  const clearance = PRONG_W + PADDING;
  
  for (let k = 0; k < MAX_ATTEMPTS && prongs.length < TARGET_COUNT; k++) {
    const candidate = new ThreeProng();
    
    if (!candidate.collides(prongs, clearance)) {
      prongs.push(candidate);
    }
  }
}

/**
 * ThreeProng class
 * 
 * Represents three line segments radiating from a center point at 120-degree
 * intervals. Segments are generated on-demand for collision testing.
 */
class ThreeProng {
  /**
   * Constructor - creates three-prong element with random properties
   * @effects initializes element with random position constrained inside canvas,
   *          and random rotation angle
   */
  constructor() {
    // Constrain position to keep all prongs within canvas bounds
    this.position = createVector(
      random(PRONG_LEN, width - PRONG_LEN),
      random(PRONG_LEN, height - PRONG_LEN)
    );
    this.rotation = random(TWO_PI);
  }
  
  /**
   * Generate three line segments radiating from center
   * 
   * Creates segments at 120-degree intervals around the center point.
   * Each segment is stored as a pair of p5.Vector endpoints.
   * 
   * @returns {Object[]} array of segment objects with {start, end} p5.Vector properties
   */
  generateSegments() {
    const segs = [];
    const step = TWO_PI / 3;  // 120 degrees apart (360° / 3 prongs)
    
    for (let i = 0; i < 3; i++) {
      const angle = this.rotation + step * i;
      
      // Calculate direction vector for this prong
      const direction = createVector(cos(angle), sin(angle));
      
      // Scale direction to prong length
      direction.mult(PRONG_LEN);
      
      // Calculate endpoint by adding direction to center position
      const endpoint = p5.Vector.add(this.position, direction);
      
      // Segment from center to tip
      segs.push({
        start: this.position.copy(),
        end: endpoint
      });
    }
    
    return segs;
  }
  
  /**
   * Check collision with array of other three-prong elements
   * 
   * @param {ThreeProng[]} otherProngs - array of elements to test against
   * @param {number} clearance - minimum allowed distance between segments
   * @requires otherProngs is an array of ThreeProng objects
   * @returns {boolean} true if any segment pair is closer than clearance
   */
  collides(otherProngs, clearance) {
    const minDistSq = clearance * clearance;
    
    for (const other of otherProngs) {
      if (this.collidesWithProng(other, minDistSq)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check collision with a single other three-prong element
   * 
   * Algorithm:
   * 1. Quick rejection test: check if centers are too far apart
   * 2. If possibly overlapping, test all 9 segment pairs (3×3)
   * 3. Compute segment-to-segment distance for each pair
   * 4. If any distance < threshold, collision detected
   * 
   * Optimization: Early rejection based on center distance avoids expensive
   * segment calculations when elements are clearly separated.
   * 
   * @param {ThreeProng} other - element to test collision against
   * @param {number} minDistSq - minimum allowed distance squared
   * @requires other is a ThreeProng object with position and segments
   * @returns {boolean} true if elements collide, false otherwise
   */
  collidesWithProng(other, minDistSq) {
    // Quick rejection: check if centers are too far apart
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    const maxReach = PRONG_LEN * 2 + sqrt(minDistSq);
    
    if (dx * dx + dy * dy > maxReach * maxReach) {
      return false;  // too far to possibly collide
    }
    
    // Generate segments for both prongs
    const mySegs = this.generateSegments();
    const theirSegs = other.generateSegments();
    
    // Precise check: test all 3×3 segment pairs
    for (const segA of mySegs) {
      for (const segB of theirSegs) {
        const distSq = segmentSegmentDistSq(segA, segB);
        
        if (distSq < minDistSq) {
          return true;  // collision detected
        }
      }
    }
    
    return false;
  }
  
  /**
   * Render three prong segments to canvas
   * @effects draws three lines from center to tips at current rotation
   */
  draw() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.rotation);
    
    for (let i = 0; i < 3; i++) {
      push();
      rotate(TWO_PI / 3 * i);
      line(0, 0, PRONG_LEN, 0);
      pop();
    }
    
    pop();
  }
}

/**
 * Geometric Utility Functions
 * 
 * These functions implement standard computational geometry algorithms
 * for segment-segment distance and intersection testing.
 */

/**
 * Calculate squared distance between two line segments
 * 
 * Algorithm:
 * 1. Check if segments intersect (distance = 0)
 * 2. Otherwise, compute minimum of four endpoint-to-segment distances
 * 3. Return minimum distance found
 * 
 * This approach handles all cases: intersecting, parallel, skew segments.
 * 
 * @param {Object} s1 - first segment with {start, end} p5.Vector properties
 * @param {Object} s2 - second segment with {start, end} p5.Vector properties
 * @returns {number} squared distance between segments
 */
function segmentSegmentDistSq(s1, s2) {
  // If segments intersect, distance is 0
  if (segmentsIntersect(s1, s2)) {
    return 0;
  }
  
  // Otherwise, minimum of all endpoint-to-segment distances
  const d1 = pointSegmentDistSq(s1.start, s2);
  const d2 = pointSegmentDistSq(s1.end, s2);
  const d3 = pointSegmentDistSq(s2.start, s1);
  const d4 = pointSegmentDistSq(s2.end, s1);
  
  return min(d1, d2, d3, d4);
}

/**
 * Calculate squared distance from point to line segment
 * 
 * Algorithm:
 * 1. Project point onto infinite line containing segment
 * 2. Clamp projection to segment endpoints (t ∈ [0,1])
 * 3. Compute distance from point to clamped projection
 * 
 * Uses parametric form: closest point = a + t(b-a) where t is clamped.
 * 
 * @param {p5.Vector} point - point to measure from
 * @param {Object} seg - segment with {start, end} p5.Vector properties
 * @returns {number} squared distance from point to segment
 */
function pointSegmentDistSq(point, seg) {
  const segmentStart = seg.start;
  const segmentEnd = seg.end;
  
  // Vector from segment start to end
  const segmentVector = p5.Vector.sub(segmentEnd, segmentStart);
  
  // Vector from segment start to point
  const pointVector = p5.Vector.sub(point, segmentStart);
  
  const segLenSq = segmentVector.magSq();
  
  // Handle degenerate case (segment is a point)
  if (segLenSq === 0) {
    return pointVector.magSq();
  }
  
  // Project point onto segment, clamped to [0, 1]
  let t = pointVector.dot(segmentVector) / segLenSq;
  t = constrain(t, 0, 1);
  
  // Find closest point on segment
  const closestPoint = p5.Vector.add(segmentStart, segmentVector.copy().mult(t));
  
  // Distance from point to closest point
  const distanceVector = p5.Vector.sub(point, closestPoint);
  return distanceVector.magSq();
}

/**
 * Check if two line segments intersect
 * 
 * Algorithm: Uses orientation test based on cross products.
 * Segments intersect if they straddle each other (different orientations
 * on opposite sides) or if they are collinear and overlapping.
 * 
 * @param {Object} s1 - first segment with {start, end} p5.Vector properties
 * @param {Object} s2 - second segment with {start, end} p5.Vector properties
 * @returns {boolean} true if segments intersect or touch
 */
function segmentsIntersect(s1, s2) {
  const a = s1.start;
  const b = s1.end;
  const c = s2.start;
  const d = s2.end;
  
  // Check orientation of all four combinations
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  
  // General case: segments straddle each other
  if (o1 * o2 < 0 && o3 * o4 < 0) return true;
  
  // Special cases: collinear and touching
  if (o1 === 0 && onSegment(a, b, c)) return true;
  if (o2 === 0 && onSegment(a, b, d)) return true;
  if (o3 === 0 && onSegment(c, d, a)) return true;
  if (o4 === 0 && onSegment(c, d, b)) return true;
  
  return false;
}

/**
 * Calculate orientation of ordered triplet (a, b, p)
 * 
 * Uses cross product to determine if point p is clockwise,
 * counterclockwise, or collinear with segment ab.
 * 
 * @param {p5.Vector} a - first point
 * @param {p5.Vector} b - second point
 * @param {p5.Vector} p - test point
 * @returns {number} 0 = collinear, 1 = clockwise, -1 = counterclockwise
 */
function orient(a, b, p) {
  // Cross product: (b - a) × (p - a)
  const v = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  
  // Tolerance for numerical stability
  const eps = 1e-9;
  if (abs(v) < eps) return 0;
  
  return v > 0 ? 1 : -1;
}

/**
 * Check if point p lies on segment (a, b)
 * 
 * Assumes p is collinear with a and b (checked separately).
 * Tests if p is within the bounding box of the segment.
 * 
 * @param {p5.Vector} a - segment start
 * @param {p5.Vector} b - segment end
 * @param {p5.Vector} p - point to test
 * @returns {boolean} true if point is on segment
 */
function onSegment(a, b, p) {
  const eps = 1e-9;
  return (
    p.x >= min(a.x, b.x) - eps &&
    p.x <= max(a.x, b.x) + eps &&
    p.y >= min(a.y, b.y) - eps &&
    p.y <= max(a.y, b.y) + eps
  );
}