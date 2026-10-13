"use client";

import dynamic from "next/dynamic";

const QuillView = dynamic(() => import("./QuillView"), {
	ssr: false,
	loading: () => <div aria-busy="true" className="h-6 w-full" />,
});

export function RichTextView({ html }: { html: string }) {
	return <QuillView html={html} />;
}
