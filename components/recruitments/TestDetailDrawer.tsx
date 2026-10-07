"use client";

import { useMemo } from "react";
import { Drawer } from "@/components/shared/Drawer";
import { ErrorState } from "@/components/shared/ListComponents";
import { getErrorMessage, isRetryableError } from "@/lib/api-errors";
import { useRoleAssessmentTest } from "@/lib/hooks/role-assessment/queries";

interface TestDetailDrawerProps {
	/** Catalog test id (RecruitmentTest.id, testId биш) */
	catalogTestId: string;
	fallbackName: string;
	onClose: () => void;
}

/**
 * Серверийн HTML-ийг (`content`) sandbox="" iframe-д харуулна: script ажиллахгүй,
 * апп-ын origin (localStorage token) руу хандах эрхгүй.
 * Контент `color: rgb(0, 0, 0)` гэж хатуу бичсэн (staging ✅, 84 газар) тул
 * theme-ээс үл хамааран цагаан "цаас" дээр харуулна, үгүй бол dark theme-д уншигдахгүй.
 */
function buildSrcDoc(html: string): string {
	return `<!doctype html><html><head><meta charset="utf-8"><style>
:root{color-scheme:light}
body{margin:0;padding:20px;font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#0a0a0a;background:#ffffff;word-wrap:break-word}
img{max-width:100%;height:auto}
</style></head><body>${html}</body></html>`;
}

export default function TestDetailDrawer({
	catalogTestId,
	fallbackName,
	onClose,
}: TestDetailDrawerProps) {
	const { data, isLoading, isError, error, refetch, isFetching } =
		useRoleAssessmentTest(catalogTestId);

	const srcDoc = useMemo(
		() => (data ? buildSrcDoc(data.content ?? "") : ""),
		[data],
	);

	return (
		<Drawer
			eyebrow="Тестийн дэлгэрэнгүй"
			title={data?.name ?? fallbackName}
			onClose={onClose}
			widthClass="max-w-2xl"
		>
			{isLoading ? (
				<div className="space-y-4 p-5">
					{Array.from({ length: 8 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						<div key={`skel-${i}`} className="h-4 animate-pulse bg-muted" />
					))}
				</div>
			) : isError || !data ? (
				<ErrorState
					text={getErrorMessage(error, "Тестийн мэдээлэл авахад алдаа гарлаа")}
					onRetry={isRetryableError(error) ? () => refetch() : undefined}
					isRetrying={isFetching}
				/>
			) : (
				<iframe
					title={data.name}
					sandbox=""
					srcDoc={srcDoc}
					className="min-h-0 w-full flex-1 border-0 bg-white"
				/>
			)}
		</Drawer>
	);
}
