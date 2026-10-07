"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SearchIcon } from "@/components/icons/role-assessment";
import {
	AntdSkeleton,
	ErrorState,
} from "@/components/role-assessment/ui/Basics";
import { RaPagination } from "@/components/role-assessment/ui/Pagination";
import { RaSelect } from "@/components/role-assessment/ui/Select";
import { TextField } from "@/components/role-assessment/ui/TextField";
import { getErrorMessage } from "@/lib/api-errors";
import { useToggleTalentBookmark } from "@/lib/hooks/role-assessment/mutations";
import { useTalentList } from "@/lib/hooks/role-assessment/queries";
import {
	RA_TITLES,
	useDocumentTitle,
} from "@/lib/hooks/role-assessment/useDocumentTitle";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePageParams } from "@/lib/hooks/usePageParams";
import { toApiPage } from "@/lib/pagination";
import { clampPage, toTalentCard } from "@/lib/role-assessment/talents";
import { raRoutes } from "@/lib/routes";
import type { TalentListParams } from "@/lib/types/role-assessment";
import { TalentCard } from "./TalentCard";

// Staging /invited-talents (📦 module 62002). GET /customer/hiring-invitations/talents
// `page,size,q,marked`. Зөрүү (mismatches.md): хайлт/шүүлт URL-д (`q`, `marked`);
// алдааны төлөв тусдаа.

const TITLE = "Миний урьсан талентууд";
const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_MAX_LENGTH = 100;

type Filter = "all" | "marked";
const FILTER_OPTIONS: { value: Filter; label: string }[] = [
	{ value: "all", label: "Бүгд" },
	{ value: "marked", label: "Хадгалсан" },
];

function EmptyTalents() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="mx-auto flex min-h-[480px] w-full max-w-[1046px] flex-col items-center justify-center gap-0.5 rounded-2xl p-6"
		>
			<Image
				src="/images/role-assessment/invited-talents-empty.svg"
				alt=""
				width={160}
				height={160}
				className="size-[160px] shrink-0"
			/>
			<p className="mt-2 max-w-[540px] text-center font-bold text-[20px] text-TextColor-secondary leading-6">
				Талбар хоосон байна.
			</p>
			<p className="max-w-[540px] text-center font-normal text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]">
				Одоогоор таньд урьсан талентууд байхгүй байна.
			</p>
		</div>
	);
}

export function InvitedTalentsList() {
	useDocumentTitle(RA_TITLES.talents);
	const router = useRouter();
	const { page, size, searchParams, setPage, setSize, updateParams } =
		usePageParams();
	const urlQuery = searchParams.get("q") ?? "";
	const filter: Filter =
		searchParams.get("marked") === "true" ? "marked" : "all";

	const [search, setSearch] = useState(urlQuery);
	const debounced = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
	useEffect(() => {
		if (debounced !== urlQuery) updateParams({ q: debounced || null, page: 1 });
	}, [debounced, urlQuery, updateParams]);

	const params: TalentListParams = useMemo(
		() => ({
			...toApiPage({ page, size }),
			q: urlQuery || undefined,
			marked: filter === "marked" || undefined,
		}),
		[page, size, urlQuery, filter],
	);
	const list = useTalentList(params);
	const bookmark = useToggleTalentBookmark();

	const content = list.data?.content;
	const cards = useMemo(() => (content ?? []).map(toTalentCard), [content]);
	const totalElements = list.data?.totalElements ?? cards.length;
	const totalPages = list.data
		? Math.max(1, list.data.totalPages ?? Math.ceil(totalElements / size))
		: 1;

	// Staging: хуудас хэтэрвэл сүүлийн хуудас руу
	useEffect(() => {
		if (list.data && !list.isFetching && page > totalPages) {
			setPage(clampPage(page, totalPages));
		}
	}, [list.data, list.isFetching, page, totalPages, setPage]);

	// Staging: алдаанд toast
	useEffect(() => {
		if (list.errorUpdatedAt) {
			toast.error(getErrorMessage(list.error, "Жагсаалт авахад алдаа гарлаа"));
		}
	}, [list.errorUpdatedAt, list.error]);

	return (
		<div className="min-h-screen bg-white pb-10 font-sf">
			<header className="flex h-[72px] items-center border-Stroke-600 border-b px-4 md:px-6">
				<div className="mx-auto w-full">
					<h1 className="font-semibold text-[24px] text-TextColor-main leading-[1.4]">
						{TITLE}
					</h1>
				</div>
			</header>
			<div className="px-4 pt-6 md:px-6">
				<nav
					aria-label="Замын заалт"
					className="mb-6 font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]"
				>
					{TITLE}
				</nav>
				<div className="mb-6 flex justify-end">
					<div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
						<div className="relative w-full sm:w-[200px]">
							<TextField
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Хайх"
								aria-label="Талент хайх"
								maxLength={SEARCH_MAX_LENGTH}
								prefixIcon={
									<SearchIcon className="mr-1 size-4 shrink-0 text-TextColor-third" />
								}
								className="!mt-0 h-10 w-full rounded-lg border border-Stroke-500 px-4 text-[14px] text-TextColor-main"
								id="talent-search"
							/>
						</div>
						<RaSelect
							ariaLabel="Шүүлтүүр"
							value={filter}
							onChange={(next) =>
								updateParams({
									marked: next === "marked" ? "true" : null,
									page: 1,
								})
							}
							options={FILTER_OPTIONS}
							triggerClassName="h-9 w-full shrink-0 border-Stroke-600 font-sf text-sm sm:w-[100px]"
						/>
					</div>
				</div>
			</div>
			<div className="px-4 pb-6 md:px-6">
				{list.isPending ? (
					<AntdSkeleton className="mt-4" rows={3} />
				) : list.isError ? (
					<ErrorState
						message={getErrorMessage(
							list.error,
							"Жагсаалт авахад алдаа гарлаа",
						)}
						onRetry={() => list.refetch()}
						retrying={list.isFetching}
					/>
				) : cards.length === 0 ? (
					<EmptyTalents />
				) : (
					<Tooltip.Provider delay={0}>
						<div className="col-span-3 flex flex-col gap-4 sm:grid md:grid-cols-2 lg:grid-cols-3">
							{cards.map((card, index) => (
								<TalentCard
									key={card.talentId || `talent-${index}`}
									talent={card}
									onView={() =>
										card.talentId && router.push(raRoutes.talent(card.talentId))
									}
									onToggleMark={() =>
										bookmark.mutate(Number.parseInt(card.talentId, 10))
									}
									marking={
										bookmark.isPending &&
										String(bookmark.variables) === card.talentId
									}
								/>
							))}
						</div>
						{totalElements > 0 && (
							<div className="mt-8 items-stretch">
								<RaPagination
									currentPage={page}
									totalPages={totalPages}
									onPageChange={setPage}
									pageSize={size}
									onPageSizeChange={setSize}
								/>
							</div>
						)}
					</Tooltip.Provider>
				)}
			</div>
		</div>
	);
}
