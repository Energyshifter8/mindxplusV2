"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Staging "NewCustomButton" (📦 module 83443) — variant/size-ийн класс ижил.
// Нэмэлт: keyboard focus-visible ring (a11y, staging-д байхгүй — mismatches.md).

export type RaButtonVariant =
	| "primary"
	| "accent"
	| "secondary"
	| "outline"
	| "ghost";
export type RaButtonSize = "small" | "default" | "large";

export interface RaButtonProps {
	variant?: RaButtonVariant;
	size?: RaButtonSize;
	title?: React.ReactNode;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	className?: string;
	htmlType?: "button" | "submit" | "reset";
	prefixIcon?: React.ReactNode;
	suffixIcon?: React.ReactNode;
	ariaLabel?: string;
	/** Disabled үед шалтгаан (tooltip) */
	disabledReason?: string;
	"aria-pressed"?: boolean;
}

function sizeClass(size: RaButtonSize, iconOnly: boolean): string {
	if (iconOnly) {
		return size === "small" ? "p-2" : size === "large" ? "p-3" : "p-2.5";
	}
	switch (size) {
		case "small":
			return "px-4 text-[14px] leading-5 min-h-9 max-h-9";
		case "large":
			return "px-9 text-[20px] leading-6 min-h-[56px] max-h-[56px]";
		default:
			return "px-6 text-[16px] leading-5 min-h-10 max-h-10";
	}
}

function iconBox(size: RaButtonSize, iconOnly: boolean): string {
	if (iconOnly && size === "large") return "w-7 h-7";
	return size === "large" ? "w-5 h-5" : "w-4 h-4";
}

function variantClass(variant: RaButtonVariant, disabled: boolean): string {
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

export const RaButton = forwardRef<HTMLButtonElement, RaButtonProps>(
	function RaButton(
		{
			variant = "primary",
			size = "default",
			title,
			disabled = false,
			onClick,
			className,
			htmlType = "button",
			prefixIcon,
			suffixIcon,
			ariaLabel,
			disabledReason,
			"aria-pressed": ariaPressed,
		},
		ref,
	) {
		const iconOnly = !title && Boolean(prefixIcon || suffixIcon);
		const button = (
			<button
				ref={ref}
				type={htmlType}
				onClick={onClick}
				disabled={disabled}
				aria-label={ariaLabel}
				aria-pressed={ariaPressed}
				className={cn(
					"group flex items-center justify-center rounded-lg font-medium font-sf transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40",
					sizeClass(size, iconOnly),
					variantClass(variant, disabled),
					!iconOnly && "gap-2",
					className,
				)}
			>
				{iconOnly ? (
					<span
						className={cn(
							iconBox(size, true),
							"flex shrink-0 items-center justify-center [&_svg]:size-full [&_svg]:max-h-none [&_svg]:max-w-none [&_svg]:shrink-0",
						)}
					>
						{prefixIcon || suffixIcon}
					</span>
				) : (
					<>
						{prefixIcon && (
							<span
								className={cn(
									iconBox(size, false),
									"flex items-center justify-center",
								)}
							>
								{prefixIcon}
							</span>
						)}
						{title != null && <span>{title}</span>}
						{suffixIcon && (
							<span
								className={cn(
									iconBox(size, false),
									"flex items-center justify-center",
								)}
							>
								{suffixIcon}
							</span>
						)}
					</>
				)}
			</button>
		);
		if (disabled && disabledReason) {
			return (
				<span title={disabledReason} className="inline-flex">
					{button}
				</span>
			);
		}
		return button;
	},
);
