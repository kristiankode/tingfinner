import { analyzeImageGoogle } from './vision-google.js';
import { analyzeImageClaude, translateToNorwegian } from './vision-claude.js';

export interface VisionResult {
  name: string;
  category: string;
}

// Set VISION_PROVIDER=claude in .env to use Claude, defaults to Google Vision
const provider = process.env.VISION_PROVIDER ?? 'google';

export async function analyzeImage(params: { base64: string; gcsUri: string }): Promise<VisionResult> {
  if (provider === 'claude') {
    return analyzeImageClaude(params.base64);
  }
  if (provider === 'google+claude') {
    const result = await analyzeImageGoogle(params.gcsUri);
    result.name = await translateToNorwegian(result.name);
    return result;
  }
  return analyzeImageGoogle(params.gcsUri);
}
