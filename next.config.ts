import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        root:
            process.platform == "win32" ? "" : "/workspaces/eggbert-analytics/",
    },
};

export default nextConfig;
