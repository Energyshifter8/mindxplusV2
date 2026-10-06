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

/** Staging-ийн "Ж. Дорж" хэлбэр: овгийн эхний үсэг (том) + нэр (bundle ✅). */
export function formatPersonShort(
	person:
		| { firstName?: string | null; lastName?: string | null }
		| null
		| undefined,
): string {
	if (!person) return "—";
	const first = person.firstName?.trim() ?? "";
	const lastInitial = person.lastName?.trim().charAt(0).toUpperCase() ?? "";
	if (!first && !lastInitial) return "—";
	return lastInitial ? `${lastInitial}. ${first}`.trim() : first;
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
