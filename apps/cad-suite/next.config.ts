import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: dirname(dirname(projectRoot)), // Point to workspace root to find hoisted node_modules
  },
};

void initOpenNextCloudflareForDev();

export default nextConfig;
