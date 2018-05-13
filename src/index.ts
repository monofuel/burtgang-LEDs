import * as five from 'johnny-five';
const robot = require("robotjs");
const pixel = require('node-pixel');

const ledCount = 44;
const pin = 6;

const frequency = 8; // per second

console.log('configuring board');
const board = new five.Board({
  port: 'COM3',
  repl: false,
});

board.on("ready", function () {
  console.log('board ready');
  const strip = new pixel.Strip({
    board,
    controller: "FIRMATA",
    strips: [{ pin, length: ledCount },], // this is preferred form for definition
    gamma: 2.8, // set to a gamma that works nicely for WS2812
  });

  strip.on("ready", function () {
    console.log('LED ready');

    updateStrip(strip);
  });
});

const { width, height } = robot.getScreenSize();
const previousColors: string[] = [];
async function updateStrip(strip: any) {
  const startTime = Date.now();
  const region1 = robot.screen.capture(0, 0, width, 1);
  const region3 = robot.screen.capture(0, height / 4, width, 1);
  const region2 = robot.screen.capture(0, height / 8, width, 1);
  for (let i = 1; i <= ledCount; i++) {
    const segmentSize = width / ledCount;
    const x = ((width / ledCount) * i) - 1;
    let hex = region2.colorAt(x, 0);
    if (x - segmentSize > 0) {
      hex = averageColors(hex, region2.colorAt(x - segmentSize, 0));
    }
    if (x + segmentSize < region2.width) {
      hex = averageColors(hex, region2.colorAt(x + segmentSize, 0));
    }
    hex = averageColors(hex, region1.colorAt(x, 0));
    hex = averageColors(hex, region3.colorAt(x, 0));

    // smooth over time
    if (previousColors[i]) {
      hex = averageColors(hex, previousColors[i]);
      hex = averageColors(hex, previousColors[i]);
      // hex = averageColors(hex, previousColors[i]);
    }

    strip.pixel(i - 1).color('#' + hex);
    previousColors[i] = hex;
  }
  strip.show();
  const endTime = Date.now();
  const delta = endTime - startTime;
  const nextTimeout = Math.max(0, (1000 / frequency) - delta);
  // console.log('delta', delta, nextTimeout);
  setTimeout(() => updateStrip(strip), nextTimeout);
}

process.on('unhandledRejection', (err, p) => {
  console.error(err);
  process.exit(-1);
});

function averageColors(hex1: string, hex2: string): string {
  const a = (parseInt(hex1.substr(0, 2), 16) + parseInt(hex2.substr(0, 2), 16)) / 2;
  const b = (parseInt(hex1.substr(2, 2), 16) + parseInt(hex2.substr(2, 2), 16)) / 2;
  const c = (parseInt(hex1.substr(4, 2), 16) + parseInt(hex2.substr(4, 2), 16)) / 2;
  return Math.round(a).toString(16).padStart(2, '0') + Math.round(b).toString(16).padStart(2, '0') + Math.round(c).toString(16).padStart(2, '0');
}