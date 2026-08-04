"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { NineMinuteTimer } from "@/lib/api";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						gcTime: 5 * 60 * 1000,
						retry: (failureCount, error) => {
							if (
								error instanceof Error &&
								"status" in error &&
								(error as { status: number }).status === 401
							) {
								return false;
							}
							return failureCount < 3;
						},
					},
				},
			}),
	);

	useEffect(() => {
		const cleanup = NineMinuteTimer();
		return cleanup;
	}, []);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			enableSystem={false}
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				{children}
				<Toaster />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
