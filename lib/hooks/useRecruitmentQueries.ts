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
	names: (id: string) => [...recruitmentKeys.all, "names", id] as const,
};

export const invitationKeys = {
	all: ["invitations"] as const,
	result: (recruitmentId: string, invitationId: string) =>
		[...invitationKeys.all, "result", recruitmentId, invitationId] as const,
	rate: (invitationId: string) =>
		[...invitationKeys.all, "rate", invitationId] as const,
	notes: (invitationId: string) =>
		[...invitationKeys.all, "notes", invitationId] as const,
	report: (invitationId: string, answerId: string) =>
		[...invitationKeys.all, "report", invitationId, answerId] as const,
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

export function useInvitationNames(recruitmentId: string | undefined) {
	return useQuery({
		queryKey: recruitmentKeys.names(recruitmentId ?? ""),
		queryFn: () => fetchInvitationNames(recruitmentId as string),
		enabled: !!recruitmentId,
	});
}

export function useInvitationResult(
	recruitmentId: string | undefined,
	invitationId: string | undefined,
) {
	return useQuery({
		queryKey: invitationKeys.result(recruitmentId ?? "", invitationId ?? ""),
		queryFn: () =>
			fetchInvitationResult(recruitmentId as string, invitationId as string),
		enabled: !!recruitmentId && !!invitationId,
	});
}

export function useInvitationRate(invitationId: string | undefined) {
	return useQuery({
		queryKey: invitationKeys.rate(invitationId ?? ""),
		queryFn: () => fetchInvitationRate(invitationId as string),
		enabled: !!invitationId,
	});
}

export function useInvitationNotes(invitationId: string | undefined) {
	return useQuery({
		queryKey: invitationKeys.notes(invitationId ?? ""),
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
		queryKey: invitationKeys.report(invitationId ?? "", answerId ?? ""),
		queryFn: () =>
			fetchTestReportHtml(invitationId as string, answerId as string),
		enabled: !!invitationId && !!answerId,
		gcTime: 60 * 1000,
	});
}
