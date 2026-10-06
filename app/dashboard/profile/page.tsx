import type { Metadata } from "next";

export const metadata: Metadata = { title: "Миний бүртгэл" };

// Placeholder: staging-ийн "Миний бүртгэл" (/profile — бүртгэл, багц, тохиргоо, төлбөр)
// хуудас дараагийн алхмуудад хийгдэнэ (docs/parity/home.md).
export default function ProfilePage() {
	return (
		<div className="flex min-h-full flex-col items-center justify-center gap-2 p-10 text-center">
			<p className="font-semibold text-lg">Миний бүртгэл</p>
			<p className="text-muted-foreground text-sm">
				Энэ хуудас удахгүй нэмэгдэнэ.
			</p>
		</div>
	);
}
