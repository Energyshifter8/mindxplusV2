"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	EyeIcon,
} from "@/components/icons/role-assessment";
import { TestDetailDrawer } from "@/components/role-assessment/TestDetailDrawer";
import {
	AntdSkeleton,
	ErrorState,
} from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaConfirmDialog } from "@/components/role-assessment/ui/Modal";
import { isRaDryRun } from "@/lib/api/role-assessment/dry-run";
import { getErrorMessage, isRetryableError } from "@/lib/api-errors";
import type { RecommendAnswer } from "@/lib/constants/roleAssessment";
import {
	useCatalogQuestions,
	useCatalogTests,
	useQuestionCategories,
	useRecruitmentDesign,
	useRecruitmentDetail,
	useRecruitmentInformation,
	useRecruitmentQuestionIds,
	useRecruitmentSettings,
	useRecruitmentTestIds,
	useTestCategories,
} from "@/lib/hooks/role-assessment/queries";
import {
	RA_TITLES,
	useDocumentTitle,
} from "@/lib/hooks/role-assessment/useDocumentTitle";
import {
	usePublishRecruitment,
	useRecommendTests,
	useSetQuestions,
	useSetTests,
	useUpdateInformation,
} from "@/lib/hooks/role-assessment/wizardMutations";
import { readDraft, saveDraft } from "@/lib/role-assessment/draft";
import {
	continueDisabled,
	type InfoForm,
	isInfoComplete,
	isInfoDirty,
	isInfoFormFilled,
	isSelectionDirty,
	orderByIds,
	stepNavigation,
	sumDurations,
	toCategoryOptions,
	toggleSelection,
	topStepStatus,
	toWizardQuestion,
	toWizardTest,
	uniqueById,
	WIZARD_STEPS,
	type WizardQuestion,
	type WizardState,
	type WizardStep,
	type WizardTest,
	withQuestionTime,
} from "@/lib/role-assessment/wizard";
import { raRoutes } from "@/lib/routes";
import type { RecruitmentInfo } from "@/lib/types/api";
import { RightPanelContent } from "./RightPanelContent";
import { StepConfirm } from "./StepConfirm";
import { StepInfo } from "./StepInfo";
import { TopStepper } from "./Steppers";
import { StepQuestions } from "./StepQuestions";
import { StepTests } from "./StepTests";
import { PublishedModal, RecommendModal } from "./WizardModals";

// Staging /role-assessment/{id} wizard (📦 app/(editor)/role-assessment/[id], `ei`).
// Зөрүү (mismatches.md): CREATED-ээс бусад бүх статус унших горим (staging зөвхөн
// PUBLISHED); "Нийтлэх"-ийн өмнө баталгаажуулах dialog; сонголтын дараалал серверийнхээр;
// <lg өргөнд баруун самбар доор.

const EMPTY_FORM: InfoForm = {
	jobTitle: "",
	jobDescription: "",
	companyName: "",
	companyDescription: "",
};

function formFromInfo(info: RecruitmentInfo): InfoForm {
	return {
		jobTitle: info.jobTitle || "",
		jobDescription: info.jobDescription || "",
		companyName: info.companyName || "",
		companyDescription: info.companyDescription || "",
	};
}

export function RoleAssessmentWizard({
	recruitmentId,
}: {
	recruitmentId: string;
}) {
	const id = recruitmentId;
	const router = useRouter();
	const [step, setStep] = useState<WizardStep>(1);
	// staging: эхний утга [2] (📦), алхам бүр нэмэгдэнэ
	const [visited, setVisited] = useState<WizardStep[]>([2]);
	const [form, setForm] = useState<InfoForm>(EMPTY_FORM);
	const [testCategory, setTestCategory] = useState("");
	const [questionCategory, setQuestionCategory] = useState("");
	const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
	const [selectedTests, setSelectedTests] = useState<WizardTest[]>([]);
	const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
	const [selectedQuestions, setSelectedQuestions] = useState<WizardQuestion[]>(
		[],
	);
	const [allTests, setAllTests] = useState<WizardTest[]>([]);
	const [allQuestions, setAllQuestions] = useState<WizardQuestion[]>([]);
	const [recommended, setRecommended] = useState<WizardTest[]>([]);
	const [recommendOpen, setRecommendOpen] = useState(false);
	const [answers, setAnswers] = useState<RecommendAnswer[]>([]);
	const [detailTestId, setDetailTestId] = useState<string | null>(null);
	const [confirmPublish, setConfirmPublish] = useState(false);
	const [published, setPublished] = useState(false);

	useDocumentTitle(RA_TITLES.wizard(WIZARD_STEPS[step - 1].title));

	// Staging-ийн GET дараалал: designs (лого) → detail → information → settings
	useRecruitmentDesign(id);
	const detail = useRecruitmentDetail(id);
	const info = useRecruitmentInformation(id);
	const settings = useRecruitmentSettings();
	const status = detail.data?.status;
	const isCreated = status === "CREATED";
	const readOnly = status !== undefined && status !== "CREATED";
	const maxTests = settings.data?.maxTestCount || Number.POSITIVE_INFINITY;
	const maxQuestions =
		settings.data?.maxQuestionCount || Number.POSITIVE_INFINITY;

	// Форм ← серверийн мэдээлэл (staging). DRY-RUN-д л эхний удаа ноорогоос сэргээнэ.
	// Effect биш render үеийн state тохируулга (React "adjusting state on prop change").
	const [syncedInfo, setSyncedInfo] = useState<RecruitmentInfo | null>(null);
	if (info.data && info.data !== syncedInfo) {
		const draft = syncedInfo === null && isRaDryRun() ? readDraft(id) : null;
		setSyncedInfo(info.data);
		setForm(draft ?? formFromInfo(info.data));
	}

	useEffect(() => {
		if (info.isError || info.data === null) {
			toast.error("Ажлын байрны мэдээлэл авахад алдаа гарлаа");
		}
	}, [info.isError, info.data]);

	if (!visited.includes(step)) setVisited([...visited, step]);

	// --- Алхам 2: тест ---
	const testIdsQuery = useRecruitmentTestIds(id, step === 2);
	const serverTestIds = useMemo(
		() => testIdsQuery.data ?? [],
		[testIdsQuery.data],
	);
	const testCategoriesQuery = useTestCategories(step === 2);
	const testCategories = useMemo(
		() => toCategoryOptions(testCategoriesQuery.data),
		[testCategoriesQuery.data],
	);
	const testsQuery = useCatalogTests(testCategory, step === 2);
	const catalogTests = useMemo(
		() => (testsQuery.data ?? []).map((t) => toWizardTest(t, testCategories)),
		[testsQuery.data, testCategories],
	);
	const [seenTests, setSeenTests] = useState(catalogTests);
	if (seenTests !== catalogTests) {
		setSeenTests(catalogTests);
		if (catalogTests.length > 0)
			setAllTests((prev) => uniqueById([...prev, ...catalogTests]));
	}

	// --- Алхам 3: нэмэлт асуулт ---
	const questionIdsQuery = useRecruitmentQuestionIds(id, step === 3);
	const serverQuestionIds = useMemo(
		() => questionIdsQuery.data ?? [],
		[questionIdsQuery.data],
	);
	const questionCategoriesQuery = useQuestionCategories(step === 3);
	const questionCategories = useMemo(
		() => toCategoryOptions(questionCategoriesQuery.data),
		[questionCategoriesQuery.data],
	);
	const questionsQuery = useCatalogQuestions(questionCategory, step === 3);
	const catalogQuestions = useMemo(
		() =>
			(questionsQuery.data ?? []).map((q) =>
				toWizardQuestion(q, questionCategories),
			),
		[questionsQuery.data, questionCategories],
	);
	const [seenQuestions, setSeenQuestions] = useState(catalogQuestions);
	if (seenQuestions !== catalogQuestions) {
		setSeenQuestions(catalogQuestions);
		if (catalogQuestions.length > 0)
			setAllQuestions((prev) => uniqueById([...prev, ...catalogQuestions]));
	}

	// Сервер дээр сонгосон тест/асуултыг нэг удаа state руу (staging `tt`/`ts` ref guard)
	const [syncedTestsKey, setSyncedTestsKey] = useState("");
	const serverTestsKey = [...serverTestIds].sort().join(",");
	if (serverTestsKey && serverTestsKey !== syncedTestsKey) {
		const found = orderByIds(serverTestIds, allTests);
		if (found.length > 0) {
			setSyncedTestsKey(serverTestsKey);
			setSelectedTestIds(found.map((t) => t.id));
			setSelectedTests(uniqueById(found));
		}
	}
	const [syncedQuestionsKey, setSyncedQuestionsKey] = useState("");
	const serverQuestionsKey = [...serverQuestionIds].sort().join(",");
	if (serverQuestionsKey && serverQuestionsKey !== syncedQuestionsKey) {
		const found = orderByIds(serverQuestionIds, allQuestions);
		if (found.length > 0) {
			setSyncedQuestionsKey(serverQuestionsKey);
			setSelectedQuestionIds(found.map((q) => q.id));
			setSelectedQuestions(found);
		}
	}

	const visibleTests = useMemo(() => {
		const base =
			testCategory === ""
				? catalogTests
				: catalogTests.filter((t) => t.category === testCategory);
		if (recommended.length === 0) return base;
		const recIds = new Set(recommended.map((t) => t.id));
		return [
			...(testCategory === ""
				? recommended
				: recommended.filter((t) => t.category === testCategory)),
			...base.filter((t) => !recIds.has(t.id)),
		];
	}, [catalogTests, recommended, testCategory]);

	const toggleTest = (testId: string) => {
		if (readOnly) return;
		const next = toggleSelection(selectedTestIds, testId, maxTests);
		if (next === "limit") {
			toast.warning("Таны хязгаар дүүрсэн байна");
			return;
		}
		setSelectedTestIds(next);
		setSelectedTests((prev) =>
			uniqueById(orderByIds(next, [...prev, ...allTests])),
		);
	};

	const toggleQuestion = (questionId: number) => {
		if (readOnly) return;
		const next = toggleSelection(selectedQuestionIds, questionId, maxQuestions);
		if (next === "limit") {
			toast.warning("Таны хязгаар дүүрсэн байна");
			return;
		}
		setSelectedQuestionIds(next);
		setSelectedQuestions((prev) =>
			uniqueById(orderByIds(next, [...prev, ...allQuestions])),
		);
	};

	// --- Хадгалалт ---
	const updateInfo = useUpdateInformation(id);
	const setTests = useSetTests(id);
	const setQuestions = useSetQuestions(id);
	const publish = usePublishRecruitment(id);
	const recommend = useRecommendTests();
	const saving =
		updateInfo.isPending ||
		setTests.isPending ||
		setQuestions.isPending ||
		publish.isPending;

	const infoComplete = isInfoComplete(info.data);
	const state: WizardState = {
		step,
		readOnly,
		isCreated,
		infoComplete,
		infoDirty: isInfoDirty(form, info.data),
		testsDirty: isSelectionDirty(selectedTestIds, testIdsQuery.data),
		questionsDirty: isSelectionDirty(
			selectedQuestionIds,
			questionIdsQuery.data,
		),
		selectedTestCount: selectedTestIds.length,
		hasSelectedTestData: selectedTests.length > 0,
		hasSelectedQuestionData: selectedQuestions.length > 0,
		serverTestCount: serverTestIds.length,
		serverQuestionCount: serverQuestionIds.length,
	};

	const testsQuestionTotal = selectedTests.reduce(
		(sum, t) => sum + t.questions,
		0,
	);
	const testsDuration = sumDurations(selectedTests.map((t) => t.duration));
	const fullDuration = withQuestionTime(
		testsDuration,
		selectedQuestionIds.length,
	);

	const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as WizardStep) : s));
	const onContinue = () => {
		if (readOnly || saving) return;
		if (step === 1) {
			updateInfo.mutate(
				{
					jobTitle: form.jobTitle,
					jobDescription: form.jobDescription,
					companyName: form.companyName,
					companyDescription: form.companyDescription,
				},
				{ onSuccess: goNext },
			);
		} else if (step === 2) {
			setTests.mutate(selectedTestIds, { onSuccess: goNext });
		} else if (step === 3) {
			setQuestions.mutate(selectedQuestionIds, { onSuccess: goNext });
		} else {
			setConfirmPublish(true);
		}
	};

	const onSelectStep = (target: WizardStep) => {
		const result = stepNavigation(target, state);
		if (result.kind === "warn") toast.warning(result.message);
		else if (result.kind === "go") setStep(result.step);
	};

	const onFieldChange = (field: keyof InfoForm, value: string) => {
		setForm((prev) => {
			const next = { ...prev, [field]: value };
			saveDraft(id, next);
			return next;
		});
	};

	const onRecommend = () =>
		recommend.mutate(answers, {
			onSuccess: (tests) => {
				setAnswers([]);
				if (tests.length > 0) {
					const mapped = tests.map((t) => toWizardTest(t, testCategories));
					setRecommended(mapped);
					const chosen = uniqueById(mapped.slice(0, maxTests));
					setSelectedTestIds(chosen.map((t) => t.id));
					setSelectedTests(chosen);
					setAllTests((prev) => uniqueById([...prev, ...mapped]));
					if (mapped.length > maxTests)
						toast.warning("Таны хязгаар дүүрсэн байна");
				}
				toast.success("Тестүүд санал болголоо");
				setRecommendOpen(false);
			},
		});

	const openPreview = () =>
		window.open(raRoutes.preview(id), "_blank", "noopener,noreferrer");

	const disabled = continueDisabled({
		step,
		readOnly,
		publishing: publish.isPending || saving,
		infoFilled: isInfoFormFilled(form),
		selectedTestCount: selectedTestIds.length,
	});
	const disabledReason = readOnly
		? "Нийтлэгдсэн үнэлгээг засах боломжгүй"
		: step === 1 && !isInfoFormFilled(form)
			? "Ажлын байрны нэр, нэмэлт мэдээлэл, компанийн нэрийг бөглөнө үү"
			: step === 2 && selectedTestIds.length === 0
				? "Тест сонгоно уу"
				: undefined;

	const loadError = detail.error ?? info.error;
	const catalogError = (
		error: unknown,
		retry: () => void,
		fetching: boolean,
	) =>
		error ? (
			<ErrorState
				message={getErrorMessage(error, "Мэдээлэл авахад алдаа гарлаа")}
				onRetry={isRetryableError(error) ? retry : undefined}
				retrying={fetching}
				className="mt-6"
			/>
		) : null;

	return (
		<div className="h-full bg-white font-sf">
			<div className="sticky top-[var(--ra-banner-h,0px)] z-50 border-Stroke-500 border-b-[0.6px] bg-white shadow-sm">
				<div className="mx-auto px-4">
					<div className="flex h-[72px] items-center justify-between gap-2">
						<RaButton
							variant="ghost"
							title="Гарах"
							onClick={() => router.push(raRoutes.list())}
							prefixIcon={<ArrowLeftIcon />}
						/>
						<div className="relative hidden max-w-[800px] flex-1 justify-center md:flex">
							<TopStepper
								current={step}
								items={WIZARD_STEPS.map((s) => ({
									number: s.number,
									label: s.label,
									status: topStepStatus(s.number, step),
								}))}
							/>
						</div>
						<RaButton
							variant="outline"
							title="Харагдац"
							prefixIcon={<EyeIcon />}
							onClick={openPreview}
						/>
					</div>
				</div>
			</div>

			<div className="mx-auto mt-7 flex w-full max-w-[1280px] flex-col gap-[45px] rounded-lg bg-white pb-[80px] lg:flex-row">
				<div className="w-full min-w-0 p-8">
					{loadError ? (
						<ErrorState
							message={getErrorMessage(
								loadError,
								"Мэдээлэл авахад алдаа гарлаа",
							)}
							onRetry={
								isRetryableError(loadError)
									? () => {
											detail.refetch();
											info.refetch();
										}
									: undefined
							}
							retrying={detail.isFetching || info.isFetching}
						/>
					) : info.isPending || detail.isPending ? (
						<AntdSkeleton rows={8} />
					) : step === 1 ? (
						<StepInfo
							recruitmentId={id}
							form={form}
							onChange={onFieldChange}
							readOnly={readOnly}
						/>
					) : step === 2 ? (
						<StepTests
							categories={testCategories}
							selectedCategory={testCategory}
							onCategory={setTestCategory}
							tests={visibleTests}
							selectedIds={selectedTestIds}
							recommended={recommended}
							onToggle={toggleTest}
							onRecommend={() => setRecommendOpen(true)}
							onDetail={setDetailTestId}
							loading={testsQuery.isPending}
							error={catalogError(
								testsQuery.error ?? testCategoriesQuery.error,
								() => {
									testsQuery.refetch();
									testCategoriesQuery.refetch();
								},
								testsQuery.isFetching,
							)}
							readOnly={readOnly}
						/>
					) : step === 3 ? (
						<StepQuestions
							categories={questionCategories}
							selectedCategory={questionCategory}
							onCategory={setQuestionCategory}
							questions={catalogQuestions}
							selectedIds={selectedQuestionIds}
							onToggle={toggleQuestion}
							loading={questionsQuery.isPending}
							error={catalogError(
								questionsQuery.error ?? questionCategoriesQuery.error,
								() => {
									questionsQuery.refetch();
									questionCategoriesQuery.refetch();
								},
								questionsQuery.isFetching,
							)}
							readOnly={readOnly}
						/>
					) : (
						<StepConfirm
							jobTitle={form.jobTitle}
							tests={selectedTests}
							questions={selectedQuestions}
							totalDuration={fullDuration}
						/>
					)}
				</div>
				<div className="w-full px-4 lg:min-w-[351px] lg:max-w-[351px] lg:px-0">
					<div className="sticky top-[100px] min-h-[400px] rounded-xl bg-white p-4 shadow-md">
						<RightPanelContent
							state={state}
							visited={visited}
							selectedTests={selectedTests}
							selectedQuestions={selectedQuestions}
							selectedTestCount={selectedTestIds.length}
							selectedQuestionCount={selectedQuestionIds.length}
							maxTests={maxTests}
							maxQuestions={maxQuestions}
							onSelectStep={onSelectStep}
							onRemoveTest={toggleTest}
							onRemoveQuestion={toggleQuestion}
							summary={{
								testsQuestionTotal,
								testsDuration,
								fullDuration,
							}}
						/>
						<div className="border-Stroke-500 border-t pt-[10px]">
							<RaButton
								variant="primary"
								title={step === 4 ? "Нийтлэх" : "Үргэлжлүүлэх"}
								onClick={onContinue}
								className="w-full"
								suffixIcon={step === 4 ? undefined : <ArrowRightIcon />}
								disabled={disabled}
								disabledReason={disabledReason}
							/>
						</div>
					</div>
				</div>
			</div>

			<RecommendModal
				open={recommendOpen}
				onClose={() => {
					setRecommendOpen(false);
					setAnswers([]);
				}}
				answers={answers}
				onAnswer={(index, value) =>
					setAnswers((prev) => {
						const next = [...prev];
						next[index] = value as RecommendAnswer;
						return next;
					})
				}
				onRecommend={onRecommend}
				loading={recommend.isPending}
			/>
			<RaConfirmDialog
				open={confirmPublish}
				onClose={() => setConfirmPublish(false)}
				onConfirm={() =>
					publish.mutate(undefined, {
						onSuccess: () => {
							setConfirmPublish(false);
							setPublished(true);
						},
					})
				}
				title="Талентийн үнэлгээг нийтлэх үү?"
				description="Нийтэлсний дараа мэдээлэл, тест, нэмэлт асуултыг засах боломжгүй болно."
				confirmLabel="Нийтлэх"
				pendingLabel="Нийтэлж байна..."
				loading={publish.isPending}
				danger={false}
			/>
			<PublishedModal
				open={published}
				onGo={() => {
					setPublished(false);
					router.push(raRoutes.dashboard(id));
				}}
			/>
			<TestDetailDrawer
				testId={detailTestId}
				onClose={() => setDetailTestId(null)}
				footerExtra={
					<RaButton
						variant="primary"
						title={
							detailTestId && selectedTestIds.includes(detailTestId)
								? "Нэмсэн"
								: "Тест нэмэх"
						}
						onClick={() => {
							if (detailTestId && !selectedTestIds.includes(detailTestId)) {
								toggleTest(detailTestId);
							}
							setDetailTestId(null);
						}}
						className="w-[136px]"
						disabled={
							readOnly ||
							Boolean(detailTestId && selectedTestIds.includes(detailTestId))
						}
					/>
				}
			/>
		</div>
	);
}
