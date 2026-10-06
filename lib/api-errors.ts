import axios from "axios";

// --- ProblemDetail (RFC 7807) ---
// Staging-ийн бүх алдааны хариу: `application/problem+json`
// {type, title, status, detail, instance, code} — ✅ ажиглагдсан.

export interface ProblemDetail {
	type?: string;
	title?: string;
	status?: number;
	detail?: string;
	instance?: string;
	code?: string;
	/** Validation алдаанд (code=VALIDATION_EXCEPTION) ирнэ — staging ✅ */
	errors?: ProblemFieldError[];
}

/** `value` нь талбарын Монгол алдааны мессеж (Accept-Language: mn-MN үед). */
export interface ProblemFieldError {
	field: string;
	value: string;
}

/**
 * Throw хийдэг helper-уудын (apiGetOrThrow/apiPostOrThrow) алдаа.
 * `status` undefined бол сүлжээний алдаа (хариу ирээгүй).
 * `code` нь normalizeErrorCode-оор жижиг үсэг болгосон утга.
 */
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

/**
 * Staging-ийн `code` том/жижиг үсэг холимог ирдэг:
 * `NOT_FOUND`, `SYSTEM_ERROR` (framework) ба `not_found`, `plan_expired` (domain).
 * Бүгдийг жижиг үсэг + `_` болгож нэг хэлбэрт оруулна.
 */
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

/** Хариуны body-оос хүнд уншигдах текст (ApiResponse.error-д ашиглагддаг хуучин дүрэм). */
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

/** `responseType: "blob"` хүсэлтийн алдааны body Blob болж ирдэг тул JSON болгож уншина. */
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

// --- Монгол алдааны мессеж (code-оор, detail-ээр БИШ) ---

const ERROR_MESSAGES: Record<string, string> = {
	not_found: "Мэдээлэл олдсонгүй",
	system_error: "Системийн алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу",
	validation_exception: "Оруулсан мэдээлэл буруу байна",
	// bundle-derived, unverified: plan_expired code бодит хүсэлтээр ажиглагдаагүй
	plan_expired: "Таны багцын хугацаа дууссан байна",
	// client-side: хүсэлт илгээхээс өмнө илэрсэн буруу аргумент (lib/api.ts)
	invalid_argument: "Оруулсан мэдээлэл буруу байна",
	// client-side: хариу хүлээгдсэн хэлбэрт таарсангүй
	unexpected_response:
		"Сервер хүлээгдээгүй хариу буцаалаа. Жагсаалтаа шинэчилж шалгана уу",
};

const NETWORK_ERROR_MESSAGE =
	"Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу";
const GENERIC_ERROR_MESSAGE = "Алдаа гарлаа. Дахин оролдоно уу";

/**
 * Алдааны эх сурвалжаас (ApiError, эсвэл ApiResponse-ийн {status, code})
 * хэрэглэгчид харуулах Монгол мессеж гаргана.
 * Мэдэгдэхгүй code-д `fallback` (байхгүй бол ерөнхий мессеж) буцаана.
 */
export function getErrorMessage(source: unknown, fallback?: string): string {
	if (typeof source === "object" && source !== null) {
		const s = source as { status?: unknown; code?: unknown };
		const code = normalizeErrorCode(s.code);
		if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
		if (source instanceof ApiError && source.status === undefined) {
			return NETWORK_ERROR_MESSAGE;
		}
	}
	return fallback ?? GENERIC_ERROR_MESSAGE;
}

/** 4xx (олдсонгүй, эрхгүй, багц дууссан г.м.) дахин оролдоход засрахгүй. */
export function isRetryableError(error: unknown): boolean {
	if (!(error instanceof ApiError)) return true;
	if (error.code === "invalid_argument") return false;
	if (error.status === undefined) return true;
	return error.status >= 500;
}

/** Validation алдааны талбар бүрийн мессеж: { limit: "10-аас бага ..." } */
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
