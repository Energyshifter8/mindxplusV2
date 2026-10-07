# Талентийн үнэлгээ — гараар шалгах жагсаалт (MANUAL-QA)

Автомат шалгалтаар (tsc, eslint, biome, `pnpm test`, `next build`, DRY-RUN-тэй browser
шалгалт) хамрагдаагүй зүйлс. Бичих хүсэлтийг **зөвхөн та** идэвхжүүлнэ; Claude
`NEXT_PUBLIC_RA_ALLOW_WRITES`-ыг хэзээ ч тавиагүй.

## 0. Бэлтгэл

- [ ] Dev server-ийг нэг удаа дахин асаах (quill@2.0.3 нэмсний дараа HMR-ийн хуучин module
      алдаа гарч болно — DECISIONS.md).
- [ ] Staging (`app-staging.mindxplus.com`) болон локал (`localhost:3000`) хоёуланд нэг
      account-аар нэвтэрсэн байх.
- [ ] Туршилтын тусдаа талентийн үнэлгээ ба **өөрийн** имэйл (урилга жинхэнэ имэйл илгээнэ).

## 1. Live parity — зөвхөн унших (flag тавихгүй)

Staging ба локалыг зэрэгцүүлж 1440 / 1024 / 390 өргөнд харьцуулна (Claude-ийн орчинд
цонхны resize ажиллаагүй — DECISIONS.md "Responsive шалгалтын хязгаар").

| Дэлгэц | Staging | Локал |
|---|---|---|
| Жагсаалт | `/role-assessment` | `/role-assessment` |
| Wizard (PUBLISHED → унших горим) | `/role-assessment/{id}` | `/role-assessment/{id}` |
| Preview | `/role-assessment/{id}/preview` | ижил |
| Dashboard | `/role-assessment/{id}/dashboard` | ижил |
| Үр дүн | `/role-assessment/{id}/dashboard/{invitationId}` | ижил |
| Урьсан талентууд | `/invited-talents`, `/invited-talents/{talentId}` | ижил |

- [ ] DevTools Network-ээр GET-ийн дараалал, query (page/size/q/marked) staging-тэй ижил.
- [ ] Үр дүнгийн хуудсанд staging-ийн **chunk `6209`, `6495`**-ийн нэрийг Network-оос авч
      хадгалах (module 36209: тестийн accordion — gauge, тайлбар, "Ярилцлагад анхаарч болох
      зүйлс", "Ажил олгогчид өгөх зөвлөмж"). Одоогийн локал хувилбар API-ийн
      `subContents`-ийг харуулдаг (mismatches.md M24).
- [ ] Урьсан талентын картын утас/имэйл/огноо/үзэх icon staging-тэй ижил эсэх (U44).
- [ ] Хуучин замууд шилжинэ: `/dashboard/recruitments?status=PUBLISHED` →
      `/role-assessment?status=PUBLISHED`, `/dashboard/talents/5` → `/invited-talents/5`.

## 2. Бичих урсгал — `NEXT_PUBLIC_RA_ALLOW_WRITES=1`

`.env.local`-д **өөрөө** `NEXT_PUBLIC_RA_ALLOW_WRITES=1` бичиж dev server-ийг дахин асаана.
DRY-RUN banner алга болсныг шалгана.

- [ ] **Үүсгэх:** нэр (≤100) → wizard руу бодит id-тай шилжинэ; жагсаалт, статистик шинэчлэгдэнэ.
- [ ] **Алхам 1:** update-information (хариу `RestResponseVoid`, U34); лого upload (PNG/JPEG
      ≤200KB) / remove; `ra_draft_{id}` амжилттай хадгалсны дараа устана.
- [ ] **Алхам 2:** set-tests body = raw `string[]`; "Санал болгох" — recommend-ийн бодит хариу
      (`HiringTestPublicDTO[]` эсвэл `{tests}`, U35); 4-өөс илүү тест сонгох хязгаар.
- [ ] **Алхам 3:** set-questions `int[]`; 3-аас илүү асуулт.
- [ ] **Нийтлэх:** баталгаажуулах dialog → `{str:id}` → амжилтын modal → статус PUBLISHED,
      wizard унших горимд.
- [ ] **Урих:** имэйл blur → search-by-email (олдсон/олдоогүй хариу, U37); овог/нэр
      кирилл шалгалт; серверийн талбарын алдаа (`ProblemDetail.errors`) талбар доор;
      dueDate; амжилтын toast; урилга dashboard-д гарна. Алдааны code-ууд (`plan_expired`,
      хязгаар дууссан г.м.) Монгол мессежтэй эсэх (`lib/api-errors.ts`).
- [ ] **Дахин урих (EXPIRED):** `/{invitationId}/extend` `{value: dueDate}` → toast, төлөв.
- [ ] **Үр дүн:** од үнэлгээ (1–5) → дундаж/тоо шинэчлэгдэнэ; тэмдэглэл (≤500) → "Бусад
      тэмдэглэл" нээгдэж шинэ тэмдэглэл харагдана.
- [ ] **Bookmark:** картын toggle → "Хадгалсан" шүүлтүүрт гарах/алга болох; дэлгэрэнгүйн icon.
- [ ] **Нэр солих / хаах / устгах:** жагсаалтын kebab ба dashboard-ын "Талент үнэлгээ хаах"
      (confirm) → статус, жагсаалт шинэчлэгдэнэ.
- [ ] Дууссаны дараа `NEXT_PUBLIC_RA_ALLOW_WRITES`-ыг хоосолж дахин асаах → banner буцаж гарна.

## 3. Бусад

- [ ] **Тайлан татах** (GET, бичих биш): PDF хадгалагдана, файлын нэр (U25, U26).
- [ ] **`plan_expired`:** багц дууссан account-аар dashboard/үр дүнг нээх → "Багцын хугацаа
      дууссан" modal. "Багцтай танилцах" → `/membership` (энэ аппад хуудас байхгүй, M23).
- [ ] Keyboard: Tab-аар бүх товч/линк/checkbox, Escape-ээр modal/drawer хаагдана, focus ring.
- [ ] Screen reader-ээр (сонголт) wizard-ын алхам, асуултын checkbox, одны товч.
