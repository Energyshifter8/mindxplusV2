"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type ApiResponse,
	type UpdateSurveyPagePayload,
	type UpdateSurveyPageResponse,
	updateSurveyPage,
} from "@/lib/api";
import { TOAST } from "@/lib/helptext";

interface UseUpdateSurveyPageOptions {
	surveyId: string;
	onSuccess?: () => void;
}

export function useUpdateSurveyPage({
	surveyId,
	onSuccess,
}: UseUpdateSurveyPageOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateSurveyPagePayload) =>
			updateSurveyPage(surveyId, payload),
		onMutate: () => {
			// show/update a single loading toast with a stable id so duplicates are avoided
			toast.loading(TOAST.SAVE_LOADING, { id: "save-survey" });
		},
		onSuccess: (response: ApiResponse<UpdateSurveyPageResponse>) => {
			// update the same toast to success (no explicit dismiss) to ensure only one notification
			if (!response.success) {
				toast.error(response.error || TOAST.SAVE_ERROR, { id: "save-survey" });
				return;
			}

			toast.success(TOAST.SAVE_SUCCESS, { id: "save-survey" });
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			// update the same toast to an error state
			toast.error(error.message || TOAST.SAVE_ERROR, { id: "save-survey" });
		},
	});
}
