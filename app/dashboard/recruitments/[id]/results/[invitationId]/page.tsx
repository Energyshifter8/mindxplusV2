"use client";

import {
	ArrowLeft,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Copy,
	Download,
	FileText,
	NotebookPen,
	ShieldCheck,
	Star,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import {
	ErrorState,
	InvitationStatusBadge,
} from "@/components/shared/ListComponents";
import type {
	Assessment,
	CustomQuestionAnswer,
	InvitationResult,
	TestResult,
} from "@/lib/api";
import { getErrorMessage, isRetryableError } from "@/lib/api-errors";
import {
	DATA_QUALITY,
	DATA_QUALITY_UNKNOWN,
	type DataQualityTone,
	INVITATION_STATUS_LABELS,
	isInvitationStatus,
	PROCTORING_EVENTS,
} from "@/lib/constants/roleAssessment";
import {
	formatDateTime,
	formatDurationSeconds,
	formatPersonShort,
	formatPoints,
	formatSpendingTime,
} from "@/lib/format";
import { useDownloadTestReport } from "@/lib/hooks/useDownloadTestReport";
import {
	useInvitationNames,
	useInvitationNotes,
	useInvitationRate,
	useInvitationResult,
	useRecruitmentDetail,
} from "@/lib/hooks/useRecruitmentQueries";

const TestReportDrawer = lazy(
	() => import("@/components/recruitments/TestReportDrawer"),
);

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;
const CONDENSED = { fontFamily: "'Barlow Condensed', sans-serif" } as const;

// Од үнэлгээ / тэмдэглэл бичих нь ФАЗ 7
const COMING_SOON_TITLE = "Удахгүй нэмэгдэнэ";

const TONE_CLASS: Record<DataQualityTone, string> = {
	success: "border-badge-green/30 bg-badge-green/15 text-badge-green",
	info: "border-[#3B82F6]/30 bg-[#3B82F6]/15 text-[#3B82F6]",
	warning: "border-badge-amber/30 bg-badge-amber/15 text-badge-amber",
	error: "border-destructive/30 bg-destructive/15 text-destructive",
	neutral: "border-border bg-muted text-muted-foreground",
};

function resultPath(recruitmentId: string, invitationId: string) {
	return `/dashboard/recruitments/${recruitmentId}/results/${invitationId}`;
}

function fullName(person: { firstName?: string; lastName?: string }) {
	return [person.lastName, person.firstName].filter(Boolean).join(" ") || "—";
}

/** Нэг талентын үр дүн (staging: /role-assessment/{id}/dashboard/{invitationId}). Зөвхөн унших. */
export default function InvitationResultPage() {
	const params = useParams();
	const router = useRouter();
	const recruitmentId = params?.id as string | undefined;
	const invitationId = params?.invitationId as string | undefined;
	const [openReport, setOpenReport] = useState<TestResult | null>(null);

	const resultQuery = useInvitationResult(recruitmentId, invitationId);
	const recruitmentQuery = useRecruitmentDetail(recruitmentId);
	const result = resultQuery.data;
	const dashboardPath = `/dashboard/recruitments/${recruitmentId}/results`;

	return (
		<div className="min-h-full w-full">
			<div className="p-6 lg:p-10">
				{/* Breadcrumb */}
				<div
					className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4"
					style={MONO}
				>
					<button
						type="button"
						className="hover:text-primary cursor-pointer transition-colors"
						onClick={() => router.push("/dashboard/recruitments")}
					>
						Талентийн үнэлгээ
					</button>
					<span className="mx-2">/</span>
					<button
						type="button"
						className="hover:text-primary cursor-pointer transition-colors"
						onClick={() => router.push(dashboardPath)}
					>
						{recruitmentQuery.data?.name ??
							(recruitmentQuery.isLoading ? "…" : "—")}
					</button>
					<span className="mx-2">/</span>
					<span className="text-foreground">
						{result ? fullName(result) : resultQuery.isLoading ? "…" : "—"}
					</span>
				</div>

				{resultQuery.isLoading ? (
					<div className="animate-pulse space-y-6">
						<div className="h-12 w-80 bg-muted" />
						<div className="h-64 bg-muted" />
					</div>
				) : resultQuery.isError || !result || !recruitmentId ? (
					<div className="border-2 border-border bg-card">
						<ErrorState
							text={getErrorMessage(
								resultQuery.error,
								"Талентын үр дүн авахад алдаа гарлаа",
							)}
							onRetry={
								isRetryableError(resultQuery.error)
									? () => resultQuery.refetch()
									: undefined
							}
							isRetrying={resultQuery.isFetching}
						/>
					</div>
				) : (
					<>
						<ResultHeader
							result={result}
							recruitmentId={recruitmentId}
							onBack={() => router.push(dashboardPath)}
						/>
						<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
							<div className="min-w-0 flex-1 space-y-6">
								{result.assessment ? (
									<>
										<TestResultsSection
											invitationId={result.id}
											testResults={result.assessment.testResults}
											onOpenReport={setOpenReport}
										/>
										<CustomAnswersSection
											answers={result.assessment.customQuestionAnswers}
										/>
									</>
								) : (
									<Card>
										<div className="flex flex-col items-center justify-center py-16 text-center">
											<FileText
												size={32}
												className="mb-3 text-muted-foreground opacity-40"
											/>
											<p className="text-sm text-muted-foreground">
												Асуулгад уригдсан талент шинжилгээг дуусгаагүй байна.
											</p>
										</div>
									</Card>
								)}
							</div>
							<aside className="w-full space-y-6 lg:w-[380px] lg:shrink-0">
								<StatusCard result={result} />
								<ProctoringCard assessment={result.assessment} />
								<RatingCard invitationId={result.id} />
								<NotesCard invitationId={result.id} />
							</aside>
						</div>
					</>
				)}
			</div>

			{openReport && invitationId && (
				<Suspense fallback={null}>
					<TestReportDrawer
						invitationId={invitationId}
						answerId={openReport.answerId}
						testName={openReport.name}
						onClose={() => setOpenReport(null)}
					/>
				</Suspense>
			)}
		</div>
	);
}

function ResultHeader({
	result,
	recruitmentId,
	onBack,
}: {
	result: InvitationResult;
	recruitmentId: string;
	onBack: () => void;
}) {
	const router = useRouter();
	const namesQuery = useInvitationNames(recruitmentId);
	const initial = (result.lastName || result.firstName || "?")
		.charAt(0)
		.toUpperCase();

	function copyEmail() {
		navigator.clipboard
			.writeText(result.email)
			.then(() => toast.success("Имэйл хуулагдлаа"))
			.catch(() => toast.error("Имэйл хуулж чадсангүй"));
	}

	function go(invitationId: string | null) {
		if (invitationId) router.push(resultPath(recruitmentId, invitationId));
	}

	return (
		<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex min-w-0 items-center gap-4">
				<button
					type="button"
					onClick={onBack}
					aria-label="Dashboard руу буцах"
					className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
				>
					<ArrowLeft size={16} />
				</button>
				<div
					className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-primary text-xl font-black text-primary"
					style={CONDENSED}
					aria-hidden
				>
					{initial}
				</div>
				<div className="min-w-0">
					<h1
						className="truncate text-[clamp(1.2rem,3vw,1.8rem)] font-black uppercase leading-none text-foreground"
						style={CONDENSED}
					>
						{fullName(result)}
					</h1>
					<div className="mt-1 flex items-center gap-2">
						<span
							className="truncate text-xs text-muted-foreground"
							style={MONO}
						>
							{result.email}
						</span>
						<button
							type="button"
							onClick={copyEmail}
							aria-label="Имэйл хуулах"
							title="Имэйл хуулах"
							className="text-muted-foreground transition-colors hover:text-primary"
						>
							<Copy size={12} />
						</button>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => go(result.prevId)}
					disabled={!result.prevId}
					className="flex items-center gap-1 border-2 border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30"
					style={MONO}
				>
					<ChevronLeft size={12} />
					Өмнөх
				</button>
				<select
					aria-label="Талент сонгох"
					value={result.id}
					onChange={(e) => go(e.target.value)}
					disabled={!namesQuery.data}
					className="h-8 max-w-[220px] border-2 border-border bg-card px-2 text-[11px] text-foreground focus:border-primary focus:outline-none"
					style={MONO}
				>
					{(namesQuery.data ?? [result]).map((n) => (
						<option key={n.id} value={n.id}>
							{fullName(n)}
							{isInvitationStatus(n.status)
								? ` — ${INVITATION_STATUS_LABELS[n.status]}`
								: ""}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={() => go(result.nextId)}
					disabled={!result.nextId}
					className="flex items-center gap-1 border-2 border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30"
					style={MONO}
				>
					Дараах
					<ChevronRight size={12} />
				</button>
			</div>
		</div>
	);
}

function Card({
	title,
	icon,
	children,
}: {
	title?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="border-2 border-border bg-card">
			{title && (
				<h2
					className="flex items-center gap-2 border-b-2 border-border px-5 py-3 text-base font-black uppercase text-foreground"
					style={CONDENSED}
				>
					{icon}
					{title}
				</h2>
			)}
			<div className="p-5">{children}</div>
		</section>
	);
}

function DataQualityBadge({ value }: { value: string }) {
	const { label, tone } = DATA_QUALITY[value] ?? DATA_QUALITY_UNKNOWN;
	return (
		<span
			className={`inline-flex items-center border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${TONE_CLASS[tone]}`}
			style={MONO}
		>
			{label}
		</span>
	);
}

function TestResultsSection({
	invitationId,
	testResults,
	onOpenReport,
}: {
	invitationId: string;
	testResults: TestResult[];
	onOpenReport: (test: TestResult) => void;
}) {
	const download = useDownloadTestReport();

	return (
		<Card title={`Сонгосон тестүүд (${testResults.length})`}>
			{testResults.length === 0 ? (
				<p className="text-xs text-muted-foreground" style={MONO}>
					Тестийн үр дүн байхгүй.
				</p>
			) : (
				<div className="space-y-3">
					{testResults.map((test, index) => (
						<details
							key={test.id}
							open={index === 0}
							className="group border-2 border-border"
						>
							<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
								<div className="min-w-0">
									<div className="truncate text-sm font-bold text-foreground">
										{test.name}
									</div>
									<div
										className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-muted-foreground"
										style={MONO}
									>
										<span className="inline-flex items-center gap-1">
											<Clock size={11} />
											{formatSpendingTime(test.spendingTime)}
										</span>
										<span className="inline-flex items-center gap-1.5">
											Анхаарал төвлөрөл
											<DataQualityBadge value={test.dataQuality} />
										</span>
									</div>
								</div>
								<ChevronDown
									size={16}
									className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
								/>
							</summary>
							<div className="border-t-2 border-border px-4 py-3">
								{test.personalReport?.subContents.length ? (
									<table className="w-full text-left">
										<thead>
											<tr>
												{["Хүчин зүйл", "Үр дүн", "Оноо"].map((label) => (
													<th
														key={label}
														className="pb-2 pr-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground"
														style={MONO}
													>
														{label}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{test.personalReport.subContents.map((factor) => (
												<tr
													key={factor.factorKey}
													className="border-t border-border/50"
												>
													<td className="py-2 pr-3 text-xs text-foreground">
														{factor.factorName}
													</td>
													<td className="py-2 pr-3 text-xs text-foreground/80">
														{factor.intervalName ?? "—"}
													</td>
													<td
														className="py-2 text-xs text-foreground/80 whitespace-nowrap"
														style={MONO}
													>
														{formatPoints(factor.points)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<p className="text-xs text-muted-foreground" style={MONO}>
										Дэлгэрэнгүй үр дүн байхгүй.
									</p>
								)}
								<div className="mt-4 flex flex-wrap gap-2">
									<button
										type="button"
										onClick={() => onOpenReport(test)}
										className="flex items-center gap-1.5 border-2 border-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
										style={MONO}
									>
										<FileText size={12} />
										Дэлгэрэнгүй
									</button>
									<button
										type="button"
										onClick={() =>
											download.mutate({ invitationId, answerId: test.answerId })
										}
										disabled={download.isPending}
										className="flex items-center gap-1.5 border-2 border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
										style={MONO}
									>
										<Download size={12} />
										{download.isPending &&
										download.variables?.answerId === test.answerId
											? "Татаж байна..."
											: "Тайлан татах"}
									</button>
								</div>
							</div>
						</details>
					))}
				</div>
			)}
		</Card>
	);
}

function CustomAnswersSection({
	answers,
}: {
	answers: CustomQuestionAnswer[];
}) {
	if (answers.length === 0) return null;
	return (
		<Card title={`Нэмэлт асуулт (${answers.length})`}>
			<div className="space-y-3">
				{answers.map((answer) => (
					<details
						// responseId/testAnswerId нь бүх хариултад ижил (staging ✅) — questionId давтагдахгүй
						key={answer.questionId}
						open
						className="group border-2 border-border"
					>
						<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
							<span className="text-sm font-bold text-foreground">
								{answer.questionText}
							</span>
							<ChevronDown
								size={16}
								className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
							/>
						</summary>
						<div className="border-t-2 border-border px-4 py-3">
							<div
								className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"
								style={MONO}
							>
								<span className="text-foreground">Хариулт:</span>
								{answer.spendingTime && (
									<span className="inline-flex items-center gap-1">
										<Clock size={11} />
										Зарцуулсан хугацаа:{" "}
										{formatSpendingTime(answer.spendingTime)}
									</span>
								)}
							</div>
							<p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
								{answer.content?.trim() ? answer.content : "Хариулаагүй"}
							</p>
						</div>
					</details>
				))}
			</div>
		</Card>
	);
}

function InfoRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4 py-1.5">
			<dt
				className="text-[10px] uppercase tracking-widest text-muted-foreground"
				style={MONO}
			>
				{label}
			</dt>
			<dd className="text-right text-xs text-foreground" style={MONO}>
				{children}
			</dd>
		</div>
	);
}

function StatusCard({ result }: { result: InvitationResult }) {
	return (
		<Card>
			<dl>
				<InfoRow label="Төлөв">
					<InvitationStatusBadge status={result.status} />
				</InfoRow>
				<InfoRow label="Урьсан">{formatPersonShort(result.invitedBy)}</InfoRow>
				<InfoRow label="Урьсан огноо">
					{formatDateTime(result.createdAt)}
				</InfoRow>
				<InfoRow label="Бөглөсөн огноо">
					{formatDateTime(result.assessment?.completedAt)}
				</InfoRow>
				<InfoRow label="Зарцуулсан хугацаа">
					{formatSpendingTime(result.assessment?.spendingTime)}
				</InfoRow>
			</dl>
		</Card>
	);
}

function ProctoringCard({ assessment }: { assessment: Assessment | null }) {
	return (
		<Card title="Явцын хяналт" icon={<ShieldCheck size={16} />}>
			{!assessment ? (
				<p className="text-xs text-muted-foreground" style={MONO}>
					Мэдээлэл байхгүй.
				</p>
			) : (
				<ul className="space-y-3">
					{PROCTORING_EVENTS.map((event) => {
						const item =
							assessment.eventSummary?.[event.key] ??
							(event.fallbackKey
								? assessment.eventSummary?.[event.fallbackKey]
								: undefined);
						const seconds = item?.seconds ?? 0;
						return (
							<li
								key={event.key}
								className="flex items-start justify-between gap-3"
							>
								<div className="min-w-0">
									<div className="text-xs font-bold text-foreground">
										{event.title}
									</div>
									<div className="text-[11px] text-muted-foreground">
										{event.description}
									</div>
								</div>
								<div className="shrink-0 text-right" style={MONO}>
									<div className="text-sm font-bold text-foreground">
										{item?.count != null ? item.count : "-"}
									</div>
									{event.hasDuration && seconds > 0 && (
										<div className="text-[10px] text-muted-foreground">
											{formatDurationSeconds(seconds)}
										</div>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
}

function RatingCard({ invitationId }: { invitationId: string }) {
	const { data, isLoading, isError } = useInvitationRate(invitationId);
	const avg = data?.avgPoints ?? null;
	const filled = avg != null ? Math.round(avg) : 0;

	return (
		<Card title="Үнэлгээ" icon={<Star size={16} />}>
			{isLoading ? (
				<div className="h-6 w-40 animate-pulse bg-muted" />
			) : isError || !data ? (
				<p className="text-xs text-muted-foreground" style={MONO}>
					Үнэлгээ авахад алдаа гарлаа.
				</p>
			) : (
				<>
					<div className="flex items-center gap-3">
						<div
							className="flex items-center gap-0.5"
							role="img"
							aria-label={`Дундаж үнэлгээ ${formatPoints(avg)} / 5`}
						>
							{[1, 2, 3, 4, 5].map((n) => (
								<Star
									key={n}
									size={18}
									className={
										n <= filled
											? "fill-yellow-500 text-yellow-500"
											: "text-muted-foreground/40"
									}
								/>
							))}
						</div>
						<span className="text-sm font-bold text-foreground" style={MONO}>
							{avg != null ? formatPoints(avg) : "—"}
						</span>
						<span
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={MONO}
						>
							нийт {data.count} үнэлгээ
						</span>
					</div>
					<div
						className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground"
						style={MONO}
					>
						<span>
							Таны үнэлгээ:{" "}
							<span className="text-foreground">
								{data.myPoints != null ? formatPoints(data.myPoints) : "—"}
							</span>
						</span>
						<button
							type="button"
							disabled
							title={COMING_SOON_TITLE}
							className="border-2 border-border px-3 py-1.5 font-bold disabled:cursor-not-allowed disabled:opacity-40"
						>
							Үнэлгээ өгөх
						</button>
					</div>
				</>
			)}
		</Card>
	);
}

function NotesCard({ invitationId }: { invitationId: string }) {
	const { data, isLoading, isError } = useInvitationNotes(invitationId);

	return (
		<Card title="Тэмдэглэл" icon={<NotebookPen size={16} />}>
			{isLoading ? (
				<div className="h-12 animate-pulse bg-muted" />
			) : isError || !data ? (
				<p className="text-xs text-muted-foreground" style={MONO}>
					Тэмдэглэл авахад алдаа гарлаа.
				</p>
			) : data.length === 0 ? (
				<p className="text-xs text-muted-foreground" style={MONO}>
					Тэмдэглэл байхгүй.
				</p>
			) : (
				<ul className="space-y-3">
					{data.map((note) => (
						<li key={note.id} className="border-l-2 border-primary/40 pl-3">
							<div
								className="text-[10px] uppercase tracking-widest text-muted-foreground"
								style={MONO}
							>
								{formatPersonShort(note.createdBy)} ·{" "}
								{formatDateTime(note.createdAt)}
							</div>
							<p className="mt-1 whitespace-pre-wrap text-xs text-foreground">
								{note.note}
							</p>
						</li>
					))}
				</ul>
			)}
			<button
				type="button"
				disabled
				title={COMING_SOON_TITLE}
				className="mt-4 w-full border-2 border-border py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40"
				style={MONO}
			>
				Тэмдэглэл нэмэх
			</button>
		</Card>
	);
}
