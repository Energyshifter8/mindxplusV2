"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	fetchInvitationNames,
	fetchInvitationNotes,
	fetchInvitationRate,
	fetchInvitationResult,
	fetchRecruitmentDetail,
	fetchRecruitmentInvitations,
	fetchRecruitmentList,
	fetchRecruitmentStats,
	fetchRoleAssessmentTest,
	fetchTestReportHtml,
} from "@/lib/api/role-assessment";
import type { ApiPageParams } from "@/lib/pagination";
import type { RecruitmentListParams } from "@/lib/types/role-assessment";
import { raKeys } from "./keys";

/**
 * Staging-ийн React Query тохиргоо (📦): retry:false, focus refetch-гүй, polling-гүй.
 * Глобал QueryClient (components/providers.tsx)-д хүрэхгүйн тулд hook бүрт тавина.
 */
export const RA_QUERY_OPTIONS = {
	retry: false,
	refetchOnWindowFocus: false,
} as const;

export function useRecruitmentStats() {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.stats(),
		queryFn: fetchRecruitmentStats,
	});
}

export function useRecruitmentList(params: RecruitmentListParams) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.list(params),
		queryFn: () => fetchRecruitmentList(params),
		placeholderData: keepPreviousData,
	});
}

export function useRecruitmentDetail(id: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.detail(id ?? ""),
		queryFn: () => fetchRecruitmentDetail(id as string),
		enabled: !!id,
	});
}

export function useRecruitmentInvitations(
	recruitmentId: string | undefined,
	params: ApiPageParams,
) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.invitations(recruitmentId ?? "", params),
		queryFn: () => fetchRecruitmentInvitations(recruitmentId as string, params),
		enabled: !!recruitmentId,
		placeholderData: keepPreviousData,
	});
}

export function useRoleAssessmentTest(catalogTestId: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.catalogTest(catalogTestId ?? ""),
		queryFn: () => fetchRoleAssessmentTest(catalogTestId as string),
		enabled: !!catalogTestId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useInvitationNames(recruitmentId: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.names(recruitmentId ?? ""),
		queryFn: () => fetchInvitationNames(recruitmentId as string),
		enabled: !!recruitmentId,
	});
}

export function useInvitationResult(
	recruitmentId: string | undefined,
	invitationId: string | undefined,
) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.result(recruitmentId ?? "", invitationId ?? ""),
		queryFn: () =>
			fetchInvitationResult(recruitmentId as string, invitationId as string),
		enabled: !!recruitmentId && !!invitationId,
	});
}

export function useInvitationRate(invitationId: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.rate(invitationId ?? ""),
		queryFn: () => fetchInvitationRate(invitationId as string),
		enabled: !!invitationId,
	});
}

export function useInvitationNotes(invitationId: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.notes(invitationId ?? ""),
		queryFn: () => fetchInvitationNotes(invitationId as string),
		enabled: !!invitationId,
	});
}

/** Хувийн мэдээлэлтэй HTML тул кэшид удаан хадгалахгүй. */
export function useTestReportHtml(
	invitationId: string | undefined,
	answerId: string | undefined,
) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.report(invitationId ?? "", answerId ?? ""),
		queryFn: () =>
			fetchTestReportHtml(invitationId as string, answerId as string),
		enabled: !!invitationId && !!answerId,
		gcTime: 60 * 1000,
	});
}
