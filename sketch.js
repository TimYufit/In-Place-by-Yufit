let mapImg;
let stamps = [];
let spaceMono;
let topOffset = 0;
let isMobile = false;

// --- Intro sequence ---
let introStartTime = 0;
let phraseDuration = 8000; // per phrase
let introDuration = 16000;

let fadeDuration = 1000; // 1 second fade in/out

let introPhrases = [
  "In the 1850s, overcrowded London graveyards were closed and many graves were reburied in newly established cemeteries. Headstones that had marked those original graves were left behind across these sites.",
  "By the late 19th century, these burial grounds were transformed into public parks and playgrounds. This map marks displaced headstones that remain scattered across London’s contemporary landscape."
];

function introIsActive() {
  return millis() - introStartTime < introDuration;
}

function preload() {
  spaceMono = loadFont("SpaceMono-Regular.ttf");
  mapImg = loadImage("mapFinal.png");

  stamps = [
    { colorImg: loadImage("3.png"),   bwImg: loadImage("PFP_Black.png"), xPercent: 0.58, yPercent: 0.38, sizePercent: 0.08, link: "https://timothyufit.cargo.site/pfpf" },
    { colorImg: loadImage("1.png"),   bwImg: loadImage("SJBlack.png"),   xPercent: 0.68, yPercent: 0.52, sizePercent: 0.08, link: "https://timothyufit.cargo.site/sjf" },
    { colorImg: loadImage("2.png"),   bwImg: loadImage("SJB_Black.png"), xPercent: 0.43, yPercent: 0.42, sizePercent: 0.08, link: "https://timothyufit.cargo.site/sjbf" },
    { colorImg: loadImage("5.png"),   bwImg: loadImage("SMG_Y.png"),     xPercent: 0.92, yPercent: 0.50, sizePercent: 0.08, link: "https://timothyufit.cargo.site/smgf" },
    { colorImg: loadImage("6.png"),   bwImg: loadImage("EC_Black.png"),  xPercent: 0.31, yPercent: 0.77, sizePercent: 0.08, link: "https://timothyufit.cargo.site/ecf" },
    { colorImg: loadImage("7.png"),   bwImg: loadImage("SPW_black.png"), xPercent: 0.43, yPercent: 0.90, sizePercent: 0.08, link: "https://timothyufit.cargo.site/spwf" },
    { colorImg: loadImage("8.8.png"), bwImg: loadImage("SMM_Black.png"), xPercent: 0.56, yPercent: 0.57, sizePercent: 0.08, link: "https://timothyufit.cargo.site/smmf" },
    { colorImg: loadImage("8.png"),   bwImg: loadImage("SGG_Black.png"), xPercent: 0.82, yPercent: 0.16, sizePercent: 0.08, link: "https://timothyufit.cargo.site/sggf" }
  ];
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  introStartTime = millis();

  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    isMobile = true;
  }
}

let showMessage = true;
let messagePadding = 10;

function draw() {

  // ---------- INTRO ----------
  if (introIsActive()) {
    background(23, 22, 22);

    let elapsed = millis() - introStartTime;

    // Which phrase
    let phraseIndex = elapsed < phraseDuration ? 0 : 1;
    let msg = introPhrases[phraseIndex];

    // Time inside current phrase
    let phraseTime = elapsed % phraseDuration;

    // --- Fade logic ---
    let alpha = 255;
    if (phraseTime < fadeDuration) {
      alpha = map(phraseTime, 0, fadeDuration, 0, 255);
    } else if (phraseTime > phraseDuration - fadeDuration) {
      alpha = map(phraseTime, phraseDuration - fadeDuration, phraseDuration, 255, 0);
    }

    let margin = width * 0.15;
    let boxWidth = width - margin * 2;
    let boxHeight = height * 0.45;

    let boxX = (width - boxWidth) / 2;
    let boxY = (height - boxHeight) / 2;

    let fontSize = constrain(width * 0.02, 14, 22);

    textFont(spaceMono);
    textSize(fontSize);
    textLeading(fontSize * 1.5);
    textAlign(CENTER, CENTER);

    fill(241, 237, 231, alpha);

    text(msg, boxX, boxY, boxWidth, boxHeight);

    cursor(ARROW);
    return;
  }

  // ---------- MAP ----------
  background(23, 22, 22);

  let mapAspect = mapImg.width / mapImg.height;
  let canvasAspect = width / height;
  let drawWidth, drawHeight;

  if (canvasAspect > mapAspect) {
    drawHeight = height;
    drawWidth = mapAspect * height;
  } else {
    drawWidth = width;
    drawHeight = width / mapAspect;
  }

  let mapX = width / 2;
  let mapY = height / 2 + topOffset;

  image(mapImg, mapX, mapY, drawWidth, drawHeight);

  let hovered = false;

  for (let s of stamps) {
    let stampX = mapX - drawWidth / 2 + drawWidth * s.xPercent;
    let stampY = mapY - drawHeight / 2 + drawHeight * s.yPercent;
    let stampW = drawWidth * s.sizePercent;
    let stampH = (s.colorImg.height / s.colorImg.width) * stampW;

    s.isHovered = dist(mouseX, mouseY, stampX, stampY) < stampW / 2;
    let imgToShow = (!isMobile && s.isHovered) ? s.bwImg : s.colorImg;
    image(imgToShow, stampX, stampY, stampW, stampH);

    if (s.isHovered) hovered = true;
  }

  cursor(hovered && !isMobile ? HAND : ARROW);

  if (hovered && !isMobile) showMessage = false;

  // ---------- TOOLTIP ----------
  if (showMessage && !isMobile) {
    let msg = "Click on the stamp to learn more";
    textFont(spaceMono);
    textSize(10);
    textAlign(LEFT, CENTER);

    let tWidth = textWidth(msg);
    let boxWidth = tWidth + messagePadding * 2;
    let boxHeight = 26;
    let x = mouseX + 15;
    let y = mouseY;

    noStroke();
    fill(241, 237, 231);
    rect(x - messagePadding / 2, y - boxHeight / 2, boxWidth, boxHeight, 4);

    fill(167, 31, 41);
    text(msg, x + messagePadding / 2, y);
  }
}

function mousePressed() {
  if (introIsActive()) return;
  if (!isMobile) checkStampClick(mouseX, mouseY);
}

function touchStarted() {
  if (introIsActive()) return false;
  checkStampClick(mouseX, mouseY);
  return false;
}

function checkStampClick(x, y) {
  let mapAspect = mapImg.width / mapImg.height;
  let canvasAspect = width / height;
  let drawWidth, drawHeight;

  if (canvasAspect > mapAspect) {
    drawHeight = height;
    drawWidth = mapAspect * height;
  } else {
    drawWidth = width;
    drawHeight = width / mapAspect;
  }

  let mapX = width / 2;
  let mapY = height / 2 + topOffset;

  for (let s of stamps) {
    let stampX = mapX - drawWidth / 2 + drawWidth * s.xPercent;
    let stampY = mapY - drawHeight / 2 + drawHeight * s.yPercent;
    let stampW = drawWidth * s.sizePercent;

    if (dist(x, y, stampX, stampY) < stampW / 2) {
      window.location.href = s.link;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
