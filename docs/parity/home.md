# Parity: `/home` + app shell (staging ↔ локал)

- **Огноо:** 2026-10-06 · **Лавлагаа:** `https://app-staging.mindxplus.com` (үнэний эх сурвалж) · **Локал:** `localhost:3000`
- **Төлөв:** Хэсэг A (staging шинжилгээ) ба Хэсэг B (харьцуулалт) ✅. Хэсэг C (засвар) — эхлээгүй (доорх "Хүлээгдэж буй шийдвэр").
- Хувийн мэдээлэл (нэр, имэйл, утас) энэ баримтад байхгүй; хэрэгслүүд hash болгож маскална.

## 0. Арга зүй, орчин

| Асуудал | Шийдэл |
|---|---|
| Цонх resize ажиллахгүй (tiling WM — Omarchy/Hyprland хүсэлтийг үл тоосон), хоёр tab өөр zoom-той (DPR 1.13 / 1.02) | Хоёр tab-д **ижил origin-ий `<iframe>`**-ийг яг 1440×900, 1024×768, 390×844 CSS px хэмжээтэй нээж хэмжив. CSS утга zoom-оос хамаарахгүй. Staging ба локал хоёуланд `X-Frame-Options`/CSP байхгүй ✅ |
| Network | `docs/parity/tools/netpatch.js` — fetch + XHR patch (header-ийн НЭР, body/response-ийн БҮТЭЦ). Анхны ачааллыг Performance resource timing-аар (хоёр апп-д ижил найдвартай), header-ийг XHR patch-аар. Локал chunk кэштэй үед GET-үүд 146мс-д эхэлдэг тул parent-ийн patch хоцордог — локалын header-ийг код + proxy-оор баталсан |
| DOM/стиль | `docs/parity/tools/extract.js` — харагдах node бүрийн tag, role, text (маск), rect, font/color/bg/border/radius/shadow/padding/margin/gap/opacity/cursor; `parityDiff()` текстээр тааруулна |
| Staging-ийн бичих үйлдэл | Товч дараагүй. Нийтийн JS bundle-аас уншсан (📦 bundle-derived) |
| Апп-ын өөрийн POST | Локал апп ачаалснаас ~3с-ийн дараа `POST /user/refresh` илгээдэг (хяналт). Staging энэ хугацаанд илгээгээгүй (195с ажигласан) |

## 1. Sidebar-ын route-ууд (staging) ба локал

| Бүлэг | Цэс (staging текст) | Staging route | Локал route / текст | Хуудасны төлөв (локал) |
|---|---|---|---|---|
| — | Logo | `/home` | — (logo линк биш) | — |
| Нүүр | Нүүр хуудас | `/home` | `/dashboard` | **Зөрүүтэй** (энэ ажлын хүрээ) |
| Шинжилгээ | Шинжилгээ үүсгэх | `/templates` | `/dashboard/surveys/new` | Зөрүүтэй (шалгаагүй) |
| Шинжилгээ | Миний шинжилгээ | `/survey` | `/dashboard/surveys` | Зөрүүтэй (шалгаагүй) |
| Талентийн үнэлгээ | Талентийн үнэлгээ **үүсгэх** | `/role-assessment` | `/dashboard/recruitments`, текст "Талентийн үнэлгээ" | Зөрүүтэй (ФАЗ 2 UI хуучин хэв маягаар) |
| Талентийн үнэлгээ | Миний урьсан талентууд | `/invited-talents` | `/dashboard/talents` | Зөрүүтэй |
| Хэрэглэгчийн цэс | Миний бүртгэл | (modal / `/profile?section=…` 📦) | байхгүй | **Байхгүй** |
| Хэрэглэгчийн цэс | Гарах | `POST /user/logout` → `/login` 📦 | Dashboard-ын header дээр "Гарах" (зөвхөн localStorage цэвэрлэнэ) | Зөрүүтэй |
| Тогтмол товч | Холбоо барих (баруун доод, 40×40) | Тусламжийн modal 📦 | байхгүй | **Байхгүй** |

Staging-ийн бусад мэдэгдэж буй route: `/role-assessment/{id}` (wizard), `/role-assessment/{id}/preview`, `/role-assessment/{id}/dashboard`, `/role-assessment/{id}/dashboard/{invitationId}`, `/invited-talents/{talentId}`, `/membership`, `/profile?section=membership`, `/login`. Survey-ийн дэд route (`/survey/...`) — судлаагүй.

## 2. Endpoint матриц — `/home` анх ачаалах

Trigger: хуудас mount. Header (staging, XHR patch ✅): `accept, accept-language, authorization`. Локал upstream header (proxy): `Accept, Accept-Language: mn-MN, Authorization, Cookie`.

| # | Method | Path | Staging query | Локал query | Staging | Локал | Дүгнэлт |
|---|---|---|---|---|---|---|---|
| E1 | GET | `/customer/profile` | — | — | ✅ ~117мс, зэрэг | **дууддаггүй** | **Гол зөрүү** (staging дуудна, локал үгүй) |
| E2 | GET | `/customer/surveys` | `status=&page=0&size=6&name=` | `page=0&size=10` | ✅ | ✅ | **Зөрүү**: size 6↔10, хоосон `status`/`name` байхгүй |
| E3 | GET | `/customer/surveys-home/statistics` | — | — | ✅ | ✅ | Ижил |
| E4 | GET | `/customer/recruitments/` | `page=0&size=6` | `page=0&size=10` | ✅ | ✅ | **Зөрүү**: size |
| E5 | GET | `/customer/recruitments/statistics` | — | — | ✅ | ✅ | Ижил |
| E6 | GET | `/customer/hiring-invitations/latest-completed` | — (параметргүй) | `limit=5` | ✅ (5 мөр ирсэн) | ✅ | **Зөрүү**: `limit` |
| E7 | POST | `/user/refresh` | — | — | ачаалахад **үгүй** | ~3с-д ✅ | **Гол зөрүү** (локал л дууддаг) |

| Зан төлөв | Staging (📦 bundle + ажиглалт) | Локал | Дүгнэлт |
|---|---|---|---|
| Дуудлагын дараалал | 6-уулаа зэрэг (~117мс) | 5-уулаа зэрэг (~146мс) | Ижил хэлбэр (E1 дутуу) |
| Давхардал | Байхгүй | Байхгүй (StrictMode-ын давхардал ажиглагдаагүй) | Ижил |
| Polling | Байхгүй (195с-д 0) | stats-д `refetchInterval: 30000` | **Зөрүү** |
| Tab-д буцаж ирэх | `refetchOnWindowFocus: false` | React Query анхдагч (true) | **Зөрүү** |
| Retry | `retry: false` | 4xx-аас бусад 3 удаа | **Зөрүү** |
| Query key | `home-surveys`, `home-survey-stats`, `home-recruitments`, `home-hiring-stats`, `home-latest-talents`, `profile` (staleTime 5мин) | `surveyList`, `surveyStats`, `recruitmentList`, `recruitmentStats`, `completedInvitations` | Дотоод (харагдахгүй) |
| Token refresh | Mount/сүүлийн refresh-ээс **9 мин**-ийн дараа; tab нуугдвал зогсоно; `navigator.locks("token-refresh")`; JWT хугацаа дууссан/401 → logout. **localhost дээр огт ажиллахгүй** (hostname шалгалт) 📦 | 3с-д анх, дараа 9 мин тутам; retry; 401 interceptor refresh+retry | **Гол зөрүү** — §12 шийдвэр |
| Logout | `POST /user/logout` → token устгах → `toast.warning("Дахин нэвтэрнэ үү!")` (refresh 401 үед) → `/login` 📦 | localStorage → `/login` (POST-гүй) | Зөрүү |
| API client | axios `baseURL=service-staging`, `timeout: 30000`, `withCredentials`, auth endpoint-оос Authorization хасна 📦 | axios → `/api` proxy (архитектур, ялгаа биш) | Timeout зөрүү |

## 3. App shell (1440×900)

| Параметр | Staging | Локал | Дүгнэлт |
|---|---|---|---|
| Sidebar өргөн | 260px | 272px | Зөрүү |
| Sidebar дэвсгэр / хүрээ | `#fbfcfe` дотор, гадна `rgb(245,245,245)`, баруун хүрээ 1px `rgb(228,232,239)` | Dark/grid хэв маяг | Зөрүү |
| Фонт | Manrope (`font-sf`), 14px/1.4, `letter-spacing: .2px` | Geist / JetBrains Mono (uppercase) | Зөрүү |
| Logo | mindX SVG 100×24, `/home` линк | "mind X +" текстэн logo | Зөрүү (asset хэрэгтэй) |
| Sidebar хураах товч | 32×32, `hover:bg-gray-100 rounded`, `md:flex` | байхгүй | Байхгүй |
| Орчны banner | "Working on staging" — 14px/500, `#dc2626` / `#fecaca`, `px-2 py-[6px] rounded-md` | байхгүй | Байхгүй (§12 асуулт) |
| Бүлгийн гарчиг | 12px/500, lh 16.8px, `#92a3bb` (TextColor-third), uppercase биш | 10px JetBrains Mono uppercase `#555` | Зөрүү |
| Цэс | 14px/500, lh 19.6px, `#10182b`, `px-2 py-1.5 rounded-[4px] gap-2`, icon 16px | 12px mono uppercase | Зөрүү |
| Идэвхтэй цэс | `bg #f5f7ff` + `shadow 0 0 0 2px #fbfcfe, 0 0 0 4px #cbd5e1` | Ногоон | Зөрүү |
| Hover | `bg rgba(146,163,187,.15)`, `transition-colors 150ms cubic-bezier(.4,0,.2,1)` | өөр | Зөрүү |
| Хэрэглэгчийн блок | Доод хэсэг: avatar icon 24, "Миний бүртгэл" 13px/600 `#071522`, имэйл 13px/500 `#757575` (`/customer/profile`-оос), chevron 24 → antd dropdown (240×88): **Миний бүртгэл**, **Гарах** | Hardcode "Хэрэглэгч"/"user@example.com", dropdown байхгүй | Зөрүү |
| Багцын анхааруулга | Sidebar-д байхгүй | "Таны багцын хугацаа дуусах гэж байна." (hardcode) | Илүүдэл |
| Theme toggle | Байхгүй | "Харанхуй" | Илүүдэл |
| "Холбоо барих" товч | `fixed` баруун доод, 40×40 `rounded-full bg-#4b5563 hover:#374151 shadow 0 0 24px rgba(0,0,0,.6)` | Байхгүй | Байхгүй |
| Header | Хуудас бүр өөрийн `<header>` (72px, `border-b`, гарчиг) | Dashboard-д тусдаа top bar ("Гарах") | Зөрүү |

## 4. `/home` блокууд (staging ✅ ажиглалт + 📦 bundle)

| Блок | Өгөгдөл | Staging | Локал |
|---|---|---|---|
| Header | — | "Нүүр хуудас", 72px, `border-b border-Stroke-600 bg-white px-6` | "Хяналтын самбар" |
| Шинжилгээний самбар | E2, E3 | `bg-white border #e4e8ef rounded-2xl p-6 gap-5`; гарчиг "Миний шинжилгээ" + "Таны үндсэн үнэлгээний үйл ажиллагааг товч харуулав." + "Шинжилгээ үүсгэх" товч; 3 карт: Нийтэлсэн шинжилгээний тоо / Нийт шинжилгээнд оролцогчдын тоо / Үлдсэн шинжилгээний эрх; хүснэгт: №, Нэр, Төлөв, Асуулт, Явц, Үүсгэсэн (6 мөр) | Өөр бүтэц, 10 мөр |
| Талентийн самбар | E4, E5 | "Талентийн үнэлгээ" + "Үүссэн талентийн үнэлгээ болон оролцогчдын бөглөсөн үр дүнг шууд харах." + "Талентийн үнэлгээ үүсгэх"; 3 карт: Нийт урьсан талент / Нийт үнэлгээнд оролцсон талент / Үлдсэн урилгын эрх; хүснэгт: №, Нэр, Төлөв, Талент, Үүсгэсэн | Өөр |
| Сүүлд бөглөсөн | E6 | №, Нэр, Ажлын байр, Бөглөсөн хугацаа (харьцангуй) | Өөр багана, огноо |
| Мөр дарах | — | Шинжилгээ → (📦 судлах), recruitment: `CREATED` → `/role-assessment/{id}`, бусад → `/role-assessment/{id}/dashboard`; мөр 56px, `hover:bg-Primary-softBg` | Мөр дарагдахгүй |
| Нөхцөлт banner | account | Багц дууссан ("Таны багцын хүчинтэй хугацаа дууссан байна." + "Холбоо барих"), FREE+OWNER үед upsell ("Илүү олон боломжийг нээгээрэй" → `/profile?section=membership`) 📦 | Байхгүй |
| Тусламжийн modal | — | "Танд тусламж хэрэгтэй бол бидэнтэй холбогдоорой." + Имэйл/Утас/Хаяг, цагийн хуваарь 📦 | Байхгүй |

## 5. Төлөвүүд

| Төлөв | Staging | Локал | Дүгнэлт |
|---|---|---|---|
| Ачаалах | Хүснэгт тус бүрт antd Skeleton (`active`, 3 мөр) — `isFetching` үед 📦 | TableSkeleton (5 мөр, mono) | Зөрүү |
| Хоосон | "Шинжилгээ байхгүй байна" (py-8), "Талентийн үнэлгээ байхгүй байна" (py-6), "Дууссан үнэлгээ байхгүй байна" (py-6) — 14px/500 TextColor-secondary, төвд 📦 | Өөр текст | Зөрүү |
| Алдаа | `retry: false`; тусгай алдааны UI байхгүй — өгөгдөлгүй үед хоосон төлөв харагдана 📦❓ | Хоосон/алдааны текст өөр | Зөрүү (staging-ийг дагавал хоосон төлөв) |

## 6. Хэлбэржүүлэлт

| Параметр | Staging | Локал |
|---|---|---|
| № | `1.` (цэгтэй) | `1` |
| Огноо цаг | `YYYY-MM-DD` `•` `HH:mm` (14px/500 TextColor-secondary, `•` 600 TextColor-third, gap-2); хоосон бол `-` 📦 | `toLocaleDateString("mn-MN")` (`MM/DD/YYYY`) |
| Харьцангуй хугацаа | <60мин "N минутын өмнө", <24ц "N цагийн өмнө", 1 өдөр "Өдрийн өмнө", бусад "N өдрийн өмнө", алдаа "-" 📦 | Огноо |
| Статистик | ≥ 10000 → "Хязгааргүй", null → 0, 20px/700 lh 24px 📦 | ≥ 100000 → "Хязгааргүй" (MiniStatCard) |
| Явц (шинжилгээ) | `receivedResponseCount/goal`, goal 0 бол `-` | `x/y` |
| Талент (recruitment) | `totalInvitationCount > 0 ? тоо : "-"` | `completed/total` |
| Статус badge | Идэвхтэй (ногоон цэг), Үүссэн (шар цэг), Хаагдсан (✓) | өөр хэв маяг |

## 7. Хөдөлгөөн, мета, a11y

| Параметр | Staging | Локал |
|---|---|---|
| Transition | `transition-colors` 150мс `cubic-bezier(.4,0,.2,1)` (цэс, мөр, товч) | өөр |
| `document.title` | "Нүүр хуудас" | "System" |
| `<html lang>` | `en` | `mn` |
| Favicon | `/favicon.ico` 16×16 | `/favicon.ico` (өөр файл эсэх шалгаагүй) |
| Sidebar a11y | `<aside>` + `<nav>`, линк `aria-current` байхгүй; хураах товч `div` (role/aria байхгүй) | `<aside>`/`<nav>` |
| Холбоо барих товч | `aria-label="Холбоо барих"` | байхгүй |

## 8. Responsive

| Өргөн | Staging | Локал |
|---|---|---|
| 1440 | Sidebar 260 + 2 багана самбар (546 тус бүр) | Sidebar 272 + өөр layout |
| 1024 | Sidebar 260, самбарууд **1 багана** (701) | Sidebar 272 |
| 390 | Sidebar **нуугдана**, header-т hamburger байхгүй, самбар 1 багана (327) | Sidebar 272 хэвээр → main **118px** (эвдэрнэ) |

## 9. Staging-ийн өнгөний токен (CSS-ээс)

`TextColor-main #10182b` · `TextColor-secondary #637389` · `TextColor-third #92a3bb` · `TextColor-disable #cbd5e1` · `Stroke-500 #f0f6fc` · `Stroke-600 #e4e8ef` · `Stroke-700 #cbd5e1` · `Stroke-800 #92a3bb` · `Ghost-50/150/200 rgba(146,163,187,.05/.15/.2)` · `Gray-50 #f8f8f8` · `Gray-100 #f0f6fc` · `Primary #8ca9ff` · `Primary-hover #a3baff` · `Primary-press #7094ff` · `Primary-softBg #f5f7ff` · `Semantic-success100/500/800 #f2ffe0/#72bf0f/#1c2f04` · `warning #fff8e0/#ffd95c/#523f00` · `error #ffe5e0/#ff775c/#661100` · `info #e0f2ff/#8ccdff/#001d33`. Фонт: Manrope.

## 10. Шаардлагатай asset (татахаас өмнө зөвшөөрөл хэрэгтэй)

Репод байхгүй (lucide-д тохирох icon олдсонгүй, зөвхөн `lucide-user` таарна):
1. mindX logo SVG (100×24)
2. Sidebar хураах icon (20×18)
3. Цэсний icon: Нүүр хуудас, Шинжилгээ үүсгэх, Миний шинжилгээ, Талентийн үнэлгээ үүсгэх (16×16)
4. Хэрэглэгчийн avatar icon (24), chevron-selector (20)
5. Нэмэх (+) icon (16), статистик картын 6 icon (14–16), статус ✓ (10)
6. "Холбоо барих" товчны icon (24)
7. Manrope фонт (`next/font/google`-оор — шинэ сан биш, гэхдээ build үед Google-ээс татна)

Хэрэгтэй бол staging-ийн DOM-оос SVG markup-ийг шууд хуулж `components/icons/`-д оруулна.

## 11. Route шилжүүлэх төлөвлөгөө (тусдаа commit)

Staging-ийн route-д шилжүүлж, хуучин path-ыг `next.config.ts`-ийн `redirects()`-ээр (query хадгалагдана) үлдээнэ. Shell-ийг `app/(app)/layout.tsx` route group-д шилжүүлнэ.

| Хуучин (локал) | Шинэ (staging) | Файл |
|---|---|---|
| `/dashboard` | `/home` | `app/dashboard/page.tsx` → `app/(app)/home/page.tsx` |
| `/dashboard/recruitments` | `/role-assessment` | `app/dashboard/recruitments/page.tsx` → `app/(app)/role-assessment/page.tsx` |
| `/dashboard/recruitments/{id}/edit` | `/role-assessment/{id}` | `…/[id]/edit/page.tsx` → `app/(app)/role-assessment/[id]/page.tsx` |
| `/dashboard/recruitments/{id}/results` | `/role-assessment/{id}/dashboard` | `…/[id]/results/page.tsx` → `…/[id]/dashboard/page.tsx` |
| `/dashboard/recruitments/{id}/results/{iid}` | `/role-assessment/{id}/dashboard/{iid}` | `…/results/[invitationId]` → `…/dashboard/[invitationId]` |
| `/dashboard/talents`, `/{id}` | `/invited-talents`, `/{id}` | `app/dashboard/talents/**` → `app/(app)/invited-talents/**` |
| `/dashboard/surveys` | `/survey` | `app/dashboard/surveys/page.tsx` → `app/(app)/survey/page.tsx` |
| `/dashboard/surveys/new` | `/templates` | `app/dashboard/surveys/new/page.tsx` → `app/(app)/templates/page.tsx` |
| `/dashboard/surveys/{id}/edit`, `/results` | staging route тодорхойгүй | **Хуучин path-д үлдээнэ** (survey хэсгийг судалсны дараа) |
| `app/dashboard/layout.tsx` | `app/(app)/layout.tsx` | Shell (SidebarGate) |

Дотоод линк, `router.push`, sidebar-ын идэвхтэй төлөв, `SidebarGate`-ийн editor regex: `grep -rlE '/dashboard(/|")'` — 14 файл (AuthForm, Dashboard, Sidebar, CreateRecruitmentModal, useCreateSurvey, recruitments/talents/surveys хуудсууд).

## 12. Хүлээгдэж буй шийдвэр / блок

1. **Branch:** `main` руу шилжих (`git switch main && git merge --ff-only feature/role-assessment`) нь auto mode-оор хаагдсан. Хэрэглэгч өөрөө ажиллуулах эсвэл зөвшөөрөх хэрэгтэй.
2. **Asset/фонт** (§10) татах зөвшөөрөл.
3. **Token refresh:** staging localhost дээр refresh хийдэггүй. Яг хуулбал локал dev-д token хугацаа дуусахад гарна. Санал: staging-ийн хуваарь (9 мин, visibility, locks, JWT шалгалт) + localhost-ийн шалгалтгүй.
4. **"Working on staging" banner:** staging апп орчноос хамаарч харуулдаг 📦. Локал staging backend ашигладаг тул харуулах уу?
5. **Theme:** staging зөвхөн гэрэл (light). Shell-ийг light болгоход бусад (одоохондоо хөрвүүлээгүй) хуудас dark хэвээр үлдэж зөрнө — дараалсан хуудсаар шилжүүлнэ.
6. **`lang="en"`:** staging `en` (Монгол контенттой). Яг дагах уу?
