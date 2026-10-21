# Талентийн үнэлгээ — шийдвэрийн бүртгэл (бодит бичилт, 2026-10-21)

Зогсолтгүй горимд өөрөө гаргасан шийдвэрүүд (юу — яагаад).

## Хүрээ, өгөгдөл
- **Баримт:** `PROGRESS.md`, `DECISIONS.md`, `MANUAL-QA.md`-г `15c6ff74`-д устгасан байсан. Энэ даалгаврын агуулгаар шинээр үүсгэв; хуучин агуулга git түүхэнд хэвээр.
- **Screenshot:** файл хадгалаагүй (хэрэглэгчийн байнгын шаардлага: repo-д screenshot хэрэггүй). Browser-т зөвхөн харж шалгаад үр дүнг `PROGRESS.md`-д текстээр бичив.
- **TEST_EMAIL:** даалгаварт `<<<TEST_EMAIL>>>` placeholder хэвээр байсан тул урилгыг бодитоор илгээгээгүй (`POST …/invite` 0 удаа). Алхмуудыг `MANUAL-QA.md`-д бичив.
- **"hunii nuuts" статус:** даалгаварт "нийтлэгдсэн" гэсэн `9547a97a…` нь бодит API-д `CREATED` (0 тест, `publishedAt` null, 2026-10-07 үүссэн). Ижил нэртэй `28696adf…` нь өнөөдөр 12:14-д `PUBLISHED` болсон. Бичих хүсэлтийг заасан id болон түр үнэлгээнээс гадагш гаргаагүй; `28696adf…`-г зөвхөн уншиж, урих modal-ын validation-ийг илгээлгүй шалгав.
- **Од, тэмдэглэл, сунгах, bookmark:** "hunii nuuts" (хоёулаа) дээр урилга 0, урилга илгээх боломжгүй (TEST_EMAIL байхгүй) тул бодит бичилт хийгээгүй. Өөр үнэлгээний урилга дээр бичихгүй (хүрээнээс гадуур). Эдгээрийн GET-ийг өөр үнэлгээний дууссан урилга дээр зөвхөн уншиж шалгав → `MANUAL-QA.md`.
- **Хаах (бодит POST):** түр үнэлгээ `CREATED` бөгөөд нийтлэхийг хориглосон. Шинэ дүрмээр `CREATED` үед хаах товч идэвхгүй. Сервер `CREATED`-ийг хаахыг зөвшөөрвөл түр үнэлгээ `CLOSED` болж устгах боломжгүй үлдэх эрсдэлтэй тул POST илгээгээгүй → `MANUAL-QA.md`.

## Staging-ийн нотолгоо
- Staging (`app-staging.mindxplus.com`) `/login` руу шилжүүлсэн. Нууц үг оруулахгүй тул нэвтэрсэнгүй; нэвтрэлтгүй static bundle (dashboard route-ийн 46 chunk)-ийг scratchpad-д татаж уншив.
- Dashboard (`app/(dashboard)/role-assessment/[id]/dashboard/page-edc4915b86252b66.js`): "Талент үнэлгээ хаах" / "Талент урих" нь `status !== "CLOSED"` үед харагдана, `disabled` огт байхгүй (ачаалж байх үед ч, `CREATED`, `PUBLISHING`, `SUSPENDED` үед ч идэвхтэй).
- Badge (`9378-…js`): `PUBLISHING` → англи "PUBLISHING" (саарал цэг), `SUSPENDED` → "Саатсан" + tooltip "…нийтлэх үед алдаа гарсан байна. Та дахин шинжилгээ үүсгэнэ үү."
- Polling: dashboard-ийн query (`recruitmentDashboard`, `recruitmentInvitations`)-д `refetchInterval` байхгүй (зөвхөн react-query сангийн кодод). Staging polling хийдэггүй.
- Алдаа: staging зөвхөн `plan_expired` code-ийг шалгадаг, бусад үед `e.message || "…алдаа гарлаа"` toast.

## Статусын дүрэм
- **Enum (openapi):** `CREATED | PUBLISHING | PUBLISHED | CLOSED | SUSPENDED`; кодын enum ижил байсан.
- **PUBLISHING асинхрон:** `SUSPENDED`-ийн staging тайлбар ("нийтлэх үед алдаа") нь нийтлэх нь ар талд явдаг `PUBLISHING → PUBLISHED | SUSPENDED` гэдгийг харуулна. Бодит шилжилтийг хэмжиж чадаагүй: `GET recruitments/status/{id}`-г 30с (5с тутам) ажиглахад `PUBLISHING` мөр байгаагүй (74 үнэлгээнээс 0), түр үнэлгээг нийтлэхийг хориглосон.
- **Label:** `PUBLISHING` → "Нийтэлж байна" (staging-д Монгол label байхгүй тул өөрөө сонгосон; badge дээр англи түлхүүр гарахгүй). Нүүр хуудасны (`components/Dashboard.tsx`) badge map-д мөн `PUBLISHING`/`SUSPENDED` нэмэв (өмнө нь англи түлхүүр гардаг байв).
- **Урих:** `PUBLISHING | PUBLISHED` (staging-тэй ижил). `SUSPENDED` үед идэвхгүй: staging-ээс зөрүүтэй; staging өөрөө "дахин үүсгэнэ үү" гэдэг тул эвдэрсэн үнэлгээнд бодит имэйл явуулахаас сэргийлэв. Жагсаалтын карт/kebab-д ч `SUSPENDED` үед "Урих" нуугдаж, үндсэн үйлдэл "Үр дүн" болно.
- **Хаах:** `PUBLISHING | PUBLISHED | SUSPENDED` (staging-тэй ижил; `SUSPENDED`-ийг цэвэрлэх боломж үлдэнэ). Confirm dialog хэвээр.
- **`CREATED` dashboard:** зөвхөн URL-аар хүрнэ (жагсаалт wizard руу хөтөлдөг). Staging идэвхтэй харуулдаг ч сервер урилга/хаалтыг хүлээж авах нь баталгаагүй тул идэвхгүй + шалтгаан ("Талентийн үнэлгээг нийтэлсний дараа боломжтой").
- **Polling:** staging-ээс ялгаатай нэмэлт: статус `PUBLISHING` үед detail болон жагсаалтын query-г 5с тутам дахин татна, 120 удаа (≈10 мин) хүртэл; tab нуугдвал react-query өөрөө зогсоно. Статус өөрчлөгдмөгц зогсоно.

## API, алдаа
- **Алдааны code:** бодитоор ажиглагдсан: `not_found` (404, `application/problem+json`, `detail` Монгол), `validation_exception`, `plan_expired` (өмнөх судалгаа). Давхар урилга, багтаамж дууссан, CLOSED-ийн code-ыг таамаглаагүй: backend эх код машин дээр байхгүй, staging ч map хийдэггүй, бодит урилга илгээх боломжгүй. Оронд нь мэдэгдэхгүй code-той 4xx алдаанд серверийн `ProblemDetail.detail` (Монгол, `Accept-Language: mn-MN`)-ийг харуулна; 5xx болон detail-гүй үед өмнөх fallback.
- **Урилгын validation (swagger `Talent`):** email 5–50, овог/нэр 2–20 үсэг (кирилл шүүлтүүр хэвээр). `lib/role-assessment/invite.ts`-д цэвэр функц + unit тест.
- **Давхар дарах:** илгээх/сунгах товч pending үед disabled (өмнө нь байсан) + `submit`/`send` дотор pending guard.
- **Тайлан татах:** `Content-Type` шалгана (`application/pdf`, `application/octet-stream`); өөр бол файл хадгалахгүй, "Тайлангийн файл буруу хэлбэртэй ирлээ" toast. Бодит хариу: 200, `application/pdf`, `attachment`, `%PDF` гарчигтай.
- **Swagger:** Swagger UI-д Authorize/Execute хийгээгүй. `/v3/api-docs`-ийг (нэвтрэлтгүй GET) scratchpad-д татаж schema-г уншив; өнөөдрийн өмнөх dump-тай яг ижил. `docs/swagger/openapi.json`-ийг хэрэглэгч `afa39b33`-д устгасан тул repo-д дахин нэмээгүй.
- **Dry-run:** `5329ec93`-ийн дараа `dry-run`, `RA_ALLOW_WRITES`, stub, `00000000-0000-4000-…`, banner кодын хаана ч үлдээгүй (grep 0); `.env.example` цэвэр. Хасах зүйл байгаагүй.

## Орчин
- **Build baseline:** HEAD-ийн хуулбарыг scratchpad-д build хийх оролдлого Turbopack-ийн "symlink node_modules … out of the filesystem root" алдаагаар зогссон; 855MB `node_modules`-ийг tmpfs руу хуулахад RAM хүрэлцэхгүй. Өөрчлөлтийн дараах `next build` төсөл дотор амжилттай (0 алдаа) тул шинэ алдаа байхгүй нь шууд батлагдана. Dev server (`.next/dev`) build-ийн үед ч 200 буцаасаар байсан.
- **Biome:** `biome check .` → 1 алдаа (`app/dashboard/surveys/[id]/results/page.tsx`, өмнөх baseline-д байсан), шинэ алдаагүй.
- **Git:** HEAD `main` дээр байсан (хэрэглэгчийн сүүлийн commit-ууд мөн `main` дээр). Branch сольж/үүсгэлгүй одоогийн branch-д commit хийв; push хийгээгүй.
