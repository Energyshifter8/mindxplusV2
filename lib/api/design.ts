import { apiGetOrThrow, apiPostOrThrow } from "@/lib/api/http";
import {
	assertRestSuccess,
	enc,
	invalidArgument,
} from "@/lib/api/role-assessment/shared";
import type { DesignDTO, DesignOwnerType, IdDTO } from "@/lib/types/api";

function designPath(ownerType: DesignOwnerType, ownerId: string) {
	return `/customer/designs/${ownerType}/${enc(ownerId)}`;
}

export function fetchDesign(ownerType: DesignOwnerType, ownerId: string) {
	return apiGetOrThrow<DesignDTO>(designPath(ownerType, ownerId));
}

export const LOGO_MAX_BYTES = 200 * 1024;

export function uploadDesignLogo(
	ownerType: DesignOwnerType,
	ownerId: string,
	logo: Blob,
) {
	if (logo.size === 0) throw invalidArgument("Лого файл хоосон байна");
	const form = new FormData();
	form.append("logo", logo);
	return apiPostOrThrow<string>(
		`${designPath(ownerType, ownerId)}/upload-logo`,
		form,
	);
}

export async function removeDesignLogo(
	ownerType: DesignOwnerType,
	ownerId: string,
	designId: number,
) {
	if (!Number.isSafeInteger(designId) || designId < 0) {
		throw invalidArgument("Дизайны id буруу");
	}
	const body: IdDTO = { id: designId };
	assertRestSuccess(
		await apiPostOrThrow<unknown>(
			`${designPath(ownerType, ownerId)}/remove-logo`,
			body,
		),
	);
}
