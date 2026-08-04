"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type ApiResponse,
	type PublishSurveyPayload,
	type PublishSurveyResponse,
	publishSurvey,
} from "@/lib/api";
import { TOAST } from "@/lib/helptext";

interface UsePublishSurveyOptions {
	surveyId: string;
	onSuccess?: () => void;
}

export function usePublishSurvey({
	surveyId,
	onSuccess,
}: UsePublishSurveyOptions) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: PublishSurveyPayload) =>
			publishSurvey(surveyId, payload),
		onMutate: () => {
			toast.loading(TOAST.PUBLISH_LOADING, { id: "publish-survey" });
		},
		onSuccess: (response: ApiResponse<PublishSurveyResponse>) => {
			toast.dismiss("publish-survey");

			if (!response.success) {
				toast.error(response.error || TOAST.PUBLISH_ERROR);
				return;
			}

			toast.success(TOAST.PUBLISH_SUCCESS);
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
			queryClient.invalidateQueries({ queryKey: ["surveyList"] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.dismiss("publish-survey");
			toast.error(error.message || TOAST.PUBLISH_ERROR);
		},
	});
}
