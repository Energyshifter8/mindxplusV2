"use client";

import {
	ArrowLeft,
	BarChart3,
	CheckCircle,
	Info,
	Star,
	UserPlus,
	Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useState } from "react";
import {
	EmptyState,
	ErrorState,
	InvitationStatusBadge,
	MiniStatCard,
	RecruitmentStatusBadge,
	TableSkeleton,
	TestCategoryChip,
} from "@/components/shared/ListComponents";
import { Paginator } from "@/components/shared/Paginator";
import { getErrorMessage, isRetryableError } from "@/lib/api-errors";
import { isResultAvailable } from "@/lib/constants/roleAssessment";
import {
	formatDate,
	formatDateTime,
	formatMinutesRange,
	formatPersonShort,
	sumMinutes,
} from "@/lib/format";
import {
	useRecruitmentDetail,
	useRecruitmentInvitations,
} from "@/lib/hooks/role-assessment/queries";
import { usePageParams } from "@/lib/hooks/usePageParams";
import { toApiPage } from "@/lib/pagination";
import type {
	RecruitmentDetail,
	RecruitmentInvitation,
	RecruitmentTest,
} from "@/lib/types/role-assessment";

const RecruitmentDetailDrawer = lazy(
	() => import("@/components/recruitments/RecruitmentDetailDrawer"),
);
const TestDetailDrawer = lazy(
	() => import("@/components/recruitments/TestDetailDrawer"),
);

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;
const CONDENSED = { fontFamily: "'Barlow Condensed', sans-serif" } as const;

const TH_CLASS =
	"py-2.5 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap";
const TD_CLASS = "py-3 px-3 text-xs text-foreground/80";

// Урих / дахин урих (ФАЗ 5) хараахан байхгүй
const COMING_SOON_TITLE = "Удахгүй нэмэгдэнэ";

/** Нэг талентийн үнэлгээний dashboard (staging: /role-assessment/{id}/dashboard). Зөвхөн унших. */
export default function RecruitmentDashboardPage() {
	return (
		<Suspense
			fallback={
				<div className="p-6 lg:p-10">
					<TableSkeleton columnCount={8} />
				</div>
			}
		>
			<RecruitmentDashboardContent />
		</Suspense>
	);
}

function RecruitmentDashboardContent() {
	const params = useParams();
	const router = useRouter();
	const recruitmentId = params?.id as string | undefined;
	const [showDetail, setShowDetail] = useState(false);
	const [openTest, setOpenTest] = useState<RecruitmentTest | null>(null);

	const detailQuery = useRecruitmentDetail(recruitmentId);
	const detail = detailQuery.data;

	return (
		<div className="min-h-full w-full">
			<div className="p-6 lg:p-10">
				{/* Breadcrumb */}
				<div
					className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2"
					style={MONO}
				>
					<button
						type="button"
						className="hover:text-primary cursor-pointer transition-colors"
						onClick={() => router.push("/dashboard")}
					>
						Хяналтын самбар
					</button>
					<span className="mx-2">/</span>
					<button
						type="button"
						className="hover:text-primary cursor-pointer transition-colors"
						onClick={() => router.push("/dashboard/recruitments")}
					>
						Талентийн үнэлгээ
					</button>
					<span className="mx-2">/</span>
					<span className="text-foreground">
						{detail?.name ?? (detailQuery.isLoading ? "…" : "—")}
					</span>
				</div>

				{detailQuery.isLoading ? (
					<div className="animate-pulse space-y-6 mt-6">
						<div className="h-8 w-64 bg-muted" />
						<div className="h-4 w-80 bg-muted" />
						<div className="h-64 bg-muted mt-8" />
					</div>
				) : detailQuery.isError || !detail ? (
					// Алдаатай үед (жишээ нь 404) урих/хаах үйлдлүүдийг огт харуулахгүй
					<div className="mt-6 border-2 border-border bg-card">
						<ErrorState
							text={getErrorMessage(
								detailQuery.error,
								"Талентийн үнэлгээний мэдээлэл авахад алдаа гарлаа",
							)}
							onRetry={
								isRetryableError(detailQuery.error)
									? () => detailQuery.refetch()
									: undefined
							}
							isRetrying={detailQuery.isFetching}
						/>
					</div>
				) : (
					<>
						<DashboardHeader
							detail={detail}
							onBack={() => router.push("/dashboard/recruitments")}
							onShowDetail={() => setShowDetail(true)}
						/>
						<DashboardStats detail={detail} />
						<InvitationsSection recruitmentId={detail.id} />
						<TestsSection tests={detail.tests} onOpenTest={setOpenTest} />
						<CustomQuestionsSection detail={detail} />
					</>
				)}
			</div>

			{showDetail && recruitmentId && (
				<Suspense fallback={null}>
					<RecruitmentDetailDrawer
						recruitmentId={recruitmentId}
						onClose={() => setShowDetail(false)}
					/>
				</Suspense>
			)}

			{openTest && (
				<Suspense fallback={null}>
					<TestDetailDrawer
						catalogTestId={openTest.id}
						fallbackName={openTest.name}
						onClose={() => setOpenTest(null)}
					/>
				</Suspense>
			)}
		</div>
	);
}

function DashboardHeader({
	detail,
	onBack,
	onShowDetail,
}: {
	detail: RecruitmentDetail;
	onBack: () => void;
	onShowDetail: () => void;
}) {
	const totalTime = sumMinutes(detail.tests);

	return (
		<div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-start lg:justify-between">
			<div className="flex items-start gap-4 min-w-0">
				<button
					type="button"
					onClick={onBack}
					aria-label="Жагсаалт руу буцах"
					className="flex items-center justify-center w-8 h-8 border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors shrink-0"
				>
					<ArrowLeft size={16} />
				</button>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<h1
							className="text-[clamp(1.2rem,3vw,1.8rem)] font-black uppercase leading-none text-foreground break-words"
							style={CONDENSED}
						>
							{detail.name}
						</h1>
						<RecruitmentStatusBadge status={detail.status} />
					</div>
					<div
						className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"
						style={MONO}
					>
						<span>Үүсгэсэн: {formatDateTime(detail.createdAt)}</span>
						<Chip>{detail.tests.length} Тест</Chip>
						<Chip>{detail.customQuestions.length} Нэмэлт асуулт</Chip>
						{/* bundle-derived, unverified: нийт хугацаанд нэмэлт асуулт орох эсэх */}
						<Chip>{formatMinutesRange(totalTime.min, totalTime.max)} мин</Chip>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0">
				<button
					type="button"
					onClick={onShowDetail}
					className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
					style={MONO}
				>
					<Info size={12} />
					Дэлгэрэнгүй
				</button>
				{detail.status === "PUBLISHED" && (
					<button
						type="button"
						disabled
						title={COMING_SOON_TITLE}
						className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
						style={MONO}
					>
						<UserPlus size={12} />
						Талент урих
					</button>
				)}
			</div>
		</div>
	);
}

function Chip({ children }: { children: React.ReactNode }) {
	return (
		<span className="border border-border px-2 py-0.5 text-foreground/80">
			{children}
		</span>
	);
}

function DashboardStats({ detail }: { detail: RecruitmentDetail }) {
	const { total, completed } = detail.count;
	const rate = total > 0 ? `${Math.round((completed / total) * 100)}%` : "—";

	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
			<MiniStatCard
				label="Нийт урьсан"
				value={String(total)}
				icon={<Users size={14} />}
			/>
			<MiniStatCard
				label="Дуусгасан"
				value={String(completed)}
				icon={<CheckCircle size={14} />}
			/>
			<MiniStatCard
				label="Дуусгах хувь"
				value={rate}
				icon={<BarChart3 size={14} />}
			/>
		</div>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2
			className="mb-3 text-lg font-black uppercase text-foreground"
			style={CONDENSED}
		>
			{children}
		</h2>
	);
}

const INVITATION_COLUMNS = [
	{ key: "no", label: "№", width: "40px" },
	{ key: "name", label: "Нэр" },
	{ key: "rating", label: "Үнэлгээ", width: "80px" },
	{ key: "sent", label: "Илгээсэн огноо", width: "120px" },
	{ key: "invitedBy", label: "Урьсан", width: "120px" },
	{ key: "status", label: "Төлөв", width: "130px" },
	{ key: "completed", label: "Бөглөсөн огноо", width: "120px" },
	{ key: "result", label: "Үр дүн", width: "110px" },
];

function InvitationsSection({ recruitmentId }: { recruitmentId: string }) {
	const { page, size, setPage, setSize } = usePageParams();
	const query = useRecruitmentInvitations(
		recruitmentId,
		toApiPage({ page, size }),
	);
	const pageData = query.data;
	const rows = pageData?.content ?? [];
	const rowOffset = pageData ? pageData.number * pageData.size : 0;

	// page > totalPages бол сүүлийн хуудас руу
	useEffect(() => {
		if (!pageData || query.isPlaceholderData) return;
		const lastPage = Math.max(1, pageData.totalPages);
		if (page > lastPage) setPage(lastPage);
	}, [pageData, query.isPlaceholderData, page, setPage]);

	return (
		<section className="mb-10">
			<SectionTitle>Уригдсан талентууд</SectionTitle>
			<div className="border-2 border-border bg-card overflow-hidden">
				{query.isLoading ? (
					<TableSkeleton columnCount={INVITATION_COLUMNS.length} />
				) : query.isError ? (
					<ErrorState
						text={getErrorMessage(
							query.error,
							"Уригдсан талентуудын жагсаалт авахад алдаа гарлаа",
						)}
						onRetry={
							isRetryableError(query.error) ? () => query.refetch() : undefined
						}
						isRetrying={query.isFetching}
					/>
				) : rows.length === 0 ? (
					<EmptyState text="Оролцогч байхгүй байна" />
				) : (
					<>
						<div
							className={`overflow-x-auto transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`}
						>
							<table className="w-full text-left" style={{ minWidth: "100%" }}>
								<thead>
									<tr className="border-b-2 border-border">
										{INVITATION_COLUMNS.map((col) => (
											<th
												key={col.key}
												className={TH_CLASS}
												style={{ ...MONO, width: col.width }}
											>
												{col.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{rows.map((row, i) => (
										<InvitationRow
											key={row.id}
											row={row}
											index={rowOffset + i + 1}
										/>
									))}
								</tbody>
							</table>
						</div>
						<Paginator
							page={page}
							totalPages={pageData?.totalPages ?? 0}
							totalElements={pageData?.totalElements ?? 0}
							size={size}
							onPageChange={setPage}
							onSizeChange={setSize}
							totalLabel="Нийт оролцогчид"
						/>
					</>
				)}
			</div>
		</section>
	);
}

function InvitationRow({
	row,
	index,
}: {
	row: RecruitmentInvitation;
	index: number;
}) {
	const router = useRouter();
	const fullName = [row.lastName, row.firstName].filter(Boolean).join(" ");
	const resultHref = `/dashboard/recruitments/${row.recruitmentId}/results/${row.id}`;

	return (
		<tr className="border-b border-border/50 hover:border-l-2 hover:border-l-primary transition-colors duration-100">
			<td className={`${TD_CLASS} whitespace-nowrap`} style={MONO}>
				{index}
			</td>
			<td className={`${TD_CLASS} max-w-[240px]`} style={MONO}>
				{/* Staging: нэр дээр дарахад (статусаас үл хамааран) үр дүн рүү */}
				<button
					type="button"
					onClick={() => router.push(resultHref)}
					className="block max-w-full truncate text-left text-foreground hover:text-primary transition-colors"
					title={fullName}
				>
					{fullName || "—"}
				</button>
				<div
					className="truncate text-[10px] text-muted-foreground"
					title={row.email}
				>
					{row.email}
				</div>
			</td>
			<td className={`${TD_CLASS} whitespace-nowrap`} style={MONO}>
				<RatingCell points={row.ratingPoints} />
			</td>
			<td className={`${TD_CLASS} whitespace-nowrap`} style={MONO}>
				{formatDate(row.createdAt)}
			</td>
			<td className={`${TD_CLASS} whitespace-nowrap`} style={MONO}>
				{formatPersonShort(row.invitedBy)}
			</td>
			<td className="py-3 px-3">
				<InvitationStatusBadge status={row.status} />
			</td>
			<td className={`${TD_CLASS} whitespace-nowrap`} style={MONO}>
				{row.status === "COMPLETED" ? formatDate(row.completedAt) : "—"}
			</td>
			<td className="py-3 px-3">
				{row.status === "EXPIRED" ? (
					<button
						type="button"
						disabled
						title={COMING_SOON_TITLE}
						className="px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
						style={MONO}
					>
						Дахин урих
					</button>
				) : (
					// Staging: зөвхөн COMPLETED / STARTED үед идэвхтэй (bundle ✅)
					<button
						type="button"
						disabled={!isResultAvailable(row.status)}
						onClick={() => router.push(resultHref)}
						className="px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary/10 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent whitespace-nowrap"
						style={MONO}
					>
						Үр дүн
					</button>
				)}
			</td>
		</tr>
	);
}

// ratingPoints (#14): rated=true үед л ирнэ (✅), байхгүй бол "—"
function RatingCell({ points }: { points: number | null | undefined }) {
	if (typeof points !== "number" || points <= 0) {
		return <span className="text-muted-foreground">—</span>;
	}
	return (
		<span className="inline-flex items-center gap-1 text-yellow-500">
			<Star size={11} className="fill-yellow-500" />
			{Number.isInteger(points) ? points : points.toFixed(1)}
		</span>
	);
}

function TestsSection({
	tests,
	onOpenTest,
}: {
	tests: RecruitmentTest[];
	onOpenTest: (test: RecruitmentTest) => void;
}) {
	return (
		<section className="mb-10">
			<SectionTitle>Сонгосон тестүүд</SectionTitle>
			<div className="border-2 border-border bg-card overflow-hidden">
				{tests.length === 0 ? (
					<EmptyState text="Тест сонгоогүй байна" />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left" style={{ minWidth: "100%" }}>
							<thead>
								<tr className="border-b-2 border-border">
									{[
										{ key: "name", label: "Тестийн нэр" },
										{ key: "category", label: "Категори", width: "180px" },
										{ key: "questions", label: "Асуултын тоо", width: "120px" },
										{ key: "time", label: "Хугацаа", width: "100px" },
										{ key: "actions", label: "", width: "120px" },
									].map((col) => (
										<th
											key={col.key}
											className={TH_CLASS}
											style={{ ...MONO, width: col.width }}
										>
											{col.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{tests.map((test) => (
									<tr key={test.id} className="border-b border-border/50">
										<td className={TD_CLASS}>
											<div className="font-bold text-foreground">
												{test.name}
											</div>
											{test.description && (
												<div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
													{test.description}
												</div>
											)}
										</td>
										<td className="py-3 px-3">
											<TestCategoryChip
												color={test.color}
												label={test.category}
											/>
										</td>
										<td
											className={`${TD_CLASS} whitespace-nowrap`}
											style={MONO}
										>
											{test.questionCount}
										</td>
										<td
											className={`${TD_CLASS} whitespace-nowrap`}
											style={MONO}
										>
											{formatMinutesRange(test.minMinutes, test.maxMinutes)} мин
										</td>
										<td className="py-3 px-3">
											<button
												type="button"
												onClick={() => onOpenTest(test)}
												className="px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
												style={MONO}
											>
												Дэлгэрэнгүй
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}

function CustomQuestionsSection({ detail }: { detail: RecruitmentDetail }) {
	return (
		<section className="mb-10">
			<SectionTitle>Нэмэлт асуултууд</SectionTitle>
			<div className="border-2 border-border bg-card overflow-hidden">
				{detail.customQuestions.length === 0 ? (
					<EmptyState text="Нэмэлт асуулт сонгоогүй байна" />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left" style={{ minWidth: "100%" }}>
							<thead>
								<tr className="border-b-2 border-border">
									<th className={TH_CLASS} style={MONO}>
										Асуулт
									</th>
									<th className={TH_CLASS} style={{ ...MONO, width: "100px" }}>
										Хугацаа
									</th>
								</tr>
							</thead>
							<tbody>
								{detail.customQuestions.map((question) => (
									<tr key={question.id} className="border-b border-border/50">
										<td className={TD_CLASS}>
											<div className="text-foreground">{question.content}</div>
											{question.description && (
												<div className="mt-0.5 text-[11px] text-muted-foreground">
													{question.description}
												</div>
											)}
										</td>
										<td
											className={`${TD_CLASS} whitespace-nowrap`}
											style={MONO}
										>
											{formatMinutesRange(
												question.minMinutes,
												question.maxMinutes,
											)}{" "}
											мин
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}
