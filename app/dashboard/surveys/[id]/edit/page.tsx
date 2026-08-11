"use client";

import { AlertTriangle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import EditorPreview from "@/components/surveys/editor/EditorPreview";
import EditorPublishModal from "@/components/surveys/editor/EditorPublishModal";
import EditorRightPanel from "@/components/surveys/editor/EditorRightPanel";
import EditorSidebar, {
	type EditorSidebarHandle,
	type QuestionItem,
	type SectionType,
} from "@/components/surveys/editor/EditorSidebar";
import EditorTopBar from "@/components/surveys/editor/EditorTopBar";

const DesignModal = lazy(
	() => import("@/components/surveys/editor/DesignModal"),
);
const SettingsModal = lazy(
	() => import("@/components/surveys/editor/SettingsModal"),
);

import { useQueryClient } from "@tanstack/react-query";
import type {
	CreateQuestionPayload,
	SurveyDetail,
	SurveyQuestion,
} from "@/lib/api";
import { createQuestion, deleteQuestion, updateSurveyPage } from "@/lib/api";
import { BUTTON, DEFAULT, TOAST } from "@/lib/helptext";
import { useCreateQuestion } from "@/lib/hooks/useCreateQuestion";
import { useDeleteQuestion } from "@/lib/hooks/useDeleteQuestion";
import { usePublishSurvey } from "@/lib/hooks/usePublishSurvey";
import { useSurveyDetail } from "@/lib/hooks/useSurveyDetail";
import { useUpdateSurveyPage } from "@/lib/hooks/useUpdateSurveyPage";
import { type ThemeName, themes } from "@/lib/theme";

function mapQuestion(q: SurveyQuestion): QuestionItem {
	return {
		id: q.id,
		title: q.content,
		questionType: q.questionType,
		isRequired: q.isRequired,
		minAnswerCount: q.minAnswerCount,
		maxAnswerCount: q.maxAnswerCount,
		section: q.section,
		toBeAssessed: q.toBeAssessed,
		options: (q.options ?? []).map((opt) => ({
			id: opt.id,
			content: opt.content,
			point: opt.point,
			order: opt.order,
		})),
	};
}

function EditorSkeleton() {
	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center h-14 px-4 border-b-2 border-border bg-card shrink-0 gap-3">
				<div className="w-8 h-8 bg-muted animate-pulse" />
				<div className="h-4 w-48 bg-muted animate-pulse" />
			</div>
			<div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
				<div className="w-full lg:w-64 border-r-2 border-border bg-card p-4 space-y-3 shrink-0">
					<div className="h-4 w-20 bg-muted animate-pulse" />
					<div className="h-8 bg-muted animate-pulse" />
					<div className="h-4 w-20 bg-muted animate-pulse mt-4" />
					<div className="h-8 bg-muted animate-pulse" />
					<div className="h-8 bg-muted animate-pulse" />
				</div>
				<div className="flex-1 flex items-center justify-center p-6">
					<div className="h-[500px] w-full max-w-2xl bg-muted/30 animate-pulse" />
				</div>
				<div className="w-full lg:w-80 border-l-2 border-border bg-card p-4 space-y-5 shrink-0">
					<div className="h-4 w-32 bg-muted animate-pulse" />
					<div className="h-10 bg-muted animate-pulse" />
					<div className="h-20 bg-muted animate-pulse" />
					<div className="h-10 bg-muted animate-pulse" />
				</div>
			</div>
		</div>
	);
}

function ErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry?: () => void;
}) {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center h-full gap-4">
			<div className="flex h-12 w-12 items-center justify-center border-2 border-destructive/30 text-destructive">
				<AlertTriangle size={20} />
			</div>
			<p
				className="text-xs uppercase tracking-widest text-destructive text-center"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{message}
			</p>
			<div className="flex gap-2">
				{onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{BUTTON.RETRY}
					</button>
				)}
				<button
					type="button"
					onClick={() => router.push("/dashboard/surveys")}
					className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					{BUTTON.BACK}
				</button>
			</div>
		</div>
	);
}

function extractStartPage(data: SurveyDetail) {
	return data.pages?.START?.[0] ?? null;
}

function extractEndPage(data: SurveyDetail) {
	return data.pages?.END?.[0] ?? null;
}

function normalizeThemeType(raw: string | undefined): ThemeName {
	if (!raw) return "dark";
	const lower = raw.toLowerCase() as ThemeName;
	return lower in themes ? lower : "dark";
}

export default function SurveyEditPage() {
	const params = useParams();
	const router = useRouter();
	const surveyId = params?.id as string;

	const {
		data: surveyData,
		isLoading: isLoadingSurvey,
		isError: isSurveyError,
		error: surveyError,
		refetch: refetchSurvey,
	} = useSurveyDetail(surveyId);

	const [activeSection, setActiveSection] = useState<SectionType>("homepage");
	const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
	const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
		"desktop",
	);
	const [showPublishModal, setShowPublishModal] = useState(false);
	const [publishDate, setPublishDate] = useState("");
	const [showDesignModal, setShowDesignModal] = useState(false);
	const [selectedTheme, setSelectedTheme] = useState<ThemeName>("dark");
	const [hideWatermark, setHideWatermark] = useState(false);

	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [settingsDeviceCheck, setSettingsDeviceCheck] = useState<
		boolean | null
	>(null);
	const [settingsPassCodeProtected, setSettingsPassCodeProtected] = useState<
		boolean | null
	>(null);

	const [title, setTitle] = useState<string | null>(null);
	const [description, setDescription] = useState<string | null>(null);
	const [buttonText, setButtonText] = useState<string | null>(null);
	const [endingTitle, setEndingTitle] = useState<string | null>(null);
	const [endingDescription, setEndingDescription] = useState<string | null>(
		null,
	);

	const [questions, setQuestions] = useState<QuestionItem[]>([]);
	const [isDirty, setIsDirty] = useState(false);
	// local flag to prevent duplicate save requests from rapid clicks
	const [localSaving, setLocalSaving] = useState(false);

	const sidebarRef = useRef<EditorSidebarHandle>(null);
	const isAnimatingRef = useRef(false);
	const initializedRef = useRef(false);

	useEffect(() => {
		if (!surveyData || initializedRef.current) return;
		initializedRef.current = true;
		const customFirstQuestions =
			surveyData.customQuestions?.CUSTOM_QUESTION_FIRST ?? [];
		const customLastQuestions =
			surveyData.customQuestions?.CUSTOM_QUESTION_LAST ?? [];
		const templateQuestions = surveyData.templateQuestions ?? [];
		const merged = [
			...customFirstQuestions.map((q) => ({
				...mapQuestion(q),
				section: "CUSTOM_QUESTION_FIRST" as const,
			})),
			...customLastQuestions.map((q) => ({
				...mapQuestion(q),
				section: "CUSTOM_QUESTION_LAST" as const,
			})),
			...templateQuestions.map((q) => ({
				...mapQuestion(q),
				section: "PRIMARY_QUESTION" as const,
			})),
		];
		setQuestions(merged);
		if (surveyData.design?.themeType) {
			setSelectedTheme(normalizeThemeType(surveyData.design.themeType));
		}
		setHideWatermark(surveyData.design?.showAppLogo === false);
		setSettingsDeviceCheck(surveyData.deviceCheck);
		setSettingsPassCodeProtected(surveyData.passCodeProtected);
		setIsDirty(false);
	}, [surveyData]);

	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			if (isDirty) {
				e.preventDefault();
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);

	const activeQuestion: QuestionItem | null = activeQuestionId
		? (questions.find((q) => q.id === activeQuestionId) ?? null)
		: null;

	const startPage = surveyData ? extractStartPage(surveyData) : null;
	const endPage = surveyData ? extractEndPage(surveyData) : null;

	const effectiveTitle = title ?? startPage?.title ?? "";
	const effectiveDescription = description ?? startPage?.content ?? "";
	const effectiveButtonText = buttonText ?? startPage?.btnLabel ?? "";
	const effectiveEndingTitle = endingTitle ?? endPage?.title ?? "";
	const effectiveEndingDescription =
		endingDescription ?? endPage?.content ?? "";

	const effectiveSettingsDeviceCheck =
		settingsDeviceCheck ?? surveyData?.deviceCheck ?? false;
	const effectiveSettingsPassCodeProtected =
		settingsPassCodeProtected ?? surveyData?.passCodeProtected ?? false;

	const updatePageMutation = useUpdateSurveyPage({
		surveyId,
	});

	const createQuestionMutation = useCreateQuestion({
		surveyId,
	});

	const deleteQuestionMutation = useDeleteQuestion({
		surveyId,
	});

	const queryClient = useQueryClient();

	const publishMutation = usePublishSurvey({
		surveyId,
		onSuccess: () => {
			setShowPublishModal(false);
			setPublishDate("");
			router.push("/dashboard/surveys");
		},
	});

	const handleSectionSelect = useCallback(
		(section: SectionType, questionId?: string) => {
			setActiveSection(section);
			setActiveQuestionId(questionId ?? null);
		},
		[],
	);

	const handleQuestionTitleChange = useCallback(
		(questionId: string, value: string) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) => (q.id === questionId ? { ...q, title: value } : q)),
			);
		},
		[],
	);

	const handleQuestionTypeChange = useCallback(
		(questionId: string, value: string) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) => {
					if (q.id !== questionId) return q;

					function makeOpt(order: number, content = "") {
						return { content, point: 0, order };
					}

					let options = q.options;

					if (value === "TEXT") {
						options = [];
					} else if (value === "YES_NO" && q.options.length < 2) {
						options = [makeOpt(1, "Тийм"), makeOpt(2, "Үгүй")];
					} else if (value === "STAR_RATING" && q.options.length < 2) {
						options = Array.from({ length: 5 }, (_, i) =>
							makeOpt(i + 1, `${i + 1} Од`),
						);
					} else if (value === "NUMBER_RATING" && q.options.length < 2) {
						options = Array.from({ length: 10 }, (_, i) =>
							makeOpt(i + 1, `${i + 1} оноо`),
						);
					} else if (
						(value === "SINGLE_CHOICE" || value === "MULTIPLE_CHOICE") &&
						q.options.length < 2
					) {
						options = [makeOpt(1), makeOpt(2)];
					}

					const optionCount = options.length;
					const isMultiple = value === "MULTIPLE_CHOICE";
					return {
						...q,
						questionType: value,
						options,
						minAnswerCount: isMultiple ? 0 : 1,
						maxAnswerCount: isMultiple
							? Math.min(q.maxAnswerCount || optionCount, optionCount)
							: 1,
					};
				}),
			);
		},
		[],
	);

	const handleQuestionRequiredChange = useCallback(
		(questionId: string, value: boolean) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) =>
					q.id === questionId ? { ...q, isRequired: value } : q,
				),
			);
		},
		[],
	);

	const handleQuestionMinChange = useCallback(
		(questionId: string, value: number) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) =>
					q.id === questionId ? { ...q, minAnswerCount: value } : q,
				),
			);
		},
		[],
	);

	const handleQuestionMaxChange = useCallback(
		(questionId: string, value: number) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) =>
					q.id === questionId ? { ...q, maxAnswerCount: value } : q,
				),
			);
		},
		[],
	);

	const handleOptionContentChange = useCallback(
		(questionId: string, optionIndex: number, value: string) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) => {
					if (q.id !== questionId) return q;
					const newOptions = q.options.map((opt, idx) =>
						idx === optionIndex ? { ...opt, content: value } : opt,
					);
					return { ...q, options: newOptions };
				}),
			);
		},
		[],
	);

	const handleOptionPointChange = useCallback(
		(questionId: string, optionIndex: number, value: number) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) => {
					if (q.id !== questionId) return q;
					const newOptions = q.options.map((opt, idx) =>
						idx === optionIndex ? { ...opt, point: value } : opt,
					);
					return { ...q, options: newOptions };
				}),
			);
		},
		[],
	);

	const handleAddOption = useCallback((questionId: string) => {
		setIsDirty(true);
		setQuestions((prev) =>
			prev.map((q) => {
				if (q.id !== questionId) return q;
				const newOption = {
					content: "",
					point: 0,
					order: q.options.length + 1,
				};
				return {
					...q,
					options: [...q.options, newOption],
					maxAnswerCount:
						q.questionType === "MULTIPLE_CHOICE"
							? q.options.length + 1
							: q.maxAnswerCount,
				};
			}),
		);
	}, []);

	const handleRemoveOption = useCallback(
		(questionId: string, optionIndex: number) => {
			setQuestions((prev) => {
				const q = prev.find((item) => item.id === questionId);
				if (!q) return prev;
				if (q.options.length <= 1) {
					toast.error(TOAST.OPTION_DELETE_ERROR);
					return prev;
				}
				setIsDirty(true);
				return prev.map((item) => {
					if (item.id !== questionId) return item;
					const newOptions = item.options
						.filter((_, idx) => idx !== optionIndex)
						.map((opt, idx) => ({ ...opt, order: idx + 1 }));
					return {
						...item,
						options: newOptions,
						maxAnswerCount:
							item.questionType === "MULTIPLE_CHOICE"
								? Math.min(item.maxAnswerCount, newOptions.length)
								: item.maxAnswerCount,
					};
				});
			});
		},
		[],
	);

	const handleOptionReorder = useCallback(
		(questionId: string, oldIndex: number, newIndex: number) => {
			setIsDirty(true);
			setQuestions((prev) =>
				prev.map((q) => {
					if (q.id !== questionId) return q;
					const newOptions = [...q.options];
					const [moved] = newOptions.splice(oldIndex, 1);
					newOptions.splice(newIndex, 0, moved);
					return {
						...q,
						options: newOptions.map((opt, idx) => ({
							...opt,
							order: idx + 1,
						})),
					};
				}),
			);
		},
		[],
	);

	const _handleSwapQuestion = useCallback(
		(questionId: string, direction: "up" | "down") => {
			if (isAnimatingRef.current) return;
			isAnimatingRef.current = true;

			sidebarRef.current?.recordPositions();

			flushSync(() => {
				setIsDirty(true);
				setQuestions((prev) => {
					const idx = prev.findIndex((q) => q.id === questionId);
					if (idx === -1) return prev;
					const newIdx = direction === "up" ? idx - 1 : idx + 1;
					if (newIdx < 0 || newIdx >= prev.length) return prev;
					const swapped = [...prev];
					[swapped[idx], swapped[newIdx]] = [swapped[newIdx], swapped[idx]];
					return swapped;
				});
			});

			sidebarRef.current?.animatePositions();
			setTimeout(() => {
				isAnimatingRef.current = false;
			}, 400);
		},
		[],
	);

	type ReorderCategory = "CUSTOM_QUESTION_FIRST" | "CUSTOM_QUESTION_LAST";

	const handleReorderQuestions = useCallback(
		(
			_activeId: string,
			_overId: string,
			activeCategory: ReorderCategory,
			overCategory: ReorderCategory,
			activeIndex: number,
			overIndex: number,
		) => {
			setIsDirty(true);
			setQuestions((prev) => {
				const activeQuestions = prev.filter(
					(q) => q.section === activeCategory,
				);
				const otherQuestions = prev.filter(
					(q) => q.section !== activeCategory && q.section !== overCategory,
				);
				const overQuestions =
					activeCategory === overCategory
						? activeQuestions
						: prev.filter((q) => q.section === overCategory);

				if (activeCategory === overCategory) {
					const reordered = [...activeQuestions];
					const [moved] = reordered.splice(activeIndex, 1);
					reordered.splice(overIndex, 0, moved);
					return [
						...otherQuestions,
						...reordered.map((q, _i) => ({
							...q,
							options: (q.options ?? []).map((opt, optIdx) => ({
								...opt,
								order: optIdx + 1,
							})),
						})),
					];
				}

				const movedItem = {
					...activeQuestions[activeIndex],
					section: overCategory,
				};
				const newActive = [
					...activeQuestions.slice(0, activeIndex),
					...activeQuestions.slice(activeIndex + 1),
				];
				const newOver = [
					...overQuestions.slice(0, overIndex),
					movedItem,
					...overQuestions.slice(overIndex),
				];

				return [
					...otherQuestions,
					...newActive.map((q, _i) => ({
						...q,
						options: (q.options ?? []).map((opt, optIdx) => ({
							...opt,
							order: optIdx + 1,
						})),
					})),
					...newOver.map((q, _i) => ({
						...q,
						options: (q.options ?? []).map((opt, optIdx) => ({
							...opt,
							order: optIdx + 1,
						})),
					})),
				];
			});
		},
		[],
	);

	const handleDeleteQuestion = useCallback(
		(questionId: string) => {
			deleteQuestionMutation.mutate(
				{ id: questionId },
				{
					onSuccess: (response) => {
						if (!response.success) return;
						setQuestions((prev) => prev.filter((q) => q.id !== questionId));
						if (activeQuestionId === questionId) {
							setActiveQuestionId(null);
							setActiveSection("homepage");
						}
					},
				},
			);
		},
		[deleteQuestionMutation, activeQuestionId],
	);

	const handleCreateQuestionFromPopover = useCallback(
		async (payload: CreateQuestionPayload) => {
			const result = await createQuestionMutation.mutateAsync(payload);
			if (result.success && result.data?.id) {
				// optimistic insert so the selected type appears immediately
				const newQ: QuestionItem = {
					id: result.data.id,
					title: payload.content,
					questionType: payload.questionType,
					isRequired: payload.isRequired,
					minAnswerCount: payload.minAnswerCount,
					maxAnswerCount: payload.maxAnswerCount,
					options: (payload.options ?? []).map((opt) => ({
						id: String(opt.order),
						content: opt.content,
						point: opt.point,
						order: opt.order,
					})),
					section: payload.section,
					toBeAssessed: payload.toBeAssessed,
				};
				setQuestions((prev) => [...prev, newQ]);
				setActiveQuestionId(result.data.id);
				setActiveSection("question");
			}
			return result;
		},
		[questions, createQuestionMutation],
	);

	const handleSave = useCallback(async () => {
		if (localSaving) return; // prevent duplicate saves
		setLocalSaving(true);

		// Validate
		const hasEmptyTitle = questions.some((q) => !q.title.trim());
		const hasEmptyOption = questions.some((q) =>
			q.options.some((opt) => !opt.content.trim()),
		);
		if (hasEmptyTitle || hasEmptyOption) {
			setLocalSaving(false);
			toast.error(TOAST.VALIDATION_ERROR);
			return;
		}

		toast.loading(TOAST.SAVE_LOADING, { id: "save-survey" });

		try {
			// update pages (call API directly to avoid per-mutation invalidations)
			const pageCalls: Promise<unknown>[] = [];

			if (startPage) {
				pageCalls.push(
					updateSurveyPage(surveyId, {
						id: startPage.id,
						qnSection: startPage.qnSection,
						pageType: startPage.pageType,
						title: effectiveTitle,
						content: effectiveDescription,
						btnLabel: effectiveButtonText || undefined,
						pageOrder: startPage.pageOrder,
					}),
				);
			}

			if (endPage) {
				pageCalls.push(
					updateSurveyPage(surveyId, {
						id: endPage.id,
						qnSection: endPage.qnSection,
						pageType: endPage.pageType,
						title: effectiveEndingTitle,
						content: effectiveEndingDescription,
						pageOrder: endPage.pageOrder,
					}),
				);
			}

			await Promise.all(pageCalls);

			// Save questions sequentially to avoid race conditions. Call API directly so we don't invalidate on every op.
			for (const q of questions) {
				if (q.section === "PRIMARY_QUESTION") continue;

				const payload: CreateQuestionPayload = {
					id: 0,
					content: q.title,
					description: "",
					questionType: q.questionType,
					section: q.section,
					isRequired: q.isRequired,
					minAnswerCount: q.minAnswerCount,
					maxAnswerCount: q.maxAnswerCount,
					toBeAssessed: q.toBeAssessed,
					options: q.options.map((opt, idx) => ({
						id: 0,
						order: idx + 1,
						content: opt.content,
						point: opt.point,
						tag: "I",
						nextQuestionId: 0,
					})),
					matrixRows: [],
				};

				const createResult = await createQuestion(surveyId, payload);
				if (!createResult.success) {
					throw new Error(
						`Failed to save question: ${createResult.error || "Unknown error"}`,
					);
				}

				const delRes = await deleteQuestion(surveyId, { id: q.id });
				if (!delRes.success) {
					throw new Error(
						`Failed to delete placeholder question: ${delRes.error || "Unknown"}`,
					);
				}
			}

			// invalidate once at end
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });

			toast.dismiss("save-survey");
			toast.success(TOAST.SAVE_SUCCESS);
			setIsDirty(false);
		} catch (error) {
			toast.dismiss("save-survey");
			toast.error(error instanceof Error ? error.message : TOAST.SAVE_ERROR);
		} finally {
			setLocalSaving(false);
		}
	}, [
		questions,
		startPage,
		endPage,
		effectiveTitle,
		effectiveDescription,
		effectiveButtonText,
		effectiveEndingTitle,
		effectiveEndingDescription,
		surveyId,
		queryClient,
		localSaving,
	]);

	const handlePublishClick = useCallback(() => {
		setShowPublishModal(true);
	}, []);

	const handlePublishConfirm = useCallback(() => {
		if (!publishDate) return;
		if (!effectiveTitle.trim()) {
			toast.error(TOAST.VALIDATION_ERROR);
			return;
		}
		if (questions.length === 0) {
			toast.error("Хамгийн багадаа нэг асуулт нэмнэ үү");
			return;
		}
		publishMutation.mutate({ value: publishDate });
	}, [publishDate, publishMutation, effectiveTitle, questions.length]);

	const handleBack = useCallback(() => {
		if (isDirty && !window.confirm(TOAST.UNSAVED_CHANGES)) return;
		router.push("/dashboard/surveys");
	}, [isDirty, router]);

	const handlePublishCancel = useCallback(() => {
		setShowPublishModal(false);
		setPublishDate("");
	}, []);

	if (isLoadingSurvey) {
		return <EditorSkeleton />;
	}

	if (isSurveyError) {
		return (
			<ErrorState
				message={surveyError?.message || TOAST.FETCH_ERROR}
				onRetry={() => refetchSurvey()}
			/>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<EditorTopBar
				surveyName={effectiveTitle || surveyData?.name || DEFAULT.SURVEY_NAME}
				activeDevice={device}
				onDeviceChange={setDevice}
				onSave={handleSave}
				onPublish={handlePublishClick}
				onBack={handleBack}
				onDesignClick={() => setShowDesignModal(true)}
				onSettingsClick={() => setShowSettingsModal(true)}
				isSaving={
					localSaving ||
					updatePageMutation.isPending ||
					createQuestionMutation.isPending ||
					deleteQuestionMutation.isPending
				}
				isPublishing={publishMutation.isPending}
			/>
			<div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
				<EditorSidebar
					ref={sidebarRef}
					activeSection={activeSection}
					activeQuestionId={activeQuestionId}
					questions={questions}
					onSectionSelect={handleSectionSelect}
					onDeleteQuestion={handleDeleteQuestion}
					onReorderQuestions={handleReorderQuestions}
					onCreateQuestion={handleCreateQuestionFromPopover}
				/>
				<EditorPreview
					activeSection={activeSection}
					activeQuestionId={activeQuestionId}
					questions={questions}
					activeQuestion={activeQuestion}
					title={effectiveTitle}
					description={effectiveDescription}
					buttonText={effectiveButtonText}
					device={device}
					endingTitle={effectiveEndingTitle}
					endingDescription={effectiveEndingDescription}
					theme={selectedTheme}
				/>
				<EditorRightPanel
					activeSection={activeSection}
					activeQuestionId={activeQuestionId}
					activeQuestion={activeQuestion}
					title={effectiveTitle}
					description={effectiveDescription}
					buttonText={effectiveButtonText}
					endingTitle={effectiveEndingTitle}
					endingDescription={effectiveEndingDescription}
					onTitleChange={setTitle}
					onDescriptionChange={setDescription}
					onButtonTextChange={setButtonText}
					onEndingTitleChange={setEndingTitle}
					onEndingDescriptionChange={setEndingDescription}
					onQuestionTitleChange={handleQuestionTitleChange}
					onQuestionTypeChange={handleQuestionTypeChange}
					onQuestionRequiredChange={handleQuestionRequiredChange}
					onQuestionMinChange={handleQuestionMinChange}
					onQuestionMaxChange={handleQuestionMaxChange}
					onOptionContentChange={handleOptionContentChange}
					onOptionPointChange={handleOptionPointChange}
					onAddOption={handleAddOption}
					onRemoveOption={handleRemoveOption}
					onOptionReorder={handleOptionReorder}
				/>
			</div>

			<Suspense fallback={null}>
				<DesignModal
					isOpen={showDesignModal}
					onClose={() => setShowDesignModal(false)}
					currentTheme={selectedTheme}
					onThemeChange={setSelectedTheme}
					onLogoUpload={(file) => {
						console.log("Logo uploaded:", file.name);
					}}
					hideWatermark={hideWatermark}
					onHideWatermarkChange={setHideWatermark}
				/>
			</Suspense>

			<Suspense fallback={null}>
				<SettingsModal
					surveyId={surveyId}
					isOpen={showSettingsModal}
					onClose={() => setShowSettingsModal(false)}
					deviceCheck={effectiveSettingsDeviceCheck}
					passCodeProtected={effectiveSettingsPassCodeProtected}
					onDeviceCheckChange={setSettingsDeviceCheck}
					onPassCodeProtectedChange={setSettingsPassCodeProtected}
				/>
			</Suspense>

			{showPublishModal && (
				<EditorPublishModal
					publishDate={publishDate}
					onDateChange={setPublishDate}
					onConfirm={handlePublishConfirm}
					onCancel={handlePublishCancel}
					isPending={publishMutation.isPending}
				/>
			)}
		</div>
	);
}
