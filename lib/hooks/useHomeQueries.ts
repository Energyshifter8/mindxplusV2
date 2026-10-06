"use client";

import { useQuery } from "@tanstack/react-query";
import {
	fetchHiringHomeStatistics,
	fetchHomeRecruitments,
	fetchHomeSurveys,
	fetchLatestCompleted,
	fetchSurveyHomeStatistics,
} from "@/lib/api";

// Staging /home (📦 bundle): queryKey-ууд ижил, retry: false,
// refetchOnWindowFocus: false, polling байхгүй.
const HOME_QUERY = { retry: false, refetchOnWindowFocus: false } as const;

export function useHomeSurveys() {
	return useQuery({
		queryKey: ["home-surveys"],
		queryFn: fetchHomeSurveys,
		...HOME_QUERY,
	});
}

export function useHomeSurveyStats() {
	return useQuery({
		queryKey: ["home-survey-stats"],
		queryFn: fetchSurveyHomeStatistics,
		...HOME_QUERY,
	});
}

export function useHomeRecruitments() {
	return useQuery({
		queryKey: ["home-recruitments"],
		queryFn: fetchHomeRecruitments,
		...HOME_QUERY,
	});
}

export function useHomeHiringStats() {
	return useQuery({
		queryKey: ["home-hiring-stats"],
		queryFn: fetchHiringHomeStatistics,
		...HOME_QUERY,
	});
}

export function useHomeLatestTalents() {
	return useQuery({
		queryKey: ["home-latest-talents"],
		queryFn: fetchLatestCompleted,
		...HOME_QUERY,
	});
}

/** Staging `c()`: массив, `{content}` эсвэл `{data}`-аас мөрүүдийг гаргана. */
export function toRows<T>(value: unknown): T[] {
	if (Array.isArray(value)) return value as T[];
	if (value && typeof value === "object") {
		const v = value as { content?: unknown; data?: unknown };
		if (Array.isArray(v.content)) return v.content as T[];
		if (Array.isArray(v.data)) return v.data as T[];
	}
	return [];
}
