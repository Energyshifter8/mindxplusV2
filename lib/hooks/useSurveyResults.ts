"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ApiResponse,
	getPrimaryQuestionSummaries,
	getSurveyInsight,
	type PrimaryQuestionSummariesResponse,
	type SurveyInsight,
} from "@/lib/api";

export function useSurveyInsight(id: string | undefined) {
	return useQuery({
		queryKey: ["surveyInsight", id],
		queryFn: async (): Promise<SurveyInsight> => {
			const res: ApiResponse<SurveyInsight> = await getSurveyInsight(
				id as string,
			);
			if (!res.success)
				throw new Error(
					res.error || "Шинжилгээний мэдээлэл татахад алдаа гарлаа",
				);
			return res.data as SurveyInsight;
		},
		enabled: !!id,
		staleTime: 60_000,
	});
}

export function usePrimaryQuestionSummaries(id: string | undefined) {
	return useQuery({
		queryKey: ["primaryQuestionSummaries", id],
		queryFn: async (): Promise<PrimaryQuestionSummariesResponse> => {
			const res: ApiResponse<PrimaryQuestionSummariesResponse> =
				await getPrimaryQuestionSummaries(id as string, {
					page: 0,
					size: 50,
					quality: "all",
				});
			if (!res.success)
				throw new Error(res.error || "Асуултын хураангуй татахад алдаа гарлаа");
			return res.data as PrimaryQuestionSummariesResponse;
		},
		enabled: !!id,
		staleTime: 60_000,
	});
}
