"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	type ApiResponse,
	type CreateRecruitmentPayload,
	type CreateRecruitmentResponse,
	createRecruitment,
} from "@/lib/api";

export function useCreateRecruitment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateRecruitmentPayload) => {
			return createRecruitment(payload);
		},
		onMutate: () => {
			toast.loading("Үнэлгээ үүсгэж байна...", { id: "create-recruitment" });
		},
		onSuccess: (response: ApiResponse<CreateRecruitmentResponse>) => {
			toast.dismiss("create-recruitment");

			if (!response.success || !response.data) {
				const msg = response.error || "Үнэлгээ үүсгэхэд алдаа гарлаа";
				toast.error(msg);
				return;
			}

			toast.success("Үнэлгээ амжилттай үүсгэгдлээ");
			queryClient.invalidateQueries({ queryKey: ["recruitmentList"] });
			queryClient.invalidateQueries({ queryKey: ["recruitmentStats"] });
		},
		onError: (error: Error) => {
			toast.dismiss("create-recruitment");
			toast.error(error.message || "Үнэлгээ үүсгэхэд алдаа гарлаа");
		},
	});
}
