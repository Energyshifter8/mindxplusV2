"use client";

import { AlertTriangle, FilePlus } from "lucide-react";
import { lazy, Suspense, useState } from "react";

const CreateSurveyModal = lazy(
	() => import("@/components/surveys/CreateSurveyModal"),
);

import TemplateCard from "@/components/surveys/TemplateCard";
import type { SurveyTemplate } from "@/lib/hooks/useTemplates";
import { useTemplates } from "@/lib/hooks/useTemplates";

function SectionHeader({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) {
	return (
		<div>
			<h2
				className="mb-1 text-xl font-bold uppercase leading-tight text-foreground"
				style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
			>
				{title}
			</h2>
			<p
				className="mb-6 text-[10px] uppercase tracking-widest text-muted-foreground"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{subtitle}
			</p>
		</div>
	);
}

function CategorySkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<div className="h-5 w-64 animate-pulse bg-muted" />
				<div className="h-3 w-96 animate-pulse bg-muted" />
			</div>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						key={`template-skel-${i}`}
						className="flex flex-col border-2 border-border bg-card"
					>
						<div className="h-40 animate-pulse bg-muted" />
						<div className="space-y-3 p-5">
							<div className="h-5 w-48 animate-pulse bg-muted" />
							<div className="h-3 w-full animate-pulse bg-muted" />
							<div className="h-3 w-3/4 animate-pulse bg-muted" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ErrorState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-20 gap-4">
			<div className="flex h-12 w-12 items-center justify-center border-2 border-destructive/30 text-destructive">
				<AlertTriangle size={20} />
			</div>
			<p
				className="text-xs uppercase tracking-widest text-destructive text-center"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{message}
			</p>
		</div>
	);
}

export default function NewSurveyPage() {
	const [selectedTemplate, setSelectedTemplate] =
		useState<SurveyTemplate | null>(null);
	const { data: categories, isLoading, isError, error } = useTemplates();

	return (
		<div className="p-6 lg:p-10">
			{/* Page header */}
			<div className="mb-10 flex items-center gap-4">
				<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-primary text-primary">
					<FilePlus size={16} />
				</div>
				<div>
					<h1
						className="text-[clamp(1.2rem,3vw,1.8rem)] font-black uppercase leading-none text-foreground"
						style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
					>
						Шинжилгээ үүсгэх
					</h1>
					<p
						className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Загвар сонгон шинжилгээ үүсгэх
					</p>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="space-y-12">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
						<CategorySkeleton key={`cat-skel-${i}`} />
					))}
				</div>
			) : isError ? (
				<ErrorState
					message={error?.message || "Мэдээлэл ачаалахад алдаа гарлаа"}
				/>
			) : !categories || categories.length === 0 ? (
				<ErrorState message="Загвар байхгүй байна" />
			) : (
				<div className="space-y-12">
					{categories.map((category) => (
						<section key={category.categoryId}>
							<SectionHeader
								title={category.categoryName}
								subtitle={category.categoryDescription}
							/>

							{/* Template grid */}
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								{category.templates.map((template) => (
									<TemplateCard
										key={template.id}
										template={template}
										onUse={setSelectedTemplate}
									/>
								))}
							</div>
						</section>
					))}
				</div>
			)}

			{/* Create survey modal */}
			{selectedTemplate && (
				<Suspense fallback={null}>
					<CreateSurveyModal
						key={selectedTemplate.id}
						template={selectedTemplate}
						onClose={() => setSelectedTemplate(null)}
					/>
				</Suspense>
			)}
		</div>
	);
}
