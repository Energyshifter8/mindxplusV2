"use client";

import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import {
	quillHtml,
	RICH_TEXT_FORMATS,
	RICH_TEXT_TOOLBAR,
	setQuillHtml,
} from "./quillShared";

export interface QuillEditorProps {
	value: string;
	onChange: (html: string) => void;
	readOnly?: boolean;
	placeholder?: string;
	ariaLabel: string;
	ariaRequired?: boolean;
}

export default function QuillEditor({
	value,
	onChange,
	readOnly = false,
	placeholder,
	ariaLabel,
	ariaRequired,
}: QuillEditorProps) {
	const hostRef = useRef<HTMLDivElement>(null);
	const quillRef = useRef<Quill | null>(null);
	const lastHtml = useRef(value);
	const onChangeRef = useRef(onChange);
	const initial = useRef({
		value,
		readOnly,
		placeholder,
		ariaLabel,
		ariaRequired,
	});

	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	useEffect(() => {
		const host = hostRef.current;
		if (!host || quillRef.current) return;
		const init = initial.current;
		const mount = document.createElement("div");
		host.appendChild(mount);
		const quill = new Quill(mount, {
			theme: "snow",
			readOnly: init.readOnly,
			placeholder: init.placeholder,
			formats: [...RICH_TEXT_FORMATS],
			modules: { toolbar: RICH_TEXT_TOOLBAR },
		});
		setQuillHtml(quill, init.value);
		lastHtml.current = quillHtml(quill);
		quill.root.setAttribute("role", "textbox");
		quill.root.setAttribute("aria-multiline", "true");
		quill.root.setAttribute("aria-label", init.ariaLabel);
		if (init.ariaRequired) quill.root.setAttribute("aria-required", "true");
		const handleChange = () => {
			const html = quillHtml(quill);
			lastHtml.current = html;
			onChangeRef.current(html);
		};
		quill.on("text-change", handleChange);
		quillRef.current = quill;
		return () => {
			quill.off("text-change", handleChange);
			quillRef.current = null;
			host.replaceChildren();
		};
	}, []);

	useEffect(() => {
		const quill = quillRef.current;
		if (!quill || value === lastHtml.current) return;
		setQuillHtml(quill, value);
		lastHtml.current = quillHtml(quill);
	}, [value]);

	useEffect(() => {
		quillRef.current?.enable(!readOnly);
	}, [readOnly]);

	return <div ref={hostRef} className="ra-quill" />;
}
