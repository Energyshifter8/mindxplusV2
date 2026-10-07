# Role assessment — батлагдаагүй бүтэц

Кодонд `// bundle-derived, unverified` гэж тэмдэглэсэн, эсвэл бодит хүсэлтээр бүрэн
батлагдаагүй зүйлс. Эх сурвалж: 📦 = staging bundle-ээс (тайлан), ❓ = таамаг /
ажиглалт хангалтгүй. Төлөв: ✅ = staging дээр GET-ээр батлагдсан
(`docs/role-assessment/verification.md`), ⏳ = нээлттэй.

> Алхам 8-д замууд шилжсэн: `app/dashboard/recruitments/*` → `app/role-assessment/*`,
> `app/dashboard/talents/*` → `app/invited-talents/*` (хүснэгтийн хуучин замууд түүхэн).
> Гараар шалгах дараалал: `MANUAL-QA.md`.

| # | Фаз | Төлөв | Хаана | Юу | Эх сурвалж | Батлах арга / үр дүн |
|---|---|---|---|---|---|---|
| U1 | 1 | 🟡 | `lib/api.ts` `createRecruitment` | `POST /customer/recruitments/new`, body `{str}`, хариу нь raw id string уу, `{id}` уу (хоёуланг зохицуулсан) | 📦 тайлан §2d, #25 | **Swagger ✅**: body `StrDTO {str*}` → `200 string`. Бодит дуудлагаар шалгаагүй (ноорог үүснэ) |
| U2 | 1 | ⏳ | `lib/api-errors.ts` `plan_expired` | `plan_expired` code бодитоор ирэх эсэх, HTTP status | 📦 тайлан §2c | Swagger-т алдааны хариу/code огт тодорхойлогдоогүй (зөвхөн 200) — багц дууссан account хэрэгтэй |
| U3 | 1 | ✅ | `lib/api-errors.ts` `ProblemDetail.errors` | Validation `errors[]` | — | A2: `[{field, value}]`, `value` = Монгол мессеж, code `VALIDATION_EXCEPTION` |
| U4 | 1 | ✅ | `lib/api.ts` `UserRef.id` | `createdBy/publishedBy/closedBy/invitedBy.id` төрөл | — | A3, A4: string; **swagger** `User.id`/`UserNameView.id: string` |
| U5 | 1 | ✅ | `lib/api.ts` `CompletedInvitation` (#24) | Nullable талбарууд | — | A5: `phoneNumber`, `ratingPoints` nullable; `createdBy` string. `limit` ≤ 10 (11 → 400) |
| U6 | 1 | ✅ | `app/dashboard/talents/[id]/page.tsx` | #23-д `completedAt` байхгүй ✅. Staging-ийн "Бөглөсөн" багана юунаас утга авдаг нь тодорхойгүй ("—" харуулна) | ❓ | **Swagger**: `InvitationDTO.completedAt` бий (null үед ирэхгүй) → "Бөглөсөн" = `completedAt` |
| U7 | 1 | ✅ | `app/api/[...path]/route.ts` | Proxy `Accept-Language: mn-MN` | — | A1: 404 `detail` Монголоор ирж байна |
| U8 | 1 | ⏳ | `lib/constants/roleAssessment.ts` | **Label санал:** `PENDING "Уригдсан"`, `STARTED "Эхэлсэн"`, `COMPLETED "Дууссан"`, `EXPIRED "Хугацаа дууссан"`; `PUBLISHED "Идэвхтэй"` (өмнө "Нийтэлсэн") | staging UI (тайлан §2c) | Таны баталгаажуулалт |
| U9 | 2 | ⏳ | `app/dashboard/recruitments/page.tsx` | Үлдэгдэл ≥ 10000 бол "Хязгааргүй". API "хязгааргүй"-г яаж илэрхийлдэг нь тодорхойгүй (staging-д 100408 ирдэг) | 📦 тайлан §2a | Swagger: `invitationBalance: int32` — "хязгааргүй" тусгай утгагүй. Staging home bundle-д ч ≥ 10000 → "Хязгааргүй" 📦 |
| U10 | 2 | 🟡 | Хайлт, үүсгэх modal `maxLength=100` | Серверийн талын урт хязгаар | 📦 | **Swagger**: жагсаалтын `name` maxLength=100 ✅. Үүсгэх `StrDTO.str` зөвхөн minLength=1 (дээд хязгааргүй) — modal-ын 100 нь staging UI 📦 |
| U11 | 2 | ✅ | `lib/pagination.ts` `[10, 20, 50]` | `size` 50 хүртэл ажиллах эсэх | — | #1, #14, #21-д `size=50` → 200 |
| U12 | 2 | ✅ | Жагсаалтын эрэмбэ, хайлт | `createdAt` буурах; `name` хайлт | — | A6, V8: 63 мөр бүгд буурах; contains + case-insensitive |
| U13 | 2 | ✅ | `lib/api.ts` `RecruitmentDetail` | `published*/closed*` байхгүй үед | — | A3: null биш, огт ирэхгүй (`?:` төрөл хоёуланг зохицуулна) |
| U14 | 2 | ⏳ | Drawer "Явц" | CREATED үед "--/--" | 📦 | Staging-тэй харьцуулах |
| U15 | 3 | ✅ | `RecruitmentInvitation.ratingPoints` | #14-д `ratingPoints` | — | A4, V17: `rated=true` үед number, бусад үед огт ирэхгүй |
| U16 | 3 | ⏳ | Dashboard "N мин" chip | Нэмэлт асуултын хугацаа нийлбэрт орох эсэх (одоо зөвхөн тест) | ❓ | Staging dashboard-тай харьцуулах |
| U17 | 3 | ✅ | Dashboard "Үр дүн" товч | Идэвхжих нөхцөл | — | Staging bundle: `"COMPLETED"===e\|\|"STARTED"===e`; нэр дээр дарахад статусаас үл хамааран үр дүн рүү |
| U18 | 3 | ✅ | `TestDetailDrawer` | Контент script/зураг/гадаад CSS-ээс хамаардаг эсэх | — | A8: 10 тест бүгд fragment, script/img/link байхгүй; хар текст хатуу бичигдсэн → цагаан цаас (F2) |
| U19 | 3 | ✅ | Dashboard "Нэр" багана | Нэрийн дараалал | — | Staging bundle: `lastName firstName` |
| U20 | 3 | ✅ | #14 эрэмбэ, шүүлтүүр | Эрэмбэ ✅ `createdAt` буурах (A4). Status-аар шүүх параметр байгаа эсэх ⏳ | ❓ | Эрэмбэ ✅ (A4). **Swagger**: #14 query зөвхөн `page`, `size` — status шүүлтүүр байхгүй |
| U21 | 3 | ✅ | #14 side effect | `GET list/{rid}` хугацаа өнгөрсөн PENDING-ийг EXPIRED болгож хадгалдаг | — | Verification doc "Backend-ийн онцлог" |
| U22 | 4 | ✅ | `DATA_QUALITY` | "Анхаарал төвлөрөл" mapping | — | Staging bundle: ENOUGH=Сайн, SUFFICIENT=Хангалттай, POOR=Сул, **ANY=Муу**, бусад=Тодорхойгүй (тайлангийн таамаг ANY-г буруу зааж байсан) |
| U23 | 4 | ✅ | `PROCTORING_EVENTS` | Явцын хяналтын мөрүүд | — | Staging bundle: 5 мөр (CUT харуулдаггүй), хугацаа `seconds>0` үед "Xмин Yсек", `TAB_SWITCH` fallback |
| U24 | 4 | ✅ | `EventSummaryItem.seconds` | Staging код `seconds`-ийг уншдаг ч ажигласан хариунд ирээгүй (хугацаа харагдахгүй) | ❓ | **Swagger**: `BehaviorEventSummary.seconds: int32` бодит талбар; ажигласан хариунд утгагүй үед ирээгүй |
| U25 | 4 | ✅ | #20 татах | Төрөл, header | — | 200 `application/pdf` (`%PDF-`, ~32KB), `Content-Disposition: attachment; filename="….pdf"` ASCII. **Тест бүрт ижил файлын нэр** ирдэг (browser "(1)" нэмнэ) |
| U26 | 4 | ⏳ | "Тайлан татах" товч | Browser-ийн бодит хадгалах үйлдэл (`saveBlob`) | — | Таны гараар нэг удаа дарах (файл диск рүү хадгалагдана) |
| U27 | 4 | ⏳ | Тайлбар/зөвлөмж текст, gauge | Хэрэгжүүлээгүй — staging module 36209 (chunk 6209/6495) татагдаагүй; API `subContents` + HTML тайлан | 📦 | U41, MANUAL-QA §1 |
| U28 | 4 | ✅ | #15 `customQuestionAnswers` | React key | — | `responseId`, `testAnswerId` нь бүх хариултад ижил → `questionId` key (F7) |
| U29 | 4 | ✅ | #15 STARTED/EXPIRED | `assessment` | — | `null` → "дуусгаагүй байна" мессеж |
| U30 | 4 | ✅ | #16 / prev-next | Дараалал | — | `prevId/nextId` гинжин дараалал = #16-ийн дараалал (10 урилга) |
| U31 | swagger | ⏳ | `RecruitmentTest.pageSize`, `RoleAssessmentTestDetail.pageSize` | Staging дээр ✅ ажиглагдсан ч swagger `HiringTestPublicDTO`-д байхгүй (swagger-т `content`, `roleLevels` нэмэлт) | swagger ↔ staging | Optional болгосон; swagger server (192.168.2.15) staging-ээс өөр хувилбар байж магадгүй |
| U32 | swagger | ⏳ | `POST /user/refresh`, `POST /user/logout` | Swagger-т байхгүй (оронд нь `GET /user/auth/refresh`). Staging апп хоёуланг ашигладаг 📦 | swagger ↔ staging | Staging-ийг дагав (docs/swagger/mismatches.md E7, E8) |
| U33 | endpoints | ⏳ | `renameRecruitment`, `closeRecruitment`, `deleteRecruitment` | `POST …/{id}/rename`, `/close`, `/delete` `{str}` — хариу body (swagger: 200, schema-гүй) | 📦 + swagger | Хүсэлтийн хэлбэр mock axios adapter-аар ✅ (scratchpad unit test, repo-д ороогүй). Staging руу POST илгээгээгүй |
| U34 | endpoints | ⏳ | `updateRecruitmentInformation`, `setRecruitmentTests`, `setRecruitmentQuestions`, `publishRecruitment` | Хариу `RestResponseVoid` эсэх; `maxTestCount`/`maxQuestionCount`-оос (staging 4/3 ✅) илүүг сервер татгалзах эсэх; publish-ийн урьдчилсан нөхцөл (мэдээлэл + ≥1 тест) | 📦 + swagger | Body ✅ mock. Хязгаарыг client шалгахгүй — дуудагч `fetchRecruitmentSettings()`-оор шалгана |
| U35 | endpoints | ⏳ | `recommendTests` | Хариу swagger-ээр `HiringTestPublicDTO[]`; staging апп `{tests, answerIds}` / `{content}`-ийг ч хүлээн авдаг | 📦 ↔ swagger | Гурван хэлбэрийг массив болгож зохицуулсан |
| U36 | endpoints | ⏳ | `inviteTalent` | Хариу `string` (урилгын id гэж таамаглав); `phoneNumber: null`-ийг сервер хүлээн авах эсэх (staging апп `null` илгээдэг 📦) | 📦 + swagger | Body ✅ mock |
| U37 | endpoints | ⏳ | `searchTalentByEmail` | Олдоогүй үед 404 эсвэл `data: null` эсэх; `mobileNo` талбар (swagger `TalentEntity`-д байхгүй, bundle уншдаг) | 📦 ↔ swagger | Хоёр тохиолдолд `null` буцаана ✅ mock |
| U38 | endpoints | ⏳ | `uploadDesignLogo`, `removeDesignLogo` (`updateDesign`/themes-ийг staging дууддаггүй тул хассан) | Үнэлгээнд update-ийг staging апп дууддаггүй (зөвхөн survey); upload-ийн хариу `string` (URL?) | swagger / 📦 | GET `designs/RECRUITMENT/{id}` ✅. Multipart proxy засвар: байт бүрэн дамжина ✅ (mock fetch unit test; хуучин proxy 0 байт илгээдэг байсан) |
| U39 | endpoints | ⏳ | `extendInvitation`, `rateInvitation`, `addInvitationNote`, `toggleTalentBookmark` | Хариу (extend → `Talent`, notes → `InvitationNoteView`, rate → `RestResponseVoid`, bookmark → schema-гүй) | swagger | Body ✅ mock; rate 0..5 бүхэл, bookmark бүхэл id-г client шалгана |
| U40 | endpoints | ✅ | `GET /customer/recruitments/status/{id}` | Swagger-т бий, staging апп дууддаггүй | swagger | 200 ✅; UI-д хэрэггүй тул функцийг хассан (алхам 9) |
| U41 | 5 | ⏳ | `components/role-assessment/result/ResultContent.tsx` | Тестийн accordion-ы бие (module 36209): gauge-ийн дүүргэлт, тайлбар, "Ярилцлагад анхаарч болох зүйлс", "Ажил олгогчид өгөх зөвлөмж"-ийн эх сурвалж (статик контент уу, API уу) | 📦 (chunk татагдаагүй) | Staging-д нэвтэрч chunk-ийг Network-оос авах (MANUAL-QA §1) |
| U42 | 5 | ⏳ | `CustomQuestionAnswer.questionDescription` | Staging bundle үзүүлдэг; API хариунд ажиглагдаагүй | 📦 | Optional; бодит хариугаар шалгах |
| U43 | 5 | ✅ | Dashboard тестийн "Дэлгэрэнгүй" | `RecruitmentTest.id` нь каталогийн тестийн id эсэх | — | `GET /customer/role-assessments/tests/{RecruitmentTest.id}` → 200, HTML контент ✅ (локал browser) |
| U44 | 6 | ⏳ | `components/role-assessment/talents/TalentCard.tsx` | Утас/имэйл/огноо/үзэх icon (module 66212, 66462, 32423, 92598) | ❓ lucide гэж таамаглав | Staging-тэй харьцуулах (MANUAL-QA §1) |
| U45 | 6 | ⏳ | Rating tooltip "Дундаж оноо" | Radix tooltip `light` variant → base-ui Tooltip, staging-ийн class-аар | 📦 | Харагдацыг харьцуулах |
| U46 | бүгд | ⏳ | Responsive 1440/1024/390 | Claude-ийн орчинд цонхны resize ажиллаагүй; `main`-ийг 752/390 болгож (desktop media query-тэй) шалгав | — | Бодит viewport-оор (MANUAL-QA §1) |
| U47 | 5 | ⏳ | `plan_expired` → `/membership` | Staging-ийн зам; энэ аппад хуудас байхгүй | 📦 | Membership модуль хэрэгжих үед |
