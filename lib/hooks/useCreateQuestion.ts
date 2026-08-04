"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type ApiResponse,
	type CreateQuestionPayload,
	type CreateQuestionResponse,
	createQuestion,
} from "@/lib/api";
import { TOAST } from "@/lib/helptext";

interface UseCreateQuestionOptions {
	surveyId: string;
	onSuccess?: (questionId: string) => void;
}

export function useCreateQuestion({
	surveyId,
	onSuccess,
}: UseCreateQuestionOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateQuestionPayload) =>
			createQuestion(surveyId, payload),
		onMutate: () => {
			toast.loading(TOAST.SAVE_LOADING, { id: "create-question" });
		},
		onSuccess: (response: ApiResponse<CreateQuestionResponse>) => {
			toast.dismiss("create-question");

			if (!response.success) {
				toast.error(response.error || TOAST.SAVE_ERROR);
				return;
			}

			toast.success(TOAST.SAVE_SUCCESS);
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
			onSuccess?.(response.data?.id ?? "");
		},
		onError: (error: Error) => {
			toast.dismiss("create-question");
			toast.error(error.message || TOAST.SAVE_ERROR);
		},
	});
}
