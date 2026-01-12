/**
 * Compilation: GlowSpheres.js
 * Dependencies: p5.js
 * Data files: none
 *
 * Creates a dual-layer composition with 2D glowing circles on a gradient
 * background and 3D illuminated spheres. Uses Mondrian-inspired color palette
 * with random color assignment to a 4x2 grid. The 2D layer provides atmospheric
 * glow effects while the 3D layer renders physically-lit spheres using WebGL.
 *
 * HTML Requirements:
 * - Two container divs: #layer2d (z-index: 1) and #layer3d (z-index: 2)
 * - Both layers positioned absolutely within #container
 * - Container dimensions: 600px × 400px
 *
 * Algorithm:
 * - Generate random color grid (2 rows × 4 columns) from Mondrian palette
 * - 2D sketch: Draw gradient background, then blur-layered circles at grid positions
 * - 3D sketch: Place point lights and emissive spheres at same grid positions
 * - Colors synchronized between both sketches via shared GRID_COLORS array
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// Grid configuration
const GRID_COLS = 4; // number of columns in grid
const GRID_ROWS = 2; // number of rows in grid

// Canvas dimensions
const CANVAS_WIDTH = 600; // canvas width in pixels
const CANVAS_HEIGHT = 300; // canvas height in pixels

// Mondrian-inspired color palette
const PALETTE = [
  [255, 0, 0], // red
  [255, 255, 0], // yellow
  [0, 0, 255], // blue
  [255, 255, 255], // white
  [0, 0, 0], // black
];

/**
 * Manages the shared color grid between 2D and 3D sketches
 */
class ColorGrid {
  /**
   * Create a new color grid with random palette assignments
   * @param {number} rows - number of rows in grid
   * @param {number} cols - number of columns in grid
   * @param {Array} palette - array of RGB color arrays
   */
  constructor(rows, cols, palette) {
    this.rows = rows;
    this.cols = cols;
    this.palette = palette;
    this.colors = [];
    this.generate();
  }

  /**
   * Generate random color assignments for each grid cell
   * @effects populates this.colors with random palette selections
   */
  generate() {
    for (let r = 0; r < this.rows; r++) {
      this.colors[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const index = Math.floor(Math.random() * this.palette.length);
        this.colors[r][c] = this.palette[index];
      }
    }
  }

  /**
   * Get color for a specific grid cell
   * @param {number} row - row index
   * @param {number} col - column index
   * @returns {Array} RGB color array [r, g, b]
   */
  getColor(row, col) {
    return this.colors[row][col];
  }
}

// Create shared color grid
const gridColors = new ColorGrid(GRID_ROWS, GRID_COLS, PALETTE);

/**
 * 2D sketch instance - gradient background with glowing circles
 * @param {p5} p - p5.js instance
 */
function sketch2D(p) {
  // Margin configuration for 2D layout
  const MARGIN_W = 120; // horizontal margin in pixels
  const MARGIN_H = 90; // vertical margin in pixels

  /**
   * Draw vertical gradient background from dark to light
   * @effects fills canvas with gradient using line-by-line interpolation
   */
  function drawBackgroundGradient() {
    for (let y = 0; y < p.height; y++) {
      const t = y / p.height;
      const c = p.lerpColor(p.color(80), p.color(200), t);
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
  }

  /**
   * Initialize 2D canvas and draw static composition
   * @effects creates canvas, draws gradient and glowing circles
   */
  p.setup = function () {
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent("layer2d");
    p.noStroke();

    // Calculate grid cell dimensions
    const cellW = (p.width - 2 * MARGIN_W) / (GRID_COLS - 1);
    const cellH = (p.height - 2 * MARGIN_H) / (GRID_ROWS - 1);

    // Draw gradient background
    drawBackgroundGradient();

    // Draw glowing circles at grid positions
    p.push();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const x = MARGIN_W + c * cellW;
        const y = MARGIN_H + r * cellH;
        const rgb = gridColors.getColor(r, c);
        const col = p.color(rgb[0], rgb[1], rgb[2]);

        // Draw layered glow effect: large blur + sharp core
        p.drawingContext.filter = "blur(85px)";
        p.fill(col);
        p.ellipse(x, y, 100, 100);

        p.drawingContext.filter = "blur(0px)";
        p.ellipse(x, y, 60, 60);
      }
    }
    p.pop();

    p.noLoop();
  };
}

/**
 * 3D sketch instance - WebGL spheres with point lighting
 * @param {p5} p - p5.js instance
 */
function sketch3D(p) {
  let cellW; // grid cell width in pixels
  let cellH; // grid cell height in pixels

  // Lighting parameters
  const LIGHT_Z = 200; // z-position of point lights
  const LIGHT_INTENSITY = 0.25; // intensity multiplier for point lights
  const SPHERE_SCALE = 0.35; // sphere radius as fraction of cell size

  /**
   * Initialize 3D canvas with WebGL renderer
   * @effects creates WebGL canvas, sets camera and lighting
   */
  p.setup = function () {
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, p.WEBGL);
    canvas.parent("layer3d");

    // Set camera position and orientation
    p.camera(0, 0, 1000, 0, 0, 0, 0, 1, 0);

    // Calculate grid cell dimensions
    cellW = p.width / GRID_COLS;
    cellH = p.height / GRID_ROWS;

    p.noStroke();
  };

  /**
   * Main rendering loop - draws lights and spheres each frame
   * @effects renders 3D scene with point lights and emissive spheres
   */
  p.draw = function () {
    p.clear();
    p.ambientLight(40);

    // Place point lights at each grid position
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const rgb = gridColors.getColor(r, c);
        const x = -p.width / 2 + cellW * (c + 0.5);
        const y = -p.height / 2 + cellH * (r + 0.5);

        p.pointLight(
          rgb[0] * LIGHT_INTENSITY,
          rgb[1] * LIGHT_INTENSITY,
          rgb[2] * LIGHT_INTENSITY,
          x,
          y,
          LIGHT_Z
        );
      }
    }

    // Draw emissive spheres at each grid position
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const rgb = gridColors.getColor(r, c);
        const x = -p.width / 2 + cellW * (c + 0.5);
        const y = -p.height / 2 + cellH * (r + 0.5);

        p.push();
        p.translate(x, y, 0);

        const sphereSize = Math.min(cellW, cellH) * 0.8;
        p.emissiveMaterial(rgb[0], rgb[1], rgb[2]);
        p.ambientMaterial(rgb[0], rgb[1], rgb[2]);
        p.sphere(sphereSize * SPHERE_SCALE);

        p.pop();
      }
    }
  };
}

// Initialize both p5 instances
new p5(sketch2D);
new p5(sketch3D);
