/**
 * Compilation: Overlapping Waves.js
 * Dependencies: p5.js, p5.sound.min.js 1.9.0
 * Data files: 
 *   - Sound/_T2_5sec_loop.wav
 *   - Sound/_Chora_5sec_loop.wav
 *   - Sound/_TimeWarp_5sec_loop.wav
 *   - Sound/_SunsetVechio_5sec_loop.wav
 *   - Sound/_Untitled_5sec_loop.wav
 *   - Sound/_Catwalk_5sec_loop.wav
 *   - miso-bold.ttf
 * 
 * Multi-track audio visualizer displaying six simultaneous 
 * waveforms with FFT analysis.
 * 
 * Interaction:
 * - Mouse click: toggle play/stop all tracks simultaneously
 * - Press 'f' or 'F': freeze/unfreeze playback and animation
 * - Press 's' or 'S': save canvas as timestamped PNG
 * 
 * Algorithm:
 * - Load 6 audio files and create FFT analyzer for each
 * - For each frame, extract waveform data from FFT
 * - Draw dual waveform traces: main and offset with connecting lines
 * - Overlay random-jittered dotted grid
 * - Display track info (title, BPM, duration) 
 *
 * For additional information, see:
 *
 * @author Chloe Choi
 * @author Alexandros Haridis
 */

// screen variables
let _width = 1410;
let _height = 353;
let backColor = 255;

// "fade" 
let reductionRate = 0.95;
let _diffuseLevel = 0;

// line colors
let colorOne;          // main stroke
let colorTwo;          // secondary stroke
let colorInBetween;    // connecting line

// grid variables
let createGridFlag = true;
let cellWidth = _width / 140;
let cellHeight = _height / 60;
let ptGap = 3;
let randHt = 5;
let randWidth = 5;

// audio variables
let waveAmpl = 32;
let diff = 12;
let inBetween = true;

let _voidVal = _height / 5;

// original offsets (kept quite close to your code)
let offset1 = _voidVal + _voidVal / 2 - 10;
let offset2 = (_voidVal + _voidVal / 2) * 2 - 10;
let offset3 = (_voidVal + _voidVal / 2) * 3 - 10;
let offset4 = (_voidVal + _voidVal / 2) * 4 - 10;
let offset5 = (_voidVal + _voidVal / 2) * 5 - 10;
let offset6 = (_voidVal + _voidVal / 2) * 6 - 10;

let freeze = false;

// Fonts
let font;
let fontSize = 8;

// Tracks (labels)
let track1 = "Broken Synths - T2";
let track11 = "123 bpm 6:00";
let track2 = "Neon & The other noble gases - Chora III";
let track22 = "120 bpm 4:44";
let track3 = "Broken Synths - Timewarp";
let track33 = "125 bpm 7:34";
let track4 = "Neon & The other noble gases - Sunset Vecchio";
let track44 = "120 bpm 5:19";
let track5 = "Broken Synths - Untitled track";
let track55 = "120 bpm 5:06";
let track6 = "Neon & The other noble gases - Catwalk";
let track66 = "90 bpm 4:42";

// p5.sound: 6 sound files and 6 FFT analyzers
let sound1, sound2, sound3, sound4, sound5, sound6;
let fft1, fft2, fft3, fft4, fft5, fft6;

/**
 * Preload audio files and font
 * @effects loads all sound files and font into memory before setup
 */
function preload() {
  sound1 = loadSound('Sound/_T2_5sec_loop.wav');
  sound2 = loadSound('Sound/_Chora_5sec_loop.wav');
  sound3 = loadSound('Sound/_TimeWarp_5sec_loop.wav');
  sound4 = loadSound('Sound/_SunsetVechio_5sec_loop.wav');
  sound5 = loadSound('Sound/_Untitled_5sec_loop.wav');
  sound6 = loadSound('Sound/_Catwalk_5sec_loop.wav');

  font = loadFont("miso-bold.ttf");
}

/**
 * Initialize canvas and audio system
 * @effects creates canvas, sets frame rate, initializes colors and FFT analyzers
 */
function setup() {
  createCanvas(_width, _height);
  frameRate(30);
  smooth();

  colorOne = color(0);
  colorTwo = color(0);
  colorInBetween = color(0, 250);

  background(backColor);

  rWidth = width * reductionRate;
  rHeight = height * reductionRate;

  // Setup FFT analyzers and tie each to a sound
  fft1 = new p5.FFT(0.8, 1024);
  fft1.setInput(sound1);

  fft2 = new p5.FFT(0.8, 1024);
  fft2.setInput(sound2);

  fft3 = new p5.FFT(0.8, 1024);
  fft3.setInput(sound3);

  fft4 = new p5.FFT(0.8, 1024);
  fft4.setInput(sound4);

  fft5 = new p5.FFT(0.8, 1024);
  fft5.setInput(sound5);

  fft6 = new p5.FFT(0.8, 1024);
  fft6.setInput(sound6);
}

/**
 * Main rendering loop
 * @effects draws background, waveforms, grid, and text each frame
 */
function draw() {
  background(backColor);

  // Draw oscilloscopes for each track
  if (sound1.isLoaded()) drawOscilloscopeFromFFT(fft1, offset1, waveAmpl, diff, inBetween);
  if (sound2.isLoaded()) drawOscilloscopeFromFFT(fft2, offset2, waveAmpl, diff, inBetween);
  if (sound3.isLoaded()) drawOscilloscopeFromFFT(fft3, offset3, waveAmpl, diff, inBetween);
  if (sound4.isLoaded()) drawOscilloscopeFromFFT(fft4, offset4, waveAmpl, diff, inBetween);
  if (sound5.isLoaded()) drawOscilloscopeFromFFT(fft5, offset5, waveAmpl, diff, inBetween);
  if (sound6.isLoaded()) drawOscilloscopeFromFFT(fft6, offset6, waveAmpl, diff, inBetween);

  // Grid overlay
  if (createGridFlag) createGrid();

  // Text labels
  drawText(false, track1,  width - 498, offset1 / 2 + 5,  150, 17);
  drawText(false, track11, width - 505, offset1 / 2 + 15, 150, 17);

  drawText(false, track2,  width - 152, offset2 / 2 + 5,  150, 17);
  drawText(false, track22, width - 118, offset2 / 2 + 15, 150, 17);

  drawText(false, track3,  width - 490, offset3 / 2 + 5,  150, 17);
  drawText(false, track33, width - 507, offset3 / 2 + 15, 150, 17);

  drawText(false, track4,  width - 159, offset4 / 2 + 5,  150, 17);
  drawText(false, track44, width - 117, offset4 / 2 + 15, 150, 17);

  drawText(false, track5,  width - 485, offset5 / 2 + 5,  150, 17);
  drawText(false, track55, width - 507, offset5 / 2 + 15, 150, 17);

  drawText(false, track6,  width - 150, offset6 / 2 + 5,  150, 17);
  drawText(false, track66, width - 116, offset6 / 2 + 15, 150, 17);
}

/**
 * Draw oscilloscope waveform from FFT data
 * 
 * Algorithm:
 * 1. Extract waveform array from FFT (values from -1 to 1)
 * 2. For each horizontal pixel:
 *    a. Map pixel position to waveform array index
 *    b. Calculate y-position for primary trace
 *    c. Calculate y-position for secondary trace (with offset)
 *    d. Draw both trace points
 *    e. Optionally draw connecting line between traces
 * 
 * @param {p5.FFT} fft - FFT analyzer for this track
 * @param {number} offset - vertical offset for this waveform
 * @param {number} waveAmpl - amplitude scaling factor
 * @param {number} diff - amplitude difference between traces
 * @param {boolean} inBetween - whether to draw connecting lines
 * @effects renders dual waveform traces with optional connecting lines
 */
function drawOscilloscopeFromFFT(fft, offset, waveAmpl, diff, inBetween) {
  let waveform = fft.waveform(); // array of -1..1
  let len = waveform.length;

  for (let x = 0; x < width; x++) {
    // map each pixel to an index in the waveform array
    let idx = floor(map(x, 0, width, 0, len - 2));
    let left = offset / 2 - waveform[idx] * waveAmpl;
    let right = offset / 2 - waveform[idx + 1] * (waveAmpl - diff);

    stroke(colorOne);
    point(x, left);

    stroke(colorTwo);
    point(x + 1, right);

    if (inBetween) {
      stroke(colorInBetween);
      line(x, left, x + 1, right);
    }
  }
}

/**
 * Draw grid of dotted lines with random jitter
 * 
 * Algorithm:
 * 1. Draw vertical dotted lines with random horizontal spacing
 * 2. Draw horizontal dotted lines with random vertical spacing
 * 
 * @effects renders dotted grid pattern across canvas
 */
function createGrid() {
  // vertical dotted lines
  stroke(180);
  strokeWeight(1);
  for (let i = cellWidth; i < width; i += cellWidth + int(random(randWidth))) {
    for (let j = 0; j < height; j += ptGap) {
      point(i, j);
    }
  }

  // horizontal dotted lines
  stroke(220);
  for (let i = cellHeight; i < height; i += cellHeight + int(random(randHt))) {
    for (let j = 0; j < width; j += ptGap) {
      point(j, i);
    }
  }
}

/**
 * Draw text with optional bounding rectangle
 * @param {boolean} drawRect - whether to draw bounding rectangle
 * @param {string} word - text content to display
 * @param {number} x - x-coordinate of text box top-left
 * @param {number} y - y-coordinate of text box top-left
 * @param {number} w - width of text box
 * @param {number} h - height of text box
 * @effects renders centered text at specified position
 */
function drawText(drawRect, word, x, y, w, h) {
  if (drawRect) {
    strokeWeight(0.25);
    noFill();
    rect(x, y, w, h);
  }

  fill(0);
  noStroke();
  textFont(font);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  text(word, x + w / 2, y + h / 2);
}

/**
 * Handle mouse press events
 * @effects toggles play/stop for all audio tracks
 */
function mousePressed() {
  toggleSound(sound1);
  toggleSound(sound2);
  toggleSound(sound3);
  toggleSound(sound4);
  toggleSound(sound5);
  toggleSound(sound6);
}

/**
 * Toggle play/stop for a single sound
 * @param {p5.SoundFile} snd - sound file to toggle
 * @effects starts looping or stops sound
 */
function toggleSound(snd) {
  if (!snd.isLoaded()) return;
  if (snd.isPlaying()) {
    snd.stop(); // closer to Ess .stop() behavior
  } else {
    snd.loop(); // FOREVER in Ess
  }
}

/**
 * Handle keyboard input
 * @effects saves canvas or toggles freeze based on key pressed
 */
function keyReleased() {
  // 's' => save PNG
  if (key === 's' || key === 'S') {
    saveCanvas(timestamp() + "_##", "png");
  }

  // 'f' => freeze/unfreeze
  if (key === 'f' || key === 'F') {
    freeze = !freeze;

    if (freeze) {
      if (sound1) sound1.pause();
      if (sound2) sound2.pause();
      if (sound3) sound3.pause();
      if (sound4) sound4.pause();
      if (sound5) sound5.pause();
      if (sound6) sound6.pause();
      noLoop();
    } else {
      if (sound1) sound1.play();
      if (sound2) sound2.play();
      if (sound3) sound3.play();
      if (sound4) sound4.play();
      if (sound5) sound5.play();
      if (sound6) sound6.play();
      loop();
    }
  }
}

/**
 * Generate timestamp string for file naming
 * @returns {string} timestamp in format YYMMDD_HHMMSS
 */
function timestamp() {
  let now = new Date();
  let y = String(now.getFullYear()).slice(-2);
  let m = nf(now.getMonth() + 1, 2);
  let d = nf(now.getDate(), 2);
  let H = nf(now.getHours(), 2);
  let M = nf(now.getMinutes(), 2);
  let S = nf(now.getSeconds(), 2);
  return y + m + d + "_" + H + M + S;
}