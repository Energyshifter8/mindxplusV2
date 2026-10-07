"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { Bookmark, Calendar, Eye, Mail, Phone, Star } from "lucide-react";
import { RaButton } from "@/components/role-assessment/ui/Button";
import {
	splitLocalDateTime,
	type TalentCardModel,
	visibleTags,
} from "@/lib/role-assessment/talents";
import { cn } from "@/lib/utils";

// Staging урьсан талентын карт (📦 module 62002 `C`). Утас/имэйл/огноо/үзэх icon нь
// татагдаагүй chunk-д (lucide) — нэрээр нь таамаглав (unverified.md). "Засах" товч
// staging-д onEdit дамжуулагддаггүй тул харагддаггүй → хийгээгүй.

const META =
	"font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]";
const LABEL =
	"font-medium text-[12px] text-TextColor-third leading-[1.4] tracking-[0.2px]";
const TAG =
	"inline-flex items-center overflow-hidden rounded-full bg-[#f0f6fc] px-3 py-1 font-medium text-[14px] leading-[1.4] tracking-[0.2px]";

/** Staging `y`: од + оноо, "Дундаж оноо" tooltip (light). */
function RatingBadge({ rating }: { rating: number }) {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger
				aria-label={`Дундаж оноо: ${rating}`}
				className="inline-flex w-fit cursor-default items-center gap-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-Primary/40"
			>
				<Star
					aria-hidden="true"
					className={cn(
						"size-4 shrink-0 text-Primary",
						rating !== 0 && "fill-Primary",
					)}
				/>
				<span className="font-semibold text-[14px] text-Primary leading-[1.4] tracking-[0.2px]">
					{rating}
				</span>
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner side="top" sideOffset={4} className="z-[100]">
					<Tooltip.Popup className="ra-scope max-w-[min(280px,calc(100vw-32px))] rounded-lg bg-white px-3 py-2 font-normal text-[#6b7280] text-xs leading-[1.4] tracking-[0.2px] shadow-[0px_1px_8px_0px_rgba(0,0,0,0.08),0px_2px_16px_2px_rgba(0,0,0,0.08)] outline-none">
						Дундаж оноо
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	);
}

export function TalentCard({
	talent,
	onView,
	onToggleMark,
	marking,
}: {
	talent: TalentCardModel;
	onView: () => void;
	onToggleMark: () => void;
	marking: boolean;
}) {
	const hasId = talent.talentId !== "";
	const { shown, more } = visibleTags(talent.roles);
	const { date, time } = splitLocalDateTime(talent.createdAt);
	return (
		<article
			aria-label={talent.displayName}
			className="flex w-full max-w-[500px] flex-col gap-3 rounded-2xl border border-Stroke-700 bg-white p-4 font-sf hover:bg-Primary-softBg"
		>
			<div className="flex items-center gap-0.5">
				<h2 className="shrink-0 font-semibold text-[20px] text-TextColor-main leading-6">
					{talent.displayName}
				</h2>
				{talent.rating === null ? (
					<div className="flex-1" />
				) : (
					<div className="flex min-w-0 flex-1 items-center px-0.5">
						<RatingBadge rating={talent.rating} />
					</div>
				)}
				<RaButton
					variant="ghost"
					size="small"
					ariaLabel={talent.marked ? "Тэмдэглэгдсэн" : "Тэмдэглэх"}
					aria-pressed={talent.marked}
					prefixIcon={
						<Bookmark
							aria-hidden="true"
							className={cn(
								"size-4 shrink-0",
								talent.marked
									? "fill-Primary text-Primary"
									: "text-TextColor-third",
							)}
						/>
					}
					disabled={!hasId || marking}
					onClick={onToggleMark}
				/>
			</div>
			<div className={cn("flex flex-wrap items-center gap-4", META)}>
				{talent.phone ? (
					<div className="flex items-center gap-1">
						<Phone aria-hidden="true" className="size-4 shrink-0" />
						<span>{talent.phone}</span>
					</div>
				) : null}
				{talent.email ? (
					<div className="flex items-center gap-1">
						<Mail aria-hidden="true" className="size-4 shrink-0" />
						<span className="min-w-0 break-all">{talent.email}</span>
					</div>
				) : null}
			</div>
			<div className="flex flex-col gap-1">
				<p className={LABEL}>Уригдсан ажлын байр</p>
				{shown.length > 0 ? (
					<div className="flex min-h-7 flex-wrap gap-2">
						{shown.map((role) => (
							<span key={role} className={cn(TAG, "text-Gray-700")}>
								{role}
							</span>
						))}
						{more > 0 ? (
							<span className={cn(TAG, "text-TextColor-secondary")}>
								+{more}
							</span>
						) : null}
					</div>
				) : null}
			</div>
			<div className="flex flex-col gap-1">
				<p className={LABEL}>Бүртгэгдсэн огноо</p>
				<div className={cn("flex flex-wrap items-center gap-1", META)}>
					<Calendar aria-hidden="true" className="size-4 shrink-0" />
					<span>{date}</span>
					{time ? (
						<>
							<span aria-hidden="true" className="font-semibold">
								•
							</span>
							<span>{time}</span>
						</>
					) : null}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="flex-1" />
				<RaButton
					variant="outline"
					title="Үзэх"
					size="small"
					ariaLabel={`${talent.displayName} — үзэх`}
					className="!h-10 w-[150px] shrink-0"
					prefixIcon={<Eye aria-hidden="true" className="size-4 shrink-0" />}
					onClick={onView}
					disabled={!hasId}
				/>
			</div>
		</article>
	);
}
