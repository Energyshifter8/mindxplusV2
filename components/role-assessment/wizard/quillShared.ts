import type Quill from "quill";

export const RICH_TEXT_TOOLBAR = [
	[{ header: [1, 2, 3, false] }],
	["bold", "italic", "underline", "link"],
	[{ list: "ordered" }, { list: "bullet" }],
	["clean"],
];

export const RICH_TEXT_FORMATS = [
	"header",
	"bold",
	"italic",
	"underline",
	"link",
	"list",
] as const;

export function quillHtml(quill: Quill): string {
	return quill.getText().trim() === "" ? "" : quill.root.innerHTML;
}

export function setQuillHtml(quill: Quill, html: string): void {
	const delta = quill.clipboard.convert({ html: html || "" });
	quill.setContents(delta, "silent");
}
