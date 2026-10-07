"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchDesign } from "@/lib/api/design";
import {
	fetchCatalogQuestions,
	fetchCatalogTests,
	fetchInvitationNames,
	fetchInvitationNotes,
	fetchInvitationRate,
	fetchInvitationResult,
	fetchQuestionCategories,
	fetchRecruitmentDetail,
	fetchRecruitmentInformation,
	fetchRecruitmentInvitations,
	fetchRecruitmentList,
	fetchRecruitmentQuestionIds,
	fetchRecruitmentSettings,
	fetchRecruitmentStats,
	fetchRecruitmentTestIds,
	fetchRoleAssessmentTest,
	fetchTestCategories,
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

// --- Wizard (staging: каталог staleTime/gcTime 30 мин, сонголт алхам идэвхтэй үед л) ---

const CATALOG_CACHE = {
	staleTime: 30 * 60 * 1000,
	gcTime: 30 * 60 * 1000,
} as const;

export function useRecruitmentInformation(id: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.information(id ?? ""),
		queryFn: () => fetchRecruitmentInformation(id as string),
		enabled: !!id,
	});
}

export function useRecruitmentSettings() {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.settings(),
		queryFn: fetchRecruitmentSettings,
	});
}

export function useRecruitmentDesign(id: string | undefined) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.design(id ?? ""),
		queryFn: () => fetchDesign("RECRUITMENT", id as string),
		enabled: !!id,
	});
}

export function useRecruitmentTestIds(
	id: string | undefined,
	enabled: boolean,
) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.testIds(id ?? ""),
		queryFn: () => fetchRecruitmentTestIds(id as string),
		enabled: !!id && enabled,
	});
}

export function useRecruitmentQuestionIds(
	id: string | undefined,
	enabled: boolean,
) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		queryKey: raKeys.questionIds(id ?? ""),
		queryFn: () => fetchRecruitmentQuestionIds(id as string),
		enabled: !!id && enabled,
	});
}

export function useTestCategories(enabled: boolean) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		...CATALOG_CACHE,
		queryKey: raKeys.testCategories(),
		queryFn: fetchTestCategories,
		enabled,
	});
}

export function useCatalogTests(category: string, enabled: boolean) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		...CATALOG_CACHE,
		queryKey: raKeys.catalogTests(category),
		queryFn: () => fetchCatalogTests(category),
		enabled,
	});
}

export function useQuestionCategories(enabled: boolean) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		...CATALOG_CACHE,
		queryKey: raKeys.questionCategories(),
		queryFn: fetchQuestionCategories,
		enabled,
	});
}

export function useCatalogQuestions(category: string, enabled: boolean) {
	return useQuery({
		...RA_QUERY_OPTIONS,
		...CATALOG_CACHE,
		queryKey: raKeys.catalogQuestions(category),
		queryFn: () => fetchCatalogQuestions(category),
		enabled,
	});
}
