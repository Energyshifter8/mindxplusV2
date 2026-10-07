"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResultsIcon } from "@/components/icons/role-assessment";
import { DateTimeInline } from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaPagination } from "@/components/role-assessment/ui/Pagination";
import {
	canExtendInvitation,
	isResultAvailable,
} from "@/lib/constants/roleAssessment";
import { formatPersonShort, minutesRangeOrDash } from "@/lib/format";
import { raRoutes } from "@/lib/routes";
import type {
	RecruitmentCustomQuestion,
	RecruitmentInvitation,
	RecruitmentTest,
} from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";
import type { ReinviteTarget } from "../InviteTalentModal";
import { InvitationStatusBadge } from "./InvitationStatusBadge";

// Staging dashboard-ын хүснэгтүүд (📦 module 34795 `y`, `Z`, `k`; shadcn Table).
// Staging-ийн `bg-muted`, `text-muted-foreground` CSS-д байхгүй тул орхив; мөрийн
// хүрээ staging-ийн default `#e5e7eb`.

const FRAME = "overflow-hidden rounded-[16px] border border-Stroke-600";
const HEAD_ROW =
	"border-Stroke-600 border-b bg-Gray-50 font-medium text-[14px] text-TextColor-main";
const TH = "h-10 px-2 text-left align-middle font-medium";
const ROW = "border-[#e5e7eb] border-b transition-colors last:border-0";
const TD = "p-2 align-middle";
const SECONDARY =
	"font-medium text-[14px] text-TextColor-secondary leading-[140%]";

/** Staging module 75584: үнэлсэн бол од + оноо, эс бол "---". */
function RatingCell({
	rated,
	points,
}: {
	rated: boolean;
	points?: number | null;
}) {
	if (!rated)
		return <span className="text-[14px] text-TextColor-third">---</span>;
	return (
		<div className="flex items-center gap-1">
			<Star
				className="size-4 shrink-0 fill-Primary text-Primary"
				aria-hidden="true"
			/>
			<span className="font-semibold text-[16px] text-TextColor-secondary leading-5 tracking-[0.2px]">
				<span className="sr-only">Үнэлгээ: </span>
				{points}
			</span>
		</div>
	);
}

export function InvitationsTable({
	recruitmentId,
	invitations,
	currentPage,
	pageSize,
	totalPages,
	totalElements,
	onPageChange,
	onPageSizeChange,
	onReinvite,
}: {
	recruitmentId: string;
	invitations: RecruitmentInvitation[];
	currentPage: number;
	pageSize: number;
	totalPages: number;
	totalElements: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	onReinvite: (target: ReinviteTarget) => void;
}) {
	const router = useRouter();
	return (
		<div className={FRAME}>
			<div className="relative w-full overflow-auto">
				<table className="w-full min-w-[1100px] caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className={HEAD_ROW}>
							<th scope="col" className={cn(TH, "w-[40px]")}>
								<span className="sr-only">№</span>
							</th>
							<th scope="col" className={TH}>
								Нэр
							</th>
							<th scope="col" className={cn(TH, "w-[110px]")}>
								Үнэлгээ
							</th>
							<th scope="col" className={cn(TH, "w-[160px]")}>
								Илгээсэн огноо
							</th>
							<th scope="col" className={cn(TH, "w-[180px]")}>
								Урьсан
							</th>
							<th scope="col" className={cn(TH, "w-[190px]")}>
								Төлөв
							</th>
							<th scope="col" className={cn(TH, "w-[160px]")}>
								Бөглөсөн огноо
							</th>
							<th scope="col" className={cn(TH, "w-[140px]")}>
								Үр дүн
							</th>
						</tr>
					</thead>
					<tbody>
						{invitations.length === 0 ? (
							<tr className={ROW}>
								<td
									colSpan={8}
									className={cn(TD, "py-12 text-center text-TextColor-third")}
								>
									Оролцогч байхгүй байна
								</td>
							</tr>
						) : (
							invitations.map((inv, index) => {
								const resultHref = raRoutes.result(recruitmentId, inv.id);
								const fullName = `${inv.lastName} ${inv.firstName}`;
								return (
									<tr
										key={inv.id}
										className={cn(ROW, "hover:bg-Primary-softBg")}
									>
										<td
											className={cn(
												TD,
												"text-center text-[14px] text-TextColor-main leading-5",
											)}
										>
											{(currentPage - 1) * pageSize + index + 1}.
										</td>
										<td className={TD}>
											<Link
												href={resultHref}
												className="rounded-sm font-semibold text-[14px] text-TextColor-main outline-none transition-colors hover:text-Primary focus-visible:ring-2 focus-visible:ring-Primary/40"
											>
												{fullName}
											</Link>
											<p className={cn("mt-1", SECONDARY)}>{inv.email}</p>
										</td>
										<td className={TD}>
											<RatingCell rated={inv.rated} points={inv.ratingPoints} />
										</td>
										<td className={cn(TD, SECONDARY)}>
											<DateTimeInline value={inv.createdAt} />
										</td>
										<td className={cn(TD, "whitespace-nowrap", SECONDARY)}>
											{formatPersonShort(inv.invitedBy) || "---"}
										</td>
										<td className={TD}>
											<InvitationStatusBadge status={inv.status} />
										</td>
										<td className={cn(TD, SECONDARY)}>
											{inv.status === "COMPLETED" && inv.completedAt ? (
												<DateTimeInline value={inv.completedAt} />
											) : (
												"---"
											)}
										</td>
										<td className={TD}>
											{canExtendInvitation(inv.status) ? (
												<RaButton
													variant="ghost"
													size="small"
													title="Дахин урих"
													ariaLabel={`${fullName} — дахин урих`}
													className="font-medium text-[14px] text-Primary"
													onClick={() =>
														onReinvite({
															invitationId: inv.id,
															lastName: inv.lastName,
															firstName: inv.firstName,
															email: inv.email,
														})
													}
												/>
											) : (
												<RaButton
													variant="outline"
													size="small"
													title="Үр дүн"
													ariaLabel={`${fullName} — үр дүн`}
													className="!px-4 whitespace-nowrap"
													disabled={!isResultAvailable(inv.status)}
													disabledReason="Талент үнэлгээг эхлүүлээгүй байна"
													onClick={() => router.push(resultHref)}
													prefixIcon={<ResultsIcon className="size-4" />}
												/>
											)}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
			{totalElements > 0 && (
				<div className="flex flex-col gap-4 border-Stroke-600 border-t p-6 md:flex-row md:items-center md:justify-between">
					<p className="whitespace-nowrap font-medium text-[16px] text-TextColor-third leading-5">
						Нийт оролцогчид {totalElements}
					</p>
					<RaPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={onPageChange}
						pageSize={pageSize}
						onPageSizeChange={onPageSizeChange}
						className="md:mx-0 md:w-auto"
					/>
				</div>
			)}
		</div>
	);
}

export function SelectedTestsTable({
	tests,
	onViewDetail,
}: {
	tests: RecruitmentTest[];
	onViewDetail: (testId: string) => void;
}) {
	const muted = "text-center text-[14px] text-TextColor-third font-semibold";
	return (
		<div className={FRAME}>
			<div className="relative w-full overflow-auto">
				<table className="w-full min-w-[760px] caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className={HEAD_ROW}>
							<th scope="col" className={cn(TH, "w-[40px]")}>
								<span className="sr-only">№</span>
							</th>
							<th scope="col" className={TH}>
								Тестийн нэр
							</th>
							<th scope="col" className={cn(TH, "w-[200px]")}>
								Категори
							</th>
							<th scope="col" className={cn(TH, "w-[120px] text-center")}>
								Асуултын тоо
							</th>
							<th scope="col" className={cn(TH, "w-[120px] text-center")}>
								Хугацаа
							</th>
							<th scope="col" className={cn(TH, "w-[120px]")}>
								<span className="sr-only">Үйлдэл</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{tests.map((test, index) => (
							<tr key={test.id} className={cn(ROW, "text-TextColor-main")}>
								<td className={cn(TD, "text-[14px] text-TextColor-main")}>
									{index + 1}.
								</td>
								<td className={cn(TD, "font-semibold text-[14px]")}>
									{test.name || "---"}
								</td>
								<td className={TD}>
									<span className={muted}>{test.category || "---"}</span>
								</td>
								<td className={cn(TD, muted)}>{test.questionCount || 0}</td>
								<td className={cn(TD, muted)}>
									{minutesRangeOrDash(test.minMinutes, test.maxMinutes)}
								</td>
								<td className={cn(TD, "text-right")}>
									<RaButton
										title="Дэлгэрэнгүй"
										ariaLabel={`${test.name || "Тест"} — дэлгэрэнгүй`}
										variant="outline"
										size="small"
										className="!px-3"
										onClick={() => onViewDetail(test.id)}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export function CustomQuestionsTable({
	questions,
}: {
	questions: RecruitmentCustomQuestion[];
}) {
	return (
		<div className={FRAME}>
			<div className="relative w-full overflow-auto">
				<table className="w-full min-w-[560px] caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className={HEAD_ROW}>
							<th scope="col" className={cn(TH, "w-[40px]")}>
								<span className="sr-only">№</span>
							</th>
							<th scope="col" className={TH}>
								Асуулт
							</th>
							<th scope="col" className={cn(TH, "text-center")}>
								Хугацаа
							</th>
						</tr>
					</thead>
					<tbody>
						{questions.map((q, index) => (
							<tr key={q.id} className={cn(ROW, "text-TextColor-main")}>
								<td className={TD}>{index + 1}.</td>
								<td className={TD}>
									<p className="font-semibold text-[14px] text-TextColor-main">
										{q.content || "---"}
									</p>
									<p className="mt-1 text-[14px] text-TextColor-secondary leading-[140%]">
										{q.description || "---"}
									</p>
								</td>
								<td
									className={cn(
										TD,
										"whitespace-nowrap text-center font-medium text-[14px] text-TextColor-secondary",
									)}
								>
									{minutesRangeOrDash(q.minMinutes, q.maxMinutes)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
