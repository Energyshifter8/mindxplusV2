// my-talent-controller (урьсан талентууд)

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

/** GET /customer/hiring-invitations/talents (#21) — `q` хайлт, `marked` зөвхөн true үед */
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

/** GET /customer/hiring-invitations/talents/{id} (#22) */
export function fetchTalentDetail(id: string | number) {
	return apiGetOrThrow<TalentDetail>(
		`/customer/hiring-invitations/talents/${enc(id)}`,
	);
}

/** GET /customer/hiring-invitations/talents/{id}/invitations (#23) */
export function fetchTalentInvitations(
	id: string | number,
	params: ApiPageParams,
) {
	return apiGetOrThrow<TalentInvitationPage>(
		`/customer/hiring-invitations/talents/${enc(id)}/invitations${buildQuery({ ...params })}`,
	);
}

/** POST /customer/hiring-invitations/talents/bookmark `{id: int64}` 📦 — toggle, body-гүй хариу */
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
