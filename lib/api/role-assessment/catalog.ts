import { apiGetOrThrow, apiPostOrThrow } from "@/lib/api/http";
import type { RecommendAnswer } from "@/lib/constants/roleAssessment";
import type { CategoryWithCount } from "@/lib/types/api";
import type {
	RecruitmentCustomQuestion,
	RecruitmentTest,
	RoleAssessmentTestDetail,
} from "@/lib/types/role-assessment";
import { enc } from "./shared";

export function fetchTestCategories() {
	return apiGetOrThrow<CategoryWithCount[]>(
		"/customer/role-assessments/categories",
	);
}

export function fetchCatalogTests(category = "") {
	return apiGetOrThrow<RecruitmentTest[]>(
		`/customer/role-assessments/tests?category=${enc(category)}`,
	);
}

export function fetchRoleAssessmentTest(catalogTestId: string) {
	return apiGetOrThrow<RoleAssessmentTestDetail>(
		`/customer/role-assessments/tests/${enc(catalogTestId)}`,
	);
}

export function fetchQuestionCategories() {
	return apiGetOrThrow<CategoryWithCount[]>(
		"/customer/role-assessments/question-categories",
	);
}

export function fetchCatalogQuestions(category = "") {
	return apiGetOrThrow<RecruitmentCustomQuestion[]>(
		`/customer/role-assessments/questions?category=${enc(category)}`,
	);
}

export async function recommendTests(
	answers: RecommendAnswer[],
): Promise<RecruitmentTest[]> {
	const data = await apiPostOrThrow<unknown>(
		"/customer/role-assessments/recommend",
		answers,
	);
	if (Array.isArray(data)) return data as RecruitmentTest[];
	const d = data as { tests?: unknown; content?: unknown } | null;
	if (Array.isArray(d?.tests)) return d.tests as RecruitmentTest[];
	if (Array.isArray(d?.content)) return d.content as RecruitmentTest[];
	return [];
}
