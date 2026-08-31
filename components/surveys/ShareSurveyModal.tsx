"use client";

import { Check, Copy, Download, X } from "lucide-react";
import QRCode from "qrcode";
import { memo, useCallback, useEffect, useRef, useState } from "react";

const SURVEY_PARTICIPATE_BASE =
	process.env.NEXT_PUBLIC_SURVEY_PARTICIPATE_URL ||
	"https://survey-staging.mindxplus.com";

interface ShareSurveyModalProps {
	surveyId: string;
	open: boolean;
	onClose: () => void;
}

function drawMindXLogo(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	size: number,
) {
	const half = size / 2;

	// white circle background
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.arc(cx, cy, half + 4, 0, Math.PI * 2);
	ctx.fill();

	// "mindX+" text
	ctx.fillStyle = "#141414";
	ctx.font = `bold ${size * 0.55}px sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("mindX+", cx, cy);

	const dotR = size * 0.08;
	const off = half * 0.7;

	const dots = [
		{ color: "#e53e3e", dx: -off, dy: -off },
		{ color: "#dd6b20", dx: off, dy: -off },
		{ color: "#3182ce", dx: -off, dy: off },
		{ color: "#38a169", dx: off, dy: off },
	];
	for (const d of dots) {
		ctx.fillStyle = d.color;
		ctx.beginPath();
		ctx.arc(cx + d.dx, cy + d.dy, dotR, 0, Math.PI * 2);
		ctx.fill();
	}
}

export default memo(function ShareSurveyModal({
	surveyId,
	open,
	onClose,
}: ShareSurveyModalProps) {
	const url = `${SURVEY_PARTICIPATE_BASE}/${surveyId}`;
	const [copied, setCopied] = useState(false);
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const generateQr = useCallback(async () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const size = 300;
		canvas.width = size;
		canvas.height = size;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// draw QR code to canvas
		await QRCode.toCanvas(canvas, url, {
			width: size,
			margin: 2,
			errorCorrectionLevel: "H",
			color: { dark: "#141414", light: "#ffffff" },
		});

		// overlay mindX logo at center
		drawMindXLogo(ctx, size / 2, size / 2, 60);

		setQrDataUrl(canvas.toDataURL("image/png"));
	}, [url]);

	useEffect(() => {
		if (!open) return;
		setCopied(false);
		// small delay to ensure canvas is in DOM
		const t = setTimeout(generateQr, 50);
		return () => clearTimeout(t);
	}, [open, generateQr]);

	useEffect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	if (!open) return null;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// fallback
			const ta = document.createElement("textarea");
			ta.value = url;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleDownload = () => {
		if (!qrDataUrl) return;
		const a = document.createElement("a");
		a.href = qrDataUrl;
		a.download = `survey-${surveyId}-qr.png`;
		a.click();
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop
		// biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
			onClick={onClose}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: modal content */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: modal content */}
			<div
				className="relative max-h-[90vh] w-full max-w-md overflow-y-auto border-2 border-border bg-card p-6"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-all duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]"
				>
					<X size={16} />
				</button>

				<h2
					className="mb-5 pr-8 text-lg font-bold uppercase text-foreground"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					Шинжилгээ хуваалцах
				</h2>

				{/* Share link */}
				<div className="mb-6">
					<span
						className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Шинжилгээнд оролцох холбоос
					</span>
					<div className="flex items-stretch gap-2">
						<div className="flex-1 min-w-0 h-10 border-2 border-border bg-input px-3 flex items-center">
							<span
								className="text-sm text-foreground truncate w-full"
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
								title={url}
							>
								{url}
							</span>
						</div>
						<button
							type="button"
							onClick={handleCopy}
							className="flex items-center gap-1.5 px-3 h-10 shrink-0 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.97]"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{copied ? (
								<>
									<Check size={12} />
									Хуулагдлаа
								</>
							) : (
								<>
									<Copy size={12} />
									Хуулах
								</>
							)}
						</button>
					</div>
				</div>

				{/* QR code */}
				<div>
					<span
						className="mb-3 block text-[10px] uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						QR код татаж хуваалцах
					</span>
					<div className="flex flex-col items-center gap-4">
						<div className="border-2 border-border bg-white p-3">
							<canvas ref={canvasRef} width={300} height={300} />
						</div>
						<button
							type="button"
							onClick={handleDownload}
							disabled={!qrDataUrl}
							className="flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-bold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							<Download size={12} />
							QR татаж авах
						</button>
					</div>
				</div>
			</div>
		</div>
	);
});
