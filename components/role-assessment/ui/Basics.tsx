"use client";

import Image from "next/image";
import { StatusClosedCheckIcon } from "@/components/icons/role-assessment";
import { formatStatCount, splitDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RaButton } from "./Button";

// Staging-ийн жижиг бүрэлдэхүүнүүд (📦 bundle module-ийн дугаартай).

/** module 3878 `L`: segment tab-ын сав (tablist) */
export function SegmentTabs({
	children,
	className,
	label,
}: {
	children: React.ReactNode;
	className?: string;
	label: string;
}) {
	return (
		<div
			role="tablist"
			aria-label={label}
			className={cn(
				"flex h-[42px] min-w-0 max-w-full items-center overflow-x-auto overscroll-x-contain rounded-lg bg-Gray-50 px-[5px] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [scrollbar-width:none]",
				className,
			)}
		>
			{children}
		</div>
	);
}

/** module 3878 `V`: tab */
export function SegmentTab({
	active,
	label,
	icon,
	onClick,
}: {
	active: boolean;
	label: string;
	icon?: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			onClick={onClick}
			className={cn(
				"flex shrink-0 items-center justify-center gap-1.5 rounded-[3px] px-3 py-1.5 font-medium text-[14px] leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40",
				active
					? "bg-white text-slate-900"
					: "text-slate-700 hover:text-TextColor-main",
			)}
		>
			{icon}
			{label}
		</button>
	);
}

/** module 94621: статистик карт (≥ 10000 → "Хязгааргүй", null → 0) */
export function StatCard({
	icon,
	count,
	label,
}: {
	icon: React.ReactNode;
	count?: number | null;
	label: string;
}) {
	return (
		<div className="flex h-full min-w-0 flex-1 flex-col gap-[10px] rounded-2xl border border-[#e4e8ef] p-4">
			<div className="flex h-[14.4px] w-[14.4px] items-center justify-center">
				{icon}
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-bold text-[20px] text-TextColor-main leading-6">
					{formatStatCount(count)}
				</p>
				<p className="font-medium text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]">
					{label}
				</p>
			</div>
		</div>
	);
}

const SKELETON_BLOCK =
	"h-4 rounded-[4px] bg-[length:400%_100%] animate-[antd-skeleton_1.4s_ease_infinite]";
const SKELETON_STYLE: React.CSSProperties = {
	backgroundImage:
		"linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.15) 37%, rgba(0,0,0,0.06) 63%)",
};

/** antd v5 `<Skeleton active paragraph={{ rows }} />` (module 43288) */
export function AntdSkeleton({
	rows = 3,
	className,
}: {
	rows?: number;
	className?: string;
}) {
	return (
		<div className={cn("table w-full", className)} aria-busy="true">
			<span className="sr-only">Ачааллаж байна...</span>
			<div className="table-cell w-full align-top">
				<div
					className={SKELETON_BLOCK}
					style={{ ...SKELETON_STYLE, width: "38%" }}
				/>
				<ul className="mt-6 p-0">
					{Array.from({ length: rows }, (_, i) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
							key={i}
							className={cn(
								SKELETON_BLOCK,
								"w-full list-none",
								i > 0 && "mt-4",
							)}
							style={{
								...SKELETON_STYLE,
								...(i === rows - 1 ? { width: "61%" } : null),
							}}
						/>
					))}
				</ul>
			</div>
		</div>
	);
}

/** Нэг мөрийн skeleton блок (хүснэгт, карт) */
export function SkeletonBlock({ className }: { className?: string }) {
	return (
		<div className={cn(SKELETON_BLOCK, className)} style={SKELETON_STYLE} />
	);
}

/** module 39378 `Hp`: талентийн үнэлгээний статус */
export function RecruitmentStatusPill({ status }: { status?: string }) {
	const pill =
		"flex items-center justify-start gap-2 rounded-lg border border-Gray-300 px-3 py-1 font-medium text-Gray-950 text-[14px] leading-[140%]";
	switch (status) {
		case "CREATED":
			return (
				<div className={pill}>
					<div className="size-2 rounded-full bg-Semantic-warning500" />
					Үүссэн
				</div>
			);
		case "PUBLISHED":
			return (
				<div className={pill}>
					<div className="size-2 rounded-full bg-Semantic-success500" />
					Идэвхтэй
				</div>
			);
		case "CLOSED":
			return (
				<div className="flex h-7 items-center gap-2 rounded-lg bg-Gray-100 pr-3 pl-2 font-medium text-Gray-700 text-[14px] leading-5">
					<StatusClosedCheckIcon className="size-4" />
					Хаагдсан
				</div>
			);
		case "PUBLISHING":
			return (
				<div className={pill}>
					<div className="size-2 rounded-full bg-[#4d4c4b]" />
					PUBLISHING
				</div>
			);
		case "SUSPENDED":
			return (
				<div className="group relative inline-flex">
					<div className="flex items-center gap-x-2 rounded-lg border-[#f32222]/30 border-[1.5px] bg-[#fff0f0] px-2 py-[2px] text-[#f32222] text-[14px] leading-5">
						<div className="h-[6px] w-[6px] rounded-full bg-[#f32222]" />
						Саатсан
					</div>
					<div
						role="tooltip"
						className="absolute bottom-full left-0 z-50 mb-2 hidden w-max max-w-[240px] group-hover:block"
					>
						<div className="rounded-lg bg-Gray-900 px-3 py-2 text-[12px] text-white leading-[1.4] shadow-lg">
							Талентийн үнэлгээг нийтлэх үед алдаа гарсан байна. Та дахин
							шинжилгээ үүсгэнэ үү.
						</div>
					</div>
				</div>
			);
		default:
			return <div>Тодорхойгүй</div>;
	}
}

/** Жагсаалтын огноо (📦 `P`): огноо дээр, цаг доор жижиг */
export function DateTimeStack({ value }: { value?: string | null }) {
	const { date, time } = splitDateTime(value);
	return (
		<div className="flex flex-col">
			<span className="font-medium text-TextColor-main text-sm leading-[1.2] tracking-[0.2px]">
				{date}
			</span>
			{time ? (
				<span className="font-medium text-TextColor-secondary text-xs leading-[1.2] tracking-[0.2px]">
					{time}
				</span>
			) : null}
		</div>
	);
}

/** Dashboard-ын огноо (📦 module 62244): нэг мөрөнд "огноо • цаг" */
export function DateTimeInline({ value }: { value?: string | null }) {
	const { date, time } = splitDateTime(value);
	const text =
		"font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]";
	return (
		<div className="inline-flex items-center gap-2 whitespace-nowrap">
			<span className={text}>{date}</span>
			{time ? (
				<>
					<span
						aria-hidden="true"
						className="size-1 shrink-0 rounded-full bg-TextColor-third"
					/>
					<span className={text}>{time}</span>
				</>
			) : null}
		</div>
	);
}

/** Staging-ийн хоосон төлөв (зурагтай) */
export function EmptyIllustration({
	title,
	description,
	className,
}: {
	title: string;
	description?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-[2px] py-40",
				className,
			)}
		>
			<Image
				src="/images/role-assessment/be-patient.svg"
				alt=""
				width={160}
				height={98}
				className="mb-2 object-contain"
				priority
			/>
			<p className="text-center font-bold text-TextColor-secondary text-xl leading-6">
				{title}
			</p>
			{description && (
				<p className="text-center font-normal text-TextColor-third text-sm leading-[1.4] tracking-[0.2px]">
					{description}
				</p>
			)}
		</div>
	);
}

/**
 * Алдааны төлөв (staging зөвхөн toast харуулдаг; бид алдааг хоосон төлөвтэй андуурахгүйн
 * тулд тусад нь харуулна — mismatches.md).
 */
export function ErrorState({
	message,
	onRetry,
	retrying,
	className,
}: {
	message: string;
	onRetry?: () => void;
	retrying?: boolean;
	className?: string;
}) {
	return (
		<div
			role="alert"
			className={cn(
				"flex flex-col items-center justify-center gap-3 py-20 text-center",
				className,
			)}
		>
			<p className="font-semibold text-TextColor-main text-base leading-5">
				{message}
			</p>
			{onRetry && (
				<RaButton
					variant="outline"
					size="small"
					title={retrying ? "Ачааллаж байна..." : "Дахин оролдох"}
					disabled={retrying}
					onClick={onRetry}
				/>
			)}
		</div>
	);
}
