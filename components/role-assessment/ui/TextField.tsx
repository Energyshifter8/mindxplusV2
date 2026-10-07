"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

// Staging "CustomInput" (📦 module 37593) text/textarea хувилбар + Input (9955).

const INPUT_BASE =
	"flex h-10 w-full rounded-lg border border-Stroke-700 bg-transparent px-3 py-2 font-sf text-[16px] text-TextColor-main transition-colors placeholder:text-TextColor-third focus-visible:border-Primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 read-only:cursor-default";

const STATUS_CLASS = {
	error:
		"!border-Semantic-error500 focus-visible:ring-2 focus-visible:ring-Semantic-error500/25",
	warning:
		"!border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500/25",
} as const;

interface TextFieldProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
	label?: React.ReactNode;
	prefixIcon?: React.ReactNode;
	suffix?: React.ReactNode;
	status?: "error" | "warning";
	/** Тоолуур "n/max" (maxLength-тэй үед) */
	showCounter?: boolean;
	/** Талбарын доорх алдааны мессеж */
	errorText?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	function TextField(
		{
			label,
			prefixIcon,
			suffix,
			status,
			showCounter,
			errorText,
			className,
			id,
			value,
			maxLength,
			required,
			...rest
		},
		ref,
	) {
		const autoId = useId();
		const inputId = id ?? autoId;
		const errorId = errorText ? `${inputId}-error` : undefined;
		const hasAdornment = Boolean(prefixIcon || suffix);
		const input = (
			<input
				ref={ref}
				id={inputId}
				value={value ?? ""}
				maxLength={maxLength}
				required={required}
				aria-invalid={status === "error" || undefined}
				aria-describedby={errorId}
				className={cn(
					INPUT_BASE,
					"border-Stroke-600",
					prefixIcon && "!pl-9",
					suffix && "!pr-9",
					status && STATUS_CLASS[status],
					className,
				)}
				{...rest}
			/>
		);
		return (
			<div className="flex w-full flex-col items-start">
				{label != null ? (
					<label
						htmlFor={inputId}
						className="mb-1 font-semibold text-[14px] text-TextColor-main leading-[140%]"
					>
						{label}
					</label>
				) : (
					// staging CustomInput label-гүй үед ч хоосон <p class="mb-1"> зурдаг (4px)
					<span aria-hidden className="mb-1" />
				)}
				{hasAdornment ? (
					<div className="relative w-full">
						{prefixIcon && (
							<span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-TextColor-third">
								{prefixIcon}
							</span>
						)}
						{input}
						{suffix && (
							<span className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center text-TextColor-third">
								{suffix}
							</span>
						)}
					</div>
				) : (
					input
				)}
				{errorText && (
					<p
						id={errorId}
						className="mt-1 text-[13px] text-Semantic-error500 leading-4"
					>
						{errorText}
					</p>
				)}
				{showCounter && maxLength != null && (
					<p className="mt-2 w-full text-end text-[#868686] text-[13px] leading-4">
						{String(value ?? "").length}/{maxLength}
					</p>
				)}
			</div>
		);
	},
);

interface TextAreaFieldProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: React.ReactNode;
	showCounter?: boolean;
	status?: "error" | "warning";
}

export const TextAreaField = forwardRef<
	HTMLTextAreaElement,
	TextAreaFieldProps
>(function TextAreaField(
	{ label, showCounter, status, className, id, value, maxLength, ...rest },
	ref,
) {
	const autoId = useId();
	const inputId = id ?? autoId;
	return (
		<div className="flex w-full flex-col">
			{label != null && (
				<label
					htmlFor={inputId}
					className="mb-1 font-semibold text-[14px] text-TextColor-main leading-[140%]"
				>
					{label}
				</label>
			)}
			<textarea
				ref={ref}
				id={inputId}
				value={value ?? ""}
				maxLength={maxLength}
				className={cn(
					"flex min-h-[60px] w-full rounded-lg border border-Stroke-600 bg-transparent px-3 py-2 font-sf text-[16px] text-TextColor-main placeholder:text-TextColor-third focus-visible:border-Primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
					status && STATUS_CLASS[status],
					className,
				)}
				{...rest}
			/>
			{showCounter && maxLength != null && (
				<p className="mt-2 w-full text-end text-[#868686] text-[13px] leading-4">
					{String(value ?? "").length}/{maxLength}
				</p>
			)}
		</div>
	);
});
