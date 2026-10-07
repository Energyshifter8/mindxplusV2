import type { HiringTestColor, PublishStatus } from "@/lib/types/api";

// Талентийн үнэлгээ (role assessment)-ийн enum ба Монгол label.
// Эх сурвалж: docs/role-assessment-report.md §4 (staging ✅).

// swagger: RecruitmentListView.status / RecruitmentDetail.status / MySurveyView.status
export const RECRUITMENT_STATUSES = [
	"CREATED",
	"PUBLISHING",
	"PUBLISHED",
	"CLOSED",
	"SUSPENDED",
] as const;
export type RecruitmentStatus = (typeof RECRUITMENT_STATUSES)[number] &
	PublishStatus;

// Label: staging UI (bundle 📦). PUBLISHING-ийг staging орчуулаагүй, түүхий текстээр харуулдаг.
export const RECRUITMENT_STATUS_LABELS: Record<RecruitmentStatus, string> = {
	CREATED: "Үүссэн",
	PUBLISHING: "PUBLISHING",
	// санал: өмнө нь "Нийтэлсэн" байсан; staging "Идэвхтэй" гэж харуулдаг
	PUBLISHED: "Идэвхтэй",
	CLOSED: "Хаагдсан",
	SUSPENDED: "Саатсан",
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

// Тестийн өнгө — swagger: HiringTestPublicDTO.color (staging каталогт GREEN, YELLOW ✅)
export type TestColor = HiringTestColor;

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

// POST /customer/role-assessments/recommend — body нь асуулт бүрт сонгосон
// хариултын `value`, асуултын дарааллаар (string[]). Асуулт, утга: staging bundle 📦.
export const RECOMMEND_QUESTIONS = [
	{
		id: "question1",
		title: "Та бөлгөж буй сонгон шалгаруулалт аль түвшний ажлын байр вэ?",
		options: [
			{ value: "entry", label: "Шинэ ажилтан" },
			{ value: "senior", label: "Менежер, ахлах мэргэжилтэн түвшин" },
			{ value: "manager", label: "Удирдах албан тушаал" },
		],
	},
	{
		id: "question2",
		title: "Тухайн ажлын байрны гол зорилго ямар чадварт илүү төвлөрдөг вэ?",
		options: [
			{ value: "execution", label: "Гүйцэтгэл ба хэрэгжүүлэлт" },
			{ value: "leadership", label: "Манлайлал ба зохион байгуулалт" },
			{ value: "strategy", label: "Стратеги ба байгууллагын нөлөө" },
		],
	},
	{
		id: "question3",
		title:
			"Ажлын байрны онцлогоос шалтгаалан ямар төрлийн зөөлөн ур чадвар үнэлэх нь илүү чухал вэ?",
		options: [
			{ value: "self-discipline", label: "Хувийн ур чадвар ба сахилга бат" },
			{
				value: "teamwork",
				label: "Хүмүүсийн харилцаа ба багийн хамтын ажиллагаа",
			},
			{ value: "strategic", label: "Стратеги сэтгэлгээ ба манлайлал" },
		],
	},
] as const;

export type RecommendAnswer =
	(typeof RECOMMEND_QUESTIONS)[number]["options"][number]["value"];

// --- Статусаас хамаарах үйлдлүүд (staging bundle 📦: жагсаалт, wizard, dashboard) ---

/** Wizard-д засах боломжтой (бусад үед зөвхөн унших горим). */
export function isRecruitmentEditable(status: string | undefined): boolean {
	return status === "CREATED";
}

/** Мөр/нэр дээр дарахад: CREATED → wizard, бусад → dashboard. */
export function opensWizard(status: string | undefined): boolean {
	return status === "CREATED";
}

/** Нэр солих, устгах: зөвхөн CREATED. */
export function canRenameRecruitment(status: string | undefined): boolean {
	return status === "CREATED";
}

export function canDeleteRecruitment(status: string | undefined): boolean {
	return status === "CREATED";
}

/** Урих, хаах: зөвхөн PUBLISHED. */
export function canInviteToRecruitment(status: string | undefined): boolean {
	return status === "PUBLISHED";
}

export function canCloseRecruitment(status: string | undefined): boolean {
	return status === "PUBLISHED";
}

/** Dashboard "Дахин урих" (сунгах): зөвхөн EXPIRED урилга. */
export function canExtendInvitation(status: string | undefined): boolean {
	return status === "EXPIRED";
}
