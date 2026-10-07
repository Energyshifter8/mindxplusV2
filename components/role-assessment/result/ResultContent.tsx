"use client";

import {
	ArrowLeftIcon,
	ClockIcon,
	DocumentIcon,
	DownloadIcon,
	QuestionCircleIcon,
} from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import {
	DATA_QUALITY,
	DATA_QUALITY_UNKNOWN,
} from "@/lib/constants/roleAssessment";
import { formatPoints } from "@/lib/format";
import { formatSpentTime } from "@/lib/role-assessment/result";
import type {
	CustomQuestionAnswer,
	TestResult,
} from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";

// Staging "Сонгосон тестүүд" (📦 `y` + module 36209) ба "Нэмэлт асуулт" (`b`).
// Module 36209 (тестийн accordion-ы бие: gauge, тайлбар, "Ярилцлагад анхаарч болох
// зүйлс", "Ажил олгогчид өгөх зөвлөмж") татагдаагүй chunk-д байгаа тул API-ийн
// өгөгдлийг (хүчин зүйл, түвшин, оноо) харуулна; бүрэн текст "Дэлгэрэнгүй" HTML
// тайланд байна (mismatches.md).

const SPINNER =
	"size-4 animate-spin rounded-full border-2 border-current border-t-transparent";

/** Toggle chevron: staging `o.A` (20px "<") rotate-90 (нээлттэй) / -rotate-90 */
function ToggleChevron({ open }: { open: boolean }) {
	return (
		<ArrowLeftIcon
			className={cn(
				"size-6 shrink-0 transition-transform duration-200",
				open ? "rotate-90" : "-rotate-90",
			)}
		/>
	);
}

function testKey(test: TestResult, index: number): string {
	return test.id || test.answerId || `test-${index}`;
}

export function TestResultsList({
	tests,
	expanded,
	onToggle,
	onViewDetail,
	previewLoadingKey,
	onDownload,
	downloadingKey,
}: {
	tests: TestResult[];
	expanded: Record<string, boolean>;
	onToggle: (key: string) => void;
	onViewDetail: (test: TestResult, key: string) => void;
	previewLoadingKey: string | null;
	onDownload: (test: TestResult, key: string) => void;
	downloadingKey: string | null;
}) {
	return (
		<div className="divide-y divide-Stroke-600">
			{tests.map((test, index) => {
				const key = testKey(test, index);
				const name = test.name || `Тест ${index + 1}`;
				const open = !!expanded[key];
				const quality = DATA_QUALITY[test.dataQuality] ?? DATA_QUALITY_UNKNOWN;
				const factors = test.personalReport?.subContents ?? [];
				const previewing = previewLoadingKey === key;
				const downloading = downloadingKey === key;
				const bodyId = `ra-test-body-${index}`;
				return (
					<div key={key} className="py-4 first:pt-0 last:pb-0">
						<div className="flex items-start justify-between gap-4">
							<button
								type="button"
								onClick={() => onToggle(key)}
								aria-expanded={open}
								aria-controls={bodyId}
								className="flex min-w-0 flex-1 items-start gap-2 rounded-md text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-Primary/40"
							>
								<ToggleChevron open={open} />
								<span className="min-w-0">
									<span className="block font-medium text-base text-TextColor-main leading-[140%]">
										{name}
									</span>
									<span className="mt-1 flex items-center gap-1 font-medium text-[14px] text-TextColor-third">
										<ClockIcon className="size-3.5" />
										Зарцуулсан хугацаа: {formatSpentTime(test.spendingTime)}
									</span>
								</span>
							</button>
							<div className="flex shrink-0 flex-col items-center gap-1 border-Stroke-600 border-l pl-4">
								<span className="flex items-center gap-1 font-medium text-[14px] text-TextColor-third">
									Анхаарал төвлөрөл
									<QuestionCircleIcon className="size-4" />
								</span>
								<span className="rounded bg-Gray-100 px-2 py-0.5 font-medium text-[14px] text-TextColor-main">
									{quality.label}
								</span>
							</div>
						</div>
						{open && (
							<div id={bodyId} className="mt-4 space-y-3">
								{factors.length > 0 ? (
									<div className="rounded-2xl bg-Gray-50 p-4 sm:p-6">
										<ul className="divide-y divide-Stroke-600">
											{factors.map((factor) => (
												<li
													key={`${factor.factorKey}-${factor.intervalKey ?? ""}`}
													className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
												>
													<span className="min-w-0 font-semibold text-[16px] text-TextColor-main leading-[140%]">
														{factor.factorName}
													</span>
													<span className="flex items-center gap-3">
														{factor.intervalName && (
															<span className="rounded-full bg-Primary-softBg px-3 py-1 font-semibold text-[14px] text-Primary-press">
																{factor.intervalName}
															</span>
														)}
														<span className="whitespace-nowrap font-medium text-[14px] text-TextColor-secondary">
															Оноо: {formatPoints(factor.points)}
														</span>
													</span>
												</li>
											))}
										</ul>
									</div>
								) : (
									<p className="rounded-2xl bg-Gray-50 p-4 text-[14px] text-TextColor-third">
										Дэлгэрэнгүй үр дүн байхгүй.
									</p>
								)}
								<div className="flex w-full justify-end gap-3 pb-3">
									<RaButton
										variant="outline"
										size="small"
										title={previewing ? "Ачааллаж байна..." : "Дэлгэрэнгүй"}
										ariaLabel={`${name} — дэлгэрэнгүй тайлан`}
										disabled={previewing}
										onClick={() => onViewDetail(test, key)}
										prefixIcon={
											previewing ? (
												<span className={SPINNER} />
											) : (
												<DocumentIcon />
											)
										}
									/>
									{test.answerId && (
										<RaButton
											variant="primary"
											size="small"
											title={downloading ? "Татдаж байна..." : "Тайлан татах"}
											ariaLabel={`${name} — тайлан татах`}
											disabled={downloading}
											onClick={() => onDownload(test, key)}
											prefixIcon={
												downloading ? (
													<span className={cn(SPINNER, "border-white")} />
												) : (
													<DownloadIcon />
												)
											}
											className="w-auto"
										/>
									)}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

/** Staging-ийн түлхүүр: `${responseId ?? testAnswerId}-${questionId ?? index}` */
function answerKey(answer: CustomQuestionAnswer, index: number): string {
	return `${answer.responseId ?? answer.testAnswerId}-${answer.questionId ?? index}`;
}

export function QuestionAnswersList({
	answers,
	expanded,
	onToggle,
}: {
	answers: CustomQuestionAnswer[];
	expanded: Record<string, boolean>;
	onToggle: (key: string) => void;
}) {
	return (
		<div className="divide-y divide-Stroke-600">
			{answers.map((answer, index) => {
				const key = answerKey(answer, index);
				const open = !!expanded[key];
				const bodyId = `ra-answer-body-${index}`;
				return (
					<div key={key} className="py-4 first:pt-0 last:pb-0">
						<button
							type="button"
							onClick={() => onToggle(key)}
							aria-expanded={open}
							aria-controls={bodyId}
							className="flex w-full items-center gap-4 rounded-md text-left outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-Primary/40"
						>
							<ToggleChevron open={open} />
							<span className="flex-1">
								<span className="block text-base text-TextColor-main leading-[140%]">
									{answer.questionText || `Асуулт ${index + 1}`}
								</span>
								{answer.questionDescription && (
									<span className="mt-2 block font-medium text-[14px] text-TextColor-secondary">
										{answer.questionDescription}
									</span>
								)}
							</span>
						</button>
						{open && (
							<div
								id={bodyId}
								className="mt-4 border-Primary border-l-[2px] pl-5"
							>
								<div className="flex items-center justify-between">
									<p className="font-bold text-base text-TextColor-main leading-5">
										Хариулт:
									</p>
									{answer.spendingTime && (
										<div className="flex items-center gap-1 font-medium text-[14px] text-TextColor-third">
											<ClockIcon className="size-3.5" />
											Зарцуулсан хугацаа:
											<span>{formatSpentTime(answer.spendingTime)}</span>
										</div>
									)}
								</div>
								<p className="mt-4 whitespace-pre-wrap text-base text-TextColor-main leading-[1.4]">
									{answer.content || "Хариулаагүй"}
								</p>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
