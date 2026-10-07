// my-recruitments-controller

import {
	apiGetOrThrow,
	apiPostOrThrow,
	buildQuery,
	type SpringPage,
} from "@/lib/api/http";
import { ApiError } from "@/lib/api-errors";
import type { StrDTO } from "@/lib/types/api";
import type {
	RecruitmentDetail,
	RecruitmentListItem,
	RecruitmentListParams,
	RecruitmentStats,
} from "@/lib/types/role-assessment";
import { enc, requireText } from "./shared";

/** Төгсгөлийн "/" заавал: "/customer/recruitments" нь 404 буцаадаг (staging ✅). */
export function recruitmentListPath(params: RecruitmentListParams): string {
	return `/customer/recruitments/${buildQuery({ ...params })}`;
}

/** GET /customer/recruitments/ (#1) */
export function fetchRecruitmentList(params: RecruitmentListParams) {
	return apiGetOrThrow<SpringPage<RecruitmentListItem>>(
		recruitmentListPath(params),
	);
}

/** GET /customer/recruitments/statistics (#2) */
export function fetchRecruitmentStats() {
	return apiGetOrThrow<RecruitmentStats>("/customer/recruitments/statistics");
}

/** GET /customer/recruitments/{id} (#3) */
export function fetchRecruitmentDetail(id: string) {
	return apiGetOrThrow<RecruitmentDetail>(`/customer/recruitments/${enc(id)}`);
}

/** Үүсгэх modal-ын нэрийн дээд урт (staging input maxLength 📦; swagger зөвхөн minLength 1). */
export const RECRUITMENT_NAME_MAX = 100;

/**
 * POST /customer/recruitments/new — swagger: body StrDTO {str*} → 200 string (шинэ id).
 * Staging: `router.push("/role-assessment/" + response)` 📦. `{id}` хэлбэрийг ч зохицуулна.
 */
export async function createRecruitment(name: string): Promise<string> {
	const body: StrDTO = { str: requireText(name, "Ажлын байрны нэр") };
	const data = await apiPostOrThrow<unknown>(
		"/customer/recruitments/new",
		body,
	);
	const id =
		typeof data === "string"
			? data.trim()
			: typeof data === "object" &&
					data !== null &&
					typeof (data as { id?: unknown }).id === "string"
				? (data as { id: string }).id
				: "";
	if (!id) {
		// Сервер амжилттай гэсэн ч id уншигдсангүй — ноорог үүссэн байж болно
		throw new ApiError("Unexpected create response", {
			code: "unexpected_response",
		});
	}
	return id;
}

/** POST /customer/recruitments/{id}/rename `{str: name}` 📦 → 200 body-гүй */
export async function renameRecruitment(id: string, name: string) {
	const body: StrDTO = { str: requireText(name, "Нэр") };
	await apiPostOrThrow<unknown>(
		`/customer/recruitments/${enc(id)}/rename`,
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
