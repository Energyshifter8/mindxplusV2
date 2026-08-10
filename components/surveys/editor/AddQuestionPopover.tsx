"use client";

import {
	CheckSquare,
	ChevronDown,
	CircleDot,
	Hash,
	Star,
	ToggleLeft,
	Type,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { CreateQuestionPayload } from "@/lib/api";
import {
	type TemplateQuestion,
	templateQuestionsMock,
} from "@/lib/constants/templateQuestions";
import { PLACEHOLDER } from "@/lib/helptext";

interface AddQuestionPopoverProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateQuestion: (payload: CreateQuestionPayload) => Promise<unknown>;
	anchorRef: React.RefObject<HTMLButtonElement | null>;
	popoverPos: { top: number; left: number } | null;
}

const QUESTION_TYPES = [
	{
		value: "SINGLE_CHOICE",
		label: "Нэг сонголттой асуулт",
		icon: CircleDot,
		color: "text-blue-500",
	},
	{
		value: "MULTIPLE_CHOICE",
		label: "Олон сонголттой асуулт",
		icon: CheckSquare,
		color: "text-purple-500",
	},
	{
		value: "TEXT",
		label: "Текст асуулт",
		icon: Type,
		color: "text-green-500",
	},
	{
		value: "DROPDOWN",
		label: "Уналттай асуулт",
		icon: ChevronDown,
		color: "text-orange-500",
	},
	{
		value: "STAR_RATING",
		label: "Зэрэглэл шалгах /Од/",
		icon: Star,
		color: "text-yellow-500",
	},
	{
		value: "NUMBER_RATING",
		label: "Зэрэглэл шалгах /Тоо/",
		icon: Hash,
		color: "text-red-500",
	},
	{
		value: "YES_NO",
		label: "Тийм/үгүй",
		icon: ToggleLeft,
		color: "text-teal-500",
	},
] as const;

function buildBlankPayload(questionType: string): CreateQuestionPayload {
	type Option = CreateQuestionPayload["options"][number];
	function makeOption(order: number, content = ""): Option {
		return { id: 0, order, content, point: 0, tag: "I", nextQuestionId: 0 };
	}

	let options: CreateQuestionPayload["options"] = [];

	if (questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE") {
		options = [makeOption(1), makeOption(2)];
	} else if (questionType === "YES_NO") {
		options = [makeOption(1, "Тийм"), makeOption(2, "Үгүй")];
	} else if (questionType === "STAR_RATING") {
		options = Array.from({ length: 5 }, (_, i) =>
			makeOption(i + 1, `${i + 1} Од`),
		);
	} else if (questionType === "NUMBER_RATING") {
		options = Array.from({ length: 10 }, (_, i) =>
			makeOption(i + 1, `${i + 1} оноо`),
		);
	}

	return {
		id: 0,
		content: PLACEHOLDER.QUESTION_TITLE,
		description: "",
		questionType,
		section: "CUSTOM_QUESTION_FIRST",
		isRequired: true,
		minAnswerCount: 1,
		maxAnswerCount: 1,
		options,
		matrixRows: [],
	};
}

function buildPresetPayload(tmpl: TemplateQuestion): CreateQuestionPayload {
	return {
		id: 0,
		content: tmpl.content,
		description: "",
		questionType: tmpl.questionType,
		section: "CUSTOM_QUESTION_FIRST",
		isRequired: true,
		minAnswerCount: 1,
		maxAnswerCount: 1,
		options: (tmpl.options ?? []).map((opt) => ({
			id: 0,
			order: opt.order,
			content: opt.content,
			point: 0,
			tag: "I",
			nextQuestionId: 0,
		})),
		matrixRows: [],
	};
}

export default function AddQuestionPopover({
	isOpen,
	onClose,
	onCreateQuestion,
	anchorRef,
	popoverPos,
}: AddQuestionPopoverProps) {
	const popoverRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		function handleClickOutside(e: MouseEvent) {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				anchorRef.current &&
				!anchorRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, onClose, anchorRef]);

	useEffect(() => {
		if (!isOpen) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen || !popoverPos) return null;

	async function handleTypeSelect(questionType: string) {
		const payload = buildBlankPayload(questionType);
		await onCreateQuestion(payload);
		onClose();
	}

	async function handlePresetSelect(tmpl: TemplateQuestion) {
		const payload = buildPresetPayload(tmpl);
		await onCreateQuestion(payload);
		onClose();
	}

	const sortedPresets = [...templateQuestionsMock].sort(
		(a, b) => a.sortOrder - b.sortOrder,
	);

	return (
		<div
			ref={popoverRef}
			className="fixed z-[100] w-72 max-h-[80vh] overflow-y-auto border-2 border-border bg-card shadow-lg"
			style={{ top: popoverPos.top, left: popoverPos.left }}
			onPointerDown={(e) => e.stopPropagation()}
		>
			{/* Асуултын төрөл */}
			<div className="p-3">
				<div
					className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Асуултын төрөл
				</div>
				<div className="space-y-0.5">
					{QUESTION_TYPES.map((qt) => {
						const Icon = qt.icon;
						return (
							<button
								key={qt.value}
								type="button"
								onClick={() => handleTypeSelect(qt.value)}
								className="w-full flex items-center gap-2.5 px-2 py-2 text-left text-xs text-foreground/80 hover:bg-muted transition-colors"
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							>
								<Icon size={14} className={qt.color} />
								{qt.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Бэлэн асуулт */}
			<div className="p-3 border-t-2 border-border">
				<div
					className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Бэлэн асуулт
				</div>
				<div className="space-y-0.5">
					{sortedPresets.map((tmpl) => (
						<button
							key={tmpl.template}
							type="button"
							onClick={() => handlePresetSelect(tmpl)}
							className="w-full flex items-center gap-2.5 px-2 py-2 text-left text-xs text-foreground/80 hover:bg-muted transition-colors"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							<span className="shrink-0">{tmpl.icon}</span>
							<span className="truncate">{tmpl.title}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
