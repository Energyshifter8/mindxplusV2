import axios, { type AxiosRequestConfig } from "axios";
import {
	extractErrorText,
	normalizeErrorCode,
	type ProblemDetail,
	toApiError,
	toApiErrorFromBlob,
	toProblemDetail,
} from "@/lib/api-errors";
import type {
	InvitationStatus,
	RecruitmentStatus,
	TestColor,
} from "@/lib/constants/roleAssessment";
import type { ApiPageParams } from "@/lib/pagination";

// --- Axios instance ---

function getBaseUrl(): string {
	if (typeof window !== "undefined") {
		return "/api";
	}
	return process.env.NEXT_PUBLIC_API_URL || "";
}

const api = axios.create({ withCredentials: true });

api.interceptors.request.use((config) => {
	config.baseURL = getBaseUrl();
	return config;
});

// --- Auth refresh machinery ---

let refreshPromise: Promise<string> | null = null;

function clearAuthStorage() {
	localStorage.removeItem("token");
	localStorage.removeItem("accountInfo");
	localStorage.removeItem("userProfile");
}

function redirectToLogin(_reason: string) {
	if (typeof window === "undefined") return;
	if (window.location.pathname.startsWith("/login")) return;
	clearAuthStorage();
	setTimeout(() => {
		window.location.href = "/login";
	}, 3000);
}

async function doRefreshToken(): Promise<string> {
	const token = localStorage.getItem("token");
	if (!token) throw new Error("No token to refresh");
	const response = await api.post("/user/refresh", null, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data.token;
}

async function attemptRefreshWithRetry(): Promise<string> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		try {
			const newToken = await doRefreshToken();
			localStorage.setItem("token", newToken);
			return newToken;
		} catch {
			await new Promise((r) => setTimeout(r, 500));
			try {
				const newToken = await doRefreshToken();
				localStorage.setItem("token", newToken);
				return newToken;
			} catch (retryErr) {
				const msg =
					retryErr instanceof Error ? retryErr.message : String(retryErr);
				redirectToLogin(`Token refresh failed after retry: ${msg}`);
				throw retryErr;
			}
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

export async function preRefreshToken(): Promise<void> {
	try {
		await attemptRefreshWithRetry();
	} catch {
		// attemptRefreshWithRetry already handles redirectToLogin
	}
}

// Axios interceptor: auto-refresh on 401 and retry once
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!window.location.pathname.startsWith("/login")
		) {
			originalRequest._retry = true;
			try {
				const newToken = await attemptRefreshWithRetry();
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return api(originalRequest);
			} catch {
				redirectToLogin("Token refresh failed in interceptor");
			}
		}
		return Promise.reject(error);
	},
);

// --- API helpers ---

function authHeaders(token: string | null): Record<string, string> {
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function currentToken(): string | null {
	return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	/** HTTP status (алдааны үед). Сүлжээний алдаанд undefined. */
	status?: number;
	/** ProblemDetail.code, normalizeErrorCode-оор жижиг үсэг болгосон. */
	code?: string;
	problem?: ProblemDetail;
}

function toFailedResponse<T>(error: unknown): ApiResponse<T> {
	if (axios.isAxiosError(error) && error.response) {
		const problem = toProblemDetail(error.response.data);
		return {
			success: false,
			error: extractErrorText(error.response.data),
			status: error.response.status,
			code: normalizeErrorCode(problem?.code),
			problem,
		};
	}
	return {
		success: false,
		error: error instanceof Error ? error.message : "Network error",
	};
}

export async function apiPost<T>(
	endpoint: string,
	body: object,
): Promise<ApiResponse<T>> {
	try {
		const response = await api.post<T>(endpoint, body, {
			headers: authHeaders(currentToken()),
		});

		return { success: true, data: response.data };
	} catch (error) {
		return toFailedResponse<T>(error);
	}
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
	try {
		const response = await api.get<T>(endpoint, {
			headers: authHeaders(currentToken()),
		});

		return { success: true, data: response.data };
	} catch (error) {
		return toFailedResponse<T>(error);
	}
}

// React Query hook-уудад зориулсан хувилбар: алдаа гарвал ApiError throw хийнэ
// (isError ажиллана). apiGet/apiPost-ийн {success,data,error} зан төлөв өөрчлөгдөөгүй.

export async function apiGetOrThrow<T>(
	endpoint: string,
	config?: Omit<AxiosRequestConfig, "headers">,
): Promise<T> {
	try {
		const response = await api.get<T>(endpoint, {
			...config,
			headers: authHeaders(currentToken()),
		});
		return response.data;
	} catch (error) {
		throw toApiError(error);
	}
}

export async function apiPostOrThrow<T>(
	endpoint: string,
	body: unknown,
): Promise<T> {
	try {
		const response = await api.post<T>(endpoint, body, {
			headers: authHeaders(currentToken()),
		});
		return response.data;
	} catch (error) {
		throw toApiError(error);
	}
}

/** undefined/null/хоосон утгыг алгасаж query string үүсгэнэ ("status=undefined" гарахгүй). */
function buildQuery(
	params: Record<string, string | number | boolean | null | undefined>,
): string {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") continue;
		query.set(key, String(value));
	}
	const qs = query.toString();
	return qs ? `?${qs}` : "";
}

// --- Spring Data Page (staging ✅) ---

export interface SpringPage<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	/** Одоогийн хуудас, 0-ээс эхэлнэ. UI-д lib/pagination-оор хөрвүүлнэ. */
	number: number;
	size: number;
	first: boolean;
	last: boolean;
	empty: boolean;
	numberOfElements: number;
}

export const NineMinuteTimer = () => {
	if (typeof window === "undefined") return;
	const intervalTime = 9 * 60 * 1000;
	const initialDelay = 3000;
	const runFunction = async () => {
		const token = localStorage.getItem("token");
		if (!token || window.location.pathname.startsWith("/login")) return;
		try {
			await attemptRefreshWithRetry();
			localStorage.setItem("lastExecution", Date.now().toString());
		} catch {
			// attemptRefreshWithRetry already called redirectToLogin if needed
		}
	};
	let intervalId: ReturnType<typeof setInterval> | null = null;
	const initialTimeout = setTimeout(() => {
		runFunction();
		intervalId = setInterval(runFunction, intervalTime);
	}, initialDelay);
	return () => {
		clearTimeout(initialTimeout);
		if (intervalId) clearInterval(intervalId);
	};
};

// --- Types ---

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

function recruitmentListPath(params: RecruitmentListParams): string {
	// Төгсгөлийн "/" заавал: "/customer/recruitments" нь 404 буцаадаг (staging ✅)
	return `/customer/recruitments/${buildQuery({ ...params })}`;
}

export function getRecruitmentList(params: RecruitmentListParams) {
	return apiGet<SpringPage<RecruitmentListItem>>(recruitmentListPath(params));
}

// --- Role assessment: React Query-д зориулсан, throw хийдэг (ApiError) ---

export function fetchRecruitmentStats() {
	return apiGetOrThrow<RecruitmentStats>("/customer/recruitments/statistics");
}

export function fetchRecruitmentList(params: RecruitmentListParams) {
	return apiGetOrThrow<SpringPage<RecruitmentListItem>>(
		recruitmentListPath(params),
	);
}

/** Сонгосон тест (catalog). `id` нь catalog id, `testId` нь дотоод тест (тайлан §4 ✅). */
export interface RecruitmentTest {
	id: string;
	testId: string;
	name: string;
	description: string;
	/** Категорийн label (id биш), жишээ "Зөөлөн ур чадвар" */
	category: string;
	/** Staging дээр ✅ ажиглагдсан, swagger HiringTestPublicDTO-д байхгүй */
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
	publishedAt?: string | null;
	closedAt?: string | null;
	createdBy: UserRef;
	publishedBy?: UserRef | null;
	closedBy?: UserRef | null;
	count: { total: number; completed: number };
	tests: RecruitmentTest[];
	customQuestions: RecruitmentCustomQuestion[];
}

export function fetchRecruitmentDetail(id: string) {
	return apiGetOrThrow<RecruitmentDetail>(
		`/customer/recruitments/${encodeURIComponent(id)}`,
	);
}

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

export function fetchRecruitmentInvitations(
	recruitmentId: string,
	params: ApiPageParams,
) {
	return apiGetOrThrow<SpringPage<RecruitmentInvitation>>(
		`/customer/hiring-invitations/list/${encodeURIComponent(recruitmentId)}${buildQuery({ ...params })}`,
	);
}

/** GET /customer/role-assessments/tests/{catalogTestId} (#10) — тайлан §3.2 ✅ */
export interface RoleAssessmentTestDetail {
	id: string;
	name: string;
	description: string;
	/** Staging дээр ✅ ажиглагдсан, swagger HiringTestPublicDTO-д байхгүй */
	pageSize?: number;
	/** Серверээс ирэх HTML. Зөвхөн sandbox iframe-д харуулна. */
	content: string;
}

export function fetchRoleAssessmentTest(catalogTestId: string) {
	return apiGetOrThrow<RoleAssessmentTestDetail>(
		`/customer/role-assessments/tests/${encodeURIComponent(catalogTestId)}`,
	);
}

// --- Талентын үр дүн (ФАЗ 4) — бүтэц staging дээр GET-ээр ✅ ---

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
	/** Staging-ийн код уншдаг ч ажиглалтад ирээгүй */
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

export function fetchInvitationResult(
	recruitmentId: string,
	invitationId: string,
) {
	return apiGetOrThrow<InvitationResult>(
		`/customer/hiring-invitations/${encodeURIComponent(recruitmentId)}/${encodeURIComponent(invitationId)}`,
	);
}

/** GET /customer/hiring-invitations/names/{recruitmentId} (#16) — Page биш массив */
export interface InvitationName {
	id: string;
	firstName: string;
	lastName: string;
	status: InvitationStatus;
}

export function fetchInvitationNames(recruitmentId: string) {
	return apiGetOrThrow<InvitationName[]>(
		`/customer/hiring-invitations/names/${encodeURIComponent(recruitmentId)}`,
	);
}

/** GET /customer/hiring-invitations/{invitationId}/rate (#17) */
export interface InvitationRate {
	rated: boolean;
	myPoints: number | null;
	avgPoints: number | null;
	count: number;
}

export function fetchInvitationRate(invitationId: string) {
	return apiGetOrThrow<InvitationRate>(
		`/customer/hiring-invitations/${encodeURIComponent(invitationId)}/rate`,
	);
}

/** GET /customer/hiring-invitations/{invitationId}/notes (#18) */
export interface InvitationNote {
	id: number;
	note: string;
	createdAt: string;
	createdBy: UserRef;
}

export function fetchInvitationNotes(invitationId: string) {
	return apiGetOrThrow<InvitationNote[]>(
		`/customer/hiring-invitations/${encodeURIComponent(invitationId)}/notes`,
	);
}

function testReportPath(invitationId: string, answerId: string) {
	return `/customer/hiring/test-result/report/${encodeURIComponent(invitationId)}/${encodeURIComponent(answerId)}`;
}

/**
 * GET …/report/{invitationId}/{answerId} (#19) — `text/html` бүтэн баримт ✅.
 * Хувийн мэдээлэл агуулна: зөвхөн sandbox iframe-д харуулна, log-д гаргахгүй.
 */
export async function fetchTestReportHtml(
	invitationId: string,
	answerId: string,
): Promise<string> {
	const data = await apiGetOrThrow<unknown>(
		testReportPath(invitationId, answerId),
		{ responseType: "text" },
	);
	if (typeof data === "string") return data;
	// bundle-derived, unverified: staging апп {html|content|data} хэлбэрийг ч хүлээн авдаг
	const d = data as {
		html?: unknown;
		content?: unknown;
		data?: unknown;
	} | null;
	const html = d?.html ?? d?.content ?? d?.data;
	return typeof html === "string" ? html : "";
}

/**
 * GET …/report/{invitationId}/{answerId}/download (#20) — `application/pdf`,
 * `Content-Disposition: attachment; filename="…pdf"` ✅ (proxy дамжуулна).
 */
export async function downloadTestReport(
	invitationId: string,
	answerId: string,
): Promise<{ blob: Blob; contentDisposition: string | null }> {
	try {
		const response = await api.get<Blob>(
			`${testReportPath(invitationId, answerId)}/download`,
			{ responseType: "blob", headers: authHeaders(currentToken()) },
		);
		const header = response.headers["content-disposition"];
		return {
			blob: response.data,
			contentDisposition: typeof header === "string" ? header : null,
		};
	} catch (error) {
		throw await toApiErrorFromBlob(error);
	}
}

export interface CreateRecruitmentPayload {
	name: string;
}

export interface CreateRecruitmentResponse {
	id: string;
}

// swagger: POST /customer/recruitments/new — body StrDTO {str*} → 200 string (id).
// Бодит дуудлагаар шалгаагүй (серверт CREATED ноорог үүснэ); {id} хэлбэрийг ч зохицуулна.
export async function createRecruitment(
	payload: CreateRecruitmentPayload,
): Promise<ApiResponse<CreateRecruitmentResponse>> {
	const res = await apiPost<unknown>("/customer/recruitments/new", {
		str: payload.name,
	});
	if (!res.success) {
		return { ...res, data: undefined };
	}
	const id =
		typeof res.data === "string"
			? res.data
			: typeof res.data === "object" &&
					res.data !== null &&
					typeof (res.data as { id?: unknown }).id === "string"
				? (res.data as { id: string }).id
				: undefined;
	if (!id) {
		// Сервер амжилттай гэсэн ч id уншигдсангүй — ноорог үүссэн байж болно
		return {
			success: false,
			error: "Unexpected create response",
			code: "unexpected_response",
		};
	}
	return { success: true, data: { id } };
}

/** GET /customer/hiring-invitations/latest-completed (#24) — staging ✅ ажигласан. */
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

export type TalentListPage = SpringPage<HiringInvitationItem>;

export function getHiringInvitations(params?: {
	page?: number;
	size?: number;
	/** Хайлт. `name` параметрийг API тоодоггүй, `q` ажилладаг (staging ✅). */
	q?: string;
}) {
	return apiGet<TalentListPage>(
		`/customer/hiring-invitations/talents${buildQuery({ ...params })}`,
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

/** swagger: User / UserNameView — id нь string */
export interface UserRef {
	id: string;
	firstName: string;
	lastName: string;
}

/**
 * GET /customer/hiring-invitations/talents/{talentId}/invitations (#23).
 * Тайлан §3.2 ба staging-ийн ажиглалт ✅: `completedAt`, имэйл/нэр талбар БАЙХГҮЙ.
 */
export interface TalentInvitationItem {
	id: string;
	createdAt: string;
	/** swagger: InvitationDTO.completedAt — хоосон үед хариунд огт ирэхгүй (✅) */
	completedAt?: string | null;
	status: InvitationStatus;
	rated: boolean;
	recruitmentId: string;
	recruitmentName: string;
	invitedBy: UserRef;
	/** Тестийн нэрс */
	tests: string[];
}

export type TalentInvitationPage = SpringPage<TalentInvitationItem>;

export function getTalentInvitations(
	id: string,
	params?: { page?: number; size?: number },
) {
	return apiGet<TalentInvitationPage>(
		`/customer/hiring-invitations/talents/${id}/invitations${buildQuery({ ...params })}`,
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
