import vision from '@google-cloud/vision';
import type { VisionResult } from './vision.js';

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON!);
const client = new vision.ImageAnnotatorClient({ credentials });

export async function analyzeImageGoogle(gcsUri: string): Promise<VisionResult> {
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

  return { name: name || 'Ukjent', category: 'Annet' };
}
