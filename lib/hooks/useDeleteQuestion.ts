"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type ApiResponse,
	type DeleteQuestionPayload,
	deleteQuestion,
} from "@/lib/api";
import { TOAST } from "@/lib/helptext";

interface UseDeleteQuestionOptions {
	surveyId: string;
	onSuccess?: () => void;
}

export function useDeleteQuestion({
	surveyId,
	onSuccess,
}: UseDeleteQuestionOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: DeleteQuestionPayload) =>
			deleteQuestion(surveyId, payload),
		onMutate: () => {
			toast.loading(TOAST.SAVE_LOADING, { id: "delete-question" });
		},
		onSuccess: (response: ApiResponse<unknown>) => {
			toast.dismiss("delete-question");

			if (!response.success) {
				toast.error(response.error || TOAST.SAVE_ERROR);
				return;
			}

			toast.success(TOAST.SAVE_SUCCESS);
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.dismiss("delete-question");
			toast.error(error.message || TOAST.SAVE_ERROR);
		},
	});
}
