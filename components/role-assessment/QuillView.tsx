"use client";

import Quill from "quill";
import "quill/dist/quill.core.css";
import { useEffect, useRef } from "react";
import { RICH_TEXT_FORMATS, setQuillHtml } from "./wizard/quillShared";

// Rich text-ийн read-only харагдац (D3): HTML-ийг Quill-ийн clipboard-оор Delta болгож
// зөвхөн зөвшөөрсөн format-ыг (header, B/I/U, link, list) үлдээнэ — script/зураг/
// бусад таг хаягдана. Link-ийн протоколыг дахин шалгаж, гадаад линкийг шинэ tab-д.

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function hardenLinks(root: HTMLElement) {
	for (const a of root.querySelectorAll("a")) {
		const href = a.getAttribute("href") ?? "";
		let protocol = "";
		try {
			protocol = new URL(href, window.location.origin).protocol;
		} catch {
			protocol = "";
		}
		if (!SAFE_PROTOCOLS.has(protocol)) {
			a.removeAttribute("href");
			continue;
		}
		a.setAttribute("target", "_blank");
		a.setAttribute("rel", "noopener noreferrer");
	}
}

export default function QuillView({ html }: { html: string }) {
	const hostRef = useRef<HTMLDivElement>(null);
	const quillRef = useRef<Quill | null>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host || quillRef.current) return;
		const mount = document.createElement("div");
		host.appendChild(mount);
		const quill = new Quill(mount, {
			readOnly: true,
			formats: [...RICH_TEXT_FORMATS],
			modules: { toolbar: false },
		});
		quill.root.removeAttribute("contenteditable");
		quill.root.setAttribute("tabindex", "-1");
		quillRef.current = quill;
		return () => {
			quillRef.current = null;
			host.replaceChildren();
		};
	}, []);

	useEffect(() => {
		const quill = quillRef.current;
		if (!quill) return;
		setQuillHtml(quill, html);
		hardenLinks(quill.root);
	}, [html]);

	// quill.core.css layer-гүй тул Tailwind (@layer) override-д `!` хэрэгтэй
	return (
		<div
			ref={hostRef}
			className="[&_.ql-container]:[font-family:inherit]! [&_.ql-container]:[font-size:inherit]! [&_.ql-editor]:cursor-default! [&_.ql-editor]:p-0! [&_.ql-editor]:leading-[1.5]!"
		/>
	);
}
