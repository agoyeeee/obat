// Generate a siren-style alarm WAV sound (5 seconds)
// Sweeps between low and high frequency like an emergency siren
const fs = require('fs');

const sampleRate = 44100;
const duration = 5; // seconds
const totalSamples = sampleRate * duration;
const numChannels = 1;
const bitsPerSample = 16;
const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const dataSize = totalSamples * blockAlign;

// Create buffer
const buffer = Buffer.alloc(44 + dataSize);

// WAV header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Siren parameters
const freqLow = 600;    // Hz - low point of siren
const freqHigh = 1200;  // Hz - high point of siren  
const sirenCycle = 1.2;  // seconds per full sweep (up + down)

let phase = 0;

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  
  // Siren sweep: smoothly oscillate between freqLow and freqHigh
  const sirenPos = (t % sirenCycle) / sirenCycle; // 0 to 1
  // Use sine for smooth up-down sweep
  const sweepFactor = (Math.sin(2 * Math.PI * sirenPos - Math.PI / 2) + 1) / 2; // 0 to 1
  const currentFreq = freqLow + (freqHigh - freqLow) * sweepFactor;
  
  // Accumulate phase for continuous waveform (prevents clicks)
  phase += (2 * Math.PI * currentFreq) / sampleRate;
  
  // Main siren tone
  const mainTone = Math.sin(phase);
  
  // Add slight harmonic for richer sound
  const harmonic = Math.sin(phase * 2) * 0.15;
  
  // Combine
  let sample = (mainTone + harmonic) * 0.75;
  
  // Fade in first 0.05s, fade out last 0.05s
  const fadeIn = Math.min(1, t / 0.05);
  const fadeOut = Math.min(1, (duration - t) / 0.05);
  sample *= fadeIn * fadeOut;

  const intSample = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
  buffer.writeInt16LE(intSample, 44 + i * 2);
}

// Write to both locations
const rawPath = 'android/app/src/main/res/raw/alarm_sound.wav';
const assetsPath = 'assets/alarm-sound.wav';

fs.writeFileSync(rawPath, buffer);
fs.writeFileSync(assetsPath, buffer);

console.log(`✅ Siren alarm generated: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(1)} KB)`);
console.log(`   Duration: ${duration}s | Freq: ${freqLow}-${freqHigh} Hz`);
console.log(`   Written to: ${rawPath}`);
console.log(`   Written to: ${assetsPath}`);
