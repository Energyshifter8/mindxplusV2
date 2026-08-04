"use client";

import {
	AlertTriangle,
	ArrowLeft,
	BarChart3,
	CheckCircle,
	Clock,
	FileText,
	Mail,
	MonitorSmartphone,
	Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
	usePrimaryQuestionSummaries,
	useSurveyInsight,
} from "@/lib/hooks/useSurveyResults";

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

function StatCardSkeleton() {
	return (
		<div className="group relative p-5 border-2 border-border bg-card overflow-hidden">
			<GridTexture />
			<div className="relative z-10">
				<div className="flex items-start justify-between mb-3">
					<div className="h-2 w-20 animate-pulse bg-muted" />
					<div className="h-3.5 w-3.5 animate-pulse bg-muted" />
				</div>
				<div className="h-8 w-16 animate-pulse bg-muted" />
			</div>
		</div>
	);
}

function QuestionCard({
	question,
}: {
	question: {
		content: string;
		type: string;
		count: number;
		options: { optionContent: string; count: number }[];
	};
}) {
	const maxCount = Math.max(...question.options.map((o) => o.count), 1);

	return (
		<div className="border-2 border-border bg-card p-5">
			<div className="mb-4">
				<h3
					className="text-sm font-bold uppercase text-foreground mb-1"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					{question.content}
				</h3>
				<p
					className="text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					{question.count} хариулт
				</p>
			</div>
			<div className="space-y-2.5">
				{question.options.map((option) => (
					<div key={option.optionContent}>
						<div className="flex items-center justify-between mb-1">
							<span
								className="text-xs text-foreground truncate max-w-[70%]"
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							>
								{option.optionContent}
							</span>
							<span
								className="text-[10px] text-muted-foreground tabular-nums"
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							>
								{option.count}
							</span>
						</div>
						<div className="w-full h-2 bg-muted overflow-hidden">
							<div
								className="h-full bg-primary transition-all duration-500"
								style={{
									width: `${(option.count / maxCount) * 100}%`,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function QuestionCardSkeleton() {
	return (
		<div className="border-2 border-border bg-card p-5">
			<div className="mb-4">
				<div className="h-4 w-3/4 animate-pulse bg-muted mb-2" />
				<div className="h-2 w-16 animate-pulse bg-muted" />
			</div>
			<div className="space-y-2.5">
				{Array.from({ length: 3 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
					<div key={`qskel-${i}`}>
						<div className="flex items-center justify-between mb-1">
							<div className="h-3 w-1/3 animate-pulse bg-muted" />
							<div className="h-3 w-12 animate-pulse bg-muted" />
						</div>
						<div className="w-full h-2 bg-muted" />
					</div>
				))}
			</div>
		</div>
	);
}

function ErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry?: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-20 gap-4">
			<div className="flex h-12 w-12 items-center justify-center border-2 border-destructive/30 text-destructive">
				<AlertTriangle size={20} />
			</div>
			<p
				className="text-xs uppercase tracking-widest text-destructive text-center max-w-md"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{message}
			</p>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Дахин оролдох
				</button>
			)}
		</div>
	);
}

export default function SurveyResultsPage() {
	const params = useParams();
	const router = useRouter();
	const surveyId = params?.id as string;

	const {
		data: insight,
		isLoading: isLoadingInsight,
		isError: isInsightError,
		error: insightError,
		refetch: refetchInsight,
	} = useSurveyInsight(surveyId);

	const {
		data: summariesData,
		isLoading: isLoadingSummaries,
		isError: isSummariesError,
		error: summariesError,
		refetch: refetchSummaries,
	} = usePrimaryQuestionSummaries(surveyId);

	const completionRate =
		insight && insight.visitedCnt > 0
			? Math.round((insight.completedCnt / insight.visitedCnt) * 100)
			: 0;

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
						onClick={() => router.push("/dashboard/surveys")}
					>
						Миний шинжилгээ
					</button>
					<span className="mx-2">/</span>
					<span className="text-foreground">Үр дүн</span>
				</div>

				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<button
						type="button"
						onClick={() => router.push("/dashboard/surveys")}
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
							Шинжилгээний үр дүн
						</h1>
						<p
							className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Survey ID: {surveyId}
						</p>
					</div>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
					{isLoadingInsight ? (
						<>
							<StatCardSkeleton />
							<StatCardSkeleton />
							<StatCardSkeleton />
							<StatCardSkeleton />
							<StatCardSkeleton />
							<StatCardSkeleton />
						</>
					) : isInsightError ? (
						<div className="col-span-full">
							<ErrorState
								message={
									insightError?.message || "Мэдээлэл татахад алдаа гарлаа"
								}
								onRetry={() => refetchInsight()}
							/>
						</div>
					) : (
						<>
							<StatCard
								label="Нийт үзсэн"
								value={String(insight?.visitedCnt ?? 0)}
								icon={<Users size={14} />}
							/>
							<StatCard
								label="Дуусгасан"
								value={String(insight?.completedCnt ?? 0)}
								icon={<CheckCircle size={14} />}
							/>
							<StatCard
								label="Дундаж хугацаа"
								value={`${(insight?.averageMinutes ?? 0).toFixed(1)} мин`}
								icon={<Clock size={14} />}
							/>
							<StatCard
								label="Дуусгах хувь"
								value={`${completionRate}%`}
								icon={<BarChart3 size={14} />}
							/>
							<StatCard
								label="И-мэйл илгээсэн"
								value={String(insight?.emailSentCnt ?? 0)}
								icon={<Mail size={14} />}
							/>
							<StatCard
								label="Дата чанар"
								value={`${(insight?.avgDataQuality ?? 0).toFixed(1)}`}
								icon={<MonitorSmartphone size={14} />}
							/>
						</>
					)}
				</div>

				{/* Question Summaries */}
				{isLoadingSummaries ? (
					<div className="space-y-4">
						<QuestionCardSkeleton />
						<QuestionCardSkeleton />
						<QuestionCardSkeleton />
					</div>
				) : isSummariesError ? (
					<div className="border-2 border-border bg-card overflow-hidden">
						<ErrorState
							message={
								summariesError?.message ||
								"Асуултын мэдээлэл татахад алдаа гарлаа"
							}
							onRetry={() => refetchSummaries()}
						/>
					</div>
				) : summariesData?.content && summariesData.content.length > 0 ? (
					// Simplified: fetches up to 50 questions in one call without pagination UI.
					// Add pagination controls if surveys ever exceed 50 questions.
					<div className="space-y-4">
						{summariesData?.content.map((question) => (
							<QuestionCard key={question.questionId} question={question} />
						))}
					</div>
				) : (
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
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
