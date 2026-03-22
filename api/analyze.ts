import type { VercelRequest, VercelResponse } from '@vercel/node';
import { uploadImage, deleteImage } from '../server/services/storage.js';
import { analyzeImage } from '../server/services/vision.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { imageData, userId = 'anonymous' } = req.body as { imageData?: string; userId?: string };
  if (!imageData) { res.status(400).json({ error: 'Missing imageData' }); return; }

  const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const filename = `${Date.now()}.jpg`;

  const gcsUri = await uploadImage(buffer, filename, userId);
  const aiData = await analyzeImage({ base64, gcsUri });

  res.json({ aiData });

  deleteImage(filename, userId).catch(err => console.error('GCS cleanup error:', err));
}
