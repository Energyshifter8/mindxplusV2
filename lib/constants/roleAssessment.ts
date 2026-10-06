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

// Тестийн өнгө: GREEN = Бие хүний онцлог, YELLOW = Зөөлөн ур чадвар (staging ✅)
export type TestColor = "GREEN" | "YELLOW";

export function isRecruitmentStatus(
	value: unknown,
): value is RecruitmentStatus {
	return (RECRUITMENT_STATUSES as readonly unknown[]).includes(value);
}

export function isInvitationStatus(value: unknown): value is InvitationStatus {
	return (INVITATION_STATUSES as readonly unknown[]).includes(value);
}

/** Staging dashboard: "Үр дүн" товч зөвхөн COMPLETED/STARTED үед идэвхтэй (bundle ✅). */
export function isResultAvailable(status: string): boolean {
	return status === "COMPLETED" || status === "STARTED";
}

// Анхаарал төвлөрөл (TestResult.dataQuality) — staging bundle-ийн mapping ✅
export type DataQualityTone =
	| "success"
	| "info"
	| "warning"
	| "error"
	| "neutral";

export const DATA_QUALITY: Record<
	string,
	{ label: string; tone: DataQualityTone }
> = {
	ENOUGH_QUALITY: { label: "Сайн", tone: "success" },
	SUFFICIENT_QUALITY: { label: "Хангалттай", tone: "info" },
	POOR_QUALITY: { label: "Сул", tone: "warning" },
	ANY_QUALITY: { label: "Муу", tone: "error" },
};

export const DATA_QUALITY_UNKNOWN = {
	label: "Тодорхойгүй",
	tone: "neutral" as DataQualityTone,
};

// Явцын хяналт (assessment.eventSummary) — staging bundle-ийн жагсаалт, дараалал ✅.
// CUT ирдэг ч staging харуулдаггүй. PAGE_VISIBILITY_HIDDEN байхгүй бол TAB_SWITCH-ийг уншина.
export const PROCTORING_EVENTS: {
	key: string;
	fallbackKey?: string;
	title: string;
	description: string;
	hasDuration: boolean;
}[] = [
	{
		key: "FULLSCREEN_EXIT",
		title: "Fullscreen exits",
		description: "Бүтэн дэлгэцийн горимоос гарсан.",
		hasDuration: true,
	},
	{
		key: "PAGE_VISIBILITY_HIDDEN",
		fallbackKey: "TAB_SWITCH",
		title: "Tab switches",
		description: "Өөр tab руу шилжсэн.",
		hasDuration: true,
	},
	{
		key: "WINDOW_FOCUS_LOST",
		title: "Window focus lost",
		description: "Цонх идэвхгүй болсон.",
		hasDuration: true,
	},
	{
		key: "COPY",
		title: "Copy event",
		description: "Текст хуулах оролдлого бүртгэгдсэн.",
		hasDuration: false,
	},
	{
		key: "PASTE",
		title: "Paste event",
		description: "Текст буулгах үйлдэл бүртгэгдсэн.",
		hasDuration: false,
	},
];
