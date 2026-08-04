"use client";

import { useParams, useRouter } from "next/navigation";

export default function RecruitmentEditPage() {
	const params = useParams();
	const router = useRouter();
	const recruitmentId = params?.id as string;

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center h-14 px-4 border-b-2 border-border bg-card shrink-0 gap-3">
				<button
					type="button"
					onClick={() => router.push("/dashboard/recruitments")}
					className="flex items-center justify-center w-8 h-8 border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
				>
					←
				</button>
				<h1
					className="text-sm font-bold uppercase tracking-wider text-foreground"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					Талентийн үнэлгээ засах
				</h1>
			</div>
			<div className="flex flex-1 items-center justify-center p-6">
				<div className="border-2 border-border bg-card p-8 text-center max-w-md">
					<div className="flex h-14 w-14 items-center justify-center border-2 border-border text-muted-foreground mx-auto mb-4">
						<span className="text-2xl">🚧</span>
					</div>
					<p
						className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Талентийн үнэлгээ засах хуудас
					</p>
					<p
						className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-4"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Recruitment ID: {recruitmentId}
					</p>
					<p
						className="text-[11px] text-muted-foreground/60"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Энэ хуудсыг бүтээж байна. Түр хүлээнэ үү.
					</p>
				</div>
			</div>
		</div>
	);
}
