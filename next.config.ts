import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(isGitHubActions ? { basePath: "/guibar" } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubActions ? "/guibar" : "",
  },
  allowedDevOrigins: ["*.tail71b922.ts.net"],
};

export default nextConfig;
