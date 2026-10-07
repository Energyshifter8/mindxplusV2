import type { ApiPageParams } from "@/lib/pagination";
import type {
	RecruitmentListParams,
	TalentListParams,
} from "@/lib/types/role-assessment";

// Талентийн үнэлгээний query key factory. Нүүр хуудасны (components/Dashboard.tsx)
// ["recruitmentList"], ["recruitmentStats"] нь ApiResponse хэлбэртэй тул тусдаа —
// өөрчлөлтийн дараа HOME_RECRUITMENT_KEYS-ийг ч invalidate хийнэ.

const all = ["role-assessment"] as const;

export const raKeys = {
	all,
	stats: () => [...all, "stats"] as const,
	lists: () => [...all, "list"] as const,
	list: (params: RecruitmentListParams) => [...all, "list", params] as const,
	detail: (id: string) => [...all, "detail", id] as const,
	settings: () => [...all, "settings"] as const,
	information: (id: string) => [...all, "information", id] as const,
	testIds: (id: string) => [...all, "test-ids", id] as const,
	questionIds: (id: string) => [...all, "question-ids", id] as const,
	design: (id: string) => [...all, "design", id] as const,
	testCategories: () => [...all, "test-categories"] as const,
	catalogTests: (category: string) =>
		[...all, "catalog-tests", category] as const,
	catalogTest: (id: string) => [...all, "catalog-test", id] as const,
	questionCategories: () => [...all, "question-categories"] as const,
	catalogQuestions: (category: string) =>
		[...all, "catalog-questions", category] as const,
	invitationsOf: (recruitmentId: string) =>
		[...all, "invitations", recruitmentId] as const,
	invitations: (recruitmentId: string, params: ApiPageParams) =>
		[...all, "invitations", recruitmentId, params] as const,
	names: (recruitmentId: string) => [...all, "names", recruitmentId] as const,
	result: (recruitmentId: string, invitationId: string) =>
		[...all, "result", recruitmentId, invitationId] as const,
	rate: (invitationId: string) => [...all, "rate", invitationId] as const,
	notes: (invitationId: string) => [...all, "notes", invitationId] as const,
	report: (invitationId: string, answerId: string) =>
		[...all, "report", invitationId, answerId] as const,
	talentLists: () => [...all, "talents"] as const,
	talents: (params: TalentListParams) => [...all, "talents", params] as const,
	talent: (id: string) => [...all, "talent", id] as const,
	talentInvitations: (id: string, params: ApiPageParams) =>
		[...all, "talent-invitations", id, params] as const,
};

/** components/Dashboard.tsx-ийн түлхүүрүүд */
export const HOME_RECRUITMENT_KEYS = [
	["recruitmentList"],
	["recruitmentStats"],
	["completedInvitations"],
] as const;
