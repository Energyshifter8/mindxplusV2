// Талентийн үнэлгээний дэлгэцүүдийн нийтлэг формат.
// Staging огноог `+08:00` offset-той ISO-8601-ээр илгээдэг.

function toDate(value: string | null | undefined): Date | null {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | null | undefined): string {
	const d = toDate(value);
	if (!d) return "—";
	return d.toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export function formatDateTime(value: string | null | undefined): string {
	const d = toDate(value);
	if (!d) return "—";
	return d.toLocaleString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

/** Staging `E6`: "Ж. Дорж" — овгийн эхний үсэг (том) + нэр; хоосон бол "" (bundle ✅). */
export function formatPersonShort(
	person:
		| { firstName?: string | null; lastName?: string | null }
		| null
		| undefined,
): string {
	const first = person?.firstName?.trim() ?? "";
	const last = person?.lastName?.trim() ?? "";
	const initial = last ? `${last.charAt(0).toUpperCase()}. ` : "";
	return `${initial}${first}`.trim();
}

export function formatMinutesRange(min: number, max: number): string {
	return min === max ? `${min}` : `${min}-${max}`;
}

/** Тестүүдийн min/max хугацааны нийлбэр (staging wizard-ын "Нийт хугацаа"). */
export function sumMinutes(
	items: { minMinutes: number; maxMinutes: number }[],
): {
	min: number;
	max: number;
} {
	return items.reduce(
		(acc, item) => ({
			min: acc.min + (item.minMinutes ?? 0),
			max: acc.max + (item.maxMinutes ?? 0),
		}),
		{ min: 0, max: 0 },
	);
}

/** Секунд → "45сек" / "3мин 5сек" (staging-ийн явцын хяналтын формат ✅). */
export function formatDurationSeconds(
	totalSeconds: number | null | undefined,
): string {
	if (totalSeconds == null || totalSeconds < 0) return "—";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return minutes === 0 ? `${seconds}сек` : `${minutes}мин ${seconds}сек`;
}

export function formatSpendingTime(
	time: { minutes?: number | null; seconds?: number | null } | null | undefined,
): string {
	if (!time) return "—";
	return formatDurationSeconds((time.minutes ?? 0) * 60 + (time.seconds ?? 0));
}

/** Оноо: бүхэл бол тэр чигээр, бутархай бол 1 орон (staging ✅). */
export function formatPoints(points: number | null | undefined): string {
	if (points == null || !Number.isFinite(points)) return "—";
	return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

// --- Staging-ийн formatter-ууд (📦 bundle, module 39378) ---

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Staging `r6`: "YYYY-MM-DD • HH:mm" (browser-ийн цагийн бүсээр). Цаг 00:00 бол
 * зөвхөн огноо, `YYYY-MM-DD` оролт тэр чигээрээ, хоосон/буруу бол "---".
 */
export function formatDateBullet(value: string | null | undefined): string {
	if (!value) return "---";
	const text = value.trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
	const d = new Date(text);
	if (Number.isNaN(d.getTime())) return "---";
	const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
	const h = d.getHours();
	const m = d.getMinutes();
	return h === 0 && m === 0 ? date : `${date} • ${pad2(h)}:${pad2(m)}`;
}

const ISO_DATE_TIME = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/;

/**
 * Staging `AC`: ISO мөрөөс огноо, цагийг ХӨРВҮҮЛЭЛГҮЙ салгана (серверийн +08:00 цаг).
 * Хоосон бол `{date: "-", time: ""}`.
 */
export function splitDateTime(value: string | null | undefined): {
	date: string;
	time: string;
} {
	const text = value == null ? "" : String(value).trim();
	if (!text) return { date: "-", time: "" };
	const match = ISO_DATE_TIME.exec(text);
	if (match) return { date: match[1], time: match[2] };
	if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return { date: text, time: "" };
	const d = new Date(text);
	if (Number.isNaN(d.getTime())) return { date: text, time: "" };
	return {
		date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
		time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
	};
}

/** Staging `Yq`: "YYYY-MM-DD" эсвэл `withTime` үед "YYYY-MM-DD HH:mm" (локал), буруу бол "". */
export function formatYmd(
	value: string | null | undefined,
	withTime = false,
): string {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
	return withTime
		? `${date} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
		: date;
}

/**
 * Staging (нүүр хуудас 📦): <60мин "N минутын өмнө", <24ц "N цагийн өмнө",
 * 1 өдөр "Өдрийн өмнө", бусад "N өдрийн өмнө"; хоосон/буруу бол "-".
 */
export function formatRelative(
	value: string | null | undefined,
	now: number = Date.now(),
): string {
	if (!value) return "-";
	const time = new Date(value).getTime();
	if (Number.isNaN(time)) return "-";
	const minutes = Math.max(0, Math.floor((now - time) / 60_000));
	if (minutes < 60) return `${minutes} минутын өмнө`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} цагийн өмнө`;
	const days = Math.floor(hours / 24);
	return days === 1 ? "Өдрийн өмнө" : `${days} өдрийн өмнө`;
}

/** Staging статистик карт (module 94621): ≥ 10000 → "Хязгааргүй", null → 0. */
export const UNLIMITED_THRESHOLD = 10_000;

export function formatStatCount(value: number | null | undefined): string {
	if (typeof value === "number" && value >= UNLIMITED_THRESHOLD)
		return "Хязгааргүй";
	return String(value ?? 0);
}

/** Staging `l1`: кирилл үсэг, зай, "-"-ээс бусдыг хасна (урих формын овог/нэр). */
export function keepCyrillic(value: string): string {
	return value.replace(/[^\u0400-\u04FF\s-]/g, "");
}

/** Staging `sf`: хоосон биш, зөвхөн кирилл/зай/"-". */
export function isCyrillicName(value: string): boolean {
	const text = value.trim();
	return text.length > 0 && /^[\u0400-\u04FF\s-]+$/.test(text);
}

/** Локал огноо + `days` хоног → "YYYY-MM-DD" (staging `dayjs().add(n,"days")`). */
export function addDaysYmd(days: number, now: Date = new Date()): string {
	const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** "YYYY-MM-DD" → "YYYY/MM/DD" (огноо сонгогчийн харагдац). */
export function formatSlashDate(value: string | null | undefined): string {
	return value && /^\d{4}-\d{2}-\d{2}$/.test(value)
		? value.replace(/-/g, "/")
		: "";
}

/** Утасны дугаар: зөвхөн цифр, ≤ 8 (staging урих форм). */
export function digitsOnly(value: string | null | undefined, max = 8): string {
	return String(value ?? "")
		.replace(/\D/g, "")
		.slice(0, max);
}

// --- Явц, хугацааны label (📦 module 87100) ---

/** Жагсаалтын "Явц": CREATED → "--/--", бусад "completed/total". */
export function listProgressLabel(row: {
	status?: string;
	completedInvitationCount?: number | null;
	totalInvitationCount?: number | null;
}): string {
	if (row.status === "CREATED") return "--/--";
	return `${row.completedInvitationCount ?? 0}/${row.totalInvitationCount ?? 0}`;
}

/** Дэлгэрэнгүйн "Явц": CREATED → "--/--", бусад count.completed/count.total. */
export function detailProgressLabel(detail: {
	status?: string;
	count?: { completed?: number | null; total?: number | null } | null;
}): string {
	if (detail.status === "CREATED") return "--/--";
	return `${detail.count?.completed ?? 0}/${detail.count?.total ?? 0}`;
}

/** Тест/асуултын хугацаа: "min-max Мин" эсвэл "N Мин". */
export function minutesLabel(item: {
	minMinutes?: number | null;
	maxMinutes?: number | null;
}): string {
	return item.minMinutes && item.maxMinutes
		? `${item.minMinutes}-${item.maxMinutes} Мин`
		: `${item.maxMinutes || item.minMinutes || 0} Мин`;
}

/**
 * Staging dashboard (📦 module 34795): "min-max Мин" / "max Мин" / "min Мин" / "---".
 * Тестийн нийт хугацаанд `unit = "мин"` (жижиг үсэг).
 */
export function minutesRangeOrDash(
	min: number | null | undefined,
	max: number | null | undefined,
	unit = "Мин",
): string {
	if (min && max) return `${min}-${max} ${unit}`;
	if (max) return `${max} ${unit}`;
	if (min) return `${min} ${unit}`;
	return "---";
}
