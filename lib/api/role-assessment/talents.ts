import { apiGetOrThrow, apiPostOrThrow, buildQuery } from "@/lib/api/http";
import type { ApiPageParams } from "@/lib/pagination";
import type { IdDTO } from "@/lib/types/api";
import type {
	TalentDetail,
	TalentInvitationPage,
	TalentListPage,
	TalentListParams,
} from "@/lib/types/role-assessment";
import { enc, invalidArgument } from "./shared";

export function fetchTalents(params: TalentListParams) {
	return apiGetOrThrow<TalentListPage>(
		`/customer/hiring-invitations/talents${buildQuery({
			page: params.page,
			size: params.size,
			q: params.q?.trim(),
			marked: params.marked === true ? true : undefined,
		})}`,
	);
}

export function fetchTalentDetail(id: string | number) {
	return apiGetOrThrow<TalentDetail>(
		`/customer/hiring-invitations/talents/${enc(id)}`,
	);
}

export function fetchTalentInvitations(
	id: string | number,
	params: ApiPageParams,
) {
	return apiGetOrThrow<TalentInvitationPage>(
		`/customer/hiring-invitations/talents/${enc(id)}/invitations${buildQuery({ ...params })}`,
	);
}

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
