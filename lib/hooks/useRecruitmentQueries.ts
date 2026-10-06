"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	fetchRecruitmentDetail,
	fetchRecruitmentList,
	fetchRecruitmentStats,
	type RecruitmentListParams,
} from "@/lib/api";

// Throw хийдэг fetch* функцуудад зориулсан түлхүүрүүд. Нүүр хуудасны
// ["recruitmentList"], ["recruitmentStats"] (ApiResponse хэлбэртэй) түлхүүрээс
// санаатайгаар тусдаа: кэшид өөр хэлбэрийн өгөгдөл холилдохгүй.
export const recruitmentKeys = {
	all: ["recruitments"] as const,
	stats: () => [...recruitmentKeys.all, "stats"] as const,
	list: (params: RecruitmentListParams) =>
		[...recruitmentKeys.all, "list", params] as const,
	detail: (id: string) => [...recruitmentKeys.all, "detail", id] as const,
};

export function useRecruitmentStats() {
	return useQuery({
		queryKey: recruitmentKeys.stats(),
		queryFn: fetchRecruitmentStats,
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});
}

export function useRecruitmentList(params: RecruitmentListParams) {
	return useQuery({
		queryKey: recruitmentKeys.list(params),
		queryFn: () => fetchRecruitmentList(params),
		placeholderData: keepPreviousData,
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});
}

export function useRecruitmentDetail(id: string | undefined) {
	return useQuery({
		queryKey: recruitmentKeys.detail(id ?? ""),
		queryFn: () => fetchRecruitmentDetail(id as string),
		enabled: !!id,
	});
}
