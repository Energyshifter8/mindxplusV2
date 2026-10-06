// Талентийн үнэлгээ (role assessment)-ийн enum ба Монгол label.
// Эх сурвалж: docs/role-assessment-report.md §4 (staging ✅).

export const RECRUITMENT_STATUSES = ["CREATED", "PUBLISHED", "CLOSED"] as const;
export type RecruitmentStatus = (typeof RECRUITMENT_STATUSES)[number];

export const RECRUITMENT_STATUS_LABELS: Record<RecruitmentStatus, string> = {
	CREATED: "Үүссэн",
	// санал: өмнө нь "Нийтэлсэн" байсан; staging "Идэвхтэй" гэж харуулдаг
	PUBLISHED: "Идэвхтэй",
	CLOSED: "Хаагдсан",
};

export const INVITATION_STATUSES = [
	"PENDING",
	"STARTED",
	"COMPLETED",
	"EXPIRED",
] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

// санал: staging UI-ийн label (тайлан §2c), баталгаажуулах шаардлагатай.
// Өмнө нь PENDING = "Хүлээгдэж байна", STARTED байгаагүй.
export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
	PENDING: "Уригдсан",
	STARTED: "Эхэлсэн",
	COMPLETED: "Дууссан",
	EXPIRED: "Хугацаа дууссан",
};

export function isRecruitmentStatus(
	value: unknown,
): value is RecruitmentStatus {
	return (RECRUITMENT_STATUSES as readonly unknown[]).includes(value);
}

export function isInvitationStatus(value: unknown): value is InvitationStatus {
	return (INVITATION_STATUSES as readonly unknown[]).includes(value);
}
