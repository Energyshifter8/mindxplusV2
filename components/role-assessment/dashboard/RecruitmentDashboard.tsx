"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	CalendarSmallIcon,
	DetailIcon,
	PlusIcon,
} from "@/components/icons/role-assessment";
import {
	InviteTalentModal,
	type ReinviteTarget,
} from "@/components/role-assessment/InviteTalentModal";
import { RecruitmentDetailDrawer } from "@/components/role-assessment/RecruitmentDetailDrawer";
import { TestDetailDrawer } from "@/components/role-assessment/TestDetailDrawer";
import {
	AntdSkeleton,
	ErrorState,
	RecruitmentStatusPill,
	SkeletonBlock,
} from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaConfirmDialog } from "@/components/role-assessment/ui/Modal";
import { getErrorMessage, isApiErrorCode } from "@/lib/api-errors";
import {
	canCloseRecruitment,
	canInviteToRecruitment,
} from "@/lib/constants/roleAssessment";
import { formatDateBullet, minutesRangeOrDash } from "@/lib/format";
import { useCloseRecruitment } from "@/lib/hooks/role-assessment/mutations";
import {
	useRecruitmentDetail,
	useRecruitmentInvitations,
} from "@/lib/hooks/role-assessment/queries";
import {
	RA_TITLES,
	useDocumentTitle,
} from "@/lib/hooks/role-assessment/useDocumentTitle";
import { usePageParams } from "@/lib/hooks/usePageParams";
import { toApiPage } from "@/lib/pagination";
import { raRoutes } from "@/lib/routes";
import {
	CustomQuestionsTable,
	InvitationsTable,
	SelectedTestsTable,
} from "./DashboardTables";
import { PlanExpiredModal } from "./PlanExpiredModal";

// Staging /role-assessment/{id}/dashboard (📦 module 34795). GET: detail
// (/customer/recruitments/{id}) ба урилгууд (/customer/hiring-invitations/list/{id}).
// Зөрүү (mismatches.md): хуудаслалт URL-д; хайлт API-д байхгүй тул байхгүй; урих/хаах
// товч зөвхөн PUBLISHED үед идэвхтэй; ачаалал/алдааны төлөв тусдаа.

const SECTION_TITLE =
	"mb-5 font-medium text-base text-TextColor-main leading-5";
const CHIP = "rounded-lg bg-Gray-50 px-3 py-1 font-medium";
const INACTIVE_REASON = "Зөвхөн нийтлэгдсэн талентийн үнэлгээнд боломжтой";

export function RecruitmentDashboard({
	recruitmentId,
}: {
	recruitmentId: string;
}) {
	const id = recruitmentId;
	useDocumentTitle(RA_TITLES.dashboard);
	const { page, size, setPage, setSize } = usePageParams();
	const [inviteOpen, setInviteOpen] = useState(false);
	const [reinvite, setReinvite] = useState<ReinviteTarget | null>(null);
	const [testId, setTestId] = useState<string | null>(null);
	const [confirmClose, setConfirmClose] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const [planNoticeClosed, setPlanNoticeClosed] = useState(false);

	const detail = useRecruitmentDetail(id);
	const invitations = useRecruitmentInvitations(id, toApiPage({ page, size }));
	const closeMutation = useCloseRecruitment();

	// Staging: plan_expired → modal, бусад алдаа → toast
	const planExpired = isApiErrorCode(detail.error, "plan_expired");
	useEffect(() => {
		const error = detail.error;
		if (!error || isApiErrorCode(error, "plan_expired")) return;
		toast.error(getErrorMessage(error, "Мэдээлэл татахад алдаа гарлаа."));
	}, [detail.error]);

	const data = detail.data;
	const status = data?.status;
	const name = data?.name || "---";
	const rawTests = data?.tests;
	const rawQuestions = data?.customQuestions;
	const tests = useMemo(
		() => (Array.isArray(rawTests) ? rawTests : []),
		[rawTests],
	);
	const questions = useMemo(
		() => (Array.isArray(rawQuestions) ? rawQuestions : []),
		[rawQuestions],
	);
	const totalDuration = useMemo(() => {
		let min = 0;
		let max = 0;
		for (const t of tests) {
			min += t.minMinutes || 0;
			max += t.maxMinutes || 0;
		}
		return minutesRangeOrDash(min, max, "мин");
	}, [tests]);

	const pageData = invitations.data;
	const rows = pageData?.content ?? [];
	const totalPages = Math.max(1, pageData?.totalPages ?? 1);
	const totalElements = pageData?.totalElements ?? rows.length;

	return (
		<div className="mx-auto min-h-screen bg-white">
			<div className="sticky top-[var(--ra-banner-h,0px)] z-10 flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-Stroke-700 border-b bg-white px-4 py-3 md:px-6">
				<p className="font-semibold text-[24px] text-TextColor-main leading-[140%]">
					Талентийн үнэлгээ
				</p>
				{status !== undefined && status !== "CLOSED" && (
					<div className="flex flex-wrap items-center gap-2">
						<RaButton
							variant="secondary"
							title="Талент үнэлгээ хаах"
							onClick={() => setConfirmClose(true)}
							disabled={!canCloseRecruitment(status)}
							disabledReason={INACTIVE_REASON}
						/>
						<RaButton
							title="Талент урих"
							prefixIcon={<PlusIcon />}
							onClick={() => setInviteOpen(true)}
							disabled={!canInviteToRecruitment(status)}
							disabledReason={INACTIVE_REASON}
						/>
					</div>
				)}
			</div>

			<div className="border-Stroke-700 border-b bg-white p-4 md:p-6">
				<nav
					aria-label="Замын заалт"
					className="flex min-w-0 items-center gap-2 font-medium text-[14px] text-TextColor-third leading-[140%]"
				>
					<Link
						href={raRoutes.list()}
						className="shrink-0 rounded-sm outline-none transition-colors hover:text-TextColor-secondary focus-visible:ring-2 focus-visible:ring-Primary/40"
					>
						Талентийн үнэлгээ үүсгэх
					</Link>
					<span aria-hidden="true">/</span>
					<span
						aria-current="page"
						className="truncate text-TextColor-secondary"
					>
						{detail.isPending ? "..." : name}
					</span>
				</nav>
				<div className="mt-5 flex items-start justify-between">
					{detail.isPending ? (
						<div
							className="flex w-full max-w-[420px] flex-col gap-3"
							aria-busy="true"
						>
							<span className="sr-only">Ачааллаж байна...</span>
							<SkeletonBlock className="h-8 w-3/4" />
							<SkeletonBlock className="h-9 w-32" />
							<SkeletonBlock className="h-5 w-48" />
						</div>
					) : detail.isError ? (
						<ErrorState
							className="w-full py-6"
							message={getErrorMessage(
								detail.error,
								"Мэдээлэл татахад алдаа гарлаа.",
							)}
							onRetry={() => detail.refetch()}
							retrying={detail.isFetching}
						/>
					) : (
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-3">
								<h1 className="break-words font-bold text-[24px] text-TextColor-main leading-[140%]">
									{name}
								</h1>
								<RecruitmentStatusPill status={status} />
							</div>
							<RaButton
								variant="outline"
								size="small"
								className="mt-2 w-fit"
								prefixIcon={<DetailIcon />}
								title="Дэлгэрэнгүй"
								onClick={() => setDetailOpen(true)}
							/>
							<div className="mt-2 flex items-center gap-1 font-medium text-[14px] text-TextColor-secondary">
								<CalendarSmallIcon />
								<span>
									<span className="sr-only">Нийтэлсэн огноо: </span>
									{formatDateBullet(data?.publishedAt)}
								</span>
							</div>
							<div className="mt-2 flex flex-wrap items-center gap-1 font-medium text-[14px] text-TextColor-secondary leading-5">
								<span className={CHIP}>{tests.length} Тест</span>
								<span className={CHIP}>{questions.length} Нэмэлт асуулт</span>
								<span className={CHIP}>{totalDuration}</span>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="bg-white p-4 md:p-6">
				<section className="mb-8" aria-labelledby="ra-invited-title">
					<h2 id="ra-invited-title" className={SECTION_TITLE}>
						Уригдсан талентууд
					</h2>
					{invitations.isPending ? (
						<div className="rounded-[16px] border border-Stroke-600 p-6">
							<AntdSkeleton rows={4} />
						</div>
					) : invitations.isError ? (
						<div className="rounded-[16px] border border-Stroke-600">
							<ErrorState
								message={getErrorMessage(
									invitations.error,
									"Урилгын жагсаалт татахад алдаа гарлаа",
								)}
								onRetry={() => invitations.refetch()}
								retrying={invitations.isFetching}
							/>
						</div>
					) : (
						<InvitationsTable
							recruitmentId={id}
							invitations={rows}
							currentPage={page}
							pageSize={size}
							totalPages={totalPages}
							totalElements={totalElements}
							onPageChange={setPage}
							onPageSizeChange={setSize}
							onReinvite={setReinvite}
						/>
					)}
				</section>
				{tests.length > 0 && (
					<section className="mb-8" aria-labelledby="ra-tests-title">
						<h2 id="ra-tests-title" className={SECTION_TITLE}>
							Сонгосон тестүүд
						</h2>
						<SelectedTestsTable tests={tests} onViewDetail={setTestId} />
					</section>
				)}
				{questions.length > 0 && (
					<section className="mb-8" aria-labelledby="ra-questions-title">
						<h2 id="ra-questions-title" className={SECTION_TITLE}>
							Нэмэлт асуултууд
						</h2>
						<CustomQuestionsTable questions={questions} />
					</section>
				)}
			</div>

			<InviteTalentModal
				open={inviteOpen}
				onClose={() => setInviteOpen(false)}
				recruitmentId={id}
			/>
			<InviteTalentModal
				open={reinvite !== null}
				onClose={() => setReinvite(null)}
				recruitmentId={id}
				reinvite={reinvite}
			/>
			<TestDetailDrawer testId={testId} onClose={() => setTestId(null)} />
			<PlanExpiredModal
				open={planExpired && !planNoticeClosed}
				onClose={() => setPlanNoticeClosed(true)}
			/>
			<RaConfirmDialog
				open={confirmClose}
				onClose={() => setConfirmClose(false)}
				onConfirm={() =>
					closeMutation.mutate(id, {
						onSuccess: () => setConfirmClose(false),
					})
				}
				title="Талентийн үнэлгээг хаахдаа итгэлтэй байна уу?"
				description="Хаасны дараа талентуудад урилга илгээх боломжгүй болно. Та хаах уу?"
				confirmLabel="Хаах"
				pendingLabel="Хааж байна..."
				loading={closeMutation.isPending}
			/>
			<RecruitmentDetailDrawer
				recruitment={detailOpen ? { id, name } : null}
				onClose={() => setDetailOpen(false)}
			/>
		</div>
	);
}
