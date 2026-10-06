// Backend-ийн төрлүүд — swagger (docs/swagger/openapi.json, springdoc).
// Swagger-ийн response schema-д `required`/`nullable` ихэвчлэн тодорхойлогдоогүй тул
// талбарууд optional. Staging дээр `null` ирж буйг ажигласан талбарт `| null` нэмсэн.
// Зөрүү: docs/swagger/mismatches.md

// --- Enum-ууд (swagger) ---

/** swagger: RecruitmentListView.status, MySurveyView.status, RecruitmentDetail.status */
export type PublishStatus =
	| "CREATED"
	| "PUBLISHING"
	| "PUBLISHED"
	| "CLOSED"
	| "SUSPENDED";

/** swagger: InvitationProjection.status, CustomerInvitationView.status */
export type InvitationStatusDto =
	| "PENDING"
	| "EXPIRED"
	| "STARTED"
	| "COMPLETED";

/** swagger: UserInfo.role */
export type UserRole = "OWNER" | "MANAGER" | "VIEWER";

/** swagger: AccountDTO.planType */
export type PlanType = "FREE" | "BASIC" | "STANDARD" | "PREMIUM" | "CUSTOM";

/** swagger: AccountDTO.months */
export type PlanMonths = "QUARTER" | "YEAR";

/** swagger: HiringTestPublicDTO.color */
export type HiringTestColor =
	| "CLAY"
	| "TEAL"
	| "MIDNIGHT"
	| "SLATE"
	| "VELVET"
	| "WHITE"
	| "GREEN"
	| "YELLOW";

/** swagger: PersonalReport.assessorType */
export type AssessorType =
	| "NO_ASSESSMENT"
	| "TOTAL_SCORE"
	| "SUB_SCALE_WITH_HIGHEST"
	| "SUB_SCALE_WITH_HIGHEST_AVERAGE"
	| "SUB_SCALE_WITH_OVERALL"
	| "SUB_SCALE_WITH_INTERVAL"
	| "SUB_SCALE_WITH_AVG_INTERVAL"
	| "MBTI";

// --- Нийтлэг ---

/** swagger: SortObject */
export interface SortObject {
	empty?: boolean;
	sorted?: boolean;
	unsorted?: boolean;
}

/** swagger: PageableObject */
export interface PageableObject {
	offset?: number;
	sort?: SortObject;
	paged?: boolean;
	pageNumber?: number;
	pageSize?: number;
	unpaged?: boolean;
}

/** swagger: Page* (Spring Data) */
export interface Page<T> {
	totalElements?: number;
	totalPages?: number;
	size?: number;
	content?: T[];
	number?: number;
	sort?: SortObject;
	numberOfElements?: number;
	pageable?: PageableObject;
	first?: boolean;
	last?: boolean;
	empty?: boolean;
}

/** swagger: TokenDTO */
export interface TokenDTO {
	token?: string;
}

// --- GET /customer/profile ---

/** swagger: Company */
export interface Company {
	id?: number;
	/** required, 5–100 */
	name: string;
	/** 6–7 */
	regnum?: string;
}

/**
 * swagger: UserInfo. Staging хариунд нэмэлт `createdAt`, `customerId`, `inactiveAt`
 * ирдэг (swagger-т байхгүй) — optional-оор нэмсэн.
 */
export interface UserInfo {
	id?: number;
	email?: string;
	firstName?: string;
	lastName?: string;
	onboarded?: boolean;
	role?: UserRole;
	active?: boolean;
	company?: Company;
	createdAt?: string;
	customerId?: number;
	inactiveAt?: string | null;
}

// --- GET /customer/account ---

/** swagger: AccountDTO */
export interface AccountDTO {
	planType?: PlanType;
	employeeLimit?: number;
	planName?: string;
	months?: PlanMonths;
	paidAmount?: number;
	/** date (YYYY-MM-DD) */
	startDate?: string;
	/** date (YYYY-MM-DD) */
	dueDate?: string;
	dataAccess?: boolean;
	hasTrialSurvey?: boolean;
	expired?: boolean;
}

// --- GET /customer/surveys ---

/** swagger: MySurveyView */
export interface MySurveyView {
	name?: string;
	id?: string;
	deviceCheck?: boolean;
	status?: PublishStatus;
	customerId?: number;
	createdAt?: string;
	publishedAt?: string | null;
	qr?: string;
	link?: string;
	/** date */
	expireDate?: string | null;
	passcodeProtected?: boolean;
	trial?: boolean;
	templateId?: string;
	goal?: number;
	minMinutes?: number;
	maxMinutes?: number;
	questionCount?: number;
	receivedResponseCount?: number;
}

// --- GET /customer/surveys-home/statistics ---

/** swagger: SurveyHomeStatistics */
export interface SurveyHomeStatistics {
	totalPublishedSurveyCount?: number;
	totalRespondentCount?: number;
	surveyBalance?: number;
}

// --- GET /customer/recruitments/ ---

/** swagger: RecruitmentListView (staging дээр `publishedAt/closedAt: null` ✅) */
export interface RecruitmentListView {
	name?: string;
	id?: string;
	status?: PublishStatus;
	createdAt?: string;
	publishedAt?: string | null;
	closedAt?: string | null;
	completedInvitationCount?: number;
	totalInvitationCount?: number;
}

// --- GET /customer/recruitments/statistics ---

/** swagger: HiringHomeStatistics */
export interface HiringHomeStatistics {
	totalInvitationCount?: number;
	totalCompletedCount?: number;
	invitationBalance?: number;
}

// --- GET /customer/hiring-invitations/latest-completed ---

/** swagger: InvitationProjection (`phoneNumber`, `ratingPoints` null ирдэг ✅) */
export interface InvitationProjection {
	createdBy?: string;
	completedAt?: string;
	rated?: boolean;
	ratingPoints?: number | null;
	recruitmentName?: string;
	id?: string;
	status?: InvitationStatusDto;
	/** date */
	dueDate?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
	recruitmentId?: string;
	phoneNumber?: string | null;
}
