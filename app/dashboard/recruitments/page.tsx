"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	GridViewIcon,
	ListViewIcon,
	PlusIcon,
	SearchIcon,
	StatBalanceIcon,
	StatCompletedIcon,
	StatInvitedIcon,
} from "@/components/icons/role-assessment";
import { InviteTalentModal } from "@/components/role-assessment/InviteTalentModal";
import { RecruitmentCard } from "@/components/role-assessment/list/RecruitmentCard";
import {
	CreateRecruitmentModal,
	RenameRecruitmentModal,
} from "@/components/role-assessment/list/RecruitmentNameModals";
import { RecruitmentTable } from "@/components/role-assessment/list/RecruitmentTable";
import type { RecruitmentRowHandlers } from "@/components/role-assessment/list/rowActions";
import { RecruitmentDetailDrawer } from "@/components/role-assessment/RecruitmentDetailDrawer";
import {
	AntdSkeleton,
	EmptyIllustration,
	ErrorState,
	SegmentTab,
	SegmentTabs,
	StatCard,
} from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaConfirmDialog } from "@/components/role-assessment/ui/Modal";
import { TextField } from "@/components/role-assessment/ui/TextField";
import { getErrorMessage } from "@/lib/api-errors";
import {
	useCloseRecruitment,
	useCreateRecruitment,
	useDeleteRecruitment,
	useRenameRecruitment,
} from "@/lib/hooks/role-assessment/mutations";
import {
	useRecruitmentList,
	useRecruitmentStats,
} from "@/lib/hooks/role-assessment/queries";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePageParams } from "@/lib/hooks/usePageParams";
import { toApiPage } from "@/lib/pagination";
import { raRoutes } from "@/lib/routes";
import type {
	RecruitmentListItem,
	RecruitmentListParams,
} from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";

// Staging /role-assessment (📦 app/(dashboard)/role-assessment/page). Зөрүү (mismatches.md):
// tab/хайлт URL-д (`status`, `name`) — нэг replace-ээр page=1 болгож давхар хүсэлтгүй;
// хайлт 350мс debounce; алдааг хоосон төлөвтэй андуурахгүй, "Дахин оролдох"-той.

const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_MAX_LENGTH = 100; // swagger: name maxLength 100

type Tab = "ALL" | "CREATED" | "PUBLISHED";
const TABS: { key: Tab; label: string }[] = [
	{ key: "ALL", label: "Бүгд" },
	{ key: "CREATED", label: "Үүссэн" },
	{ key: "PUBLISHED", label: "Идэвхтэй" },
];

function parseTab(value: string | null): Tab {
	return value === "CREATED" || value === "PUBLISHED" ? value : "ALL";
}

export default function RecruitmentsPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<RecruitmentsContent />
		</Suspense>
	);
}

function PageLoading() {
	return (
		<div className="flex items-center justify-center py-20">
			<p className="text-[16px] text-TextColor-third">Ачааллаж байна...</p>
		</div>
	);
}

type Target = { id: string; name: string };

function RecruitmentsContent() {
	const router = useRouter();
	const { page, size, searchParams, setPage, setSize, updateParams } =
		usePageParams();
	const tab = parseTab(searchParams.get("status"));
	const urlName = searchParams.get("name") ?? "";

	const [search, setSearch] = useState(urlName);
	const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
	useEffect(() => {
		if (debouncedSearch !== urlName) {
			updateParams({ name: debouncedSearch || null, page: 1 });
		}
	}, [debouncedSearch, urlName, updateParams]);

	const listParams: RecruitmentListParams = useMemo(
		() => ({
			...toApiPage({ page, size }),
			status: tab === "ALL" ? undefined : tab,
			name: urlName || undefined,
		}),
		[page, size, tab, urlName],
	);
	// Staging: жагсаалтын query statistics-ээс өмнө зарлагдсан (GET дараалал)
	const list = useRecruitmentList(listParams);
	const stats = useRecruitmentStats();
	const rows = list.data?.content ?? [];
	const totalPages = list.data
		? Math.max(
				1,
				list.data.totalPages ??
					Math.ceil((list.data.totalElements ?? 0) / size),
			)
		: 1;

	// Staging: хуудас нийт хуудаснаас хэтэрвэл сүүлийн хуудас руу
	useEffect(() => {
		if (list.data && !list.isFetching && page > totalPages) setPage(totalPages);
	}, [list.data, list.isFetching, page, totalPages, setPage]);

	// Staging: жагсаалтын алдаанд toast
	useEffect(() => {
		if (list.errorUpdatedAt) {
			toast.error("Талентийн үнэлгээний жагсаалт авахад алдаа гарлаа");
		}
	}, [list.errorUpdatedAt]);

	const [view, setView] = useState<"list" | "grid">("list");
	const [createOpen, setCreateOpen] = useState(false);
	const [inviteId, setInviteId] = useState<string | null>(null);
	const [detailTarget, setDetailTarget] = useState<Target | null>(null);
	const [renameTarget, setRenameTarget] = useState<Target | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Target | null>(null);
	const [closeTarget, setCloseTarget] = useState<Target | null>(null);

	const createMutation = useCreateRecruitment();
	const deleteMutation = useDeleteRecruitment();
	const closeMutation = useCloseRecruitment();
	const renameMutation = useRenameRecruitment();

	const toTarget = (row: RecruitmentListItem): Target => ({
		id: row.id,
		name: row.name,
	});
	const handlers: RecruitmentRowHandlers = {
		onDetail: (row) => setDetailTarget(toTarget(row)),
		onInvite: (id) => setInviteId(id),
		onClose: (row) => setCloseTarget(toTarget(row)),
		onDelete: (row) => setDeleteTarget(toTarget(row)),
		onRename: (row) => setRenameTarget(toTarget(row)),
		goEdit: (id) => router.push(raRoutes.wizard(id)),
		goDashboard: (id) => router.push(raRoutes.dashboard(id)),
	};

	return (
		<div className="min-h-screen bg-white pb-10">
			<div className="flex h-[72px] flex-row items-center justify-between gap-3 border-Stroke-600 border-b p-4 md:px-6">
				<h1 className="font-semibold text-[24px] text-TextColor-main leading-[1.4]">
					Талентийн үнэлгээ үүсгэх
				</h1>
				<RaButton
					variant="primary"
					title="Талентийн үнэлгээ үүсгэх"
					onClick={() => setCreateOpen(true)}
					className="w-full sm:w-auto"
					prefixIcon={<PlusIcon />}
				/>
			</div>
			<p className="p-6 text-[14px] text-TextColor-secondary leading-[1.4]">
				Талентийн үнэлгээ үүсгэх
				<span className="ml-2">/</span>
			</p>
			<div className="mx-auto space-y-6 px-4 md:px-6">
				{/* staging `flex gap-4`; <640px дээр босоо (390px-д "Хязгааргүй" картаас халидаг) */}
				<div className="flex flex-col gap-4 sm:flex-row">
					{stats.isFetching ? (
						<AntdSkeleton rows={2} />
					) : (
						<>
							<StatCard
								icon={<StatInvitedIcon />}
								count={stats.data?.totalInvitationCount}
								label="Нийт урьсан талент"
							/>
							<StatCard
								icon={<StatCompletedIcon />}
								count={stats.data?.totalCompletedCount}
								label="Нийт үнэлгээнд оролцсон талент"
							/>
							<StatCard
								icon={<StatBalanceIcon />}
								count={stats.data?.invitationBalance}
								label="Үлдсэн урилгын эрх"
							/>
						</>
					)}
				</div>
				<div className="mb-4 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<SegmentTabs
						label="Төлөвөөр шүүх"
						className="self-stretch md:self-auto"
					>
						{TABS.map((t) => (
							<SegmentTab
								key={t.key}
								label={t.label}
								active={tab === t.key}
								onClick={() =>
									updateParams({
										status: t.key === "ALL" ? null : t.key,
										page: 1,
									})
								}
							/>
						))}
					</SegmentTabs>
					<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
						<TextField
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Хайх"
							aria-label="Талентийн үнэлгээ хайх"
							maxLength={SEARCH_MAX_LENGTH}
							prefixIcon={
								<SearchIcon className="mr-1 size-4 text-TextColor-third" />
							}
							className="!mt-0 h-10 w-full min-w-0 flex-1 rounded-lg border border-Stroke-500 px-4 text-[14px] text-TextColor-main sm:min-w-[200px] md:min-w-[280px]"
							id="search-input"
						/>
						<div className="flex shrink-0 items-center self-stretch rounded-lg bg-Gray-50 p-0.5 sm:min-w-20 sm:self-auto">
							<RaButton
								variant="ghost"
								prefixIcon={<GridViewIcon />}
								ariaLabel="Карт харагдац"
								aria-pressed={view === "grid"}
								onClick={() => setView("grid")}
								className={cn(
									"h-[38px] w-full rounded-md",
									view === "grid"
										? "bg-white text-TextColor-main"
										: "text-TextColor-secondary hover:text-TextColor-main",
								)}
							/>
							<RaButton
								variant="ghost"
								prefixIcon={<ListViewIcon />}
								ariaLabel="Жагсаалт харагдац"
								aria-pressed={view === "list"}
								onClick={() => setView("list")}
								className={cn(
									"h-[38px] w-full rounded-md",
									view === "list"
										? "bg-white text-TextColor-main"
										: "text-TextColor-secondary hover:text-TextColor-main",
								)}
							/>
						</div>
					</div>
				</div>
				{list.isPending ? (
					<PageLoading />
				) : list.isError && !list.data ? (
					<ErrorState
						message={getErrorMessage(
							list.error,
							"Талентийн үнэлгээний жагсаалт авахад алдаа гарлаа",
						)}
						onRetry={() => list.refetch()}
						retrying={list.isFetching}
					/>
				) : rows.length === 0 ? (
					<EmptyIllustration
						title="Талбар хоосон байна."
						description="Танд үүсгэсэн талентийн үнэлгээ байхгүй байна."
					/>
				) : view === "grid" ? (
					<div className="flex flex-wrap justify-start gap-4">
						{rows.map((row) => (
							<RecruitmentCard key={row.id} row={row} handlers={handlers} />
						))}
					</div>
				) : (
					<RecruitmentTable
						rows={rows}
						currentPage={page}
						totalPages={totalPages}
						pageSize={size}
						totalElements={list.data?.totalElements}
						onPageChange={setPage}
						onPageSizeChange={setSize}
						handlers={handlers}
					/>
				)}
			</div>

			<CreateRecruitmentModal
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				pending={createMutation.isPending}
				onCreate={(name) =>
					createMutation.mutate(name, {
						onSuccess: (id) => {
							setCreateOpen(false);
							router.push(raRoutes.wizard(id));
						},
					})
				}
			/>
			{inviteId && (
				<InviteTalentModal
					open
					onClose={() => setInviteId(null)}
					recruitmentId={inviteId}
				/>
			)}
			<RenameRecruitmentModal
				target={renameTarget}
				onClose={() => setRenameTarget(null)}
				pending={renameMutation.isPending}
				onRename={(vars) =>
					renameMutation.mutate(vars, {
						onSuccess: () => setRenameTarget(null),
					})
				}
			/>
			<RaConfirmDialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => {
					if (deleteTarget) {
						deleteMutation.mutate(deleteTarget.id, {
							onSuccess: () => setDeleteTarget(null),
						});
					}
				}}
				width={480}
				title="Талентийн үнэлгээг устгахдаа итгэлтэй байна уу?"
				description="Устгасаны дараа мэдээллийг дахин сэргээх боломжгүй болно. Та устгах уу?"
				confirmLabel="Устгах"
				pendingLabel="Устгаж байна..."
				loading={deleteMutation.isPending}
			/>
			<RaConfirmDialog
				open={closeTarget !== null}
				onClose={() => setCloseTarget(null)}
				onConfirm={() => {
					if (closeTarget) {
						closeMutation.mutate(closeTarget.id, {
							onSuccess: () => setCloseTarget(null),
						});
					}
				}}
				title="Талентийн үнэлгээг хаахдаа итгэлтэй байна уу?"
				description="Хаасны дараа талентуудад урилга илгээх боломжгүй болно. Та хаах уу?"
				confirmLabel="Хаах"
				pendingLabel="Хааж байна..."
				loading={closeMutation.isPending}
			/>
			<RecruitmentDetailDrawer
				recruitment={detailTarget}
				onClose={() => setDetailTarget(null)}
			/>
		</div>
	);
}
