import { Har, Timings } from "./types";
import { HAR_SAMPLE } from "./har";

interface SimpleResource {
  start: number;
  end: number;
  duration: number;
  timings: Timings;
}

// TODO(i hate typescript typings)
const Tone = (window as any).Tone;
const audioLengthScalar = 400;
const notes = ["A", "B", "C", "D", "E", "F", "G"];
const instrumentConstructors = [
  Tone.Synth,
  //Tone.MetalSynth,
  //one.MonoSynth
  //Tone.FatOscillator,
  Tone.PolySynth
];
const progressBar = document.querySelector("#progress") as HTMLElement;
const sample = (HAR_SAMPLE as any) as Har;
const WIDTH = 10;
const PADDING = 5;
Tone.Transport.stop();

let topOffset = Infinity;
let endValue = -Infinity;

window.addEventListener("click", () => {
  raf();
  Tone.Transport.start();
});

function raf() {
  const audioProgress = Tone.Transport.seconds / audioEndSeconds;
  progressBar.style.top = audioProgress * (endValue - topOffset) + "px";
  requestAnimationFrame(raf);
}

function createBar(resource: SimpleResource, yOffset: number, column: number) {
  const elm = document.createElement("div");
  const left = `${(column - 1) * WIDTH + (column - 1) * PADDING}px`;
  elm.classList.add("bar");
  elm.classList.add("total");
  elm.style.height = `${resource.duration}px`;
  elm.style.top = `${resource.start - yOffset}px`;
  elm.style.width = `${WIDTH}px`;
  elm.style.left = left;

  const transferBar = document.createElement("div");
  transferBar.classList.add("bar");
  transferBar.classList.add("transfer");
  transferBar.style.left = left;
  const transferStartTime =
    resource.start +
    resource.timings.blocked +
    resource.timings.dns +
    resource.timings.connect +
    resource.timings.send +
    resource.timings.wait -
    yOffset;

  const transferDuration = resource.timings.receive;

  transferBar.style.top = `${transferStartTime}px`;

  transferBar.style.height = `${resource.duration -
    (resource.timings.blocked +
      resource.timings.dns +
      resource.timings.connect +
      resource.timings.send +
      resource.timings.wait)}px`;
  transferBar.style.width = `${WIDTH}px`;

  Tone.Transport.schedule((time: number) => {
    const note = notes[column % notes.length];
    const octave = column % 5 + 1;

    if (transferDuration > 0) {
      instruments[column].triggerAttackRelease(
        note + octave,
        transferDuration / audioLengthScalar,
        time
      );
    }
  }, transferStartTime / audioLengthScalar);

  Tone.Transport.schedule((time: number) => {
    const note = "D";
    const octave = column % 5 + 1;

    if (transferDuration > 0) {
      //congas[column].triggerAttackRelease(note + octave, 1, time);
    }
  }, (resource.start + resource.timings.blocked + resource.timings.dns - yOffset) / audioLengthScalar);

  return [elm, transferBar];
}

const sorted = sample.log.entries
  .map(v => {
    const ret = {
      start: new Date(v.startedDateTime).getMilliseconds(),
      end: 0,
      duration: 0,
      timings: v.timings
    };

    ret.end = ret.start + v.time;
    ret.duration = ret.end - ret.start;

    if (ret.start < topOffset) {
      topOffset = ret.start;
    }

    if (ret.end > endValue) {
      endValue = ret.end;
    }

    return ret;
  })
  .sort((a, b) => {
    return a.start - b.start;
  });

let columns: number[] = [];

const fragment = document.createDocumentFragment();

for (let resource of sorted) {
  let inserted = false;
  let column = -1;

  columns.forEach((r, i) => {
    if (!inserted && r <= resource.start) {
      columns[i] = resource.end;
      column = i;
      inserted = true;
    }
  });

  if (!inserted) {
    column = columns.push(resource.end) - 1;
  }

  for (const bar of createBar(resource, topOffset, column)) {
    fragment.appendChild(bar);
  }
}

const instruments = columns.map((_, i) => {
  return new instrumentConstructors[
    i % instrumentConstructors.length
  ]().toMaster();
});

// const congas = columns.map(() => {
//   return new Tone.MembraneSynth({
//     pitchDecay: 0.008,
//     octaves: 2,
//     envelope: {
//       attack: 0.0006,
//       decay: 0.5,
//       sustain: 0
//     }
//   }).toMaster();
// });

const audioEndSeconds = (endValue - topOffset) / audioLengthScalar;
document.body.appendChild(fragment);
