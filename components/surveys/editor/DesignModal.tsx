"use client";

import { Check, ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { type ThemeName, themes } from "@/lib/theme";

export type { ThemeName };

const THEME_PREVIEWS: { key: ThemeName; label: string }[] = [
	{ key: "light", label: "Light" },
	{ key: "yale", label: "Yale" },
	{ key: "mirage", label: "Mirage" },
	{ key: "dark", label: "Dark" },
	{ key: "purple", label: "Purple" },
];

interface DesignModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentTheme: ThemeName;
	onThemeChange: (theme: ThemeName) => void;
	onLogoUpload: (file: File) => void;
	hideWatermark: boolean;
	onHideWatermarkChange: (value: boolean) => void;
}

export default function DesignModal({
	isOpen,
	onClose,
	currentTheme,
	onThemeChange,
	onLogoUpload,
	hideWatermark,
	onHideWatermarkChange,
}: DesignModalProps) {
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		onLogoUpload(file);
		const url = URL.createObjectURL(file);
		setLogoPreview(url);
	}

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
					Дизайн
				</h2>

				{/* Зураг section */}
				<div className="mb-6">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: decorative label */}
					<label
						className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Зураг
					</label>
					<div className="relative">
						<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground transition-colors">
							<input
								type="file"
								accept="image/png,image/jpeg"
								className="hidden"
								onChange={handleFileChange}
							/>
							{logoPreview ? (
								// biome-ignore lint/performance/noImgElement: dynamic preview
								<img
									src={logoPreview}
									alt="Logo preview"
									className="max-h-full object-contain p-2"
								/>
							) : (
								<div className="flex flex-col items-center gap-1.5">
									<ImagePlus size={24} className="text-muted-foreground" />
									<span
										className="text-[10px] text-muted-foreground"
										style={{ fontFamily: "'JetBrains Mono', monospace" }}
									>
										Лого зураг оруулах
									</span>
									<span
										className="text-[9px] text-muted-foreground/70"
										style={{ fontFamily: "'JetBrains Mono', monospace" }}
									>
										Хэмжээ: 200kb хүртэл
									</span>
									<span
										className="text-[9px] text-muted-foreground/70"
										style={{ fontFamily: "'JetBrains Mono', monospace" }}
									>
										Формат: PNG, JPEG
									</span>
								</div>
							)}
						</label>
						{logoPreview && (
							<button
								type="button"
								onClick={() => {
									setLogoPreview(null);
								}}
								className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
							>
								<X size={10} />
							</button>
						)}
					</div>
				</div>

				{/* Загварууд section */}
				<div className="mb-6">
					{/* biome-ignore lint/a11y/noLabelWithoutControl: decorative label */}
					<label
						className="mb-3 block text-[10px] uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Загварууд
					</label>
					<div className="grid grid-cols-2 gap-3">
						{THEME_PREVIEWS.map((t) => {
							const theme = themes[t.key];
							const isSelected = currentTheme === t.key;
							return (
								<button
									key={t.key}
									type="button"
									onClick={() => onThemeChange(t.key)}
									className={`flex flex-col items-center p-3 border-2 rounded-md transition-all duration-200 ease-out cursor-pointer
									active:scale-[0.96]
									${
										isSelected
											? "border-primary ring-2 ring-primary/30 scale-[1.02] shadow-md"
											: "border-border hover:border-muted-foreground hover:scale-[1.03] hover:shadow-sm"
									}`}
								>
									<div className="relative w-full">
										<div
											className="w-full h-16 flex flex-col items-center justify-center gap-1 mb-2 transition-colors duration-200"
											style={{
												background: theme.bgColor,
												border: `1px solid ${theme.optionBorder}`,
											}}
										>
											<span
												className="text-[8px] font-bold uppercase"
												style={{
													color: theme.txtColor,
													fontFamily: "'Barlow Condensed', sans-serif",
												}}
											>
												Асуулт
											</span>
											<div
												className="w-16 h-1.5 rounded-sm"
												style={{ background: theme.descColor }}
											/>
											<div
												className="w-10 h-1 rounded-sm"
												style={{ background: theme.descColor, opacity: 0.6 }}
											/>
											<div
												className="px-3 py-0.5 text-[7px] font-bold uppercase"
												style={{
													background: theme.btnBg,
													color: theme.btnTxt,
												}}
											>
												Эхлэх
											</div>
										</div>
										{isSelected && (
											<div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-200">
												<Check
													size={10}
													className="text-primary-foreground"
													strokeWidth={3}
												/>
											</div>
										)}
									</div>
									<span
										className="text-[10px] font-bold text-foreground"
										style={{ fontFamily: "'JetBrains Mono', monospace" }}
									>
										{t.label}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* mindX+ лого section */}
				<div className="flex items-center justify-between py-3 border-t border-border">
					<span
						className="text-[10px] uppercase tracking-widest text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						mindX+ таних тэмдэг арилгах
					</span>
					<button
						type="button"
						onClick={() => onHideWatermarkChange(!hideWatermark)}
						className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center transition-colors duration-200 ${
							hideWatermark ? "bg-primary" : "bg-switch-background"
						}`}
					>
						<span
							className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform duration-200 ${
								hideWatermark ? "translate-x-[18px]" : "translate-x-[3px]"
							}`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
