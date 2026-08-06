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
			"@base-ui/react",
			"class-variance-authority",
			"tailwind-merge",
			"sonner",
			"next-themes",
			"animejs",
		],
		turbopackFileSystemCacheForDev: true,
	},
};

export default nextConfig;
