"use client";

import Link from "next/link";
import { RenamePenIcon } from "@/components/icons/role-assessment";
import {
	DateTimeStack,
	RecruitmentStatusPill,
} from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaKebabMenu } from "@/components/role-assessment/ui/KebabMenu";
import { RaPagination } from "@/components/role-assessment/ui/Pagination";
import {
	canRenameRecruitment,
	opensWizard,
} from "@/lib/constants/roleAssessment";
import { listProgressLabel } from "@/lib/format";
import { raRoutes } from "@/lib/routes";
import type { RecruitmentListItem } from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";
import {
	primaryRowAction,
	type RecruitmentRowHandlers,
	rowMenuActions,
} from "./rowActions";

// Staging жагсаалтын хүснэгт (📦 `E`, shadcn table): min-w 1080, мөр 56px, header 64px.

const TH =
	"h-10 text-left align-middle font-medium text-sm text-TextColor-main leading-[1.4] tracking-[0.2px]";

export function RecruitmentTable({
	rows,
	currentPage,
	totalPages,
	pageSize,
	totalElements,
	onPageChange,
	onPageSizeChange,
	handlers,
}: {
	rows: RecruitmentListItem[];
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalElements?: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	handlers: RecruitmentRowHandlers;
}) {
	return (
		<div className="min-w-0 overflow-hidden rounded-2xl border border-Stroke-600 bg-white">
			<div className="relative w-full overflow-auto">
				<table className="w-full min-w-[1080px] caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className="h-16 border-Stroke-600 border-y bg-Gray-50">
							<th scope="col" className={cn(TH, "w-10 p-0 pl-[23px]")}>
								№
							</th>
							<th scope="col" className={cn(TH, "w-[360px] p-0 pl-3")}>
								Нэр
							</th>
							<th scope="col" className={cn(TH, "w-[222px] p-0 pl-2")}>
								Төлөв
							</th>
							<th scope="col" className={cn(TH, "w-[214px] p-0")}>
								Явц
							</th>
							<th scope="col" className={cn(TH, "w-[240px] p-0")}>
								Үүсгэсэн
							</th>
							<th
								scope="col"
								className={cn(TH, "w-[240px] whitespace-nowrap p-0")}
							>
								Хаагдсан
							</th>
							<th scope="col" className={cn(TH, "w-[196px] p-0 pr-4")}>
								<span className="sr-only">Үйлдэл</span>
							</th>
						</tr>
					</thead>
					<tbody className="[&_tr:last-child]:border-0">
						{rows.map((row, index) => {
							const href = opensWizard(row.status)
								? raRoutes.wizard(row.id)
								: raRoutes.dashboard(row.id);
							const action = primaryRowAction(row, handlers);
							return (
								<tr
									key={row.id}
									className="h-14 border-Gray-200 border-b transition-colors hover:bg-Primary-softBg"
								>
									<td className="w-10 p-0 text-end align-middle font-medium text-TextColor-main text-sm tracking-[0.2px]">
										{(currentPage - 1) * pageSize + index + 1}.
									</td>
									<td className="min-w-0 max-w-[360px] p-0 pr-4 pl-3 align-middle">
										<div className="group flex items-center gap-1">
											<Link
												href={href}
												className="truncate rounded-sm font-semibold text-TextColor-main text-sm leading-[1.4] tracking-[0.2px] transition-colors hover:text-Primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40 group-hover:text-Primary"
											>
												{row.name || "Гарчиггүй"}
											</Link>
											{canRenameRecruitment(row.status) && (
												<button
													type="button"
													aria-label={`"${row.name || "Гарчиггүй"}" нэр солих`}
													className="shrink-0 text-TextColor-main opacity-0 transition-all hover:text-Primary focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
													onClick={() => handlers.onRename(row)}
												>
													<RenamePenIcon className="size-4" />
												</button>
											)}
										</div>
									</td>
									<td className="w-[222px] p-0 pl-2 align-middle">
										<div className="flex">
											<RecruitmentStatusPill status={row.status} />
										</div>
									</td>
									<td className="w-[214px] p-0 pr-4 align-middle font-medium text-TextColor-main text-sm tracking-[0.2px]">
										{listProgressLabel(row)}
									</td>
									<td className="w-[240px] p-0 align-middle">
										<DateTimeStack value={row.createdAt} />
									</td>
									<td className="w-[240px] p-0 align-middle">
										<DateTimeStack value={row.closedAt} />
									</td>
									<td className="w-[196px] p-0 pr-4 align-middle">
										<div className="flex items-center justify-end gap-1">
											<RaButton
												variant="ghost"
												size="small"
												title={action.label}
												prefixIcon={action.icon}
												className="shrink-0 whitespace-nowrap tracking-[0.2px]"
												onClick={action.onSelect}
											/>
											<RaKebabMenu
												actions={rowMenuActions(row, handlers)}
												label={`"${row.name || "Гарчиггүй"}" цэс`}
											/>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col gap-3 border-Stroke-600 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="font-medium text-TextColor-third text-sm leading-[1.4] tracking-[0.2px]">
					Нийт: {totalElements ?? rows.length}
				</p>
				<RaPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={onPageChange}
					pageSize={pageSize}
					onPageSizeChange={onPageSizeChange}
				/>
			</div>
		</div>
	);
}
