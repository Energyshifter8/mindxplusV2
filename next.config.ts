import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	skipTrailingSlashRedirect: true,
	turbopack: {
		root: path.resolve(__dirname),
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "mindxplus.s3.ap-northeast-2.amazonaws.com",
			},
		],
	},
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"@tanstack/react-query",
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"@dnd-kit/utilities",
			"@base-ui/react",
			"class-variance-authority",
			"tailwind-merge",
			"sonner",
			"next-themes",
		],
		turbopackFileSystemCacheForDev: true,
	},
};

export default nextConfig;
