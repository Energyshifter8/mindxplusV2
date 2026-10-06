// Апп-ын route-ууд нэг дор. Staging-ийн route руу шилжүүлэх (docs/parity/home.md §11)
// үед зөвхөн энд өөрчилнө.

export const ROUTES = {
	login: "/login",
	home: "/dashboard",
	templates: "/dashboard/surveys/new",
	survey: "/dashboard/surveys",
	roleAssessment: "/dashboard/recruitments",
	invitedTalents: "/dashboard/talents",
	/** "Миний бүртгэл" — placeholder (staging: /profile) */
	profile: "/dashboard/profile",
} as const;

/** Дэд хуудасны замууд (staging-ийн бүтцээр: /survey/{id}, /survey/{id}/insight, …). */
export const routeTo = {
	/** staging: /survey/{id} (CREATED — засах) */
	surveyEdit: (id: string) => `/dashboard/surveys/${id}/edit`,
	/** staging: /survey/{id}/insight */
	surveyInsight: (id: string) => `/dashboard/surveys/${id}/results`,
	/** staging: /role-assessment/{id} (wizard) */
	roleAssessmentWizard: (id: string) => `/dashboard/recruitments/${id}/edit`,
	/** staging: /role-assessment/{id}/dashboard */
	roleAssessmentDashboard: (id: string) =>
		`/dashboard/recruitments/${id}/results`,
	/** staging: /role-assessment/{id}/dashboard/{invitationId} */
	roleAssessmentResult: (id: string, invitationId: string) =>
		`/dashboard/recruitments/${id}/results/${invitationId}`,
};

export type NavKey =
	| "home"
	| "templates"
	| "survey"
	| "role-assessment"
	| "role-assessment-invited";

/** Staging sidebar-ын идэвхтэй цэс: замын эхний хэсгээр (📦 bundle). */
export function navKeyForPath(pathname: string): NavKey | undefined {
	if (pathname === ROUTES.home || pathname.startsWith("/home")) return "home";
	if (
		pathname.startsWith(ROUTES.templates) ||
		pathname.startsWith("/templates")
	)
		return "templates";
	if (pathname.startsWith(ROUTES.survey) || pathname.startsWith("/survey"))
		return "survey";
	if (
		pathname.startsWith(ROUTES.invitedTalents) ||
		pathname.startsWith("/invited-talents")
	)
		return "role-assessment-invited";
	if (
		pathname.startsWith(ROUTES.roleAssessment) ||
		pathname.startsWith("/role-assessment")
	)
		return "role-assessment";
	return undefined;
}

/**
 * Staging-ийн хэв маягаар (light, Manrope) хөрвүүлсэн хуудсууд. Бусад нь `.dark`
 * scope-д хуучин хэв маягаараа харагдана.
 */
const PARITY_ROUTES = new Set<string>([ROUTES.home, "/home"]);

export function isParityRoute(pathname: string): boolean {
	return PARITY_ROUTES.has(pathname);
}

/** Sidebar-гүй (editor) хуудсууд — staging-ийн (editor) layout. */
export function isEditorRoute(pathname: string): boolean {
	return (
		/^\/dashboard\/surveys\/[^/]+\/edit/.test(pathname) ||
		/^\/dashboard\/recruitments\/[^/]+\/edit/.test(pathname)
	);
}
