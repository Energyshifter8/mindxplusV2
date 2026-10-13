import { apiGetOrThrow, apiPostOrThrow } from "@/lib/api/http";
import type {
	RecruitmentInfo,
	RecruitmentSettings,
	StrDTO,
} from "@/lib/types/api";
import type { UpdateRecruitmentInfoPayload } from "@/lib/types/role-assessment";
import { assertRestSuccess, enc, invalidArgument, requireText } from "./shared";

export function fetchRecruitmentSettings() {
	return apiGetOrThrow<RecruitmentSettings>(
		"/customer/recruitment-setup/settings",
	);
}

export function fetchRecruitmentInformation(id: string) {
	return apiGetOrThrow<RecruitmentInfo>(
		`/customer/recruitment-setup/${enc(id)}/information`,
	);
}

export const RECRUITMENT_INFO_MAX = 100;

export async function updateRecruitmentInformation(
	id: string,
	payload: UpdateRecruitmentInfoPayload,
) {
	const jobTitle = requireText(payload.jobTitle, "Ажлын байрны нэр");
	const jobDescription = requireText(payload.jobDescription, "Нэмэлт мэдээлэл");
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
			`/customer/recruitment-setup/${enc(id)}/update-information`,
			body,
		),
	);
}

export function fetchRecruitmentTestIds(id: string) {
	return apiGetOrThrow<string[]>(
		`/customer/recruitment-setup/${enc(id)}/tests`,
	);
}

export async function setRecruitmentTests(id: string, testIds: string[]) {
	const body = [...new Set(testIds.map((t) => t.trim()).filter(Boolean))];
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`/customer/recruitment-setup/${enc(id)}/set-tests`,
			body,
		),
	);
}

export function fetchRecruitmentQuestionIds(id: string) {
	return apiGetOrThrow<number[]>(
		`/customer/recruitment-setup/${enc(id)}/questions`,
	);
}

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
			`/customer/recruitment-setup/${enc(id)}/set-questions`,
			body,
		),
	);
}

export async function publishRecruitment(id: string) {
	const body: StrDTO = { str: requireText(id, "Үнэлгээний id") };
	assertRestSuccess(
		await apiPostOrThrow<unknown>("/customer/recruitment-setup/publish", body),
	);
}
