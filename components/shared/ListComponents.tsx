"use client";

import { Check, FileText, RotateCw, TriangleAlert } from "lucide-react";
import { memo } from "react";
import {
	INVITATION_STATUS_LABELS,
	type InvitationStatus,
	isInvitationStatus,
	isRecruitmentStatus,
	RECRUITMENT_STATUS_LABELS,
	type RecruitmentStatus,
} from "@/lib/constants/roleAssessment";

export const GridTexture = memo(function GridTexture() {
	return (
		<div
			className="absolute inset-0 pointer-events-none"
			style={{
				backgroundImage: `
          linear-gradient(rgba(11,154,70,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(11,154,70,0.06) 1px, transparent 1px)
        `,
				backgroundSize: "40px 40px",
			}}
		/>
	);
});

export const MiniStatCard = memo(function MiniStatCard({
	label,
	value,
	icon,
	isLoading,
	isError,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	isLoading?: boolean;
	isError?: boolean;
}) {
	const numValue = Number(value);
	const displayValue =
		!isLoading && !isError && !Number.isNaN(numValue) && numValue >= 100000
			? "Хязгааргүй"
			: value;

	return (
		<div className="group relative p-5 border-2 border-border bg-card overflow-hidden transition-colors duration-150 hover:border-primary">
			<GridTexture />
			<div className="relative z-10">
				<div className="flex items-start justify-between mb-3">
					<span
						className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-tight"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{label}
					</span>
					<div className="text-icon-dim group-hover:text-icon-hover transition-colors duration-150">
						{icon}
					</div>
				</div>
				{isLoading ? (
					<div className="h-8 w-20 rounded-none animate-pulse bg-muted" />
				) : isError ? (
					<div
						className="text-xs text-destructive uppercase tracking-widest"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Алдаа
					</div>
				) : (
					<div
						className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-stat-value"
						style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
					>
						{displayValue}
					</div>
				)}
			</div>
		</div>
	);
});

export const SurveyStatusBadge = memo(function SurveyStatusBadge({
	status,
}: {
	status: string;
}) {
	const config: Record<
		string,
		{
			label: string;
			bgClass: string;
			textClass: string;
			icon: "dot-green" | "dot-amber" | "check";
		}
	> = {
		PUBLISHED: {
			label: "Идэвхтэй",
			bgClass: "bg-green-100",
			textClass: "text-green-700",
			icon: "dot-green",
		},
		CREATED: {
			label: "Үүссэн",
			bgClass: "bg-amber-100",
			textClass: "text-amber-700",
			icon: "dot-amber",
		},
		CLOSED: {
			label: "Хаагдсан",
			bgClass: "bg-slate-100",
			textClass: "text-slate-600",
			icon: "check",
		},
	};

	const { label, bgClass, textClass, icon } = config[status] ?? config.CREATED;

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${bgClass} ${textClass}`}
		>
			{icon === "check" ? (
				<Check size={12} strokeWidth={2.5} />
			) : (
				<span
					className={`inline-block h-2 w-2 rounded-full ${
						icon === "dot-green" ? "bg-green-600" : "bg-amber-600"
					}`}
				/>
			)}
			{label}
		</span>
	);
});

const RECRUITMENT_BADGE_STYLES: Record<
	RecruitmentStatus,
	{ dotClass: string; borderClass: string }
> = {
	CREATED: {
		dotClass: "bg-badge-amber",
		borderClass: "border-badge-amber/30",
	},
	PUBLISHED: {
		dotClass: "bg-badge-green",
		borderClass: "border-badge-green/30",
	},
	CLOSED: {
		dotClass: "bg-badge-gray",
		borderClass: "border-badge-gray/30",
	},
};

export const RecruitmentStatusBadge = memo(function RecruitmentStatusBadge({
	status,
}: {
	status: string;
}) {
	const { label, dotClass, borderClass } = isRecruitmentStatus(status)
		? {
				label: RECRUITMENT_STATUS_LABELS[status],
				...RECRUITMENT_BADGE_STYLES[status],
			}
		: {
				label: status,
				dotClass: "bg-badge-gray",
				borderClass: "border-badge-gray/30",
			};

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border ${borderClass}`}
			style={{ fontFamily: "'JetBrains Mono', monospace" }}
		>
			<span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
			{label}
		</span>
	);
});

const INVITATION_BADGE_STYLES: Record<
	InvitationStatus,
	{ boxClass: string; dotClass: string }
> = {
	PENDING: {
		boxClass: "bg-badge-amber/15 border-badge-amber/30 text-badge-amber",
		dotClass: "bg-badge-amber",
	},
	STARTED: {
		boxClass: "bg-[#3B82F6]/15 border-[#3B82F6]/30 text-[#3B82F6]",
		dotClass: "bg-[#3B82F6]",
	},
	COMPLETED: {
		boxClass: "bg-badge-green/15 border-badge-green/30 text-badge-green",
		dotClass: "bg-badge-green",
	},
	EXPIRED: {
		boxClass: "bg-muted border-border text-muted-foreground",
		dotClass: "bg-badge-gray",
	},
};

export const InvitationStatusBadge = memo(function InvitationStatusBadge({
	status,
}: {
	status: string;
}) {
	const { label, boxClass, dotClass } = isInvitationStatus(status)
		? {
				label: INVITATION_STATUS_LABELS[status],
				...INVITATION_BADGE_STYLES[status],
			}
		: {
				label: status,
				boxClass: "bg-muted border-border text-muted-foreground",
				dotClass: "bg-badge-gray",
			};

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border whitespace-nowrap ${boxClass}`}
			style={{ fontFamily: "'JetBrains Mono', monospace" }}
		>
			<span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
			{label}
		</span>
	);
});

const TEST_COLOR_CHIP_CLASS: Record<string, string> = {
	GREEN: "border-badge-green/30 bg-badge-green/15 text-badge-green",
	YELLOW: "border-badge-amber/30 bg-badge-amber/15 text-badge-amber",
};

/** Тестийн категорийн chip (color: GREEN = Бие хүний онцлог, YELLOW = Зөөлөн ур чадвар). */
export function TestCategoryChip({
	color,
	label,
}: {
	color: string;
	label: string;
}) {
	return (
		<span
			className={`inline-block shrink-0 border px-1.5 py-0.5 text-[9px] uppercase tracking-widest whitespace-nowrap ${
				TEST_COLOR_CHIP_CLASS[color] ??
				"border-border bg-muted text-muted-foreground"
			}`}
			style={{ fontFamily: "'JetBrains Mono', monospace" }}
		>
			{label}
		</span>
	);
}

export function ErrorState({
	text,
	onRetry,
	isRetrying,
}: {
	text: string;
	onRetry?: () => void;
	isRetrying?: boolean;
}) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center justify-center py-20 text-muted-foreground"
		>
			<TriangleAlert size={32} className="mb-3 text-destructive opacity-80" />
			<span
				className="max-w-md px-4 text-center text-[11px] uppercase tracking-widest"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{text}
			</span>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					disabled={isRetrying}
					className="mt-5 inline-flex items-center gap-1.5 border-2 border-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					<RotateCw size={12} className={isRetrying ? "animate-spin" : ""} />
					Дахин оролдох
				</button>
			)}
		</div>
	);
}

export const EmptyState = memo(function EmptyState({ text }: { text: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
			<FileText size={32} className="mb-3 opacity-40" />
			<span
				className="text-[11px] uppercase tracking-widest"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{text}
			</span>
		</div>
	);
});

export function TableSkeleton({ columnCount }: { columnCount: number }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left">
				<thead>
					<tr className="border-b-2 border-border">
						{Array.from({ length: columnCount }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton header
							<th key={`skel-th-${i}`} className="py-2.5 px-3">
								<div
									className="h-3 w-16 animate-pulse bg-muted"
									style={{ borderRadius: 0 }}
								/>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: 5 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton row
						<tr key={`skel-row-${i}`} className="border-b border-border/50">
							{Array.from({ length: columnCount }).map((__, j) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cell
								<td key={`skel-cell-${i}-${j}`} className="py-3 px-3">
									<div
										className="h-3 animate-pulse bg-muted"
										style={{
											borderRadius: 0,
											width: j === 0 ? "20px" : "80%",
										}}
									/>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
