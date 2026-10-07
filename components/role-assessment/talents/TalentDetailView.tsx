"use client";

import { Bookmark, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResultsIcon } from "@/components/icons/role-assessment";
import { InvitationStatusBadge } from "@/components/role-assessment/dashboard/InvitationStatusBadge";
import {
	AntdSkeleton,
	DateTimeInline,
	ErrorState,
} from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaPagination } from "@/components/role-assessment/ui/Pagination";
import { getErrorMessage } from "@/lib/api-errors";
import { isResultAvailable } from "@/lib/constants/roleAssessment";
import { formatDateBullet, formatPersonShort } from "@/lib/format";
import {
	useTalentDetail,
	useTalentInvitations,
} from "@/lib/hooks/role-assessment/queries";
import {
	RA_TITLES,
	useDocumentTitle,
} from "@/lib/hooks/role-assessment/useDocumentTitle";
import { talentDisplayName } from "@/lib/role-assessment/talents";
import { raRoutes } from "@/lib/routes";
import type { TalentInvitationItem } from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";

// Staging /invited-talents/{talentId} (📦 module 34355). GET: профайл
// (/customer/hiring-invitations/talents/{id}), урилгын түүх (…/{id}/invitations).
// Хуудаслалт staging шиг state-д (`[10, 12, 20, 50]`). Bookmark зөвхөн төлөв харуулна.

const TITLE = "Миний урьсан талент";
const HISTORY_PAGE_SIZES = [10, 12, 20, 50] as const;

const TH =
	"h-10 px-2 py-3 text-left align-middle font-medium text-[14px] text-TextColor-main leading-[1.4] tracking-[0.2px]";
const CELL =
	"font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]";

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

function HistoryTable({
	invitations,
	currentPage,
	pageSize,
	totalPages,
	totalElements,
	onPageChange,
	onPageSizeChange,
	onOpenResult,
}: {
	invitations: TalentInvitationItem[];
	currentPage: number;
	pageSize: number;
	totalPages: number;
	totalElements: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	onOpenResult: (recruitmentId: string, invitationId: string) => void;
}) {
	return (
		<div className="overflow-hidden rounded-2xl border border-Stroke-700">
			<div className="relative w-full overflow-auto">
				<table className="w-full min-w-[1160px] caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className="border-Stroke-700 border-b bg-Gray-50">
							<th scope="col" className={cn(TH, "w-[56px] text-center")}>
								№
							</th>
							<th scope="col" className={cn(TH, "w-[280px]")}>
								Ажлын байр
							</th>
							<th scope="col" className={cn(TH, "w-[360px]")}>
								Ашигласан тестүүд
							</th>
							<th scope="col" className={cn(TH, "w-[180px]")}>
								Урьсан
							</th>
							<th scope="col" className={cn(TH, "w-[190px]")}>
								Төлөв
							</th>
							<th scope="col" className={cn(TH, "w-[150px]")}>
								Бөглөсөн
							</th>
							<th scope="col" className={cn(TH, "w-[110px]")}>
								Үнэлгээ
							</th>
							<th scope="col" className={cn(TH, "w-[140px]")}>
								<span className="sr-only">Үйлдэл</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{invitations.length === 0 ? (
							<tr>
								<td
									colSpan={8}
									className="p-2 py-12 text-center text-[14px] text-TextColor-third"
								>
									Урилгын түүх байхгүй
								</td>
							</tr>
						) : (
							invitations.map((inv, index) => (
								<tr
									key={inv.id}
									className="border-Stroke-700 border-b transition-colors last:border-0 hover:bg-Primary-softBg"
								>
									<td className="p-2 py-4 text-center font-medium text-[14px] text-TextColor-main leading-[1.4] tracking-[0.2px]">
										{(currentPage - 1) * pageSize + index + 1}.
									</td>
									<td className="max-w-[400px] overflow-hidden text-ellipsis whitespace-nowrap p-2 py-4">
										<p className="font-semibold text-[14px] text-TextColor-main leading-[1.4] tracking-[0.2px]">
											{inv.recruitmentName}
										</p>
										<p className={cn("mt-1", CELL)}>
											{formatDateBullet(inv.createdAt)}
										</p>
									</td>
									<td className={cn("p-2 py-4", CELL)}>
										{inv.tests.length > 0 ? inv.tests.join(", ") : "---"}
									</td>
									<td className={cn("whitespace-nowrap p-2 py-4", CELL)}>
										{formatPersonShort(inv.invitedBy) || "---"}
									</td>
									<td className="p-2 py-4">
										<InvitationStatusBadge status={inv.status} />
									</td>
									<td className={cn("p-2 py-4", CELL)}>
										{inv.status === "COMPLETED" && inv.completedAt ? (
											<DateTimeInline value={inv.completedAt} />
										) : (
											"---"
										)}
									</td>
									<td className="p-2">
										<RatingCell rated={inv.rated} points={inv.ratingPoints} />
									</td>
									<td className="p-2 py-4 text-center">
										<RaButton
											variant="outline"
											size="small"
											title="Үр дүн"
											ariaLabel={`${inv.recruitmentName} — үр дүн`}
											prefixIcon={<ResultsIcon className="size-4" />}
											className="!h-9 !px-4 whitespace-nowrap"
											disabled={!isResultAvailable(inv.status)}
											disabledReason="Талент үнэлгээг эхлүүлээгүй байна"
											onClick={() => onOpenResult(inv.recruitmentId, inv.id)}
										/>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			{totalElements > 0 ? (
				<div className="flex justify-end border-Stroke-700 border-t p-6">
					<RaPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={onPageChange}
						pageSize={pageSize}
						onPageSizeChange={onPageSizeChange}
						pageSizeOptions={HISTORY_PAGE_SIZES}
						className="sm:mx-0 sm:w-auto"
					/>
				</div>
			) : null}
		</div>
	);
}

export function TalentDetailView({ talentId }: { talentId: string }) {
	useDocumentTitle(RA_TITLES.talent);
	const router = useRouter();
	const id = talentId.trim();
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(10);
	const profile = useTalentDetail(id || undefined);
	const history = useTalentInvitations(id || undefined, {
		page: page - 1,
		size,
	});

	// Staging: алдаа бүрт toast
	useEffect(() => {
		if (profile.errorUpdatedAt)
			toast.error(
				getErrorMessage(profile.error, "Мэдээлэл авахад алдаа гарлаа"),
			);
	}, [profile.errorUpdatedAt, profile.error]);
	useEffect(() => {
		if (history.errorUpdatedAt)
			toast.error(
				getErrorMessage(history.error, "Урилгын түүх авахад алдаа гарлаа"),
			);
	}, [history.errorUpdatedAt, history.error]);

	if (!id) {
		return (
			<div className="min-h-screen bg-white p-6 font-sf">
				<p className="text-TextColor-secondary">Буруу холбоос.</p>
			</div>
		);
	}

	const talent = profile.data;
	const name = talent ? talentDisplayName(talent) : "—";
	const initial = name.trim() ? name.trim()[0].toUpperCase() : "?";
	const phone = talent?.phoneNumber?.trim() ?? "";
	const email = talent?.email?.trim() ?? "";
	const rows = history.data?.content ?? [];
	const totalPages = Math.max(1, history.data?.totalPages ?? 1);
	const totalElements = history.data?.totalElements ?? rows.length;

	return (
		<div className="min-h-screen bg-white pb-12 font-sf">
			<div className="sticky top-[var(--ra-banner-h,0px)] z-10 flex h-[72px] items-center border-Stroke-700 border-b bg-white px-4 md:px-6">
				<div className="mx-auto w-full">
					<p className="font-semibold text-[24px] text-TextColor-main leading-[1.4]">
						{TITLE}
					</p>
				</div>
			</div>
			<div className="mx-auto max-w-[2000px] px-4 py-6 md:px-6">
				{profile.isPending || history.isPending ? (
					<AntdSkeleton className="mt-2" rows={3} />
				) : profile.isError ? (
					<ErrorState
						message={getErrorMessage(
							profile.error,
							"Мэдээлэл авахад алдаа гарлаа",
						)}
						onRetry={() => profile.refetch()}
						retrying={profile.isFetching}
					/>
				) : talent ? (
					<>
						<nav
							aria-label="Замын заалт"
							className="mb-6 flex flex-wrap items-center gap-2 font-medium text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]"
						>
							<Link
								href={raRoutes.talents()}
								className="rounded-sm outline-none transition-colors hover:text-Primary focus-visible:ring-2 focus-visible:ring-Primary/40"
							>
								{TITLE}
							</Link>
							<span aria-hidden="true">/</span>
							<span aria-current="page" className="text-TextColor-secondary">
								{name}
							</span>
						</nav>
						<div className="flex items-center gap-4">
							<div
								aria-hidden="true"
								className="flex size-16 shrink-0 items-center justify-center rounded-full bg-Primary font-bold text-[28px] text-white"
							>
								{initial}
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<h1 className="font-bold text-[24px] text-TextColor-main leading-[1.4]">
										{name}
									</h1>
									<Bookmark
										aria-hidden="true"
										className={cn(
											"size-5 shrink-0 text-Primary",
											talent.marked && "fill-Primary",
										)}
									/>
									<span className="sr-only">
										{talent.marked ? "Хадгалсан" : "Хадгалаагүй"}
									</span>
								</div>
								<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]">
									{phone ? (
										<span className="whitespace-nowrap">{phone}</span>
									) : null}
									{phone && email ? <span aria-hidden="true">•</span> : null}
									{email ? (
										<span className="min-w-0 break-all">{email}</span>
									) : null}
								</div>
							</div>
						</div>
						<section className="mt-10" aria-labelledby="ra-talent-history">
							<h2
								id="ra-talent-history"
								className="mb-5 font-bold text-[16px] text-TextColor-main leading-5 tracking-[0.2px]"
							>
								Урилгын түүх
							</h2>
							{history.isError ? (
								<div className="rounded-2xl border border-Stroke-700">
									<ErrorState
										message={getErrorMessage(
											history.error,
											"Урилгын түүх авахад алдаа гарлаа",
										)}
										onRetry={() => history.refetch()}
										retrying={history.isFetching}
									/>
								</div>
							) : (
								<HistoryTable
									invitations={rows}
									currentPage={page}
									pageSize={size}
									totalPages={totalPages}
									totalElements={totalElements}
									onPageChange={setPage}
									onPageSizeChange={(next) => {
										setSize(next);
										setPage(1);
									}}
									onOpenResult={(recruitmentId, invitationId) =>
										router.push(raRoutes.result(recruitmentId, invitationId))
									}
								/>
							)}
						</section>
					</>
				) : (
					<p className="py-16 text-center text-[16px] text-TextColor-third">
						Талент олдсонгүй
					</p>
				)}
			</div>
		</div>
	);
}
