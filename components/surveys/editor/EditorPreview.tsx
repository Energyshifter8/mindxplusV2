"use client";

import { Mail, Play, Star as StarIcon } from "lucide-react";
import { useCallback, useState } from "react";
import MindXLogo from "@/components/shared/MindXLogo";
import { PLACEHOLDER, PREVIEW } from "@/lib/helptext";
import { getThemeColors, type ThemeName } from "@/lib/theme";
import type { QuestionItem, SectionType } from "./EditorSidebar";

type PreviewDevice = "desktop" | "tablet" | "mobile";

interface EditorPreviewProps {
	activeSection: SectionType;
	activeQuestionId: string | null;
	questions: QuestionItem[];
	activeQuestion: QuestionItem | null;
	title: string;
	description: string;
	buttonText: string;
	device: PreviewDevice;
	endingTitle: string;
	endingDescription: string;
	theme: ThemeName;
}

const deviceWidths: Record<PreviewDevice, string> = {
	desktop: "100%",
	tablet: "768px",
	mobile: "375px",
};

function OptionIndicator({
	questionType,
	selected,
}: {
	questionType: string;
	selected?: boolean;
}) {
	if (questionType === "MULTI_CHOICE") {
		return (
			<div
				className={`w-3.5 h-3.5 border-2 shrink-0 ${selected ? "border-primary bg-primary" : "border-[#444444]"}`}
			>
				{selected && (
					<svg
						viewBox="0 0 14 14"
						className="w-full h-full text-white p-0.5"
						aria-hidden="true"
					>
						<polyline
							points="2 7 5.5 10.5 12 3.5"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						/>
					</svg>
				)}
			</div>
		);
	}
	return (
		<div
			className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${selected ? "border-primary bg-primary" : "border-[#444444]"}`}
		>
			{selected && (
				<div className="w-1.5 h-1.5 rounded-full bg-white m-auto mt-[3px]" />
			)}
		</div>
	);
}

export default function EditorPreview({
	activeSection,
	activeQuestionId,
	questions,
	activeQuestion,
	title,
	description,
	buttonText,
	device,
	endingTitle,
	endingDescription,
	theme,
}: EditorPreviewProps) {
	const width = deviceWidths[device];
	const themeConfig = getThemeColors(theme);

	const [previewRatings, setPreviewRatings] = useState<
		Record<string, number | null>
	>({});
	const [previewSelectedOptions, setPreviewSelectedOptions] = useState<
		Record<string, Set<number>>
	>({});
	const [previewTextValues, setPreviewTextValues] = useState<
		Record<string, string>
	>({});

	const previewRating = activeQuestionId
		? (previewRatings[activeQuestionId] ?? null)
		: null;
	const previewSelected = activeQuestionId
		? (previewSelectedOptions[activeQuestionId] ?? new Set())
		: new Set();
	const previewText = activeQuestionId
		? (previewTextValues[activeQuestionId] ?? "")
		: "";

	const setPreviewRating = useCallback(
		(val: number | null) => {
			setPreviewRatings((prev) => {
				if (!activeQuestionId) return prev;
				const next = { ...prev };
				if (val === null) {
					delete next[activeQuestionId];
				} else {
					next[activeQuestionId] = val;
				}
				return next;
			});
		},
		[activeQuestionId],
	);

	const toggleOption = useCallback(
		(optIdx: number) => {
			setPreviewSelectedOptions((prev) => {
				if (!activeQuestionId) return prev;
				const next = { ...prev };
				const current = next[activeQuestionId]
					? new Set(next[activeQuestionId])
					: new Set<number>();
				if (current.has(optIdx)) {
					current.delete(optIdx);
				} else {
					current.add(optIdx);
				}
				next[activeQuestionId] = current;
				return next;
			});
		},
		[activeQuestionId],
	);

	const setPreviewText = useCallback(
		(val: string) => {
			setPreviewTextValues((prev) => {
				if (!activeQuestionId) return prev;
				return { ...prev, [activeQuestionId]: val };
			});
		},
		[activeQuestionId],
	);

	const questionPreview = activeQuestion
		? (() => {
				const qt = activeQuestion.questionType;
				if (qt === "TEXT") {
					return (
						<textarea
							value={previewText}
							onChange={(e) => setPreviewText(e.target.value)}
							placeholder={PLACEHOLDER.TEXT_INPUT}
							rows={3}
							className="w-full flex items-start px-3 py-2 text-[11px] outline-none resize-none"
							style={{
								border: `2px solid ${themeConfig.optionBorder}`,
								background: themeConfig.inputBg,
								fontFamily: "'JetBrains Mono', monospace",
								color: themeConfig.txtColor,
							}}
						/>
					);
				}
				if (qt === "STAR_RATING") {
					const starCount = Math.max(5, activeQuestion.options.length || 5);
					return (
						<div className="flex items-center gap-2">
							{Array.from({ length: starCount }).map((_, i) => (
								<button
									// biome-ignore lint/suspicious/noArrayIndexKey: static preview list, order never changes
									key={`star-${i}`}
									type="button"
									className="p-1 cursor-pointer hover:scale-110 transition-transform"
									aria-label={`star-${i + 1}`}
									onClick={() =>
										setPreviewRating(previewRating === i + 1 ? null : i + 1)
									}
								>
									<StarIcon
										size={20}
										className={
											i + 1 <= (previewRating ?? 0)
												? "text-yellow-400 fill-yellow-400"
												: "text-yellow-400"
										}
									/>
								</button>
							))}
						</div>
					);
				}
				if (qt === "NUMBER_RATING") {
					const opts =
						activeQuestion.options.length > 0
							? activeQuestion.options
							: Array.from({ length: 10 }, (_, i) => ({
									order: i + 1,
									content: String(i + 1),
								}));
					return (
						<div className="flex items-center gap-2 flex-wrap">
							{opts.map((opt, idx) => {
								const val = idx + 1;
								const isSelected = previewRating === val;
								return (
									<button
										// biome-ignore lint/suspicious/noArrayIndexKey: static preview list, order never changes
										key={`num-${idx}`}
										type="button"
										onClick={() =>
											setPreviewRating(previewRating === val ? null : val)
										}
										className={`px-3 py-1 border rounded-full text-[11px] cursor-pointer transition-colors ${isSelected ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
									>
										{opt.content}
									</button>
								);
							})}
						</div>
					);
				}
				if (qt === "YES_NO") {
					return (
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setPreviewRating(previewRating === 1 ? null : 1)}
								className={`px-4 py-1 border rounded text-[11px] cursor-pointer transition-colors ${previewRating === 1 ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
							>
								Тийм
							</button>
							<button
								type="button"
								onClick={() => setPreviewRating(previewRating === 2 ? null : 2)}
								className={`px-4 py-1 border rounded text-[11px] cursor-pointer transition-colors ${previewRating === 2 ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
							>
								Үгүй
							</button>
						</div>
					);
				}
				if (qt === "DROPDOWN") {
					const opts =
						activeQuestion.options.length > 0
							? activeQuestion.options
							: [{ order: 1, content: PLACEHOLDER.OPTION }];
					return (
						<select
							className="w-full h-10 border-2 cursor-pointer"
							style={{ background: themeConfig.inputBg }}
						>
							{opts.map((opt, idx) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static preview list, order never changes
								<option key={`opt-${idx}`}>
									{opt.content || `${PLACEHOLDER.OPTION} ${idx + 1}`}
								</option>
							))}
						</select>
					);
				}
				return (
					<div className="space-y-3">
						{activeQuestion.options.length > 0
							? activeQuestion.options.map((opt, idx) => {
									const isSelected = previewSelected.has(idx);
									return (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: static preview list, order never changes
											key={`option-${activeQuestion.id}-${idx}`}
											type="button"
											onClick={() => toggleOption(idx)}
											className="h-10 flex items-center gap-3 px-3 w-full text-left cursor-pointer transition-colors hover:bg-muted/50"
											style={{
												border: `2px solid ${isSelected ? themeConfig.btnBg : themeConfig.optionBorder}`,
												background: isSelected
													? `${themeConfig.btnBg}10`
													: themeConfig.inputBg,
											}}
										>
											<OptionIndicator
												questionType={activeQuestion.questionType}
												selected={isSelected}
											/>
											<span
												className="text-[11px]"
												style={{
													fontFamily: "'JetBrains Mono', monospace",
													color: themeConfig.descColor,
												}}
											>
												{opt.content || `${PLACEHOLDER.OPTION} ${idx + 1}`}
											</span>
											{opt.point > 0 && (
												<span
													className="ml-auto text-[9px]"
													style={{
														fontFamily: "'JetBrains Mono', monospace",
														color: themeConfig.descColor,
													}}
												>
													{opt.point} {PREVIEW.POINTS_SUFFIX}
												</span>
											)}
										</button>
									);
								})
							: Array.from({ length: 3 }, (_, idx) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, order never changes
										key={`empty-${idx}`}
										className="h-10 flex items-center gap-3 px-3"
										style={{
											border: `2px solid ${themeConfig.optionBorder}`,
											background: themeConfig.inputBg,
										}}
									>
										<OptionIndicator
											questionType={activeQuestion.questionType}
										/>
										<span
											className="text-[11px]"
											style={{
												fontFamily: "'JetBrains Mono', monospace",
												color: themeConfig.descColor,
											}}
										>
											{PLACEHOLDER.OPTION} {idx + 1}
										</span>
									</div>
								))}
					</div>
				);
			})()
		: null;

	return (
		<div
			className="flex-1 flex items-center justify-center overflow-auto p-6 relative z-10"
			style={{ background: "var(--background)" }}
		>
			<div
				className="min-h-[500px] flex flex-col transition-[width] duration-300"
				style={{
					width: "100%",
					maxWidth: width,
					background: themeConfig.bgColor,
					border: `2px solid ${themeConfig.optionBorder}`,
				}}
			>
				<div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
					{activeSection === "homepage" && !activeQuestionId && (
						<div
							className="flex flex-col items-center justify-between w-full h-full p-10"
							style={{ background: themeConfig.bgColor }}
						>
							<div className="flex-1 flex flex-col items-center justify-center w-full">
								<h2
									className="text-3xl font-black uppercase mb-3 leading-tight"
									style={{
										fontFamily: "'Barlow Condensed', sans-serif",
										color: themeConfig.txtColor,
									}}
								>
									{title || PLACEHOLDER.SURVEY_NAME}
								</h2>
								<p
									className="text-sm mb-8 max-w-md leading-relaxed"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										color: themeConfig.descColor,
									}}
								>
									{description || PLACEHOLDER.DESCRIPTION}
								</p>
								<button
									type="button"
									className="h-10 px-6 flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										background: themeConfig.btnBg,
										color: themeConfig.btnTxt,
										borderRadius: "20px",
									}}
								>
									<Play size={14} />
									{buttonText || PLACEHOLDER.BUTTON_TEXT}
								</button>
							</div>
							<div className="pt-8 pb-2">
								<MindXLogo size="md" color={themeConfig.txtColor} />
							</div>
						</div>
					)}

					{activeSection === "question" && activeQuestion && (
						<div className="w-full max-w-lg text-left">
							<div className="flex items-center gap-3 mb-3">
								<span
									className="text-[9px] uppercase tracking-widest"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										color: themeConfig.descColor,
									}}
								>
									{PREVIEW.QUESTION_PREFIX}{" "}
									{questions.findIndex((q) => q.id === activeQuestionId) + 1} /{" "}
									{questions.length}
								</span>
								{activeQuestion.isRequired && (
									<span
										className="text-[8px] uppercase tracking-widest px-1.5 py-0.5"
										style={{
											fontFamily: "'JetBrains Mono', monospace",
											color: themeConfig.btnBg,
											border: `1px solid ${themeConfig.btnBg}`,
										}}
									>
										{PREVIEW.REQUIRED_BADGE}
									</span>
								)}
							</div>
							<h3
								className="text-xl font-bold uppercase mb-6"
								style={{
									fontFamily: "'Barlow Condensed', sans-serif",
									color: themeConfig.txtColor,
								}}
							>
								{activeQuestion.title || PLACEHOLDER.QUESTION_TITLE}
							</h3>
							{questionPreview}
						</div>
					)}

					{activeSection === "ending" && !activeQuestionId && (
						<div
							className="flex flex-col items-center justify-between w-full h-full p-10"
							style={{ background: themeConfig.bgColor }}
						>
							<div className="flex-1 flex flex-col items-center justify-center w-full">
								<h2
									className="text-3xl font-black uppercase mb-3 leading-tight"
									style={{
										fontFamily: "'Barlow Condensed', sans-serif",
										color: themeConfig.txtColor,
									}}
								>
									{endingTitle || PLACEHOLDER.ENDING_TITLE}
								</h2>
								<p
									className="text-sm mb-8 max-w-md leading-relaxed"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										color: themeConfig.descColor,
									}}
								>
									{endingDescription || PLACEHOLDER.ENDING_DESCRIPTION}
								</p>
								<div className="flex flex-col items-center gap-3">
									<span
										className="text-[10px] uppercase tracking-widest"
										style={{
											fontFamily: "'JetBrains Mono', monospace",
											color: themeConfig.descColor,
										}}
									>
										Имэйлээр үр дүнгээ хүлээн авах
									</span>
									<div className="flex items-center gap-2">
										<input
											type="email"
											placeholder="Имэйл"
											readOnly
											className="h-10 px-4 text-[11px] w-56 outline-none"
											style={{
												fontFamily: "'JetBrains Mono', monospace",
												borderRadius: "20px",
												color: themeConfig.txtColor,
												background: themeConfig.inputBg,
												border: `1px solid ${themeConfig.inputBorder}`,
											}}
										/>
										<button
											type="button"
											className="h-10 px-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider"
											style={{
												fontFamily: "'JetBrains Mono', monospace",
												background: themeConfig.btnBg,
												color: themeConfig.btnTxt,
												borderRadius: "20px",
											}}
										>
											<Mail size={14} />
											Хариу авах
										</button>
									</div>
								</div>
							</div>
							<div className="pt-8 pb-2">
								<MindXLogo size="md" color={themeConfig.txtColor} />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
