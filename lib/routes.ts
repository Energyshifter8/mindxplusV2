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
const PARITY_ROUTES = new Set<string>([]);

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
