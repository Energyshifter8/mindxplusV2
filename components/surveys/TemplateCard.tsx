"use client";

import { ClipboardList, Clock, Eye, HelpCircle } from "lucide-react";
import Image from "next/image";
import type { SurveyTemplate } from "@/lib/hooks/useTemplates";

interface TemplateCardProps {
	template: SurveyTemplate;
	onUse: (template: SurveyTemplate) => void;
}

export default function TemplateCard({ template, onUse }: TemplateCardProps) {
	const isDisabled = template.status === "CREATED";

	return (
		<div
			className={`group flex flex-col border-2 border-border bg-card transition-colors ${
				isDisabled ? "opacity-60" : "hover:border-primary"
			}`}
		>
			{/* Image area */}
			<div className="relative flex h-40 items-center justify-center border-b-2 border-border bg-input-field-bg">
				<div
					className="absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage:
							"linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
						backgroundSize: "20px 20px",
					}}
				/>

				{template.imageUrl ? (
					<Image
						src={template.imageUrl}
						alt={template.name}
						width={166}
						height={166}
						sizes="(max-width: 768px) 100vw, 50vw"
						className="relative z-10 object-contain"
						unoptimized
					/>
				) : (
					<ClipboardList
						size={40}
						strokeWidth={1}
						className="relative z-10 text-icon-dim"
					/>
				)}

				{/* CREATED overlay */}
				{isDisabled && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
						<span
							className="border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							ТУН УДАХГҮЙ
						</span>
					</div>
				)}

				{/* hasTrial badge */}
				{template.hasTrial && !isDisabled && (
					<span
						className="absolute right-2 top-2 z-20 border border-primary/50 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						ТУРШИХ
					</span>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col gap-3 p-5">
				<h3
					className="text-base font-bold uppercase leading-tight text-foreground"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					{template.name}
				</h3>
				<p
					className="line-clamp-2 text-xs leading-relaxed text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					{template.description}
				</p>

				{/* Footer stats */}
				<div
					className="mt-auto flex items-center gap-4 pt-2 text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					<span className="inline-flex items-center gap-1.5">
						<HelpCircle size={12} />
						{template.questionCount} асуулт
					</span>
					<span className="inline-flex items-center gap-1.5">
						<Clock size={12} />
						{template.minMinutes}-{template.maxMinutes} мин
					</span>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-border text-muted-foreground transition-all duration-150 hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]"
						title="Урьдчилан харах"
					>
						<Eye size={14} />
					</button>
					<button
						type="button"
						onClick={() => {
							if (!isDisabled) onUse(template);
						}}
						disabled={isDisabled}
						className={`inline-flex h-8 items-center gap-2 border-2 px-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
							isDisabled
								? "cursor-not-allowed border-border bg-tag-bg text-disabled-text"
								: "border-primary bg-primary text-white hover:bg-accent-hover active:scale-[0.97]"
						}`}
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Ашиглах
					</button>
				</div>
			</div>
		</div>
	);
}
