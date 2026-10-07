import type Quill from "quill";

// Staging editor-ийн toolbar = Quill snow-ийн анхдагч (📦 react-quill-д modules өгөөгүй):
// "Normal" (header) picker, B/I/U, link, ordered/bullet list, clear.
export const RICH_TEXT_TOOLBAR = [
	[{ header: [1, 2, 3, false] }],
	["bold", "italic", "underline", "link"],
	[{ list: "ordered" }, { list: "bullet" }],
	["clean"],
];

/** Зөвшөөрсөн format — editor ба read-only харагдацад ижил (бусад нь хаягдана). */
export const RICH_TEXT_FORMATS = [
	"header",
	"bold",
	"italic",
	"underline",
	"link",
	"list",
] as const;

/**
 * Editor-ийн HTML (staging react-quill-ийн утга = `root.innerHTML`). Текстгүй бол ""
 * — staging "<p><br></p>"-г хоосон биш гэж үздэг (mismatches.md).
 */
export function quillHtml(quill: Quill): string {
	return quill.getText().trim() === "" ? "" : quill.root.innerHTML;
}

/** HTML-ийг Quill-ийн clipboard-оор Delta болгож оруулна (зөвшөөрсөн format-аас бусдыг хаяна). */
export function setQuillHtml(quill: Quill, html: string): void {
	const delta = quill.clipboard.convert({ html: html || "" });
	quill.setContents(delta, "silent");
}
