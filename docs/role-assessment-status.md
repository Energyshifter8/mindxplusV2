# Role assessment — хэрэгжилтийн төлөв

- **Branch:** `feature/role-assessment`
- **Эх сурвалж:** `docs/role-assessment-report.md` (staging-ийн судалгаа, 2026-10-06)
- **Батлагдаагүй зүйлс:** `docs/role-assessment-unverified.md`

Төлөв: ✅ Бэлэн · 🟡 Хагас · ❌ Байхгүй · ♻️ Хуучирсан (stale: код байгаа ч staging-ийн contract-тай зөрдөг)

## Суурь (ФАЗ -1, 2026-10-06)

| Шалгалт | Үр дүн |
|---|---|
| `tsc --noEmit` | 0 алдаа |
| eslint | 0 алдаа, 11 warning |
| biome check | 1 алдаа (`app/dashboard/surveys/[id]/results/page.tsx:115` noArrayIndexKey, хуучин) |
| `next build` | амжилттай |

## API давхаргын зөрүү (S1–S8)

| # | Зөрүү | Төлөв | Фаз |
|---|---|---|---|
| S1 | Proxy `Accept-Language` илгээдэггүй, `Accept`-ийг хасдаг | ✅ засагдсан | 1 |
| S2 | Алдааны status/code алга болдог, `apiGet` throw хийдэггүй | ✅ засагдсан (`ApiResponse`-д status/code/problem, `apiGetOrThrow`, `lib/api-errors.ts`) | 1 |
| S3 | Spring Page төрөл дутуу, 1↔0 хөрвүүлэлт байхгүй | ✅ засагдсан (`SpringPage`, `lib/pagination.ts`) | 1 |
| S4 | Enum `DRAFT/COMPLETED`, Invitation `STARTED` байхгүй | ✅ засагдсан (`lib/constants/roleAssessment.ts`) | 1 |
| S5 | `createRecruitment` path/body буруу | ✅ засагдсан (U1 батлагдаагүй) | 1 |
| S6 | Талентын хайлт `name` → `q` | ✅ засагдсан | 1 |
| S7 | `TalentInvitationItem` төрөл буруу, ашиглагдаагүй `getUserStats` | ✅ засагдсан | 1 |
| S8 | Proxy multipart / `Content-Disposition` | ⏸ ФАЗ 4 / ФАЗ 6 хүртэл хөндөхгүй | 4, 6 |

## Feature аудит

| Feature | Endpoint (тайлан §3.2) | ФАЗ 0 | Одоо | Тайлбар |
|---|---|---|---|---|
| API суурь (proxy, base path, trailing slash) | — | ✅ | ✅ | |
| Header / алдаа / хуудаслалт / enum | — | ♻️ | ✅ | S1–S4 |
| Auth refresh | `/user/refresh` | ✅ | ✅ | |
| Жагсаалтын статистик | #2 | ✅ | ✅ | |
| Жагсаалт + tab | #1 | ♻️ | ✅ | ФАЗ 2: Бүгд/Үүссэн/Идэвхтэй (`status=CREATED/PUBLISHED`), ачаалах/хоосон/алдаа (дахин оролдох) ялгаатай |
| Хуудаслалт | #1 | ❌ | ✅ | ФАЗ 2: URL `?page=N&size=M` (1-ээс), `lib/pagination.ts`, page > totalPages → сүүлийн хуудас |
| Хайлт | #1 `name` | 🟡 | ✅ | ФАЗ 2: 350мс debounce, URL `?name=` |
| Detail drawer | #3 | ❌ | ✅ | ФАЗ 2: `components/recruitments/RecruitmentDetailDrawer.tsx` |
| Үүсгэх modal | #25 | ♻️ | ✅ | ФАЗ 2: амжилттай бол `/edit` placeholder руу. Бодит дуудлагаар шалгаагүй (U1) |
| Dashboard (урьсан талентууд) | #3, #14, #10 | ❌ | ✅ | ФАЗ 3: `/dashboard/recruitments/{id}/results`. Урьсан талентууд (хуудаслалттай), сонгосон тестүүд (+тестийн drawer, sandbox iframe), нэмэлт асуултууд. Зөвхөн унших: "Талент урих", "Дахин урих", "Үр дүн" товч disabled (ФАЗ 4/5). Алдаатай үед үйлдлийн товч харагдахгүй |
| Үр дүн / тайлан | #15–20 | ❌ | ❌ | ФАЗ 4 |
| Урих / Дахин урих | #36–38 | ❌ | ❌ | ФАЗ 5 |
| Wizard, preview | #4–13, #29–35 | ❌ | ❌ | ФАЗ 6 |
| Хаах / устгах / нэр солих / од / тэмдэглэл / bookmark | #26–28, #39–41 | ❌ | ❌ | ФАЗ 7 |
| Урьсан талентууд | #21 | ♻️ | ✅ | ФАЗ 1-д `q` засагдсан (`marked` шүүлтүүр, bookmark ФАЗ 7) |
| Талентын дэлгэрэнгүй | #22–23 | ♻️ | 🟡 | ФАЗ 1-д төрөл, STARTED badge, "Үр дүн" линк (recruitment dashboard руу) засагдсан. "Бөглөсөн" багана U6 |
| Нүүр хуудасны сүүлд дууссан урилгууд | #24 | ✅ | ✅ | Status map `DRAFT` → `CREATED` |

## Route-ын харгалзаа (staging ↔ төсөл)

Төслийн route-ийн нэрийг өөрчлөөгүй.

| Staging | Төсөл | Төлөв / тайлбар |
|---|---|---|
| `/role-assessment?page={1..}&size={n}` | `/dashboard/recruitments?page=&size=&status=&name=` | ✅ ФАЗ 2. Staging tab/хайлтыг state-д хадгалдаг; төсөлд URL-д (reload-д хадгалагдана) |
| `/role-assessment/{id}` (wizard) | `/dashboard/recruitments/{id}/edit` | Placeholder, ФАЗ 6 |
| `/role-assessment/{id}/preview` | — | ФАЗ 6 |
| `/role-assessment/{id}/dashboard` | `/dashboard/recruitments/{id}/results?page=&size=` | ✅ ФАЗ 3 (өмнөх placeholder-ийн оронд) |
| `/role-assessment/{id}/dashboard/{invitationId}` | `/dashboard/recruitments/{id}/results/{invitationId}` (санал) | ФАЗ 4 |
| `/invited-talents` | `/dashboard/talents` | ✅ |
| `/invited-talents/{talentId}` | `/dashboard/talents/{id}` | 🟡 |
| `/membership` (`plan_expired` modal) | — | Хуудас байхгүй |

## Шийдвэрүүд (хянах)

- Жагсаалтын `status`, `name` нь `page`, `size`-тай хамт URL-д байна (staging-д state). Ингэснээр tab/хайлт солиход хуудас 1 болох нь нэг удаагийн URL шинэчлэлээр явагдаж, race үүсэхгүй.
- Dashboard-д staging-д байхгүй 3 статистик карт (Нийт урьсан / Дуусгасан / Дуусгах хувь) үлдсэн. Өмнөх placeholder-ийн картууд байсан ба одоо #3-ийн `count`-аас бодит утга авна.
- 4xx алдааг React Query дахин оролддоггүй (`components/providers.tsx`), алдааны төлөвт "Дахин оролдох" товч зөвхөн 5xx/сүлжээний алдаанд гарна.
- Нүүр хуудасны status map-д `PUBLISHED` = "Идэвхтэй" (survey хүснэгтэд ч хамаарна, `SurveyStatusBadge`-тэй ижил).
