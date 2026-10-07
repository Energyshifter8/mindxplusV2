# Swagger ↔ staging апп / локал код — зөрүү

- **Swagger:** `http://192.168.2.15:30102/v3/api-docs` (springdoc, OpenAPI 3.1, 159 path, 135 schema), татсан огноо 2026-10-06 → `docs/swagger/openapi.json`. Уншигч: `python3 docs/swagger/tools/describe.py "GET /path" …`.
- **Дүрэм:** Staging апп-ын ажигласан path / method / body **ҮНЭН**. Swagger-ийг зөвхөн schema, enum, required, query-ийн тодорхойлолтод ашиглана.

## Ерөнхий

| Сэдэв | Swagger | Staging (ажигласан ✅ / bundle 📦) | Дүгнэлт |
|---|---|---|---|
| `/api` угтвар | Байхгүй (159 path бүгд `/customer`, `/user`, `/admin`…) | Байхгүй ✅ | Ижил |
| Server | `http://192.168.2.15:30102` (dev) | `https://service-staging.mindxplus.com` | Өөр орчин — **хувилбарын зөрүү байж болно** (доорх `pageSize`, `/user/refresh`, `/user/logout`) |
| Security | `securitySchemes` тодорхойлогдоогүй | `Authorization: Bearer` ✅ | Swagger дутуу |
| Алдааны хариу | Зөвхөн `200` (163 operation); ProblemDetail schema байхгүй | RFC 7807 ProblemDetail ✅ (`type,title,status,detail,instance,code`, validation үед `errors[{field,value}]`) | Swagger дутуу — алдааны contract ажиглалтаас |
| required / nullable | Ихэнх response schema-д `required` байхгүй, `nullable` огт байхгүй | Хоосон утга: list-д `null` (`closedAt`), detail/#14-д талбар огт ирэхгүй ✅ | Төрөлд талбарууд optional; ажигласан `null`-ыг `| null`-ээр нэмсэн |

## `/home` + shell (энэ ажлын хүрээ)

| # | Endpoint (staging) | Swagger | Зөрүү | Шийдвэр |
|---|---|---|---|---|
| E1 | `GET /customer/profile` | ✅ `UserInfo {id:int64, email, firstName, lastName, onboarded, role: OWNER\|MANAGER\|VIEWER, active, company{id, name, regnum}}` | Staging хариунд нэмэлт `createdAt, customerId, inactiveAt` ✅ (Swagger-т байхгүй) | Swagger төрөл + ажигласан нэмэлт талбар (optional) |
| E2 | `GET /customer/surveys?status=&page=0&size=6&name=` | ✅ query: `status` (string, enum-гүй), `page` (0), `size` (анхдагч **25**), `name` (maxLength 100). `MySurveyView.status`: `CREATED\|PUBLISHING\|PUBLISHED\|CLOSED\|SUSPENDED` | Staging хоосон `status=`, `name=`-ийг ч илгээдэг | Staging-ийн query-г яг дагав |
| E3 | `GET /customer/surveys-home/statistics` | ✅ `SurveyHomeStatistics {totalPublishedSurveyCount:int64, totalRespondentCount:int64, surveyBalance:int32}` | — | Ижил |
| E4 | `GET /customer/recruitments/?page=0&size=6` | ✅ `size` анхдагч **9**, `status` string, `name` maxLength 100. `RecruitmentListView.status` 5 утгатай | Бидний enum-д `PUBLISHING`, `SUSPENDED` байгаагүй | Enum-д нэмсэн (label staging UI-аас) |
| E5 | `GET /customer/recruitments/statistics` | ✅ `HiringHomeStatistics` | — | Ижил |
| E6 | `GET /customer/hiring-invitations/latest-completed` (параметргүй) | ✅ `limit` анхдагч 5, **min 5**, max 10. `InvitationProjection` (`ratingPoints:int32`) | Локал `limit=5` илгээдэг (staging параметргүй; хариу ижил ✅) | `limit=5` хэвээр (swagger-ийн хүрээнд), 5..10-д тааруулдаг болгосон |
| E7 | `POST /user/refresh` `{}` (withCredentials) 📦 | ✗ **Байхгүй**. Оронд нь `GET /user/auth/refresh` (header `Authorization` required) → `TokenDTO {token}` | Path/method өөр | **Staging-ийг дагав** (`POST /user/refresh`) — локал proxy-оор ажиллаж байгаа ✅ |
| E8 | `POST /user/logout` 📦 | ✗ **Байхгүй** | Swagger-т бүртгэгдээгүй | Staging-ийг дагав; бодитоор ажиллуулж шалгаагүй (session дуусна) |
| — | `GET /customer/account` (localStorage `accountInfo` байхгүй үед) 📦 | ✅ `AccountDTO {planType: FREE\|BASIC\|STANDARD\|PREMIUM\|CUSTOM, employeeLimit, planName, months: QUARTER\|YEAR, paidAmount, startDate, dueDate, dataAccess, hasTrialSurvey, expired}` | — | Sidebar-ын багцын анхааруулгад |

## Role assessment (өмнөх фазууд)

| # | Endpoint | Swagger | Зөрүү | Шийдвэр |
|---|---|---|---|---|
| #25 | `POST /customer/recruitments/new` | ✅ body `StrDTO {str*: minLength 1}` → `200 string` | — | **U1 батлагдсан** (request/response хэлбэр). Бодит дуудлагаар шалгаагүй хэвээр |
| #3 | `GET /customer/recruitments/{id}` | `RecruitmentDetail`; `tests: HiringTestPublicDTO[]` (`content`, `roleLevels: ENTRY\|SENIOR\|MANAGER[]`, `color: CLAY\|TEAL\|MIDNIGHT\|SLATE\|VELVET\|WHITE\|GREEN\|YELLOW`); `customQuestions: HiringQuestionDTO` (+`category`) | Staging дээр тестэд `pageSize` ✅ ажиглагдсан, Swagger-т **байхгүй**; color 8 утга (бид 2) | `pageSize` optional; color enum 8 утга |
| #10 | `GET /customer/role-assessments/tests/{id}` | `HiringTestPublicDTO` (`pageSize` байхгүй) | Мөн адил | Мөн адил |
| #14 | `GET /customer/hiring-invitations/list/{recruitmentId}` | ✅ query зөвхөн `page`, `size` (10) — **status шүүлтүүр байхгүй**; `CustomerInvitationView` (+`recruitmentName`) | — | U20 батлагдсан |
| #16 | `GET …/names/{recruitmentId}` | `Talent[]` (нэмэлт талбартай) | Ажигласан 4 талбар нь дэд олонлог | Ижил |
| #21 | `GET …/talents` | ✅ `q` (maxLength 100), `marked`, `page`, `size` (10) | — | Ижил |
| #23 | `GET …/talents/{id}/invitations` | `InvitationDTO` **`completedAt` байгаа**, `ratingPoints: double` | Ажигласан мөрөнд `completedAt` огт ирээгүй (null-ыг хасдаг) | U6: "Бөглөсөн" = `completedAt` (байвал) |
| #15 | `GET …/{recruitmentId}/{invitationId}` | `TalentResult`; `PersonalReport.assessorType` 8 утга; `SubContent.points: double`; `BehaviorEventSummary {eventType, count, seconds}` | — | U24: `seconds` бодит талбар |
| #19/#20 | `GET /customer/hiring/test-result/report/{invitationId}/{testAnswerId}[/download]` | `text/html` / `string(byte)` | Параметрийн нэр `testAnswerId` (бид `answerId` гэж нэрлэдэг — утга нь `TestResult.answerId`) | Ижил |

## Customer recruitments — endpoint давхарга (2026-10-06)

Эх сурвалж: setup хуудасны bundle (`app/(editor)/role-assessment/[id]`, 📦), swagger, staging дээр
localhost proxy-оор GET ✅. POST-уудыг staging руу илгээгээгүй (docs/role-assessment/unverified.md U33–U40).

| # | Endpoint (staging) | Swagger | Зөрүү / ажиглалт | Шийдвэр (`lib/api.ts`) |
|---|---|---|---|---|
| R1 | `GET /customer/recruitments/status/{id}` | `RecruitmentBriefView` | Staging апп дууддаггүй; 200 ✅ | `fetchRecruitmentBrief` |
| R2 | `POST /customer/recruitments/{id}/rename` `{str: name}`, `/close` `{str: id}`, `/delete` `{str: id}` 📦 | `StrDTO {str*}` → 200 schema-гүй | — | `renameRecruitment`, `closeRecruitment`, `deleteRecruitment` |
| R3 | `GET /customer/recruitment-setup/settings` | `RecruitmentSettings` | ✅ `{maxTestCount: 4, maxQuestionCount: 3}` | `fetchRecruitmentSettings` |
| R4 | `GET/POST /customer/recruitment-setup/{id}/information` / `update-information` | `RecruitmentInfo {jobTitle*, jobDescription* (min 1), companyName*, companyDescription}` | CREATED дээр `jobDescription: null` ✅ (swagger required). Staging UI `companyName`-ийг дотооддоо `request` гэж нэрлэдэг ч body-д `companyName` 📦 | Хариу `string \| null`; body-д гурван талбарыг хоосон биш, ≤100 шалгана |
| R5 | `GET …/{id}/tests` → `string[]`, `POST …/set-tests` `string[]` | ✅ | Утга нь catalog **`id`** (`testId` биш) — detail-ийн `tests[].id`-тэй тулгаж ✅ | `fetchRecruitmentTestIds`, `setRecruitmentTests` (давхардал хасна) |
| R6 | `GET …/{id}/questions` → `int64[]`, `POST …/set-questions` `int64[]` | ✅ | ✅ `customQuestions[].id`-тэй таарна | `fetchRecruitmentQuestionIds`, `setRecruitmentQuestions` |
| R7 | `POST /customer/recruitment-setup/publish` `{str: id}` 📦 | `StrDTO` → `RestResponseVoid` | — | `publishRecruitment` |
| R8 | `GET /customer/role-assessments/categories`, `question-categories` | `CategoryWithCount {id, name, count}` | `count` үргэлж **0** ✅ — тоо гэж ашиглахгүй. `id` = шүүлтүүрийн түлхүүр (`hiring_soft_skill`, `q_background`…) | `fetchTestCategories`, `fetchQuestionCategories` |
| R9 | `GET /customer/role-assessments/tests?category=` (хоосон ч илгээдэг 📦) | `HiringTestPublicDTO[]` (+`content`, `roleLevels`) | Жагсаалтад `content`, `roleLevels` **ирдэггүй**, `pageSize` ирдэг ✅. Хариуны `category` нь label (`name`), query-ийнх нь `id` | `fetchCatalogTests` → `RecruitmentTest[]` |
| R10 | `GET /customer/role-assessments/questions?category=` | `HiringQuestionDTO[]` (+`category`) | `category` **ирдэггүй** ✅ | `fetchCatalogQuestions` → `RecruitmentCustomQuestion[]` |
| R11 | `POST /customer/role-assessments/recommend` — body 3 хариултын утга (`entry\|senior\|manager`, `execution\|leadership\|strategy`, `self-discipline\|teamwork\|strategic`) 📦 | `string[]` → `HiringTestPublicDTO[]` | Bundle `{tests, answerIds}` / `{content}`-ийг ч уншдаг | `recommendTests`; асуулт/утга `RECOMMEND_QUESTIONS` |
| R12 | `POST /customer/hiring-invitations/invite` `{recruitmentId, email, firstName, lastName, phoneNumber \| null, dueDate: YYYY-MM-DD}` 📦 | `Talent` (нэр 2–20 `\p{L}`, email 5–50) → `string` | — | `inviteTalent` (trim, хоосон утас → `null`, `Date` → локал `YYYY-MM-DD`) |
| R13 | `POST …/search-by-email` `{value}` 📦 | `Email` → `RestResponseTalentEntity` | Bundle `data`-г задалж, 404/нэргүй бол `null`; `mobileNo` (swagger-т байхгүй) | `searchTalentByEmail` → `TalentEntity \| null` |
| R14 | `POST …/{invitationId}/extend` `{value: date}`, `/rate` `{points}`, `/notes/add` `{str}`, `talents/bookmark` `{id}` 📦 | `DateDTO` → `Talent`; `Rating {points* 0..5}`; `StrDTO` → `InvitationNoteView`; `IdDTO` | — | `extendInvitation`, `rateInvitation`, `addInvitationNote`, `toggleTalentBookmark` |
| R15 | `GET …/talents?…&marked=true` (зөвхөн `true` үед 📦) | ✅ `marked: boolean` | Шүүлт ажилладаг ✅ (29 → 1) | `getHiringInvitations({marked})` |
| R16 | `/customer/designs/RECRUITMENT/{id}` (+ `/upload-logo` multipart `logo`, `/remove-logo` `{id}`) 📦 | `{ownerType}` нь энгийн string; `DesignDTO.designOwnerType` enum | Үнэлгээнд **`RECRUITMENT`** (том үсэг), survey-д `survey` 📦. GET 200 ✅. `logoUrl` лого байхгүй үед ирэхгүй ✅. Хариунд `imagePosition`, update body-д `logoPosition` | `fetchDesign`, `uploadDesignLogo`, `removeDesignLogo` (`id` = `DesignDTO.id`) |
| R17 | `POST /customer/designs/{ownerType}/{ownerId}/update` | `UpdateDesign {themeType*, logoPosition*, showAppLogo*}` → `DesignDTO` | Staging апп үнэлгээнд дууддаггүй (survey-д `designs/survey/{id}/update`) | `updateDesign` — U38 |
| R18 | `GET /customer/designs/themes` | enum массив | ✅ `LIGHT, YALE, DARK, MIRAGE, PURPLE` | `fetchDesignThemes` |
| P1 | Proxy multipart | — | `request.text()` binary-г эвддэг байсан (mock-оор 0 байт ✅) | `arrayBuffer()` + boundary-тай Content-Type дамжуулна |

## Бусад (survey, auth) — дараагийн хуудсуудад

| Endpoint (локал код) | Swagger | Зөрүү |
|---|---|---|
| `POST /user/register` (AuthForm бүртгүүлэх) | ✗ Байхгүй → `POST /user/signup` `UserDTO {email*, firstName*, lastName*, companyName*, subscribe*, password, confirmPassword}` | **Локал бүртгүүлэх урсгал буруу path/body** |
| `POST /user/login` | ✅ `LogInDTO {email*, password*}` → `TokenDTO` | Ижил |
| `GET /customer/survey-analysis/insight/{id}/primary-question-summaries` | `size` анхдагч 10, `quality` анхдагч `all` | Локал `size=50` илгээдэг |
| `POST /customer/questions/SURVEY/{id}/add-question`, `delete-question` | `/customer/questions/{ownerType}/{ownerId}/…` | Ижил (ownerType=SURVEY) |
| `POST /customer/surveys/{id}/publish` | `DateDTO {value: date}` | Ижил |
| `POST /customer/surveys/{id}/set-passcode` | `PasscodeDTO {value*: ^[0-9]{6}$}` | Ижил |
| `POST /customer/surveys/{id}/set-device-check`, `/customer/surveys/delete` | `StrDTO` | Ижил |

## Swagger-ийн enum ба бидний enum

| Enum | Swagger | Өмнө (локал) | Одоо | Label (staging UI 📦) |
|---|---|---|---|---|
| Recruitment/Survey status | `CREATED, PUBLISHING, PUBLISHED, CLOSED, SUSPENDED` | 3 утга | 5 утга | Үүссэн · `PUBLISHING` (staging орчуулаагүй, түүхий текст) · Идэвхтэй · Хаагдсан · Саатсан |
| Invitation status | `PENDING, EXPIRED, STARTED, COMPLETED` | 4 | 4 | Ижил |
| Test color | `CLAY, TEAL, MIDNIGHT, SLATE, VELVET, WHITE, GREEN, YELLOW` | GREEN, YELLOW | 8 | — |
| Role | `OWNER, MANAGER, VIEWER` | — | Нэмсэн | — |
| Plan type / months | `FREE…CUSTOM` / `QUARTER, YEAR` | — | Нэмсэн | — |
| assessorType | 8 утга | string | Нэмсэн | — |
| dataQuality | `ANY_QUALITY, POOR_QUALITY, SUFFICIENT_QUALITY, ENOUGH_QUALITY` | 4 | 4 | Ижил |
| eventType | 6 утга | 6 | 6 | Ижил |
