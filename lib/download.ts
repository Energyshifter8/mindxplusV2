// Файл татах helper-ууд.

/**
 * `Content-Disposition`-оос файлын нэр уншина (RFC 6266).
 * `filename*=UTF-8''…` (RFC 5987)-г `filename=`-ээс түрүүлж авна.
 * Staging #20: `attachment; filename="….pdf"` (ASCII) ✅.
 */
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
		} catch {
			// буруу percent-encoding → энгийн filename-ээр үргэлжлүүлнэ
		}
	}

	const plain = header.match(/filename\s*=\s*("((?:\\.|[^"\\])*)"|[^;]+)/i);
	if (plain) {
		const value = (plain[2] ?? plain[1]).replace(/\\(.)/g, "$1").trim();
		if (value) return sanitizeFilename(value);
	}
	return null;
}

/** Зам (`/`, `\`) болон удирдах тэмдэгтийг хасна. */
function sanitizeFilename(name: string): string {
	return (
		name
			// biome-ignore lint/suspicious/noControlCharactersInRegex: удирдах тэмдэгт хасна
			.replace(/[\u0000-\u001f\u007f/\\]/g, "_")
			.trim() || "download"
	);
}

/** Blob-ийг browser-ийн татах үйлдлээр хадгална. */
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
