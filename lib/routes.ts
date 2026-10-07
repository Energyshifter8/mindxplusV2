// Талентийн үнэлгээний route-ууд (staging: /role-assessment…, /invited-talents…).
// Бүх дотоод линк эндээс — route шилжүүлэхэд зөвхөн энэ файл өөрчлөгдөнө.

export const raRoutes = {
	list: () => "/role-assessment",
	wizard: (id: string) => `/role-assessment/${id}`,
	preview: (id: string) => `/role-assessment/${id}/preview`,
	dashboard: (id: string) => `/role-assessment/${id}/dashboard`,
	result: (id: string, invitationId: string) =>
		`/role-assessment/${id}/dashboard/${invitationId}`,
	talents: () => "/invited-talents",
	talent: (id: string | number) => `/invited-talents/${id}`,
};
