# Талентийн үнэлгээ — staging-аас санаатай зөрүү

Staging-тай яг ижил биш, мэдсээр хийсэн шийдлүүд (шалтгаантай). Дэлгэрэнгүй:
`DECISIONS.md`. Таамгаар нэмсэн функц байхгүй.

## Ерөнхий

| # | Хаана | Staging | Локал | Шалтгаан |
|---|---|---|---|---|
| M1 | Бүх RA хуудас | Shell-ийн өнгө | Light staging scope (Manrope, токен) зөвхөн RA замд | Зөвшөөрсөн (D1); бусад модуль өөрчлөгдөөгүй |
| M2 | Бүх бичих хүсэлт | Шууд сүлжээнд | `NEXT_PUBLIC_RA_ALLOW_WRITES !== "1"` үед DRY-RUN (stub + banner) | Аюулгүй байдал (D4) |
| M3 | Алдааны төлөв | Зөвхөн toast, хоосон төлөв | Toast + тусдаа алдааны төлөв "Дахин оролдох" | Алдааг хоосонтой андуурахгүй |
| M4 | Товч/линк | `div onClick`, focus ring-гүй | `<Link>`/`<button>`, focus-visible ring, aria-label | A11y, keyboard |
| M5 | Хүсэлтийн тохиргоо | — | Hook бүрт `retry:false`, `refetchOnWindowFocus:false` | Staging-тэй ижил үр дүн, глобал QueryClient-д хүрэхгүй |
| M6 | document.title | Next metadata | `MutationObserver`-тэй hook | Async metadata дарж бичдэг |
| M7 | HTML контент | `dangerouslySetInnerHTML` / `sandbox="allow-same-origin"` | `<iframe sandbox="">` (тест, тайлан), rich text read-only Quill + линкийн протокол шалгалт | XSS (D3) |
| M8 | Хуудасны өргөн | Root `mx-auto` | RaScope `[&>*]:w-full min-w-0` | Хүснэгт хуудсыг өргөсгөхгүй |

## Жагсаалт `/role-assessment`

| # | Staging | Локал | Шалтгаан |
|---|---|---|---|
| M9 | Tab/хайлт state-д | URL (`status`, `name`), нэг `replace`-ээр page=1 | Refresh/share, давхар хүсэлтгүй |
| M10 | Хайлт debounce | 350мс | Зөвшөөрсөн |
| M11 | Create modal | Enter-ээр илгээнэ | Keyboard |
| M12 | Статистик карт `flex` | <640px босоо | 390-д "Хязгааргүй" халидаг |

## Wizard / preview

| # | Staging | Локал | Шалтгаан |
|---|---|---|---|
| M13 | Унших горим зөвхөн PUBLISHED | CREATED-ээс бусад бүх статус | Бусад статуст засвар серверт амжилтгүй |
| M14 | "Нийтлэх" шууд | Баталгаажуулах dialog | Буцаагдахгүй үйлдэл |
| M15 | Сонголтын дараалал каталогийнх | Серверийн id-ийн дараалал | Тогтвортой badge |
| M16 | <lg баруун самбар хавчигдана | Контентын доор | Responsive |
| M17 | Ноорог сэргээдэггүй | DRY-RUN-д л `ra_draft_{id}`-аас сэргээнэ | Stub хадгалалттай урсгал үргэлжлэх |
| M18 | Асуулт `div onClick`, алхам `div role=button` | `<label>`+checkbox, "stretched button", `<fieldset>` | A11y, button дотор button үүсэхгүй |
| M19 | Preview "Эхлэх" хоосон үед ч идэвхтэй | Тест/асуулт хоосон бол disabled | Алдаатай дэлгэц рүү орохгүй |

## Dashboard / үр дүн

| # | Staging | Локал | Шалтгаан |
|---|---|---|---|
| M20 | Хуудаслалт state-д | URL (`page`, `size`) | Жагсаалттай нийцтэй |
| M21 | Урих/хаах CLOSED-оос бусад үед (ачаалж байхад ч) | Статус ирсний дараа; PUBLISHED биш бол disabled + шалтгаан | Зөвхөн PUBLISHED-д урих дүрэм |
| M22 | Хоёр `h1` | Модулийн гарчиг `p`, нэр `h1` | A11y |
| M23 | "Багцтай танилцах" → `/membership` | Ижил (энэ аппад хуудас байхгүй → 404) | Membership модуль хамрах хүрээнээс гадуур |
| M24 | Тестийн accordion-ы бие (gauge, тайлбар, ярилцлагын санаа, зөвлөмж) | API `subContents` (хүчин зүйл, түвшин, оноо) + "Анхаарал төвлөрөл" | Module 36209 татагдаагүй chunk-д (MANUAL-QA) |
| M25 | Үр дүнгийн толгой наалддаггүй (`overflow-x-hidden` root) | `overflow-x-clip` — наалддаг | Staging-ийн CSS алдаа |
| M26 | Dashboard-д хайлт байхгүй | Байхгүй (API `page,size` л) | Таамгаар параметр нэмээгүй |

## Урьсан талентууд

| # | Staging | Локал | Шалтгаан |
|---|---|---|---|
| M27 | Хайлт/шүүлт state-д | URL (`q`, `marked=true`) | Refresh/share |
| M28 | Картын mapper swagger-т байхгүй талбар (`roleTags`, `mobileNo`…) уншдаг | Зөвхөн swagger `Talent` | `any`-гүй, таамаггүй |
| M29 | Картын нэр `shrink-0` | `min-w-0 break-words` | Урт нэр 390-д халидаг |
