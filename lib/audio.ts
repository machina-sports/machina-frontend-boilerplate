/**
 * Converts an audio Blob to raw 16-bit PCM data (LINEAR16)
 * @param blob - The input audio blob (e.g., audio/webm, audio/m4a)
 * @returns Object containing the raw PCM buffer and sample rate
 */
export async function convertBlobToPCM(
  blob: Blob
): Promise<{ buffer: ArrayBuffer; sampleRate: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  // Decode the audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get the PCM data from the first channel
  const inputData = audioBuffer.getChannelData(0);

  // Convert Float32 to Int16 (LINEAR16)
  const pcmBuffer = new Int16Array(inputData.length);
  for (let i = 0; i < inputData.length; i++) {
    // Clamp the value between -1 and 1
    const s = Math.max(-1, Math.min(1, inputData[i]));
    // Convert to 16-bit PCM
    // 0x8000 = 32768, 0x7FFF = 32767
    pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Clean up
  await audioContext.close();

  return { buffer: pcmBuffer.buffer, sampleRate: audioBuffer.sampleRate };
}

/**
 * Converts an audio Blob to optimized 16-bit PCM data with reduced sample rate
 * This significantly reduces the payload size while maintaining speech quality
 * @param blob - The input audio blob (e.g., audio/webm, audio/m4a)
 * @param targetSampleRate - Target sample rate (default: 16000 Hz, optimal for speech)
 * @returns Object containing the raw PCM buffer and sample rate
 */
export async function convertBlobToOptimizedPCM(
  blob: Blob,
  targetSampleRate: number = 16000
): Promise<{ buffer: ArrayBuffer; sampleRate: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();

  // Decode the audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get the original sample rate
  const originalSampleRate = audioBuffer.sampleRate;
  
  // Get the PCM data from the first channel (mono)
  const inputData = audioBuffer.getChannelData(0);

  // Calculate the resampling ratio
  const ratio = originalSampleRate / targetSampleRate;
  const outputLength = Math.floor(inputData.length / ratio);

  // Resample the audio data (simple linear interpolation)
  const resampledData = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = i * ratio;
    const index = Math.floor(sourceIndex);
    const fraction = sourceIndex - index;
    
    // Linear interpolation between samples
    if (index + 1 < inputData.length) {
      resampledData[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
    } else {
      resampledData[i] = inputData[index];
    }
  }

  // Convert Float32 to Int16 (LINEAR16)
  const pcmBuffer = new Int16Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    // Clamp the value between -1 and 1
    const s = Math.max(-1, Math.min(1, resampledData[i]));
    // Convert to 16-bit PCM
    pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Clean up
  await audioContext.close();

  console.log(`Audio resampled: ${originalSampleRate}Hz → ${targetSampleRate}Hz (${Math.round((1 - outputLength / inputData.length) * 100)}% size reduction)`);

  return { buffer: pcmBuffer.buffer, sampleRate: targetSampleRate };
}
