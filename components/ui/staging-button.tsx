"use client";

import { forwardRef } from "react";

// Staging-ийн "NewCustomButton" (📦 bundle, module 83443) — variant/size-ийн класс ижил.
// TW3 preflight button-д cursor:pointer өгдөг тул идэвхтэй үед cursor-pointer нэмсэн.

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost";
type Size = "small" | "default" | "large";

interface StagingButtonProps {
	variant?: Variant;
	size?: Size;
	title?: string;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	className?: string;
	htmlType?: "button" | "submit" | "reset";
	style?: React.CSSProperties;
	prefixIcon?: React.ReactNode;
	suffixIcon?: React.ReactNode;
	ariaLabel?: string;
}

function sizeClass(size: Size, iconOnly: boolean): string {
	if (iconOnly)
		return size === "small" ? "p-2" : size === "large" ? "p-3" : "p-2.5";
	switch (size) {
		case "small":
			return "px-4 text-[14px] leading-5 min-h-9 max-h-9";
		case "large":
			return "px-9 text-[20px] leading-6 min-h-[56px] max-h-[56px]";
		default:
			return "px-6 text-[16px] leading-5 min-h-10 max-h-10";
	}
}

function iconBox(size: Size, iconOnly: boolean): string {
	if (iconOnly && size === "large") return "w-7 h-7";
	return size === "large" ? "w-5 h-5" : "w-4 h-4";
}

function variantClass(variant: Variant, disabled: boolean): string {
	if (disabled) {
		switch (variant) {
			case "primary":
				return "bg-Primary-softBg text-TextColor-third cursor-not-allowed";
			case "accent":
				return "bg-Gray-200 text-TextColor-disable cursor-not-allowed";
			case "secondary":
				return "bg-Gray-100 text-TextColor-disable cursor-not-allowed";
			case "outline":
				return "bg-white border !border-Stroke-500 text-TextColor-disable cursor-not-allowed";
			default:
				return "bg-transparent text-TextColor-disable cursor-not-allowed";
		}
	}
	switch (variant) {
		case "primary":
			return "cursor-pointer bg-Primary hover:bg-Primary-hover active:bg-Primary-press text-white";
		case "accent":
			return "cursor-pointer text-white bg-Gray-800 hover:bg-Gray-700";
		case "secondary":
			return "cursor-pointer text-TextColor-main bg-Gray-200 hover:text-TextColor-third active:text-TextColor-secondary";
		case "outline":
			return "cursor-pointer text-TextColor-main bg-transparent border border-Stroke-700 hover:bg-Ghost-150 hover:border-Stroke-800 hover:text-TextColor-secondary active:bg-Ghost-200 active:border-Stroke-700 active:text-TextColor-secondary";
		default:
			return "cursor-pointer text-TextColor-secondary hover:bg-Ghost-150 hover:text-TextColor-main active:text-TextColor-secondary";
	}
}

export const StagingButton = forwardRef<HTMLButtonElement, StagingButtonProps>(
	function StagingButton(
		{
			variant = "primary",
			size = "default",
			title,
			disabled = false,
			onClick,
			className = "",
			htmlType = "button",
			style,
			prefixIcon,
			suffixIcon,
			ariaLabel,
		},
		ref,
	) {
		const iconOnly = !title && Boolean(prefixIcon || suffixIcon);
		const base = `group rounded-lg font-sf font-medium transition-colors duration-150 ${sizeClass(size, iconOnly)}`;
		return (
			<button
				ref={ref}
				type={htmlType}
				onClick={onClick}
				disabled={disabled}
				aria-label={ariaLabel}
				style={style}
				className={`${base} ${variantClass(variant, disabled)} ${className} flex items-center justify-center ${iconOnly ? "" : "gap-2"}`}
			>
				{iconOnly ? (
					<span
						className={`${iconBox(size, true)} flex shrink-0 items-center justify-center [&_svg]:size-full [&_svg]:max-h-none [&_svg]:max-w-none [&_svg]:shrink-0`}
					>
						{prefixIcon || suffixIcon}
					</span>
				) : (
					<>
						{prefixIcon && (
							<span
								className={`${iconBox(size, false)} flex items-center justify-center`}
							>
								{prefixIcon}
							</span>
						)}
						{title && <span>{title}</span>}
						{suffixIcon && (
							<span
								className={`${iconBox(size, false)} flex items-center justify-center`}
							>
								{suffixIcon}
							</span>
						)}
					</>
				)}
			</button>
		);
	},
);
