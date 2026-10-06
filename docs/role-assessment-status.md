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
| Жагсаалт + tab | #1 | ♻️ | 🟡 | ФАЗ 1-д enum засагдсан, ФАЗ 2-т дуусна |
| Хуудаслалт | #1 | ❌ | ❌ | ФАЗ 2 |
| Хайлт | #1 `name` | 🟡 | 🟡 | ФАЗ 2 (debounce) |
| Detail drawer | #3 | ❌ | ❌ | ФАЗ 2 |
| Үүсгэх modal | #25 | ♻️ | 🟡 | ФАЗ 1-д API засагдсан, ФАЗ 2-т redirect |
| Dashboard (урьсан талентууд) | #3, #14, #10 | ❌ | ❌ | ФАЗ 3 |
| Үр дүн / тайлан | #15–20 | ❌ | ❌ | ФАЗ 4 |
| Урих / Дахин урих | #36–38 | ❌ | ❌ | ФАЗ 5 |
| Wizard, preview | #4–13, #29–35 | ❌ | ❌ | ФАЗ 6 |
| Хаах / устгах / нэр солих / од / тэмдэглэл / bookmark | #26–28, #39–41 | ❌ | ❌ | ФАЗ 7 |
| Урьсан талентууд | #21 | ♻️ | ✅ | ФАЗ 1-д `q` засагдсан (`marked` шүүлтүүр, bookmark ФАЗ 7) |
| Талентын дэлгэрэнгүй | #22–23 | ♻️ | 🟡 | ФАЗ 1-д төрөл, STARTED badge, "Үр дүн" линк (recruitment dashboard руу) засагдсан. "Бөглөсөн" багана U6 |
| Нүүр хуудасны сүүлд дууссан урилгууд | #24 | ✅ | ✅ | Status map `DRAFT` → `CREATED` |
