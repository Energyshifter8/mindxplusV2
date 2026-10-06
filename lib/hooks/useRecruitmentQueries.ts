"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	fetchRecruitmentDetail,
	fetchRecruitmentInvitations,
	fetchRecruitmentList,
	fetchRecruitmentStats,
	fetchRoleAssessmentTest,
	type RecruitmentListParams,
} from "@/lib/api";
import type { ApiPageParams } from "@/lib/pagination";

// Throw хийдэг fetch* функцуудад зориулсан түлхүүрүүд. Нүүр хуудасны
// ["recruitmentList"], ["recruitmentStats"] (ApiResponse хэлбэртэй) түлхүүрээс
// санаатайгаар тусдаа: кэшид өөр хэлбэрийн өгөгдөл холилдохгүй.
export const recruitmentKeys = {
	all: ["recruitments"] as const,
	stats: () => [...recruitmentKeys.all, "stats"] as const,
	list: (params: RecruitmentListParams) =>
		[...recruitmentKeys.all, "list", params] as const,
	detail: (id: string) => [...recruitmentKeys.all, "detail", id] as const,
	invitations: (id: string, params: ApiPageParams) =>
		[...recruitmentKeys.all, "invitations", id, params] as const,
};

export const roleAssessmentTestKeys = {
	detail: (catalogTestId: string) =>
		["roleAssessmentTests", "detail", catalogTestId] as const,
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

export function useRecruitmentInvitations(
	recruitmentId: string | undefined,
	params: ApiPageParams,
) {
	return useQuery({
		queryKey: recruitmentKeys.invitations(recruitmentId ?? "", params),
		queryFn: () => fetchRecruitmentInvitations(recruitmentId as string, params),
		enabled: !!recruitmentId,
		placeholderData: keepPreviousData,
	});
}

export function useRoleAssessmentTest(catalogTestId: string | undefined) {
	return useQuery({
		queryKey: roleAssessmentTestKeys.detail(catalogTestId ?? ""),
		queryFn: () => fetchRoleAssessmentTest(catalogTestId as string),
		enabled: !!catalogTestId,
		staleTime: 5 * 60 * 1000,
	});
}
