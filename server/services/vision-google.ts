import vision from '@google-cloud/vision';
import type { VisionResult } from './vision.js';

const client = new vision.ImageAnnotatorClient();

export interface GoogleVisionRaw {
  name: string;
  labels: string[];
}

export async function analyzeImageGoogle(gcsUri: string): Promise<VisionResult> {
  const raw = await detectFromGoogle(gcsUri);
  return { name: raw.name || 'Ukjent', category: 'annet' };
}

export async function detectFromGoogle(gcsUri: string): Promise<GoogleVisionRaw> {
  const [result] = await client.annotateImage({
    image: { source: { imageUri: gcsUri } },
    features: [
      { type: 'LABEL_DETECTION', maxResults: 15 },
      { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
    ],
  });

  const labels = (result.labelAnnotations ?? [])
    .map((l) => l.description ?? '')
    .filter(Boolean);

  const objects = (result.localizedObjectAnnotations ?? [])
    .map((o) => o.name ?? '')
    .filter(Boolean);

  const raw = objects[0] ?? labels[0] ?? '';
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);

  return { name, labels: [...objects, ...labels] };
}
