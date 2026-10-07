// Талентын үр дүнгийн хуудасны цэвэр логик (staging 📦 module 1043, 76724).
// Тестэд relative import-оор ашиглагдана — "@/..." alias хэрэглэхгүй.

export interface SpentTime {
	minutes?: number | null;
	seconds?: number | null;
}

/** Staging `fo`: "1 цаг 5 мин 3 сек" / "5 мин 3 сек" / "5 мин" / "3 сек" / "---". */
export function formatSpentTime(time: SpentTime | null | undefined): string {
	if (!time) return "---";
	const minutes = time.minutes ?? 0;
	const seconds = time.seconds ?? 0;
	const hours = Math.floor(minutes / 60);
	if (hours > 0) return `${hours} цаг ${minutes % 60} мин ${seconds} сек`;
	if (minutes > 0 && seconds > 0) return `${minutes} мин ${seconds} сек`;
	if (minutes > 0) return `${minutes} мин`;
	if (seconds > 0) return `${seconds} сек`;
	return "---";
}

/** Staging `m`: явцын хяналтын хугацаа "37сек" / "2мин 5сек"; сөрөг/байхгүй бол null. */
export function formatEventSeconds(
	total: number | null | undefined,
): string | null {
	if (total == null || total < 0) return null;
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	return minutes === 0 ? `${seconds}сек` : `${minutes}мин ${seconds}сек`;
}

export interface EventSummaryEntry {
	count?: number | null;
	seconds?: number | null;
}

export interface ProctoringDef {
	key: string;
	fallbackKey?: string;
	hasDuration: boolean;
}

/** Явцын хяналтын нэг мөр: тоо ("-" хоосон/0) ба хугацаа (байвал). */
export function proctoringRow(
	summary: Record<string, EventSummaryEntry | undefined> | null | undefined,
	def: ProctoringDef,
): { count: string; duration: string | null } {
	const entry =
		summary?.[def.key] ??
		(def.fallbackKey ? summary?.[def.fallbackKey] : undefined);
	const raw = entry?.count != null ? String(entry.count) : "-";
	const seconds = entry?.seconds ?? 0;
	return {
		count: Number(raw) === 0 ? "-" : raw,
		duration:
			def.hasDuration && seconds > 0 ? formatEventSeconds(seconds) : null,
	};
}

/** "Овог Нэр" — хоосон бол "---". */
export function personFullName(
	person:
		| { lastName?: string | null; firstName?: string | null }
		| null
		| undefined,
): string {
	return (
		[person?.lastName, person?.firstName].filter(Boolean).join(" ") || "---"
	);
}

export interface NameOption {
	id: string;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	status?: string | null;
}

/**
 * Staging `z`: нэрсийн жагсаалт (массив эсвэл `{content}`), одоогийн талент байхгүй бол
 * эхэнд нь нэмнэ.
 */
export function mergeNameOptions(
	names:
		| readonly NameOption[]
		| { content?: readonly NameOption[] }
		| null
		| undefined,
	current: NameOption | null | undefined,
): NameOption[] {
	let list: NameOption[] = [];
	if (Array.isArray(names)) list = [...names];
	else if (names && Array.isArray((names as { content?: unknown }).content))
		list = [...((names as { content: NameOption[] }).content ?? [])];
	if (current && !list.some((n) => n.id === current.id)) {
		list = [
			{
				id: current.id,
				firstName: current.firstName,
				lastName: current.lastName,
				status: current.status,
			},
			...list,
		];
	}
	return list;
}

/** Нэрсийн сонголтын текст: "Овог Нэр" → имэйл → id. */
export function nameOptionLabel(option: NameOption): string {
	return (
		[option.lastName, option.firstName].filter(Boolean).join(" ") ||
		option.email ||
		option.id
	);
}

/** Staging `v`: нэрсийн жагсаалтын төлөвийн цэгийн өнгө. */
export function invitationDotClass(status: string | null | undefined): string {
	switch (status) {
		case "COMPLETED":
			return "bg-Semantic-success500";
		case "STARTED":
			return "bg-Semantic-warning500";
		case "PENDING":
			return "bg-[#FFD95C]";
		case "EXPIRED":
			return "bg-Semantic-error500";
		default:
			return "bg-Gray-300";
	}
}

/** Од үнэлгээний товчны идэвх (staging `P`): 0 эсвэл өмнөхтэй ижил бол илгээхгүй. */
export function canSubmitRating(
	selected: number,
	myPoints: number | null | undefined,
	pending: boolean,
): boolean {
	return selected > 0 && selected !== (myPoints ?? 0) && !pending;
}
