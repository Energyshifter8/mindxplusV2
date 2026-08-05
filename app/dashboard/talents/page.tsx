"use client";

import { useQuery } from "@tanstack/react-query";
import { Bookmark, Calendar, Mail, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/shared/ListComponents";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { getHiringInvitations, type HiringInvitationItem } from "@/lib/api";

const PAGE_SIZE = 9;

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

function TalentCardSkeleton() {
	return (
		<div className="border-2 border-border bg-card p-5 animate-pulse">
			<div className="flex items-start justify-between mb-3">
				<div className="h-6 w-40 bg-muted rounded-none" />
				<div className="h-5 w-5 bg-muted rounded-none" />
			</div>
			<div className="h-4 w-20 bg-muted rounded-none mb-4" />
			<div className="space-y-2.5 mb-4">
				<div className="h-3 w-48 bg-muted rounded-none" />
				<div className="h-3 w-32 bg-muted rounded-none" />
			</div>
			<div className="flex gap-1.5 mb-4">
				<div className="h-5 w-28 bg-muted rounded-none" />
				<div className="h-5 w-36 bg-muted rounded-none" />
			</div>
			<div className="h-3 w-40 bg-muted rounded-none mb-5" />
			<div className="pt-3 border-t border-border/50">
				<div className="h-9 w-full bg-muted rounded-none" />
			</div>
		</div>
	);
}

export default function TalentsPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(0);

	const {
		data: listRes,
		isLoading: listLoading,
		isError: listError,
	} = useQuery({
		queryKey: ["hiringInvitations", searchQuery, currentPage],
		queryFn: () =>
			getHiringInvitations({
				page: currentPage,
				size: PAGE_SIZE,
				...(searchQuery ? { name: searchQuery } : {}),
			}),
		refetchInterval: 30000,
		refetchIntervalInBackground: false,
	});

	const rows: HiringInvitationItem[] = listRes?.data?.content ?? [];
	const totalPages = listRes?.data?.totalPages ?? 0;
	const totalElements = listRes?.data?.totalElements ?? 0;

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
							<span className="text-foreground">Миний урьсан талентууд</span>
						</div>
						<h1
							className="font-black uppercase leading-none text-foreground text-[clamp(1.5rem,4vw,2.5rem)]"
							style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
						>
							Миний урьсан талентууд
						</h1>
					</div>
				</div>

				{/* Search + Dropdown Filter */}
				<div className="flex items-center justify-between gap-4 mb-6">
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
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(0);
								}}
								className="pl-9 pr-4 py-2 text-[11px] uppercase tracking-wider border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							/>
						</div>
						<button
							type="button"
							className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold border-2 border-border bg-card text-foreground hover:border-primary transition-colors"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Бүгд
							<svg
								width="10"
								viewBox="0 0 10 6"
								fill="none"
								aria-hidden="true"
								className="text-muted-foreground"
							>
								<path
									d="M1 1L5 5L9 1"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="square"
								/>
							</svg>
						</button>
					</div>
					{!listLoading && totalElements > 0 && (
						<span
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Нийт {totalElements} талент
						</span>
					)}
				</div>

				{/* Card Grid */}
				{listLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: PAGE_SIZE }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton keys are stable
							<TalentCardSkeleton key={`skel-${i}`} />
						))}
					</div>
				) : listError ? (
					<EmptyState text="Мэдээлэл ачаалахад алдаа гарлаа" />
				) : rows.length === 0 ? (
					<EmptyState text="Урьсан талент байхгүй байна" />
				) : (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{rows.map((row) => (
								<div
									key={row.id}
									className="group relative border-2 border-border bg-card hover:border-primary/60 transition-all duration-200 overflow-hidden"
								>
									{/* Grid texture */}
									<div
										className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
										style={{
											backgroundImage: `
												linear-gradient(rgba(11,154,70,0.06) 1px, transparent 1px),
												linear-gradient(90deg, rgba(11,154,70,0.06) 1px, transparent 1px)
											`,
											backgroundSize: "40px 40px",
										}}
									/>

									<div className="relative z-10 p-5">
										{/* Top row: Name + Bookmark */}
										<div className="flex items-start justify-between gap-3 mb-2">
											<h3
												className="text-base font-black uppercase leading-tight text-foreground line-clamp-2"
												style={{
													fontFamily: "'Barlow Condensed', sans-serif",
												}}
											>
												{row.lastName} {row.firstName}
											</h3>
											<Bookmark
												size={16}
												className={`shrink-0 mt-0.5 transition-colors duration-150 ${
													row.marked
														? "fill-primary text-primary"
														: "text-muted-foreground group-hover:text-foreground"
												}`}
											/>
										</div>

										{/* Star badge — only if avgStarPoint > 0 */}
										{row.avgStarPoint > 0 && (
											<div className="mb-3">
												<StarBadge rating={row.avgStarPoint} />
											</div>
										)}

										{/* Email */}
										<div className="flex items-center gap-2 mb-2">
											<Mail
												size={12}
												className="shrink-0 text-muted-foreground"
											/>
											<span
												className="text-[10px] text-muted-foreground truncate"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												{row.email}
											</span>
										</div>

										{/* Invited job titles */}
										<div className="mb-4">
											<p
												className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												Уригдсан ажлын байр
											</p>
											<div className="flex flex-wrap gap-1.5">
												{row.recruitments.map((r) => (
													<span
														key={r.id}
														className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-widest border border-border bg-secondary text-secondary-foreground"
														style={{
															fontFamily: "'JetBrains Mono', monospace",
														}}
													>
														{r.name}
													</span>
												))}
											</div>
										</div>

										{/* Registration date */}
										<div className="flex items-center gap-2 mb-4">
											<Calendar
												size={12}
												className="shrink-0 text-muted-foreground"
											/>
											<div>
												<p
													className="text-[9px] uppercase tracking-widest text-muted-foreground"
													style={{
														fontFamily: "'JetBrains Mono', monospace",
													}}
												>
													Бүртгэгдсэн огноо
												</p>
												<p
													className="text-[10px] text-foreground/80"
													style={{
														fontFamily: "'JetBrains Mono', monospace",
													}}
												>
													{row.createdAt || "—"}
												</p>
											</div>
										</div>

										{/* View button */}
										<div className="pt-3 border-t border-border/50">
											<button
												type="button"
												onClick={() =>
													router.push(`/dashboard/talents/${row.id}`)
												}
												className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-widest font-bold border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-150"
												style={{ fontFamily: "'JetBrains Mono', monospace" }}
											>
												Үзэх
											</button>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<Pagination className="mt-8">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											text="Өмнөх"
											onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
											aria-disabled={currentPage === 0}
											className={
												currentPage === 0
													? "pointer-events-none opacity-30"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
									{Array.from({ length: totalPages }, (_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: pagination index is stable
										<PaginationItem key={`page-${i}`}>
											<PaginationLink
												isActive={currentPage === i}
												onClick={() => setCurrentPage(i)}
												className="cursor-pointer"
											>
												{i + 1}
											</PaginationLink>
										</PaginationItem>
									))}
									<PaginationItem>
										<PaginationNext
											text="Дараах"
											onClick={() =>
												setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
											}
											aria-disabled={currentPage >= totalPages - 1}
											className={
												currentPage >= totalPages - 1
													? "pointer-events-none opacity-30"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</>
				)}
			</div>
		</div>
	);
}
