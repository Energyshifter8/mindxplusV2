// design-controller — үнэлгээнд ownerType = "RECRUITMENT" (staging 📦, GET ✅), survey-д "survey".

import { apiGetOrThrow, apiPostOrThrow } from "@/lib/api/http";
import {
	assertRestSuccess,
	enc,
	invalidArgument,
} from "@/lib/api/role-assessment/shared";
import type {
	DesignDTO,
	DesignOwnerType,
	IdDTO,
	ThemeType,
	UpdateDesign,
} from "@/lib/types/api";

function designPath(ownerType: DesignOwnerType, ownerId: string) {
	return `/customer/designs/${ownerType}/${enc(ownerId)}`;
}

/** GET /customer/designs/themes ✅ */
export function fetchDesignThemes() {
	return apiGetOrThrow<ThemeType[]>("/customer/designs/themes");
}

/** GET /customer/designs/{ownerType}/{ownerId} ✅ (`logoUrl` лого байхгүй үед ирэхгүй) */
export function fetchDesign(ownerType: DesignOwnerType, ownerId: string) {
	return apiGetOrThrow<DesignDTO>(designPath(ownerType, ownerId));
}

/**
 * POST /customer/designs/{ownerType}/{ownerId}/update — body UpdateDesign (swagger).
 * Анхаар: хариунд байрлал `imagePosition`, body-д `logoPosition`.
 * Staging апп үнэлгээнд энэ endpoint-ийг дууддаггүй (зөвхөн survey) — U38.
 */
export function updateDesign(
	ownerType: DesignOwnerType,
	ownerId: string,
	body: UpdateDesign,
) {
	return apiPostOrThrow<DesignDTO>(
		`${designPath(ownerType, ownerId)}/update`,
		body,
	);
}

/** Лого: PNG/JPEG, ≤200KB (staging client-side шалгалт 📦) */
export const LOGO_MAX_BYTES = 200 * 1024;
export const LOGO_TYPES = ["image/png", "image/jpeg"] as const;

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
