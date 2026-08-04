"use client";

import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, HelpCircle } from "lucide-react";
import { PLACEHOLDER } from "@/lib/helptext";
import type {
	QuestionCategory,
	ReorderableQuestion,
} from "@/lib/hooks/useReorderQuestions";

interface ReorderableListProps {
	items: Record<QuestionCategory, ReorderableQuestion[]>;
	activeQuestionId: string | null;
	onSelect: (questionId: string) => void;
	onDragOver: Parameters<typeof DragDropProvider>[0]["onDragOver"];
	onDragEnd: Parameters<typeof DragDropProvider>[0]["onDragEnd"];
}

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
	CUSTOM_QUESTION_FIRST: "Үндсэн асуултын урд (Эхлэл хэсэг)",
	CUSTOM_QUESTION_LAST: "Үндсэн асуултын хойно (Төгсгөл хэсэг)",
};

const CATEGORY_ORDER: QuestionCategory[] = [
	"CUSTOM_QUESTION_FIRST",
	"CUSTOM_QUESTION_LAST",
];

function SortableQuestionItem({
	question,
	index,
	isActive,
	onSelect,
}: {
	question: ReorderableQuestion;
	index: number;
	isActive: boolean;
	onSelect: (id: string) => void;
}) {
	const { isDragging, isDragSource, handleRef, ref } = useSortable({
		id: question.id,
		index,
		group: question.category,
		data: {
			question,
		},
	});

	return (
		<div
			ref={ref}
			className={`group relative flex items-center gap-2 px-2 py-2 text-left text-xs transition-all duration-150 ${
				isActive
					? "bg-primary/10 text-primary border-l-2 border-primary"
					: "text-foreground/80 hover:bg-muted border-l-2 border-transparent"
			} ${isDragSource ? "opacity-50 scale-[0.98]" : ""} ${
				isDragging ? "z-50 shadow-lg" : ""
			}`}
			style={{
				fontFamily: "'JetBrains Mono', monospace",
				willChange: isDragging ? "transform" : undefined,
			}}
		>
			<button
				type="button"
				ref={handleRef}
				className="flex items-center justify-center w-5 h-5 shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors touch-none"
				tabIndex={-1}
			>
				<GripVertical size={12} />
			</button>
			<button
				type="button"
				onClick={() => onSelect(question.id)}
				className="flex items-center gap-2 flex-1 min-w-0 text-left"
			>
				<HelpCircle size={13} className="shrink-0" />
				<span className="truncate">
					{question.title || PLACEHOLDER.QUESTION_TITLE}
				</span>
			</button>
		</div>
	);
}

function DroppableSection({
	category,
	questions,
	activeQuestionId,
	onSelect,
}: {
	category: QuestionCategory;
	questions: ReorderableQuestion[];
	activeQuestionId: string | null;
	onSelect: (id: string) => void;
}) {
	const { ref, isDropTarget } = useDroppable({
		id: `droppable-${category}`,
		accept: "question",
		data: { category },
	});

	return (
		<div className="mb-3">
			<div
				className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2 px-2"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{CATEGORY_LABELS[category]}
			</div>
			<div
				ref={ref}
				className={`space-y-0.5 min-h-[40px] rounded-sm transition-colors duration-150 ${
					isDropTarget ? "bg-primary/5 ring-1 ring-primary/30" : ""
				}`}
			>
				{questions.length === 0 ? (
					<div
						className="px-3 py-4 text-[10px] text-muted-foreground/50 text-center border border-dashed border-border/50"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Асуулт чирж авчирна уу
					</div>
				) : (
					questions.map((q, idx) => (
						<SortableQuestionItem
							key={q.id}
							question={q}
							index={idx}
							isActive={activeQuestionId !== null && q.id === activeQuestionId}
							onSelect={onSelect}
						/>
					))
				)}
			</div>
		</div>
	);
}

export default function ReorderableList({
	items,
	activeQuestionId,
	onSelect,
	onDragOver,
	onDragEnd,
}: ReorderableListProps) {
	return (
		<DragDropProvider onDragOver={onDragOver} onDragEnd={onDragEnd}>
			{CATEGORY_ORDER.map((category) => (
				<DroppableSection
					key={category}
					category={category}
					questions={items[category]}
					activeQuestionId={activeQuestionId}
					onSelect={onSelect}
				/>
			))}
		</DragDropProvider>
	);
}
