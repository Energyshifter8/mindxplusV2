// `localStorage["ra_draft_{id}"]` — staging-ийн ноорог (📦 wizard + preview):
// - wizard алхам 1-ийн оролт бүрт хадгална, бусад `ra_draft_*`-ийг устгана (нэг л ноорог);
// - update-information амжилттай бол устгана;
// - preview нь энэ ноорогийг серверийн мэдээллээс түрүүлж харуулна;
// - wizard өөрөө (staging) ноорогоос сэргээдэггүй. DRY-RUN-д л сэргээнэ (DECISIONS.md).
// Зөвхөн 4 форм талбар — token, хувийн мэдээлэл хэзээ ч орохгүй.

export interface RecruitmentDraft {
	jobTitle: string;
	jobDescription: string;
	companyName: string;
	companyDescription: string;
}

const PREFIX = "ra_draft_";
const FIELDS = [
	"jobTitle",
	"jobDescription",
	"companyName",
	"companyDescription",
] as const;

function storage(): Storage | null {
	try {
		return typeof window !== "undefined" ? window.localStorage : null;
	} catch {
		return null;
	}
}

export function saveDraft(id: string, draft: RecruitmentDraft): void {
	const ls = storage();
	if (!ls || !id) return;
	try {
		for (const key of Object.keys(ls)) {
			if (key.startsWith(PREFIX) && key !== PREFIX + id) ls.removeItem(key);
		}
		const clean = Object.fromEntries(
			FIELDS.map((f) => [f, String(draft[f] ?? "")]),
		);
		ls.setItem(PREFIX + id, JSON.stringify(clean));
	} catch {
		// дүүрсэн/хаалттай storage — ноорог алгасна
	}
}

export function readDraft(id: string): RecruitmentDraft | null {
	const ls = storage();
	if (!ls || !id) return null;
	try {
		const raw = ls.getItem(PREFIX + id);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return null;
		const p = parsed as Record<string, unknown>;
		const str = (v: unknown) => (typeof v === "string" ? v : "");
		return {
			jobTitle: str(p.jobTitle),
			jobDescription: str(p.jobDescription),
			companyName: str(p.companyName),
			companyDescription: str(p.companyDescription),
		};
	} catch {
		return null;
	}
}

export function clearDraft(id: string): void {
	try {
		storage()?.removeItem(PREFIX + id);
	} catch {
		// алгасна
	}
}
