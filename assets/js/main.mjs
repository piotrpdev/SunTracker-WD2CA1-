// https://www.html5canvastutorials.com/tutorials/html5-canvas-image-size/
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations
// TODO: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#pre-render_similar_primitives_or_repeating_objects_on_an_offscreen_canvas
// ? Hugely inspired by https://www.suncalc.org/

// Used to get estimated timezone base on coords.
// Have to use skypack and import here since there is no browser version
import ts from 'https://cdn.skypack.dev/@mapbox/timespace';

import { generateStars, promisifyLoad, formatDate as _formatDate, updateInfoElements } from './helpers.mjs';

// info vars declaration
let curTime;
// Waterford coords
let coordArr = ["52.2593", "-7.1101"];
let adjTime;
let times;
let irishTime = true;
let curPos;
let alt;
let azm;

const formatDate = (date) => _formatDate(date, adjTime._z.name);

const canvas = document.getElementById("canvas");
const width = canvas.width;
const height = canvas.height;

// Settings
const updateInterval = 5000;

const starsNum = 300;
let stars = [];

const earthSize = 100;
// Offset the earth so the angle of the sun makes more sense.
const earthHeightMod = 35;

const sunSize = 100;

const earth = new Image();
const sun = new Image();

/**
 * Draws to the canvas.
 */
function draw() {
  const ctx = canvas.getContext("2d");

  // ctx.globalCompositeOperation = "destination-over";

  // Space Backdrop
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "gray";

  // Stars
  for (const { x, y, size } of stars) {
    ctx.fillRect(x, y, size, size);
  }

  // Earth
  const earthX = width / 2 - earthSize / 2;
  const earthY = height - earthSize / 2 + earthHeightMod;

  ctx.drawImage(earth, earthX, earthY, earthSize, earthSize);

  // Sun path
  ctx.beginPath();
  ctx.arc(
    width / 2,
    height + earthHeightMod,
    height + earthHeightMod - sunSize / 2,
    0,
    1 * Math.PI,
    true
  );
  ctx.lineWidth = 2;
  ctx.strokeStyle = "grey";
  ctx.stroke();

  // Sun
  let angle;
  // If azimuth is less than 180 the sun is rising (simplification)
  // so draw it on the left side of the arc.
  if (azm < 180) {
    angle = Math.PI + curPos.altitude;
  } else {
    angle = 2 * Math.PI - curPos.altitude;
  }

  const cx = width / 2 - sunSize / 2;
  const cy = height - sunSize / 2 + earthHeightMod;
  const r = height + earthHeightMod - sunSize / 2;

  // ? How to create a circle https://stackoverflow.com/a/61673153/10253214
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy + r * Math.sin(angle);

  // Rotate (Annoying to do)
  // const time = new Date();
  // ctx.translate(sunX + sunSize / 2, sunY + sunSize / 2);
  // ctx.rotate(
  //  ((2 * Math.PI) / 60) * time.getSeconds +
  //    ((2 * Math.PI) / 60000) * time.getMilliseconds
  // );
  // ctx.translate(-(sunX + sunSize / 2), -(sunY + sunSize / 2));

  ctx.drawImage(sun, sunX, sunY, sunSize, sunSize);

  // Directions
  ctx.fillStyle = "red";
  ctx.strokeStyle = "white";
  ctx.fillRect(5, 10, 40, 50);
  ctx.fillRect(width - 60, 10, 55, 50);

  ctx.font = "48px serif";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.textAlign = "start";
  ctx.fillText("E", 10, 50);
  ctx.textAlign = "end";
  ctx.fillText("W", width - 10, 50);

  ctx.save();
}

/**
 * Generates and sets info based on the
 * passed coords, e.g. position of the sun.
 * Uses the already set coords if none are passed.
 * @param {string[]} coords Coordinates to use
 */
function generateInfo(coords) {
  curTime = new Date();

  // Artificially manipulate time
  //const curTime = new Date();
  //curTime.setHours(3);

  coordArr = coords ?? coordArr;

  // This function take long lat instead of lat long for some reason.
  adjTime = ts.getFuzzyLocalTimeFromPoint(curTime, coordArr.slice().reverse());

  times = SunCalc.getTimes(adjTime, ...coordArr);

  curPos = SunCalc.getPosition(adjTime, ...coordArr);

  alt = ((curPos.altitude * 90) / Math.PI) * 2;
  // Add PI since this package measures azimuth south to west
  azm = ((curPos.azimuth + Math.PI) * 180) / Math.PI;
}

/**
 * Changes the information in the actual HTML doc.
 */
function updateInfo() {
  const info =
  {
    "time": irishTime ? `${curTime.toLocaleString()} (Europe/Dublin)` : `${formatDate(
      adjTime.toDate()
    )}`,
    "latitude": `${coordArr[0]}&deg;`,
    "longitude": `${coordArr[1]}&deg;`,
    "altitude": `${alt}&deg;`,
    "azimuth": `${azm}&deg;`,
    "sunrise": irishTime ? `${times.sunrise.toLocaleString()} (Europe/Dublin)` : `${formatDate(
      times.sunrise
    )}`,
    "sunset": irishTime ? `${times.sunset.toLocaleString()} (Europe/Dublin)` : `${formatDate(
      times.sunset
    )}`
  };

  updateInfoElements(info);
}

/**
 * Shorthand for readability.
 */
const updateCanvas = () => window.requestAnimationFrame(draw);

/**
 * Fully updates the info and canvas.
 * @param {string[]} coords Coordinates to use
 */
function update(coords) {
  generateInfo(coords);
  updateInfo();
  updateCanvas();
}

/**
 * Loads the images, generates the stars, and sets up the auto-updater.
 */
function initCanvas() {
  earth.src = "assets/img/earth.png";
  sun.src = "assets/img/sun.png";
  stars = generateStars(starsNum, width, height);
  // Could be optimized so that the info gets generated as the images are loading.
  Promise.all(promisifyLoad([earth, sun])).then(() => {
    update();
    // .hidden doesn't work very well here for some reason
    document.getElementById("loader").style.display = "none";
    setInterval(update, updateInterval);
  });
}

initCanvas();

// Semantic UI stuff
// https://semantic-ui.com/modules/dropdown.html#specifying-select-action
$(".ui.dropdown").dropdown({
  onChange: (value) => {
    const coords = value.split(", ");

    // JSONJ.stringify is overkill here, this is easier
    if (coords[0] === coordArr[0] && coords[1] === coordArr[1]) return;

    update(coords);
  }
});

// Display loading bar on refresh
// ? https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#example
window.addEventListener("beforeunload", function (e) {
  document.getElementById("loader").style.display = "flex";
  
  delete e["returnValue"];
});

// Regenerate stars on button click
document.getElementById('regStars').addEventListener('click', () => {
  stars = generateStars(starsNum, width, height);
  updateCanvas();
  // Have to use jQuery here for transition.
  $('#regStars').transition('pulse');
})

// Change between Irish and Local time on switch toggle
document.getElementById('timeType').addEventListener('click', (e) => {
  let text = e.target.nextElementSibling.innerText;

  if (text === 'Irish Time') {
    text = 'Local Time';
    irishTime = false;
  } else {
    text = 'Irish Time';
    irishTime = true;
  }

  e.target.nextElementSibling.innerText = text;
  updateInfo();
})