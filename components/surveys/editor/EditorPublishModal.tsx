"use client";

import { Calendar, X } from "lucide-react";
import { memo } from "react";
import { BUTTON, PUBLISH_MODAL } from "@/lib/helptext";

interface EditorPublishModalProps {
	publishDate: string;
	onDateChange: (date: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	isPending: boolean;
}

export default memo(function EditorPublishModal({
	publishDate,
	onDateChange,
	onConfirm,
	onCancel,
	isPending,
}: EditorPublishModalProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div
				className="bg-card border-2 border-border p-6 w-full max-w-md mx-4"
				style={{ fontFamily: "'JetBrains Mono', monospace" }}
			>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Calendar size={16} className="text-primary" />
						<h3 className="text-sm font-bold uppercase text-foreground">
							{PUBLISH_MODAL.TITLE}
						</h3>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X size={14} />
					</button>
				</div>

				<p className="text-[11px] text-muted-foreground mb-4">
					{PUBLISH_MODAL.DESCRIPTION}
				</p>

				<div className="mb-6">
					<label
						htmlFor="publish-date"
						className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2"
					>
						{PUBLISH_MODAL.DATE_LABEL}
					</label>
					<input
						id="publish-date"
						type="date"
						value={publishDate}
						onChange={(e) => onDateChange(e.target.value)}
						min={new Date().toISOString().split("T")[0]}
						className="w-full h-10 border-2 border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
					/>
				</div>

				<div className="flex items-center justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
					>
						{BUTTON.CANCEL}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={!publishDate || isPending}
						className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isPending && <span className="animate-spin">⟳</span>}
						{BUTTON.PUBLISH}
					</button>
				</div>
			</div>
		</div>
	);
});
