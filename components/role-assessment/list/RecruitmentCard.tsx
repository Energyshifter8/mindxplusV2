"use client";

import { Popover } from "@base-ui/react/popover";
import Link from "next/link";
import {
	CloseIcon,
	EditIcon,
	RenamePenIcon,
	ResultsIcon,
	StatInvitedIcon,
	TrashIcon,
} from "@/components/icons/role-assessment";
import { RecruitmentStatusPill } from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import {
	canRenameRecruitment,
	opensWizard,
} from "@/lib/constants/roleAssessment";
import { formatDateBullet } from "@/lib/format";
import { raRoutes } from "@/lib/routes";
import type { RecruitmentListItem } from "@/lib/types/role-assessment";
import type { RecruitmentRowHandlers } from "./rowActions";

// Staging grid харагдлын карт (📦 `v`).

export function RecruitmentCard({
	row,
	handlers,
}: {
	row: RecruitmentListItem;
	handlers: RecruitmentRowHandlers;
}) {
	const total = row.totalInvitationCount ?? 0;
	const completed = row.completedInvitationCount ?? 0;
	const percent = total ? Math.round((completed / total) * 100) : 0;
	const href = opensWizard(row.status)
		? raRoutes.wizard(row.id)
		: raRoutes.dashboard(row.id);
	const name = row.name || "Гарчиггүй";
	return (
		<div className="flex w-full min-w-[380px] max-w-[460px] flex-col gap-4 rounded-[16px] border border-Stroke-600 bg-white p-4">
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<div className="group flex min-w-0 flex-1 items-center gap-1">
						<Link
							href={href}
							className="truncate rounded-sm font-bold text-[16px] text-TextColor-main leading-5 tracking-[0.2px] transition-colors hover:text-Primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40 group-hover:text-Primary"
						>
							{name}
						</Link>
						{canRenameRecruitment(row.status) && (
							<button
								type="button"
								aria-label={`"${name}" нэр солих`}
								className="shrink-0 text-TextColor-main opacity-0 transition-all hover:text-Primary focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
								onClick={() => handlers.onRename(row)}
							>
								<RenamePenIcon className="size-4" />
							</button>
						)}
					</div>
					{row.status !== "CREATED" && row.status !== "CLOSED" ? (
						<Popover.Root>
							<Popover.Trigger
								aria-label={`"${name}" цэс`}
								className="flex size-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-Gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40"
							>
								<svg
									aria-hidden="true"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
								>
									{[
										"M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z",
										"M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z",
										"M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z",
									].map((d) => (
										<path
											key={d}
											d={d}
											stroke="#030712"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									))}
								</svg>
							</Popover.Trigger>
							<Popover.Portal>
								<Popover.Positioner align="end" sideOffset={4} className="z-40">
									<Popover.Popup className="ra-scope flex w-auto flex-col gap-0 rounded-2xl border border-Stroke-700 bg-white p-1.5 text-sm shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_0px_#00000040] outline-none">
										<Popover.Close
											className="flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-medium text-[14px] text-TextColor-main transition-colors hover:bg-Semantic-error100/60"
											onClick={() => handlers.onClose(row)}
										>
											<CloseIcon className="size-4" />
											Талентийн үнэлгээ хаах
										</Popover.Close>
									</Popover.Popup>
								</Popover.Positioner>
							</Popover.Portal>
						</Popover.Root>
					) : (
						<div className="size-6 shrink-0" />
					)}
				</div>
				<div className="flex">
					<RecruitmentStatusPill status={row.status} />
				</div>
				<p className="font-medium text-TextColor-secondary text-[14px] leading-[1.4] tracking-[0.2px]">
					{formatDateBullet(row.publishedAt || row.createdAt)}
				</p>
				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between font-medium text-[14px] leading-[1.4] tracking-[0.2px]">
						<span className="text-TextColor-secondary">Явц</span>
						<span className="text-TextColor-main">
							{completed}/{total}
						</span>
					</div>
					<div
						className="h-2 overflow-hidden rounded-full bg-Gray-200"
						role="progressbar"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={percent}
						aria-label="Явц"
					>
						<div
							className="h-full bg-Primary"
							style={{ width: `${percent}%` }}
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				{row.status === "CREATED" ? (
					<>
						<RaButton
							variant="ghost"
							title="Устгах"
							className="!px-4 !text-Semantic-error500 flex-1 font-medium text-[14px] leading-[140%]"
							prefixIcon={<TrashIcon className="size-4" />}
							onClick={() => handlers.onDelete(row)}
						/>
						<RaButton
							variant="outline"
							title="Засах"
							className="!border-Stroke-700 !px-4 flex-1 gap-2 font-medium text-[14px] text-TextColor-main leading-[140%]"
							prefixIcon={<EditIcon className="text-[#10182B]" />}
							onClick={() => handlers.goEdit(row.id)}
						/>
					</>
				) : (
					<>
						{row.status !== "CLOSED" && (
							<RaButton
								title="Урих"
								variant="ghost"
								className="!px-5 flex-1 font-medium text-[14px] text-TextColor-secondary leading-[140%]"
								prefixIcon={<StatInvitedIcon className="size-4" />}
								onClick={() => handlers.onInvite(row.id)}
							/>
						)}
						<RaButton
							title="Үр дүн"
							variant="outline"
							className="!border-Stroke-700 !px-4 flex-1 gap-2 whitespace-nowrap font-medium text-[14px] text-TextColor-main leading-[140%]"
							prefixIcon={<ResultsIcon className="text-black" />}
							onClick={() => handlers.goDashboard(row.id)}
						/>
					</>
				)}
			</div>
		</div>
	);
}
