import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = dirname(dirname(projectRoot));
const shouldInitOpenNextCloudflareForDev =
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL &&
  !process.env.VERCEL_ENV &&
  process.env.CI !== "true";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    // Point to workspace root to find hoisted node_modules.
    root: workspaceRoot,
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
