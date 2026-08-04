"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";

type Tab = "login" | "signup";

interface LoginResponse {
	token?: string;
	accessToken?: string;
	message?: string;
}

function GridTexture() {
	return (
		<div
			className="absolute inset-0 pointer-events-none"
			style={{
				backgroundImage: `
          linear-gradient(rgba(11,154,70,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(11,154,70,0.06) 1px, transparent 1px)
        `,
				backgroundSize: "40px 40px",
			}}
		/>
	);
}

function GoogleIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Google</title>
			<path
				d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
				fill="#4285F4"
			/>
			<path
				d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
				fill="#34A853"
			/>
			<path
				d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
				fill="#FBBC05"
			/>
			<path
				d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
				fill="#EA4335"
			/>
		</svg>
	);
}

function LoginForm({
	onSwitch,
	loading,
	onSubmit,
}: {
	onSwitch: () => void;
	loading: boolean;
	onSubmit: (email: string, password: string) => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const e: Record<string, string> = {};
		if (!email.trim()) e.email = "Имэйл шаардлагатай";
		else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Буруу имэйл хаяг";
		if (!password) e.password = "Нууц үг шаардлагатай";
		else if (password.length < 6) e.password = "Хамгийн багадаа 6 тэмдэгт";
		return e;
	};

	const handleSubmit = (ev: React.FormEvent) => {
		ev.preventDefault();
		const e = validate();
		setErrors(e);
		if (Object.keys(e).length === 0) {
			onSubmit(email, password);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
			<Field>
				<FieldLabel>Имэйл</FieldLabel>
				<Input
					id="login-email"
					type="email"
					placeholder="you@domain.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					aria-invalid={!!errors.email}
				/>
				<FieldDescription>Нэвтрэх имэйл хаягаа оруулна уу</FieldDescription>
				{errors.email && <FieldError>{errors.email}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Нууц үг</FieldLabel>
				<div className="relative">
					<Input
						id="login-password"
						type={showPw ? "text" : "password"}
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						aria-invalid={!!errors.password}
					/>
					<button
						type="button"
						onClick={() => setShowPw((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						{showPw ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				</div>
				{errors.password && <FieldError>{errors.password}</FieldError>}
			</Field>

			<div className="flex justify-end">
				<Button
					type="button"
					variant="link"
					className="text-xs text-muted-foreground p-0 h-auto"
				>
					Нууц үгээ мартсан?
				</Button>
			</div>

			<Button
				type="submit"
				disabled={loading}
				className="w-full active:scale-[0.97]"
			>
				{loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
			</Button>

			<div className="flex items-center gap-3">
				<div className="flex-1 h-[1px] bg-border" />
				<span className="text-xs text-muted-foreground uppercase tracking-widest">
					ЭСВЭЛ
				</span>
				<div className="flex-1 h-[1px] bg-border" />
			</div>

			<Button
				type="button"
				variant="outline"
				className="w-full gap-3 active:scale-[0.97]"
			>
				<GoogleIcon />
				Google-ээр үргэлжлүүлэх
			</Button>

			<p className="text-center text-xs text-muted-foreground">
				Бүртгэлгүй юу?{" "}
				<Button
					type="button"
					variant="link"
					onClick={onSwitch}
					className="p-0 h-auto"
				>
					Бүртгүүлэх
				</Button>
			</p>
		</form>
	);
}

function SignUpForm({
	onSwitch,
	loading,
	onSubmit,
}: {
	onSwitch: () => void;
	loading: boolean;
	onSubmit: (email: string, password: string) => void;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [showCp, setShowCp] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = () => {
		const e: Record<string, string> = {};
		if (!email.trim()) e.email = "Имэйл шаардлагатай";
		else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Буруу имэйл хаяг";
		if (!password) e.password = "Нууц үг шаардлагатай";
		else if (password.length < 8) e.password = "Хамгийн багадаа 8 тэмдэгт";
		if (!confirm) e.confirm = "Нууц үгээ оруулна уу";
		else if (confirm !== password) e.confirm = "Нууц үг таарахгүй байна";
		if (!agreed) e.terms = "Нөхцөлийг зөвшөөрөх шаардлагатай";
		return e;
	};

	const handleSubmit = (ev: React.FormEvent) => {
		ev.preventDefault();
		const e = validate();
		setErrors(e);
		if (Object.keys(e).length === 0) {
			onSubmit(email, password);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
			<Field>
				<FieldLabel>Имэйл</FieldLabel>
				<Input
					id="signup-email"
					type="email"
					placeholder="you@domain.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					aria-invalid={!!errors.email}
				/>
				{errors.email && <FieldError>{errors.email}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Нууц үг</FieldLabel>
				<div className="relative">
					<Input
						id="signup-password"
						type={showPw ? "text" : "password"}
						placeholder="min. 8 characters"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						aria-invalid={!!errors.password}
					/>
					<button
						type="button"
						onClick={() => setShowPw((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						{showPw ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				</div>
				<FieldDescription>Хамгийн багадаа 8 тэмдэгт</FieldDescription>
				{errors.password && <FieldError>{errors.password}</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Нууц үгээ баталгаажуулах</FieldLabel>
				<div className="relative">
					<Input
						id="signup-confirm"
						type={showCp ? "text" : "password"}
						placeholder="repeat password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						aria-invalid={!!errors.confirm}
					/>
					<button
						type="button"
						onClick={() => setShowCp((v) => !v)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						{showCp ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				</div>
				{errors.confirm && <FieldError>{errors.confirm}</FieldError>}
			</Field>

			<Field>
				<label className="flex items-start gap-3 cursor-pointer">
					<input
						type="checkbox"
						checked={agreed}
						onChange={(e) => setAgreed(e.target.checked)}
						className="mt-1"
					/>
					<span className="text-xs text-muted-foreground leading-relaxed">
						Би{" "}
						<span className="text-foreground hover:text-primary cursor-pointer transition-colors">
							Үйлчилгээний нөхцөл
						</span>{" "}
						болон{" "}
						<span className="text-foreground hover:text-primary cursor-pointer transition-colors">
							Нууцлалын бодлого
						</span>{" "}
						-г зөвшөөрч байна
					</span>
				</label>
				{errors.terms && <FieldError>{errors.terms}</FieldError>}
			</Field>

			<Button
				type="submit"
				disabled={loading}
				className="w-full active:scale-[0.97]"
			>
				{loading ? "Бүртгэл үүсгэж байна..." : "Бүртгэл үүсгэх"}
			</Button>

			<p className="text-center text-xs text-muted-foreground">
				Бүртгэлтэй юу?{" "}
				<Button
					type="button"
					variant="link"
					onClick={onSwitch}
					className="p-0 h-auto"
				>
					Нэвтрэх
				</Button>
			</p>
		</form>
	);
}

export default function AuthForm() {
	const router = useRouter();
	const [tab, setTab] = useState<Tab>("login");
	const [error, setError] = useState("");

	const loginMutation = useMutation({
		mutationFn: (data: { email: string; password: string }) =>
			apiPost<LoginResponse>("user/login", data),
		onSuccess: (response) => {
			if (!response.success) {
				setError(response.error || "Нэвтрэх амжилтгүй боллоо");
				return;
			}
			const token = response.data?.token;
			if (token) {
				localStorage.setItem("token", token);
			}
			router.push("/dashboard");
		},
		onError: () => {
			setError("Тодорхойгүй алдаа гарлаа");
		},
	});

	const signupMutation = useMutation({
		mutationFn: (data: { email: string; password: string }) =>
			apiPost<LoginResponse>("/api/auth/register", data),
		onSuccess: (response) => {
			if (!response.success) {
				setError(response.error || "Бүртгэл амжилтгүй боллоо");
				return;
			}
			const token = response.data?.token || response.data?.accessToken;
			if (token) {
				localStorage.setItem("token", token);
			}
			router.push("/dashboard");
		},
		onError: () => {
			setError("Тодорхойгүй алдаа гарлаа");
		},
	});

	const handleTabChange = (newTab: Tab) => {
		setTab(newTab);
		setError("");
	};

	const handleLogin = (email: string, password: string) => {
		setError("");
		loginMutation.mutate({ email: email.trim(), password });
	};

	const handleSignup = (email: string, password: string) => {
		setError("");
		signupMutation.mutate({ email: email.trim(), password });
	};

	const isLoading = loginMutation.isPending || signupMutation.isPending;

	return (
		<div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
			{/* LEFT — Hero Panel */}
			<div
				className="relative lg:flex-1 flex flex-col justify-between p-8 lg:p-16 overflow-hidden"
				style={{ minHeight: "260px" }}
			>
				<GridTexture />

				<div
					className="absolute top-0 bottom-0 pointer-events-none hidden lg:block"
					style={{
						left: "33%",
						width: "1px",
						background: "rgba(11,154,70,0.08)",
					}}
				/>
				<div
					className="absolute top-0 bottom-0 pointer-events-none hidden lg:block"
					style={{
						left: "66%",
						width: "1px",
						background: "rgba(11,154,70,0.08)",
					}}
				/>
				<div
					className="absolute left-0 right-0 pointer-events-none"
					style={{
						top: "33%",
						height: "1px",
						background: "rgba(11,154,70,0.08)",
					}}
				/>
				<div
					className="absolute left-0 right-0 pointer-events-none"
					style={{
						top: "66%",
						height: "1px",
						background: "rgba(11,154,70,0.08)",
					}}
				/>

				<div className="relative z-10">
					<div className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.4em] font-black border-2 border-primary text-primary">
						Систем
					</div>
				</div>

				<div className="relative z-10 mt-auto lg:mt-0">
					<div className="hidden lg:block text-[11px] uppercase tracking-[0.4em] mb-6 text-muted-foreground">
						— Нэвтрэх портал v2.0
					</div>
					<h1
						className="font-black uppercase leading-none tracking-tight text-foreground text-[clamp(3rem,8vw,7rem)]"
						style={{ lineHeight: "0.92" }}
					>
						Системд
						<br />
						<span className="text-primary">Нэвтрэх</span>
					</h1>
					<p
						className="mt-6 text-sm max-w-xs hidden lg:block text-muted-foreground"
						style={{ lineHeight: "1.8" }}
					>
						Шууд нэвтрэх. Саадгүй.
						<br />
						Баталгаажуулаад ажиллуул.
					</p>
				</div>

				<div className="relative z-10 hidden lg:flex items-center gap-6 mt-16 border-t border-border pt-6">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
						<span className="text-[10px] uppercase tracking-widest text-muted-foreground">
							Online
						</span>
					</div>
					<span className="text-[10px] uppercase tracking-widest text-border">
						TLS 1.3 Encrypted
					</span>
				</div>

				<div className="absolute top-0 right-0 bottom-0 hidden lg:block w-0.5 bg-border" />
			</div>

			{/* RIGHT — Auth Form */}
			<div className="lg:w-[520px] xl:w-[580px] flex flex-col justify-center p-6 lg:p-14">
				<div className="flex mb-8 border-2 border-border">
					{(["login", "signup"] as Tab[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => handleTabChange(t)}
							className="flex-1 py-3 text-xs font-black uppercase tracking-[0.3em] transition-colors duration-150"
							style={{
								background: tab === t ? "var(--primary)" : "transparent",
								color:
									tab === t
										? "var(--primary-foreground)"
										: "var(--muted-foreground)",
								borderRight: t === "login" ? "2px solid var(--border)" : "none",
							}}
							disabled={isLoading}
						>
							{t === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
						</button>
					))}
				</div>

				{error && (
					<div className="mb-6 p-4 text-xs text-destructive border-2 border-destructive bg-destructive/5 uppercase tracking-widest">
						{error}
					</div>
				)}

				<div className="mb-8">
					<h2 className="font-black uppercase leading-none text-foreground text-[clamp(2rem,5vw,3rem)]">
						{tab === "login" ? "Дахин тавтай морил" : "Одоо нэгдээрэй"}
					</h2>
					<p className="mt-2 text-xs text-muted-foreground uppercase tracking-widest">
						{tab === "login"
							? "Нэвтрэхийн тулд мэдээллээ оруулна уу"
							: "Бүртгэлээ хэдхэн секундэд үүсгэнэ үү"}
					</p>
				</div>

				<div className="p-6 lg:p-8 border-2 border-border bg-card">
					{tab === "login" ? (
						<LoginForm
							onSwitch={() => handleTabChange("signup")}
							loading={isLoading}
							onSubmit={handleLogin}
						/>
					) : (
						<SignUpForm
							onSwitch={() => handleTabChange("login")}
							loading={isLoading}
							onSubmit={handleSignup}
						/>
					)}
				</div>

				<p className="mt-6 text-center text-[10px] text-border uppercase tracking-widest">
					© 2026 System Corp. All rights reserved.
				</p>
			</div>
		</div>
	);
}
