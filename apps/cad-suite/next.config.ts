import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = dirname(dirname(projectRoot));

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
// Running it during production builds can trigger filesystem assumptions.
if (process.env.NODE_ENV !== "production") {
  void initOpenNextCloudflareForDev();
}

export default nextConfig;
