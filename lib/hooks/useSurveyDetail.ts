"use client";

import { useQuery } from "@tanstack/react-query";
import {
	type ApiResponse,
	getSurveyDetail,
	getSurveyEditOptions,
	type SurveyDetail,
	type SurveyEditOptions,
} from "@/lib/api";

export function useSurveyDetail(id: string | undefined) {
	return useQuery({
		queryKey: ["surveyDetail", id],
		queryFn: async (): Promise<SurveyDetail> => {
			const res: ApiResponse<SurveyDetail> = await getSurveyDetail(
				id as string,
			);
			if (!res.success)
				throw new Error(
					res.error || "Шинжилгээний мэдээлэл татахад алдаа гарлаа",
				);
			return res.data as SurveyDetail;
		},
		enabled: !!id,
		staleTime: 60_000,
	});
}

export function useSurveyEditOptions(id: string | undefined) {
	return useQuery({
		queryKey: ["surveyEditOptions", id],
		queryFn: async (): Promise<SurveyEditOptions> => {
			const res: ApiResponse<SurveyEditOptions> = await getSurveyEditOptions(
				id as string,
			);
			if (!res.success)
				throw new Error(res.error || "Edit options татахад алдаа гарлаа");
			return res.data ?? {};
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}
