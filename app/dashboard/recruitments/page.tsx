"use client";

import {
	BarChart3,
	Info,
	LayoutGrid,
	List,
	Pencil,
	Plus,
	Search,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { KebabMenu, type KebabMenuItem } from "@/components/shared/KebabMenu";
import {
	EmptyState,
	ErrorState,
	GridTexture,
	MiniStatCard,
	RecruitmentStatusBadge,
	TableSkeleton,
} from "@/components/shared/ListComponents";
import { Paginator } from "@/components/shared/Paginator";
import { getErrorMessage } from "@/lib/api-errors";
import type { RecruitmentStatus } from "@/lib/constants/roleAssessment";
import { formatDate, formatDateTime } from "@/lib/format";
import {
	useRecruitmentList,
	useRecruitmentStats,
} from "@/lib/hooks/role-assessment/queries";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePageParams } from "@/lib/hooks/usePageParams";
import { toApiPage } from "@/lib/pagination";
import type {
	RecruitmentListItem,
	RecruitmentListParams,
} from "@/lib/types/role-assessment";

const CreateRecruitmentModal = lazy(
	() => import("@/components/recruitments/CreateRecruitmentModal"),
);
const RecruitmentDetailDrawer = lazy(
	() => import("@/components/recruitments/RecruitmentDetailDrawer"),
);

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;

const SEARCH_DEBOUNCE_MS = 350;
// swagger: GET /customer/recruitments/ ?name maxLength=100
const SEARCH_MAX_LENGTH = 100;
// bundle-derived, unverified: staging үлдэгдэл ≥ 10000 бол "Хязгааргүй" гэж харуулдаг
const UNLIMITED_BALANCE_THRESHOLD = 10_000;

function formatBalance(value: number | undefined | null): string {
	if (value === undefined || value === null) return "—";
	if (!Number.isFinite(value) || value >= UNLIMITED_BALANCE_THRESHOLD)
		return "Хязгааргүй";
	return String(value);
}

// Staging-ийн адил: "Хаагдсан" tab байхгүй, CLOSED нь "Бүгд" дотор харагдана
type FilterTab = "ALL" | Extract<RecruitmentStatus, "CREATED" | "PUBLISHED">;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
	{ key: "ALL", label: "Бүгд" },
	{ key: "CREATED", label: "Үүссэн" },
	{ key: "PUBLISHED", label: "Идэвхтэй" },
];

function parseTab(value: string | null): FilterTab {
	return value === "CREATED" || value === "PUBLISHED" ? value : "ALL";
}

function editPath(id: string) {
	return `/dashboard/recruitments/${id}/edit`;
}

/** Нэг үнэлгээний dashboard (staging: /role-assessment/{id}/dashboard) */
function dashboardPath(id: string) {
	return `/dashboard/recruitments/${id}/results`;
}

/** Staging: CREATED → wizard, бусад → dashboard */
function rowPath(row: RecruitmentListItem) {
	return row.status === "CREATED" ? editPath(row.id) : dashboardPath(row.id);
}

function getRecruitmentKebabItems(
	row: RecruitmentListItem,
	router: ReturnType<typeof useRouter>,
	onShowDetail: (id: string) => void,
): KebabMenuItem[] {
	const detailItem: KebabMenuItem = {
		label: "Дэлгэрэнгүй",
		icon: <Info size={11} />,
		onClick: () => onShowDetail(row.id),
	};

	// Устгах / нэр солих (ФАЗ 7), урих (ФАЗ 5), хаах (ФАЗ 7) хараахан байхгүй
	if (row.status === "CREATED") {
		return [
			detailItem,
			{
				label: "Засах",
				icon: <Pencil size={11} />,
				onClick: () => router.push(editPath(row.id)),
			},
		];
	}
	return [
		{
			label: "Үр дүн",
			icon: <BarChart3 size={11} />,
			onClick: () => router.push(dashboardPath(row.id)),
		},
		detailItem,
	];
}

export default function RecruitmentsPage() {
	return (
		<Suspense
			fallback={
				<div className="p-6 lg:p-10">
					<TableSkeleton columnCount={8} />
				</div>
			}
		>
			<RecruitmentsPageContent />
		</Suspense>
	);
}

function RecruitmentsPageContent() {
	const router = useRouter();
	const { page, size, searchParams, setPage, setSize, updateParams } =
		usePageParams();
	const activeTab = parseTab(searchParams.get("status"));
	const appliedSearch = (searchParams.get("name") ?? "").trim();

	const [searchInput, setSearchInput] = useState(appliedSearch);
	const debouncedSearch = useDebouncedValue(
		searchInput.trim(),
		SEARCH_DEBOUNCE_MS,
	);
	const [viewMode, setViewMode] = useState<"table" | "grid">("table");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [detailId, setDetailId] = useState<string | null>(null);

	// Debounce дууссаны дараа URL-ийг шинэчилнэ; хайлт өөрчлөгдвөл 1-р хуудас
	const lastAppliedSearch = useRef(debouncedSearch);
	useEffect(() => {
		if (lastAppliedSearch.current === debouncedSearch) return;
		lastAppliedSearch.current = debouncedSearch;
		updateParams({ name: debouncedSearch || null, page: 1 });
	}, [debouncedSearch, updateParams]);

	const listParams: RecruitmentListParams = {
		...toApiPage({ page, size }),
		...(activeTab !== "ALL" ? { status: activeTab } : {}),
		...(appliedSearch ? { name: appliedSearch } : {}),
	};

	const statsQuery = useRecruitmentStats();
	const listQuery = useRecruitmentList(listParams);

	const pageData = listQuery.data;
	const rows: RecruitmentListItem[] = pageData?.content ?? [];
	const rowOffset = pageData ? pageData.number * pageData.size : 0;
	const hasFilter = activeTab !== "ALL" || appliedSearch !== "";

	// page > totalPages (жишээ нь сүүлийн хуудас хоосорсон) бол сүүлийн хуудас руу
	useEffect(() => {
		if (!pageData || listQuery.isPlaceholderData) return;
		const lastPage = Math.max(1, pageData.totalPages);
		if (page > lastPage) setPage(lastPage);
	}, [pageData, listQuery.isPlaceholderData, page, setPage]);

	function handleTabChange(tab: FilterTab) {
		updateParams({ status: tab === "ALL" ? null : tab, page: 1 });
	}

	const stats = statsQuery.data;

	return (
		<div className="min-h-full w-full">
			<div className="p-6 lg:p-10">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<div
							className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2"
							style={MONO}
						>
							<button
								type="button"
								className="hover:text-primary cursor-pointer transition-colors"
								onClick={() => router.push("/dashboard")}
							>
								Хяналтын самбар
							</button>
							<span className="mx-2">/</span>
							<span className="text-foreground">Талентийн үнэлгээ</span>
						</div>
						<h1
							className="font-black uppercase leading-none text-foreground text-[clamp(1.5rem,4vw,2.5rem)]"
							style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
						>
							Талентийн үнэлгээ
						</h1>
					</div>
					<button
						type="button"
						onClick={() => setShowCreateModal(true)}
						className="flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
						style={MONO}
					>
						<Plus size={14} />
						Талентийн үнэлгээ үүсгэх
					</button>
				</div>

				{/* Stat Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<MiniStatCard
						label="Нийт урьсан талент"
						value={String(stats?.totalInvitationCount ?? "")}
						icon={<Users size={14} />}
						isLoading={statsQuery.isLoading}
						isError={statsQuery.isError}
					/>
					<MiniStatCard
						label="Нийт үнэлгээнд оролцсон талент"
						value={String(stats?.totalCompletedCount ?? "")}
						icon={<Zap size={14} />}
						isLoading={statsQuery.isLoading}
						isError={statsQuery.isError}
					/>
					<MiniStatCard
						label="Үлдсэн урилгын эрх"
						value={formatBalance(stats?.invitationBalance)}
						icon={<Users size={14} />}
						isLoading={statsQuery.isLoading}
						isError={statsQuery.isError}
					/>
				</div>

				{/* Filter Tabs + Search + View Toggle */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-1 border-2 border-border p-1">
						{FILTER_TABS.map((tab) => (
							<button
								type="button"
								key={tab.key}
								aria-pressed={activeTab === tab.key}
								onClick={() => handleTabChange(tab.key)}
								className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all duration-150 ${
									activeTab === tab.key
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								}`}
								style={MONO}
							>
								{tab.label}
							</button>
						))}
					</div>

					<div className="flex items-center gap-3">
						<div className="relative">
							<Search
								size={14}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								type="text"
								aria-label="Нэрээр хайх"
								placeholder="Нэрээр хайх..."
								value={searchInput}
								maxLength={SEARCH_MAX_LENGTH}
								onChange={(e) => setSearchInput(e.target.value)}
								className="pl-9 pr-4 py-2 text-[11px] uppercase tracking-wider border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
								style={MONO}
							/>
						</div>
						<div className="flex border-2 border-border">
							<button
								type="button"
								aria-label="Хүснэгтээр харах"
								aria-pressed={viewMode === "table"}
								onClick={() => setViewMode("table")}
								className={`p-2 transition-colors ${
									viewMode === "table"
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								}`}
							>
								<List size={14} />
							</button>
							<button
								type="button"
								aria-label="Картаар харах"
								aria-pressed={viewMode === "grid"}
								onClick={() => setViewMode("grid")}
								className={`p-2 transition-colors ${
									viewMode === "grid"
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								}`}
							>
								<LayoutGrid size={14} />
							</button>
						</div>
					</div>
				</div>

				{/* Table / Grid */}
				<div className="border-2 border-border bg-card overflow-hidden">
					{listQuery.isLoading ? (
						<TableSkeleton columnCount={8} />
					) : listQuery.isError ? (
						<ErrorState
							text={getErrorMessage(
								listQuery.error,
								"Талентийн үнэлгээний жагсаалт авахад алдаа гарлаа",
							)}
							onRetry={() => listQuery.refetch()}
							isRetrying={listQuery.isFetching}
						/>
					) : rows.length === 0 ? (
						<EmptyState
							text={
								hasFilter
									? "Тохирох талентийн үнэлгээ олдсонгүй"
									: "Талентийн үнэлгээ байхгүй байна"
							}
						/>
					) : (
						<>
							<div
								className={`transition-opacity ${listQuery.isPlaceholderData ? "opacity-60" : ""}`}
							>
								{viewMode === "table" ? (
									<RecruitmentTable
										rows={rows}
										rowOffset={rowOffset}
										router={router}
										onShowDetail={setDetailId}
									/>
								) : (
									<RecruitmentGrid
										rows={rows}
										router={router}
										onShowDetail={setDetailId}
									/>
								)}
							</div>
							<Paginator
								page={page}
								totalPages={pageData?.totalPages ?? 0}
								totalElements={pageData?.totalElements ?? 0}
								size={size}
								onPageChange={setPage}
								onSizeChange={setSize}
							/>
						</>
					)}
				</div>
			</div>

			{showCreateModal && (
				<Suspense fallback={null}>
					<CreateRecruitmentModal onClose={() => setShowCreateModal(false)} />
				</Suspense>
			)}

			{detailId && (
				<Suspense fallback={null}>
					<RecruitmentDetailDrawer
						recruitmentId={detailId}
						onClose={() => setDetailId(null)}
					/>
				</Suspense>
			)}
		</div>
	);
}

interface RowsProps {
	rows: RecruitmentListItem[];
	router: ReturnType<typeof useRouter>;
	onShowDetail: (id: string) => void;
}

function RowActionButton({
	row,
	router,
	compact,
}: {
	row: RecruitmentListItem;
	router: ReturnType<typeof useRouter>;
	compact?: boolean;
}) {
	if (row.status === "CREATED") {
		return compact ? (
			<button
				type="button"
				onClick={() => router.push(editPath(row.id))}
				className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
				title="Засах"
				aria-label="Засах"
			>
				<Pencil size={13} />
			</button>
		) : (
			<button
				type="button"
				onClick={() => router.push(editPath(row.id))}
				className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
				style={MONO}
			>
				<Pencil size={11} />
				Засах
			</button>
		);
	}

	return compact ? (
		<button
			type="button"
			onClick={() => router.push(dashboardPath(row.id))}
			className="flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
			style={MONO}
		>
			<BarChart3 size={12} />
			Үр дүн
		</button>
	) : (
		<button
			type="button"
			onClick={() => router.push(dashboardPath(row.id))}
			className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
			style={MONO}
		>
			<BarChart3 size={11} />
			Үр дүн
		</button>
	);
}

const TABLE_COLUMNS = [
	{ key: "no", label: "№", width: "40px" },
	{ key: "name", label: "Нэр" },
	{ key: "status", label: "Төлөв", width: "100px" },
	{ key: "invited", label: "Урьсан", width: "70px" },
	{ key: "completed", label: "Дууссан", width: "80px" },
	{ key: "created", label: "Үүсгэсэн", width: "140px" },
	{ key: "closed", label: "Хаагдсан", width: "110px" },
	{ key: "actions", label: "", width: "130px" },
];

function RecruitmentTable({
	rows,
	rowOffset,
	router,
	onShowDetail,
}: RowsProps & { rowOffset: number }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left" style={{ minWidth: "100%" }}>
				<thead>
					<tr className="border-b-2 border-border">
						{TABLE_COLUMNS.map((col) => (
							<th
								key={col.key}
								className="py-2.5 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap"
								style={{ ...MONO, width: col.width }}
							>
								{col.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr
							key={row.id}
							className="border-b border-border/50 hover:border-l-2 hover:border-l-primary transition-colors duration-100 group"
						>
							<td
								className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
								style={MONO}
							>
								{rowOffset + i + 1}
							</td>
							<td
								className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap max-w-[200px] truncate"
								style={MONO}
							>
								<button
									type="button"
									onClick={() => router.push(rowPath(row))}
									title={row.name}
									className="max-w-full truncate text-left hover:text-primary transition-colors"
								>
									{row.name}
								</button>
							</td>
							<td className="py-3 px-3">
								<RecruitmentStatusBadge status={row.status} />
							</td>
							<td
								className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
								style={MONO}
							>
								{row.totalInvitationCount}
							</td>
							<td
								className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
								style={MONO}
							>
								{row.completedInvitationCount}
							</td>
							<td
								className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
								style={MONO}
							>
								{formatDateTime(row.createdAt)}
							</td>
							<td
								className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
								style={MONO}
							>
								{formatDate(row.closedAt)}
							</td>
							<td className="py-3 px-3">
								<div className="flex items-center gap-1.5">
									<RowActionButton row={row} router={router} compact />
									<KebabMenu
										items={getRecruitmentKebabItems(row, router, onShowDetail)}
									/>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function RecruitmentGrid({ rows, router, onShowDetail }: RowsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
			{rows.map((row) => (
				<div
					key={row.id}
					className="border-2 border-border bg-background p-5 hover:border-primary transition-colors duration-150 group relative overflow-hidden"
				>
					<GridTexture />
					<div className="relative z-10">
						<div className="flex items-start justify-between mb-3">
							<button
								type="button"
								onClick={() => router.push(rowPath(row))}
								title={row.name}
								className="text-sm font-bold text-foreground uppercase leading-tight truncate max-w-[180px] text-left hover:text-primary transition-colors"
								style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
							>
								{row.name}
							</button>
							<RecruitmentStatusBadge status={row.status} />
						</div>
						<div className="space-y-2 mb-4" style={MONO}>
							<div className="flex items-center justify-between text-[10px]">
								<span className="uppercase tracking-widest text-muted-foreground">
									Урьсан
								</span>
								<span className="text-foreground/80">
									{row.totalInvitationCount}
								</span>
							</div>
							<div className="flex items-center justify-between text-[10px]">
								<span className="uppercase tracking-widest text-muted-foreground">
									Дууссан
								</span>
								<span className="text-foreground/80">
									{row.completedInvitationCount}
								</span>
							</div>
							<div className="flex items-center justify-between text-[10px]">
								<span className="uppercase tracking-widest text-muted-foreground">
									Үүсгэсэн
								</span>
								<span className="text-foreground/80">
									{formatDate(row.createdAt)}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2 pt-3 border-t border-border/50">
							<RowActionButton row={row} router={router} />
							<KebabMenu
								items={getRecruitmentKebabItems(row, router, onShowDetail)}
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
