import type { SpringPage } from "@/lib/api/http";
import { type ApiResponse, apiGet, apiPost, httpClient } from "@/lib/api/http";
import { recruitmentListPath } from "@/lib/api/role-assessment/recruitments";
import type {
	CompletedInvitation,
	RecruitmentListItem,
	RecruitmentListParams,
} from "@/lib/types/role-assessment";

// HTTP цөм (axios instance, ApiResponse, apiGet/apiPost, *OrThrow, SpringPage):
// lib/api/http.ts. Талентийн үнэлгээний endpoint-ууд: lib/api/role-assessment/.
export * from "@/lib/api/http";
export type {
	CompletedInvitation,
	RecruitmentListItem,
	RecruitmentListParams,
	RecruitmentStats,
} from "@/lib/types/role-assessment";

// --- Auth endpoint-ууд (staging-ийн ажигласан path; swagger-т байхгүй — docs/swagger/mismatches.md E7, E8) ---

/** POST /user/refresh `{}` (refresh cookie + Authorization) → `{token}` */
export async function refreshTokenRequest(): Promise<string> {
	const response = await httpClient.post<{ token?: string }>(
		"/user/refresh",
		{},
	);
	const token = response.data?.token;
	if (!token) throw new Error("Refresh response without token");
	return token;
}

/** POST /user/logout (body-гүй) */
export async function logoutRequest(): Promise<void> {
	await httpClient.post("/user/logout");
}

// --- Types ---

export interface ModuleStats {
	totalPublishedSurveyCount: number;
	totalRespondentCount: number;
	surveyBalance: number;
}

export function getRecruitmentStats<T>() {
	return apiGet<T>("/customer/recruitments/statistics");
}

export function getSurveyStats<T>() {
	return apiGet<T>("/customer/surveys-home/statistics");
}

export function getTemplates<T>() {
	return apiGet<T>("/customer/templates");
}

export interface TemplateDetail {
	id: string;
	name: string;
	questionCount: number;
	minMinutes: number;
	maxMinutes: number;
	likes: number;
	image: string;
	author: string;
	description: string;
	frequency: string;
	whenSuitable: string;
	importance: string;
	hasTrial: boolean;
	categories: string[];
	status: string;
}

export function getTemplateDetail(id: string) {
	return apiGet<TemplateDetail>(`/customer/templates/${id}`);
}

export interface SurveyItem {
	id: string;
	title: string;
	description?: string;
	status: "PUBLISHED" | "CREATED" | "CLOSED";
	createdAt: string;
	updatedAt: string;
	respondentCount?: number;
}

export function getSurveysList<T>() {
	return apiGet<T>("/customer/surveys");
}

export interface SurveyListItem {
	id: string;
	name: string;
	status: string;
	createdAt: string;
	closedAt?: string;
	questionCount: number;
	receivedResponseCount: number;
	goal: number;
}

export interface PaginatedResponse<T> {
	totalElements: number;
	totalPages: number;
	size: number;
	content: T[];
}

export function getSurveyList(params?: {
	status?: string;
	page?: number;
	size?: number;
	name?: string;
}) {
	const query = new URLSearchParams(
		params as Record<string, string>,
	).toString();
	return apiGet<PaginatedResponse<SurveyListItem>>(
		`/customer/surveys${query ? `?${query}` : ""}`,
	);
}

// --- Нүүр хуудас (components/Dashboard.tsx) — {success,data} хэлбэр ---

export function getRecruitmentList(params: RecruitmentListParams) {
	return apiGet<SpringPage<RecruitmentListItem>>(recruitmentListPath(params));
}

/** swagger: `limit` 5..10 (анхдагч 5). Хүрээнээс гарсан утгыг 400 болохоос өмнө тааруулна. */
export function getLatestCompletedInvitations(limit = 5) {
	const safeLimit = Math.min(10, Math.max(5, Math.trunc(limit) || 5));
	return apiGet<CompletedInvitation[]>(
		`/customer/hiring-invitations/latest-completed?limit=${safeLimit}`,
	);
}

export interface CreateSurveyPayload {
	[key: string]: unknown;
}

export interface CreateSurveyResponse {
	id: string;
}

export async function createSurvey(
	payload: CreateSurveyPayload,
): Promise<ApiResponse<CreateSurveyResponse>> {
	const res = await apiPost<string>("customer/surveys/new", payload as object);
	if (res.success && typeof res.data === "string") {
		return { success: true, data: { id: res.data } };
	}
	return { success: false, error: res.error };
}

// --- Survey Detail types & API ---

export interface SurveyPageItem {
	id: string;
	qnSection: string;
	pageType: string;
	title: string;
	content: string;
	btnLabel?: string;
	pageOrder: number;
}

export interface SurveyOption {
	id: string;
	order: number;
	content: string;
	point: number;
}

export interface SurveyQuestion {
	id: string;
	content: string;
	minAnswerCount: number;
	maxAnswerCount: number;
	questionType: string;
	section: string;
	options: SurveyOption[];
	questionOrder: number;
	isRequired: boolean;
	toBeAssessed: boolean;
	questionOrderWithSectionValue: number;
}

export interface SurveyDesign {
	id: string;
	designOwnerId: string;
	designOwnerType: string;
	themeType: string;
	imagePosition: string;
	showAppLogo: boolean;
	hasLogo: boolean;
}

export interface SurveyDetail {
	id: string;
	name: string;
	status: string;
	hasAssessment: boolean;
	creatorName: string;
	expireAt: string | null;
	deviceCheck: boolean;
	passCodeProtected: boolean;
	pages: {
		START: SurveyPageItem[];
		END: SurveyPageItem[];
	};
	customQuestions: {
		CUSTOM_QUESTION_FIRST: SurveyQuestion[];
		CUSTOM_QUESTION_LAST?: SurveyQuestion[];
	};
	design: SurveyDesign;
	templateQuestions: SurveyQuestion[];
}

export function getSurveyDetail(id: string) {
	return apiGet<SurveyDetail>(`customer/surveys/${id}`);
}

// --- Survey Page Update types & API ---

export interface UpdateSurveyPagePayload {
	id: string;
	qnSection: string;
	pageType: string;
	title: string;
	content: string;
	btnLabel?: string;
	pageOrder: number;
}

export interface UpdateSurveyPageResponse {
	id: string;
	qnSection: string;
	pageType: string;
	title: string;
	content: string;
	btnLabel?: string;
	pageOrder: number;
}

export function updateSurveyPage(
	surveyId: string,
	payload: UpdateSurveyPagePayload,
) {
	return apiPost<UpdateSurveyPageResponse>(
		`customer/surveys/${surveyId}/update-page`,
		payload,
	);
}

// --- Survey Publish types & API ---

export interface PublishSurveyPayload {
	value: string;
}

export interface PublishSurveyResponse {
	id: string;
	status: string;
	expireAt: string;
}

export function publishSurvey(surveyId: string, payload: PublishSurveyPayload) {
	return apiPost<PublishSurveyResponse>(
		`customer/surveys/${surveyId}/publish`,
		payload,
	);
}

// --- Survey Edit Options types & API ---

export interface SurveyEditOptions {
	[key: string]: unknown;
}

export function getSurveyEditOptions(id: string) {
	return apiGet<SurveyEditOptions>(`customer/surveys/${id}/edit-options`);
}

// --- Custom Question CRUD types & API ---

export interface CreateQuestionPayload {
	id: 0;
	content: string;
	description: string;
	questionType: string;
	section: string;
	isRequired: boolean;
	minAnswerCount: number;
	maxAnswerCount: number;
	toBeAssessed?: boolean;
	options: {
		id: 0;
		order: number;
		content: string;
		point: number;
		tag: string;
		nextQuestionId: 0;
	}[];
	matrixRows: unknown[];
}

export interface CreateQuestionResponse {
	id: string;
	content: string;
	questionType: string;
	isRequired: boolean;
	minAnswerCount: number;
	maxAnswerCount: number;
	section: string;
	options: SurveyOption[];
}

export function createQuestion(
	surveyId: string,
	payload: CreateQuestionPayload,
) {
	return apiPost<CreateQuestionResponse>(
		`customer/questions/SURVEY/${surveyId}/add-question`,
		payload,
	);
}

export interface DeleteQuestionPayload {
	id: string;
}

export function deleteQuestion(
	surveyId: string,
	payload: DeleteQuestionPayload,
) {
	return apiPost<unknown>(
		`customer/questions/SURVEY/${surveyId}/delete-question`,
		payload,
	);
}

export async function deleteSurvey(id: string): Promise<ApiResponse<void>> {
	return apiPost("/customer/surveys/delete", { str: id });
}

export function setSurveyPasscode(surveyId: string, value: string) {
	return apiPost<unknown>(`customer/surveys/${surveyId}/set-passcode`, {
		value,
	});
}

export function setSurveyDeviceCheck(surveyId: string, value: string) {
	return apiPost<unknown>(`customer/surveys/${surveyId}/set-device-check`, {
		str: value,
	});
}

// --- Survey Insight types & API ---

export interface SurveyInsight {
	id: string;
	visitedCnt: number;
	completedCnt: number;
	emailSentCnt: number;
	averageMinutes: number;
	avgDataQuality: number;
}

export function getSurveyInsight(id: string) {
	return apiGet<SurveyInsight>(`customer/survey-analysis/insight/${id}`);
}

// --- Primary Question Summaries types & API ---

export interface QuestionSummaryOption {
	optionId: number;
	rowId: number;
	optionContent: string;
	rowContent: string;
	count: number;
}

export interface PrimaryQuestionSummary {
	questionId: number;
	type: string;
	content: string;
	count: number;
	avgScore: number;
	required: boolean;
	options: QuestionSummaryOption[];
}

export interface PrimaryQuestionSummariesResponse {
	content: PrimaryQuestionSummary[];
	pageNumber: number;
	pageSize: number;
	totalElements: number;
	totalPages: number;
}

export function getPrimaryQuestionSummaries(
	id: string,
	params?: { page?: number; size?: number; quality?: string },
) {
	const query = new URLSearchParams();
	query.set("page", String(params?.page ?? 0));
	query.set("size", String(params?.size ?? 50));
	if (params?.quality) query.set("quality", params.quality);
	return apiGet<PrimaryQuestionSummariesResponse>(
		`customer/survey-analysis/insight/${id}/primary-question-summaries?${query.toString()}`,
	);
}
