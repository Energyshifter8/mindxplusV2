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

function getBaseUrl(): string {
	if (typeof window !== "undefined") {
		return "/api";
	}
	return process.env.NEXT_PUBLIC_API_URL || "";
}

export const httpClient = axios.create({
	withCredentials: true,
	timeout: 30000,
});

const UNAUTHENTICATED_PATHS = [
	"/user/login",
	"/user/signup",
	"/user/verify",
	"/user/send-code",
];

function currentToken(): string | null {
	return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

const raDryRunAdapter: AxiosAdapter = async (config) => {
	const method = (config.method ?? "get").toUpperCase();
	const path = requestPathOf(config.url);
	let body: unknown = config.data;
	if (typeof body === "string") {
		try {
			body = JSON.parse(body);
		} catch {}
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
	return config;
});

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	status?: number;
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

export interface SpringPage<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
	first: boolean;
	last: boolean;
	empty: boolean;
	numberOfElements: number;
}
