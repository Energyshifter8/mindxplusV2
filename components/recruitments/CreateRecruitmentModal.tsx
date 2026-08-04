"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCreateRecruitment } from "@/lib/hooks/useCreateRecruitment";

interface CreateRecruitmentModalProps {
	onClose: () => void;
}

export default function CreateRecruitmentModal({
	onClose,
}: CreateRecruitmentModalProps) {
	const [name, setName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const createRecruitmentMutation = useCreateRecruitment();

	useEffect(() => {
		const timeout = setTimeout(() => inputRef.current?.focus(), 50);
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	const isFormValid = name.trim().length > 0;

	function handleCreate() {
		if (!isFormValid) return;
		createRecruitmentMutation.mutate(
			{ name: name.trim() },
			{ onSuccess: () => onClose() },
		);
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
				className="relative w-full max-w-md border-2 border-border bg-card p-6"
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
					className="mb-1 pr-8 text-lg font-bold uppercase text-foreground"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					Шинэ үнэлгээ үүсгэх
				</h2>
				<p
					className="mb-6 text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Талентийн үнэлгээний нэрээ оруулна уу
				</p>

				<label
					htmlFor="recruitment-name"
					className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Үнэлгээний нэр
				</label>
				<input
					id="recruitment-name"
					ref={inputRef}
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && isFormValid) handleCreate();
					}}
					placeholder="Жишээ: Фронтенд ажилтан"
					className="h-10 w-full border-2 border-border bg-input-field-bg px-3 text-sm text-foreground outline-none transition-colors placeholder:text-placeholder-text focus:border-primary"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				/>

				<div className="mt-6 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 items-center border-2 border-border px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all duration-150 hover:border-muted-foreground hover:text-foreground active:scale-[0.97]"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Цуцлах
					</button>
					<button
						type="button"
						disabled={!isFormValid || createRecruitmentMutation.isPending}
						onClick={handleCreate}
						className={`inline-flex h-9 items-center border-2 px-5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 ${
							isFormValid && !createRecruitmentMutation.isPending
								? "border-primary bg-primary text-white hover:bg-accent-hover active:scale-[0.97]"
								: "cursor-not-allowed border-border bg-tag-bg text-disabled-text"
						}`}
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{createRecruitmentMutation.isPending
							? "Түр хүлээнэ үү..."
							: "Үүсгэх"}
					</button>
				</div>
			</div>
		</div>
	);
}
