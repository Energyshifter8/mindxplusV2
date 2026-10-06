"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import {
	ErrorState,
	RecruitmentStatusBadge,
} from "@/components/shared/ListComponents";
import type { RecruitmentDetail, UserRef } from "@/lib/api";
import { getErrorMessage } from "@/lib/api-errors";
import {
	formatDateTime,
	formatMinutesRange,
	formatPersonShort,
} from "@/lib/format";
import { useRecruitmentDetail } from "@/lib/hooks/useRecruitmentQueries";

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;
const CONDENSED = { fontFamily: "'Barlow Condensed', sans-serif" } as const;

const COLOR_CHIP_CLASS: Record<string, string> = {
	GREEN: "border-badge-green/30 bg-badge-green/15 text-badge-green",
	YELLOW: "border-badge-amber/30 bg-badge-amber/15 text-badge-amber",
};

interface RecruitmentDetailDrawerProps {
	recruitmentId: string;
	onClose: () => void;
}

export default function RecruitmentDetailDrawer({
	recruitmentId,
	onClose,
}: RecruitmentDetailDrawerProps) {
	const { data, isLoading, isError, error, refetch, isFetching } =
		useRecruitmentDetail(recruitmentId);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: drawer backdrop
		// biome-ignore lint/a11y/noStaticElementInteractions: drawer backdrop
		<div
			className="fixed inset-0 z-50 flex justify-end bg-black/70"
			onClick={onClose}
		>
			<aside
				aria-label="Талентийн үнэлгээний дэлгэрэнгүй"
				className="relative flex h-full w-full max-w-lg flex-col border-l-2 border-border bg-card"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-3 border-b-2 border-border p-5">
					<div className="min-w-0">
						<p
							className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground"
							style={MONO}
						>
							Дэлгэрэнгүй
						</p>
						<h2
							className="truncate text-xl font-black uppercase leading-tight text-foreground"
							style={CONDENSED}
						>
							{data?.name ?? (isLoading ? "…" : "—")}
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Хаах"
						className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
					>
						<X size={16} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="space-y-4 p-5">
							{Array.from({ length: 6 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<div key={`skel-${i}`} className="h-4 animate-pulse bg-muted" />
							))}
						</div>
					) : isError || !data ? (
						<ErrorState
							text={getErrorMessage(
								error,
								"Талентийн үнэлгээний мэдээлэл авахад алдаа гарлаа",
							)}
							onRetry={() => refetch()}
							isRetrying={isFetching}
						/>
					) : (
						<DetailBody detail={data} />
					)}
				</div>
			</aside>
		</div>
	);
}

function DetailBody({ detail }: { detail: RecruitmentDetail }) {
	const progress =
		detail.status === "CREATED"
			? "--/--"
			: `${detail.count.completed}/${detail.count.total}`;

	return (
		<div className="divide-y-2 divide-border">
			<Section title="Үндсэн мэдээлэл">
				<dl className="space-y-3">
					<InfoRow label="Төлөв">
						<RecruitmentStatusBadge status={detail.status} />
					</InfoRow>
					<InfoRow label="Явц">{progress}</InfoRow>
					<InfoRow label="Үүсгэсэн">
						<ActorStamp who={detail.createdBy} at={detail.createdAt} />
					</InfoRow>
					{detail.publishedAt && (
						<InfoRow label="Нийтэлсэн">
							<ActorStamp who={detail.publishedBy} at={detail.publishedAt} />
						</InfoRow>
					)}
					{detail.closedAt && (
						<InfoRow label="Хаасан">
							<ActorStamp who={detail.closedBy} at={detail.closedAt} />
						</InfoRow>
					)}
				</dl>
			</Section>

			<Section title={`Сонгосон тестүүд (${detail.tests.length})`}>
				{detail.tests.length === 0 ? (
					<EmptyLine text="Та тест сонгоогүй байна." />
				) : (
					<ul className="space-y-3">
						{detail.tests.map((test) => (
							<li key={test.id} className="border-2 border-border p-3">
								<div className="mb-2 flex items-start justify-between gap-2">
									<span className="text-sm font-bold text-foreground">
										{test.name}
									</span>
									<span
										className={`shrink-0 border px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
											COLOR_CHIP_CLASS[test.color] ??
											"border-border bg-muted text-muted-foreground"
										}`}
										style={MONO}
									>
										{test.category}
									</span>
								</div>
								<div
									className="flex gap-4 text-[10px] uppercase tracking-widest text-muted-foreground"
									style={MONO}
								>
									<span>{test.questionCount} асуулт</span>
									<span>
										{formatMinutesRange(test.minMinutes, test.maxMinutes)} мин
									</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section title={`Нэмэлт асуулт (${detail.customQuestions.length})`}>
				{detail.customQuestions.length === 0 ? (
					<EmptyLine text="Та нэмэлт асуулт сонгоогүй байна." />
				) : (
					<ul className="space-y-3">
						{detail.customQuestions.map((question) => (
							<li key={question.id} className="border-2 border-border p-3">
								<p className="text-sm text-foreground">{question.content}</p>
								{question.description && (
									<p className="mt-1 text-xs text-muted-foreground">
										{question.description}
									</p>
								)}
							</li>
						))}
					</ul>
				)}
			</Section>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="p-5">
			<h3
				className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
				style={MONO}
			>
				{title}
			</h3>
			{children}
		</section>
	);
}

function InfoRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<dt
				className="text-[10px] uppercase tracking-widest text-muted-foreground"
				style={MONO}
			>
				{label}
			</dt>
			<dd className="text-right text-xs text-foreground" style={MONO}>
				{children}
			</dd>
		</div>
	);
}

function ActorStamp({
	who,
	at,
}: {
	who: UserRef | null | undefined;
	at: string | null | undefined;
}) {
	return (
		<span>
			{formatPersonShort(who)}
			<span className="ml-2 text-muted-foreground">{formatDateTime(at)}</span>
		</span>
	);
}

function EmptyLine({ text }: { text: string }) {
	return (
		<p className="text-xs text-muted-foreground" style={MONO}>
			{text}
		</p>
	);
}
