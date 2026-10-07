"use client";

import {
	type QueryClient,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	closeRecruitment,
	createRecruitment,
	deleteRecruitment,
	extendInvitation,
	inviteTalent,
	renameRecruitment,
} from "@/lib/api/role-assessment";
import { getErrorMessage } from "@/lib/api-errors";
import type { InviteTalentPayload } from "@/lib/types/role-assessment";
import { HOME_RECRUITMENT_KEYS, raKeys } from "./keys";

// Toast-ын текст: staging жагсаалтын хуудас (📦 bundle). Алдааны мессежийг staging
// `error.message` (= detail)-ээс авдаг; бид ProblemDetail.code-оор map хийж, үл
// мэдэгдэх code-д staging-ийн fallback текстийг харуулна.

/** Жагсаалт, статистик, нүүр хуудсыг шинэчилнэ. */
export function invalidateRecruitmentLists(queryClient: QueryClient) {
	queryClient.invalidateQueries({ queryKey: raKeys.lists() });
	queryClient.invalidateQueries({ queryKey: raKeys.stats() });
	for (const key of HOME_RECRUITMENT_KEYS) {
		queryClient.invalidateQueries({ queryKey: key });
	}
}

export function useCreateRecruitment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (name: string) => createRecruitment(name),
		onSuccess: () => {
			toast.success("Талентийн үнэлгээ амжилттай үүслээ");
		},
		onError: (error) => {
			toast.error(
				getErrorMessage(error, "Талентийн үнэлгээ үүсгэхэд алдаа гарлаа"),
			);
		},
		// Хариу уншигдаагүй ч ноорог үүссэн байж болох тул ямар ч үед шинэчилнэ
		onSettled: () => invalidateRecruitmentLists(queryClient),
	});
}

export function useDeleteRecruitment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteRecruitment(id),
		onSuccess: () => {
			toast.success("Амжилттай устгагдлаа");
			invalidateRecruitmentLists(queryClient);
		},
		onError: (error) => {
			toast.error(
				getErrorMessage(error, "Талентийн үнэлгээ устгахад алдаа гарлаа"),
			);
		},
	});
}

export function useCloseRecruitment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => closeRecruitment(id),
		onSuccess: (_data, id) => {
			toast.success("Талентийн үнэлгээ амжилттай хаагдлаа");
			invalidateRecruitmentLists(queryClient);
			queryClient.invalidateQueries({ queryKey: raKeys.detail(id) });
		},
		onError: (error) => {
			toast.error(
				getErrorMessage(error, "Талентийн үнэлгээ хаахад алдаа гарлаа"),
			);
		},
	});
}

export function useRenameRecruitment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: { id: string; name: string }) =>
			renameRecruitment(vars.id, vars.name),
		onSuccess: (_data, vars) => {
			toast.success("Нэр амжилттай өөрчлөгдлөө");
			invalidateRecruitmentLists(queryClient);
			queryClient.invalidateQueries({ queryKey: raKeys.detail(vars.id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Нэр өөрчлөхөд алдаа гарлаа"));
		},
	});
}

// --- Урих / дахин урих (📦 module 4089) ---

/** "Урилга илгээх" — ЖИНХЭНЭ имэйл илгээдэг тул dry-run-д хамгаалагдсан. */
export function useInviteTalent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: InviteTalentPayload) => inviteTalent(payload),
		onSuccess: (_data, payload) => {
			toast.success("Урилга амжилтай илгээгдлээ");
			invalidateRecruitmentLists(queryClient);
			queryClient.invalidateQueries({
				queryKey: raKeys.invitationsOf(payload.recruitmentId),
			});
			queryClient.invalidateQueries({
				queryKey: raKeys.detail(payload.recruitmentId),
			});
			queryClient.invalidateQueries({ queryKey: raKeys.talentLists() });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Урилга илгээхэд алдаа гарлаа"));
		},
	});
}

/** "Дахин урих" — EXPIRED урилгын хугацааг сунгана. */
export function useExtendInvitation(recruitmentId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: { invitationId: string; dueDate: string }) =>
			extendInvitation(vars.invitationId, vars.dueDate),
		onSuccess: () => {
			toast.success("Урилга амжилтай сунгагдлаа");
			queryClient.invalidateQueries({
				queryKey: raKeys.invitationsOf(recruitmentId),
			});
			queryClient.invalidateQueries({ queryKey: raKeys.talentLists() });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Урилга сунгахад алдаа гарлаа"));
		},
	});
}
