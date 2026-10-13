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

export function recruitmentListPath(params: RecruitmentListParams): string {
	return `/customer/recruitments/${buildQuery({ ...params })}`;
}

export function fetchRecruitmentList(params: RecruitmentListParams) {
	return apiGetOrThrow<SpringPage<RecruitmentListItem>>(
		recruitmentListPath(params),
	);
}

export function fetchRecruitmentStats() {
	return apiGetOrThrow<RecruitmentStats>("/customer/recruitments/statistics");
}

export function fetchRecruitmentDetail(id: string) {
	return apiGetOrThrow<RecruitmentDetail>(`/customer/recruitments/${enc(id)}`);
}

export const RECRUITMENT_NAME_MAX = 100;

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
		throw new ApiError("Unexpected create response", {
			code: "unexpected_response",
		});
	}
	return id;
}

export async function renameRecruitment(id: string, name: string) {
	const body: StrDTO = { str: requireText(name, "Нэр") };
	await apiPostOrThrow<unknown>(
		`/customer/recruitments/${enc(id)}/rename`,
		body,
	);
}

export async function closeRecruitment(id: string) {
	const body: StrDTO = { str: requireText(id, "Үнэлгээний id") };
	await apiPostOrThrow<unknown>("/customer/recruitments/close", body);
}

export async function deleteRecruitment(id: string) {
	const body: StrDTO = { str: requireText(id, "Үнэлгээний id") };
	await apiPostOrThrow<unknown>("/customer/recruitments/delete", body);
}
