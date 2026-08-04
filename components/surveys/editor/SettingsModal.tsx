"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { setSurveyDeviceCheck, setSurveyPasscode } from "@/lib/api";

interface SettingsModalProps {
	surveyId: string;
	isOpen: boolean;
	onClose: () => void;
	deviceCheck: boolean;
	passCodeProtected: boolean;
	onDeviceCheckChange: (value: boolean) => void;
	onPassCodeProtectedChange: (value: boolean) => void;
}

export default function SettingsModal({
	surveyId,
	isOpen,
	onClose,
	deviceCheck,
	passCodeProtected,
	onDeviceCheckChange,
	onPassCodeProtectedChange,
}: SettingsModalProps) {
	const queryClient = useQueryClient();
	const [localDeviceCheck, setLocalDeviceCheck] = useState(deviceCheck);
	const [localPassCodeProtected, setLocalPassCodeProtected] =
		useState(passCodeProtected);
	const [localPassCode, setLocalPassCode] = useState("");

	useEffect(() => {
		if (isOpen) {
			setLocalDeviceCheck(deviceCheck);
			setLocalPassCodeProtected(passCodeProtected);
			setLocalPassCode("");
		}
	}, [isOpen, deviceCheck, passCodeProtected]);

	useEffect(() => {
		if (!isOpen) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const inputClasses =
		"w-full h-10 border-2 border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary transition-colors";

	const handleDeviceCheckToggle = async (nextValue: boolean) => {
		setLocalDeviceCheck(nextValue);
		onDeviceCheckChange(nextValue);

		const res = await setSurveyDeviceCheck(surveyId, String(nextValue));
		if (res.success) {
			toast.success("Хадгаллаа");
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
		} else {
			setLocalDeviceCheck(!nextValue);
			onDeviceCheckChange(!nextValue);
			toast.error("Алдаа гарлаа");
		}
	};

	const handlePasscodeBlur = async () => {
		const res = await setSurveyPasscode(surveyId, localPassCode);
		if (res.success) {
			toast.success("Хадгаллаа");
			queryClient.invalidateQueries({ queryKey: ["surveyDetail", surveyId] });
		} else {
			toast.error("Алдаа гарлаа");
		}
	};

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
					Тохиргоо
				</h2>

				<div className="mb-4">
					<div className="flex items-center justify-between py-2">
						<span
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Нууц үгээр хамгаалах
						</span>
						<button
							type="button"
							role="switch"
							aria-checked={localPassCodeProtected}
							onClick={() => {
								setLocalPassCodeProtected(!localPassCodeProtected);
								onPassCodeProtectedChange(!localPassCodeProtected);
							}}
							className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center transition-colors ${
								localPassCodeProtected ? "bg-primary" : "bg-muted"
							}`}
						>
							<span
								className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform ${
									localPassCodeProtected ? "translate-x-4.5" : "translate-x-0.5"
								}`}
							/>
						</button>
					</div>
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						Нууц код тохируулснаар оролцогчид Шинжилгээнд нэвтрэхдээ код
						оруулна.
					</p>
				</div>

				{localPassCodeProtected && (
					<div className="mb-4">
						<label
							htmlFor="settings-passcode"
							className="mb-2 block text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Нууц үг
						</label>
						<div className="relative">
							<input
								id="settings-passcode"
								type="text"
								maxLength={6}
								value={localPassCode}
								onChange={(e) => setLocalPassCode(e.target.value)}
								onBlur={handlePasscodeBlur}
								placeholder="6 оронтой код"
								className={inputClasses}
								style={{ fontFamily: "'JetBrains Mono', monospace" }}
							/>
							{localPassCode.length === 6 && (
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
									<Check size={16} />
								</span>
							)}
						</div>
					</div>
				)}

				<div className="mb-4">
					<div className="flex items-center justify-between py-2">
						<span
							className="text-[10px] uppercase tracking-widest text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							Төхөөрөмж шалгах
						</span>
						<button
							type="button"
							role="switch"
							aria-checked={localDeviceCheck}
							onClick={() => handleDeviceCheckToggle(!localDeviceCheck)}
							className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center transition-colors ${
								localDeviceCheck ? "bg-primary" : "bg-muted"
							}`}
						>
							<span
								className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform ${
									localDeviceCheck ? "translate-x-4.5" : "translate-x-0.5"
								}`}
							/>
						</button>
					</div>
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						Нэг төхөөрөмжөөс зөвхөн нэг удаа оролцох боломжтой.
					</p>
				</div>
			</div>
		</div>
	);
}
