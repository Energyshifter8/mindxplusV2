import "@/app/globals.css";
import type { Metadata } from "next";
import {
	Barlow_Condensed,
	Geist,
	JetBrains_Mono,
	Manrope,
} from "next/font/google";
import Providers from "@/components/providers";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});
// Staging апп-ын фонт (font-sf). Монгол үсэгт cyrillic subset хэрэгтэй.
const manrope = Manrope({
	subsets: ["latin", "cyrillic"],
	variable: "--font-manrope",
});
const barlowCondensed = Barlow_Condensed({
	weight: ["700", "900"],
	subsets: ["latin"],
	variable: "--font-barlow",
});

export const metadata: Metadata = {
	title: "System",
	description: "Нэвтрэх портал",
	// Staging: <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16">
	icons: {
		icon: [{ url: "/favicon.ico", type: "image/x-icon", sizes: "16x16" }],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			// Staging-тэй ижил (контент Монгол ч lang="en") — docs/parity/home.md "known"
			lang="en"
			suppressHydrationWarning
			className={cn(
				"font-sans",
				geist.variable,
				jetbrainsMono.variable,
				barlowCondensed.variable,
				manrope.variable,
			)}
		>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
