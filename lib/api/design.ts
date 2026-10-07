// design-controller — үнэлгээнд ownerType = "RECRUITMENT" (staging 📦, GET ✅), survey-д "survey".

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

/** GET /customer/designs/{ownerType}/{ownerId} ✅ (`logoUrl` лого байхгүй үед ирэхгүй) */
export function fetchDesign(ownerType: DesignOwnerType, ownerId: string) {
	return apiGetOrThrow<DesignDTO>(designPath(ownerType, ownerId));
}

/** Лого: PNG/JPEG, ≤200KB (staging client-side шалгалт 📦) */
export const LOGO_MAX_BYTES = 200 * 1024;

/**
 * POST …/upload-logo — multipart, талбар `logo` 📦 → 200 string.
 * Content-Type (boundary-тай)-г browser тавина; proxy binary-г дамжуулна.
 */
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

/** POST …/remove-logo `{id}` — `id` нь DesignDTO.id (staging: `design.id` 📦) */
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
