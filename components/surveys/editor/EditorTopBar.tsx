"use client";

import {
	ArrowLeft,
	Loader2,
	Monitor,
	Palette,
	Settings,
	Smartphone,
	Tablet,
} from "lucide-react";
import { BUTTON, DEVICE, TOPBAR } from "@/lib/helptext";

type PreviewDevice = "desktop" | "tablet" | "mobile";

interface EditorTopBarProps {
	surveyName: string;
	activeDevice: PreviewDevice;
	onDeviceChange: (device: PreviewDevice) => void;
	onSave: () => void;
	onPublish: () => void;
	onBack: () => void;
	onDesignClick: () => void;
	onSettingsClick: () => void;
	isSaving?: boolean;
	isPublishing?: boolean;
}

const devices: { key: PreviewDevice; icon: typeof Monitor; label: string }[] = [
	{ key: "desktop", icon: Monitor, label: DEVICE.DESKTOP },
	{ key: "tablet", icon: Tablet, label: DEVICE.TABLET },
	{ key: "mobile", icon: Smartphone, label: DEVICE.MOBILE },
];

export default function EditorTopBar({
	surveyName,
	activeDevice,
	onDeviceChange,
	onSave,
	onPublish,
	onBack,
	onDesignClick,
	onSettingsClick,
	isSaving = false,
	isPublishing = false,
}: EditorTopBarProps) {
	return (
		<div className="flex items-center justify-between h-14 px-4 border-b-2 border-border bg-card shrink-0">
			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					onClick={onBack}
					className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors shrink-0"
				>
					<ArrowLeft size={16} />
				</button>
				<h1
					className="text-sm font-bold uppercase text-foreground truncate max-w-[200px]"
					style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
				>
					{surveyName}
				</h1>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onDesignClick}
					className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
					title={TOPBAR.DESIGN}
				>
					<Palette size={16} />
				</button>
				<button
					type="button"
					onClick={onSettingsClick}
					className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
					title={TOPBAR.SETTINGS}
				>
					<Settings size={16} />
				</button>

				<div className="flex items-center border-2 border-border ml-2">
					{devices.map((d) => (
						<button
							type="button"
							key={d.key}
							onClick={() => onDeviceChange(d.key)}
							className={`flex items-center justify-center w-8 h-8 transition-colors ${
								activeDevice === d.key
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:text-foreground hover:bg-muted"
							}`}
							title={d.label}
						>
							<d.icon size={14} />
						</button>
					))}
				</div>

				<div className="flex items-center gap-2 ml-3">
					<button
						type="button"
						onClick={onSave}
						disabled={isSaving}
						className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{isSaving && <Loader2 size={12} className="animate-spin" />}
						{BUTTON.SAVE}
					</button>
					<button
						type="button"
						onClick={onPublish}
						disabled={isPublishing}
						className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{isPublishing && <Loader2 size={12} className="animate-spin" />}
						{BUTTON.PUBLISH}
					</button>
				</div>
			</div>
		</div>
	);
}
