import { ApiError } from "@/lib/api-errors";
import type { RestResponse } from "@/lib/types/api";

export function invalidArgument(message: string): ApiError {
	return new ApiError(message, { code: "invalid_argument" });
}

export function requireText(value: string, label: string): string {
	const text = value.trim();
	if (!text) throw invalidArgument(`${label} хоосон байна`);
	return text;
}

export function assertRestSuccess(data: unknown): void {
	const r = data as RestResponse<unknown> | null;
	if (typeof r === "object" && r !== null && r.success === false) {
		throw new ApiError(r.message || "Request failed", { status: r.status });
	}
}

const API_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

export function enc(value: string | number): string {
	return encodeURIComponent(String(value));
}
