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
			toast.loading(TOAST.SAVE_LOADING, { id: "save-survey" });
		},
		onSuccess: (response: ApiResponse<UpdateSurveyPageResponse>) => {
			toast.dismiss("save-survey");

			if (!response.success) {
				toast.error(response.error || TOAST.SAVE_ERROR);
				return;
			}

			toast.success(TOAST.SAVE_SUCCESS);
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.dismiss("save-survey");
			toast.error(error.message || TOAST.SAVE_ERROR);
		},
	});
}
