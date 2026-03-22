import { analyzeImageGoogle, detectFromGoogle } from './vision-google.js';
import { analyzeImageClaude, enrichFromLabels } from './vision-claude.js';

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
    const raw = await detectFromGoogle(params.gcsUri);
    return enrichFromLabels(raw.name, raw.labels);
  }
  return analyzeImageGoogle(params.gcsUri);
}
