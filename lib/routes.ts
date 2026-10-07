// Талентийн үнэлгээний route-ууд (staging: /role-assessment…, /invited-talents…).
// Бүх дотоод линк эндээс — route шилжүүлэхэд зөвхөн энэ файл өөрчлөгдөнө.

export const raRoutes = {
	list: () => "/dashboard/recruitments",
	wizard: (id: string) => `/dashboard/recruitments/${id}/edit`,
	preview: (id: string) => `/dashboard/recruitments/${id}/preview`,
	dashboard: (id: string) => `/dashboard/recruitments/${id}/results`,
	result: (id: string, invitationId: string) =>
		`/dashboard/recruitments/${id}/results/${invitationId}`,
	talents: () => "/dashboard/talents",
	talent: (id: string | number) => `/dashboard/talents/${id}`,
};
