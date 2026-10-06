import AuthForm from "@/components/AuthForm";

// Staging-тэй адил болгож хараахан хөрвүүлээгүй — хуучин dark хэв маягаар (.dark scope)
export default function Home() {
	return (
		<div className="dark min-h-screen bg-background font-sans text-base text-foreground">
			<AuthForm />
		</div>
	);
}
