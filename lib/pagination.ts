// URL-д хуудас 1-ээс, API (Spring Page)-д 0-ээс эхэлнэ.
// Энэ хөрвүүлэлт ЗӨВХӨН энэ файлаар дамжина.

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

/** UI/URL талын хуудаслалт: `page` 1-ээс эхэлнэ. */
export interface PageParams {
	page: number;
	size: number;
}

/** API талын хуудаслалт: `page` 0-ээс эхэлнэ. */
export interface ApiPageParams {
	page: number;
	size: number;
}

function toPositiveInt(value: string | null): number | undefined {
	if (value === null || !/^\d+$/.test(value)) return undefined;
	const n = Number(value);
	return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

/** `?page=N&size=M` уншина. Буруу/байхгүй утгад анхдагч утга өгнө. */
export function parsePageParams(search: {
	get(name: string): string | null;
}): PageParams {
	const page = toPositiveInt(search.get("page")) ?? 1;
	const size = toPositiveInt(search.get("size"));
	return {
		page,
		size:
			size !== undefined &&
			(PAGE_SIZE_OPTIONS as readonly number[]).includes(size)
				? size
				: DEFAULT_PAGE_SIZE,
	};
}

export function toApiPage(params: PageParams): ApiPageParams {
	return { page: Math.max(0, params.page - 1), size: params.size };
}

/** Spring Page-ийн `number` (0-ээс) → UI хуудас (1-ээс). */
export function fromApiPageNumber(number: number): number {
	return number + 1;
}
