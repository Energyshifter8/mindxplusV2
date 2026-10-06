"use client";

import { toast } from "sonner";
import { logoutRequest, refreshTokenRequest } from "@/lib/api";
import { ApiError, toApiError } from "@/lib/api-errors";

// Staging апп-ын token-ий логик (📦 bundle): refresh 9 минут тутам, tab харагдаж байх
// үед, navigator.locks-оор олон tab-д давхардуулахгүй. JWT-ийн хугацаа дууссан эсвэл
// refresh 401 бол дахин нэвтрүүлнэ.
//
// Deliberate deviation: staging localhost/127.0.0.1/::1/*.local дээр refresh ХИЙДЭГГҮЙ.
// Локал dev session дуусахгүйн тулд энэ шалгалтыг хуулаагүй (docs/parity/home.md).

const REFRESH_INTERVAL_MS = 540_000; // staging: 54e4
const LOCK_NAME = "token-refresh";

const TOKEN_KEY = "token";
const LAST_EXECUTION_KEY = "lastExecution";
const PROFILE_KEY = "userProfile";
const ACCOUNT_KEY = "accountInfo";
const REDIRECT_PATH_KEY = "redirectPath";

function decodeJwtExp(token: string): number | undefined {
	const payload = token.split(".")[1];
	if (!payload) throw new Error("Invalid token");
	const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
	const { exp } = JSON.parse(json) as { exp?: number };
	return typeof exp === "number" ? exp : undefined;
}

/** Staging `L()`: token байхгүй, задрахгүй эсвэл `exp` өнгөрсөн бол true. */
export function isTokenInvalidOrExpired(
	token: string | null | undefined,
): boolean {
	if (!token) return true;
	try {
		const exp = decodeJwtExp(token);
		return exp !== undefined && Date.now() / 1000 > exp;
	} catch {
		return true;
	}
}

/** Staging `CT()`: POST-гүй — замыг хадгалаад token устгаж /login руу. */
export function forceRelogin(): void {
	localStorage.setItem(REDIRECT_PATH_KEY, window.location.pathname);
	localStorage.removeItem(TOKEN_KEY);
	toast.warning("Дахин нэвтэрнэ үү!");
	window.location.replace("/login");
}

function clearProfileCache(): void {
	localStorage.removeItem(ACCOUNT_KEY);
	localStorage.removeItem(PROFILE_KEY);
}

/**
 * Staging хэрэглэгчийн цэсний "Гарах": POST /user/logout (алдааг үл тоомсорлоно) →
 * token, lastExecution устгах → profile/account цэвэрлэх → /login.
 */
export async function logout(onCleared?: () => void): Promise<void> {
	try {
		await logoutRequest();
	} catch {
		// staging: catch(e){} — алдаа гарсан ч гарна
	}
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(LAST_EXECUTION_KEY);
	clearProfileCache();
	onCleared?.();
}

async function refreshNow(): Promise<void> {
	try {
		const token = await refreshTokenRequest();
		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(LAST_EXECUTION_KEY, Date.now().toString());
	} catch (error) {
		const apiError = error instanceof ApiError ? error : toApiError(error);
		if (apiError.status === 401) {
			clearProfileCache();
			forceRelogin();
		}
	}
}

/** Сүүлийн refresh 9 минутаас бага өмнө байсан бол алгасна (олон tab). */
async function refreshIfDue(): Promise<void> {
	const last = Number(localStorage.getItem(LAST_EXECUTION_KEY));
	if (last && Date.now() - last < REFRESH_INTERVAL_MS) return;
	await refreshNow();
}

async function refreshWithLock(): Promise<void> {
	if (navigator.locks) {
		await navigator.locks.request(LOCK_NAME, refreshIfDue);
	} else {
		await refreshIfDue();
	}
}

/**
 * Mount-аас (эсвэл сүүлийн refresh-ээс) 9 минутын дараа refresh хийнэ. Ачаалахад
 * refresh ХИЙХГҮЙ. Tab нуугдвал timer-ийг зогсоож, харагдахад дахин тооцно.
 */
export function startTokenRefreshScheduler(): () => void {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let anchor = Date.now();

	const schedule = () => {
		if (timer) clearTimeout(timer);
		timer = undefined;
		if (document.hidden) return;
		const last = Number(localStorage.getItem(LAST_EXECUTION_KEY));
		const delay = Math.max(
			Math.max(anchor, last || 0) + REFRESH_INTERVAL_MS - Date.now(),
			0,
		);
		timer = setTimeout(() => {
			anchor = Date.now();
			const token = localStorage.getItem(TOKEN_KEY);
			if (!token) {
				schedule();
				return;
			}
			if (isTokenInvalidOrExpired(token)) {
				clearProfileCache();
				forceRelogin();
				return;
			}
			refreshWithLock().then(schedule);
		}, delay);
	};

	document.addEventListener("visibilitychange", schedule);
	schedule();
	return () => {
		if (timer) clearTimeout(timer);
		document.removeEventListener("visibilitychange", schedule);
	};
}
