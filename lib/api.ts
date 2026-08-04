function getApiBaseUrl(): string {
	if (
		typeof window !== "undefined" &&
		window.location.hostname === "localhost"
	) {
		return "/api/proxy";
	}
	return (
		process.env.NEXT_PUBLIC_API_URL || "https://service-staging.mindxplus.com"
	);
}

const API_BASE_URL = getApiBaseUrl();

let isRedirectingToLogin = false;

function handle401() {
	if (isRedirectingToLogin) return;
	if (typeof window === "undefined") return;

	if (window.location.pathname.startsWith("/login")) {
		localStorage.removeItem("token");
		localStorage.removeItem("accountInfo");
		localStorage.removeItem("userProfile");
		return;
	}

	isRedirectingToLogin = true;
	localStorage.removeItem("token");
	localStorage.removeItem("accountInfo");
	localStorage.removeItem("userProfile");
	window.location.href = "/login";
	setTimeout(() => {
		isRedirectingToLogin = false;
	}, 2000);
}

async function safeParseBody(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type") || "";
	const text = await response.text();
	if (!text) return null;
	if (contentType.includes("application/json")) {
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	}
	return text;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export async function apiPost<T>(
	endpoint: string,
	body: object,
): Promise<ApiResponse<T>> {
	try {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (token) headers.Authorization = `Bearer ${token}`;

		const url = `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
		const serialized = JSON.stringify(body);
		const response = await fetch(url, {
			method: "POST",
			headers,
			body: serialized,
		});

		if (response.status === 401) {
			handle401();
			return { success: false, error: "Unauthorized" };
		}

		if (!response.ok) {
			const data = await safeParseBody(response);
			const detail =
				(typeof data === "object" &&
					data !== null &&
					((typeof (data as Record<string, unknown>).message === "string" &&
						(data as Record<string, unknown>).message) ||
						(Array.isArray((data as Record<string, unknown>).message) &&
							((data as Record<string, unknown>).message as string[]).join(
								", ",
							)) ||
						(typeof (data as Record<string, unknown>).error === "string" &&
							(data as Record<string, unknown>).error) ||
						(typeof (data as Record<string, unknown>).detail === "string" &&
							(data as Record<string, unknown>).detail) ||
						(typeof (data as Record<string, unknown>).title === "string" &&
							(data as Record<string, unknown>).title))) ||
				`HTTP ${response.status}`;
			return {
				success: false,
				error: detail as string,
			};
		}

		const data = await safeParseBody(response);
		return {
			success: true,
			data: data as T,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error",
		};
	}
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
	try {
		const token =
			typeof window !== "undefined" ? localStorage.getItem("token") : null;
		const headers: Record<string, string> = {};
		if (token) headers.Authorization = `Bearer ${token}`;

		const url = `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
		const response = await fetch(url, {
			method: "GET",
			headers,
		});

		if (response.status === 401) {
			handle401();
			return { success: false, error: "Unauthorized" };
		}

		const data = await safeParseBody(response);

		if (!response.ok) {
			let errorMessage = `HTTP ${response.status}`;
			if (typeof data === "object" && data !== null) {
				const d = data as Record<string, unknown>;
				errorMessage =
					(typeof d.message === "string" && d.message) ||
					(typeof d.error === "string" && d.error) ||
					errorMessage;
			}
			return {
				success: false,
				error: errorMessage,
			};
		}

		return {
			success: true,
			data: data as T,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error",
		};
	}
}

export interface ModuleStats {
	totalPublishedSurveyCount: number;
	totalRespondentCount: number;
	surveyBalance: number;
}

export interface RecruitmentStats {
	totalInvitationCount: number;
	totalCompletedCount: number;
	invitationBalance: number;
}

export interface UserStats {
	publishedCount: number;
	remainingQuota: number;
	totalQuota: number;
}

export function getUserStats() {
	return apiGet<UserStats>("/customer/auth/check-token");
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

export interface SurveyItem {
	id: string;
	title: string;
	description?: string;
	status: "PUBLISHED" | "CREATED" | "CLOSED";
	createdAt: string;
	updatedAt: string;
	respondentCount?: number;
}

export interface RecruitmentItem {
	id: string;
	title: string;
	description?: string;
	status: "PUBLISHED" | "DRAFT" | "CLOSED" | "COMPLETED";
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

export interface RecruitmentListItem {
	id: string;
	name: string;
	status: string;
	createdAt: string;
	publishedAt: string;
	closedAt: string;
	totalInvitationCount: number;
	completedInvitationCount: number;
}

export function getRecruitmentList(params?: {
	page?: number;
	size?: number;
	status?: string;
	name?: string;
}) {
	const query = new URLSearchParams(
		params as Record<string, string>,
	).toString();
	return apiGet<PaginatedResponse<RecruitmentListItem>>(
		`/customer/recruitments/${query ? `?${query}` : ""}`,
	);
}

export interface CreateRecruitmentPayload {
	name: string;
}

export interface CreateRecruitmentResponse {
	id: string;
}

export function createRecruitment(payload: CreateRecruitmentPayload) {
	return apiPost<CreateRecruitmentResponse>("/customer/recruitments", payload);
}

export interface CompletedInvitation {
	id: string;
	recruitmentName: string;
	firstName: string;
	lastName: string;
	completedAt: string;
	status: string;
}

export function getLatestCompletedInvitations(limit = 5) {
	return apiGet<CompletedInvitation[]>(
		`/customer/hiring-invitations/latest-completed?limit=${limit}`,
	);
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

export interface TalentListPage {
	content: HiringInvitationItem[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
	last: boolean;
	first: boolean;
	empty: boolean;
	numberOfElements: number;
}

export function getHiringInvitations(params?: {
	page?: number;
	size?: number;
	name?: string;
}) {
	const query = new URLSearchParams(
		params as Record<string, string>,
	).toString();
	return apiGet<TalentListPage>(
		`/customer/hiring-invitations/talents${query ? `?${query}` : ""}`,
	);
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
	recruitments: TalentRecruitment[];
}

export function getTalentDetail(id: string) {
	return apiGet<TalentDetail>(`/customer/hiring-invitations/talents/${id}`);
}

export interface TalentInvitationItem {
	id: number;
	recruitmentName: string;
	tests: string[];
	createdAt: string;
	status: string;
	rated: boolean;
	completedAt: string | null;
}

export interface TalentInvitationPage {
	content: TalentInvitationItem[];
	totalElements: number;
	totalPages: number;
	size: number;
	number: number;
}

export function getTalentInvitations(
	id: string,
	params?: { page?: number; size?: number },
) {
	const query = new URLSearchParams(
		params as Record<string, string>,
	).toString();
	return apiGet<TalentInvitationPage>(
		`/customer/hiring-invitations/talents/${id}/invitations${query ? `?${query}` : ""}`,
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
	value: string; // "YYYY-MM-DD" format
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

export const refreshToken = async (): Promise<{ token: string }> => {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;
	const url = `${API_BASE_URL.replace(/\/+$/, "")}/user/auth/refresh`;
	const response = await fetch(url, {
		method: "GET",
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});

	if (!response.ok) {
		if (response.status === 401) {
			handle401();
		}
		const data = await safeParseBody(response);
		let errorMessage = "Token refresh failed";
		if (typeof data === "object" && data !== null) {
			const d = data as Record<string, unknown>;
			errorMessage =
				(typeof d.message === "string" && d.message) ||
				(typeof d.error === "string" && d.error) ||
				errorMessage;
		}
		const error = new Error(errorMessage) as Error & { status: number };
		error.status = response.status;
		throw error;
	}

	return (await safeParseBody(response)) as { token: string };
};

export const NineMinuteTimer = () => {
	if (typeof window === "undefined") return;
	const intervalTime = 9 * 60 * 1000;
	const runFunction = async () => {
		const token = localStorage.getItem("token");
		if (!token || window.location.pathname.startsWith("/login")) return;
		try {
			const res = await refreshToken();
			localStorage.setItem("token", res.token);
			localStorage.setItem("lastExecution", Date.now().toString());
		} catch (e: unknown) {
			const err = e as { status?: number } | undefined;
			if (err?.status === 401) {
				localStorage.removeItem("token");
				localStorage.removeItem("accountInfo");
				localStorage.removeItem("userProfile");
			}
		}
	};
	runFunction();
	const interval = setInterval(runFunction, intervalTime);
	return () => clearInterval(interval);
};
