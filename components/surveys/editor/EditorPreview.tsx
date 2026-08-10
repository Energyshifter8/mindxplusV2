"use client";

import { Mail, Play } from "lucide-react";
import { PLACEHOLDER, PREVIEW } from "@/lib/helptext";
import { getThemeColors, type ThemeName } from "@/lib/theme";
import type { QuestionItem, SectionType } from "./EditorSidebar";

type PreviewDevice = "desktop" | "tablet" | "mobile";

function EndLogo() {
	return (
		<svg width="160" height="44" viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="mindX+ logo">
			<path d="M0 32V12.8h4.2l5.8 13.6L15.8 12.8H20V32h-3.8V17.4L11.2 32H8.8L3.8 17.4V32H0Z" fill="#1a1f36" />
			<path d="M22.4 32V12.8h7.6c3.4 0 5.8 2 5.8 4.8 0 2.2-1.2 3.8-3 4.4 2.2.4 3.6 2.2 3.6 4.6 0 3-2.6 5.4-6.2 5.4H22.4Zm3.8-9.2h3.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-3.4v4Zm0 7.6h3.8c1.6 0 2.4-1 2.4-2.2 0-1.2-.8-2.2-2.4-2.2h-3.8v4.4Z" fill="#1a1f36" />
			<path d="M37.2 32V12.8h3.8v15.6h8.4v3.2h-12.2Z" fill="#1a1f36" />
			<path d="M51.2 32V12.8h7.6c3.4 0 5.8 2 5.8 4.8 0 2.2-1.2 3.8-3 4.4 2.2.4 3.6 2.2 3.6 4.6 0 3-2.6 5.4-6.2 5.4H51.2Zm3.8-9.2h3.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-3.4v4Zm0 7.6h3.8c1.6 0 2.4-1 2.4-2.2 0-1.2-.8-2.2-2.4-2.2h-3.8v4.4Z" fill="#1a1f36" />
			<path d="M70.4 12.8L77.6 20l7.2-7.2h4.8L82.8 20.8 90.4 32h-5l-5.6-8.4L74.4 32h-4.8l5.6-8.4L66 12.8h4.4Z" fill="#1a1f36" />
			<circle cx="74" cy="10" r="3.5" fill="#e53e3e" />
			<circle cx="86" cy="10" r="3.5" fill="#dd6b20" />
			<circle cx="74" cy="34" r="3.5" fill="#3182ce" />
			<circle cx="86" cy="34" r="3.5" fill="#38a169" />
			<path d="M98 20v-8h3v8h8v3h-8v8h-3v-8h-8v-3h8Z" fill="#1a1f36" />
		</svg>
	);
}

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

function OptionIndicator({ questionType }: { questionType: string }) {
	if (questionType === "MULTIPLE_CHOICE") {
		return <div className="w-3.5 h-3.5 border-2 border-[#444444] shrink-0" />;
	}
	return (
		<div className="w-3.5 h-3.5 rounded-full border-2 border-[#444444] shrink-0" />
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

	return (
		<div
			className="flex-1 flex items-center justify-center overflow-auto p-6"
			style={{ background: "var(--background)" }}
		>
			<div
				className="min-h-[500px] flex flex-col transition-[width] duration-300"
				style={{
					width,
					maxWidth: "100%",
					background: themeConfig.bgColor,
					border: `2px solid ${themeConfig.optionBorder}`,
				}}
			>
				{/* Preview content */}
				<div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
					{activeSection === "homepage" && !activeQuestionId && (
						<div
							className="flex flex-col items-center justify-between w-full min-h-full p-10"
							style={{ background: "#f5f5e8" }}
						>
							<div className="flex-1 flex flex-col items-center justify-center w-full">
								<h2
									className="text-3xl font-black uppercase mb-3 leading-tight"
									style={{
										fontFamily: "'Barlow Condensed', sans-serif",
										color: "#1a1f36",
									}}
								>
									{title || PLACEHOLDER.SURVEY_NAME}
								</h2>
								<p
									className="text-sm mb-8 max-w-md leading-relaxed"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										color: "#6b7280",
									}}
								>
									{description || PLACEHOLDER.DESCRIPTION}
								</p>
								<button
									type="button"
									className="h-10 px-6 flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-white transition-colors"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										background: "#1a1f36",
										borderRadius: "20px",
									}}
								>
									<Play size={14} />
									{buttonText || PLACEHOLDER.BUTTON_TEXT}
								</button>
							</div>

							{/* mindX+ logo footer */}
							<div className="flex items-center justify-center pb-4 pt-8">
								<EndLogo />
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
							{activeQuestion.questionType === "TEXT" ? (
								<div
									className="w-full h-20 flex items-start px-3 py-2"
									style={{
										border: `2px solid ${themeConfig.optionBorder}`,
										background: themeConfig.inputBg,
									}}
								>
									<span
										className="text-[11px]"
										style={{
											fontFamily: "'JetBrains Mono', monospace",
											color: themeConfig.descColor,
										}}
									>
										{PLACEHOLDER.TEXT_INPUT}
									</span>
								</div>
							) : (
								<div className="space-y-3">
									{activeQuestion.options.length > 0
										? activeQuestion.options.map((opt, idx) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: option list
													key={`option-${activeQuestion.id}-${idx}`}
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
												</div>
											))
										: Array.from({ length: 3 }, (_, idx) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: empty slot list
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
							)}
						</div>
					)}

					{activeSection === "ending" && !activeQuestionId && (
						<div
							className="flex flex-col items-center justify-between w-full min-h-full p-10"
							style={{ background: "#f5f5e8" }}
						>
							<div className="flex-1 flex flex-col items-center justify-center w-full">
								<h2
									className="text-3xl font-black uppercase mb-3 leading-tight"
									style={{
										fontFamily: "'Barlow Condensed', sans-serif",
										color: "#1a1f36",
									}}
								>
									{endingTitle || PLACEHOLDER.ENDING_TITLE}
								</h2>
								<p
									className="text-sm mb-8 max-w-md leading-relaxed"
									style={{
										fontFamily: "'JetBrains Mono', monospace",
										color: "#6b7280",
									}}
								>
									{endingDescription || PLACEHOLDER.ENDING_DESCRIPTION}
								</p>

								{/* Email collection block */}
								<div className="flex flex-col items-center gap-3">
									<span
										className="text-[10px] uppercase tracking-widest"
										style={{
											fontFamily: "'JetBrains Mono', monospace",
											color: "#6b7280",
										}}
									>
										Имэйлээр үр дүнгээ хүлээн авах
									</span>
									<div className="flex items-center gap-2">
										<input
											type="email"
											placeholder="Имэйл"
											readOnly
											className="h-10 px-4 text-[11px] w-56 border border-gray-300 bg-white outline-none"
											style={{
												fontFamily: "'JetBrains Mono', monospace",
												borderRadius: "20px",
												color: "#1a1f36",
											}}
										/>
										<button
											type="button"
											className="h-10 px-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors"
											style={{
												fontFamily: "'JetBrains Mono', monospace",
												background: "#1a1f36",
												borderRadius: "20px",
											}}
										>
											<Mail size={14} />
											Хариу авах
										</button>
									</div>
								</div>
							</div>

							{/* mindX+ logo footer */}
							<div className="flex items-center justify-center pb-4 pt-8">
								<EndLogo />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
