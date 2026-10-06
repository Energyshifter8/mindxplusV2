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
| U9 | 2 | `app/dashboard/recruitments/page.tsx` `UNLIMITED_BALANCE_THRESHOLD` | Үлдэгдэл ≥ 10000 бол "Хязгааргүй" (өмнө 100000 байсан). API "хязгааргүй"-г яаж илэрхийлдэг нь тодорхойгүй (том тоо / -1 / null) | 📦 тайлан §2a, §6.2 | Swagger / backend |
| U10 | 2 | Жагсаалтын хайлт, үүсгэх modal `maxLength=100` | Серверийн талын урт хязгаар | 📦 | Swagger (a) |
| U11 | 2 | `lib/pagination.ts` `PAGE_SIZE_OPTIONS = [10, 20, 50]` | Staging зөвхөн 10-ыг харуулсан; API-ийн `size`-ийн дээд хязгаар | ❓ | Swagger |
| U12 | 2 | Жагсаалтын эрэмбэ | Sort параметргүй үед `createdAt` буурахаар ирдэг гэж ажигласан; `name` хайлт contains / case-insensitive эсэх | ❓ тайлан §2a, §6.2 | Swagger |
| U13 | 2 | `lib/api.ts` `RecruitmentDetail` | `publishedAt/publishedBy/closedAt/closedBy` байхгүй үед null уу, огт ирэхгүй юу (хоёуланг зохицуулсан) | ✅/❓ | GET #3-ийг CREATED/PUBLISHED/CLOSED тус бүрээр |
| U14 | 2 | `RecruitmentDetailDrawer` "Явц" | CREATED үед "--/--", бусад үед `count.completed/count.total` (staging-ийн жагсаалтын дүрмээр) | 📦 | Staging-тэй харьцуулах |
| U15 | 3 | `lib/api.ts` `RecruitmentInvitation.ratingPoints` | #14-ийн хариунд `ratingPoints` байгаа эсэх (#24-д ✅ ажиглагдсан). Байхгүй бол "—" харуулна | 📦 тайлан #14 | GET #14 |
| U16 | 3 | Dashboard "N мин" chip | Нийт хугацааг зөвхөн тестүүдийн min/max-аар бодсон; нэмэлт асуултын хугацаа орох эсэх | ❓ | Staging dashboard-тай харьцуулах |
| U17 | 3 | Dashboard "Үр дүн" товч | Staging-д `COMPLETED`/`STARTED` үед идэвхтэй, `PENDING` үед идэвхгүй. Одоогоор бүгд disabled (ФАЗ 4) | 📦 | ФАЗ 4 |
| U18 | 3 | `TestDetailDrawer` | `content` HTML-ийг `sandbox=""` iframe-д харуулна (script ажиллахгүй). Контент script/гадаад CSS-ээс хамаардаг эсэх, зургийн URL | ❓ | Browser дээр тест бүрийг нээж харах |
| U19 | 3 | Dashboard "Нэр" багана | "Овог Нэр" дараалал (`lastName firstName`); staging-д маскалсан тул тодорхойгүй | ❓ | Staging-тэй харьцуулах |
| U20 | 3 | #14 эрэмбэ, шүүлтүүр | Урилгын жагсаалтын эрэмбэ, status-аар шүүх параметр байгаа эсэх (ашиглаагүй) | ❓ тайлан §6.2 | Swagger |
