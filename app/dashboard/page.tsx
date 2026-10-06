import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

// Staging: document.title "Нүүр хуудас"
export const metadata: Metadata = { title: "Нүүр хуудас" };

export default function DashboardPage() {
	return <HomePage />;
}
