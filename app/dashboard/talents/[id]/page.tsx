"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	Bookmark,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Mail,
	Star,
	User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState, TableSkeleton } from "@/components/shared/ListComponents";
import {
	getTalentDetail,
	getTalentInvitations,
	type TalentDetail,
	type TalentInvitationItem,
} from "@/lib/api";

const PAGE_SIZE = 10;

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function StarBadge({ rating }: { rating: number }) {
	if (rating <= 0) return null;
	return (
		<span
			className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-yellow-500/15 text-yellow-500 border border-yellow-500/30"
			style={{ fontFamily: "'JetBrains Mono', monospace" }}
		>
			<Star size={10} className="fill-yellow-500" />
			{rating}
		</span>
	);
}

function InvitationStatusBadge({ status }: { status: string }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		PENDING: {
			bg: "bg-badge-amber/15 border-badge-amber/30",
			text: "text-badge-amber",
			label: "Хүлээгдэж байна",
		},
		COMPLETED: {
			bg: "bg-badge-green/15 border-badge-green/30",
			text: "text-badge-green",
			label: "Дууссан",
		},
		EXPIRED: {
			bg: "bg-muted border-border",
			text: "text-muted-foreground",
			label: "Хугацаа дууссан",
		},
	};
	const c = config[status] ?? config.PENDING;
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold border ${c.bg} ${c.text}`}
			style={{ fontFamily: "'JetBrains Mono', monospace" }}
		>
			<span
				className={`h-1.5 w-1.5 rounded-full ${c.bg.replace("/15", "").replace("border-", "bg-")}`}
			/>
			{c.label}
		</span>
	);
}

export default function TalentDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;
	const [currentPage, setCurrentPage] = useState(0);

	const {
		data: detailRes,
		isLoading: detailLoading,
		isError: detailError,
	} = useQuery({
		queryKey: ["talentDetail", id],
		queryFn: () => getTalentDetail(id),
		enabled: !!id,
	});

	const {
		data: invitationsRes,
		isLoading: invitationsLoading,
		isError: invitationsError,
	} = useQuery({
		queryKey: ["talentInvitations", id, currentPage],
		queryFn: () =>
			getTalentInvitations(id, { page: currentPage, size: PAGE_SIZE }),
		enabled: !!id,
	});

	const talent = detailRes?.data;
	const invitations: TalentInvitationItem[] =
		invitationsRes?.data?.content ?? [];
	const totalPages = invitationsRes?.data?.totalPages ?? 0;

	if (detailLoading) {
		return (
			<div className="min-h-full w-full p-6 lg:p-10">
				<div className="animate-pulse space-y-6">
					<div className="h-8 w-48 bg-muted" />
					<div className="h-4 w-64 bg-muted" />
					<div className="h-64 bg-muted mt-8" />
				</div>
			</div>
		);
	}

	if (detailError || !talent) {
		return (
			<div className="min-h-full w-full p-6 lg:p-10">
				<EmptyState text="Мэдээлэл авахад алдаа гарлаа" />
			</div>
		);
	}

	return (
		<div className="min-h-full w-full">
			<div className="p-6 lg:p-10">
				{/* Breadcrumb */}
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
					<button
						type="button"
						className="hover:text-primary cursor-pointer transition-colors"
						onClick={() => router.push("/dashboard/talents")}
					>
						Миний урьсан талентууд
					</button>
					<span className="mx-2">/</span>
					<span className="text-foreground">
						{talent.lastName} {talent.firstName}
					</span>
				</div>

				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => router.push("/dashboard/talents")}
							className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						>
							<ArrowLeft size={18} />
						</button>
						<div className="flex h-12 w-12 items-center justify-center border-2 border-primary text-primary">
							<User size={20} />
						</div>
						<div>
							<div className="flex items-center gap-3">
								<h1
									className="font-black uppercase leading-none text-foreground text-[clamp(1.5rem,4vw,2.5rem)]"
									style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
								>
									{talent.lastName} {talent.firstName}
								</h1>
								<Bookmark
									size={18}
									className={`shrink-0 ${talent.marked ? "fill-primary text-primary" : "text-muted-foreground"}`}
								/>
								{talent.avgStarPoint > 0 && (
									<StarBadge rating={talent.avgStarPoint} />
								)}
							</div>
							<div className="flex items-center gap-2 mt-1">
								<Mail size={12} className="text-muted-foreground" />
								<span
									className="text-[10px] text-muted-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									{talent.email}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Урилгын түүх */}
				<div className="mb-4">
					<h2
						className="text-lg font-bold uppercase text-foreground"
						style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
					>
						Урилгын түүх
					</h2>
				</div>

				{/* Table */}
				<div className="border-2 border-border bg-card overflow-hidden">
					{invitationsLoading ? (
						<TableSkeleton columnCount={7} />
					) : invitationsError ? (
						<EmptyState text="Урилгын мэдээлэл ачаалахад алдаа гарлаа" />
					) : invitations.length === 0 ? (
						<EmptyState text="Урилга байхгүй байна" />
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left" style={{ minWidth: "100%" }}>
								<thead>
									<tr className="border-b-2 border-border">
										{[
											{ key: "no", label: "№", width: "40px" },
											{ key: "job", label: "Ажлын байр" },
											{ key: "tests", label: "Ашигласан тестүүд" },
											{ key: "invited", label: "Урьсан", width: "110px" },
											{ key: "status", label: "Төлөв", width: "120px" },
											{ key: "completed", label: "Бөглөсөн", width: "110px" },
											{ key: "result", label: "Үнэлгээ", width: "80px" },
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
									{invitations.map((row, i) => (
										<tr
											key={row.id}
											className="border-b border-border/50 hover:border-l-2 hover:border-l-primary transition-colors duration-100"
										>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{currentPage * PAGE_SIZE + i + 1}
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 max-w-[200px] truncate"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.recruitmentName}
											</td>
											<td className="py-3 px-3">
												<div className="flex flex-wrap gap-1">
													{row.tests.map((test) => (
														<span
															key={test}
															className="inline-block px-1.5 py-0.5 text-[8px] uppercase tracking-widest border border-border bg-secondary text-secondary-foreground"
															style={{
																fontFamily: "'JetBrains Mono', monospace",
															}}
														>
															{test}
														</span>
													))}
												</div>
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{formatDate(row.createdAt)}
											</td>
											<td className="py-3 px-3">
												<InvitationStatusBadge status={row.status} />
											</td>
											<td
												className="py-3 px-3 text-xs text-foreground/80 whitespace-nowrap"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.rated ? formatDate(row.completedAt) : "—"}
											</td>
											<td className="py-3 px-3">
												{row.rated ? (
													<button
														type="button"
														onClick={() =>
															router.push(
																`/dashboard/recruitments/${row.id}/results`,
															)
														}
														className="flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-widest font-bold text-primary hover:bg-primary/10 transition-colors"
														style={{
															fontFamily: "'JetBrains Mono', monospace",
														}}
													>
														Үр дүн
													</button>
												) : (
													<span
														className="text-xs text-muted-foreground"
														style={{
															fontFamily: "'JetBrains Mono', monospace",
														}}
													>
														—
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-3 mt-8">
						<button
							type="button"
							onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
							disabled={currentPage === 0}
							className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							<ChevronLeft size={12} />
							Өмнөх
						</button>
						<span
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Хуудас {currentPage + 1} / {totalPages}
						</span>
						<button
							type="button"
							onClick={() =>
								setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
							}
							disabled={currentPage >= totalPages - 1}
							className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Дараах
							<ChevronRight size={12} />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
