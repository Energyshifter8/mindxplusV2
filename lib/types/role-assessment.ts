import type { SpringPage } from "@/lib/api/http";
import type {
	InvitationStatus,
	RecruitmentStatus,
	TestColor,
} from "@/lib/constants/roleAssessment";
import type { ApiPageParams } from "@/lib/pagination";

export interface UserRef {
	id: string;
	firstName: string;
	lastName: string;
}

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
	status?: RecruitmentStatus;
	name?: string;
}

export interface RecruitmentTest {
	id: string;
	testId: string;
	name: string;
	description: string;
	category: string;
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

export interface RecruitmentDetail {
	id: string;
	name: string;
	status: RecruitmentStatus;
	createdAt: string;
	publishedAt?: string | null;
	closedAt?: string | null;
	createdBy: UserRef;
	publishedBy?: UserRef | null;
	closedBy?: UserRef | null;
	count: { total: number; completed: number };
	tests: RecruitmentTest[];
	customQuestions: RecruitmentCustomQuestion[];
}

export interface UpdateRecruitmentInfoPayload {
	jobTitle: string;
	jobDescription: string;
	companyName: string;
	companyDescription?: string;
}

export interface RoleAssessmentTestDetail {
	id: string;
	name: string;
	description: string;
	pageSize?: number;
	content: string;
}

export interface RecruitmentInvitation {
	id: string;
	recruitmentId: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null;
	dueDate: string;
	status: InvitationStatus;
	createdAt: string;
	completedAt?: string | null;
	rated: boolean;
	ratingPoints?: number | null;
	invitedBy: UserRef;
}

export interface InviteTalentPayload {
	recruitmentId: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null;
	dueDate: string | Date;
}

export interface SpendingTime {
	minutes: number;
	seconds: number;
}

export interface PersonalReportSubContent {
	factorKey: string;
	factorName: string;
	intervalKey: string | null;
	intervalName: string | null;
	points: number;
}

export interface PersonalReport {
	id: string;
	assessorType: string;
	templateKey: string;
	resultKey: string | null;
	subContents: PersonalReportSubContent[];
}

export interface TestResult {
	id: string;
	name: string;
	answerId: string;
	spendingTime: SpendingTime | null;
	dataQuality: string;
	personalReport: PersonalReport | null;
}

export interface CustomQuestionAnswer {
	responseId: string;
	testAnswerId: string;
	questionId: number;
	questionText: string;
	questionDescription?: string | null;
	content: string | null;
	points: number;
	spendingTime?: SpendingTime | null;
}

export interface EventSummaryItem {
	eventType: string;
	count: number;
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

export interface InvitationResult {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	status: InvitationStatus;
	createdAt: string;
	prevId: string | null;
	nextId: string | null;
	invitedBy: UserRef;
	assessment: Assessment | null;
}

export interface InvitationName {
	id: string;
	firstName: string;
	lastName: string;
	status: InvitationStatus;
}

export interface InvitationRate {
	rated: boolean;
	myPoints: number | null;
	avgPoints: number | null;
	count: number;
}

export interface InvitationNote {
	id: number;
	note: string;
	createdAt: string;
	createdBy: UserRef;
}

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

export interface TalentRecruitment {
	name: string;
	id: string;
	talentId: number;
}

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
	q?: string;
	marked?: boolean;
}

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

export interface TalentInvitationItem {
	id: string;
	createdAt: string;
	completedAt?: string | null;
	status: InvitationStatus;
	rated: boolean;
	ratingPoints?: number | null;
	recruitmentId: string;
	recruitmentName: string;
	invitedBy: UserRef;
	tests: string[];
}

export type TalentInvitationPage = SpringPage<TalentInvitationItem>;
