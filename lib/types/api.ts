export type PublishStatus =
	| "CREATED"
	| "PUBLISHING"
	| "PUBLISHED"
	| "CLOSED"
	| "SUSPENDED";

export type InvitationStatusDto =
	| "PENDING"
	| "EXPIRED"
	| "STARTED"
	| "COMPLETED";

export type UserRole = "OWNER" | "MANAGER" | "VIEWER";

export type PlanType = "FREE" | "BASIC" | "STANDARD" | "PREMIUM" | "CUSTOM";

export type PlanMonths = "QUARTER" | "YEAR";

export type HiringTestColor =
	| "CLAY"
	| "TEAL"
	| "MIDNIGHT"
	| "SLATE"
	| "VELVET"
	| "WHITE"
	| "GREEN"
	| "YELLOW";

export type AssessorType =
	| "NO_ASSESSMENT"
	| "TOTAL_SCORE"
	| "SUB_SCALE_WITH_HIGHEST"
	| "SUB_SCALE_WITH_HIGHEST_AVERAGE"
	| "SUB_SCALE_WITH_OVERALL"
	| "SUB_SCALE_WITH_INTERVAL"
	| "SUB_SCALE_WITH_AVG_INTERVAL"
	| "MBTI";

export interface SortObject {
	empty?: boolean;
	sorted?: boolean;
	unsorted?: boolean;
}

export interface PageableObject {
	offset?: number;
	sort?: SortObject;
	paged?: boolean;
	pageNumber?: number;
	pageSize?: number;
	unpaged?: boolean;
}

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

export interface TokenDTO {
	token?: string;
}

export interface Company {
	id?: number;
	name: string;
	regnum?: string;
}

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

export interface AccountDTO {
	planType?: PlanType;
	employeeLimit?: number;
	planName?: string;
	months?: PlanMonths;
	paidAmount?: number;
	startDate?: string;
	dueDate?: string;
	dataAccess?: boolean;
	hasTrialSurvey?: boolean;
	expired?: boolean;
}

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

export interface SurveyHomeStatistics {
	totalPublishedSurveyCount?: number;
	totalRespondentCount?: number;
	surveyBalance?: number;
}

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

export interface HiringHomeStatistics {
	totalInvitationCount?: number;
	totalCompletedCount?: number;
	invitationBalance?: number;
}

export interface InvitationProjection {
	createdBy?: string;
	completedAt?: string;
	rated?: boolean;
	ratingPoints?: number | null;
	recruitmentName?: string;
	id?: string;
	status?: InvitationStatusDto;
	dueDate?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
	recruitmentId?: string;
	phoneNumber?: string | null;
}

export interface RecruitmentBriefView {
	id?: string;
	name?: string;
	createdAt?: string;
	publishedAt?: string | null;
	closedAt?: string | null;
	status?: PublishStatus;
}

export interface RecruitmentSettings {
	maxTestCount?: number;
	maxQuestionCount?: number;
}

export interface RecruitmentInfo {
	jobTitle: string;
	jobDescription: string | null;
	companyName: string;
	companyDescription?: string | null;
}

export interface CategoryWithCount {
	id?: string;
	name?: string;
	count?: number;
}

export type RoleLevel = "ENTRY" | "SENIOR" | "MANAGER";

export interface EmailDTO {
	value: string;
}

export interface DateDTO {
	value?: string;
}

export interface Rating {
	points: number;
}

export interface IdDTO {
	id: number;
}

export interface StrDTO {
	str: string;
}

export interface RestResponse<T> {
	message?: string;
	status?: number;
	success?: boolean;
	data?: T;
}

export interface FullName {
	firstName: string;
	lastName: string;
}

export interface Talent {
	id?: string;
	recruitmentId: string;
	email: string;
	lastName: string;
	firstName: string;
	phoneNumber?: string | null;
	dueDate?: string;
	status?: InvitationStatusDto;
	fullName?: string;
	fullNameObject?: FullName;
}

export interface InvitationEntity {
	createdAt?: string;
	updatedAt?: string;
	createdBy?: string;
	updatedBy?: string;
	id?: string;
	talentId: number;
	recruitmentId: string;
	customerId: number;
	dueDate?: string;
	completedAt?: string | null;
	token: string;
	avgRatingPoints?: number | null;
	status: InvitationStatusDto;
	expired?: boolean;
}

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

export type DesignOwnerType =
	| "SURVEY"
	| "SURVEY_TEMPLATE"
	| "HIRING_TEST"
	| "RECRUITMENT";

export type ThemeType = "LIGHT" | "YALE" | "DARK" | "MIRAGE" | "PURPLE";

export type LogoPosition = "TOP_LEFT" | "TOP_MIDDLE" | "TOP_RIGHT";

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

export interface UpdateDesign {
	themeType: ThemeType;
	logoPosition: LogoPosition;
	showAppLogo: boolean;
}
