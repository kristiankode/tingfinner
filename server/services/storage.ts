import { Storage } from '@google-cloud/storage';

const storage = new Storage({ projectId: process.env.GCP_PROJECT_ID });
const bucketName = process.env.GCS_BUCKET_NAME!;

export async function uploadImage(buffer: Buffer, filename: string, userId: string): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`users/${userId}/${filename}`);

  await file.save(buffer, {
    metadata: { contentType: 'image/jpeg' },
  });

  return `gs://${bucketName}/users/${userId}/${filename}`;
}

export async function deleteImage(filename: string, userId: string): Promise<void> {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`users/${userId}/${filename}`);
  await file.delete({ ignoreNotFound: true });
}
