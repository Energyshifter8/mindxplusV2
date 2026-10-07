// my-hiring-test-controller (тест, асуултын каталог)

import { apiGetOrThrow, apiPostOrThrow } from "@/lib/api/http";
import type { RecommendAnswer } from "@/lib/constants/roleAssessment";
import type { CategoryWithCount } from "@/lib/types/api";
import type {
	RecruitmentCustomQuestion,
	RecruitmentTest,
	RoleAssessmentTestDetail,
} from "@/lib/types/role-assessment";
import { enc } from "./shared";

/** GET /customer/role-assessments/categories ✅ — `id` нь шүүлтүүрийн түлхүүр, `count` үргэлж 0 */
export function fetchTestCategories() {
	return apiGetOrThrow<CategoryWithCount[]>(
		"/customer/role-assessments/categories",
	);
}

/**
 * GET /customer/role-assessments/tests?category= ✅ — хоосон бол бүгд (staging хоосон
 * `category=`-ийг ч илгээдэг 📦). Жагсаалтад `content`, `roleLevels` ирдэггүй.
 */
export function fetchCatalogTests(category = "") {
	return apiGetOrThrow<RecruitmentTest[]>(
		`/customer/role-assessments/tests?category=${enc(category)}`,
	);
}

/** GET /customer/role-assessments/tests/{catalogTestId} (#10) ✅ */
export function fetchRoleAssessmentTest(catalogTestId: string) {
	return apiGetOrThrow<RoleAssessmentTestDetail>(
		`/customer/role-assessments/tests/${enc(catalogTestId)}`,
	);
}

/** GET /customer/role-assessments/question-categories ✅ */
export function fetchQuestionCategories() {
	return apiGetOrThrow<CategoryWithCount[]>(
		"/customer/role-assessments/question-categories",
	);
}

/** GET /customer/role-assessments/questions?category= ✅ — хариунд `category` ирдэггүй */
export function fetchCatalogQuestions(category = "") {
	return apiGetOrThrow<RecruitmentCustomQuestion[]>(
		`/customer/role-assessments/questions?category=${enc(category)}`,
	);
}

/**
 * POST /customer/role-assessments/recommend — body: асуулт бүрийн хариулт,
 * RECOMMEND_QUESTIONS-ийн дарааллаар (`string[]`) 📦. swagger: → HiringTestPublicDTO[].
 * Dry-run-д `[]` (D5).
 */
export async function recommendTests(
	answers: RecommendAnswer[],
): Promise<RecruitmentTest[]> {
	const data = await apiPostOrThrow<unknown>(
		"/customer/role-assessments/recommend",
		answers,
	);
	if (Array.isArray(data)) return data as RecruitmentTest[];
	// bundle-derived, unverified: staging апп `{tests}` / `{content}` хэлбэрийг ч хүлээн авдаг
	const d = data as { tests?: unknown; content?: unknown } | null;
	if (Array.isArray(d?.tests)) return d.tests as RecruitmentTest[];
	if (Array.isArray(d?.content)) return d.content as RecruitmentTest[];
	return [];
}
