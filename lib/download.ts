export function parseContentDispositionFilename(
	header: string | null | undefined,
): string | null {
	if (!header) return null;

	const extended = header.match(/filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i);
	if (extended) {
		try {
			const value = decodeURIComponent(
				extended[2].trim().replace(/^"|"$/g, ""),
			);
			if (value) return sanitizeFilename(value);
		} catch {}
	}

	const plain = header.match(/filename\s*=\s*("((?:\\.|[^"\\])*)"|[^;]+)/i);
	if (plain) {
		const value = (plain[2] ?? plain[1]).replace(/\\(.)/g, "$1").trim();
		if (value) return sanitizeFilename(value);
	}
	return null;
}

function sanitizeFilename(name: string): string {
	return (
		name
			// biome-ignore lint/suspicious/noControlCharactersInRegex: удирдах тэмдэгт хасна
			.replace(/[\u0000-\u001f\u007f/\\]/g, "_")
			.trim() || "download"
	);
}

export function saveBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.rel = "noopener";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const REPORT_MIME_TYPES = ["application/pdf", "application/octet-stream"];

export function isReportContentType(
	header: string | null | undefined,
): boolean {
	const type = String(header ?? "")
		.split(";")[0]
		.trim()
		.toLowerCase();
	return REPORT_MIME_TYPES.includes(type);
}
