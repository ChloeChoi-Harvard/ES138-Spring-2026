/**
 * Compilation: EdnaAndradePattern_1.js
 * Dependencies: p5.js
 * Data files: none
 * 
 * Generates a mirrored arc fan pattern with connecting lines 
 * from opposite corners (top-left and bottom-right)
 * 
 * Algorithm: Mirrored arc generation
 * - Generate points along quarter-circle arc from top-left corner
 * - Mirror points to bottom-right corner (horizontal and vertical reflection)
 * - Reverse mirrored points for crossing pattern
 * - Draw radial lines from each corner to arc points
 * - Connect corresponding points between arcs
 * 
 * Reflection technique: Points are mirrored across both axes and reversed
 * to create symmetric crossing lines.
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Configuration constants
const NUM_LINES = 13;  // number of lines in each arc fan

// Global state
let leftPts = [];   // points along left arc (top-left corner)
let rightPts = [];  // points along right arc (bottom-right corner)

/**
 * Initialize canvas and generate arc pattern
 * 
 * Algorithm:
 * 1. Generate points along quarter-circle arc from origin
 * 2. Mirror points to opposite corner (reflect horizontally and vertically)
 * 3. Reverse mirrored points to create crossing pattern
 * 4. Draw radial lines from both corners to their respective arc points
 * 5. Draw connecting lines between corresponding arc points
 * 
 * @effects creates canvas, generates arc points, and draws mirrored arc fan pattern
 */
function setup() {
  createCanvas(600, 300);
  background("#F4F3F1");  // off-white background
  stroke(120);            // gray stroke
  strokeWeight(0.75);
  
  const radius = height;  // arc radius equals canvas height
  
  // Generate points along quarter-circle arc from top-left corner
  for (let i = 0; i < NUM_LINES; i++) {
    const ang = lerp(0, HALF_PI, i / (NUM_LINES - 1));
    const leftArc = {
      x: radius * cos(ang),
      y: radius * sin(ang)
    };
    leftPts.push(leftArc);
  }
  
  // Mirror points to bottom-right corner
  // Reflection: flip horizontally (width - x) and vertically (height - y)
  for (const p of leftPts) {
    rightPts.push({
      x: width - p.x,   // horizontal reflection
      y: height - p.y   // vertical reflection
    });
  }
  
  // Reverse right points to create crossing pattern
  rightPts.reverse();
  
  // Draw radial lines from both corners
  stroke(130);
  for (let i = 0; i < NUM_LINES; i++) {
    line(0, 0, leftPts[i].x, leftPts[i].y);                    // left fan
    line(width, height, rightPts[i].x, rightPts[i].y);         // right fan
  }
  
  // Draw connectors between corresponding arc points
  for (let i = 0; i < NUM_LINES; i++) {
    line(leftPts[i].x, leftPts[i].y, rightPts[i].x, rightPts[i].y);
  }
}