"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BarChart3,
	Copy,
	FileText,
	LayoutGrid,
	List,
	Pencil,
	Plus,
	Search,
	Share2,
	Trash2,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { KebabMenu, type KebabMenuItem } from "@/components/shared/KebabMenu";
import {
	EmptyState,
	GridTexture,
	MiniStatCard,
	SurveyStatusBadge,
	TableSkeleton,
} from "@/components/shared/ListComponents";
import {
	deleteSurvey,
	getSurveyList,
	getSurveyStats,
	type ModuleStats,
	type SurveyListItem,
} from "@/lib/api";

function formatDate(dateStr: string): string {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

type FilterTab = "ALL" | "CREATED" | "PUBLISHED" | "CLOSED";

function getSurveyKebabItems(
	row: { id: string; status: string; name: string },
	router: ReturnType<typeof useRouter>,
): KebabMenuItem[] {
	const items: KebabMenuItem[] = [];

	if (row.status === "CREATED") {
		items.push({
			label: "Засах",
			icon: <Pencil size={11} />,
			onClick: () => router.push(`/dashboard/surveys/${row.id}/edit`),
		});
		items.push({
			label: "Хуулах",
			icon: <Copy size={11} />,
			onClick: () => {},
		});
		items.push({
			label: "Устгах",
			icon: <Trash2 size={11} />,
			onClick: () => {
				if (window.confirm("Энэ шинжилгээг устгах уу?")) {
					// TODO: use deleteMutation
				}
			},
			variant: "destructive",
		});
	} else if (row.status === "PUBLISHED") {
		items.push({
			label: "Түгээх",
			icon: <Share2 size={11} />,
			onClick: () => {},
		});
	} else {
		// CLOSED
		items.push({
			label: "Үр дүн",
			icon: <BarChart3 size={11} />,
			onClick: () => router.push(`/dashboard/surveys/${row.id}/results`),
		});
	}

	return items;
}

const FILTER_TABS: { key: FilterTab; label: string }[] = [
	{ key: "ALL", label: "Бүгд" },
	{ key: "CREATED", label: "Үүссэн" },
	{ key: "PUBLISHED", label: "Идэвхтэй" },
	{ key: "CLOSED", label: "Хаагдсан" },
];

export default function SurveysPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"table" | "grid">("table");

	const {
		data: surveyStats,
		isLoading: statsLoading,
		isError: statsError,
	} = useQuery({
		queryKey: ["surveyStats"],
		queryFn: () => getSurveyStats<ModuleStats>(),
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});

	const {
		data: surveyListRes,
		isLoading: listLoading,
		isError: listError,
	} = useQuery({
		queryKey: ["surveyList", activeTab, searchQuery],
		queryFn: () =>
			getSurveyList({
				page: 0,
				size: 100,
				...(activeTab !== "ALL" ? { status: activeTab } : {}),
				...(searchQuery ? { name: searchQuery } : {}),
			}),
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});

	const queryClient = useQueryClient();
	const _deleteMutation = useMutation({
		mutationFn: deleteSurvey,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["surveyList"] });
			queryClient.invalidateQueries({ queryKey: ["surveyStats"] });
		},
	});

	const surveyRows = useMemo(() => {
		const content: SurveyListItem[] = surveyListRes?.data?.content ?? [];
		return content.map((item: SurveyListItem, i: number) => ({
			id: item.id,
			index: i + 1,
			name: item.name,
			status: item.status,
			questionCount: item.questionCount,
			receivedResponseCount: item.receivedResponseCount,
			goal: item.goal,
			createdAt: item.createdAt,
			closedAt: item.closedAt,
		}));
	}, [surveyListRes]);

	return (
		<div className="min-h-full w-full">
			<div className="p-6 lg:p-10">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<div
							className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							<button
								type="button"
								className="hover:text-primary cursor-pointer transition-colors"
								onClick={() => router.push("/dashboard")}
							>
								Хяналтын самбар
							</button>
							<span className="mx-2">/</span>
							<span className="text-foreground">Миний шинжилгээ</span>
						</div>
						<h1
							className="font-black uppercase leading-none text-foreground text-[clamp(1.5rem,4vw,2.5rem)]"
							style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
						>
							Миний шинжилгээ
						</h1>
					</div>
					<button
						type="button"
						onClick={() => router.push("/dashboard/surveys/new")}
						className="flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						<Plus size={14} />
						Шинжилгээ үүсгэх
					</button>
				</div>

				{/* Stat Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<MiniStatCard
						label="Нийтэлсэн шинжилгээний тоо"
						value={String(surveyStats?.data?.totalPublishedSurveyCount ?? "")}
						icon={<FileText size={14} />}
						isLoading={statsLoading}
						isError={statsError}
					/>
					<MiniStatCard
						label="Нийт шинжилгээнд оролцогчдын тоо"
						value={String(surveyStats?.data?.totalRespondentCount ?? "")}
						icon={<Zap size={14} />}
						isLoading={statsLoading}
						isError={statsError}
					/>
					<MiniStatCard
						label="Үлдсэн шинжилгээний эрх"
						value={String(surveyStats?.data?.surveyBalance ?? "")}
						icon={<FileText size={14} />}
						isLoading={statsLoading}
						isError={statsError}
					/>
				</div>

				{/* Filter Tabs + Search + View Toggle */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-1 border-2 border-border p-1">
						{FILTER_TABS.map((tab) => (
							<button
								type="button"
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all duration-150 ${
									activeTab === tab.key
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground hover:bg-muted"
								}`}
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
								placeholder="Нэрээр хайх..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 pr-4 py-2 text-[11px] uppercase tracking-wider border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							/>
						</div>
						<div className="flex border-2 border-border">
							<button
								type="button"
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
					{listLoading ? (
						<TableSkeleton columnCount={8} />
					) : listError ? (
						<EmptyState text="Мэдээлэл ачаалахад алдаа гарлаа" />
					) : surveyRows.length === 0 ? (
						<EmptyState text="Шинжилгээ байхгүй байна" />
					) : viewMode === "table" ? (
						<div className="overflow-x-auto">
							<table className="w-full text-left" style={{ minWidth: "100%" }}>
								<thead>
									<tr className="border-b-2 border-border">
										{[
											{ key: "no", label: "№", width: "40px" },
											{ key: "name", label: "Нэр" },
											{ key: "status", label: "Төлөв", width: "100px" },
											{ key: "questions", label: "Асуулт", width: "70px" },
											{ key: "progress", label: "Явц", width: "80px" },
											{ key: "created", label: "Үүсгэсэн", width: "110px" },
											{ key: "closed", label: "Хаагдах", width: "110px" },
											{ key: "actions", label: "", width: "120px" },
										].map((col) => (
											<th
												key={col.key}
												className="py-2.5 px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap"
												style={{
													fontFamily: "'JetBrains Mono', monospace",
													width: col.width,
												}}
											>
												{col.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{surveyRows.map((row, i) => (
										<tr
											key={row.id}
											className="border-b border-border/50 hover:border-l-2 hover:border-l-primary transition-colors duration-100 group"
										>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{i + 1}
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap max-w-[200px] truncate"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.name}
											</td>
											<td className="py-3 px-3">
												<SurveyStatusBadge status={row.status} />
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.questionCount}
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.receivedResponseCount}/{row.goal}
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{formatDate(row.createdAt)}
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.closedAt ? formatDate(row.closedAt) : "—"}
											</td>
											<td className="py-3 px-3">
												<div className="flex items-center gap-1.5">
													{row.status === "CREATED" && (
														<button
															type="button"
															onClick={() =>
																router.push(`/dashboard/surveys/${row.id}/edit`)
															}
															className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
															title="Засах"
														>
															<Pencil size={13} />
														</button>
													)}
													{row.status === "PUBLISHED" && (
														<button
															type="button"
															onClick={() => {}}
															className="flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary/10 transition-colors"
															style={{
																fontFamily: "'JetBrains Mono', monospace",
															}}
														>
															<Share2 size={12} />
															Түгээх
														</button>
													)}
													{row.status === "CLOSED" && (
														<button
															type="button"
															onClick={() =>
																router.push(
																	`/dashboard/surveys/${row.id}/results`,
																)
															}
															className="flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary/10 transition-colors"
															style={{
																fontFamily: "'JetBrains Mono', monospace",
															}}
														>
															<BarChart3 size={12} />
															Үр дүн
														</button>
													)}
													<KebabMenu items={getSurveyKebabItems(row, router)} />
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						/* Grid view */
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
							{surveyRows.map((row) => (
								<div
									key={row.id}
									className="border-2 border-border bg-background p-5 hover:border-primary transition-colors duration-150 group relative overflow-hidden"
								>
									<GridTexture />
									<div className="relative z-10">
										<div className="flex items-start justify-between mb-3">
											<h3
												className="text-sm font-bold text-foreground uppercase leading-tight truncate max-w-[180px]"
												style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
											>
												{row.name}
											</h3>
											<SurveyStatusBadge status={row.status} />
										</div>
										<div
											className="space-y-2 mb-4"
											style={{ fontFamily: "'JetBrains Mono', monospace" }}
										>
											<div className="flex items-center justify-between text-[10px]">
												<span className="uppercase tracking-widest text-muted-foreground">
													Асуулт
												</span>
												<span className="text-foreground/80">
													{row.questionCount}
												</span>
											</div>
											<div className="flex items-center justify-between text-[10px]">
												<span className="uppercase tracking-widest text-muted-foreground">
													Явц
												</span>
												<span className="text-foreground/80">
													{row.receivedResponseCount}/{row.goal}
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
											{row.status === "CREATED" && (
												<button
													type="button"
													onClick={() =>
														router.push(`/dashboard/surveys/${row.id}/edit`)
													}
													className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
													style={{
														fontFamily: "'JetBrains Mono', monospace",
													}}
												>
													<Pencil size={11} />
													Засах
												</button>
											)}
											{row.status === "PUBLISHED" && (
												<button
													type="button"
													onClick={() => {}}
													className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
													style={{
														fontFamily: "'JetBrains Mono', monospace",
													}}
												>
													<Share2 size={11} />
													Түгээх
												</button>
											)}
											{row.status === "CLOSED" && (
												<button
													type="button"
													onClick={() =>
														router.push(`/dashboard/surveys/${row.id}/results`)
													}
													className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
													style={{
														fontFamily: "'JetBrains Mono', monospace",
													}}
												>
													<BarChart3 size={11} />
													Үр дүн
												</button>
											)}
											<KebabMenu items={getSurveyKebabItems(row, router)} />
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
