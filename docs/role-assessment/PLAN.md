# Талентийн үнэлгээ — ФАЗ 0: аудит + төлөвлөгөө

- **Огноо:** 2026-10-07 · **Төлөв:** ФАЗ 0 дууссан, таны "батлав"-ыг хүлээж байна
- **Код өөрчлөөгүй.** Энэ файл л нэмэгдсэн (commit хийгээгүй, §1-ийг үз).
- Тэмдэглэгээ: ✅ ажигласан/баталгаатай · 📦 staging bundle-ээс (дараагүй) · ❓ таамаг

---

## 1. Git, нууцлал (§1.7)

| Шалгалт | Үр дүн |
|---|---|
| Одоогийн branch | `main` (clean). `origin/main`-ээс 3 commit урд (`07ebc202`, `514582fc` revert-ууд, `25a6b611` endpoint давхарга) — push хийгдээгүй |
| `feature/role-assessment` | Локал `9e4539c2` нь `main`-ий **өвөг** (main = feature + 8 commit). Сүүлийн ажил (swagger, openapi.json, endpoint давхарга) зөвхөн `main` дээр байна. `origin/feature/role-assessment` = `ffd15990` (локалаас 4 commit хоцорсон) |
| `.env.local` git түүхэд | Зөвхөн `e533623e` ("-a", локал `feature/recruitments-talents-fixes`). Ямар ч remote ref, remote reflog-оос хүрэх боломжгүй; `git ls-remote origin`-оор remote дээрх branch `475fe75e` (энэ commit-ийн эцэг) ✅. **Push хийгдээгүй.** |
| Тэр commit-ийн `.env.local`-д юу байсан | Зөвхөн `NEXT_PUBLIC_API_URL` (нийтийн URL). Token/нууц үг **байхгүй** (утгыг хэвлээгүй, зөвхөн түлхүүрийн нэр шалгасан) |
| `.next/` git түүхэд | Мөн зөвхөн `e533623e` (36 633 файл). Push хийгдээгүй |
| Одоогийн `.env.local` түлхүүрүүд | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SURVEY_PARTICIPATE_URL`. `NEXT_PUBLIC_RA_ALLOW_WRITES` **байхгүй** (бичихгүй) |

**Блокер B1.** `feature/role-assessment`-ийг `main` руу fast-forward хийх (`git fetch . main:feature/role-assessment` + `git switch`) командыг auto mode хаасан. Үүнийг тойрохгүй. Иймд одоогоор `main` дээр зөвхөн уншиж, энэ файлыг commit хийлгүй үлдээлээ. Сонголт §7-д.

## 2. Baseline (§ФАЗ 0.b)

| Шалгалт | Үр дүн | Тайлбар |
|---|---|---|
| `pnpm install --frozen-lockfile` | **Ажиллуулаагүй** | Auto mode хаасан (B2). Одоо байгаа `node_modules`-оор доорхыг ажиллуулав |
| `tsc --noEmit` (төслийн tsconfig) | exit 2, **7 алдаа** | Бүгд `.next/dev/types/routes.d.ts`-д: dev server-ийн үүсгэсэн файлын төгсгөлд хог үлдсэн (82-р мөр `outRoute]>`). Source код биш |
| `tsc --noEmit` (source only, `.next` хассан) | **0 алдаа** | Scratchpad tsconfig-оор. Шалгалтын baseline болгоно |
| `eslint .` | **0 алдаа, 10 warning** | Бүгд survey модульд (5 файл), хуучин |
| `biome check .` | **1 алдаа** | `app/dashboard/surveys/[id]/results/page.tsx:115` `noArrayIndexKey`, хуучин |
| `next build` | ✅ амжилттай, 0 warning, 15 route | Build доторх TypeScript шалгалт ✅ (build `.next/types` үүсгэдэг тул) |
| Dev server (PID 6455, :3000) build-ийн дараа | ✅ ижил PID, `/login`, `/dashboard/recruitments` 200 | Build `next-env.d.ts`-ийн import-ыг `.next/types`-руу сольсон (gitignore-д байгаа, dev server буцааж үүсгэнэ) |

Хүлээн авах нөхцөл (1): **source tsc 0 · eslint 0 алдаа / ≤10 warning · biome ≤1 (хуучин) · build ✅**.

## 3. Docs, Swagger (§ФАЗ 0.c)

Уншсан: `docs/role-assessment-report.md` (466 мөр), `-status.md`, `-unverified.md` (U1–U40), `-verification.md` (V1–V34), `docs/parity/home.md`, `docs/swagger/mismatches.md`, `docs/parity/tools/{extract,netpatch}.js`, `docs/swagger/tools/describe.py`.
`docs/swagger/openapi.json` ✅ байна (181 KB, 159 path). §4-ийн **бүх** customer endpoint openapi-д байна.

**Docs байрлал.** Prompt `docs/role-assessment/*.md` гэж заасан, одоо байгаа нь `docs/role-assessment-*.md`. ФАЗ 1-д `git mv`-ээр `docs/role-assessment/{report,status,unverified,verification}.md` + `screenshots/` болгож нэгтгэнэ.

### 3.1 ФАЗ 0-ийн шинэ staging ажиглалт (read-only, 2026-10-07)

`/role-assessment/9547a97a-…` (CREATED) нээж, ачаалсан JS chunk-уудыг (cache-ээс) уншсан. Юу ч дараагүй, бичээгүй. Staging руу явсан API хүсэлт: зөвхөн доорх 4 GET.

| # | Олдвор | Эх сурвалж |
|---|---|---|
| N1 | Wizard ачаалахад **4 GET зэрэг** (~824мс-д эхэлсэн): `designs/RECRUITMENT/{id}`, `recruitments/{id}`, `recruitment-setup/{id}/information`, `recruitment-setup/settings` | ✅ resource timing |
| N2 | Rich text editor: **Quill 2.0.3** + react-quill маягийн wrapper (chunk `8519`, 203 112 B min / **57 513 B gzip**, зөвхөн wizard-д lazy). Хадгалагдах HTML нь Quill 2-ын формат (`<ol><li data-list="bullet">`, `<span class="ql-ui">`) | 📦 chunk |
| N3 | Staging rich text-ийг харуулахдаа regex-ээр (`&nbsp;`, хоосон `<p><br></p>`, `ql-ui` span хасах, `data-list="bullet"` → `<ul>`) цэвэрлээд **`dangerouslySetInnerHTML`** (sanitizer байхгүй, DOMPurify bundle-д алга) | 📦 |
| N4 | Wizard-ийн **"Гарах" → шууд `router.push("/role-assessment")`**, баталгаажуулах dialog **байхгүй**, `beforeunload` байхгүй | 📦 |
| N5 | Хадгалаагүй өөрчлөлтийн оронд: оролт бүрт `localStorage["ra_draft_{id}"]`-д автоматаар хадгална (бусад `ra_draft_*`-г устгана), update-information амжилттай бол устгана | 📦 |
| N6 | Toast: алхам 1 "Мэдээлэл амжилттай хадгалагдлаа" / "Мэдээлэл хадгалахад алдаа гарлаа"; алхам 3 "Сонгосон асуултууд амжилттай хадгалагдлаа" / "Асуултууд хадгалахад алдаа гарлаа". Staging алдааны toast-д `error.message`-ийг (= `detail`) түрүүлж харуулдаг — бид §3-ийн дагуу `code`-оор map хийнэ | 📦 |
| N7 | Алхам 3 = **зөвхөн каталогийн асуулт сонгох** ("Нэмэлт асуулт нэмэх" гарчиг, "Нэмэх/Нэмсэн"). Өөрийн асуулт үүсгэх/засах UI **байхгүй**. Staging-ийн API модульд `/customer/questions/…` зөвхөн `survey` ownerType-тэй (`add-multiple-question`, `delete-question`) | 📦 |
| N8 | Header 72px sticky, stepper нь antd Steps (`labelPlacement: vertical`) | 📦 |

## 4. Feature аудит (§ФАЗ 0.d)

Төлөв: **Хийгдсэн** · **Хагас** · **Хуучирсан** (код бий, staging-тэй зөрнө) · **Дутуу**. "UI" гэдэг нь staging-ийн харагдац (light, Manrope, staging токен); одоогийн RA хуудсууд бүгд хуучин dark/JetBrains Mono хэв маягтай.

| Feature | Төлөв | Нотолгоо (файл:мөр) | Үлдсэн ажил |
|---|---|---|---|
| Proxy, base path, trailing slash | Хийгдсэн | `app/api/[...path]/route.ts:13`, `lib/api.ts:312-315` | — |
| `Accept-Language: mn-MN`, `Accept` дамжуулах | Хийгдсэн | `route.ts:22-27` (Accept-ийг одоо дамжуулдаг) | — |
| ProblemDetail normalize, code → Монгол мессеж | Хийгдсэн (өргөтгөх) | `lib/api-errors.ts:51-58` normalize, `:139-152` map, `:158-170` | Мэдэгдэх code-ийн жагсаалтыг нэг файлд (дутуу: давхар урилга, багтаамж г.м. ❓) |
| `detail`-ээр салаалсан логик | Байхгүй ✅ | grep: зөвхөн `extractErrorText` (`api-errors.ts:86-98`) `detail`-ийг текст болгоно | — |
| Spring Page, 1↔0 хөрвүүлэлт | Хийгдсэн | `lib/pagination.ts:40-47`, `lib/hooks/usePageParams.ts` | — |
| Enum, label | Хийгдсэн | `lib/constants/roleAssessment.ts:7-44` (5 статус swagger, 4 урилга) | U8 label батлах |
| Огноо `YYYY-MM-DD • HH:mm` | **Хуучирсан** | `lib/format.ts:12-35` `toLocaleString("mn-MN")` | Staging формат + харьцангуй "N өдрийн өмнө" (**Дутуу**) |
| "Хязгааргүй" ≥10000 | Хагас | `app/dashboard/recruitments/page.tsx:50-58` (хуудсан дотор) | Цэвэр функц болгох |
| React Query тохиргоо | **Хуучирсан** | `components/providers.tsx:12-27` (5xx 3 retry, `refetchOnWindowFocus` анхдагч true); `lib/hooks/useRecruitmentQueries.ts:52-66` `refetchInterval: 30000` | RA hook-уудад `retry:false`, `refetchOnWindowFocus:false`; polling staging-д байгаа эсэхийг ФАЗ 2-т батлаад хасах (home-д staging polling хийдэггүй ✅) |
| API/type/hook давхарга (§5.1) | Хагас | Бүх endpoint функц `lib/api.ts:295-1190` (1467 мөрт монолит), type `lib/types/api.ts` + `lib/api.ts`, hook `lib/hooks/useRecruitmentQueries.ts` | `lib/api/role-assessment/`, `lib/types/role-assessment.ts`, `lib/hooks/role-assessment/` руу **зөөх** (дахин бичихгүй) |
| DRY-RUN хамгаалалт (§7.3) | **Дутуу** | — | ФАЗ 1 |
| Unit тест | **Дутуу** (репод) | Өмнөх 12 тест scratchpad-д байсан, commit-гүй; test runner байхгүй | `node --test` (Node 25 built-in, сан нэмэхгүй) |
| `createRecruitment` | Хийгдсэн | `lib/api.ts:621-647` `/new {str}` → string | Toast "Талентийн үнэлгээ амжилттай үүслээ" (одоо `useCreateRecruitment.ts:42` өөр текст), wizard руу шилжих |
| `TalentInvitationItem` | Хийгдсэн | `lib/api.ts:1167-1179` = swagger `InvitationDTO` + staging #23 ✅ | `ratingPoints?: number` нэмэх (swagger double). Prompt-ын жагсаасан талбарууд нь `#24 InvitationProjection` (= `CompletedInvitation`, `:1077-1092`) — Q6 |
| Талентын хайлт `q` | Хийгдсэн | `lib/api.ts:1122-1138` | — |
| `check-token` | Ашиглагддаггүй ✅ | grep 0 | — |
| Жагсаалт: tab Бүгд/Үүссэн/Идэвхтэй | Хийгдсэн (UI хуучин) | `recruitments/page.tsx:60-74` (`status=CREATED/PUBLISHED`, DRAFT алга) | UI |
| Жагсаалт: хайлт, хуудаслалт, статистик | Хийгдсэн (UI хуучин) | `page.tsx:62-68` (350мс debounce, max 100), `:163-164` | UI; polling |
| Жагсаалт: мөрийн үйлдэл, kebab | Хагас | `page.tsx:86-118` (CREATED: Дэлгэрэнгүй/Засах; бусад: Үр дүн/Дэлгэрэнгүй), `:101` "Устгах / нэр солих (ФАЗ 7)…" | Урих (PUBLISHED), Устгах/Хаах/Нэр солих — ФАЗ 6, 8 |
| Detail drawer | Хийгдсэн (UI хуучин) | `components/recruitments/RecruitmentDetailDrawer.tsx` | UI |
| Үүсгэх modal | Хагас | `CreateRecruitmentModal.tsx:43-48` → `/edit` placeholder | Wizard руу, toast текст |
| Wizard `/role-assessment/{id}` (4 алхам) | **Дутуу** | `app/dashboard/recruitments/[id]/edit/page.tsx:1-54` 🚧 placeholder. API бэлэн (`lib/api.ts:725-1074`), UI-д ашиглагдаагүй | ФАЗ 3–5 |
| Preview `/…/preview` | **Дутуу** | route байхгүй | ФАЗ 5 |
| Dashboard `/…/dashboard` | Хагас | `results/page.tsx`: урилгын хүснэгт, сонгосон тест (+drawer), нэмэлт асуулт ✅; "Талент урих" disabled `:233-239`; "Дахин урих" disabled `:436-441`; "Талент үнэлгээ хаах" **байхгүй**; staging-д байхгүй 3 статистик карт `:257-273` | Урих/сунгах ФАЗ 6, хаах ФАЗ 8, UI |
| Талентын үр дүн | Хагас | `results/[invitationId]/page.tsx`: тест, HTML тайлан (sandbox iframe), PDF, нэмэлт асуулт, явцын хяналт, од/тэмдэглэл унших ✅; од өгөх disabled `:677`, тэмдэглэл нэмэх disabled `:725`; "Анхааруулга/Санамж унших" modal байхгүй | ФАЗ 7, UI |
| `/invited-talents` | Хагас | `talents/page.tsx`: `q` ✅ (`:63` debounce), `marked` dropdown (`:128-139`), хуудаслалт local state (`:61`, URL биш), bookmark зөвхөн icon (`:209-212`) | Bookmark toggle, URL хуудаслалт, UI — ФАЗ 7 |
| `/invited-talents/{id}` | Хагас | `talents/[id]/page.tsx:63-76` (detail + түүх), "Бөглөсөн" = `completedAt` `:268`; bookmark зөвхөн icon `:155-157` | Bookmark, UI — ФАЗ 7 |
| Нэр солих / хаах / устгах | **Дутуу** (UI) | API бэлэн `lib/api.ts:702-720`, UI-д 0 | ФАЗ 8 |
| Route `/role-assessment`, `/invited-talents` | **Дутуу** | Одоо `/dashboard/recruitments`, `/dashboard/talents`; `SidebarGate.tsx:19` зөвхөн survey editor-т sidebar нуудаг | ФАЗ 9 (grep: 14 файлд `/dashboard…` линк) |

## 5. Endpoint матриц (§ФАЗ 0.e)

"Код" = `lib/api.ts`-ийн функц; "UI" = lib/api.ts-ийн гаднаас ашиглагдсан эсэх. Бүх GET staging дээр ✅ (verification doc), бүх POST 📦 + swagger.

| Endpoint | openapi | Schema хүрэлцээ | Код | UI | Зөрүү / тэмдэглэл |
|---|---|---|---|---|---|
| GET `/customer/recruitments/` | ✅ | ✅ (`size` анхдагч 9, `status` string, `name` ≤100) | `fetchRecruitmentList` | ✅ | — |
| GET `…/recruitments/statistics` | ✅ | ✅ | `fetchRecruitmentStats` | ✅ | — |
| GET `…/recruitments/{id}` | ✅ | Хагас (`pageSize` swagger-т алга, nullable алга) | `fetchRecruitmentDetail` | ✅ | U13, U31 |
| GET `…/recruitments/status/{id}` | ✅ | ✅ | `fetchRecruitmentBrief` | — | Staging дууддаггүй (R1) → ашиглахгүй |
| POST `…/recruitments/new` | ✅ | ✅ `StrDTO` → string | `createRecruitment` | ✅ | Хариу бодитоор батлагдаагүй (U1) |
| POST `…/{id}/rename` | ✅ | `StrDTO`, 200 schema-гүй | `renameRecruitment` | — | ФАЗ 8 |
| POST `…/close`, `…/delete` | ✅ | `StrDTO {str: id}` | `close/deleteRecruitment` | — | ФАЗ 8 |
| GET `/customer/recruitment-setup/settings` | ✅ | ✅ | `fetchRecruitmentSettings` | — | ФАЗ 3 |
| GET `…/{id}/information` | ✅ | ✅ | `fetchRecruitmentInformation` | — | CREATED үед `jobDescription: null` ✅ |
| POST `…/{id}/update-information` | ✅ | ✅ required `jobTitle, jobDescription, companyName`; `jobTitle/companyName` ≤100; `jobDescription` min 1; 400 schema алга | `updateRecruitmentInformation` | — | Хариу `RestResponseVoid` (`assertRestSuccess`) |
| GET/POST `…/{id}/tests`, `set-tests` | ✅ | ✅ body **шууд `string[]`** | `fetch/setRecruitmentTests` | — | Prompt-ын "шууд массив байж магадгүй" — **батлагдсан** (swagger + 📦) |
| GET/POST `…/{id}/questions`, `set-questions` | ✅ | ✅ body `int64[]` | `fetch/setRecruitmentQuestions` | — | — |
| POST `…/recruitment-setup/publish` | ✅ | ✅ `StrDTO {str: id}` | `publishRecruitment` | — | Урьдчилсан нөхцөлийн 400 code ❓ (U34) |
| `customer-question-controller` (4 POST) | ✅ | ✅ (`CustomQuestion`: survey-ийн `template`, `section` enum) | survey-д | — | **RA-д ашиглагддаггүй** (N7) → хэрэгжүүлэхгүй (Q5) |
| GET `/customer/role-assessments/categories`, `tests`, `tests/{id}` | ✅ | Хагас (`content`, `roleLevels` жагсаалтад ирдэггүй) | `fetchTestCategories`, `fetchCatalogTests`, `fetchRoleAssessmentTest` | `tests/{id}` ✅ | R8, R9 |
| GET `…/question-categories`, `questions` | ✅ | ✅ | `fetchQuestionCategories`, `fetchCatalogQuestions` | — | ФАЗ 4 |
| POST `…/role-assessments/recommend` | ✅ | ✅ `string[]` → `HiringTestPublicDTO[]` | `recommendTests` | — | Утгатай POST (бичилтгүй ❓) — dry-run (Q4) |
| GET `/customer/designs/RECRUITMENT/{id}` | ✅ | ✅ enum: `themeType` LIGHT/YALE/DARK/MIRAGE/PURPLE, `imagePosition` TOP_LEFT/MIDDLE/RIGHT, `designOwnerType` 4 | `fetchDesign` | — | Wizard ачаалахад дуудна (N1) |
| POST `…/upload-logo` (multipart), `remove-logo` `{id}` | ✅ | multipart `object` (талбар `logo` 📦), → string | `uploadDesignLogo`, `removeDesignLogo` | — | Proxy multipart засагдсан (P1). Алхам 1-д (PNG/JPEG ≤200KB 📦) |
| POST `…/designs/{type}/{id}/update` | ✅ | ✅ | `updateDesign` | — | Staging RA-д дууддаггүй → ашиглахгүй |
| GET `/customer/hiring-invitations/list/{rid}` | ✅ | ✅ (query зөвхөн page,size) | `fetchRecruitmentInvitations` | ✅ | GET side effect (PENDING→EXPIRED, U21) |
| GET `…/{rid}/{iid}`, `names/{rid}` | ✅ | ✅ | `fetchInvitationResult`, `fetchInvitationNames` | ✅ | — |
| GET/POST `…/{iid}/rate` | ✅ | ✅ `Rating {points 0..5}` | `fetchInvitationRate` / `rateInvitation` | GET ✅ | ФАЗ 7 |
| GET `…/{iid}/notes`, POST `…/notes/add` | ✅ | ✅ `StrDTO` → `InvitationNoteView` | `fetchInvitationNotes` / `addInvitationNote` | GET ✅ | ≤500 (📦) |
| POST `…/search-by-email` | ✅ | ✅ `Email {value}` → `RestResponseTalentEntity` | `searchTalentByEmail` | — | Утгатай POST — dry-run (Q4) |
| POST `…/invite` | ✅ | ✅ `Talent` (нэр 2–20 `\p{L}`, имэйл 5–50) → string | `inviteTalent` | — | **Жинхэнэ имэйл** — dry-run |
| POST `…/{iid}/extend` | ✅ | ✅ `DateDTO {value: date}` → `Talent` | `extendInvitation` | — | Body олдсон (prompt: "олдохгүй бол асуу" — шаардлагагүй) |
| GET `…/talents`, `talents/{id}`, `talents/{id}/invitations` | ✅ | ✅ | `getHiringInvitations`, `getTalentDetail`, `getTalentInvitations` | ✅ | {success,data} хэлбэр (хуучин) |
| POST `…/talents/bookmark` | ✅ | ✅ `IdDTO` | `toggleTalentBookmark` | — | ФАЗ 7 |
| GET `…/latest-completed` | ✅ | ✅ | `getLatestCompletedInvitations` | ✅ (home) | RA-ийн гадна |
| GET `/customer/hiring/test-result/report/{iid}/{testAnswerId}[/download]` | ✅ (`test-result-controller`) | `text/html` / `string(byte)` | `fetchTestReportHtml`, `downloadTestReport` | ✅ | Download = `application/pdf` ✅ (U25) |
| `/api/customer/recruitments/new-invitation`, `extend-invitation`, `/api/admin/tests/new` | **openapi-д байхгүй** | — | — | — | Хэрэггүй (§4-тэй ижил) |

**Дүгнэлт:** §4-ийн бүх endpoint-ийн path/body тодорхой; schema-гүй хэвээр: алдааны 400/409 хариу, `code`-уудын бүтэн жагсаалт (swagger-т зөвхөн 200).

## 6. Фазын төлөвлөгөө (хийгдсэнийг дахин хийхгүй)

| Фаз | Хамрах хүрээ (зөвхөн дутуу/хуучирсан) | Commit (тусдаа) |
|---|---|---|
| **1 Суурь** | (a) docs-ийг `docs/role-assessment/`-д зөөх; (b) RA функц/type/hook-ийг `lib/api/role-assessment/`, `lib/types/role-assessment.ts`, `lib/hooks/role-assessment/` руу **зөөх** (`lib/api.ts`-д re-export үлдээж бусад модуль эвдрэхгүй); (c) RA hook: `retry:false`, `refetchOnWindowFocus:false`, query key factory, mutation → invalidate; (d) цэвэр функц: `formatDateTime` → `YYYY-MM-DD • HH:mm`, `formatRelative`, `formatBalance` ("Хязгааргүй"), мэдэгдэх error code-ийн нэг файл; (e) `ratingPoints` нэмэх; (f) **DRY-RUN** (§6.1); (g) `node --test` unit тест + `package.json`-д зөвхөн `"test"` script | 5–6 commit |
| **2 Жагсаалт** | Staging харагдал (Q1-ээс хамаарна), polling-ийг staging-ээр батлах, үүсгэх → wizard + staging toast, хоосон/ачаалах/алдаа текст staging-ээс | 2–3 |
| **3 Wizard + алхам 1** | Sidebar-гүй layout, header (Гарах, stepper, Харагдац), баруун карт, Quill editor (Q2), `ra_draft_{id}` (N5), лого upload/remove (dry-run), унших горим | 3–4 |
| **4 Алхам 2, 3** | Каталог, ангилал, тестийн drawer, хязгаар `maxTestCount/maxQuestionCount`, "Санал болгох" modal, set-tests/set-questions | 2–3 |
| **5 Алхам 4, нийтлэх, preview** ⏸ | Хураангуй, publish (confirm + амжилтын modal), preview (Q3) → **ЗОГСОЖ** smoke тестийн зөвшөөрөл хүснэ | 2 |
| **6 Dashboard** | Урих (search-by-email onBlur, validation, confirm), сунгах (EXPIRED), staging-д байхгүй статистик картыг хасах эсэх, UI | 2–3 |
| **7 Үр дүн + талентууд** | Од өгөх, тэмдэглэл нэмэх, "Анхааруулга" modal (текст bundle-ээс), bookmark, URL хуудаслалт, UI | 2–3 |
| **8 Үйлдлүүд** | Нэр солих (CREATED, hover харандаа), хаах (PUBLISHED), устгах (CREATED), kebab-ыг staging-ээр | 1–2 |
| **9 Route + эцсийн** ⏸ | `/role-assessment`, `/invited-talents` (route group), `redirects()`, парити 1440/1024/390, a11y, FINAL.md, MANUAL-QA.md, README | 3 |

### 6.1 DRY-RUN-ийн загвар (ФАЗ 1)

- **Хаана:** нийтлэг axios instance-ийн request давхаргад (`lib/api.ts`). Method ≠ GET **ба** path нь RA-ийн бичих allowlist-д (`/customer/recruitments/{new,close,delete,*/rename}`, `/customer/recruitment-setup/*` POST, `/customer/role-assessments/recommend`, `/customer/designs/RECRUITMENT/*` POST, `/customer/hiring-invitations/*` POST) таарвал сүлжээнд гаргахгүй — custom adapter openapi-д нийцсэн stub буцаана. Ингэснээр `apiPost`, `apiPostOrThrow`, `api.post` аль замаар ч хамгаалагдана. `/user/refresh`, survey-ийн POST-ууд **хамааралгүй**.
- **Stub:** `new` → `crypto.randomUUID()` string; `update-information`, `set-*`, `publish`, `remove-logo`, `rate` → `{message:"DRY-RUN", status:200, success:true, data:null}`; `invite` → uuid string; `extend` → body-оос `Talent`; `notes/add` → `InvitationNoteView`; `search-by-email` → олдсонгүй (`null`); `recommend` → `[]`; `upload-logo` → string; rename/close/delete/bookmark → хоосон 200.
- **Log:** `console.info("[RA DRY-RUN]", method, path, maskedBody)` — имэйл `b***@example.com`, нэр `Б***`, утас `9***`, файл → `{name,size,type}`.
- **Banner:** RA хуудас бүрийн дээд талд "DRY-RUN: өөрчлөлт staging-д хадгалагдахгүй".
- **Идэвхжих дүрэм:** dev-д `NEXT_PUBLIC_RA_ALLOW_WRITES === "1"` үед л бодит; production build-д — Q3.

## 7. Асуулт / блокер (§ФАЗ 0.f) — саналтай

| # | Асуулт | Санал (та "батлав" гэвэл энэ) |
|---|---|---|
| **B1** | Branch: `feature/role-assessment` нь `main`-аас 8 commit хоцорсон; fast-forward-ийг auto mode хаасан | Та өөрөө: `! git switch feature/role-assessment && git merge --ff-only main` (working tree өөрчлөгдөхгүй, dev server нөлөөлөхгүй). Эсвэл надад зөвшөөрөл өгөх |
| **B2** | `pnpm install --frozen-lockfile`-ийг auto mode хаасан | Та өөрөө `! pnpm install --frozen-lockfile` (lockfile таарвал no-op). Одоогийн node_modules-оор build ✅ тул блок биш |
| **Q1** | **Харагдал.** Та staging-parity shell, `/home`-ийг (`d56d7610`, `ed87a606`) revert хийсэн. RA хуудсыг staging шиг (light, Manrope, staging токен) хийвэл одоогийн dark sidebar дотор өөр хэв маягтай харагдана | **(A)** RA route-ийн layout дотор staging харагдлыг **scoped** (light, токен `.ra-scope` дор) хийнэ, sidebar/shell-д хүрэхгүй, wizard тусдаа sidebar-гүй. Revert хийсэн `components/icons/staging.tsx`-ийн SVG-г git түүхээс дахин ашиглана. (B) одоогийн дизайн системээр зөвхөн зан төлөв/текст/API parity. (C) эхлээд shell-ийг сэргээх |
| **Q2** | **Rich text editor** (`package.json`-д байхгүй). `react-quill@2.0.0` нь peer React ≤18, Quill 1, `findDOMNode` ашигладаг → React 19.2-д ажиллахгүй (staging-ийн React 19.0 RC-д `findDOMNode` хэвээр байгаа тул тэнд ажилладаг) | **`quill@2.0.3`** (staging-тэй яг ижил хувилбар, BSD-3, deps: parchment, quill-delta, eventemitter3, lodash-es) + өөрийн ~60 мөрийн wrapper, зөвхөн wizard-д `next/dynamic`-аар. Хэмжээ: staging-ийн ижил chunk 203 KB min / 57.5 KB gzip. Хувилбар: `react-quill-new@3.8.3` (MIT, quill ~2.0.3, React 19 peer) — код бага, нэг сан илүү |
| **Q3** | **Sanitizer** (`package.json`-д байхгүй). Staging sanitize хийдэггүй (N3) | Шинэ сан **нэмэхгүй**: серверийн HTML (тест, тайлан) → одоогийнх шиг sandbox iframe; rich text харуулах (preview, алхам 4) → read-only Quill-ээр (HTML → Delta → HTML, зөвхөн зөвшөөрсөн format: header, bold, italic, underline, link, list; link-ийг Quill http/https/mailto/tel-ээр шүүнэ). Хувилбар: `dompurify@3.4.16` (MPL-2.0/Apache-2.0) |
| **Q3b** | **Production build-ийн dry-run** — "бодит бичилтийг ямар ч тохиолдолд идэвхжүүлэхгүй" | `NODE_ENV === "production"` үед **үргэлж dry-run** (локал `next start` ч staging руу бичихгүй). Жинхэнэ production deploy-ийн өмнө (ФАЗ 9) тусад нь шийднэ |
| **Q4** | `search-by-email`, `recommend` нь POST боловч өгөгдөл өөрчилдөггүй бололтой ❓. Dry-run-д хаавал имэйлээр автомат бөглөх, "Санал болгох" ажиллахгүй | Дүрмийн дагуу **хаана** (stub). Хүсвэл энэ хоёрыг тусгай flag-аар зөвшөөрч болно |
| **Q5** | §4-ийн `customer-question-controller` RA-д ашиглагддаггүй (N7) | RA-д **хэрэгжүүлэхгүй**, mismatches.md-д тэмдэглэнэ |
| **Q6** | ФАЗ 1-ийн `TalentInvitationItem` талбарын жагсаалт (email, firstName, dueDate, createdBy…) нь #23 биш, #24 `InvitationProjection`-ийнх. #23-ийн бодит бүтэц (swagger `InvitationDTO` + staging ✅) өөр | Одоогийн зөв төрлийг хадгалж `ratingPoints?` нэмнэ; #24-ийнх `CompletedInvitation`-д аль хэдийн зөв |
| **Q7** | Unit тест: репод runner байхгүй | Node-ийн built-in `node --test` (Node 25 type stripping, сан биш), `tests/*.test.ts`, `package.json`-д зөвхөн `"test"` script. Цэвэр модулиуд `@/` alias-гүй (relative import) |
| **Q8** | Хайлтын debounce: staging debounce **хийдэггүй** (товч бүрт хүсэлт 📦), §5.4 300–400мс шаардана | 350мс хэвээр (staging-ээс санаатай зөрүү, тэмдэглэнэ) |
| **Q9** | Dashboard дахь staging-д байхгүй 3 статистик карт (`results/page.tsx:257-273`) | Хасна (staging parity) |

Хариулт ирэхээс өмнө ФАЗ 1-ийн ажлыг эхлүүлэхгүй.
