import type { HiringTestColor, PublishStatus } from "@/lib/types/api";

export const RECRUITMENT_STATUSES = [
	"CREATED",
	"PUBLISHING",
	"PUBLISHED",
	"CLOSED",
	"SUSPENDED",
] as const;
export type RecruitmentStatus = (typeof RECRUITMENT_STATUSES)[number] &
	PublishStatus;

export const RECRUITMENT_STATUS_LABELS: Record<RecruitmentStatus, string> = {
	CREATED: "Үүссэн",
	PUBLISHING: "PUBLISHING",
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

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
	PENDING: "Уригдсан",
	STARTED: "Эхэлсэн",
	COMPLETED: "Дууссан",
	EXPIRED: "Хугацаа дууссан",
};

export type TestColor = HiringTestColor;

export function isInvitationStatus(value: unknown): value is InvitationStatus {
	return (INVITATION_STATUSES as readonly unknown[]).includes(value);
}

export function isResultAvailable(status: string): boolean {
	return status === "COMPLETED" || status === "STARTED";
}

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

export function isRecruitmentEditable(status: string | undefined): boolean {
	return status === "CREATED";
}

export function opensWizard(status: string | undefined): boolean {
	return status === "CREATED";
}

export function canRenameRecruitment(status: string | undefined): boolean {
	return status === "CREATED";
}

export function canDeleteRecruitment(status: string | undefined): boolean {
	return status === "CREATED";
}

export function canInviteToRecruitment(status: string | undefined): boolean {
	return status === "PUBLISHED";
}

export function canCloseRecruitment(status: string | undefined): boolean {
	return status === "PUBLISHED";
}

export function canExtendInvitation(status: string | undefined): boolean {
	return status === "EXPIRED";
}
