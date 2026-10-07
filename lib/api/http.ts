import axios, {
	type AxiosAdapter,
	AxiosError,
	AxiosHeaders,
	type AxiosRequestConfig,
} from "axios";
import {
	buildDryRunResponse,
	formatDryRunLog,
	requestPathOf,
	shouldDryRun,
} from "@/lib/api/role-assessment/dry-run";
import {
	extractErrorText,
	normalizeErrorCode,
	type ProblemDetail,
	toApiError,
	toProblemDetail,
} from "@/lib/api-errors";

// --- Axios instance ---

function getBaseUrl(): string {
	if (typeof window !== "undefined") {
		return "/api";
	}
	return process.env.NEXT_PUBLIC_API_URL || "";
}

// Staging апп-ын axios тохиргоотой ижил: timeout 30с, withCredentials (refresh cookie).
export const httpClient = axios.create({
	withCredentials: true,
	timeout: 30000,
});

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

/**
 * Талентийн үнэлгээний бичих хүсэлтийг (docs/role-assessment/DECISIONS.md D4)
 * сүлжээнд гаргахгүй, openapi-д нийцсэн stub буцаана.
 */
const raDryRunAdapter: AxiosAdapter = async (config) => {
	const method = (config.method ?? "get").toUpperCase();
	const path = requestPathOf(config.url);
	let body: unknown = config.data;
	if (typeof body === "string") {
		try {
			body = JSON.parse(body);
		} catch {
			// JSON биш бол тэр чигээр нь
		}
	}
	// biome-ignore lint/suspicious/noConsole: DRY-RUN log нь шаардлага (docs/role-assessment/DECISIONS.md D4)
	console.info(formatDryRunLog(method, path, body));
	const stub = buildDryRunResponse(method, path, body);
	const response = {
		data: stub.data,
		status: stub.status,
		statusText: stub.status < 400 ? "OK" : "DRY-RUN",
		headers: new AxiosHeaders({ "x-ra-dry-run": "1" }),
		config,
		request: null,
	};
	if (stub.status >= 400) {
		throw new AxiosError(
			"DRY-RUN",
			AxiosError.ERR_BAD_REQUEST,
			config,
			null,
			response,
		);
	}
	return response;
};

httpClient.interceptors.request.use((config) => {
	config.baseURL = getBaseUrl();
	const path = requestPathOf(config.url);
	if (UNAUTHENTICATED_PATHS.includes(path)) {
		config.headers.delete("Authorization");
	} else {
		const token = currentToken();
		if (token) config.headers.set("Authorization", `Bearer ${token}`);
	}
	if (shouldDryRun((config.method ?? "get").toUpperCase(), path)) {
		config.adapter = raDryRunAdapter;
	}
	// Accept-Language: mn-MN-ийг proxy (app/api/[...path]/route.ts) тавина.
	return config;
});

// Staging-д 401 үед автоматаар refresh + давтах interceptor байхгүй (📦 bundle):
// хугацаа дууссан token-ийг lib/auth.ts-ийн scheduler ба layout-ын шалгалт барина.

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
		const response = await httpClient.post<T>(endpoint, body);

		return { success: true, data: response.data };
	} catch (error) {
		return toFailedResponse<T>(error);
	}
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
	try {
		const response = await httpClient.get<T>(endpoint);

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
		const response = await httpClient.get<T>(endpoint, config);
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
		const response = await httpClient.post<T>(endpoint, body);
		return response.data;
	} catch (error) {
		throw toApiError(error);
	}
}

/** undefined/null/хоосон утгыг алгасаж query string үүсгэнэ ("status=undefined" гарахгүй). */
export function buildQuery(
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
