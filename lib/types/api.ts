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

// --- Customer recruitments: setup / catalog / invitations / design ---
// Swagger schema + staging дээр GET-ээр ✅ ажигласан хэлбэр (2026-10-06).

/** swagger: RecruitmentBriefView — GET /customer/recruitments/status/{id} ✅ */
export interface RecruitmentBriefView {
	id?: string;
	name?: string;
	createdAt?: string;
	publishedAt?: string | null;
	closedAt?: string | null;
	status?: PublishStatus;
}

/** swagger: RecruitmentSettings — staging ✅ `{maxTestCount: 4, maxQuestionCount: 3}` */
export interface RecruitmentSettings {
	maxTestCount?: number;
	maxQuestionCount?: number;
}

/**
 * swagger: RecruitmentInfo (request-д `jobTitle`, `jobDescription`, `companyName` required).
 * Шинэ (CREATED) үнэлгээнд `jobDescription: null` ирдэг ✅.
 */
export interface RecruitmentInfo {
	/** 0–100 */
	jobTitle: string;
	/** minLength 1. Staging: rich text (HTML) */
	jobDescription: string | null;
	/** 0–100 */
	companyName: string;
	/** Staging: rich text (HTML) */
	companyDescription?: string | null;
}

/**
 * swagger: CategoryWithCount. `id` нь шүүлтүүрийн түлхүүр (`hiring_soft_skill`,
 * `q_background` …), харин тест дээрх `category` нь `name` (label) байдаг ✅.
 * `count` staging дээр 0 ирдэг ✅ — тоо гэж бүү ашигла.
 */
export interface CategoryWithCount {
	id?: string;
	name?: string;
	count?: number;
}

/** swagger: HiringTestPublicDTO.roleLevels */
export type RoleLevel = "ENTRY" | "SENIOR" | "MANAGER";

/** swagger: Email — search-by-email body */
export interface EmailDTO {
	/** minLength 5 */
	value: string;
}

/** swagger: DateDTO — `value` нь date (YYYY-MM-DD) */
export interface DateDTO {
	value?: string;
}

/** swagger: Rating — `points` int 0..5 */
export interface Rating {
	points: number;
}

/** swagger: IdDTO */
export interface IdDTO {
	id: number;
}

/** swagger: StrDTO — `str` minLength 1 */
export interface StrDTO {
	str: string;
}

/** swagger: RestResponse* */
export interface RestResponse<T> {
	message?: string;
	status?: number;
	success?: boolean;
	data?: T;
}

/** swagger: FullName */
export interface FullName {
	firstName: string;
	lastName: string;
}

/**
 * swagger: Talent — POST invite-ийн body, POST {id}/extend-ийн хариу.
 * Нэр: 2–20, `^\p{L}[\p{L}'\-\s]*$`; email 5–50.
 */
export interface Talent {
	id?: string;
	recruitmentId: string;
	email: string;
	lastName: string;
	firstName: string;
	phoneNumber?: string | null;
	/** date (YYYY-MM-DD) */
	dueDate?: string;
	status?: InvitationStatusDto;
	fullName?: string;
	fullNameObject?: FullName;
}

/** swagger: InvitationEntity */
export interface InvitationEntity {
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	id?: string;
	talentId: number;
	recruitmentId: string;
	customerId: number;
	/** date */
	dueDate?: string;
	completedAt?: string | null;
	token: string;
	avgRatingPoints?: number | null;
	status: InvitationStatusDto;
	expired?: boolean;
}

/** swagger: TalentEntity — search-by-email-ийн `data` */
export interface TalentEntity {
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	id?: number;
	customerId: number;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null;
	avgRatePoints?: number | null;
	invitations?: InvitationEntity[];
}

/** swagger: DesignDTO.designOwnerType. Path-д staging RECRUITMENT (том үсэг) илгээдэг 📦 */
export type DesignOwnerType =
	| "SURVEY"
	| "SURVEY_TEMPLATE"
	| "HIRING_TEST"
	| "RECRUITMENT";

/** swagger: GET /customer/designs/themes ✅ */
export type ThemeType = "LIGHT" | "YALE" | "DARK" | "MIRAGE" | "PURPLE";

/** swagger: UpdateDesign.logoPosition / DesignDTO.imagePosition */
export type LogoPosition = "TOP_LEFT" | "TOP_MIDDLE" | "TOP_RIGHT";

/**
 * swagger: DesignDTO — GET /customer/designs/RECRUITMENT/{id} ✅.
 * Лого байхгүй үед `logoUrl` огт ирэхгүй ✅. Байрлал хариунд `imagePosition`,
 * харин update-ийн body-д `logoPosition` гэж нэрлэгддэг.
 */
export interface DesignDTO {
	id?: number;
	designOwnerId?: string;
	designOwnerType?: DesignOwnerType;
	themeType?: ThemeType;
	imagePosition?: LogoPosition;
	showAppLogo?: boolean;
	hasLogo?: boolean;
	logoUrl?: string;
}

/** swagger: UpdateDesign (бүгд required) */
export interface UpdateDesign {
	themeType: ThemeType;
	logoPosition: LogoPosition;
	showAppLogo: boolean;
}
