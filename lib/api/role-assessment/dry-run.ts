// Талентийн үнэлгээний DRY-RUN хамгаалалт (docs/role-assessment/DECISIONS.md D4).
//
// Дүрэм (бүх орчинд нэг): RA-ийн бичих хүсэлт (GET/HEAD-ээс бусад) зөвхөн
// NEXT_PUBLIC_RA_ALLOW_WRITES === "1" үед сүлжээнд гарна. Үгүй бол axios adapter
// (lib/api/http.ts) энэ файлын stub-ийг буцаана; proxy (app/api/[...path]/route.ts)
// нь мөн ижил дүрмээр хаана. Dry-run-д үүссэн fake id руу хэзээ ч сүлжээний хүсэлт
// явуулахгүй (flag-аас үл хамаарна).
//
// Цэвэр модуль: зөвхөн `import type`, alias-гүй — `node --test`-ээр шууд тестлэгдэнэ.

/** `NEXT_PUBLIC_*` нь build/dev server асах үед inline болно (утга өөрчлөхөд дахин асаана). */
export function raWritesAllowed(): boolean {
	return process.env.NEXT_PUBLIC_RA_ALLOW_WRITES === "1";
}

export function isRaDryRun(): boolean {
	return !raWritesAllowed();
}

const RA_WRITE_PATHS = [
	/^\/customer\/recruitments\/(new|close|delete)$/,
	/^\/customer\/recruitments\/[^/]+\/rename$/,
	/^\/customer\/recruitment-setup\//,
	/^\/customer\/role-assessments\//,
	/^\/customer\/designs\/RECRUITMENT\//,
	/^\/customer\/hiring-invitations\//,
	/^\/customer\/hiring\//,
];

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** axios `config.url` / proxy path → `/customer/...` (query-гүй, `/api` угтваргүй). */
export function requestPathOf(url: string | undefined): string {
	const path = `/${(url ?? "").split("?")[0].replace(/^\/+/, "")}`;
	return path.replace(/^\/api(?=\/)/, "");
}

export function isRaWriteRequest(method: string, path: string): boolean {
	if (READ_METHODS.has(method.toUpperCase())) return false;
	return RA_WRITE_PATHS.some((re) => re.test(path));
}

// --- Fake id: UUID хэлбэртэй, тогтмол угтвартай (staging-ийн v4 id-тай давхцахгүй) ---

export const DRY_RUN_ID_PREFIX = "00000000-0000-4000-8000-";

export function makeDryRunId(): string {
	const bytes = new Uint8Array(6);
	globalThis.crypto.getRandomValues(bytes);
	return (
		DRY_RUN_ID_PREFIX +
		Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
	);
}

export function isDryRunId(value: string | null | undefined): boolean {
	return typeof value === "string" && value.startsWith(DRY_RUN_ID_PREFIX);
}

export function containsDryRunId(path: string): boolean {
	return path.includes(DRY_RUN_ID_PREFIX);
}

/** Энэ хүсэлтийг сүлжээнд гаргахгүй, stub буцаах эсэх. */
export function shouldDryRun(method: string, path: string): boolean {
	if (containsDryRunId(path)) return true;
	return isRaDryRun() && isRaWriteRequest(method, path);
}

// --- Fake ноорогийн нэр (sessionStorage — зөвхөн нэр, хувийн мэдээлэлгүй) ---

const NAMES_KEY = "ra_dry_run_names";

function readNames(): Record<string, string> {
	try {
		const raw = globalThis.sessionStorage?.getItem(NAMES_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		return parsed && typeof parsed === "object"
			? (parsed as Record<string, string>)
			: {};
	} catch {
		return {};
	}
}

function rememberName(id: string, name: string): void {
	try {
		globalThis.sessionStorage?.setItem(
			NAMES_KEY,
			JSON.stringify({ ...readNames(), [id]: name }),
		);
	} catch {
		// sessionStorage байхгүй (SSR, private горим) — нэр "DRY-RUN" болно
	}
}

// --- Stub ---

export interface DryRunResponse {
	status: number;
	data: unknown;
}

const DRY_RUN_USER = {
	id: "dry-run",
	firstName: "DRY-RUN",
	lastName: "DRY-RUN",
};

/** swagger RestResponseVoid (хэрэглэгчийн заасан хэлбэр: data "ok"). */
const REST_OK = { message: "", status: 200, success: true, data: "ok" };

function field(body: unknown, key: string): unknown {
	return typeof body === "object" && body !== null
		? (body as Record<string, unknown>)[key]
		: undefined;
}

function notFound(path: string): DryRunResponse {
	return {
		status: 404,
		data: {
			type: "about:blank",
			title: "Not Found",
			status: 404,
			detail: "DRY-RUN: энэ мэдээлэл серверт байхгүй",
			instance: path,
			code: "not_found",
		},
	};
}

function emptyPage(): Record<string, unknown> {
	return {
		content: [],
		totalElements: 0,
		totalPages: 0,
		number: 0,
		size: 10,
		first: true,
		last: true,
		empty: true,
		numberOfElements: 0,
	};
}

/** Dry-run id-тай GET (ноорог сервер дээр байхгүй) → wizard-ийн анхны төлөв. */
function readStub(path: string): DryRunResponse {
	const id = path.match(/[0-9a-f-]{36}/)?.[0] ?? "";
	const name = readNames()[id] ?? "DRY-RUN";
	const now = new Date().toISOString();
	if (/^\/customer\/recruitments\/[^/]+$/.test(path)) {
		return {
			status: 200,
			data: {
				id,
				name,
				status: "CREATED",
				createdAt: now,
				createdBy: DRY_RUN_USER,
				count: { total: 0, completed: 0 },
				tests: [],
				customQuestions: [],
			},
		};
	}
	if (/^\/customer\/recruitments\/status\//.test(path)) {
		return {
			status: 200,
			data: { id, name, createdAt: now, status: "CREATED" },
		};
	}
	if (/\/information$/.test(path)) {
		// bundle-derived, unverified: шинэ ноорогийн мэдээлэл (staging CREATED дээр jobDescription null ✅)
		return {
			status: 200,
			data: {
				jobTitle: name,
				jobDescription: null,
				companyName: "",
				companyDescription: null,
			},
		};
	}
	if (/^\/customer\/recruitment-setup\/[^/]+\/(tests|questions)$/.test(path)) {
		return { status: 200, data: [] };
	}
	if (/^\/customer\/designs\/RECRUITMENT\/[^/]+$/.test(path)) {
		// staging ✅ ажигласан утга (PURPLE / TOP_LEFT); showAppLogo — unverified
		return {
			status: 200,
			data: {
				id: 0,
				designOwnerId: id,
				designOwnerType: "RECRUITMENT",
				themeType: "PURPLE",
				imagePosition: "TOP_LEFT",
				showAppLogo: true,
				hasLogo: false,
			},
		};
	}
	if (/^\/customer\/hiring-invitations\/list\//.test(path)) {
		return { status: 200, data: emptyPage() };
	}
	if (/^\/customer\/hiring-invitations\/names\//.test(path)) {
		return { status: 200, data: [] };
	}
	return notFound(path);
}

/** Бичих хүсэлтийн stub — openapi-ийн 200 хариуны хэлбэрээр. */
function writeStub(path: string, body: unknown): DryRunResponse {
	if (path === "/customer/recruitments/new") {
		const id = makeDryRunId();
		const name = field(body, "str");
		if (typeof name === "string") rememberName(id, name);
		return { status: 200, data: id };
	}
	const rename = path.match(/^\/customer\/recruitments\/([^/]+)\/rename$/);
	if (rename) {
		const name = field(body, "str");
		if (isDryRunId(rename[1]) && typeof name === "string") {
			rememberName(rename[1], name);
		}
		return { status: 200, data: "" };
	}
	if (
		/^\/customer\/recruitment-setup\/(publish|[^/]+\/(update-information|set-tests|set-questions))$/.test(
			path,
		) ||
		/\/(remove-logo|rate)$/.test(path)
	) {
		return { status: 200, data: REST_OK };
	}
	if (path === "/customer/role-assessments/recommend") {
		return { status: 200, data: [] };
	}
	if (path === "/customer/hiring-invitations/search-by-email") {
		// "олдсонгүй" — RestResponseTalentEntity, data: null
		return { status: 200, data: { ...REST_OK, data: null } };
	}
	if (path === "/customer/hiring-invitations/invite") {
		return { status: 200, data: makeDryRunId() };
	}
	const extend = path.match(
		/^\/customer\/hiring-invitations\/([^/]+)\/extend$/,
	);
	if (extend) {
		// swagger Talent-ийн дэд хэсэг: хариуг UI ашигладаггүй (📦)
		return {
			status: 200,
			data: { id: extend[1], dueDate: field(body, "value"), status: "PENDING" },
		};
	}
	if (/^\/customer\/hiring-invitations\/[^/]+\/notes\/add$/.test(path)) {
		return {
			status: 200,
			data: {
				id: -Date.now(),
				note: field(body, "str"),
				createdAt: new Date().toISOString(),
				createdBy: DRY_RUN_USER,
			},
		};
	}
	// rename/close/delete/bookmark/upload-logo: 200, body-гүй (string)
	return { status: 200, data: "" };
}

export function buildDryRunResponse(
	method: string,
	path: string,
	body: unknown,
): DryRunResponse {
	return READ_METHODS.has(method.toUpperCase())
		? readStub(path)
		: writeStub(path, body);
}

// --- Log (хувийн мэдээллийг маскална) ---

const EMAIL = /^[^\s@]+@[^\s@]+$/;
const PERSONAL_KEYS = new Set([
	"firstName",
	"lastName",
	"phoneNumber",
	"mobileNo",
]);
const FREE_TEXT_KEYS = new Set([
	"str",
	"note",
	"jobDescription",
	"companyDescription",
]);

function maskText(value: string): string {
	return value ? `${[...value][0]}***` : "";
}

export function maskForLog(value: unknown, key?: string): unknown {
	if (typeof value === "string") {
		if (EMAIL.test(value)) return `${[...value][0]}***@example.com`;
		if (key && PERSONAL_KEYS.has(key)) return maskText(value);
		if (key && FREE_TEXT_KEYS.has(key) && !/^[0-9a-f-]{36}$/.test(value)) {
			return `<${value.length} тэмдэгт>`;
		}
		return value;
	}
	if (Array.isArray(value)) return value.map((v) => maskForLog(v));
	if (typeof FormData !== "undefined" && value instanceof FormData) {
		return Object.fromEntries(
			[...value.entries()].map(([k, v]) => [
				k,
				typeof v === "string"
					? maskForLog(v, k)
					: { name: "<file>", size: v.size, type: v.type },
			]),
		);
	}
	if (typeof value === "object" && value !== null) {
		return Object.fromEntries(
			Object.entries(value).map(([k, v]) => [k, maskForLog(v, k)]),
		);
	}
	return value;
}

export function formatDryRunLog(
	method: string,
	path: string,
	body: unknown,
): string {
	const masked =
		body === undefined ? "" : ` ${JSON.stringify(maskForLog(body))}`;
	return `[RA DRY-RUN] ${method.toUpperCase()} ${path}${masked}`;
}
