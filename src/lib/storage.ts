import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Storage abstraction for uploaded ticket files (PDF/screenshot of the barcode).
 *
 * Uses Cloudflare R2 (S3-compatible) when R2_* env vars are configured — that's
 * required in production since serverless deployments (Vercel) have no
 * persistent local disk. Falls back to writing to a local, non-public
 * directory when R2 isn't configured, so local development doesn't need R2
 * credentials. The bucket must stay private: ticket files are never served
 * from a publicly listable path, since anyone with the file could
 * screenshot/reuse the barcode.
 */

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "./uploads";

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;

const r2Client =
  r2AccountId && r2AccessKeyId && r2SecretAccessKey
    ? new S3Client({
        region: "auto",
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
      })
    : null;

export interface StoredFile {
  key: string;
  sha256: string;
}

export async function storeTicketFile(file: File): Promise<StoredFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;

  if (r2Client && r2BucketName) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );
    return { key, sha256 };
  }

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, key), buffer);

  return { key, sha256 };
}
