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
		onMutate: (_payload) => {
			toast.loading(TOAST.SAVE_LOADING, { id: "create-question" });
		},
		onSuccess: (response: ApiResponse<CreateQuestionResponse>) => {
			// update the same toast instance for create flows
			toast.dismiss("create-question");

			if (!response.success) {
				console.error("[useCreateQuestion] API error:", response.error);
				toast.error(response.error || TOAST.SAVE_ERROR, {
					id: "create-question",
				});
				return;
			}

			// show a question-specific success message (keeps older generic save message separate)
			toast.success("Асуулт амжилттай нэмэгдлээ", { id: "create-question" });
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
			onSuccess?.(response.data?.id ?? "");
		},
		onError: (error: Error) => {
			console.error("[useCreateQuestion] onError:", error);
			toast.dismiss("create-question");
			toast.error(error.message || TOAST.SAVE_ERROR, { id: "create-question" });
		},
	});
}
