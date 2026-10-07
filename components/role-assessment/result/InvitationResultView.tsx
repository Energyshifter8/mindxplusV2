"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CopyIcon,
} from "@/components/icons/role-assessment";
import { PlanExpiredModal } from "@/components/role-assessment/dashboard/PlanExpiredModal";
import { ErrorState } from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaSelect } from "@/components/role-assessment/ui/Select";
import { fetchTestReportHtml } from "@/lib/api/role-assessment";
import { getErrorMessage, isApiErrorCode } from "@/lib/api-errors";
import { raKeys } from "@/lib/hooks/role-assessment/keys";
import {
	useInvitationNames,
	useInvitationResult,
	useRecruitmentDetail,
} from "@/lib/hooks/role-assessment/queries";
import {
	RA_TITLES,
	useDocumentTitle,
} from "@/lib/hooks/role-assessment/useDocumentTitle";
import { useDownloadTestReport } from "@/lib/hooks/role-assessment/useDownloadTestReport";
import {
	invitationDotClass,
	mergeNameOptions,
	nameOptionLabel,
	personFullName,
} from "@/lib/role-assessment/result";
import { raRoutes } from "@/lib/routes";
import type { TestResult } from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";
import { ReportDrawer } from "./ReportDrawer";
import { QuestionAnswersList, TestResultsList } from "./ResultContent";
import {
	NotesCard,
	ProctoringCard,
	RatingCard,
	StatusCard,
	WarningCard,
} from "./ResultSidePanel";

// Staging /role-assessment/{id}/dashboard/{invitationId} (📦 module 1043). GET: үр дүн,
// recruitment detail (нэр), урилгын нэрс; баруун багана: rate, notes. Зөрүү
// (mismatches.md): алдааны төлөв тусдаа; HTML тайлан `sandbox=""`; тестийн accordion-ы
// бие API өгөгдлөөр (module 36209 байхгүй).

interface ReportState {
	html: string | null;
	title: string | null;
	answerId: string | null;
}

const BACK_LINK =
	"rounded-sm outline-none transition-colors hover:text-TextColor-secondary focus-visible:ring-2 focus-visible:ring-Primary/40";
const NAV_BUTTON =
	"px-4 text-TextColor-main underline hover:text-Primary disabled:!no-underline disabled:!opacity-30 sm:px-6";

export function InvitationResultView({
	recruitmentId,
	invitationId,
}: {
	recruitmentId: string;
	invitationId: string;
}) {
	useDocumentTitle(RA_TITLES.result);
	const router = useRouter();
	const queryClient = useQueryClient();
	const result = useInvitationResult(recruitmentId, invitationId);
	const detail = useRecruitmentDetail(recruitmentId);
	const names = useInvitationNames(recruitmentId);
	const download = useDownloadTestReport();

	const [planNoticeClosed, setPlanNoticeClosed] = useState(false);
	const [testOverrides, setTestOverrides] = useState<Record<string, boolean>>(
		{},
	);
	const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({});
	const [previewKey, setPreviewKey] = useState<string | null>(null);
	const [downloadKey, setDownloadKey] = useState<string | null>(null);
	const [report, setReport] = useState<ReportState | null>(null);

	const data = result.data;
	const tests = useMemo(() => data?.assessment?.testResults ?? [], [data]);
	const answers = useMemo(
		() => data?.assessment?.customQuestionAnswers ?? [],
		[data],
	);
	const fullName = personFullName(data);
	const recruitmentName = detail.data?.name || "---";
	const dashboardHref = raRoutes.dashboard(recruitmentId);
	const nameOptions = useMemo(
		() => mergeNameOptions(names.data, data),
		[names.data, data],
	);

	// Staging: эхний ачаалалтад бүх тест нээлттэй
	const expandedTests = useMemo(() => {
		const map: Record<string, boolean> = {};
		tests.forEach((t, i) => {
			const key = t.id || t.answerId || `test-${i}`;
			map[key] = testOverrides[key] ?? true;
		});
		return map;
	}, [tests, testOverrides]);

	const go = (id: string | null | undefined) => {
		if (id) router.push(raRoutes.result(recruitmentId, id));
	};

	const copyEmail = async () => {
		if (!data?.email) return;
		try {
			await navigator.clipboard.writeText(data.email);
			toast.success("Имэйл хуулагдлаа");
		} catch {
			toast.error("Имэйл хуулах боломжгүй байна");
		}
	};

	const openReport = async (test: TestResult, key: string) => {
		if (!test.answerId) {
			setReport({ html: null, title: null, answerId: null });
			return;
		}
		setPreviewKey(key);
		try {
			const html = await queryClient.fetchQuery({
				queryKey: raKeys.report(invitationId, test.answerId),
				queryFn: () => fetchTestReportHtml(invitationId, test.answerId),
				gcTime: 60 * 1000,
			});
			setReport({
				html: html || null,
				title: test.name,
				answerId: test.answerId,
			});
		} catch (error) {
			toast.error(getErrorMessage(error, "Унших боломжгүй"));
			setReport({ html: null, title: null, answerId: test.answerId });
		} finally {
			setPreviewKey(null);
		}
	};

	const downloadReport = (answerId: string, key: string) => {
		setDownloadKey(key);
		download.mutate(
			{ invitationId, answerId },
			{ onSettled: () => setDownloadKey(null) },
		);
	};

	if (result.isPending) {
		return (
			<div
				className="flex h-[60vh] items-center justify-center"
				aria-busy="true"
			>
				<span className="sr-only">Ачааллаж байна...</span>
				<div className="h-8 w-8 animate-spin rounded-full border-Primary border-b-2" />
			</div>
		);
	}

	const planExpired = isApiErrorCode(result.error, "plan_expired");

	return (
		<div className="mx-auto min-h-screen overflow-x-clip bg-white">
			<div className="sticky top-[var(--ra-banner-h,0px)] z-10 flex h-[72px] items-center justify-between border-Stroke-700 border-b bg-white px-4 sm:px-6">
				<Link
					href={dashboardHref}
					aria-label="Dashboard руу буцах"
					className="flex items-center gap-2 rounded-md text-TextColor-secondary outline-none transition-colors hover:text-TextColor-main focus-visible:ring-2 focus-visible:ring-Primary/40"
				>
					<ArrowLeftIcon className="size-5" />
				</Link>
			</div>

			{result.isError || !data ? (
				<>
					<ErrorState
						message={getErrorMessage(
							result.error,
							"Талентын үр дүн авахад алдаа гарлаа",
						)}
						onRetry={() => result.refetch()}
						retrying={result.isFetching}
					/>
					<PlanExpiredModal
						open={planExpired && !planNoticeClosed}
						onClose={() => setPlanNoticeClosed(true)}
					/>
				</>
			) : (
				<>
					<div className="flex w-full flex-col justify-between gap-4 border-Stroke-700 border-b px-4 py-4 sm:px-6 sm:py-6 lg:pl-10 xl:flex-row xl:gap-0">
						<div className="min-w-0">
							<nav
								aria-label="Замын заалт"
								className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-[14px] text-TextColor-third leading-[140%]"
							>
								<Link href={raRoutes.list()} className={BACK_LINK}>
									Талентийн үнэлгээ үүсгэх
								</Link>
								<span aria-hidden="true">/</span>
								<Link href={dashboardHref} className={BACK_LINK}>
									{recruitmentName}
								</Link>
								<span aria-hidden="true">/</span>
								<span
									aria-current="page"
									className="truncate text-TextColor-secondary"
								>
									{fullName}
								</span>
							</nav>
							<div className="flex min-w-0 items-center gap-4">
								<div
									aria-hidden="true"
									className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#C2185B] font-semibold text-[20px] text-white leading-none"
								>
									{fullName[0]?.toUpperCase() || "?"}
								</div>
								<div className="min-w-0 flex-1">
									<h1 className="truncate font-bold text-[20px] text-TextColor-main leading-[140%] sm:text-[24px]">
										{fullName}
									</h1>
									<button
										type="button"
										onClick={copyEmail}
										aria-label={`Имэйл хуулах: ${data.email || "---"}`}
										className="group mt-1 flex min-w-0 items-center gap-1 rounded-sm font-semibold text-[14px] text-TextColor-main leading-5 outline-none transition-colors hover:text-Primary focus-visible:ring-2 focus-visible:ring-Primary/40 sm:text-[16px]"
									>
										<span className="truncate">{data.email || "---"}</span>
										<CopyIcon className="size-4 shrink-0" />
									</button>
								</div>
							</div>
						</div>
						<div className="flex shrink-0 flex-col items-start gap-3 sm:gap-4 md:flex-row md:items-center">
							<RaSelect
								ariaLabel="Талент сонгох"
								value={invitationId}
								placeholder="Сонгох..."
								onChange={(id) => go(id)}
								options={nameOptions.map((n) => ({
									value: n.id,
									label: (
										<span className="flex h-10 items-center gap-2">
											<span
												aria-hidden="true"
												className={cn(
													"size-2 shrink-0 rounded-full",
													invitationDotClass(n.status),
												)}
											/>
											<span className="font-medium text-slate-700">
												{nameOptionLabel(n)}
											</span>
										</span>
									),
								}))}
								triggerClassName="h-10 w-full min-w-0 rounded-lg border border-Stroke-700 bg-white font-medium text-[14px] text-TextColor-main hover:border-TextColor-third focus:border-Primary sm:w-auto sm:min-w-[200px]"
								popupClassName="min-w-[200px] rounded-lg border-[#f1f5f9] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]"
							/>
							<div className="flex flex-shrink-0 items-center gap-2">
								<RaButton
									variant="ghost"
									title="Өмнөх"
									prefixIcon={<ArrowLeftIcon className="size-4" />}
									disabled={!data.prevId}
									onClick={() => go(data.prevId)}
									className={NAV_BUTTON}
								/>
								<RaButton
									variant="ghost"
									title="Дараах"
									suffixIcon={<ArrowRightIcon className="size-4" />}
									disabled={!data.nextId}
									onClick={() => go(data.nextId)}
									className={NAV_BUTTON}
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col items-stretch gap-4 p-4 sm:p-6 lg:gap-6 xl:flex-row">
						<section
							aria-labelledby="ra-result-tests"
							className="min-w-0 flex-1 rounded-2xl border border-Stroke-700 p-4 sm:p-6"
						>
							<div className="mb-6 flex items-center justify-between">
								<h2
									id="ra-result-tests"
									className="font-bold text-base text-TextColor-main leading-5"
								>
									Сонгосон тестүүд
								</h2>
							</div>
							{tests.length > 0 && (
								<TestResultsList
									tests={tests}
									expanded={expandedTests}
									onToggle={(key) =>
										setTestOverrides((prev) => ({
											...prev,
											[key]: !(prev[key] ?? true),
										}))
									}
									onViewDetail={openReport}
									previewLoadingKey={previewKey}
									onDownload={(test, key) => downloadReport(test.answerId, key)}
									downloadingKey={downloadKey}
								/>
							)}
							{answers.length > 0 && (
								<>
									<h2 className="mt-8 mb-6 font-bold text-base text-TextColor-main leading-5">
										Нэмэлт асуулт
									</h2>
									<QuestionAnswersList
										answers={answers}
										expanded={openAnswers}
										onToggle={(key) =>
											setOpenAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
										}
									/>
								</>
							)}
							{tests.length === 0 && answers.length === 0 && (
								<div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-Stroke-500 px-4 py-12 sm:min-h-[480px] sm:px-6 sm:py-20">
									<Image
										src="/images/role-assessment/be-patient.svg"
										alt=""
										width={160}
										height={98}
										className="mb-6 h-[98px] w-[160px] shrink-0"
									/>
									<p className="max-w-[540px] text-center font-bold text-[20px] text-TextColor-secondary leading-[24px]">
										Талбар хоосон байна.
									</p>
									<p className="mt-2 max-w-[540px] text-center font-normal text-[14px] text-TextColor-third leading-[140%] tracking-[0.2px]">
										Асуулгад уригдсан талент шинжилгээг дуусгаагүй байна.
									</p>
								</div>
							)}
						</section>
						<aside
							aria-label="Талентын мэдээлэл"
							className="w-full min-w-0 lg:w-[450px] lg:shrink-0"
						>
							<div className="space-y-6 lg:sticky lg:top-[calc(81px+var(--ra-banner-h,0px))]">
								<WarningCard />
								<StatusCard result={data} />
								<ProctoringCard result={data} />
								<RatingCard invitationId={invitationId} />
								<NotesCard invitationId={invitationId} />
							</div>
						</aside>
					</div>
				</>
			)}

			<ReportDrawer
				open={report !== null}
				onClose={() => setReport(null)}
				html={report?.html ?? null}
				title={report?.title ?? null}
				canDownload={!!report?.answerId}
				downloading={download.isPending}
				onDownload={() => {
					if (report?.answerId) downloadReport(report.answerId, "drawer");
				}}
			/>
		</div>
	);
}
