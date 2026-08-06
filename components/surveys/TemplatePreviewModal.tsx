"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Eye, HelpCircle, Loader2, Target, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { getTemplateDetail, type TemplateDetail } from "@/lib/api";

interface TemplatePreviewModalProps {
	templateId: string;
	onClose: () => void;
}

export default function TemplatePreviewModal({
	templateId,
	onClose,
}: TemplatePreviewModalProps) {
	const {
		data: detail,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["templateDetail", templateId],
		queryFn: async (): Promise<TemplateDetail> => {
			const res = await getTemplateDetail(templateId);
			if (!res.success)
				throw new Error(res.error || "Failed to fetch template detail");
			return res.data as TemplateDetail;
		},
		enabled: !!templateId,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop
		// biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
			onClick={onClose}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: modal content */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: modal content */}
			<div
				className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border-2 border-border bg-card p-6"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-all duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]"
				>
					<X size={16} />
				</button>

				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-16 gap-3">
						<Loader2 size={20} className="animate-spin text-muted-foreground" />
						<p
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Ачаалж байна...
						</p>
					</div>
				) : isError ? (
					<div className="flex flex-col items-center justify-center py-16 gap-3">
						<Eye size={20} className="text-destructive" />
						<p
							className="text-[10px] uppercase tracking-widest text-destructive text-center"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{error?.message || "Мэдээлэл ачаалахад алдаа гарлаа"}
						</p>
					</div>
				) : detail ? (
					<div className="space-y-5">
						{/* Image */}
						{detail.image && (
							<div className="flex items-center justify-center border-2 border-border bg-input-field-bg p-4">
								<Image
									src={detail.image}
									alt={detail.name}
									width={200}
									height={200}
									className="object-contain"
									unoptimized
								/>
							</div>
						)}

						{/* Stats row */}
						<div
							className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							<span className="inline-flex items-center gap-1.5">
								<HelpCircle size={12} />
								{detail.questionCount} асуулт
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Clock size={12} />
								{detail.minMinutes}-{detail.maxMinutes} мин
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Eye size={12} />
								{detail.frequency}
							</span>
						</div>

						{/* Name */}
						<h2
							className="text-lg font-bold uppercase leading-tight text-foreground"
							style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
						>
							{detail.name}
						</h2>

						{/* Description */}
						<p
							className="text-xs leading-relaxed text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{detail.description}
						</p>

						{/* Importance */}
						{detail.importance && (
							<div>
								<h3
									className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									<Target size={12} className="mr-1.5 inline text-primary" />
									Зорилго, ач холбогдол
								</h3>
								<p
									className="text-xs leading-relaxed text-muted-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									{detail.importance}
								</p>
							</div>
						)}

						{/* When suitable */}
						{detail.whenSuitable && (
							<div>
								<h3
									className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									<Clock size={12} className="mr-1.5 inline text-primary" />
									Хэзээ авбал зохимжтой
								</h3>
								<p
									className="text-xs leading-relaxed text-muted-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									{detail.whenSuitable}
								</p>
							</div>
						)}

						{/* Author */}
						{detail.author && (
							<div>
								<h3
									className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									<User size={12} className="mr-1.5 inline text-primary" />
									Зохиогч
								</h3>
								<p
									className="text-xs leading-relaxed text-muted-foreground"
									style={{ fontFamily: "'JetBrains Mono', monospace" }}
								>
									{detail.author}
								</p>
							</div>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
}
