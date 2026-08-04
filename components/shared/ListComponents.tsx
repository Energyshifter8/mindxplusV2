"use client";

import { Check, FileText } from "lucide-react";
import { memo } from "react";

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
						className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-tight max-w-[120px]"
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
						className="text-3xl font-black uppercase text-stat-value"
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

export const RecruitmentStatusBadge = memo(function RecruitmentStatusBadge({
	status,
}: {
	status: string;
}) {
	const config: Record<
		string,
		{ label: string; dotClass: string; borderClass: string }
	> = {
		DRAFT: {
			label: "Үүссэн",
			dotClass: "bg-badge-amber",
			borderClass: "border-badge-amber/30",
		},
		PUBLISHED: {
			label: "Нийтэлсэн",
			dotClass: "bg-badge-green",
			borderClass: "border-badge-green/30",
		},
		CLOSED: {
			label: "Хаагдсан",
			dotClass: "bg-badge-gray",
			borderClass: "border-badge-gray/30",
		},
		COMPLETED: {
			label: "Дууссан",
			dotClass: "bg-[#3B82F6]",
			borderClass: "border-[#3B82F6]/30",
		},
	};

	const { label, dotClass, borderClass } = config[status] ?? config.DRAFT;

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
