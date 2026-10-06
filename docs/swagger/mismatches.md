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
| E6 | `GET /customer/hiring-invitations/latest-completed` (параметргүй) | ✅ `limit` анхдагч 5, **min 5**, max 10. `InvitationProjection` (`ratingPoints:int32`) | Локал `limit=5` илгээдэг байсан (утга ижил, параметр илүүдэл) | Параметргүй болгосон |
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
