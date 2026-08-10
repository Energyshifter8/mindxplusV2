"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
	type CreateQuestionPayload,
	createQuestion,
	deleteQuestion,
} from "@/lib/api";
import { TOAST } from "@/lib/helptext";

export type QuestionCategory = "CUSTOM_QUESTION_FIRST" | "CUSTOM_QUESTION_LAST";

export interface ReorderableQuestion {
	id: string;
	title: string;
	questionType: string;
	isRequired: boolean;
	minAnswerCount: number;
	maxAnswerCount: number;
	options: Array<{
		id?: string;
		content: string;
		point: number;
		order: number;
	}>;
	category: QuestionCategory;
}

interface ReorderResult {
	success: boolean;
	errors: string[];
}

function recalculateOrders(
	items: Record<QuestionCategory, ReorderableQuestion[]>,
): Record<QuestionCategory, ReorderableQuestion[]> {
	const result: Record<QuestionCategory, ReorderableQuestion[]> = {
		CUSTOM_QUESTION_FIRST: [],
		CUSTOM_QUESTION_LAST: [],
	};

	for (const category of [
		"CUSTOM_QUESTION_FIRST",
		"CUSTOM_QUESTION_LAST",
	] as const) {
		result[category] = items[category].map((item) => ({
			...item,
			options: (item.options ?? []).map((opt, optIdx) => ({
				...opt,
				order: optIdx + 1,
			})),
		}));
	}

	return result;
}

function buildQuestionsToDeleteAndCreate(
	newItems: Record<QuestionCategory, ReorderableQuestion[]>,
): {
	toDelete: string[];
	toCreate: Array<CreateQuestionPayload & { originalId: string }>;
} {
	const toDelete: string[] = [];
	const toCreate: Array<CreateQuestionPayload & { originalId: string }> = [];

	for (const category of [
		"CUSTOM_QUESTION_FIRST",
		"CUSTOM_QUESTION_LAST",
	] as const) {
		newItems[category].forEach((item) => {
			toDelete.push(item.id);
			toCreate.push({
				originalId: item.id,
				id: 0,
				content: item.title,
				description: "",
				questionType: item.questionType,
				section: category,
				isRequired: item.isRequired,
				minAnswerCount: item.minAnswerCount,
				maxAnswerCount: item.maxAnswerCount,
				options: (item.options ?? []).map((opt, optIdx) => ({
					id: 0,
					order: optIdx + 1,
					content: opt.content,
					point: opt.point,
					tag: "I",
					nextQuestionId: 0,
				})),
				matrixRows: [],
			});
		});
	}

	return { toDelete, toCreate };
}

async function executeReorder(
	surveyId: string,
	newItems: Record<QuestionCategory, ReorderableQuestion[]>,
): Promise<ReorderResult> {
	const { toDelete, toCreate } = buildQuestionsToDeleteAndCreate(newItems);
	const errors: string[] = [];

	for (const questionId of toDelete) {
		try {
			const result = await deleteQuestion(surveyId, { id: questionId });
			if (!result.success) {
				errors.push(
					`Failed to delete question ${questionId}: ${result.error || "Unknown error"}`,
				);
			}
		} catch (err) {
			errors.push(
				`Failed to delete question ${questionId}: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		}
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	for (const payload of toCreate) {
		try {
			const result = await createQuestion(surveyId, payload);
			if (!result.success) {
				errors.push(
					`Failed to recreate question ${payload.originalId}: ${result.error || "Unknown error"}`,
				);
			}
		} catch (err) {
			errors.push(
				`Failed to recreate question ${payload.originalId}: ${err instanceof Error ? err.message : "Unknown error"}`,
			);
		}
	}

	return { success: errors.length === 0, errors };
}

export function useReorderQuestions({
	surveyId,
	initialItems,
	onOptimisticUpdate,
}: {
	surveyId: string;
	initialItems: Record<QuestionCategory, ReorderableQuestion[]>;
	onOptimisticUpdate?: (
		items: Record<QuestionCategory, ReorderableQuestion[]>,
	) => void;
}) {
	const queryClient = useQueryClient();
	const [items, setItems] = useState<
		Record<QuestionCategory, ReorderableQuestion[]>
	>(() => recalculateOrders(initialItems));

	const previousItemsRef = useRef<Record<
		QuestionCategory,
		ReorderableQuestion[]
	> | null>(null);

	const mutation = useMutation({
		mutationFn: (newItems: Record<QuestionCategory, ReorderableQuestion[]>) =>
			executeReorder(surveyId, newItems),
		onMutate: () => {
			toast.loading("Эрэмбэлж байна...", { id: "reorder-questions" });
		},
		onSuccess: (response: ReorderResult) => {
			toast.dismiss("reorder-questions");
			if (response.success) {
				toast.success("Эрэмбэлэлт хадгалагдлаа");
				queryClient.invalidateQueries({
					queryKey: ["surveyDetail", surveyId],
				});
			} else {
				const errorMsg = response.errors.join("; ") || TOAST.SAVE_ERROR;
				toast.error(errorMsg);
				if (previousItemsRef.current) {
					setItems(previousItemsRef.current);
					onOptimisticUpdate?.(previousItemsRef.current);
					previousItemsRef.current = null;
				}
			}
		},
		onError: (error: Error) => {
			toast.dismiss("reorder-questions");
			toast.error(error.message || TOAST.SAVE_ERROR);
			if (previousItemsRef.current) {
				setItems(previousItemsRef.current);
				onOptimisticUpdate?.(previousItemsRef.current);
				previousItemsRef.current = null;
			}
		},
	});

	const reverseCategory = useCallback(
		(
			category: QuestionCategory,
		): Record<QuestionCategory, ReorderableQuestion[]> | null => {
			let result: Record<QuestionCategory, ReorderableQuestion[]> | null = null;
			setItems((prev) => {
				const reversed = [...prev[category]].reverse();
				const next = { ...prev, [category]: reversed };
				const recalculated = recalculateOrders(next);
				result = recalculated;
				return recalculated;
			});
			return result;
		},
		[],
	);

	const flushSave = useCallback(
		(newItems: Record<QuestionCategory, ReorderableQuestion[]>) => {
			previousItemsRef.current = { ...newItems };
			mutation.mutate(newItems);
		},
		[mutation],
	);

	const resetItems = useCallback(
		(newItems: Record<QuestionCategory, ReorderableQuestion[]>) => {
			setItems(recalculateOrders(newItems));
		},
		[],
	);

	return {
		items,
		reverseCategory,
		flushSave,
		resetItems,
		isSaving: mutation.isPending,
	};
}
