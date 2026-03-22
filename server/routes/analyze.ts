import { Router, type Request, type Response } from 'express';
import { uploadImage, deleteImage } from '../services/storage.js';
import { analyzeImage } from '../services/vision.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { imageData, userId = 'anonymous' } = req.body as { imageData?: string; userId?: string };

  if (!imageData) {
    res.status(400).json({ error: 'Missing imageData' });
    return;
  }

  // Strip data URI prefix if present
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const filename = `${Date.now()}.jpg`;

  const gcsUri = await uploadImage(buffer, filename, userId);
  const aiData = await analyzeImage({ base64, gcsUri });

  res.json({ aiData });

  // Fire-and-forget: delete from GCS after analysis (Supabase Storage is the source of truth)
  deleteImage(filename, userId).catch(err => console.error('GCS cleanup error:', err));
});

export default router;
