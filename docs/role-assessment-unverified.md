# Role assessment — батлагдаагүй бүтэц

Кодонд `// bundle-derived, unverified` гэж тэмдэглэсэн, эсвэл бодит хүсэлтээр бүрэн
батлагдаагүй зүйлс. Эх сурвалж: 📦 = staging bundle-ээс (тайлан), ❓ = таамаг /
ажиглалт хангалтгүй. Батлах арга нь ихэвчлэн Swagger эсвэл staging дээрх бодит
хүсэлт.

| # | Фаз | Хаана | Юу батлагдаагүй | Эх сурвалж | Батлах арга |
|---|---|---|---|---|---|
| U1 | 1 | `lib/api.ts` `createRecruitment` | `POST /customer/recruitments/new`, body `{str}`, хариу нь raw id string уу, `{id}` уу (хоёуланг зохицуулсан) | 📦 тайлан §2d, #25 | Swagger (a)(c). Бодит дуудлага серверт CREATED ноорог үүсгэнэ |
| U2 | 1 | `lib/api-errors.ts` `ERROR_MESSAGES.plan_expired` | `plan_expired` code бодитоор ирэх эсэх, HTTP status | 📦 тайлан §2c | Swagger-ийн ProblemDetail code жагсаалт |
| U3 | 1 | `lib/api-errors.ts` `ProblemDetail.errors` | Validation алдааны `errors[]` бүтэц (`{field, value}` уу, `{field, message}` уу) | 📦 тайлан §3.1 | 400 хариуны жишээ (Swagger) |
| U4 | 1 | `lib/api.ts` `UserRef.id` | `createdBy/publishedBy/closedBy/invitedBy.id`-ийн төрөл (uuid string гэж үзэв) | ❓ | Swagger schema |
| U5 | 1 | `lib/api.ts` `CompletedInvitation` (#24) | Талбарууд ажиглагдсан ✅, гэхдээ `phoneNumber`, `completedAt`, `ratingPoints` nullable эсэх. `createdBy` нь string (объект биш) | ❓ (5 мөрөөр ажигласан) | Swagger schema |
| U6 | 1 | `app/dashboard/talents/[id]/page.tsx` | #23 хариунд `completedAt` байхгүй ✅. Staging-ийн "Бөглөсөн" багана юунаас утга авдаг нь тодорхойгүй. Одоогоор "—" харуулна | ❓ | Staging bundle / Swagger |
| U7 | 1 | `app/api/[...path]/route.ts` | `Accept-Language: mn-MN` үед `detail` Монголоор ирдэг нь тайланд ✅. Proxy-ийн өөрчлөлтийг нэвтэрсэн browser дээр шалгаагүй | ✅/шалгаагүй | Browser: байхгүй ID-тай хуудас нээж алдааны detail харах |
| U8 | 1 | `lib/constants/roleAssessment.ts` | **Label санал:** Invitation `PENDING "Уригдсан"`, `STARTED "Эхэлсэн"`, `COMPLETED "Дууссан"`, `EXPIRED "Хугацаа дууссан"`; Recruitment `PUBLISHED "Идэвхтэй"` (өмнө "Нийтэлсэн") | staging UI (тайлан §2c) | Таны баталгаажуулалт |
