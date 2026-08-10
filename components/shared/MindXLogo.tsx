interface MindXLogoProps {
	className?: string;
	size?: "sm" | "md" | "lg";
}

const sizes = {
	sm: { width: 100, height: 28 },
	md: { width: 130, height: 36 },
	lg: { width: 160, height: 44 },
} as const;

export default function MindXLogo({
	className = "",
	size = "md",
}: MindXLogoProps) {
	const s = sizes[size];

	return (
		<svg
			width={s.width}
			height={s.height}
			viewBox="0 0 160 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="mindX+ logo"
		>
			<path
				d="M0 32V12.8h4.2l5.8 13.6L15.8 12.8H20V32h-3.8V17.4L11.2 32H8.8L3.8 17.4V32H0Z"
				fill="#1a1f36"
			/>
			<path
				d="M22.4 32V12.8h7.6c3.4 0 5.8 2 5.8 4.8 0 2.2-1.2 3.8-3 4.4 2.2.4 3.6 2.2 3.6 4.6 0 3-2.6 5.4-6.2 5.4H22.4Zm3.8-9.2h3.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-3.4v4Zm0 7.6h3.8c1.6 0 2.4-1 2.4-2.2 0-1.2-.8-2.2-2.4-2.2h-3.8v4.4Z"
				fill="#1a1f36"
			/>
			<path
				d="M37.2 32V12.8h3.8v15.6h8.4v3.2h-12.2Z"
				fill="#1a1f36"
			/>
			<path
				d="M51.2 32V12.8h7.6c3.4 0 5.8 2 5.8 4.8 0 2.2-1.2 3.8-3 4.4 2.2.4 3.6 2.2 3.6 4.6 0 3-2.6 5.4-6.2 5.4H51.2Zm3.8-9.2h3.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-3.4v4Zm0 7.6h3.8c1.6 0 2.4-1 2.4-2.2 0-1.2-.8-2.2-2.4-2.2h-3.8v4.4Z"
				fill="#1a1f36"
			/>
			<path
				d="M70.4 12.8L77.6 20l7.2-7.2h4.8L82.8 20.8 90.4 32h-5l-5.6-8.4L74.4 32h-4.8l5.6-8.4L66 12.8h4.4Z"
				fill="#1a1f36"
			/>
			<circle cx="74" cy="10" r="3.5" fill="#e53e3e" />
			<circle cx="86" cy="10" r="3.5" fill="#dd6b20" />
			<circle cx="74" cy="34" r="3.5" fill="#3182ce" />
			<circle cx="86" cy="34" r="3.5" fill="#38a169" />
			<path
				d="M98 20v-8h3v8h8v3h-8v8h-3v-8h-8v-3h8Z"
				fill="#1a1f36"
			/>
		</svg>
	);
}
