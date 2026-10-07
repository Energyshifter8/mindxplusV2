"use client";

import dynamic from "next/dynamic";
import type { QuillEditorProps } from "./QuillEditor";

// Quill нь `document`-д хандаж import хийгддэг тул SSR-гүй, зөвхөн wizard-д lazy.
const QuillEditor = dynamic(() => import("./QuillEditor"), {
	ssr: false,
	loading: () => (
		<div
			aria-busy="true"
			className="h-[242px] w-full animate-pulse rounded-[2px] border border-[#ccc] bg-Gray-50"
		/>
	),
});

/** Staging-ийн `[&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]` wrapper-тай. */
export function RichTextEditor(props: QuillEditorProps) {
	return (
		<div className="[&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px]">
			<QuillEditor {...props} />
		</div>
	);
}
