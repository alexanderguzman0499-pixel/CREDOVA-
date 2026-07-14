import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Storage abstraction for uploaded ticket files (PDF/screenshot of the barcode).
 *
 * Dev implementation writes to a local, non-public directory. In production,
 * swap this for AWS S3 / Cloudflare R2 with private ACLs and signed URLs —
 * ticket files must never be served from a publicly listable bucket/path,
 * since anyone with the file could screenshot/reuse the barcode.
 */

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? "./uploads";

export interface StoredFile {
  key: string;
  sha256: string;
}

export async function storeTicketFile(file: File): Promise<StoredFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");

  const ext = path.extname(file.name) || "";
  const key = `${randomUUID()}${ext}`;

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, key), buffer);

  return { key, sha256 };
}
