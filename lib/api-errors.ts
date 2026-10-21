import axios from "axios";

export interface ProblemDetail {
	type?: string;
	title?: string;
	status?: number;
	detail?: string;
	instance?: string;
	code?: string;
	errors?: ProblemFieldError[];
}

export interface ProblemFieldError {
	field: string;
	value: string;
}

export class ApiError extends Error {
	readonly status: number | undefined;
	readonly code: string | undefined;
	readonly problem: ProblemDetail | undefined;

	constructor(
		message: string,
		options: { status?: number; code?: string; problem?: ProblemDetail } = {},
	) {
		super(message);
		this.name = "ApiError";
		this.status = options.status;
		this.code = options.code;
		this.problem = options.problem;
	}
}

export function normalizeErrorCode(code: unknown): string | undefined {
	if (typeof code !== "string") return undefined;
	const normalized = code
		.trim()
		.toLowerCase()
		.replace(/[\s-]+/g, "_");
	return normalized || undefined;
}

export function toProblemDetail(data: unknown): ProblemDetail | undefined {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return undefined;
	}
	const d = data as Record<string, unknown>;
	const str = (v: unknown) => (typeof v === "string" ? v : undefined);
	return {
		type: str(d.type),
		title: str(d.title),
		status: typeof d.status === "number" ? d.status : undefined,
		detail: str(d.detail),
		instance: str(d.instance),
		code: str(d.code),
		errors: Array.isArray(d.errors)
			? d.errors.filter(
					(e): e is ProblemFieldError =>
						typeof e === "object" &&
						e !== null &&
						typeof (e as ProblemFieldError).field === "string" &&
						typeof (e as ProblemFieldError).value === "string",
				)
			: undefined,
	};
}

export function extractErrorText(data: unknown): string {
	if (typeof data === "object" && data !== null) {
		const d = data as Record<string, unknown>;
		return (
			(typeof d.message === "string" && d.message) ||
			(typeof d.error === "string" && d.error) ||
			(typeof d.detail === "string" && d.detail) ||
			(typeof d.title === "string" && d.title) ||
			"Request failed"
		);
	}
	return "Request failed";
}

export function toApiError(error: unknown): ApiError {
	if (error instanceof ApiError) return error;
	if (axios.isAxiosError(error)) {
		if (error.response) {
			const problem = toProblemDetail(error.response.data);
			return new ApiError(extractErrorText(error.response.data), {
				status: error.response.status,
				code: normalizeErrorCode(problem?.code),
				problem,
			});
		}
		return new ApiError(error.message || "Network error");
	}
	return new ApiError(error instanceof Error ? error.message : "Network error");
}

export async function toApiErrorFromBlob(error: unknown): Promise<ApiError> {
	if (
		axios.isAxiosError(error) &&
		error.response &&
		typeof Blob !== "undefined" &&
		error.response.data instanceof Blob
	) {
		try {
			const parsed: unknown = JSON.parse(await error.response.data.text());
			const problem = toProblemDetail(parsed);
			return new ApiError(extractErrorText(parsed), {
				status: error.response.status,
				code: normalizeErrorCode(problem?.code),
				problem,
			});
		} catch {
			return new ApiError("Request failed", { status: error.response.status });
		}
	}
	return toApiError(error);
}

const ERROR_MESSAGES: Record<string, string> = {
	not_found: "Мэдээлэл олдсонгүй",
	system_error: "Системийн алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу",
	validation_exception: "Оруулсан мэдээлэл буруу байна",
	plan_expired: "Таны багцын хугацаа дууссан байна",
	invalid_argument: "Оруулсан мэдээлэл буруу байна",
	unexpected_response:
		"Сервер хүлээгдээгүй хариу буцаалаа. Жагсаалтаа шинэчилж шалгана уу",
	unexpected_report: "Тайлангийн файл буруу хэлбэртэй ирлээ. Дахин оролдоно уу",
};

const NETWORK_ERROR_MESSAGE =
	"Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу";
const GENERIC_ERROR_MESSAGE = "Алдаа гарлаа. Дахин оролдоно уу";

function serverDetail(source: object): string | undefined {
	const s = source as { status?: unknown; problem?: ProblemDetail };
	if (typeof s.status !== "number" || s.status < 400 || s.status >= 500) {
		return undefined;
	}
	const detail = s.problem?.detail?.trim();
	return detail || undefined;
}

export function getErrorMessage(source: unknown, fallback?: string): string {
	if (typeof source === "object" && source !== null) {
		const s = source as { status?: unknown; code?: unknown };
		const code = normalizeErrorCode(s.code);
		if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
		const detail = serverDetail(source);
		if (detail) return detail;
		if (source instanceof ApiError && source.status === undefined) {
			return NETWORK_ERROR_MESSAGE;
		}
	}
	return fallback ?? GENERIC_ERROR_MESSAGE;
}

export function isRetryableError(error: unknown): boolean {
	if (!(error instanceof ApiError)) return true;
	if (error.code === "invalid_argument") return false;
	if (error.status === undefined) return true;
	return error.status >= 500;
}

export function getFieldErrors(error: unknown): Record<string, string> {
	const problem =
		error instanceof ApiError
			? error.problem
			: typeof error === "object" && error !== null
				? (error as { problem?: ProblemDetail }).problem
				: undefined;
	return Object.fromEntries(
		(problem?.errors ?? []).map((e) => [e.field, e.value]),
	);
}

export function isApiErrorCode(error: unknown, code: string): boolean {
	return error instanceof ApiError && error.code === normalizeErrorCode(code);
}
