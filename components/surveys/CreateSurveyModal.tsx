"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	getOptionsPreview,
	templateQuestionsMock,
} from "@/lib/constants/templateQuestions";
import { useCreateSurvey } from "@/lib/hooks/useCreateSurvey";
import type { SurveyTemplate } from "@/lib/hooks/useTemplates";

interface CreateSurveyModalProps {
	template: SurveyTemplate | null;
	onClose: () => void;
	maxAdditionalQuestions?: number;
	maxParticipants?: number;
}

export default function CreateSurveyModal({
	template,
	onClose,
	maxAdditionalQuestions = 5,
	maxParticipants = 300,
}: CreateSurveyModalProps) {
	const [name, setName] = useState(template?.name ?? "");
	const [targetCount, setTargetCount] = useState("");
	const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);
	const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const createSurveyMutation = useCreateSurvey();

	const sortedQuestions = [...templateQuestionsMock].sort(
		(a, b) => a.sortOrder - b.sortOrder,
	);

	useEffect(() => {
		if (!template) return;
		const timeout = setTimeout(() => inputRef.current?.focus(), 50);
		return () => clearTimeout(timeout);
	}, [template]);

	useEffect(() => {
		if (!template) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [template, onClose]);

	if (!template) return null;

	const currentTemplate = template;
	const isNameValid = name.trim().length > 0;
	const isFormValid = isNameValid;

	function toggleAdditional(template: string) {
		setSelectedAdditional((prev) => {
			if (prev.includes(template)) return prev.filter((v) => v !== template);
			if (prev.length >= maxAdditionalQuestions) return prev;
			return [...prev, template];
		});
	}

	function togglePreview(template: string) {
		setExpandedPreview((prev) => (prev === template ? null : template));
	}

	function handleCreate() {
		if (!currentTemplate?.id) {
			toast.error(
				"Загвар сонгогдоогүй байна — хуудсыг дахин ачаалаад дахин оролдоно уу.",
			);
			return;
		}

		const SURVEY_FIELD_MAP = {
			name: "name",
			templateId: "templateId",
			goal: "goal",
			templateQuestions: "templateQuestions",
		};

		const templateQuestions = selectedAdditional;

		const payload = {
			[SURVEY_FIELD_MAP.name]: name.trim(),
			[SURVEY_FIELD_MAP.templateId]: currentTemplate.id,
			[SURVEY_FIELD_MAP.goal]: targetCount
				? Math.max(1, Number(targetCount))
				: 100,
			[SURVEY_FIELD_MAP.templateQuestions]: templateQuestions,
		};

		createSurveyMutation.mutate(payload);
	}

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
				className="relative max-h-[90vh] w-full max-w-md overflow-y-auto border-2 border-border bg-card p-6"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-all duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]"
				>
					<X size={16} />
				</button>

				<h2
					className="mb-1 pr-8 text-lg font-bold uppercase text-foreground"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					Шинэ шинжилгээ үүсгэх
				</h2>
				<p
					className="mb-6 text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					{currentTemplate.name}
				</p>

				{/* Шинжилгээний нэр */}
				<label
					htmlFor="survey-name"
					className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Шинжилгээний нэр
				</label>
				<input
					id="survey-name"
					ref={inputRef}
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="h-10 w-full border-2 border-border bg-input-field-bg px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				/>

				{/* Зорилтот тоо */}
				<label
					htmlFor="survey-target"
					className="mb-2 mt-5 block text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Зорилтот тоо
				</label>
				<input
					id="survey-target"
					type="number"
					value={targetCount}
					onChange={(e) => setTargetCount(e.target.value)}
					placeholder="100"
					min={1}
					className="h-10 w-full border-2 border-border bg-input-field-bg px-3 text-sm text-foreground outline-none transition-colors placeholder:text-placeholder-text focus:border-primary"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				/>
				<p
					className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Багцын дагуу шинжилгээнд нь {maxParticipants} хүртэлх хүн оролцох
					боломжтой.
				</p>

				{/* Бэлэн нэмэлт асуултууд */}
				<div className="mt-5">
					<div className="mb-2 flex items-center gap-3">
						<span
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Бэлэн нэмэлт асуултууд
						</span>
						<span
							className="inline-flex h-5 min-w-[2rem] items-center justify-center border border-border bg-tag-bg px-2 text-[9px] font-bold tabular-nums text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{selectedAdditional.length}/{maxAdditionalQuestions}
						</span>
					</div>
					<p
						className="mb-3 text-[10px] leading-relaxed text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Ажилтны фропайлыг тодорхойлох асуултуудыг нэмж өгснөөр шинжилгээний
						үр дүнг хүн ам зүйн үзүүлэлтээр бүлэглэн, илүү нарийвчлан харах
						боломжтой.
					</p>

					<div className="flex flex-col gap-2">
						{sortedQuestions.map((question) => {
							const isSelected = selectedAdditional.includes(question.template);
							const isDisabled =
								!isSelected &&
								selectedAdditional.length >= maxAdditionalQuestions;
							const isExpanded = expandedPreview === question.template;
							const optionsPreview = getOptionsPreview(question.options);

							return (
								<div key={question.template} className="flex flex-col">
									{/* biome-ignore lint/a11y/useSemanticElements: cannot nest <button> inside <button> */}
									<div
										role="button"
										tabIndex={isDisabled ? -1 : 0}
										aria-disabled={isDisabled}
										onClick={() => {
											if (!isDisabled) toggleAdditional(question.template);
										}}
										onKeyDown={(e) => {
											if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
												e.preventDefault();
												toggleAdditional(question.template);
											}
										}}
										className={`flex items-center gap-3 border-2 px-3 py-2.5 text-left text-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
											isSelected
												? "border-primary/40 bg-primary/10 text-foreground"
												: isDisabled
													? "cursor-not-allowed border-border/50 bg-input-field-bg/50 text-disabled-text"
													: "cursor-pointer border-border bg-input-field-bg text-muted-foreground hover:border-muted-foreground hover:text-foreground"
										}`}
										style={{ fontFamily: "'JetBrains Mono', monospace" }}
									>
										<span
											className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
												isSelected
													? "border-primary bg-primary"
													: isDisabled
														? "border-switch-background bg-transparent"
														: "border-muted-foreground bg-transparent"
											}`}
										>
											{isSelected && (
												<Check
													size={10}
													strokeWidth={3}
													className="text-white"
												/>
											)}
										</span>
										<span className="shrink-0">{question.icon}</span>
										<div className="flex flex-col flex-1 min-w-0">
											<span className="truncate">{question.title}</span>
											{/* biome-ignore lint/a11y/noStaticElementInteractions: inner action inside outer button */}
											<span
												onClick={(e) => {
													e.stopPropagation();
													togglePreview(question.template);
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.stopPropagation();
														togglePreview(question.template);
													}
												}}
												className="text-[9px] text-muted-foreground/70 hover:text-muted-foreground truncate text-left mt-0.5 cursor-pointer"
											>
												{question.content}
												{optionsPreview && (
													<span className="ml-1">
														— Хариулт: {optionsPreview}
													</span>
												)}
											</span>
										</div>
										{isExpanded && (
											<ChevronDown
												size={12}
												className="shrink-0 text-muted-foreground"
											/>
										)}
									</div>
									{isExpanded && (
										<div
											className="border-x-2 border-b-2 border-border/50 bg-input-field-bg/30 px-3 py-2 text-[10px] text-muted-foreground"
											style={{ fontFamily: "'JetBrains Mono', monospace" }}
										>
											<div className="mb-1 font-medium">{question.content}</div>
											{question.options && question.options.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{question.options.map((opt) => (
														<span
															key={opt.order}
															className="inline-flex items-center border border-border bg-tag-bg px-1.5 py-0.5 text-[9px]"
														>
															{opt.content}
														</span>
													))}
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Actions */}
				<div className="mt-6 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 items-center border-2 border-border px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all duration-150 hover:border-muted-foreground hover:text-foreground active:scale-[0.97]"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Цуцлах
					</button>
					<button
						type="button"
						disabled={!isFormValid || createSurveyMutation.isPending}
						onClick={handleCreate}
						className={`inline-flex h-9 items-center border-2 px-5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
							isFormValid && !createSurveyMutation.isPending
								? "border-primary bg-primary text-white hover:bg-accent-hover active:scale-[0.97]"
								: "cursor-not-allowed border-border bg-tag-bg text-disabled-text"
						}`}
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{createSurveyMutation.isPending ? "Түр хүлээнэ үү..." : "Үүсгэх"}
					</button>
				</div>
			</div>
		</div>
	);
}
