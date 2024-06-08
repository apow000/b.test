let centerX, centerY;
let outerDiameter = 500;
let circles = [];
let lastResetTime = 0;
const resetInterval = 9000; // 9000 milliseconds = 9 seconds
let globalAngleX = 0;
let globalAngleY = 0;
let baseRotationSpeed = 0.0005; // 초기 기본 회전 속도
let maxRotationSpeed = 0.005; // 최대 회전 속도를 절반으로 줄임
let rotationAcceleration = 0.0001; // 회전 가속도
let rotationDeceleration = 0.0002; // 회전 감속도

let stopRotation = false;
let stopRotationTime = 0;
const stopDuration = 5000; // 5000 milliseconds = 5 seconds

let points = [];
const numPoints = 720; // 원 둘레에 위치할 점의 개수

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // WEBGL 모드로 캔버스 생성
  centerX = width / 2;
  centerY = height / 2;

  // 초기 패턴 생성
  generatePattern();
  generatePoints();

  // 조명 설정
  ambientLight(10); // 주변광 설정
  directionalLight(0, 0, 255, 300, 0, -1); // 방향광 설정
}

function draw() {
  background(255); // 배경을 흰색으로 설정

  // Calculate elapsed time since the last reset
  let currentTime = millis();
  let elapsedTime = currentTime - lastResetTime;

  // Rotate the scene
  let speed = calculateRotationSpeed(elapsedTime);
  if (!stopRotation) {
    globalAngleX += speed;
    globalAngleY += speed;
  }
  rotateX(globalAngleX);
  rotateY(globalAngleY);

  // Draw the outer torus (large circle) as points
  let outerCircleRadius = outerDiameter / 2;
  drawPoints(outerCircleRadius);

  // Draw and rotate the inner circles (donuts)
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];
    push();
    translate(circle.x - centerX, circle.y - centerY, 0);

    // Apply rotation with individual start times
    let currentAngleX = globalAngleX + circle.startTimeX;
    let currentAngleY = globalAngleY + circle.startTimeY;
    rotateX(currentAngleX);
    rotateY(currentAngleY);

    // Draw the inner torus shape as points
    drawPoints(circle.r);
    
    pop();
  }

  // Check if it's time to stop rotation
  if (stopRotation && currentTime > stopRotationTime + stopDuration) {
    stopRotation = false;
    generatePattern(); // Generate new pattern after stop duration
    generatePoints(); // Generate new points
    lastResetTime = currentTime; // Update the last reset time
  }
}

function mousePressed() {
  if (!stopRotation) {
    stopRotation = true;
    stopRotationTime = millis(); // Record the time when rotation stops
    saveCanvas('myPattern_' + generateRandomWord(), 'png'); // Save canvas as PNG with a random word
  }
}

function generatePattern() {
  circles = []; // 배열 초기화

  // 바깥쪽 도넛 (큰 원) 설정
  let outerCircleRadius = outerDiameter / 2;

  // 내부 도넛 (작은 원) 설정
  let numCircles = int(random(3, 6)); // 3에서 5개의 원을 랜덤하게 선택
  let minRadius = 50; // 최소 반지름
  let maxRadius = outerDiameter / 1.5; // 최대 반지름은 큰 원의 반지름의 3분의 1로 설정

  for (let i = 0; i < numCircles; i++) {
    let radius = random(minRadius, maxRadius);
    
    // 원의 중심을 랜덤하게 설정
    let angleX = random(TWO_PI);
    let angleY = random(TWO_PI);
    let distance = random(outerCircleRadius - radius, outerCircleRadius + radius); // 큰 원의 반지름과 작은 원의 반지름을 고려하여 거리 설정
    let x = centerX + cos(angleX) * distance;
    let y = centerY + sin(angleY) * distance;

    // 개별 원의 회전 시작 시점 설정
    let startTimeX = random(TWO_PI);
    let startTimeY = random(TWO_PI);

    circles.push({
      x: x,
      y: y,
      r: radius,
      startTimeX: startTimeX,
      startTimeY: startTimeY,
      initialRotationSpeed: random(baseRotationSpeed, maxRotationSpeed) * random([-1, 1]), // 초기 회전 속도
      currentRotationSpeed: 0 // 현재 회전 속도 (초기에 0으로 설정)
    });
  }
}

function calculateRotationSpeed(elapsedTime) {
  // 가속도 및 감속도를 적용하여 회전 속도 계산
  if (elapsedTime < 5000) {
    return map(elapsedTime, 0, 5000, 0, maxRotationSpeed);
  } else {
    return maxRotationSpeed;
  }
}

function generatePoints() {
  points = [];
  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, TWO_PI);
    points.push(new Point(angle));
  }
}

class Point {
  constructor(angle) {
    this.angle = angle;
    this.blinkSpeed = random(0.01, 0.05);
    this.blink = random(TWO_PI);
    this.offset = random(-0.01, 0.01); // 약간의 랜덤 오프셋 추가
  }

  update() {
    this.blink += this.blinkSpeed;
    if (this.blink > TWO_PI) {
      this.blink -= TWO_PI;
    }
  }

  display(radius) {
    let alpha = map(sin(this.blink), -1, 1, 50, 255);
    let x = cos(this.angle + this.offset) * radius;
    let y = sin(this.angle + this.offset) * radius;
    push();
    translate(x, y, 0);
    noStroke();
    fill(0, 0, 255, alpha);
    ellipse(0, 0, 2, 2); // 점의 크기를 2로 설정
    pop();
  }
}

function drawPoints(radius) {
  for (let i = 0; i < points.length; i++) {
    points[i].update();
    points[i].display(radius);
  }
}

// 랜덤한 영어 단어 생성 함수
function generateRandomWord() {
  let words = [
    // 명사
    "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew", 
    "imbe", "jackfruit", "kiwi", "lemon", "mango", "nectarine", "orange", "papaya", 
    "quince", "raspberry", "strawberry", "tangerine", "ugli", "vanilla", "watermelon", 
    "xigua", "yuzu", "zucchini", "galaxy", "universe", "nebula", "blackhole", 
    "spaceship", "alien", "extraterrestrial", "comet", "meteor", "asteroid", "rocket", 
    "planet", "star", "constellation", "quasar", "wormhole", "supernova", "spacesuit", 
    "telescope", "spaceship", "extraterrestrial", "probe", "terraform", "interstellar", 
    "warpdrive", "dimension", "ufo", "cosmos", "spacecraft", "robot", "cyborg", "futuristic", 
    "android", "xenomorph", "mutation", "paradox", "void", "parallel", "clone", "entity", 
    "nanobot", "anomaly", "hyperspace", "extradimensional", "cyberspace", "teleport", "galactic", 
    "singularity", "virus", "bacteria", "fungus", "spore", "mushroom", "psychedelic", "toxic", 
    "venomous", "radioactive", "hazardous", "contamination", "infection", "biohazard", "quarantine", 
    "pandemic", "epidemic", "danger", "menace", "peril", "catastrophe", "disaster", "apocalypse", 
    "warning", "caution", "alert", "alarm", "nightmare", "terror", "horror", "fear", "dread", 
    "panic", "phobia", "haunt", "specter", "shadow", "ominous", "eerie", "macabre", "creepy", 
    "ghastly", "gruesome", "demonic", "haunted", "supernatural",
    
    // 동사
    "run", "jump", "fly", "swim", "dance", "sing", "draw", "write", "read", "think",
    "create", "build", "destroy", "explore", "discover", "imagine", "dream", "smile",
    "laugh", "cry", "whisper", "shout", "listen", "speak", "grow", "shrink", "play",
    "win", "lose", "fight", "love", "hate", "learn", "teach", "remember", "forget",
    "heal", "break", "move", "stop", "begin", "end", "accelerate", "breathe", "calculate", "dig", "encode", "forecast", "gather", 
    "hike", "ignite", "juggle", "knit", "launch", "mend", "navigate", "open", "perform", 
    "quicken", "reach", "solve", "travel", "unveil", "visit", "wander", "xerox", "yield", 
    
    // 형용사
    "happy", "sad", "angry", "excited", "scared", "brave", "calm", "bright", "dark",
    "beautiful", "ugly", "strong", "weak", "fast", "slow", "big", "small", "tall",
    "short", "young", "old", "rich", "poor", "smart", "stupid", "kind", "mean",
    "funny", "serious", "friendly", "unfriendly", "clean", "dirty", "new", "old",
    "hot", "cold", "wet", "dry", "soft", "hard", "amazing", "brilliant", "curious", "daring", "exquisite", "fearless", "genuine", 
    "happy", "intrepid", "joyful", "kind", "luminous", "mysterious", "noble", "optimistic", 
    "playful", "quiet", "radiant", "serene", "tender", "unstoppable", "vivid", "witty", 
    
    // 부사
     "quickly", "slowly", "happily", "sadly", "angrily", "excitedly", "calmly", "bravely",
    "scaredly", "beautifully", "ugly", "strongly", "weakly", "fast", "slowly", "big",
    "small", "tall", "short", "young", "old", "richly", "poorly", "smartly", "stupidly",
    "kindly", "meanly", "funnily", "seriously", "friendly", "unfriendly", "cleanly",
    "dirtily", "newly", "oldly", "hotly", "coldly", "wetly", "dryly", "softly", "hardly", "boldly", "carefully", "diligently", "eagerly", "fiercely", "gracefully", "happily", 
    "intently", "joyfully", "kindly", "lovingly", "merrily", "nobly", "optimistically", 
    "patiently", "quietly", "rapidly", "softly", "tenderly", "urgently", "vigorously", "wisely",
    
    // 특이한 단어들 추가
    "cosmic", "alien", "mushroom", "danger", "fear", "warning", 
    "phantom", "celestial", "paradox", "abyss", "lunar", "nebula", "whisper", 
    "surreal", "enigma", "ominous", "cryptic", "supernova", "chaos", 
    "serendipity", "ethereal", "arcane", "galactic", "stardust", "phantasm", 
    "interstellar", "eclipse", "galaxy", "wormhole", "quasar", "comet", 
    "asteroid", "dimension", "blackhole", "extraterrestrial", "spaceship", "orb", 
    "abduction", "mutant", "anomaly", "constellation", "singularity", "astronaut",
    "nebula", "vortex", "hyperspace", "timewarp", "stellar", "gravity",
    "apocalypse", "nebula", "dystopia", "paranormal", "void", "supernatural",
    "extradimensional", "hallucination", "warp", "fractal", "eerie", "bizarre",
    "transcendence", "entity", "spacetime", "dimension", "specter", "void",
    "shadow", "oblivion", "mirage", "hologram", "parallel", "xenon",
    "intergalactic", "cryptid", "nether", "illusion", "metaphysical", "antimatter",
    "nightmare", "apparition", "macabre", "eldritch", "universe", "planetoid",
    "teleport", "illusion", "infinity", "matrix", "horizon", "lightyear",
    "singularity", "neutron", "quark", "plasma", "antigravity", "darkmatter"
  ];

 let randomIndex = int(random(words.length));
  return words[randomIndex];
}