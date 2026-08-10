interface MindXLogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

const sizes = {
	sm: { width: 100, height: 28, fontSize: 18, dotRadius: 2.5, plusSize: 16 },
	md: { width: 130, height: 36, fontSize: 23, dotRadius: 3, plusSize: 20 },
	lg: { width: 160, height: 44, fontSize: 28, dotRadius: 3.5, plusSize: 24 },
} as const;

export default function MindXLogo({
	className = "",
	size = "md",
}: MindXLogoProps) {
	const s = sizes[size];
	const fill = "#1a1f36";

	return (
		<svg
			width={s.width}
			height={s.height}
			viewBox={`0 0 ${s.width} ${s.height}`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="mindX+ logo"
		>
			<text
				x="0"
				y={s.fontSize + 2}
				fontFamily="'Barlow Condensed', sans-serif"
				fontWeight="900"
				fontSize={s.fontSize}
				fill={fill}
				letterSpacing="-0.5"
			>
				mind
			</text>
			<text
				x={s.fontSize * 2.4}
				y={s.fontSize + 2}
				fontFamily="'Barlow Condensed', sans-serif"
				fontWeight="900"
				fontSize={s.fontSize}
				fill={fill}
			>
				X
			</text>
			<circle
				cx={s.fontSize * 2.4 - 5}
				cy={s.fontSize * 0.5}
				r={s.dotRadius}
				fill="#e53e3e"
			/>
			<circle
				cx={s.fontSize * 2.4 + 13}
				cy={s.fontSize * 0.5}
				r={s.dotRadius}
				fill="#dd6b20"
			/>
			<circle
				cx={s.fontSize * 2.4 - 5}
				cy={s.fontSize + 2 - 2}
				r={s.dotRadius}
				fill="#3182ce"
			/>
			<circle
				cx={s.fontSize * 2.4 + 13}
				cy={s.fontSize + 2 - 2}
				r={s.dotRadius}
				fill="#38a169"
			/>
			<text
				x={s.fontSize * 2.4 + 22}
				y={s.fontSize + 2}
				fontFamily="'Barlow Condensed', sans-serif"
				fontWeight="700"
				fontSize={s.plusSize}
				fill={fill}
			>
				+
			</text>
		</svg>
	);
}
