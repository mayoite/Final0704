import fs from "fs";
import path from "path";
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const BUCKET = process.env.R2_BUCKET || "";
const ENDPOINT =
  process.env.R2_ENDPOINT || (ACCOUNT_ID ? `https://${ACCOUNT_ID}.r2.cloudflarestorage.com` : "");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const ROOTS = ["images", "projects", "ClientPhotos", "hero", "fonts", "models", "photos", "Showroom", "ClientLogos"];
const SKIP_EXTENSIONS = new Set([".html", ".htm"]);
const CONCURRENCY = 16;
const shouldDelete = process.argv.includes("--delete");
const dryRun = process.argv.includes("--dry-run");

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET || !ENDPOINT) {
  console.error(
    "Missing required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and R2_ENDPOINT or R2_ACCOUNT_ID.",
  );
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".ico":
      return "image/x-icon";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".ttf":
      return "font/ttf";
    case ".otf":
      return "font/otf";
    case ".glb":
      return "model/gltf-binary";
    case ".gltf":
      return "model/gltf+json";
    case ".bin":
      return "application/octet-stream";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".json":
      return "application/json";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function collectFiles(root, prefix = "") {
  const absoluteRoot = path.join(PUBLIC_DIR, root, prefix);
  if (!fs.existsSync(absoluteRoot)) return [];

  const out = [];
  for (const entry of fs.readdirSync(absoluteRoot, { withFileTypes: true })) {
    const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const full = path.join(absoluteRoot, entry.name);

    if (entry.isDirectory()) {
      out.push(...collectFiles(root, relative));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SKIP_EXTENSIONS.has(ext)) continue;

    const stat = fs.statSync(full);
    out.push({
      key: path.posix.join(root, relative),
      file: full,
      size: stat.size,
    });
  }

  return out;
}

async function listRemoteObjects(prefix) {
  const objects = [];
  let continuationToken;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    objects.push(...(response.Contents || []));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return objects;
}

async function runPool(items, worker, limit) {
  let cursor = 0;

  async function next() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

async function main() {
  const localFiles = ROOTS.flatMap((root) => collectFiles(root));
  const localByKey = new Map(localFiles.map((file) => [file.key, file]));

  const remoteObjects = [];
  for (const root of ROOTS) {
    remoteObjects.push(...(await listRemoteObjects(`${root}/`)));
  }

  const remoteByKey = new Map(remoteObjects.map((object) => [object.Key, object]));
  const uploads = localFiles.filter((file) => {
    const remote = remoteByKey.get(file.key);
    return !remote || remote.Size !== file.size;
  });

  const deletions = shouldDelete
    ? remoteObjects.filter((object) => object.Key && !localByKey.has(object.Key)).map((object) => object.Key)
    : [];

  console.log(
    JSON.stringify(
      {
        roots: ROOTS,
        localCount: localFiles.length,
        remoteCount: remoteObjects.length,
        uploadCount: uploads.length,
        deleteCount: deletions.length,
        dryRun,
        shouldDelete,
      },
      null,
      2,
    ),
  );

  if (dryRun) return;

  if (deletions.length > 0) {
    for (let index = 0; index < deletions.length; index += 1000) {
      const chunk = deletions.slice(index, index + 1000).map((Key) => ({ Key }));
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: { Objects: chunk, Quiet: true },
        }),
      );
      console.log(`deleted ${Math.min(index + 1000, deletions.length)}/${deletions.length}`);
    }
  }

  let completed = 0;
  await runPool(
    uploads,
    async (item) => {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: item.key,
          Body: fs.createReadStream(item.file),
          ContentType: contentType(item.file),
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
      completed += 1;
      if (completed % 100 === 0 || completed === uploads.length) {
        console.log(`uploaded ${completed}/${uploads.length}`);
      }
    },
    CONCURRENCY,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
