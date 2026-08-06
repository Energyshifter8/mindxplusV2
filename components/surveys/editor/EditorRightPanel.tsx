"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { PLACEHOLDER, QUESTION, SECTION } from "@/lib/helptext";
import type { QuestionItem, SectionType } from "./EditorSidebar";

const QUESTION_TYPES = [
 { value: "SINGLE_CHOICE", label: QUESTION.TYPE_SINGLE },
 { value: "MULTIPLE_CHOICE", label: QUESTION.TYPE_MULTIPLE },
 { value: "SCALE", label: QUESTION.TYPE_SCALE },
 { value: "TEXT", label: QUESTION.TYPE_TEXT },
 { value: "DROPDOWN", label: QUESTION.TYPE_DROPDOWN },
 { value: "STAR_RATING", label: QUESTION.TYPE_STAR_RATING },
 { value: "NUMBER_RATING", label: QUESTION.TYPE_NUMBER_RATING },
 { value: "YES_NO", label: QUESTION.TYPE_YES_NO },
] as const;

interface EditorRightPanelProps {
 activeSection: SectionType;
 activeQuestionId: string | null;
 activeQuestion: QuestionItem | null;
 title: string;
 description: string;
 buttonText: string;
 endingTitle: string;
 endingDescription: string;
 onTitleChange: (value: string) => void;
 onDescriptionChange: (value: string) => void;
 onButtonTextChange: (value: string) => void;
 onEndingTitleChange: (value: string) => void;
 onEndingDescriptionChange: (value: string) => void;
 onQuestionTitleChange: (questionId: string, value: string) => void;
 onQuestionTypeChange: (questionId: string, value: string) => void;
 onQuestionRequiredChange: (questionId: string, value: boolean) => void;
 onQuestionMinChange: (questionId: string, value: number) => void;
 onQuestionMaxChange: (questionId: string, value: number) => void;
 onOptionContentChange: (
  questionId: string,
  optionIndex: number,
  value: string,
 ) => void;
 onOptionPointChange: (
  questionId: string,
  optionIndex: number,
  value: number,
 ) => void;
 onAddOption: (questionId: string) => void;
 onRemoveOption: (questionId: string, optionIndex: number) => void;
 onOptionReorder: (
  questionId: string,
  oldIndex: number,
  newIndex: number,
 ) => void;
}

function CharacterCounter({ current, max }: { current: number; max: number }) {
 return (
  <span
   className={`text-[9px] tabular-nums ${current > max ? "text-destructive" : "text-muted-foreground"}`}
   style={{ fontFamily: "'JetBrains Mono', monospace" }}
  >
   {current}/{max}
  </span>
 );
}

function FieldLabel({
 children,
 counter,
 max,
}: {
 children: React.ReactNode;
 counter?: number;
 max?: number;
}) {
 return (
  <div className="flex items-center justify-between mb-2">
   <span
    className="text-[10px] uppercase tracking-widest text-muted-foreground"
    style={{ fontFamily: "'JetBrains Mono', monospace" }}
   >
    {children}
   </span>
   {counter !== undefined && max !== undefined && (
    <CharacterCounter current={counter} max={max} />
   )}
  </div>
 );
}

function OptionItem({
 opt,
 idx,
 questionId,
 total,
 onContentChange,
 onPointChange,
 onRemove,
 onReorder,
}: {
 opt: { id?: string; content: string; point: number; order: number };
 idx: number;
 questionId: string;
 total: number;
 onContentChange: (
  questionId: string,
  optionIndex: number,
  value: string,
 ) => void;
 onPointChange: (
  questionId: string,
  optionIndex: number,
  value: number,
 ) => void;
 onRemove: (questionId: string, optionIndex: number) => void;
 onReorder: (questionId: string, oldIndex: number, newIndex: number) => void;
}) {
 return (
  <div className="flex items-center gap-1.5">
   <div className="flex flex-col">
    <button
     type="button"
     onClick={() => idx > 0 && onReorder(questionId, idx, idx - 1)}
     disabled={idx === 0}
     className="flex items-center justify-center w-6 h-4 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
     tabIndex={-1}
    >
     <ChevronUp size={12} />
    </button>
    <button
     type="button"
     onClick={() => idx < total - 1 && onReorder(questionId, idx, idx + 1)}
     disabled={idx === total - 1}
     className="flex items-center justify-center w-6 h-4 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
     tabIndex={-1}
    >
     <ChevronDown size={12} />
    </button>
   </div>
   <input
    type="text"
    value={opt.content}
    onChange={(e) => onContentChange(questionId, idx, e.target.value)}
    placeholder={`${QUESTION.OPTION_CONTENT} ${idx + 1}`}
    className="flex-1 h-8 border-2 border-border bg-input-background px-2 text-xs text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
    style={{ fontFamily: "'JetBrains Mono', monospace" }}
   />
   <input
    type="number"
    value={opt.point}
    onChange={(e) => onPointChange(questionId, idx, Number(e.target.value))}
    className="w-14 h-8 border-2 border-border bg-input-background px-2 text-xs text-foreground outline-none transition-colors focus:border-primary text-center tabular-nums"
    style={{ fontFamily: "'JetBrains Mono', monospace" }}
   />
   <button
    type="button"
    onClick={() => onRemove(questionId, idx)}
    className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive transition-colors shrink-0"
   >
    <Trash2 size={12} />
   </button>
  </div>
 );
}

export default function EditorRightPanel({
 activeSection,
 activeQuestionId,
 activeQuestion,
 title,
 description,
 buttonText,
 endingTitle,
 endingDescription,
 onTitleChange,
 onDescriptionChange,
 onButtonTextChange,
 onEndingTitleChange,
 onEndingDescriptionChange,
 onQuestionTitleChange,
 onQuestionTypeChange,
 onQuestionRequiredChange,
 onQuestionMinChange,
 onQuestionMaxChange,
 onOptionContentChange,
 onOptionPointChange,
 onAddOption,
 onRemoveOption,
 onOptionReorder,
}: EditorRightPanelProps) {
 const inputClasses =
  "w-full h-10 border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground";
 const textareaClasses =
  "w-full border-2 border-border bg-input-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary resize-none placeholder:text-muted-foreground";
 const selectClasses =
  "w-full h-10 border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary appearance-none";

 return (
  <div className="w-80 border-l-2 border-border bg-card flex flex-col shrink-0 overflow-y-auto">
   <div className="p-4">
    <div
     className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-5"
     style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
     {activeSection === "homepage" && SECTION.HOMEPAGE}
     {activeSection === "question" && SECTION.QUESTION}
     {activeSection === "ending" && SECTION.ENDING}
    </div>

    {activeSection === "homepage" && !activeQuestionId && (
     <div className="space-y-5">
      <div>
       <FieldLabel counter={title.length} max={100}>
        Гарчиг
       </FieldLabel>
       <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={PLACEHOLDER.SURVEY_NAME}
        maxLength={100}
        className={inputClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       />
      </div>
      <div>
       <FieldLabel counter={description.length} max={200}>
        Тайлбар
       </FieldLabel>
       <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder={PLACEHOLDER.DESCRIPTION}
        maxLength={200}
        rows={4}
        className={textareaClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       />
      </div>
      <div>
       <FieldLabel counter={buttonText.length} max={20}>
        Товч
       </FieldLabel>
       <input
        type="text"
        value={buttonText}
        onChange={(e) => onButtonTextChange(e.target.value)}
        placeholder={PLACEHOLDER.BUTTON_TEXT}
        maxLength={20}
        className={inputClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       />
      </div>
     </div>
    )}

    {activeSection === "question" && activeQuestion && (
     <div className="space-y-5">
      <div>
       <FieldLabel counter={activeQuestion.title.length} max={100}>
        Асуултын нэр
       </FieldLabel>
       <input
        type="text"
        value={activeQuestion.title}
        onChange={(e) =>
         onQuestionTitleChange(activeQuestion.id, e.target.value)
        }
        placeholder={PLACEHOLDER.QUESTION_TITLE}
        maxLength={100}
        className={inputClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       />
      </div>

      <div>
       <FieldLabel>{QUESTION.TYPE_LABEL}</FieldLabel>
       <select
        value={activeQuestion.questionType}
        onChange={(e) =>
         onQuestionTypeChange(activeQuestion.id, e.target.value)
        }
        className={selectClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       >
        {QUESTION_TYPES.map((qt) => (
         <option key={qt.value} value={qt.value}>
          {qt.label}
         </option>
        ))}
       </select>
      </div>

      <div className="flex items-center justify-between">
       <span
        className="text-[10px] uppercase tracking-widest text-muted-foreground"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       >
        {QUESTION.REQUIRED}
       </span>
       <button
        type="button"
        role="switch"
        aria-checked={activeQuestion.isRequired}
        onClick={() =>
         onQuestionRequiredChange(
          activeQuestion.id,
          !activeQuestion.isRequired,
         )
        }
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center transition-colors ${
         activeQuestion.isRequired ? "bg-primary" : "bg-muted"
        }`}
       >
        <span
         className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform ${
          activeQuestion.isRequired
           ? "translate-x-4.5"
           : "translate-x-0.5"
         }`}
        />
       </button>
      </div>

      {activeQuestion.questionType === "MULTIPLE_CHOICE" && (
       <div className="grid grid-cols-2 gap-3">
        <div>
         <FieldLabel>{QUESTION.MIN_ANSWER}</FieldLabel>
         <input
          type="number"
          min={0}
          max={activeQuestion.maxAnswerCount}
          value={activeQuestion.minAnswerCount}
          onChange={(e) =>
           onQuestionMinChange(
            activeQuestion.id,
            Number(e.target.value),
           )
          }
          className={inputClasses}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
         />
        </div>
        <div>
         <FieldLabel>{QUESTION.MAX_ANSWER}</FieldLabel>
         <input
          type="number"
          min={activeQuestion.minAnswerCount}
          max={activeQuestion.options.length}
          value={activeQuestion.maxAnswerCount}
          onChange={(e) =>
           onQuestionMaxChange(
            activeQuestion.id,
            Number(e.target.value),
           )
          }
          className={inputClasses}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
         />
        </div>
       </div>
      )}

      <div>
       <FieldLabel>{QUESTION.OPTIONS}</FieldLabel>
       <div className="space-y-2">
        {activeQuestion.options.map((opt, idx) => (
         <OptionItem
          key={opt.id ?? `new-${idx}`}
          opt={opt}
          idx={idx}
          questionId={activeQuestion.id}
          total={activeQuestion.options.length}
          onContentChange={onOptionContentChange}
          onPointChange={onOptionPointChange}
          onRemove={onRemoveOption}
          onReorder={onOptionReorder}
         />
        ))}
        <button
         type="button"
         onClick={() => onAddOption(activeQuestion.id)}
         className="flex items-center gap-1.5 w-full h-8 border-2 border-dashed border-border text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary transition-colors justify-center"
         style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
         <Plus size={11} />
         {QUESTION.ADD_OPTION}
        </button>
       </div>
      </div>
     </div>
    )}

    {activeSection === "ending" && !activeQuestionId && (
     <div className="space-y-5">
      <div>
       <FieldLabel counter={endingTitle.length} max={100}>
        Гарчиг
       </FieldLabel>
       <input
        type="text"
        value={endingTitle}
        onChange={(e) => onEndingTitleChange(e.target.value)}
        placeholder={PLACEHOLDER.ENDING_TITLE}
        maxLength={100}
        className={inputClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       />
      </div>
      <div>
       <FieldLabel counter={endingDescription.length} max={200}>
        Тайлбар
       </FieldLabel>
       <textarea
        value={endingDescription}
        onChange={(e) => onEndingDescriptionChange(e.target.value)}
        placeholder={PLACEHOLDER.ENDING_DESCRIPTION}
        maxLength={200}
        rows={4}
        className={textareaClasses}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
       />
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
