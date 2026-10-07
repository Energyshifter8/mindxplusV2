"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeDesignLogo, uploadDesignLogo } from "@/lib/api/design";
import {
	publishRecruitment,
	recommendTests,
	setRecruitmentQuestions,
	setRecruitmentTests,
	updateRecruitmentInformation,
} from "@/lib/api/role-assessment";
import { isRaDryRun } from "@/lib/api/role-assessment/dry-run";
import { getErrorMessage } from "@/lib/api-errors";
import type { RecommendAnswer } from "@/lib/constants/roleAssessment";
import { clearDraft } from "@/lib/role-assessment/draft";
import type { DesignDTO, RecruitmentInfo } from "@/lib/types/api";
import type { UpdateRecruitmentInfoPayload } from "@/lib/types/role-assessment";
import { raKeys } from "./keys";
import { invalidateRecruitmentLists } from "./mutations";

// Wizard-ийн хадгалалт (📦 staging `ei`): toast текст staging-ийнх. DRY-RUN үед сервер
// өөрчлөгдөхгүй тул refetch хийхийн оронд хадгалсан утгыг cache-д бичиж wizard-ийг
// үргэлжлүүлнэ (DECISIONS.md D4).

export function useUpdateInformation(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateRecruitmentInfoPayload) =>
			updateRecruitmentInformation(id, payload),
		onSuccess: (_data, payload) => {
			toast.success("Мэдээлэл амжилттай хадгалагдлаа");
			if (isRaDryRun()) {
				const saved: RecruitmentInfo = {
					jobTitle: payload.jobTitle.trim(),
					jobDescription: payload.jobDescription.trim(),
					companyName: payload.companyName.trim(),
					companyDescription: payload.companyDescription ?? "",
				};
				queryClient.setQueryData(raKeys.information(id), saved);
				return;
			}
			queryClient.invalidateQueries({ queryKey: raKeys.information(id) });
			clearDraft(id);
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Мэдээлэл хадгалахад алдаа гарлаа"));
		},
	});
}

export function useSetTests(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (testIds: string[]) => setRecruitmentTests(id, testIds),
		onSuccess: (_data, testIds) => {
			toast.success("Сонгосон тестүүд амжилттай хадгалагдлаа");
			if (isRaDryRun()) {
				queryClient.setQueryData(raKeys.testIds(id), testIds);
				return;
			}
			queryClient.invalidateQueries({ queryKey: raKeys.testIds(id) });
			queryClient.invalidateQueries({ queryKey: raKeys.detail(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Тестүүд хадгалахад алдаа гарлаа"));
		},
	});
}

export function useSetQuestions(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (questionIds: number[]) =>
			setRecruitmentQuestions(id, questionIds),
		onSuccess: (_data, questionIds) => {
			toast.success("Сонгосон асуултууд амжилттай хадгалагдлаа");
			if (isRaDryRun()) {
				queryClient.setQueryData(raKeys.questionIds(id), questionIds);
				return;
			}
			queryClient.invalidateQueries({ queryKey: raKeys.questionIds(id) });
			queryClient.invalidateQueries({ queryKey: raKeys.detail(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Асуултууд хадгалахад алдаа гарлаа"));
		},
	});
}

/** "Нийтлэх" — амжилттай бол дуудагч амжилтын modal-ыг нээнэ (staging). */
export function usePublishRecruitment(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => publishRecruitment(id),
		onSuccess: () => {
			invalidateRecruitmentLists(queryClient);
			// DRY-RUN: сервер өөрчлөгдөөгүй тул refetch хийвэл формын утга хуучирна
			if (isRaDryRun()) return;
			queryClient.invalidateQueries({ queryKey: raKeys.information(id) });
			queryClient.invalidateQueries({ queryKey: raKeys.detail(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Нийтлэхэд алдаа гарлаа"));
		},
	});
}

/** "Санал болгох" — dry-run-д хоосон жагсаалт (D5), UI гараар үргэлжилнэ. */
export function useRecommendTests() {
	return useMutation({
		mutationFn: (answers: RecommendAnswer[]) => recommendTests(answers),
		onError: (error) => {
			toast.error(getErrorMessage(error, "Санал болгоход алдаа гарлаа"));
		},
	});
}

export function useUploadLogo(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: { file: File; previewUrl: string }) =>
			uploadDesignLogo("RECRUITMENT", id, vars.file),
		onSuccess: async (_data, vars) => {
			toast.success("Лого амжилттай байршууллаа");
			if (isRaDryRun()) {
				queryClient.setQueryData<DesignDTO>(raKeys.design(id), (d) => ({
					...d,
					hasLogo: true,
					logoUrl: vars.previewUrl,
				}));
				return;
			}
			await queryClient.invalidateQueries({ queryKey: raKeys.design(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Алдаа гарлаа"));
		},
	});
}

export function useRemoveLogo(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (designId: number) =>
			removeDesignLogo("RECRUITMENT", id, designId),
		onSuccess: () => {
			toast.success("Лого амжилттай устгалаа");
			if (isRaDryRun()) {
				queryClient.setQueryData<DesignDTO>(raKeys.design(id), (d) => ({
					...d,
					hasLogo: false,
					logoUrl: undefined,
				}));
				return;
			}
			queryClient.invalidateQueries({ queryKey: raKeys.design(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Алдаа гарлаа"));
		},
	});
}
