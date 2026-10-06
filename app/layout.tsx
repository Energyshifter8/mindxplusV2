import "@/app/globals.css";
import type { Metadata } from "next";
import { Barlow_Condensed, Geist, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});
const barlowCondensed = Barlow_Condensed({
	weight: ["700", "900"],
	subsets: ["latin"],
	variable: "--font-barlow",
});

export const metadata: Metadata = {
	title: "System",
	description: "Нэвтрэх портал",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="mn"
			suppressHydrationWarning
			className={cn(
				"font-sans",
				geist.variable,
				jetbrainsMono.variable,
				barlowCondensed.variable,
			)}
		>
			<body className="antialiased">
				<Providers>{children}</Providers>
				<Toaster />
			</body>
		</html>
	);
}
