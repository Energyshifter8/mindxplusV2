# Талентийн үнэлгээ — явц

Контекст сэргээгдвэл эндээс эхэл: доорх `[ ]` үлдсэнээс үргэлжлүүл. Шийдвэр → `DECISIONS.md`.
Commit: `$SCRATCHPAD/bin/rac "<msg>"` (branch шалгадаг). Шалгалт: source tsc (`.next` хассан tsconfig), eslint, biome, `next build`, dev server :3000 амьд.

Staging bundle (нэвтрэлтгүй static JS/CSS): `$SCRATCHPAD/staging-bundle/{app,chunks,css,pretty}`. Скрипт: `$SCRATCHPAD/bin/{rac,checks,tsc-src}`. Локал session дуусвал аппын `POST /api/user/refresh`-ийг browser-оос дуудна.

Baseline: source tsc 0 · eslint 0 алдаа / 10 warning · biome 1 (хуучин) · build ✅.

## 0. Судалгаа
- [x] Staging chunk/CSS-ийг scratchpad-д татах (list, wizard, preview, dashboard, result, talents)

## 1. Суурь — `123c5211`, `cfe372c7`, `d94eca3c`
- [x] HTTP core → `lib/api/http.ts` (lib/api.ts re-export)
- [x] RA API → `lib/api/role-assessment/*` (throw, ApiError)
- [x] Type → `lib/types/role-assessment.ts` (+`ratingPoints?`)
- [x] `createRecruitment` throw хэлбэрт
- [x] Error code map (нэг файл, fallback)
- [x] Цэвэр функц: огноо `YYYY-MM-DD • HH:mm`, харьцангуй, "Хязгааргүй", статусын дүрэм
- [x] Hook → `lib/hooks/role-assessment/*` (retry:false, focus:false, polling үгүй)
- [x] DRY-RUN: axios adapter, proxy guard, banner, `.env.example`
- [x] Unit тест (`node --test`, `"test"` script)
- [x] RA scope: токен, Manrope, staging UI primitive-ууд

## 2. Жагсаалт `/role-assessment`
- [x] Tab, хайлт, хуудаслалт, статистик, хүснэгт/grid, badge, kebab, drawer, үүсгэх/нэр солих/устгах/хаах modal, урих modal (dry-run шалгасан)
- [x] Төлөв: loading/empty/error; GET матриц (list → statistics, staging-ийн дараалал); staging screenshot-той харьцуулсан (`screens/01-list-local.jpg`); live extract diff — staging session дууссан (DECISIONS)

## 3. Wizard — `768a5081` (quill), `7407e985` (wizard), preview
- [x] Layout (sidebar-гүй), header, stepper, баруун карт
- [x] Quill wrapper (lazy, SSR-safe, StrictMode guard)
- [x] Алхам 1 + `ra_draft_{id}` + лого
- [x] Алхам 2 (тест, ангилал, drawer, санал болгох)
- [x] Алхам 3 (каталогийн асуулт)
- [x] Алхам 4 + нийтлэх (confirm)
- [x] Унших горим (PUBLISHED/CLOSED)
- [x] `/preview`
- [x] Unit тест (`wizard.test.mjs`), screenshot (`screens/03-*`, `04-*`), dry-run e2e

## 4. Dashboard
- [x] Хүснэгт (badge, од, огноо, урьсан, хуудаслалт URL), тест (drawer), асуулт, 3 хуурамч карт хассан
- [x] Урих modal (зөвхөн PUBLISHED), дахин урих/сунгах (EXPIRED), plan_expired modal
- [x] Хаах (confirm, dry-run шалгасан), "Дэлгэрэнгүй" drawer; screenshot `screens/05-dashboard-local.jpg`
- [x] Хайлт: API (`list/{id}`) зөвхөн page/size, staging-д ч байхгүй → хийгээгүй (mismatches)

## 5. Талентын үр дүн
- [x] Толгой (breadcrumb, avatar, имэйл хуулах, нэрс сонгох, өмнөх/дараах), тест accordion (API өгөгдөл), нэмэлт асуулт
- [x] HTML тайлан drawer (`sandbox=""`), тайлан татах, анхааруулга + "Санамж" modal, төлөв, явцын хяналт
- [x] Од үнэлгээ, тэмдэглэл (≤500) — dry-run шалгасан; plan_expired; screenshot `screens/06-result-local.jpg`
- [x] Unit тест (`result.test.mjs`)

## 6. Урьсан талентууд
- [x] Жагсаалт (q 350мс, хуудаслалт/q/marked URL-д, хэтэрсэн хуудас засах), bookmark toggle (dry-run), хоосон/алдаа/skeleton
- [x] Дэлгэрэнгүй + урилгын түүх (state хуудаслалт `[10,12,20,50]`), bookmark төлөв; "Үр дүн" → үр дүнгийн хуудас
- [x] `lib/api.ts`-ийн түр talents функцуудыг хасав; unit тест (`talents.test.mjs`); screenshot `screens/07-*`, `08-*`

## 7. Нэр солих / хаах / устгах
- [x] Жагсаалт, kebab, confirm (ФАЗ 2-т хийгдсэн)
- [x] Dashboard-ын "Талент үнэлгээ хаах"

## 8. Route
- [x] `/role-assessment` (wizard `/{id}`, `/{id}/preview` sidebar-гүй; `/{id}/dashboard[/{iid}]`), `/invited-talents[/{talentId}]`, `redirects()` (307, query хадгална), `lib/routes.ts`, Sidebar/нүүрийн линк

## 9. Баримт
- [ ] README, MANUAL-QA.md, unverified.md, mismatches.md, FINAL тайлан
