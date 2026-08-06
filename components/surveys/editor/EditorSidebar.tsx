"use client";

import {
	ChevronDown,
	ChevronRight,
	Flag,
	Home,
	Plus,
	Trash2,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { useRef, useState } from "react";
import type { CreateQuestionPayload } from "@/lib/api";
import { PLACEHOLDER, SIDEBAR } from "@/lib/helptext";
import AddQuestionPopover from "./AddQuestionPopover";

export type SectionType = "homepage" | "question" | "ending";

export interface OptionItem {
	id?: string;
	content: string;
	point: number;
	order: number;
}

export interface QuestionItem {
	id: string;
	title: string;
	questionType: string;
	isRequired: boolean;
	minAnswerCount: number;
	maxAnswerCount: number;
	options: OptionItem[];
	section: string;
	toBeAssessed?: boolean;
}

interface EditorSidebarProps {
	activeSection: SectionType;
	activeQuestionId: string | null;
	questions: QuestionItem[];
	onSectionSelect: (section: SectionType, questionId?: string) => void;
	onDeleteQuestion?: (questionId: string) => void;
	onSwapQuestion?: (questionId: string, direction: "up" | "down") => void;
	onCreateQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
}

export default function EditorSidebar({
	activeSection,
	activeQuestionId,
	questions,
	onSectionSelect,
	onDeleteQuestion,
	onSwapQuestion,
	onCreateQuestion,
}: EditorSidebarProps) {
	const [baseQuestionsExpanded, setBaseQuestionsExpanded] = useState(false);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [popoverPos, setPopoverPos] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const addBtnRef = useRef<HTMLButtonElement>(null);

	const regularQuestions = questions.filter(
		(q) => q.section !== "PRIMARY_QUESTION",
	);
	const baseQuestions = questions.filter(
		(q) => q.section === "PRIMARY_QUESTION",
	);

	function handleAddClick() {
		if (addBtnRef.current) {
			const rect = addBtnRef.current.getBoundingClientRect();
			let top = rect.top;
			const left = rect.right + 8;
			if (top + 500 > window.innerHeight) {
				top = Math.max(16, window.innerHeight - 500);
			}
			setPopoverPos({ top, left });
		}
		setPopoverOpen(true);
	}

	return (
		<div className="w-64 border-r-2 border-border bg-card flex flex-col shrink-0 overflow-y-auto">
			{/* ЭХЛЭЛ */}
			<div className="px-3 pt-4 pb-2">
				<div
					className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2 px-2"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Эхлэл
				</div>
				<button
					type="button"
					onClick={() => onSectionSelect("homepage")}
					className={`w-full flex items-center gap-2.5 px-2 py-2 text-left text-xs transition-colors ${
						activeSection === "homepage" && !activeQuestionId
							? "bg-primary/10 text-primary border-l-2 border-primary"
							: "text-foreground/80 hover:bg-muted border-l-2 border-transparent"
					}`}
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					<Home size={13} />
					Нүүр хуудас
				</button>
			</div>

			{/* АСУУЛТУУД */}
			<div className="px-3 pt-3 pb-2 flex-1">
				<div className="flex items-center justify-between px-2 mb-2">
					<div className="flex items-center gap-2">
						<span
							className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Асуултууд
						</span>
						<span
							className="inline-flex h-4 min-w-[1.5rem] items-center justify-center border border-border bg-muted px-1.5 text-[8px] font-bold tabular-nums text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{regularQuestions.length}/5
						</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="relative">
							<button
								ref={addBtnRef}
								type="button"
								onClick={handleAddClick}
								className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-primary transition-colors"
								title={SIDEBAR.ADD_QUESTION}
							>
								<Plus size={13} />
							</button>
							<AddQuestionPopover
								isOpen={popoverOpen}
								onClose={() => setPopoverOpen(false)}
								onCreateQuestion={onCreateQuestion}
								anchorRef={addBtnRef}
								popoverPos={popoverPos}
							/>
						</div>
					</div>
				</div>

				<div className="space-y-0.5">
					{regularQuestions.map((q, index) => (
						<div key={q.id} className="group relative">
							<button
								type="button"
								onClick={() => onSectionSelect("question", q.id)}
								className={`w-full flex items-center gap-2.5 px-2 py-2 text-left text-xs transition-colors ${
									activeSection === "question" && activeQuestionId === q.id
										? "bg-primary/10 text-primary border-l-2 border-primary"
										: "text-foreground/80 hover:bg-muted border-l-2 border-transparent"
								}`}
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							>
								<span className="text-[11px] text-muted-foreground w-4 text-center shrink-0 tabular-nums">{index + 1}.</span>
								<span className="truncate">
									{q.title || PLACEHOLDER.QUESTION_TITLE}
								</span>
							</button>
							<div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
								{onSwapQuestion && index > 0 && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onSwapQuestion(q.id, "up");
										}}
										className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground"
										title="Дээшлүүлэх"
									>
										<ArrowUp size={11} />
									</button>
								)}
								{onSwapQuestion && index < regularQuestions.length - 1 && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onSwapQuestion(q.id, "down");
										}}
										className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-foreground"
										title="Доошлуулх"
									>
										<ArrowDown size={11} />
									</button>
								)}
								{onDeleteQuestion && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											if (window.confirm("Устгах уу?")) {
												onDeleteQuestion(q.id);
											}
										}}
										className="flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-destructive"
									>
										<Trash2 size={11} />
									</button>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Үндсэн асуултууд */}
				<div className="mt-3">
					<button
						type="button"
						onClick={() => setBaseQuestionsExpanded(!baseQuestionsExpanded)}
						className="w-full flex items-center gap-2 px-2 py-2 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{baseQuestionsExpanded ? (
							<ChevronDown size={12} />
						) : (
							<ChevronRight size={12} />
						)}
						<span className="text-[9px] uppercase tracking-widest">
							Үндсэн асуултууд
						</span>
						<span
							className="inline-flex h-4 min-w-[1.5rem] items-center justify-center border border-border bg-muted px-1.5 text-[8px] font-bold tabular-nums text-muted-foreground ml-auto"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{baseQuestions.length}
						</span>
					</button>
					{baseQuestionsExpanded && (
						<div className="pl-6 space-y-0.5">
							{baseQuestions.map((q, index) => {
								const qId = q.id;
								return (
									<button
										type="button"
										key={qId}
										onClick={() => onSectionSelect("question", qId)}
										className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-[11px] truncate transition-colors ${
											activeSection === "question" && activeQuestionId === qId
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:bg-muted"
										}`}
										style={{ fontFamily: "'JetBrains Mono', monospace" }}
										title={q.title}
									>
										<span className="text-[10px] text-muted-foreground/70 w-4 text-center shrink-0 tabular-nums">{index + 1}.</span>
										{q.title}
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* ТӨГСГӨЛ */}
			<div className="px-3 pb-4 pt-2 border-t border-border">
				<div
					className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2 px-2"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Төгсгөл
				</div>
				<button
					type="button"
					onClick={() => onSectionSelect("ending")}
					className={`w-full flex items-center gap-2.5 px-2 py-2 text-left text-xs transition-colors ${
						activeSection === "ending" && !activeQuestionId
							? "bg-primary/10 text-primary border-l-2 border-primary"
							: "text-foreground/80 hover:bg-muted border-l-2 border-transparent"
					}`}
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					<Flag size={13} />
					Төгсгөл хуудас
				</button>
			</div>
		</div>
	);
}
