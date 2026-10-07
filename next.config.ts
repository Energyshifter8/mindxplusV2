import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	skipTrailingSlashRedirect: true,
	// Талентийн үнэлгээ staging-ийн замд шилжсэн; хуучин холбоос (bookmark) ажилласаар байна.
	// permanent:false (307) — browser кэшлэхгүй, хэрэгтэй бол буцаахад хялбар.
	async redirects() {
		return [
			{
				source: "/dashboard/recruitments",
				destination: "/role-assessment",
				permanent: false,
			},
			{
				source: "/dashboard/recruitments/:id/edit",
				destination: "/role-assessment/:id",
				permanent: false,
			},
			{
				source: "/dashboard/recruitments/:id/preview",
				destination: "/role-assessment/:id/preview",
				permanent: false,
			},
			{
				source: "/dashboard/recruitments/:id/results",
				destination: "/role-assessment/:id/dashboard",
				permanent: false,
			},
			{
				source: "/dashboard/recruitments/:id/results/:invitationId",
				destination: "/role-assessment/:id/dashboard/:invitationId",
				permanent: false,
			},
			{
				source: "/dashboard/talents",
				destination: "/invited-talents",
				permanent: false,
			},
			{
				source: "/dashboard/talents/:id",
				destination: "/invited-talents/:id",
				permanent: false,
			},
		];
	},
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
	},
};

export default nextConfig;
