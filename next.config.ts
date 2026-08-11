import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin Turbopack root to this app — a parent lockfile at C:\Users\user
// otherwise becomes [project] and breaks the React Client Manifest.
const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
