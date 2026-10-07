// Серверийн HTML (тестийн `content`, Quill-ийн HTML)-ийг `<iframe sandbox="" srcDoc>`-д
// харуулахад бэлтгэнэ. Sanitizer биш: iframe sandbox (script, same-origin хоёулаа хаалттай)
// хамгаална (DECISIONS.md D3). Цэвэр функц — alias-гүй.

/**
 * Staging тестийн drawer-ийн regex цэвэрлэгээ (📦 module 29241): `&nbsp;`, хоосон
 * `<p><br></p>`, Quill-ийн `ql-ui` span-ийг хасаж, Quill 2-ын `<ol><li data-list>`-ийг
 * `<ul>`/`<ol>` болгоно.
 */
export function normalizeQuillHtml(html: string): string {
	return html
		.replace(/&nbsp;/g, " ")
		.replace(/<p><br\s*\/?><\/p>/gi, "")
		.replace(/<span[^>]*class="ql-ui"[^>]*>[\s\S]*?<\/span>/gi, "")
		.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_m, inner: string) =>
			inner.includes('data-list="bullet"')
				? `<ul style="list-style-type:disc;padding-left:1.5rem;margin-bottom:0.75rem">${inner.replace(/ data-list="bullet"/g, "")}</ul>`
				: `<ol style="list-style-type:decimal;padding-left:1.5rem;margin-bottom:0.75rem">${inner.replace(/ data-list="ordered"/g, "")}</ol>`,
		);
}

/**
 * Staging-ийн `text-[14px] leading-[22px] [&_*]:!text-TextColor-main [&_p]:mb-3 …`
 * класстай ижил харагдах srcDoc (цагаан "цаас", light).
 */
export function buildContentDoc(html: string): string {
	return `<!doctype html><html><head><meta charset="utf-8"><style>
:root{color-scheme:light}
body{margin:0;padding:24px;background:#fff;font:14px/22px Manrope,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.2px;word-wrap:break-word}
*{color:#10182b!important}
p{margin:0 0 12px;font-size:14px;line-height:22px}
p:last-child{margin-bottom:0}
strong{font-weight:700}
li{margin-bottom:4px}
h1{font-size:22px;font-weight:700;line-height:1.25;margin:0 0 12px}
h2{font-size:18px;font-weight:700;line-height:1.25;margin:0 0 8px}
h3{font-size:16px;font-weight:600;line-height:1.25;margin:0 0 8px}
img{max-width:100%;height:auto}
a{text-decoration:underline}
</style></head><body>${normalizeQuillHtml(html)}</body></html>`;
}
