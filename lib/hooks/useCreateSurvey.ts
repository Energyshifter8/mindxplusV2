"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	type ApiResponse,
	type CreateSurveyPayload,
	type CreateSurveyResponse,
	createSurvey,
} from "@/lib/api";

export function useCreateSurvey() {
	const router = useRouter();

	return useMutation({
		mutationFn: (payload: CreateSurveyPayload) => {
			return createSurvey(payload);
		},
		onMutate: () => {
			toast.loading("Шинжилгээ үүсгэж байна...", { id: "create-survey" });
		},
		onSuccess: (response: ApiResponse<CreateSurveyResponse>) => {
			toast.dismiss("create-survey");

			if (!response.success || !response.data) {
				const msg = response.error || "Шинжилгээ үүсгэхэд алдаа гарлаа";
				toast.error(msg);
				return;
			}

			const id = response.data.id;
			toast.success("Шинжилгээ амжилттай үүсгэгдлээ");
			router.push(`/dashboard/surveys/${id}/edit`);
		},
		onError: (error: Error) => {
			toast.dismiss("create-survey");
			toast.error(error.message || "Шинжилгээ үүсгэхэд алдаа гарлаа");
		},
	});
}
