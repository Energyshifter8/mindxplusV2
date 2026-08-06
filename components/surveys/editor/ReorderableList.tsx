"use client";

import {
 closestCenter,
 DndContext,
 PointerSensor,
 useDroppable,
 useSensor,
 useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
 SortableContext,
 useSortable,
 verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PLACEHOLDER } from "@/lib/helptext";
import type {
 QuestionCategory,
 ReorderableQuestion,
} from "@/lib/hooks/useReorderQuestions";

interface ReorderableListProps {
 items: Record<QuestionCategory, ReorderableQuestion[]>;
 activeQuestionId: string | null;
 onSelect: (questionId: string) => void;
 onDragEnd: (event: DragEndEvent) => void;
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
 const {
  attributes,
  listeners,
  setNodeRef,
  setActivatorNodeRef,
  transform,
  transition,
  isDragging,
 } = useSortable({ id: question.id });

 const style = {
  transform: CSS.Transform.toString(transform),
  transition,
 };

 return (
  <div
   ref={setNodeRef}
   style={style}
   className={`group relative flex items-center gap-2 px-2 py-2 text-left text-xs transition-colors duration-150 touch-none ${
    isActive
     ? "bg-primary/10 text-primary border-l-2 border-primary"
     : "text-foreground/80 hover:bg-muted border-l-2 border-transparent"
   } ${isDragging ? "z-50 opacity-50 shadow-lg" : ""}`}
  >
   <button
    type="button"
    ref={setActivatorNodeRef}
    className="flex items-center justify-center w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
    {...attributes}
    {...listeners}
    tabIndex={-1}
   >
    <GripVertical size={14} />
   </button>
   <button
    type="button"
    onClick={() => onSelect(question.id)}
    className="flex items-center gap-2 flex-1 min-w-0 text-left"
   >
    <span className="text-[11px] text-muted-foreground w-4 text-center shrink-0 tabular-nums">
     {index + 1}.
    </span>
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
 const { setNodeRef, isOver } = useDroppable({ id: category });

 const questionIds = questions.map((q) => q.id);

 return (
  <div className="mb-3">
   <div
    className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2 px-2"
    style={{ fontFamily: "'JetBrains Mono', monospace" }}
   >
    {CATEGORY_LABELS[category]}
   </div>
   <div
    ref={setNodeRef}
    className={`space-y-0.5 min-h-[40px] rounded-sm transition-colors duration-150 ${
     isOver ? "bg-primary/5 ring-1 ring-primary/30" : ""
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
     <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
      {questions.map((q, idx) => (
       <SortableQuestionItem
        key={q.id}
        question={q}
        index={idx}
        isActive={activeQuestionId !== null && q.id === activeQuestionId}
        onSelect={onSelect}
       />
      ))}
     </SortableContext>
    )}
   </div>
  </div>
 );
}

export default function ReorderableList({
 items,
 activeQuestionId,
 onSelect,
 onDragEnd,
}: ReorderableListProps) {
 const sensors = useSensors(
  useSensor(PointerSensor, {
   activationConstraint: { distance: 4 },
  }),
 );

 return (
  <DndContext
   sensors={sensors}
   collisionDetection={closestCenter}
   onDragEnd={onDragEnd}
  >
   {CATEGORY_ORDER.map((category) => (
    <DroppableSection
     key={category}
     category={category}
     questions={items[category]}
     activeQuestionId={activeQuestionId}
     onSelect={onSelect}
    />
   ))}
  </DndContext>
 );
}
