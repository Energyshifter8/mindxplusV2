"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Inbox, LogOut, Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
	type CompletedInvitation,
	getLatestCompletedInvitations,
	getRecruitmentList,
	getRecruitmentStats,
	getSurveyList,
	getSurveyStats,
	type ModuleStats,
	type RecruitmentListItem,
	type RecruitmentStats,
	type SurveyListItem,
} from "@/lib/api";

function formatBalance(value: number | undefined | null): string {
	if (value === undefined || value === null) return "—";
	if (!Number.isFinite(value) || value >= 100_000) return "Хязгааргүй";
	return String(value);
}

function GridTexture() {
	return (
		<div
			className="absolute inset-0 pointer-events-none"
			style={{
				backgroundImage: `
          linear-gradient(rgba(11,154,70,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(11,154,70,0.06) 1px, transparent 1px)
        `,
				backgroundSize: "40px 40px",
			}}
		/>
	);
}

function MiniStatCard({
	label,
	value,
	icon,
	isLoading,
	isError,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	isLoading?: boolean;
	isError?: boolean;
}) {
	return (
		<div className="group relative p-5 border-2 border-border bg-card overflow-hidden transition-colors duration-150 hover:border-primary">
			<GridTexture />
			<div className="relative z-10">
				<div className="flex items-start justify-between mb-3">
					<span
						className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-tight"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{label}
					</span>
					<div className="text-icon-dim group-hover:text-icon-hover transition-colors duration-150">
						{icon}
					</div>
				</div>
				{isLoading ? (
					<div className="h-8 w-20 rounded-none animate-shimmer" />
				) : isError ? (
					<div
						className="text-xs text-destructive uppercase tracking-widest"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Алдаа
					</div>
				) : (
					<div
						className="text-3xl font-black uppercase text-stat-value"
						style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
					>
						{value}
					</div>
				)}
			</div>
		</div>
	);
}

function PanelCard({
	title,
	subtitle,
	buttonText,
	onButtonClick,
	children,
}: {
	title: string;
	subtitle: string;
	buttonText: string;
	onButtonClick?: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="border-2 border-border bg-card overflow-hidden flex flex-col">
			<div className="p-6 pb-4">
				<div className="flex items-start justify-between gap-4 mb-5">
					<div className="min-w-0">
						<h2
							className="font-black uppercase text-foreground text-xl leading-none mb-1.5"
							style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
						>
							{title}
						</h2>
						<p
							className="text-[10px] text-muted-foreground leading-relaxed"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{subtitle}
						</p>
					</div>
					<button
						type="button"
						onClick={onButtonClick}
						className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						<Plus size={12} />
						{buttonText}
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

function DataTable({
	columns,
	rows,
	emptyText,
}: {
	columns: { key: string; label: string; width?: string }[];
	rows?: {
		id: number;
		cells: {
			key: string;
			value: string;
			badge?: { label: string; color: "green" | "amber" };
		}[];
	}[];
	emptyText?: string;
}) {
	if (!rows || rows.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
				<Inbox size={32} className="mb-3 opacity-40" />
				<span
					className="text-[11px] uppercase tracking-widest"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					{emptyText}
				</span>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left" style={{ minWidth: "100%" }}>
				<thead>
					<tr className="border-b-2 border-border">
						{columns.map((col) => (
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
					{rows.map((row) => (
						<tr
							key={row.id}
							className="border-b border-border/50 hover:border-l-2 hover:border-l-primary transition-colors duration-100 group"
						>
							{row.cells.map((cell) => (
								<td
									key={cell.key}
									className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									{cell.badge ? (
										<span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border text-[10px] uppercase tracking-wider">
											<span
												className={`w-1.5 h-1.5 rounded-full ${
													cell.badge.color === "green"
														? "bg-badge-green"
														: "bg-badge-amber"
												}`}
											/>
											{cell.badge.label}
										</span>
									) : (
										cell.value
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

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

function statusBadge(status: string): {
	label: string;
	color: "green" | "amber";
} {
	const map: Record<string, { label: string; color: "green" | "amber" }> = {
		PUBLISHED: { label: "Нийтэлсэн", color: "green" },
		CLOSED: { label: "Хаагдсан", color: "green" },
		COMPLETED: { label: "Дууссан", color: "green" },
		DRAFT: { label: "Үүссэн", color: "amber" },
	};
	return map[status] ?? { label: status, color: "amber" };
}

function TableSkeleton({ columns }: { columns: { key: string }[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left">
				<thead>
					<tr className="border-b-2 border-border">
						{columns.map((col) => (
							<th key={col.key} className="py-2.5 px-3">
								<div
									className="h-3 w-16 animate-shimmer"
									style={{ borderRadius: 0 }}
								/>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						<tr key={`dash-skel-${i}`} className="border-b border-border/50">
							{columns.map((col) => (
								<td key={col.key} className="py-3 px-3">
									<div
										className="h-3 animate-shimmer"
										style={{
											borderRadius: 0,
											width: col.key === "no" ? "20px" : "80%",
										}}
									/>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

const SURVEY_COLUMNS = [
	{ key: "no", label: "№", width: "40px" },
	{ key: "name", label: "Нэр" },
	{ key: "status", label: "Төлөв", width: "100px" },
	{ key: "questions", label: "Асуулт", width: "70px" },
	{ key: "progress", label: "Явц", width: "70px" },
	{ key: "created", label: "Үүсгэсэн", width: "110px" },
];

const RECRUITMENT_COLUMNS = [
	{ key: "no", label: "№", width: "40px" },
	{ key: "name", label: "Нэр" },
	{ key: "status", label: "Төлөв", width: "100px" },
	{ key: "talent", label: "Талент", width: "80px" },
	{ key: "created", label: "Үүсгэсэн", width: "110px" },
];

const RECRUITMENT_COMPLETED_COLUMNS = [
	{ key: "no", label: "№", width: "40px" },
	{ key: "name", label: "Нэр" },
	{ key: "job", label: "Ажлын байр" },
	{ key: "submitted", label: "Бөглөсөн хугацаа", width: "130px" },
];

export default function Dashboard() {
	const router = useRouter();

	const {
		data: recruitmentStats,
		isLoading: recruitmentStatsLoading,
		isError: recruitmentStatsError,
	} = useQuery({
		queryKey: ["recruitmentStats"],
		queryFn: () => getRecruitmentStats<RecruitmentStats>(),
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});

	const {
		data: surveyStats,
		isLoading: surveyStatsLoading,
		isError: surveyStatsError,
	} = useQuery({
		queryKey: ["surveyStats"],
		queryFn: () => getSurveyStats<ModuleStats>(),
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});

	const {
		data: surveyListRes,
		isLoading: surveysLoading,
		isError: surveysError,
	} = useQuery({
		queryKey: ["surveyList"],
		queryFn: () => getSurveyList({ page: 0, size: 10 }),
	});

	const {
		data: recruitmentListRes,
		isLoading: recruitmentsLoading,
		isError: recruitmentsError,
	} = useQuery({
		queryKey: ["recruitmentList"],
		queryFn: () => getRecruitmentList({ page: 0, size: 10 }),
	});

	const {
		data: completedInvitationsRes,
		isLoading: invitationsLoading,
		isError: invitationsError,
	} = useQuery({
		queryKey: ["completedInvitations"],
		queryFn: () => getLatestCompletedInvitations(5),
	});

	const surveyRows = useMemo(() => {
		const content = surveyListRes?.data?.content ?? [];
		return content.map((item: SurveyListItem, i: number) => ({
			id: i + 1,
			cells: [
				{ key: "no", value: String(i + 1) },
				{ key: "name", value: item.name },
				{ key: "status", value: "", badge: statusBadge(item.status) },
				{ key: "questions", value: String(item.questionCount) },
				{
					key: "progress",
					value: `${item.receivedResponseCount}/${item.goal}`,
				},
				{ key: "created", value: formatDate(item.createdAt) },
			],
		}));
	}, [surveyListRes]);

	const recruitmentRows = useMemo(() => {
		const content = recruitmentListRes?.data?.content ?? [];
		return content.map((item: RecruitmentListItem, i: number) => ({
			id: i + 1,
			cells: [
				{ key: "no", value: String(i + 1) },
				{ key: "name", value: item.name },
				{ key: "status", value: "", badge: statusBadge(item.status) },
				{
					key: "talent",
					value: `${item.completedInvitationCount}/${item.totalInvitationCount}`,
				},
				{ key: "created", value: formatDate(item.createdAt) },
			],
		}));
	}, [recruitmentListRes]);

	const invitationRows = useMemo(() => {
		const items = Array.isArray(completedInvitationsRes?.data)
			? completedInvitationsRes.data
			: [];
		return items.map((item: CompletedInvitation, i: number) => ({
			id: i + 1,
			cells: [
				{ key: "no", value: String(i + 1) },
				{ key: "name", value: `${item.firstName} ${item.lastName}` },
				{ key: "job", value: item.recruitmentName },
				{ key: "submitted", value: formatDate(item.completedAt) },
			],
		}));
	}, [completedInvitationsRes]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		router.push("/login");
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/login");
		}
	}, [router]);

	return (
		<div className="min-h-screen w-full bg-background">
			<header className="border-b-2 border-border px-6 lg:px-16 py-5">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center gap-4">
						<div
							className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.4em] font-black border-2 border-primary text-primary"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Систем
						</div>
						<span
							className="hidden sm:block text-xs uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Хяналтын самбар
						</span>
					</div>
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border-2 border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						<LogOut size={14} />
						Гарах
					</button>
				</div>
			</header>

			<main className="max-w-7xl mx-auto p-6 lg:p-10">
				<div className="mb-10">
					<h1
						className="font-black uppercase leading-none text-foreground text-[clamp(1.5rem,4vw,2.5rem)]"
						style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
					>
						Хяналтын самбар
					</h1>
					<p
						className="mt-2 text-xs uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Таны мэдээлэл энд харагдана
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Panel 1 — Миний шинжилгээ */}
					<div className="w-full lg:w-[55%] min-w-0">
						<PanelCard
							title="Миний шинжилгээ"
							subtitle="Таны үндсэн үнэлгээний үйл ажиллагааг товч харуулав."
							buttonText="Шинжилгээ үүсгэх"
						>
							<div className="grid grid-cols-3 gap-3 mb-5">
								<MiniStatCard
									label="Нийтэлсэн шинжилгээний тоо"
									value={String(
										surveyStats?.data?.totalPublishedSurveyCount ?? "",
									)}
									icon={<FileText size={14} />}
									isLoading={surveyStatsLoading}
									isError={surveyStatsError}
								/>
								<MiniStatCard
									label="Нийт шинжилгээнд оролцогчдын тоо"
									value={String(surveyStats?.data?.totalRespondentCount ?? "")}
									icon={<Zap size={14} />}
									isLoading={surveyStatsLoading}
									isError={surveyStatsError}
								/>
								<MiniStatCard
									label="Үлдсэн шинжилгээний эрх"
									value={String(surveyStats?.data?.surveyBalance ?? "")}
									icon={<FileText size={14} />}
									isLoading={surveyStatsLoading}
									isError={surveyStatsError}
								/>
							</div>

							{surveysLoading ? (
								<TableSkeleton columns={SURVEY_COLUMNS} />
							) : surveysError ? (
								<DataTable
									columns={SURVEY_COLUMNS}
									emptyText="Мэдээлэл ачаалахад алдаа гарлаа"
								/>
							) : (
								<DataTable
									columns={SURVEY_COLUMNS}
									rows={surveyRows}
									emptyText="Шинжилгээ байхгүй байна"
								/>
							)}
						</PanelCard>
					</div>

					{/* Panel 2 — Талентийн үнэлгээ */}
					<div className="w-full lg:w-[45%] min-w-0">
						<PanelCard
							title="Талентийн үнэлгээ"
							subtitle="Үүссэн талентийн үнэлгээ болон оролцогчдын бөглөсөн үр дүнг шуудхарах."
							buttonText="Талентийн үнэлгээ үүсгэх"
						>
							<div className="grid grid-cols-3 gap-3 mb-5">
								<MiniStatCard
									label="Нийт урьсан талент"
									value={String(
										recruitmentStats?.data?.totalInvitationCount ?? "",
									)}
									icon={<FileText size={14} />}
									isLoading={recruitmentStatsLoading}
									isError={recruitmentStatsError}
								/>
								<MiniStatCard
									label="Нийт үнэлгээнд оролцсон талент"
									value={String(
										recruitmentStats?.data?.totalCompletedCount ?? "",
									)}
									icon={<Zap size={14} />}
									isLoading={recruitmentStatsLoading}
									isError={recruitmentStatsError}
								/>
								<MiniStatCard
									label="Үлдсэн урилгын эрх"
									value={formatBalance(
										recruitmentStats?.data?.invitationBalance,
									)}
									icon={<FileText size={14} />}
									isLoading={recruitmentStatsLoading}
									isError={recruitmentStatsError}
								/>
							</div>

							<div className="mb-4">
								{recruitmentsLoading ? (
									<TableSkeleton columns={RECRUITMENT_COLUMNS} />
								) : recruitmentsError ? (
									<DataTable
										columns={RECRUITMENT_COLUMNS}
										emptyText="Мэдээлэл ачаалахад алдаа гарлаа"
									/>
								) : (
									<DataTable
										columns={RECRUITMENT_COLUMNS}
										rows={recruitmentRows}
										emptyText="Талентийн үнэлгээ байхгүй байна"
									/>
								)}
							</div>

							{invitationsLoading ? (
								<TableSkeleton columns={RECRUITMENT_COMPLETED_COLUMNS} />
							) : invitationsError ? (
								<DataTable
									columns={RECRUITMENT_COMPLETED_COLUMNS}
									emptyText="Мэдээлэл ачаалахад алдаа гарлаа"
								/>
							) : (
								<DataTable
									columns={RECRUITMENT_COMPLETED_COLUMNS}
									rows={invitationRows}
									emptyText="Дууссан үнэлгээ байхгүй байна"
								/>
							)}
						</PanelCard>
					</div>
				</div>
			</main>
		</div>
	);
}
