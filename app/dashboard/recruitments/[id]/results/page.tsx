"use client";

import {
	ArrowLeft,
	BarChart3,
	CheckCircle,
	Clock,
	FileText,
	Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

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

function StatCard({
	label,
	value,
	icon,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
}) {
	return (
		<div className="group relative p-5 border-2 border-border bg-card overflow-hidden transition-colors duration-150 hover:border-primary">
			<GridTexture />
			<div className="relative z-10">
				<div className="flex items-start justify-between mb-3">
					<span
						className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-tight max-w-[120px]"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{label}
					</span>
					<div className="text-icon-dim group-hover:text-icon-hover transition-colors duration-150">
						{icon}
					</div>
				</div>
				<div
					className="text-3xl font-black uppercase text-stat-value"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					{value}
				</div>
			</div>
		</div>
	);
}

export default function RecruitmentResultsPage() {
	const params = useParams();
	const router = useRouter();
	const recruitmentId = params?.id as string;

	return (
		<div className="min-h-full w-full">
			<div className="p-6 lg:p-10">
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
						onClick={() => router.push("/dashboard/recruitments")}
					>
						Талентийн үнэлгээ
					</button>
					<span className="mx-2">/</span>
					<span className="text-foreground">Үр дүн</span>
				</div>

				<div className="flex items-center gap-4 mb-8">
					<button
						type="button"
						onClick={() => router.push("/dashboard/recruitments")}
						className="flex items-center justify-center w-8 h-8 border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors shrink-0"
					>
						<ArrowLeft size={16} />
					</button>
					<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-primary text-primary">
						<BarChart3 size={16} />
					</div>
					<div>
						<h1
							className="text-[clamp(1.2rem,3vw,1.8rem)] font-black uppercase leading-none text-foreground"
							style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
						>
							Талентийн үнэлгээний үр дүн
						</h1>
						<p
							className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Recruitment ID: {recruitmentId}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<StatCard label="Нийт урьсан" value="0" icon={<Users size={14} />} />
					<StatCard
						label="Дуусгасан"
						value="0"
						icon={<CheckCircle size={14} />}
					/>
					<StatCard
						label="Дундаж хугацаа"
						value="—"
						icon={<Clock size={14} />}
					/>
					<StatCard
						label="Дуусгах хувь"
						value="—"
						icon={<BarChart3 size={14} />}
					/>
				</div>

				<div className="border-2 border-border bg-card overflow-hidden">
					<div className="flex flex-col items-center justify-center py-20 gap-4">
						<div className="flex h-14 w-14 items-center justify-center border-2 border-border text-muted-foreground">
							<FileText size={24} />
						</div>
						<p
							className="text-xs uppercase tracking-widest text-muted-foreground text-center max-w-md"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Дэлгэрэнгүй үр дүнгийн тайлан удахгүй нэмэгдэнэ
						</p>
						<p
							className="text-[10px] uppercase tracking-widest text-muted-foreground/60 text-center max-w-sm"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Бодит analytics endpoint дараа шатанд холбогдоно
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
