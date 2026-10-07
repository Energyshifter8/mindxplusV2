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
- [ ] Хүснэгт, тест, асуулт, 3 хуурамч карт хасах
- [ ] Урих modal (search-by-email, validation)
- [ ] Сунгах (EXPIRED)
- [ ] Хаах

## 5. Талентын үр дүн
- [ ] Харагдал, од өгөх, тэмдэглэл нэмэх, "Анхааруулга"

## 6. Урьсан талентууд
- [ ] Жагсаалт (q, хуудаслалт URL, marked), bookmark
- [ ] Дэлгэрэнгүй + түүх, bookmark

## 7. Нэр солих / хаах / устгах
- [x] Жагсаалт, kebab, confirm (ФАЗ 2-т хийгдсэн)
- [ ] Dashboard-ын "Талент үнэлгээ хаах"

## 8. Route
- [ ] `/role-assessment`, `/invited-talents`, redirects, линк, sidebar

## 9. Баримт
- [ ] README, MANUAL-QA.md, unverified.md, mismatches.md, FINAL тайлан
