import axios, { type AxiosRequestConfig } from "axios";
import {
	ApiError,
	extractErrorText,
	normalizeErrorCode,
	type ProblemDetail,
	toApiError,
	toApiErrorFromBlob,
	toProblemDetail,
} from "@/lib/api-errors";
import type {
	InvitationStatus,
	RecommendAnswer,
	RecruitmentStatus,
	TestColor,
} from "@/lib/constants/roleAssessment";
import type { ApiPageParams } from "@/lib/pagination";
import type {
	CategoryWithCount,
	DateDTO,
	DesignDTO,
	DesignOwnerType,
	EmailDTO,
	IdDTO,
	Rating,
	RecruitmentBriefView,
	RecruitmentInfo,
	RecruitmentSettings,
	RestResponse,
	StrDTO,
	Talent,
	TalentEntity,
	ThemeType,
	UpdateDesign,
} from "@/lib/types/api";

// --- Axios instance ---

function getBaseUrl(): string {
	if (typeof window !== "undefined") {
		return "/api";
	}
	return process.env.NEXT_PUBLIC_API_URL || "";
}

// Staging апп-ын axios тохиргоотой ижил: timeout 30с, withCredentials (refresh cookie).
const api = axios.create({ withCredentials: true, timeout: 30000 });

// Staging: эдгээр endpoint-оос Authorization header-ийг хасна (📦 bundle)
const UNAUTHENTICATED_PATHS = [
	"/user/login",
	"/user/signup",
	"/user/verify",
	"/user/send-code",
];

function currentToken(): string | null {
	return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

api.interceptors.request.use((config) => {
	config.baseURL = getBaseUrl();
	const path = `/${(config.url ?? "").split("?")[0].replace(/^\/+/, "")}`;
	if (UNAUTHENTICATED_PATHS.includes(path)) {
		config.headers.delete("Authorization");
	} else {
		const token = currentToken();
		if (token) config.headers.set("Authorization", `Bearer ${token}`);
	}
	// Accept-Language: mn-MN-ийг proxy (app/api/[...path]/route.ts) тавина.
	return config;
});

// Staging-д 401 үед автоматаар refresh + давтах interceptor байхгүй (📦 bundle):
// хугацаа дууссан token-ийг lib/auth.ts-ийн scheduler ба layout-ын шалгалт барина.

// --- Auth endpoint-ууд (staging-ийн ажигласан path; swagger-т байхгүй — docs/swagger/mismatches.md E7, E8) ---

/** POST /user/refresh `{}` (refresh cookie + Authorization) → `{token}` */
export async function refreshTokenRequest(): Promise<string> {
	const response = await api.post<{ token?: string }>("/user/refresh", {});
	const token = response.data?.token;
	if (!token) throw new Error("Refresh response without token");
	return token;
}

/** POST /user/logout (body-гүй) */
export async function logoutRequest(): Promise<void> {
	await api.post("/user/logout");
}

// --- API helpers ---

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
		const response = await api.post<T>(endpoint, body);

		return { success: true, data: response.data };
	} catch (error) {
		return toFailedResponse<T>(error);
	}
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
	try {
		const response = await api.get<T>(endpoint);

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
		const response = await api.get<T>(endpoint, config);
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
		const response = await api.post<T>(endpoint, body);
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
			{ responseType: "blob" },
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

// --- Customer recruitments: удирдлага, setup, каталог, урилга, дизайн ---
// Path / method / body: staging bundle 📦 (setup: app/(editor)/role-assessment/[id]),
// schema: swagger (lib/types/api.ts). GET бүгд staging дээр ✅ (2026-10-06).
// POST-уудыг staging руу илгээгээгүй — хүсэлтийн хэлбэрийг mock adapter-аар
// шалгасан (docs/role-assessment-unverified.md U33–U40).

/** Сервер рүү явахаас өмнө илэрсэн буруу аргумент (хүсэлт илгээгдээгүй). */
function invalidArgument(message: string): ApiError {
	return new ApiError(message, { code: "invalid_argument" });
}

/** swagger StrDTO.str minLength 1 — хоосон утгыг серверт илгээхгүй. */
function requireText(value: string, label: string): string {
	const text = value.trim();
	if (!text) throw invalidArgument(`${label} хоосон байна`);
	return text;
}

/** swagger RestResponseVoid: 200 дотор `success: false` ирвэл алдаа гэж үзнэ. */
function assertRestSuccess(data: unknown): void {
	const r = data as RestResponse<unknown> | null;
	if (typeof r === "object" && r !== null && r.success === false) {
		throw new ApiError(r.message || "Request failed", { status: r.status });
	}
}

const API_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * swagger `format: date` → `YYYY-MM-DD`. `Date`-ийг локал цагийн бүсээр
 * форматлана (staging: `dayjs(...).format("YYYY-MM-DD")` 📦).
 */
export function toApiDate(value: string | Date): string {
	if (value instanceof Date) {
		if (Number.isNaN(value.getTime())) throw invalidArgument("Огноо буруу");
		const m = String(value.getMonth() + 1).padStart(2, "0");
		const d = String(value.getDate()).padStart(2, "0");
		return `${value.getFullYear()}-${m}-${d}`;
	}
	if (!API_DATE.test(value)) throw invalidArgument("Огноо YYYY-MM-DD биш");
	return value;
}

// my-recruitments-controller

/** GET /customer/recruitments/status/{id} — swagger-т бий, staging апп дууддаггүй; ✅ GET */
export function fetchRecruitmentBrief(id: string) {
	return apiGetOrThrow<RecruitmentBriefView>(
		`/customer/recruitments/status/${encodeURIComponent(id)}`,
	);
}

/** POST /customer/recruitments/{id}/rename `{str: name}` 📦 → 200 body-гүй */
export async function renameRecruitment(id: string, name: string) {
	const body: StrDTO = { str: requireText(name, "Нэр") };
	await apiPostOrThrow<unknown>(
		`/customer/recruitments/${encodeURIComponent(id)}/rename`,
		body,
	);
}

/** POST /customer/recruitments/close `{str: id}` 📦 → 200 body-гүй */
export async function closeRecruitment(id: string) {
	const body: StrDTO = { str: requireText(id, "Үнэлгээний id") };
	await apiPostOrThrow<unknown>("/customer/recruitments/close", body);
}

/** POST /customer/recruitments/delete `{str: id}` 📦 → 200 body-гүй */
export async function deleteRecruitment(id: string) {
	const body: StrDTO = { str: requireText(id, "Үнэлгээний id") };
	await apiPostOrThrow<unknown>("/customer/recruitments/delete", body);
}

// recruitment-set-up-controller (setup wizard: мэдээлэл → тест → асуулт → нийтлэх)

/** GET /customer/recruitment-setup/settings ✅ — сонгох тест/асуултын дээд хязгаар */
export function fetchRecruitmentSettings() {
	return apiGetOrThrow<RecruitmentSettings>(
		"/customer/recruitment-setup/settings",
	);
}

/** GET /customer/recruitment-setup/{id}/information ✅ */
export function fetchRecruitmentInformation(id: string) {
	return apiGetOrThrow<RecruitmentInfo>(
		`/customer/recruitment-setup/${encodeURIComponent(id)}/information`,
	);
}

export interface UpdateRecruitmentInfoPayload {
	jobTitle: string;
	jobDescription: string;
	companyName: string;
	companyDescription?: string;
}

const RECRUITMENT_INFO_MAX = 100;

/**
 * POST /customer/recruitment-setup/{id}/update-information — body RecruitmentInfo 📦.
 * swagger: jobTitle, companyName ≤100; jobDescription minLength 1. Staging "Үргэлжлүүлэх"
 * товч гурвуулаа хоосон биш үед л идэвхтэй.
 */
export async function updateRecruitmentInformation(
	id: string,
	payload: UpdateRecruitmentInfoPayload,
) {
	const jobTitle = requireText(payload.jobTitle, "Ажлын байрны нэр");
	const jobDescription = requireText(
		payload.jobDescription,
		"Ажлын тодорхойлолт",
	);
	const companyName = requireText(payload.companyName, "Компанийн нэр");
	if (jobTitle.length > RECRUITMENT_INFO_MAX) {
		throw invalidArgument("Ажлын байрны нэр 100 тэмдэгтээс урт");
	}
	if (companyName.length > RECRUITMENT_INFO_MAX) {
		throw invalidArgument("Компанийн нэр 100 тэмдэгтээс урт");
	}
	const body: RecruitmentInfo = {
		jobTitle,
		jobDescription,
		companyName,
		companyDescription: payload.companyDescription ?? "",
	};
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`/customer/recruitment-setup/${encodeURIComponent(id)}/update-information`,
			body,
		),
	);
}

/**
 * GET /customer/recruitment-setup/{id}/tests ✅ — сонгосон тестийн catalog `id`-ууд
 * (= RecruitmentTest.id, `testId` БИШ — detail-тэй тулгаж ✅).
 */
export function fetchRecruitmentTestIds(id: string) {
	return apiGetOrThrow<string[]>(
		`/customer/recruitment-setup/${encodeURIComponent(id)}/tests`,
	);
}

/** POST /customer/recruitment-setup/{id}/set-tests — body `string[]` (catalog id) 📦 */
export async function setRecruitmentTests(id: string, testIds: string[]) {
	const body = [...new Set(testIds.map((t) => t.trim()).filter(Boolean))];
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`/customer/recruitment-setup/${encodeURIComponent(id)}/set-tests`,
			body,
		),
	);
}

/** GET /customer/recruitment-setup/{id}/questions ✅ — сонгосон асуултын `id` (int64) */
export function fetchRecruitmentQuestionIds(id: string) {
	return apiGetOrThrow<number[]>(
		`/customer/recruitment-setup/${encodeURIComponent(id)}/questions`,
	);
}

/** POST /customer/recruitment-setup/{id}/set-questions — body `int64[]` 📦 */
export async function setRecruitmentQuestions(
	id: string,
	questionIds: number[],
) {
	if (!questionIds.every((q) => Number.isSafeInteger(q) && q > 0)) {
		throw invalidArgument("Асуултын id буруу");
	}
	const body = [...new Set(questionIds)];
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`/customer/recruitment-setup/${encodeURIComponent(id)}/set-questions`,
			body,
		),
	);
}

/** POST /customer/recruitment-setup/publish `{str: id}` 📦 */
export async function publishRecruitment(id: string) {
	const body: StrDTO = { str: requireText(id, "Үнэлгээний id") };
	assertRestSuccess(
		await apiPostOrThrow<unknown>("/customer/recruitment-setup/publish", body),
	);
}

// my-hiring-test-controller (каталог)

/** GET /customer/role-assessments/categories ✅ — `id` нь шүүлтүүрийн түлхүүр */
export function fetchTestCategories() {
	return apiGetOrThrow<CategoryWithCount[]>(
		"/customer/role-assessments/categories",
	);
}

/**
 * GET /customer/role-assessments/tests?category= ✅ — `category` нь CategoryWithCount.id,
 * хоосон бол бүгд. Staging хоосон `category=`-ийг ч илгээдэг 📦.
 * Хариунд swagger-ийн `content`, `roleLevels` ирдэггүй ✅ (дэлгэрэнгүйг #10-аас).
 */
export function fetchCatalogTests(category = "") {
	return apiGetOrThrow<RecruitmentTest[]>(
		`/customer/role-assessments/tests?category=${encodeURIComponent(category)}`,
	);
}

/** GET /customer/role-assessments/question-categories ✅ */
export function fetchQuestionCategories() {
	return apiGetOrThrow<CategoryWithCount[]>(
		"/customer/role-assessments/question-categories",
	);
}

/** GET /customer/role-assessments/questions?category= ✅ — хариунд `category` ирдэггүй */
export function fetchCatalogQuestions(category = "") {
	return apiGetOrThrow<RecruitmentCustomQuestion[]>(
		`/customer/role-assessments/questions?category=${encodeURIComponent(category)}`,
	);
}

/**
 * POST /customer/role-assessments/recommend — body: асуулт бүрийн хариулт,
 * RECOMMEND_QUESTIONS-ийн дарааллаар (`string[]`) 📦. swagger: → HiringTestPublicDTO[].
 */
export async function recommendTests(
	answers: RecommendAnswer[],
): Promise<RecruitmentTest[]> {
	const data = await apiPostOrThrow<unknown>(
		"/customer/role-assessments/recommend",
		answers,
	);
	if (Array.isArray(data)) return data as RecruitmentTest[];
	// bundle-derived, unverified: staging апп `{tests}` / `{content}` хэлбэрийг ч хүлээн авдаг
	const d = data as { tests?: unknown; content?: unknown } | null;
	if (Array.isArray(d?.tests)) return d.tests as RecruitmentTest[];
	if (Array.isArray(d?.content)) return d.content as RecruitmentTest[];
	return [];
}

// my-talent-controller (урилга)

export interface InviteTalentPayload {
	recruitmentId: string;
	email: string;
	firstName: string;
	lastName: string;
	/** Хоосон бол `null` илгээнэ (staging 📦) */
	phoneNumber?: string | null;
	/** swagger date; staging анхдагч +7 хоног (UI талд) */
	dueDate: string | Date;
}

/**
 * POST /customer/hiring-invitations/invite — body Talent 📦 → 200 string.
 * Нэр/имэйлийн дүрмийг (2–20 үсэг, 5–50) сервер шалгаж, талбар бүрийн Монгол
 * мессежийг ProblemDetail.errors-оор буцаана (getFieldErrors).
 */
export async function inviteTalent(payload: InviteTalentPayload) {
	const phone = payload.phoneNumber?.trim() ?? "";
	const body: Talent = {
		recruitmentId: requireText(payload.recruitmentId, "Үнэлгээний id"),
		email: payload.email.trim(),
		firstName: payload.firstName.trim(),
		lastName: payload.lastName.trim(),
		phoneNumber: phone === "" ? null : phone,
		dueDate: toApiDate(payload.dueDate),
	};
	return apiPostOrThrow<string>("/customer/hiring-invitations/invite", body);
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /customer/hiring-invitations/search-by-email `{value}` 📦 →
 * RestResponseTalentEntity. Өмнө уригдсан талентыг олж формыг бөглөхөд.
 * Олдоогүй (404/204), нэр/утасгүй, эсвэл имэйл буруу хэлбэртэй бол `null` (staging 📦).
 */
export async function searchTalentByEmail(
	email: string,
): Promise<TalentEntity | null> {
	const value = email.trim();
	if (!EMAIL_SHAPE.test(value)) return null;
	const body: EmailDTO = { value };
	let data: unknown;
	try {
		data = (
			await api.post<unknown>(
				"/customer/hiring-invitations/search-by-email",
				body,
			)
		).data;
	} catch (error) {
		// 204 нь алдаа биш — хоосон body доор `null` болно
		if (axios.isAxiosError(error) && error.response?.status === 404)
			return null;
		throw toApiError(error);
	}
	if (data === null || typeof data !== "object") return null;
	const entity = (
		"data" in data ? (data as RestResponse<TalentEntity>).data : data
	) as (TalentEntity & { mobileNo?: string | null }) | null | undefined;
	if (!entity || typeof entity !== "object") return null;
	const filled = (v: unknown) => typeof v === "string" && v.trim() !== "";
	const hasDetails =
		filled(entity.firstName) ||
		filled(entity.lastName) ||
		filled(entity.phoneNumber) ||
		filled(entity.mobileNo);
	return hasDetails ? entity : null;
}

/** POST /customer/hiring-invitations/{invitationId}/extend `{value: date}` 📦 → Talent */
export function extendInvitation(invitationId: string, dueDate: string | Date) {
	const body: DateDTO = { value: toApiDate(dueDate) };
	return apiPostOrThrow<Talent>(
		`/customer/hiring-invitations/${encodeURIComponent(invitationId)}/extend`,
		body,
	);
}

/** POST /customer/hiring-invitations/{invitationId}/rate `{points}` 📦 — swagger int 0..5 */
export async function rateInvitation(invitationId: string, points: number) {
	if (!Number.isInteger(points) || points < 0 || points > 5) {
		throw invalidArgument("Үнэлгээ 0–5 бүхэл тоо байх ёстой");
	}
	const body: Rating = { points };
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`/customer/hiring-invitations/${encodeURIComponent(invitationId)}/rate`,
			body,
		),
	);
}

/** POST /customer/hiring-invitations/{invitationId}/notes/add `{str}` 📦 → InvitationNoteView */
export async function addInvitationNote(invitationId: string, note: string) {
	const body: StrDTO = { str: requireText(note, "Тэмдэглэл") };
	return apiPostOrThrow<InvitationNote>(
		`/customer/hiring-invitations/${encodeURIComponent(invitationId)}/notes/add`,
		body,
	);
}

/** POST /customer/hiring-invitations/talents/bookmark `{id: int64}` 📦 — toggle, body-гүй хариу */
export async function toggleTalentBookmark(talentId: number | string) {
	const id =
		typeof talentId === "number"
			? talentId
			: Number.parseInt(talentId.trim(), 10);
	if (!Number.isSafeInteger(id)) {
		throw invalidArgument("Талентын дугаар буруу байна");
	}
	const body: IdDTO = { id };
	await apiPostOrThrow<unknown>(
		"/customer/hiring-invitations/talents/bookmark",
		body,
	);
}

// design-controller — үнэлгээнд ownerType = "RECRUITMENT" (staging 📦, GET ✅)

function designPath(ownerType: DesignOwnerType, ownerId: string) {
	return `/customer/designs/${ownerType}/${encodeURIComponent(ownerId)}`;
}

/** GET /customer/designs/themes ✅ */
export function fetchDesignThemes() {
	return apiGetOrThrow<ThemeType[]>("/customer/designs/themes");
}

/** GET /customer/designs/{ownerType}/{ownerId} ✅ */
export function fetchDesign(ownerType: DesignOwnerType, ownerId: string) {
	return apiGetOrThrow<DesignDTO>(designPath(ownerType, ownerId));
}

/**
 * POST /customer/designs/{ownerType}/{ownerId}/update — body UpdateDesign (swagger).
 * Анхаар: хариунд байрлал `imagePosition`, body-д `logoPosition`.
 * Staging апп үнэлгээнд энэ endpoint-ийг дууддаггүй (зөвхөн survey) — U38.
 */
export function updateDesign(
	ownerType: DesignOwnerType,
	ownerId: string,
	body: UpdateDesign,
) {
	return apiPostOrThrow<DesignDTO>(
		`${designPath(ownerType, ownerId)}/update`,
		body,
	);
}

/**
 * POST …/upload-logo — multipart, талбар `logo` 📦 → 200 string.
 * Content-Type (boundary-тай)-г browser тавина; proxy binary-г дамжуулна.
 */
export async function uploadDesignLogo(
	ownerType: DesignOwnerType,
	ownerId: string,
	logo: Blob,
) {
	if (logo.size === 0) throw invalidArgument("Лого файл хоосон байна");
	const form = new FormData();
	form.append("logo", logo);
	return apiPostOrThrow<string>(
		`${designPath(ownerType, ownerId)}/upload-logo`,
		form,
	);
}

/** POST …/remove-logo `{id}` — `id` нь DesignDTO.id (staging: `design.id` 📦) */
export async function removeDesignLogo(
	ownerType: DesignOwnerType,
	ownerId: string,
	designId: number,
) {
	if (!Number.isSafeInteger(designId) || designId <= 0) {
		throw invalidArgument("Дизайны id буруу");
	}
	const body: IdDTO = { id: designId };
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`${designPath(ownerType, ownerId)}/remove-logo`,
			body,
		),
	);
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

/** swagger: `limit` 5..10 (анхдагч 5). Хүрээнээс гарсан утгыг 400 болохоос өмнө тааруулна. */
export function getLatestCompletedInvitations(limit = 5) {
	const safeLimit = Math.min(10, Math.max(5, Math.trunc(limit) || 5));
	return apiGet<CompletedInvitation[]>(
		`/customer/hiring-invitations/latest-completed?limit=${safeLimit}`,
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
	/** Зөвхөн тэмдэглэсэн талентууд. Staging зөвхөн `true` үед илгээдэг 📦, шүүлт ✅ */
	marked?: boolean;
}) {
	return apiGet<TalentListPage>(
		`/customer/hiring-invitations/talents${buildQuery({
			page: params?.page,
			size: params?.size,
			q: params?.q?.trim(),
			marked: params?.marked === true ? true : undefined,
		})}`,
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
