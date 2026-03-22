import vision from '@google-cloud/vision';
import { mapLabelsToItem, type MappedResult } from '../lib/categoryMapper.js';

const client = new vision.ImageAnnotatorClient();

export async function analyzeImage(gcsUri: string): Promise<MappedResult> {
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

  return mapLabelsToItem(labels, objects);
}
