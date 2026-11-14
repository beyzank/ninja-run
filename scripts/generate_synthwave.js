const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const BPM = 124;
const BEATS_PER_BAR = 4;
const BARS = 4;
const BEAT_DURATION = 60 / BPM;
const TOTAL_DURATION = BARS * BEATS_PER_BAR * BEAT_DURATION;
const TOTAL_SAMPLES = Math.floor(TOTAL_DURATION * SAMPLE_RATE);

const buffer = new Float32Array(TOTAL_SAMPLES);

// Note frequencies (Hz)
const NOTES = {
  D1: 36.71,
  F1: 43.65,
  G1: 49.00,
  A1: 55.00,
  Bb1: 58.27,
  C2: 65.41,
  D2: 73.42,
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  C3: 130.81,
  D3: 146.83,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  D5: 587.33,
};

// 1. Synthwave Kick Drum (Punchy 4-on-the-floor)
for (let b = 0; b < BARS * BEATS_PER_BAR; b++) {
  const startSample = Math.floor(b * BEAT_DURATION * SAMPLE_RATE);
  const kickLength = Math.floor(0.28 * SAMPLE_RATE);

  for (let i = 0; i < kickLength && startSample + i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 140 * Math.exp(-t * 24) + 42;
    const phase = 2 * Math.PI * freq * t;
    const env = Math.exp(-t * 14);
    // Click transient + sub-bass body
    const click = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 90) * 0.3;
    const sample = (Math.sin(phase) + click) * env * 0.45;
    buffer[startSample + i] += sample;
  }
}

// 2. Snare / Clap (Beats 2 and 4)
for (let b = 0; b < BARS * BEATS_PER_BAR; b++) {
  if (b % 2 === 1) { // 2nd and 4th beats of each bar
    const startSample = Math.floor(b * BEAT_DURATION * SAMPLE_RATE);
    const snareLength = Math.floor(0.22 * SAMPLE_RATE);

    for (let i = 0; i < snareLength && startSample + i < TOTAL_SAMPLES; i++) {
      const t = i / SAMPLE_RATE;
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 18);
      const tone = Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 22) * 0.4;
      const sample = (noise * 0.65 + tone) * 0.28;
      buffer[startSample + i] += sample;
    }
  }
}

// 3. 16th-note Hi-hats
const sixteenthDuration = BEAT_DURATION / 4;
const totalSixteenths = BARS * BEATS_PER_BAR * 4;

for (let s = 0; s < totalSixteenths; s++) {
  const startSample = Math.floor(s * sixteenthDuration * SAMPLE_RATE);
  const hatLength = Math.floor(0.045 * SAMPLE_RATE);
  const isOffbeat = s % 2 === 1;
  const vol = isOffbeat ? 0.16 : 0.08;

  for (let i = 0; i < hatLength && startSample + i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const noise = (Math.random() * 2 - 1);
    const env = Math.exp(-t * 95);
    buffer[startSample + i] += noise * env * vol;
  }
}

// 4. Cyberpunk Rolling Bassline (16th notes with cutoff envelope)
// Bar 1: D2, Bar 2: F2, Bar 3: C2, Bar 4: Bb1
const bassRoots = [NOTES.D2, NOTES.F2, NOTES.C2, NOTES.Bb1];

for (let bar = 0; bar < BARS; bar++) {
  const root = bassRoots[bar];
  const barStart = bar * BEATS_PER_BAR * 4;

  for (let step = 0; step < 16; step++) {
    // Skip step 0 slightly for kick clarity, octave pump on step 2, 4, 6...
    const isOctave = step % 2 === 1;
    const freq = isOctave ? root * 2 : root;
    const startSample = Math.floor((barStart + step) * sixteenthDuration * SAMPLE_RATE);
    const noteLength = Math.floor(sixteenthDuration * 0.92 * SAMPLE_RATE);

    for (let i = 0; i < noteLength && startSample + i < TOTAL_SAMPLES; i++) {
      const t = i / SAMPLE_RATE;
      // Filter sweep & saw wave harmonic
      const saw1 = (2 * ((t * freq) % 1) - 1);
      const saw2 = (2 * ((t * freq * 1.006) % 1) - 1); // slight chorus detune
      const sub = Math.sin(2 * Math.PI * (freq / 2) * t) * 0.4;
      const env = Math.exp(-t * 16);
      const sample = (saw1 * 0.4 + saw2 * 0.3 + sub) * env * 0.32;
      buffer[startSample + i] += sample;
    }
  }
}

// 5. Arpeggiator Lead Synth (Retro Neon Melodic Sequence)
const arpPatterns = [
  // Bar 1 (Dm): D4, F4, A4, D5, C5, A4, F4, A4...
  [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.D5, NOTES.C5, NOTES.A4, NOTES.F4,
   NOTES.D4, NOTES.E4, NOTES.F4, NOTES.A4, NOTES.D5, NOTES.F4, NOTES.A4, NOTES.C5],
  // Bar 2 (F maj): F4, A4, C5, E4, F4, A4, C5, F5...
  [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E4,
   NOTES.F4, NOTES.G4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.C5, NOTES.D5, NOTES.A4],
  // Bar 3 (C maj): C4, E4, G4, C5, G4, E4, G4, C5...
  [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.G4, NOTES.E4, NOTES.G4, NOTES.C5,
   NOTES.C4, NOTES.D4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E4, NOTES.G4, NOTES.B4 || NOTES.A4],
  // Bar 4 (Bb / A): Bb3, D4, F4, Bb4, A3, C#4 || A4...
  [NOTES.Bb1 * 4, NOTES.D4, NOTES.F4, NOTES.A4, NOTES.F4, NOTES.D4, NOTES.A4, NOTES.F4,
   NOTES.A3, NOTES.C4, NOTES.E4, NOTES.A4, NOTES.C5, NOTES.A4, NOTES.E4, NOTES.C4],
];

for (let bar = 0; bar < BARS; bar++) {
  const pattern = arpPatterns[bar];
  const barStart = bar * BEATS_PER_BAR * 4;

  for (let step = 0; step < 16; step++) {
    const freq = pattern[step];
    const startSample = Math.floor((barStart + step) * sixteenthDuration * SAMPLE_RATE);
    const noteLength = Math.floor(sixteenthDuration * 1.8 * SAMPLE_RATE); // overlap for delay effect

    for (let i = 0; i < noteLength && startSample + i < TOTAL_SAMPLES; i++) {
      const t = i / SAMPLE_RATE;
      // Pulse/square pluck with bright resonance
      const pulse = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.35 : -0.35;
      const overtone = Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
      const env = Math.exp(-t * 11);
      const sample = (pulse + overtone) * env * 0.16;
      buffer[startSample + i] += sample;
    }
  }
}

// 6. Warm Cyber Pad / Chords (Blade Runner atmosphere)
for (let bar = 0; bar < BARS; bar++) {
  const root = bassRoots[bar] * 2; // D3, F3, C3, Bb2
  const third = root * 1.2; // Minor / Major third approx
  const fifth = root * 1.5;
  const startSample = Math.floor(bar * BEATS_PER_BAR * BEAT_DURATION * SAMPLE_RATE);
  const padLength = Math.floor(BEATS_PER_BAR * BEAT_DURATION * SAMPLE_RATE);

  for (let i = 0; i < padLength && startSample + i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Gentle sine/saw chord with slow envelope
    const s1 = Math.sin(2 * Math.PI * root * t + Math.sin(t * 3) * 0.05);
    const s2 = Math.sin(2 * Math.PI * third * t);
    const s3 = Math.sin(2 * Math.PI * fifth * t);
    const padEnv = Math.sin((Math.PI * i) / padLength) * 0.14;
    buffer[startSample + i] += (s1 + s2 + s3) * padEnv;
  }
}

// Normalize and convert to 16-bit PCM
let peak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  if (Math.abs(buffer[i]) > peak) peak = Math.abs(buffer[i]);
}

const gain = peak > 0 ? 0.88 / peak : 1;
const pcmData = new Int16Array(TOTAL_SAMPLES);
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const s = Math.max(-1, Math.min(1, buffer[i] * gain));
  pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
}

// Build WAV header
const dataSize = TOTAL_SAMPLES * 2;
const header = Buffer.alloc(44);

header.write('RIFF', 0);
header.writeUInt32LE(36 + dataSize, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16); // Subchunk1Size
header.writeUInt16LE(1, 20); // PCM format
header.writeUInt16LE(1, 22); // Mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate
header.writeUInt16LE(2, 32); // BlockAlign
header.writeUInt16LE(16, 34); // BitsPerSample
header.write('data', 36);
header.writeUInt32LE(dataSize, 40);

const outputPath = path.resolve(__dirname, '../assets/audio/synthwave_loop.wav');
const fileBuffer = Buffer.concat([header, Buffer.from(pcmData.buffer)]);
fs.writeFileSync(outputPath, fileBuffer);

console.log(`Generated synthwave_loop.wav successfully (${(fileBuffer.length / 1024).toFixed(1)} KB) at: ${outputPath}`);
