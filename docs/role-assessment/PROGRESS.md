# Талентийн үнэлгээ — явц (бодит бичилт, 2026-10-21)

Шийдвэр → `DECISIONS.md`. Гараар шалгах үлдсэн алхам → `MANUAL-QA.md`.

Шалгалт: source tsc (`.next` хассан tsconfig) 0 алдаа · eslint 0 алдаа / 10 warning (baseline-тай ижил) · biome 1 (хуучин, surveys) · `pnpm test` 34/34 · `next build` ✅.

## 0. Хүрээ
- [x] Бичих хүсэлт зөвхөн түр үнэлгээ `RA-TEST-DELETE-ME-20261021-142009` (`5a59fb45…`) дээр: үүсгэх, нэр солих, устгах. Нийтлээгүй.
- [x] "hunii nuuts" (`9547a97a…`) бодитоор `CREATED`, урилга 0 → урих/сунгах/од/тэмдэглэл/bookmark бичилт хийгдээгүй (DECISIONS).
- [x] TEST_EMAIL placeholder → урилга илгээгээгүй (`POST …/invite` 0) → MANUAL-QA §2.

## 1. Dry-run цэвэрлэгээ
- [x] `dry-run`, `RA_ALLOW_WRITES`, stub, `00000000-0000-4000-…`, banner: grep 0; `.env.example` цэвэр (хэрэглэгч `5329ec93`-д хассан).
- [x] Бичих хүсэлт сүлжээнд гарч 2xx: `POST recruitments/new` 200, `POST …/rename` 200, `POST recruitments/delete` 200, `POST hiring-invitations/search-by-email` 200.
- [x] Хамгаалалт: устгах/хаах/нийтлэх confirm dialog, pending үед товч disabled + submit guard, имэйл/нэрийн validation (swagger хязгаар).

## 2. PUBLISHING үед идэвхгүй товч
- [x] openapi: recruitment `status` enum = `CREATED, PUBLISHING, PUBLISHED, CLOSED, SUSPENDED`.
- [x] Staging bundle: хоёр товч `status !== "CLOSED"` үед үргэлж идэвхтэй; badge-д "PUBLISHING" англиар; polling байхгүй.
- [x] Шилжилт: 30с ажиглалтад `PUBLISHING` мөр байгаагүй; асинхрон гэдгийг `SUSPENDED` тайлбараас дүгнэв.
- [x] Засвар: label "Нийтэлж байна"; урих = `PUBLISHING|PUBLISHED`, хаах = `PUBLISHING|PUBLISHED|SUSPENDED`; идэвхгүй үед статусын шалтгаан; `PUBLISHING` үед 5с polling (≤10 мин); жагсаалт ба нүүр хуудасны badge.

## 3. Бодит endpoint
- [x] a. Урих modal: имэйл/нэрийн validation (5–50, 2–20), search-by-email, dueDate, нэг имэйл, pending guard; мэдэгдэхгүй 4xx code-д серверийн `detail`.
- [x] b. "Уригдсан талентууд": `GET list/{rid}` бодит өгөгдөл, төлөв badge Монгол, хуудаслалт, хоосон төлөв, "Дахин урих" (EXPIRED) / "Үр дүн".
- [x] c. Үр дүнгийн хуудас: бодит өгөгдөл, HTML тайлан `sandbox=""` iframe, явцын хяналт, од/тэмдэглэлийн GET; тайлан татахад `Content-Type` шалгалт нэмэв.
- [x] d. "Дэлгэрэнгүй" drawer, нэр солих, устгах түр үнэлгээн дээр бодитоор; хаах товч `CREATED` үед идэвхгүй (бодит хаалт → MANUAL-QA §5).

## 4. Swagger
- [x] `/v3/api-docs` (нэвтрэлтгүй GET) → scratchpad; schema (required, maxLength, enum) уншив. Authorize/Execute хийгээгүй. Repo-д commit хийгээгүй (DECISIONS).

## 5. Баталгаа (localhost:3000, хэрэглэгчийн session; screenshot хадгалаагүй)
- [x] (a) `28696adf…` (PUBLISHED): badge "Идэвхтэй", хоёр товч идэвхтэй. `9547a97a…` (CREATED): badge "Үүссэн", хоёр товч идэвхгүй, title "Талентийн үнэлгээг нийтэлсний дараа боломжтой". `PUBLISHING`-ийг зөвхөн browser дотор хариуг өөрчилж дуурайлгав: badge "Нийтэлж байна", хоёр товч идэвхтэй, detail GET 06:16:49/54/59 (5с); дуурайлгалыг зогсоомогц дараагийн хариу `CREATED` → badge "Үүссэн", polling зогссон. Жагсаалтад: `PUBLISHING` мөр "Нийтэлж байна" + "Урих", `SUSPENDED` мөр "Саатсан" + "Үр дүн", жагсаалтын polling 5с.
- [ ] (b) Урилга илгээх → шинэ мөр: TEST_EMAIL байхгүй тул хийгээгүй (MANUAL-QA §2). Modal-ын validation: "Овог 2-20 тэмдэгт байна", "Имэйл хаяг буруу байна!", "Имэйл хаяг 50 тэмдэгтээс ихгүй байна" toast, латин үсэг нэрийн талбарт орохгүй; `maxLength` 50/20/20; invite хүсэлт 0.
- [x] (c) Өөр үнэлгээний дууссан урилга (зөвхөн унших): хүснэгт 3 мөр ("Дууссан" од 5, 2× "Хугацаа дууссан" + "Дахин урих"); үр дүнгийн хуудас тест 1, нэмэлт асуулт 1, явцын хяналт; "Дэлгэрэнгүй" → iframe `sandbox=""`, srcdoc ≈33KB; татах endpoint 200 `application/pdf` attachment, `%PDF`; `rate` GET, `notes` GET 1.
- [x] (d) Түр үнэлгээ: үүсгэх 200 → wizard; dashboard "Дэлгэрэнгүй" drawer бодит өгөгдөлтэй; нэр солих 200 + toast + жагсаалт шинэчлэгдсэн; устгах confirm → 200, `GET` 404, жагсаалтад `RA-TEST` 0, нийт 74 (эхнийхтэй ижил).
