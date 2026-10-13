import axios from "axios";
import {
	apiGetOrThrow,
	apiPostOrThrow,
	buildQuery,
	httpClient,
	type SpringPage,
} from "@/lib/api/http";
import { toApiError, toApiErrorFromBlob } from "@/lib/api-errors";
import type { ApiPageParams } from "@/lib/pagination";
import type {
	DateDTO,
	EmailDTO,
	Rating,
	RestResponse,
	StrDTO,
	Talent,
	TalentEntity,
} from "@/lib/types/api";
import type {
	InvitationName,
	InvitationNote,
	InvitationRate,
	InvitationResult,
	InviteTalentPayload,
	RecruitmentInvitation,
} from "@/lib/types/role-assessment";
import {
	assertRestSuccess,
	enc,
	invalidArgument,
	requireText,
	toApiDate,
} from "./shared";

export function fetchRecruitmentInvitations(
	recruitmentId: string,
	params: ApiPageParams,
) {
	return apiGetOrThrow<SpringPage<RecruitmentInvitation>>(
		`/customer/hiring-invitations/list/${enc(recruitmentId)}${buildQuery({ ...params })}`,
	);
}

export function fetchInvitationResult(
	recruitmentId: string,
	invitationId: string,
) {
	return apiGetOrThrow<InvitationResult>(
		`/customer/hiring-invitations/${enc(recruitmentId)}/${enc(invitationId)}`,
	);
}

export function fetchInvitationNames(recruitmentId: string) {
	return apiGetOrThrow<InvitationName[]>(
		`/customer/hiring-invitations/names/${enc(recruitmentId)}`,
	);
}

export function fetchInvitationRate(invitationId: string) {
	return apiGetOrThrow<InvitationRate>(
		`/customer/hiring-invitations/${enc(invitationId)}/rate`,
	);
}

export async function rateInvitation(invitationId: string, points: number) {
	if (!Number.isInteger(points) || points < 0 || points > 5) {
		throw invalidArgument("Үнэлгээ 0–5 бүхэл тоо байх ёстой");
	}
	const body: Rating = { points };
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`/customer/hiring-invitations/${enc(invitationId)}/rate`,
			body,
		),
	);
}

export function fetchInvitationNotes(invitationId: string) {
	return apiGetOrThrow<InvitationNote[]>(
		`/customer/hiring-invitations/${enc(invitationId)}/notes`,
	);
}

export const NOTE_MAX = 500;

export function addInvitationNote(invitationId: string, note: string) {
	const body: StrDTO = { str: requireText(note, "Тэмдэглэл") };
	return apiPostOrThrow<InvitationNote>(
		`/customer/hiring-invitations/${enc(invitationId)}/notes/add`,
		body,
	);
}

export function inviteTalent(payload: InviteTalentPayload) {
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

export const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FoundTalent = TalentEntity & { mobileNo?: string | null };

export async function searchTalentByEmail(
	email: string,
): Promise<FoundTalent | null> {
	const value = email.trim();
	if (!EMAIL_SHAPE.test(value)) return null;
	const body: EmailDTO = { value };
	let data: unknown;
	try {
		data = (
			await httpClient.post<unknown>(
				"/customer/hiring-invitations/search-by-email",
				body,
			)
		).data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404)
			return null;
		throw toApiError(error);
	}
	if (data === null || typeof data !== "object") return null;
	const entity = (
		"data" in data ? (data as RestResponse<TalentEntity>).data : data
	) as FoundTalent | null | undefined;
	if (!entity || typeof entity !== "object") return null;
	const filled = (v: unknown) => typeof v === "string" && v.trim() !== "";
	const hasDetails =
		filled(entity.firstName) ||
		filled(entity.lastName) ||
		filled(entity.phoneNumber) ||
		filled(entity.mobileNo);
	return hasDetails ? entity : null;
}

export function extendInvitation(invitationId: string, dueDate: string | Date) {
	const body: DateDTO = { value: toApiDate(dueDate) };
	return apiPostOrThrow<Talent>(
		`/customer/hiring-invitations/${enc(invitationId)}/extend`,
		body,
	);
}

function testReportPath(invitationId: string, answerId: string) {
	return `/customer/hiring/test-result/report/${enc(invitationId)}/${enc(answerId)}`;
}

export async function fetchTestReportHtml(
	invitationId: string,
	answerId: string,
): Promise<string> {
	const data = await apiGetOrThrow<unknown>(
		testReportPath(invitationId, answerId),
		{
			responseType: "text",
		},
	);
	if (typeof data === "string") return data;
	const d = data as {
		html?: unknown;
		content?: unknown;
		data?: unknown;
	} | null;
	const html = d?.html ?? d?.content ?? d?.data;
	return typeof html === "string" ? html : "";
}

export async function downloadTestReport(
	invitationId: string,
	answerId: string,
): Promise<{ blob: Blob; contentDisposition: string | null }> {
	try {
		const response = await httpClient.get<Blob>(
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
