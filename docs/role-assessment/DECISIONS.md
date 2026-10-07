# Талентийн үнэлгээ — шийдвэрийн бүртгэл

Зогсолтгүй горимд өөрөө гаргасан шийдвэр (юу — яагаад). Хянах зориулалттай.

- **Git:** docs-ийн commit санамсаргүй `main` дээр (`69500efc`) хийгдсэн → `feature/role-assessment` руу `git switch` + `cherry-pick` (`e4fb1f44`). Merge/reset хийгээгүй — дүрмээр хориотой; хоёр branch-ийн агуулга ижил тул дараа merge хийхэд зөрчилгүй.
- **Git:** commit бүрийг branch-ийн нэр, `.env*`/`.next`/`node_modules`, token хэв маягийг шалгадаг script-ээр хийнэ — хэрэглэгч зэрэг branch сольж болдог (ажиглагдсан).
- **Staging session:** 11:40-д staging-ийн token устсан (`/login` руу шилждэг). Нууц үг оруулахгүй тул staging-ийг өгөгдөлтэй нь live харьцуулах боломжгүй → staging талын эх сурвалж: татсан static JS bundle (scratchpad, нэвтрэлтгүй GET), `report.md`, `screenshots/`, `docs/parity/home.md`. GET матрицын staging талыг bundle-ийн query/дарааллаар тулгана. Live parity-ийг MANUAL-QA-д шилжүүлнэ.
- **Локал session:** локал JWT 30 мин; аппын scheduler reload бүрт 9 минутаа шинээр тоолдог тул reload олонтой үед хугацаа дуусна. Аппын өөрийн `POST /user/refresh`-ийг (cookie, нууц үггүй) гараар дуудаж session-ийг сунгав — кодыг өөрчлөөгүй.
- **lib/api.ts:** HTTP цөм `lib/api/http.ts` руу (re-export), нүүр хуудсын (`getRecruitmentList`, `getLatestCompletedInvitations`) функц үлдсэн; урьсан талентуудын `{success,data}` функцууд ФАЗ 6 хүртэл түр үлдэнэ.
- **Тест `.mjs`:** `.test.ts` нь `.ts` өргөтгөлтэй импорт шаарддаг (tsconfig-д `allowImportingTsExtensions` хэрэгтэй) тул тестийг `.mjs`-ээр бичив — tsconfig/eslint өөрчлөөгүй. `MODULE_TYPELESS_PACKAGE_JSON` warning-ийг script-д `--disable-warning`-оор нуув.
- **Dry-run stub `update-information` г.м.:** хэрэглэгчийн заасан `{message:"",status:200,success:true,data:"ok"}`-ийг бүх RestResponseVoid stub-д хэрэглэв (swagger `data` Void).
- **Dry-run fake id:** UUID v4 хэлбэр, тогтмол угтвар `00000000-0000-4000-8000-` → flag-аас үл хамааран сүлжээнд гарахгүй (adapter + proxy 404).
- **`removeDesignLogo`:** dry-run дизайны stub id = 0 тул `id ≥ 0` зөвшөөрөв (бодит id > 0).
- **Manrope:** root layout-д хувьсагч (`--font-manrope`) — modal/drawer portal-д хүрэхийн тулд; бусад модулийн фонт өөрчлөгдөхгүй.
- **Давхар Toaster:** `app/layout.tsx` ба `components/providers.tsx` хоёуланд `<Toaster />` байсан тул toast бүр 2 удаа гарч байв (dry-run үүсгэхэд ажиглав). Layout-ынхыг хасав — бүх модульд нэг toast (зөвхөн давхардал арилна).
- **Жагсаалт:** tab/хайлтыг staging шиг state-д биш URL-д (`status`, `name`) хадгалав — tab солиход page=1-ийг нэг `replace`-ээр хийж staging-ийн давхар хүсэлтээс (хуучин page-тэй + page=1) зайлсхийнэ. Хайлт 350мс debounce (зөвшөөрсөн). Нэр нь `<Link>` (staging `div onClick`) — keyboard навигаци.
- **Алдааны төлөв:** staging жагсаалтын алдаанд зөвхөн toast + хоосон төлөв харуулдаг; бид toast + тусдаа алдааны төлөв ("Дахин оролдох"). Drawer-т skeleton/алдаа (staging хоосон).
- **Responsive 390:** хуучин shell-ийн sidebar (272px) жижиг дэлгэцэд нуугддаггүй тул main 118px болдог — shell-д хүрэхгүй (дүрэм). RA контентыг main=390px-ээр шалгав; статистик карт <640px дээр босоо (staging `flex`-д "Хязгааргүй" халидаг).
- **Тестийн орчин:** automation tab `visibility: hidden` тул `requestAnimationFrame` зогсдог → base-ui Menu/Select хулганы mousedown-оор нээгдэхгүй, popup-ын нээх/хаах transition эхлэл/төгсгөлдөө гацдаг (бодит хэрэглэгчид нөлөөгүй). Харилцан үйлдлийг `.click()` / keyboard-аар шалгав.
- **Create modal:** Enter-ээр илгээнэ (staging-д байхгүй). "Гарчиг оруулна уу" toast staging-тэй ижил.
- **quill@2.0.3 lockfile:** `pnpm add` нь quill-ийн 7 dependency-оос гадна peer-context metadata (`supports-color` суффикс)-ийг шинэчилсэн — хувилбар өөрчлөгдөөгүй. Нэмсний дараа dev server-т HMR stale module алдаа гарсан, шинэ navigation цэвэр → dev server-ийг дахин асаах хэрэгтэй байж болно.
- **Wizard унших горим:** CREATED-ээс бусад бүх статус (PUBLISHING/SUSPENDED/CLOSED) унших горим — staging зөвхөн PUBLISHED-ийг шалгадаг ч бусад статуст засвар серверт амжилтгүй болно.
- **Нийтлэх:** staging шууд нийтэлдэг; буцаагдахгүй үйлдэл тул баталгаажуулах dialog нэмэв (дүрэм D).
- **Сонголтын дараалал:** серверээс ирсэн id-ийн дарааллаар (staging каталогийн дараалал) — баруун самбар ба дугаарын badge тогтвортой.
- **<lg өргөн:** баруун самбар контентын доор (staging 1024-д хавчигддаг).
- **DRY-RUN wizard:** алхам бүрийн хадгалалт stub тул query cache-д `setQueryData`-аар үр дүнг тавьж алхам үргэлжилнэ; `ra_draft_{id}`-аас сэргээх нь зөвхөн DRY-RUN-д (staging wizard сэргээдэггүй). Preview нь staging шиг unload/unmount-д ноорогийг устгана.
- **Quill хоосон утга:** `<p><br></p>`-ийг `""` гэж үзнэ (staging `getText().trim()` шалгалттай тэнцүү).
- **document.title:** Next-ийн async metadata title-ийг дарж бичдэг тул `MutationObserver`-тэй hook.
- **Preview "Эхлэх":** тест/асуулт хоосон бол disabled (staging алдаатай дэлгэц рүү ордог).
- **Quill CSS:** `quill.core.css` layer-гүй тул Tailwind utility-д `!` (important) хэрэглэв.
- **"?" тусламжийн widget:** shell-ийн хэсэг тул хийгээгүй.
- **React compiler lint:** effect доторх setState-ийг React-ийн "render үед state тохируулах" загвараар сольсон (logic өөрчлөгдөөгүй, dry-run-д дахин шалгасан).
- **A11y:** асуулт = `<label>` + native checkbox (staging `div onClick`); баруун алхмууд = "stretched button" (title доторх button-ий `::after` мөрийг хамарна, "хасах" товч z-10) — button дотор button үүсэхгүй; ангиллын товчнууд `<fieldset>`+sr-only legend.
