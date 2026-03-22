import { Router, type Request, type Response } from 'express';
import { uploadImage } from '../services/storage.js';
import { analyzeImage } from '../services/vision.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { imageData } = req.body as { imageData?: string };

  if (!imageData) {
    res.status(400).json({ error: 'Missing imageData' });
    return;
  }

  // Strip data URI prefix if present
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const filename = `${Date.now()}.jpg`;

  const gcsUri = await uploadImage(buffer, filename);
  const aiData = await analyzeImage(gcsUri);

  res.json({ aiData });
});

export default router;
