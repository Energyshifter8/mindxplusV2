"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parsePageParams } from "@/lib/pagination";

type ParamValue = string | number | null | undefined;

/**
 * URL-ийн `?page=N&size=M` (page 1-ээс) болон бусад жагсаалтын параметрийг
 * уншиж/бичнэ. API руу явуулахдаа `toApiPage()`-ээр хөрвүүлнэ.
 * useSearchParams ашигладаг тул дуудаж буй хуудсыг <Suspense>-д ороох хэрэгтэй.
 */
export function usePageParams() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const { page, size } = parsePageParams(searchParams);

	/** null/undefined/"" утгатай түлхүүрийг URL-аас хасна. */
	const updateParams = useCallback(
		(updates: Record<string, ParamValue>) => {
			const next = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (value === null || value === undefined || value === "") {
					next.delete(key);
				} else {
					next.set(key, String(value));
				}
			}
			const qs = next.toString();
			router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
		},
		[searchParams, router, pathname],
	);

	const setPage = useCallback(
		(nextPage: number) => updateParams({ page: nextPage, size }),
		[updateParams, size],
	);

	const setSize = useCallback(
		(nextSize: number) => updateParams({ page: 1, size: nextSize }),
		[updateParams],
	);

	return { page, size, searchParams, setPage, setSize, updateParams };
}
