export interface TalentLike {
	id: number | string;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	phoneNumber?: string | null;
	avgStarPoint?: number | null;
	marked?: boolean | null;
	createdAt?: string | null;
	recruitments?: readonly { id: string; name: string }[] | null;
}

export interface TalentCardModel {
	talentId: string;
	displayName: string;
	phone: string;
	email: string;
	rating: number | null;
	marked: boolean;
	createdAt: string | null;
	roles: string[];
}

export function talentDisplayName(
	t: Pick<TalentLike, "firstName" | "lastName"> | null | undefined,
): string {
	return (
		[t?.lastName?.trim(), t?.firstName?.trim()].filter(Boolean).join(" ") || "—"
	);
}

export function toTalentCard(t: TalentLike): TalentCardModel {
	const rating =
		typeof t.avgStarPoint === "number" && !Number.isNaN(t.avgStarPoint)
			? Math.max(0, t.avgStarPoint)
			: null;
	const names = (t.recruitments ?? [])
		.map((r) => String(r.name ?? "").trim())
		.filter((n) => n.length > 0);
	return {
		talentId: t.id != null ? String(t.id).trim() : "",
		displayName: talentDisplayName(t),
		phone: t.phoneNumber?.trim() ?? "",
		email: t.email?.trim() ?? "",
		rating,
		marked: t.marked === true,
		createdAt: t.createdAt?.trim() ? t.createdAt.trim() : null,
		roles: [...new Set(names)],
	};
}

export function visibleTags(
	tags: readonly string[],
	max = 2,
): { shown: string[]; more: number } {
	const shown = tags.slice(0, max);
	return { shown, more: Math.max(0, tags.length - shown.length) };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function splitLocalDateTime(value: string | null | undefined): {
	date: string;
	time: string;
} {
	if (!value) return { date: "—", time: "" };
	const text = value.trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return { date: text, time: "" };
	const d = new Date(text);
	if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
	const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
	const h = d.getHours();
	const m = d.getMinutes();
	if (h === 0 && m === 0) return { date, time: "" };
	return { date, time: `${pad2(h)}:${pad2(m)}` };
}

export function clampPage(page: number, totalPages: number): number {
	return Math.min(Math.max(1, page), Math.max(1, totalPages));
}
