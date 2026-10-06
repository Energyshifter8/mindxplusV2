"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { startTokenRefreshScheduler } from "@/lib/auth";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						gcTime: 5 * 60 * 1000,
						retry: (failureCount, error) => {
							// 4xx (401, 404, plan_expired г.м.) дахин оролдоход засрахгүй
							const status =
								error instanceof Error && "status" in error
									? (error as { status?: number }).status
									: undefined;
							if (status !== undefined && status >= 400 && status < 500) {
								return false;
							}
							return failureCount < 3;
						},
					},
				},
			}),
	);

	// Staging-ийн адил: ачаалахад refresh хийхгүй, ~9 минутын дараа (lib/auth.ts)
	useEffect(() => startTokenRefreshScheduler(), []);

	return (
		// Staging зөвхөн light. Хөрвүүлээгүй хуудсууд өөрсдийн `.dark` scope-д (AppShell, login).
		<ThemeProvider
			attribute="class"
			forcedTheme="light"
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
