// Wizard-ийн алхам шилжих, төлөв харуулах дүрэм — staging `app/(editor)/role-assessment/[id]`
// (📦 bundle, `ei` component) -ийг шууд хөрвүүлсэн цэвэр функцүүд. alias-гүй (node --test).

export type WizardStep = 1 | 2 | 3 | 4;

export const WIZARD_STEPS: readonly {
	number: WizardStep;
	label: string;
	title: string;
}[] = [
	{ number: 1, label: "АЛХАМ 1", title: "Мэдээлэл оруулах" },
	{ number: 2, label: "АЛХАМ 2", title: "Тест сонгох" },
	{ number: 3, label: "АЛХАМ 3", title: "Нэмэлт асуулт сонгох" },
	{ number: 4, label: "АЛХАМ 4", title: "Баталгаажуулах" },
];

export interface InfoForm {
	jobTitle: string;
	jobDescription: string;
	companyName: string;
	companyDescription: string;
}

export interface ServerInfo {
	jobTitle?: string | null;
	jobDescription?: string | null;
	companyName?: string | null;
	companyDescription?: string | null;
}

const t = (v: string | null | undefined) => (v ?? "").trim();

/** `eR`: сервер дээрх мэдээлэл (нэр, тайлбар, компанийн нэр) бөглөгдсөн эсэх. */
export function isInfoComplete(info: ServerInfo | null | undefined): boolean {
	return Boolean(
		info && t(info.jobTitle) && t(info.jobDescription) && t(info.companyName),
	);
}

/** `eO`: бөглөгдсөн мэдээллийг формд өөрчилсөн эсэх (хадгалаагүй өөрчлөлт). */
export function isInfoDirty(
	form: InfoForm,
	info: ServerInfo | null | undefined,
): boolean {
	if (!isInfoComplete(info) || !info) return false;
	return (
		t(form.jobTitle) !== t(info.jobTitle) ||
		t(form.jobDescription) !== t(info.jobDescription) ||
		t(form.companyName) !== t(info.companyName) ||
		t(form.companyDescription) !== (t(info.companyDescription) || "")
	);
}

/** `eJ`/`eX`: сонголт серверийнхээс өөр эсэх. */
export function isSelectionDirty<T>(
	selected: readonly T[],
	server: readonly T[] | undefined,
): boolean {
	if (server && server.length !== 0) {
		return (
			selected.length !== server.length ||
			!selected.every((id) => server.includes(id))
		);
	}
	return selected.length > 0;
}

/** Алхам 1-ийн "Үргэлжлүүлэх" идэвхжих нөхцөл (staging: гурвуулаа хоосон биш). */
export function isInfoFormFilled(form: InfoForm): boolean {
	return Boolean(
		t(form.jobTitle) && t(form.jobDescription) && t(form.companyName),
	);
}

export interface WizardState {
	step: WizardStep;
	/** PUBLISHED (staging `eH`) — бид CREATED-ээс бусад бүх статусыг унших горимд оруулна */
	readOnly: boolean;
	/** CREATED (`eB`) */
	isCreated: boolean;
	infoComplete: boolean;
	infoDirty: boolean;
	testsDirty: boolean;
	questionsDirty: boolean;
	/** Сонгосон тестүүд (`R`) ба тэдгээрийн өгөгдөл ачаалагдсан эсэх (`eV`) */
	selectedTestCount: number;
	hasSelectedTestData: boolean;
	/** `eF` */
	hasSelectedQuestionData: boolean;
	serverTestCount: number;
	serverQuestionCount: number;
}

export type StepNavResult =
	| { kind: "go"; step: WizardStep }
	| { kind: "warn"; message: string }
	| { kind: "stay" };

/** Баруун самбарын алхам дээр дарахад (staging Steps onChange). */
export function stepNavigation(
	target: WizardStep,
	s: WizardState,
): StepNavResult {
	const { step, readOnly } = s;
	if (target > 1 && !s.infoComplete && !readOnly) return { kind: "stay" };
	if (target === 3 && step === 2 && s.selectedTestCount === 0 && !readOnly) {
		return { kind: "warn", message: "Тест сонгоно уу" };
	}
	const leavingDirtyForward =
		(step === 1 && s.infoDirty && target > 1) ||
		(step === 2 && s.testsDirty && target > 2) ||
		(step === 3 && s.questionsDirty && target > 3);
	if (!readOnly && leavingDirtyForward) return { kind: "stay" };
	const completed = step > target;
	const allowed =
		readOnly ||
		(s.isCreated && target === 2 && s.hasSelectedTestData) ||
		(s.isCreated &&
			target === 3 &&
			s.hasSelectedQuestionData &&
			s.selectedTestCount > 0) ||
		completed ||
		target === step ||
		(target === step + 1 && s.infoComplete);
	return allowed ? { kind: "go", step: target } : { kind: "stay" };
}

export type StepStatus = "finish" | "process" | "wait";

export interface StepView {
	status: StepStatus;
	/** "Болсон" (ногоон) | "Хийж байна" | null */
	badge: "done" | "doing" | null;
}

/** Баруун самбарын алхмын харагдац (staging `o`, `a` тооцоо). */
export function rightStepView(number: WizardStep, s: WizardState): StepView {
	const current = s.step === number;
	const completed = s.step > number;
	const dirty = current
		? number === 1
			? s.infoDirty
			: number === 2
				? s.testsDirty
				: number === 3
					? s.questionsDirty
					: false
		: false;
	const done =
		s.readOnly ||
		(s.isCreated && number === 2 && s.hasSelectedTestData && !dirty) ||
		(s.isCreated && number === 3 && s.hasSelectedQuestionData && !dirty) ||
		(number === 1 && s.infoComplete && !dirty) ||
		(number === 2 && !s.testsDirty && s.serverTestCount > 0) ||
		(number === 3 && !s.questionsDirty && s.serverQuestionCount > 0);
	const badge: StepView["badge"] =
		done && !dirty
			? "done"
			: current && dirty
				? "doing"
				: current && !done
					? "doing"
					: completed
						? "done"
						: null;
	const status: StepStatus = done
		? "finish"
		: completed && !current
			? "finish"
			: current
				? "process"
				: "wait";
	return { status, badge };
}

/** Дээд stepper: дууссан (одоогийнхоос бусад) → finish, одоогийн → process. */
export function topStepStatus(
	number: WizardStep,
	step: WizardStep,
): StepStatus {
	if (step > number) return "finish";
	return step === number ? "process" : "wait";
}

/** "Үргэлжлүүлэх" / "Нийтлэх" disabled эсэх. */
export function continueDisabled(s: {
	step: WizardStep;
	readOnly: boolean;
	publishing: boolean;
	infoFilled: boolean;
	selectedTestCount: number;
}): boolean {
	return (
		s.readOnly ||
		s.publishing ||
		(s.step === 1 && !s.infoFilled) ||
		(s.step === 2 && s.selectedTestCount === 0)
	);
}

/** Тестийн "min-max" хугацааны нийлбэр (staging `tm`: "a-b" эсвэл "a"). */
export function sumDurations(durations: readonly string[]): {
	min: number;
	max: number;
} {
	return durations.reduce(
		(acc, d) => {
			const [a, b] = d.split("-");
			return {
				min: acc.min + (Number.parseInt(a, 10) || 0),
				max: acc.max + (Number.parseInt(b ?? a, 10) || 0),
			};
		},
		{ min: 0, max: 0 },
	);
}

/** Нэмэлт асуулт бүрт 2–5 мин нэмнэ (staging алхам 3, 4). */
export function withQuestionTime(
	total: { min: number; max: number },
	questionCount: number,
): { min: number; max: number } {
	return {
		min: total.min + 2 * questionCount,
		max: total.max + 5 * questionCount,
	};
}

/** Каталогийн "min-max" хугацаа (staging: тест "", асуулт "1-2" анхдагч). */
export function durationLabel(
	minMinutes: number | null | undefined,
	maxMinutes: number | null | undefined,
	fallback = "",
): string {
	if (minMinutes && maxMinutes) return `${minMinutes}-${maxMinutes}`;
	if (minMinutes) return `${minMinutes}`;
	if (maxMinutes) return `${maxMinutes}`;
	return fallback;
}

/** Сонголтыг toggle хийх (хязгаартай). Буцаах утга нь шинэ жагсаалт эсвэл "limit". */
export function toggleSelection<T>(
	selected: readonly T[],
	id: T,
	max: number,
): T[] | "limit" {
	if (selected.includes(id)) return selected.filter((x) => x !== id);
	if (selected.length >= max) return "limit";
	return [...selected, id];
}

// --- Каталогийн view model (staging `select` хөрвүүлэлт) ---

export interface CategoryOption {
	key: string;
	label: string;
}

/** `[{key:"", label:"Бүгд"}, ...]` — staging ангиллын tab. */
export function toCategoryOptions(
	categories: readonly { id?: string; name?: string }[] | undefined,
): CategoryOption[] {
	return [
		{ key: "", label: "Бүгд" },
		...(categories ?? []).map((c) => ({
			key: c.id || c.name || "",
			label: c.name || "",
		})),
	];
}

export interface WizardTest {
	id: string;
	/** Ангиллын key (label-аар хайж олно) */
	category: string;
	categoryLabel: string;
	title: string;
	description: string;
	questions: number;
	duration: string;
	color: string;
}

export function toWizardTest(
	t: {
		id: string;
		name?: string;
		description?: string;
		category?: string;
		questionCount?: number;
		minMinutes?: number;
		maxMinutes?: number;
		color?: string;
	},
	categories: readonly CategoryOption[],
): WizardTest {
	return {
		id: t.id,
		category: categories.find((c) => c.label === t.category)?.key ?? "",
		categoryLabel: t.category ?? "",
		title: t.name ?? "",
		description: t.description ?? "",
		questions: t.questionCount ?? 0,
		duration: durationLabel(t.minMinutes, t.maxMinutes),
		color: t.color || "GREEN",
	};
}

export interface WizardQuestion {
	id: number;
	category: string;
	categoryLabel: string;
	text: string;
	duration: string;
	description: string;
}

export function toWizardQuestion(
	q: {
		id: number;
		content?: string;
		description?: string;
		category?: string;
		minMinutes?: number;
		maxMinutes?: number;
	},
	categories: readonly CategoryOption[],
): WizardQuestion {
	const label = q.category ?? "";
	return {
		id: q.id,
		category: categories.find((c) => c.label === label)?.key ?? "",
		categoryLabel: label,
		text: q.content ?? "",
		duration: durationLabel(q.minMinutes, q.maxMinutes, "1-2"),
		description: q.description ?? "",
	};
}

/** id-аар давхардлыг хасна (эхнийхийг үлдээнэ). */
export function uniqueById<T extends { id: string | number }>(
	items: readonly T[],
): T[] {
	const seen = new Set<string | number>();
	const result: T[] = [];
	for (const item of items) {
		if (seen.has(item.id)) continue;
		seen.add(item.id);
		result.push(item);
	}
	return result;
}

/** Сонголтын дарааллаар өгөгдлийг эрэмбэлнэ (олдоогүйг хасна). */
export function orderByIds<T extends { id: string | number }>(
	ids: readonly (string | number)[],
	pool: readonly T[],
): T[] {
	return ids
		.map((id) => pool.find((item) => item.id === id))
		.filter((item): item is T => item !== undefined);
}
