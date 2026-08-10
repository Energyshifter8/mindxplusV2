interface MindXLogoProps {
	size?: "sm" | "md" | "lg";
	color?: string;
}

const sizeMap = {
	sm: { text: "text-base", plus: "text-sm", dot: "w-1.5 h-1.5", gap: "gap-0.5" },
	md: { text: "text-xl", plus: "text-lg", dot: "w-2 h-2", gap: "gap-1" },
	lg: { text: "text-2xl", plus: "text-xl", dot: "w-2.5 h-2.5", gap: "gap-1.5" },
} as const;

export default function MindXLogo({ size = "md", color }: MindXLogoProps) {
	const s = sizeMap[size];
	const fill = color ?? "currentColor";

	return (
		<div className={`flex items-center ${s.gap} select-none`}>
			<span
				className={`${s.text} font-black uppercase tracking-tight`}
				style={{ fontFamily: "'Barlow Condensed', sans-serif", color: fill }}
			>
				mind
			</span>
			<span
				className={`${s.text} font-black uppercase tracking-tight relative`}
				style={{ fontFamily: "'Barlow Condensed', sans-serif", color: fill }}
			>
				X
				<span className={`absolute -top-1 -left-1.5 ${s.dot} rounded-full bg-[#e53e3e]`} />
				<span className={`absolute -top-1 -right-1.5 ${s.dot} rounded-full bg-[#dd6b20]`} />
				<span className={`absolute -bottom-1 -left-1.5 ${s.dot} rounded-full bg-[#3182ce]`} />
				<span className={`absolute -bottom-1 -right-1.5 ${s.dot} rounded-full bg-[#38a169]`} />
			</span>
			<span
				className={`${s.plus} font-bold`}
				style={{ fontFamily: "'Barlow Condensed', sans-serif", color: fill }}
			>
				+
			</span>
		</div>
	);
}
