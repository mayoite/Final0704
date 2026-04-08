import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = dirname(dirname(projectRoot));
const isLocalDevLifecycle = (process.env.npm_lifecycle_event ?? "").startsWith("dev");
const shouldInitOpenNextCloudflareForDev =
  isLocalDevLifecycle &&
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL &&
  !process.env.VERCEL_ENV &&
  process.env.CI !== "true";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    // Point to workspace root to find hoisted node_modules.
    root: workspaceRoot,
  },
  images: {
    // When NEXT_IMAGE_UNOPTIMIZED=1 (local dev), skip the optimizer entirely
    // so cross-origin images from localhost:3000 load without domain restrictions.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
    ],
  },
};

// OpenNext Cloudflare dev wiring is only needed for local dev.
// Production and hosted CI builds should not load Cloudflare's workerd binary.
if (shouldInitOpenNextCloudflareForDev) {
  void import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => {
      initOpenNextCloudflareForDev();
    })
    .catch(() => {
      // Local dev can continue without the adapter when the package is unavailable.
    });
}

export default nextConfig;
