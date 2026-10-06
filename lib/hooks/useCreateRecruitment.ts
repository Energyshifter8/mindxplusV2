"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type ApiResponse,
	type CreateRecruitmentPayload,
	type CreateRecruitmentResponse,
	createRecruitment,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/api-errors";
import { recruitmentKeys } from "@/lib/hooks/useRecruitmentQueries";

export function useCreateRecruitment() {
	const queryClient = useQueryClient();

	function invalidateLists() {
		queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
		// Нүүр хуудасны (components/Dashboard.tsx) түлхүүрүүд
		queryClient.invalidateQueries({ queryKey: ["recruitmentList"] });
		queryClient.invalidateQueries({ queryKey: ["recruitmentStats"] });
	}

	return useMutation({
		mutationFn: (payload: CreateRecruitmentPayload) => {
			return createRecruitment(payload);
		},
		onMutate: () => {
			toast.loading("Үнэлгээ үүсгэж байна...", { id: "create-recruitment" });
		},
		onSuccess: (response: ApiResponse<CreateRecruitmentResponse>) => {
			toast.dismiss("create-recruitment");
			// Хариу уншигдаагүй ч ноорог үүссэн байж болох тул ямар ч үед шинэчилнэ
			invalidateLists();

			if (!response.success || !response.data) {
				toast.error(getErrorMessage(response, "Үнэлгээ үүсгэхэд алдаа гарлаа"));
				return;
			}

			toast.success("Үнэлгээ амжилттай үүсгэгдлээ");
		},
		onError: (error: Error) => {
			toast.dismiss("create-recruitment");
			toast.error(getErrorMessage(error, "Үнэлгээ үүсгэхэд алдаа гарлаа"));
		},
	});
}
