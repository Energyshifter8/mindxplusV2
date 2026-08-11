"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import type { QuestionItem } from "./EditorSidebar";

type QuestionCategory = "CUSTOM_QUESTION_FIRST" | "CUSTOM_QUESTION_LAST";

interface DndQuestionListProps {
	questions: QuestionItem[];
	activeQuestionId: string | null;
	onSectionSelect: (section: "question", questionId: string) => void;
	onDeleteQuestion?: (questionId: string) => void;
	onReorder: (
		activeId: string,
		overId: string,
		activeCategory: QuestionCategory,
		overCategory: QuestionCategory,
		activeIndex: number,
		overIndex: number,
	) => void;
}

function parseSortableId(sortableId: string): {
	category: QuestionCategory;
	index: number;
} {
	const parts = sortableId.split("-");
	const index = Number.parseInt(parts[parts.length - 1], 10);
	const category = sortableId.startsWith("first-")
		? "CUSTOM_QUESTION_FIRST"
		: "CUSTOM_QUESTION_LAST";
	return { category, index };
}

function DroppableZone({
	id,
	isOver,
}: {
	id: QuestionCategory;
	isOver: boolean;
}) {
	const { setNodeRef } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			className={`flex items-center justify-center py-4 border-2 border-dashed transition-colors ${
				isOver ? "border-primary bg-primary/5" : "border-border/50"
			}`}
		>
			<span
				className="text-[9px] uppercase tracking-widest text-muted-foreground/50"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				Энд чирж тавина уу
			</span>
		</div>
	);
}

function SortableQuestionItem({
	question,
	sortableId,
	index,
	isActive,
	onSectionSelect,
	onDeleteQuestion,
}: {
	question: QuestionItem;
	sortableId: string;
	index: number;
	isActive: boolean;
	onSectionSelect: (section: "question", questionId: string) => void;
	onDeleteQuestion?: (questionId: string) => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: sortableId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: (isDragging ? 10 : "auto") as number | "auto",
	};

	return (
		/* biome-ignore lint/a11y/useKeyWithClickEvents: dnd-kit attributes/listeners handle keyboard interaction */
		/* biome-ignore lint/a11y/noStaticElementInteractions: dnd-kit requires interactive div for sortable */
		<div
			ref={setNodeRef}
			style={style}
			onClick={() => onSectionSelect("question", question.id)}
			className={`group relative flex items-center gap-2 px-2 py-2 text-left text-xs transition-colors cursor-grab active:cursor-grabbing ${
				isActive
					? "bg-primary/10 text-primary border-l-2 border-primary"
					: "text-foreground/80 hover:bg-muted border-l-2 border-transparent"
			}`}
			{...attributes}
			{...listeners}
		>
			<GripVertical
				size={11}
				className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
			/>
			<span className="text-[11px] text-muted-foreground w-4 text-center shrink-0 tabular-nums">
				{index + 1}.
			</span>
			<span
				className="truncate flex-1"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				{question.title || "Асуулт"}
			</span>
			{onDeleteQuestion && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						if (window.confirm("Устгах уу?")) {
							onDeleteQuestion(question.id);
						}
					}}
					onPointerDown={(e) => e.stopPropagation()}
					className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 text-muted-foreground hover:text-destructive transition-all"
				>
					<Trash2 size={11} />
				</button>
			)}
		</div>
	);
}

export default function DndQuestionList({
	questions,
	activeQuestionId,
	onSectionSelect,
	onDeleteQuestion,
	onReorder,
}: DndQuestionListProps) {
	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: { distance: 5 },
	});
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: { distance: 5 },
	});
	const keyboardSensor = useSensor(KeyboardSensor, {
		coordinateGetter: sortableKeyboardCoordinates,
	});
	const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

	const firstQuestions = questions.filter(
		(q) => q.section === "CUSTOM_QUESTION_FIRST",
	);
	const lastQuestions = questions.filter(
		(q) => q.section === "CUSTOM_QUESTION_LAST",
	);

	const firstIds = firstQuestions.map((_, i) => `first-${i}`);
	const lastIds = lastQuestions.map((_, i) => `last-${i}`);

	const [activeDragOver, setActiveDragOver] = useState<string | null>(null);
	const [overId, setOverId] = useState<string | null>(null);
	const [overPosition, setOverPosition] = useState<"before" | "after" | null>(
		null,
	);

	function handleDragOver(event: DragOverEvent) {
		const { over } = event;
		if (!over) {
			setActiveDragOver(null);
			setOverId(null);
			setOverPosition(null);
			return;
		}

		const rawOverId = over.id as string;
		// Keep the old category-level flag for droppable zones
		if (
			rawOverId === "CUSTOM_QUESTION_FIRST" ||
			rawOverId === "CUSTOM_QUESTION_LAST"
		) {
			setActiveDragOver(rawOverId);
		} else {
			const parsed = parseSortableId(rawOverId);
			setActiveDragOver(parsed.category);
		}

		// Determine before/after by comparing active top to the over rect midpoint
		let position: "before" | "after" | null = null;
		const activeTop =
			event.active?.rect?.current?.translated?.top ??
			event.active?.rect?.current?.initial?.top ??
			null;
		if (over.rect && activeTop !== null) {
			const midpoint = over.rect.top + over.rect.height / 2;
			position = activeTop < midpoint ? "before" : "after";
		}

		setOverId(rawOverId);
		setOverPosition(position);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		setActiveDragOver(null);
		setOverId(null);
		setOverPosition(null);
		if (!over || active.id === over.id) return;

		const activeParsed = parseSortableId(active.id as string);
		const overParsed = parseSortableId(over.id as string);

		if (
			activeParsed.category === overParsed.category &&
			activeParsed.index === overParsed.index
		)
			return;

		onReorder(
			active.id as string,
			over.id as string,
			activeParsed.category,
			overParsed.category,
			activeParsed.index,
			overParsed.index,
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis]}
		>
			<div className="space-y-3">
				{/* CUSTOM_QUESTION_FIRST */}
				<div>
					<div
						className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 px-2"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Эхлэл
					</div>
					<SortableContext
						items={firstIds}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-0.5">
							{firstQuestions.length > 0 &&
								firstQuestions.map((q, i) => {
									const itemId = `first-${i}`;
									const showBefore =
										(i === 0 &&
											overId === "CUSTOM_QUESTION_FIRST" &&
											overPosition === "before") ||
										(overId === itemId && overPosition === "before");
									const showAfter =
										(i === firstQuestions.length - 1 &&
											overId === "CUSTOM_QUESTION_FIRST" &&
											overPosition === "after") ||
										(overId === itemId && overPosition === "after");
									return (
										<Fragment key={itemId}>
											{showBefore && (
												<div className="mx-2 my-1 h-0.5 w-full bg-primary rounded-full" />
											)}
											<SortableQuestionItem
												question={q}
												sortableId={itemId}
												index={i}
												isActive={activeQuestionId === q.id}
												onSectionSelect={onSectionSelect}
												onDeleteQuestion={onDeleteQuestion}
											/>
											{showAfter && (
												<div className="mx-2 my-1 h-0.5 w-full bg-primary rounded-full" />
											)}
										</Fragment>
									);
								})}
						</div>
					</SortableContext>
					{firstQuestions.length === 0 && (
						<DroppableZone
							id="CUSTOM_QUESTION_FIRST"
							isOver={activeDragOver === "CUSTOM_QUESTION_FIRST"}
						/>
					)}
				</div>

				{/* Divider */}
				<div className="border-t border-border/30 mx-2" />

				{/* CUSTOM_QUESTION_LAST */}
				<div>
					<div
						className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-1 px-2"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Төгсгөл
					</div>
					<SortableContext
						items={lastIds}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-0.5">
							{lastQuestions.length > 0 &&
								lastQuestions.map((q, i) => {
									const itemId = `last-${i}`;
									const showBefore =
										(i === 0 &&
											overId === "CUSTOM_QUESTION_LAST" &&
											overPosition === "before") ||
										(overId === itemId && overPosition === "before");
									const showAfter =
										(i === lastQuestions.length - 1 &&
											overId === "CUSTOM_QUESTION_LAST" &&
											overPosition === "after") ||
										(overId === itemId && overPosition === "after");
									return (
										<Fragment key={itemId}>
											{showBefore && (
												<div className="mx-2 my-1 h-0.5 w-full bg-primary rounded-full" />
											)}
											<SortableQuestionItem
												question={q}
												sortableId={itemId}
												index={i}
												isActive={activeQuestionId === q.id}
												onSectionSelect={onSectionSelect}
												onDeleteQuestion={onDeleteQuestion}
											/>
											{showAfter && (
												<div className="mx-2 my-1 h-0.5 w-full bg-primary rounded-full" />
											)}
										</Fragment>
									);
								})}
						</div>
					</SortableContext>
					{lastQuestions.length === 0 && (
						<DroppableZone
							id="CUSTOM_QUESTION_LAST"
							isOver={activeDragOver === "CUSTOM_QUESTION_LAST"}
						/>
					)}
				</div>
			</div>
		</DndContext>
	);
}
