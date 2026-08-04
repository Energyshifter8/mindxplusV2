"use client";

import { useQuery } from "@tanstack/react-query";
import { type ApiResponse, getTemplates } from "@/lib/api";

export interface SurveyTemplate {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	minMinutes: number;
	maxMinutes: number;
	questionCount: number;
	status: "PUBLISHED" | "CREATED";
	hasTrial: boolean;
	categoryId: string;
}

export interface TemplateCategory {
	categoryId: string;
	categoryName: string;
	categoryDescription: string;
	templates: SurveyTemplate[];
}

export function useTemplates() {
	return useQuery({
		queryKey: ["templates"],
		queryFn: async (): Promise<TemplateCategory[]> => {
			const res: ApiResponse<TemplateCategory[]> =
				await getTemplates<TemplateCategory[]>();
			if (!res.success)
				throw new Error(res.error || "Failed to fetch templates");
			return res.data ?? [];
		},
		staleTime: 5 * 60 * 1000,
	});
}
