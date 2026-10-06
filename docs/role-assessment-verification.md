# Role assessment — баталгаажуулалт (ФАЗ 1–3)

- **Огноо:** 2026-10-06
- **Орчин:** `localhost:3000` (таны `pnpm dev`) → proxy → staging. Browser-т нэвтэрсэн session.
- **Аюулгүй байдал:** Миний явуулсан бүх API хүсэлт **GET**. Бичих (POST) товч дараагүй ("Үүсгэх" modal-ыг зөвхөн нээж хаасан). Token, хувийн мэдээлэл хуулаагүй; доорх бүх үр дүн нь түлхүүр/төрөл/тоо.
- **Апп-ын өөрийн POST:** Хуудас бүрэн ачаалах бүрт апп `POST /user/refresh` (token шинэчлэх) илгээдэг. Баталгаажуулалтын явцад 2 удаа бүрэн ачаалсан тул 2 удаа явсан; бусад шилжилтийг client-side (`router.push`) хийсэн.

## Browser (UI + network)

| # | Шалгалт | Хүлээгдэж буй | Үр дүн |
|---|---|---|---|
| V1 | Жагсаалт ачаалах | `GET /customer/recruitments/?page=0&size=10`, `GET …/statistics` | ✅ 200, "Нийт: 63", "Хуудас 1 / 7" |
| V2 | "Үүссэн" tab | `status=CREATED` (өмнө нь `DRAFT` → 500) | ✅ 200, URL `?status=CREATED&page=1` |
| V3 | "Идэвхтэй" tab | `status=PUBLISHED` | ✅ 200 |
| V4 | "Бүгд" tab | status параметргүй | ✅ |
| V5 | Дараагийн хуудас | URL `page=2` → API `page=1`, № 11-ээс | ✅ "Хуудас 2 / 5", эхний № = 11 |
| V6 | Хуудасны хэмжээ 20 | URL `page=1&size=20` → API `page=0&size=20` | ✅ 20 мөр, "Хуудас 1 / 3" |
| V7 | Хайлт debounce | "test" (4 тэмдэгт) → 1 хүсэлт | ✅ зөвхөн `name=test` нэг удаа |
| V8 | Хайлтын утга | Бүх мөр "test" агуулна; "TEST" ижил үр дүн | ✅ 19 = 19 (contains, case-insensitive) |
| V9 | Хайлт цэвэрлэх | URL-аас `name` хасагдана | ✅ |
| V10 | Kebab (CREATED) | Дэлгэрэнгүй, Засах | ✅ |
| V11 | Detail drawer | `GET /customer/recruitments/{id}` | ✅ 200, "Явц --/--", хоосон тест/асуултын мессеж |
| V12 | Drawer дотор focus + Escape | Хаагдана | ✅ |
| V13 | Үүсгэх modal | `maxLength=100`, нээх/хаахад API хүсэлт 0 | ✅ |
| V14 | Dashboard (10 урилгатай) | `GET detail` + `GET hiring-invitations/list/{id}?page=0&size=10` | ✅ 10/7/70%, "Нийт оролцогчид: 10" |
| V15 | Урилгын badge | 4 статус | ✅ Дууссан, Хугацаа дууссан, Эхэлсэн (бусад үнэлгээнд) |
| V16 | Үр дүн / Дахин урих | disabled (ФАЗ 4/5) | ✅ EXPIRED → "Дахин урих" disabled, бусад "Үр дүн" disabled |
| V17 | Од үнэлгээ | `rated=true` мөрөнд од | ✅ "4" харагдсан |
| V18 | Тестийн drawer | `GET /role-assessments/tests/{id}`, `sandbox=""` iframe | ✅ (засвар F2-ын дараа цагаан цаасан дээр) |
| V19 | 404 dashboard | 1 хүсэлт (retry-гүй), "Мэдээлэл олдсонгүй", урих/хаах/дахин оролдох товчгүй | ✅ |
| V20 | Талентын хайлт | `q=` | ✅ 29 → 3, бүгд тохирсон; засвар F5-ын дараа 1 хүсэлт |
| V21 | Талентын "Үр дүн" | `/dashboard/recruitments/{recruitmentId}/results` | ✅ |
| V22 | Нүүр хуудас | Түүхий enum (`CREATED`…) харагдахгүй | ✅ |
| V23 | Console | Алдаа байхгүй | ✅ |

## API бүтэц (GET, зөвхөн түлхүүр/төрөл)

| # | Шалгалт | Үр дүн |
|---|---|---|
| A1 | `Accept-Language: mn-MN` (proxy) | ✅ 404 `detail` = "Талентийн үнэлгээний мэдээлэл олдсонгүй" (өмнө нь `validation.recruitmentNotFound`) |
| A2 | Validation алдаа | ✅ `latest-completed?limit=20` → 400 `VALIDATION_EXCEPTION`, `errors: [{field, value}]`, `value` Монгол мессеж. `limit` ≤ 10 |
| A3 | #3 detail CREATED / PUBLISHED / CLOSED | ✅ Байхгүй `publishedAt/By`, `closedAt/By` нь **null биш, огт ирэхгүй**. `createdBy.id` string |
| A4 | #14 урилгын жагсаалт | ✅ Spring Page. Хоосон `phoneNumber`, `completedAt` огт ирэхгүй; `ratingPoints` зөвхөн `rated=true` үед (number); `dueDate` `YYYY-MM-DD`; `createdAt`-ээр буурах |
| A5 | #24 latest-completed | ✅ `phoneNumber`, `ratingPoints` nullable; `createdBy` string |
| A6 | #1 эрэмбэ | ✅ 63 мөр бүгд `createdAt` буурах |
| A7 | Урилгын статус | ✅ 4 утга бүгд байна (COMPLETED 57, EXPIRED 13, PENDING 12, STARTED 10 — 92 урилга) |
| A8 | Тестийн каталог `content` (10 тест) | ✅ HTML fragment, script/img/link/iframe/`on*` байхгүй; `color: rgb(0, 0, 0)` 84 удаа хатуу бичигдсэн |

## Олдсон, засагдсан алдаа

| # | Алдаа | Засвар |
|---|---|---|
| F1 | Жагсаалтын "Үр дүн" товч 2 мөрөнд тасарсан | `whitespace-nowrap`, баганын өргөн 130px |
| F2 | Тестийн контент хар текстээр хатуу бичигдсэн тул dark theme-д уншигдахгүй | iframe-ийг үргэлж цагаан "цаас" (`color-scheme: light`) |
| F3 | #14 `phoneNumber` огт ирэхгүй байж болно | Төрөл `phoneNumber?` |
| F4 | `VALIDATION_EXCEPTION`-д Монгол мессеж байгаагүй | Map-д нэмсэн, `errors[]` төрөл + `getFieldErrors()` |
| F5 | Талентын хайлт товч бүрт хүсэлт явуулдаг (4 хүсэлт) | 350мс debounce |
| F6 | 404 үед breadcrumb "…" хэвээр | Ачаалж байх үед л "…", эс бөгөөс "—" |

## Backend-ийн онцлог (анхаарах)

- **#14 GET нь бичих side effect-тэй:** `GET /customer/hiring-invitations/list/{rid}` нь хугацаа нь өнгөрсөн `PENDING` урилгыг серверт `EXPIRED` болгож хадгалдаг (lazy expiry). Баталгаажуулалтын явцад #23 ба #14-ийн 92 урилгыг тулгахад эхэндээ 10 зөрүү (`PENDING → EXPIRED`, бүгд `dueDate` өнгөрсөн) байсан ба #14-ийг уншсаны дараа 0 болсон. Иймд талентын урилгын түүх (#23) тухайн үнэлгээний dashboard-ыг хэн нэгэн нээх хүртэл хуучин `PENDING` харуулж болно. Staging апп-д ч ижил.

## Unit тест (helper-ууд)

`node --test` (Node 25, type stripping), төсөлд dependency нэмээгүй, тестийн файл scratchpad-д:
`lib/pagination.ts`, `lib/api-errors.ts`, `lib/format.ts` — 8 тест, 8 давсан (URL↔API хуудас, буруу оролт, code normalize, code-оор мессеж, axios 400 ProblemDetail + `errors[]`, сүлжээний алдаа, формат).

## Батлах боломжгүй (POST шаардлагатай)

U1 (`createRecruitment` хариуны хэлбэр), U2 (`plan_expired`) нь бодит POST эсвэл багц дууссан account шаарддаг тул GET-ээр батлах боломжгүй. `docs/role-assessment-unverified.md`-д хэвээр.
