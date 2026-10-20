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
import { getErrorMessage } from "@/lib/api-errors";
import type { RecommendAnswer } from "@/lib/constants/roleAssessment";
import { clearDraft } from "@/lib/role-assessment/draft";
import type { UpdateRecruitmentInfoPayload } from "@/lib/types/role-assessment";
import { raKeys } from "./keys";
import { invalidateRecruitmentLists } from "./mutations";

export function useUpdateInformation(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateRecruitmentInfoPayload) =>
			updateRecruitmentInformation(id, payload),
		onSuccess: () => {
			toast.success("Мэдээлэл амжилттай хадгалагдлаа");
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
		onSuccess: () => {
			toast.success("Сонгосон тестүүд амжилттай хадгалагдлаа");
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
		onSuccess: () => {
			toast.success("Сонгосон асуултууд амжилттай хадгалагдлаа");
			queryClient.invalidateQueries({ queryKey: raKeys.questionIds(id) });
			queryClient.invalidateQueries({ queryKey: raKeys.detail(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Асуултууд хадгалахад алдаа гарлаа"));
		},
	});
}

export function usePublishRecruitment(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => publishRecruitment(id),
		onSuccess: () => {
			invalidateRecruitmentLists(queryClient);
			queryClient.invalidateQueries({ queryKey: raKeys.information(id) });
			queryClient.invalidateQueries({ queryKey: raKeys.detail(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Нийтлэхэд алдаа гарлаа"));
		},
	});
}

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
		mutationFn: (file: File) => uploadDesignLogo("RECRUITMENT", id, file),
		onSuccess: async () => {
			toast.success("Лого амжилттай байршууллаа");
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
			queryClient.invalidateQueries({ queryKey: raKeys.design(id) });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Алдаа гарлаа"));
		},
	});
}
