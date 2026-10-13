export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export interface PageParams {
	page: number;
	size: number;
}

export interface ApiPageParams {
	page: number;
	size: number;
}

function toPositiveInt(value: string | null): number | undefined {
	if (value === null || !/^\d+$/.test(value)) return undefined;
	const n = Number(value);
	return Number.isSafeInteger(n) && n > 0 ? n : undefined;
}

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

export function fromApiPageNumber(number: number): number {
	return number + 1;
}
