"use client";

import { Download } from "lucide-react";
import { Drawer } from "@/components/shared/Drawer";
import { ErrorState } from "@/components/shared/ListComponents";
import { getErrorMessage, isRetryableError } from "@/lib/api-errors";
import { useDownloadTestReport } from "@/lib/hooks/useDownloadTestReport";
import { useTestReportHtml } from "@/lib/hooks/useRecruitmentQueries";

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;

interface TestReportDrawerProps {
	invitationId: string;
	answerId: string;
	testName: string;
	onClose: () => void;
}

/**
 * Серверийн HTML тайлан (#19). Бүтэн HTML баримт, зураг нь data: URI (staging ✅).
 * sandbox="" — script ажиллахгүй, апп-ын origin/token руу хандахгүй.
 * Тайлан өөрөө дэвсгэр өнгөгүй тул цагаан "цаас" дээр харуулна.
 */
export default function TestReportDrawer({
	invitationId,
	answerId,
	testName,
	onClose,
}: TestReportDrawerProps) {
	const { data, isLoading, isError, error, refetch, isFetching } =
		useTestReportHtml(invitationId, answerId);
	const download = useDownloadTestReport();

	return (
		<Drawer
			eyebrow="Тайлан"
			title={testName}
			onClose={onClose}
			widthClass="max-w-3xl"
		>
			<div className="flex items-center justify-end gap-2 border-b-2 border-border px-5 py-3">
				<button
					type="button"
					onClick={() => download.mutate({ invitationId, answerId })}
					disabled={download.isPending}
					className="flex items-center gap-1.5 border-2 border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
					style={MONO}
				>
					<Download size={12} />
					{download.isPending ? "Татаж байна..." : "Тайлан татах"}
				</button>
			</div>
			{isLoading ? (
				<div className="space-y-4 p-5">
					{Array.from({ length: 10 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						<div key={`skel-${i}`} className="h-4 animate-pulse bg-muted" />
					))}
				</div>
			) : isError || !data ? (
				<ErrorState
					text={
						isError
							? getErrorMessage(error, "Тайлан авахад алдаа гарлаа")
							: "Тайлан хоосон байна"
					}
					onRetry={isRetryableError(error) ? () => refetch() : undefined}
					isRetrying={isFetching}
				/>
			) : (
				<iframe
					title={`${testName} — тайлан`}
					sandbox=""
					srcDoc={data}
					className="min-h-0 w-full flex-1 border-0 bg-white"
					style={{ colorScheme: "light" }}
				/>
			)}
		</Drawer>
	);
}
