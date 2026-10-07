// Талентийн үнэлгээний төрлүүд. Эх сурвалж: staging ажиглалт (docs/role-assessment/report.md
// §3.2, verification.md) + swagger (docs/swagger/openapi.json). Swagger-ийн DTO-нууд
// (RecruitmentInfo, Talent г.м.) lib/types/api.ts-д.

import type { SpringPage } from "@/lib/api/http";
import type {
	InvitationStatus,
	RecruitmentStatus,
	TestColor,
} from "@/lib/constants/roleAssessment";
import type { ApiPageParams } from "@/lib/pagination";

/** swagger: User / UserNameView — id нь string */
export interface UserRef {
	id: string;
	firstName: string;
	lastName: string;
}

// --- my-recruitments-controller ---

/** GET /customer/recruitments/statistics (swagger HiringHomeStatistics) */
export interface RecruitmentStats {
	totalInvitationCount: number;
	totalCompletedCount: number;
	invitationBalance: number;
}

export interface RecruitmentListItem {
	id: string;
	name: string;
	status: RecruitmentStatus;
	createdAt: string;
	publishedAt: string | null;
	closedAt: string | null;
	totalInvitationCount: number;
	completedInvitationCount: number;
}

export interface RecruitmentListParams extends ApiPageParams {
	/** Байхгүй бол бүх статус. `CLOSED` ч дэмжигддэг (staging ✅). */
	status?: RecruitmentStatus;
	name?: string;
}

/** Сонгосон тест (catalog). `id` нь catalog id, `testId` нь дотоод тест (тайлан §4 ✅). */
export interface RecruitmentTest {
	id: string;
	testId: string;
	name: string;
	description: string;
	/** Категорийн label (id биш), жишээ "Зөөлөн ур чадвар" */
	category: string;
	/** Staging дээр ✅ ажиглагдсан */
	pageSize?: number;
	minMinutes: number;
	maxMinutes: number;
	questionCount: number;
	color: TestColor;
}

export interface RecruitmentCustomQuestion {
	id: number;
	content: string;
	description: string;
	minMinutes: number;
	maxMinutes: number;
}

/** GET /customer/recruitments/{id} (#3) — тайлан §3.2 ✅ */
export interface RecruitmentDetail {
	id: string;
	name: string;
	status: RecruitmentStatus;
	createdAt: string;
	/** Байхгүй үед null биш, огт ирэхгүй (✅ U13) */
	publishedAt?: string | null;
	closedAt?: string | null;
	createdBy: UserRef;
	publishedBy?: UserRef | null;
	closedBy?: UserRef | null;
	count: { total: number; completed: number };
	tests: RecruitmentTest[];
	customQuestions: RecruitmentCustomQuestion[];
}

// --- recruitment-set-up-controller ---

export interface UpdateRecruitmentInfoPayload {
	jobTitle: string;
	jobDescription: string;
	companyName: string;
	companyDescription?: string;
}

// --- my-hiring-test-controller ---

/** GET /customer/role-assessments/tests/{catalogTestId} (#10) — тайлан §3.2 ✅ */
export interface RoleAssessmentTestDetail {
	id: string;
	name: string;
	description: string;
	pageSize?: number;
	/** Серверээс ирэх HTML. Зөвхөн sandbox iframe-д харуулна. */
	content: string;
}

// --- my-talent-controller: урилга ---

/**
 * GET /customer/hiring-invitations/list/{recruitmentId} (#14) — staging ✅.
 * Хоосон `phoneNumber`, `completedAt`, `ratingPoints` нь null биш, огт ирдэггүй.
 * Анхаар: энэ GET хугацаа нь өнгөрсөн PENDING урилгыг серверт EXPIRED болгодог.
 */
export interface RecruitmentInvitation {
	id: string;
	recruitmentId: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null;
	/** YYYY-MM-DD */
	dueDate: string;
	status: InvitationStatus;
	createdAt: string;
	completedAt?: string | null;
	rated: boolean;
	/** rated=true үед л ирнэ (staging ✅) */
	ratingPoints?: number | null;
	invitedBy: UserRef;
}

export interface InviteTalentPayload {
	recruitmentId: string;
	email: string;
	firstName: string;
	lastName: string;
	/** Хоосон бол `null` илгээнэ (staging 📦) */
	phoneNumber?: string | null;
	/** swagger date; staging анхдагч маргааш / +7 хоног (UI талд) */
	dueDate: string | Date;
}

export interface SpendingTime {
	minutes: number;
	seconds: number;
}

export interface PersonalReportSubContent {
	factorKey: string;
	factorName: string;
	/** SUB_SCALE_WITH_HIGHEST үед null ирдэг */
	intervalKey: string | null;
	intervalName: string | null;
	/** Сөрөг утга байж болно (жишээ -18) */
	points: number;
}

export interface PersonalReport {
	id: string;
	/** TOTAL_SCORE | SUB_SCALE_WITH_INTERVAL | SUB_SCALE_WITH_HIGHEST (ажигласан) */
	assessorType: string;
	templateKey: string;
	resultKey: string | null;
	subContents: PersonalReportSubContent[];
}

export interface TestResult {
	id: string;
	name: string;
	/** #19/#20 тайлангийн түлхүүр */
	answerId: string;
	spendingTime: SpendingTime | null;
	/** ENOUGH_QUALITY | SUFFICIENT_QUALITY | POOR_QUALITY | ANY_QUALITY */
	dataQuality: string;
	personalReport: PersonalReport | null;
}

export interface CustomQuestionAnswer {
	/** Нэг assessment-ийн бүх хариултад ижил — React key болгож болохгүй (✅) */
	responseId: string;
	testAnswerId: string;
	/** Хариулт бүрт давтагдахгүй */
	questionId: number;
	questionText: string;
	/** Талентын хариулт; хоосон бол "Хариулаагүй" */
	content: string | null;
	points: number;
	spendingTime?: SpendingTime | null;
}

export interface EventSummaryItem {
	eventType: string;
	count: number;
	/** swagger BehaviorEventSummary.seconds; утгагүй үед ирэхгүй */
	seconds?: number | null;
}

export interface Assessment {
	id: string;
	completedAt: string | null;
	spendingTime: SpendingTime | null;
	testResults: TestResult[];
	customQuestionAnswers: CustomQuestionAnswer[];
	eventSummary: Record<string, EventSummaryItem | undefined>;
}

/** GET /customer/hiring-invitations/{recruitmentId}/{invitationId} (#15) */
export interface InvitationResult {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	status: InvitationStatus;
	createdAt: string;
	/** #16-ийн дарааллаар (✅) */
	prevId: string | null;
	nextId: string | null;
	invitedBy: UserRef;
	/** STARTED / PENDING / EXPIRED үед null */
	assessment: Assessment | null;
}

/** GET /customer/hiring-invitations/names/{recruitmentId} (#16) — Page биш массив */
export interface InvitationName {
	id: string;
	firstName: string;
	lastName: string;
	status: InvitationStatus;
}

/** GET /customer/hiring-invitations/{invitationId}/rate (#17) */
export interface InvitationRate {
	rated: boolean;
	myPoints: number | null;
	avgPoints: number | null;
	count: number;
}

/** GET /customer/hiring-invitations/{invitationId}/notes (#18), swagger InvitationNoteView */
export interface InvitationNote {
	id: number;
	note: string;
	createdAt: string;
	createdBy: UserRef;
}

/** GET /customer/hiring-invitations/latest-completed (#24, swagger InvitationProjection) */
export interface CompletedInvitation {
	id: string;
	recruitmentId: string;
	recruitmentName: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	status: InvitationStatus;
	dueDate: string;
	createdAt: string;
	completedAt: string | null;
	createdBy: string;
	rated: boolean;
	ratingPoints: number | null;
}

// --- my-talent-controller: талентууд ---

export interface TalentRecruitment {
	name: string;
	id: string;
	talentId: number;
}

/** GET /customer/hiring-invitations/talents (#21) — Talent */
export interface HiringInvitationItem {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	avgStarPoint: number;
	marked: boolean;
	createdAt: string;
	recruitments: TalentRecruitment[];
}

export type TalentListPage = SpringPage<HiringInvitationItem>;

export interface TalentListParams extends ApiPageParams {
	/** Хайлт (`name` биш — staging ✅) */
	q?: string;
	/** Зөвхөн тэмдэглэсэн. Staging зөвхөн `true` үед илгээдэг 📦 */
	marked?: boolean;
}

/** GET /customer/hiring-invitations/talents/{id} (#22) */
export interface TalentDetail {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	avgStarPoint: number;
	marked: boolean;
	createdAt: string;
	recruitments: TalentRecruitment[] | null;
}

/**
 * GET /customer/hiring-invitations/talents/{talentId}/invitations (#23, swagger InvitationDTO).
 * Имэйл/нэр талбар БАЙХГҮЙ (staging ✅).
 */
export interface TalentInvitationItem {
	id: string;
	createdAt: string;
	/** Хоосон үед хариунд огт ирэхгүй (✅) */
	completedAt?: string | null;
	status: InvitationStatus;
	rated: boolean;
	/** swagger: double; rated=true үед л ирнэ */
	ratingPoints?: number | null;
	recruitmentId: string;
	recruitmentName: string;
	invitedBy: UserRef;
	/** Тестийн нэрс */
	tests: string[];
}

export type TalentInvitationPage = SpringPage<TalentInvitationItem>;
