'use strict';

const STORAGE_KEY = 'Iranian Concrete Mix Disign';
const LANG_KEY = 'Iranian Concrete Mix Disign Lang';

/* ================= i18n ================= */
let currentLang = 'fa';
try { currentLang = localStorage.getItem(LANG_KEY) || 'fa'; } catch (_) { currentLang = 'fa'; }

const translations = {
  fa: {
    appTitle: 'طرح مخلوط بتن',
    appSub: 'Iranian Concrete Mix Design',
    credit: 'گردآورنده',
    reportTitle: 'گزارش نهایی طرح مخلوط بتن',
    reportFileNamePrompt: 'نام فایل گزارش را وارد کنید:',
    reportDefaultName: 'گزارش-طرح-مخلوط-بتن',
    tabs: ['اطلاعات اولیه', 'مشخصات سنگدانه‌ها', 'سهم‌بندی سنگدانه‌ها', 'آب به سیمان', 'آب آزاد', 'مقدار سیمان', 'گزارش نهایی'],
    btnPrev: 'مرحله قبل',
    btnNext: 'مرحله بعد',
    fields: {
      strength: 'مقاومت مشخصه استوانه‌ای(MPa)', slump: 'اسلامپ (mm)', water: 'آب آزاد پایه (kg/m³)',
      wc: 'نسبت آب به سیمان', coarseShare: 'سهم حجمی شن از کل سنگدانه', air: 'هوای بتن (%)',
      sgCement: 'چگالی نسبی سیمان', sgSand: 'چگالی نسبی ماسه', waterAbsSand: 'درصد جذب آب ماسه (%)',
      sgGravel: 'چگالی نسبی شن', waterAbsGravel: 'درصد جذب آب شن (%)', sgAdmixture: 'چگالی نسبی افزودنی'
    },
    misc: {
      projectName: 'نام طرح', concreteAir: 'هوای بتن', minCementOn: 'اعمال حداقل مقدار سیمان',
      maxCementOn: 'اعمال حداکثر مقدار سیمان', minCement: 'حداقل سیمان (kg/m³)', maxCement: 'حداکثر سیمان (kg/m³)',
      wcLimitOn: 'اعمال حداکثر نسبت آب به سیمان', wcLimit: 'حداکثر نسبت آب به سیمان',
      slumpClass: 'رده اسلامپ', cementClass: 'رده مقاومتی سیمان', admixture: 'نوع افزودنی',
      admixturePct: 'نسبت افزودنی به سیمان (%)', sgAdmixture: 'چگالی افزودنی', optionalControls: 'کنترل‌های اختیاری طرح',
      aggregateCount: 'تعداد انواع سنگدانه', nmsa: 'حداکثر اندازه اسمی سنگدانه NMSA',
      aggName: 'نام سنگدانه', aggSg: 'چگالی نسبی سنگدانه', aggWaterAbs: 'درصد جذب آب سنگدانه (%)',
      aggFracture: 'درصد شکستگی (%)', sievePassing: 'درصد عبوری از الک', specs: 'مشخصات',
      targetStrengthTitle: 'تعیین مقاومت هدف طرح', targetMethod: 'روش تعیین مقاومت هدف',
      manual: 'ورود دستی', auto: 'محاسبه خودکار', workshopRank: 'رتبه کارگاه',
      rankA: 'الف', rankB: 'ب', rankC: 'ج',
      charStrength: 'مقاومت مشخصه', stdDev: 'انحراف معیار S', noStdDev: 'برای این مقاومت، مقدار انحراف معیار در جدول فعلی موجود نیست.',
      targetManual: 'مقاومت هدف طرح (MPa)', targetSelected: 'مقاومت هدف انتخابی', autoUnavailable: 'محاسبه خودکار در دسترس نیست.',
      sharesTitle: 'سهم‌بندی سنگدانه‌ها', share: 'سهم', showCurves: 'انتخاب منحنی‌های قابل نمایش',
      showAggCurve: 'نمایش منحنی', showMix: 'نمایش منحنی مخلوط ترکیبی', showRef: 'نمایش منحنی‌های مرجع A، B و C',
      fm: 'مدول نرمی مخلوط', notDefined: 'تعیین نشده', gradingChart: 'منحنی‌های دانه‌بندی',
      sieveSize: 'اندازه الک (mm) ـ مقیاس لگاریتمی', passingPct: 'درصد عبوری',
      wcTitle: 'تعیین نسبت آب به سیمان', wcSelected: 'نسبت آب به سیمان انتخابی',
      avgStrength: 'مقاومت فشاری متوسط (MPa)', wcLimitWarning: 'هشدار: نسبت آب به سیمان انتخاب‌شده',
      wcLimitWarning2: 'از حداکثر مجاز', moreThan: 'بیشتر است.', continueBtn: 'ادامه', fixBtn: 'اصلاح',
      wcChart: 'نمودار نسبت آب به سیمان و مقاومت فشاری',
      wcTargetText: 'نسبت آب به سیمان متناظر با مقاومت هدف',
      outOfRange: 'خارج از محدوده است.', setTarget: 'لطفاً مقاومت هدف را تعیین کنید.',
      strengthAxis: 'مقاومت فشاری (N/mm²)', wcAxis: 'نسبت آب به سیمان',
      waterTitle: 'تعیین آب آزاد', waterChart: 'نمودار تعیین آب آزاد بر اساس مدول نرمی',
      calcParams: 'پارامترهای محاسباتی', fmMixed: 'مدول نرمی مخلوط سنگدانه', slumpSpec: 'اسلامپ مشخصه',
      waterCurve: 'آب آزاد مورد نیاز حاصل از منحنی (kg/m³)', waterReduction: 'درصد کاهش آب ناشی از روان‌کننده (%)',
      waterReductionAmt: 'مقدار کاهش آب آزاد (kg/m³)', finalWater: 'آب آزاد نهایی (kg/m³)',
      waterAxis: 'آب آزاد (kg/m³)', fmAxis: 'مدول نرمی (F.M.)',
      cementTitle: 'تعیین مقدار سیمان', cementFormula: 'تعیین مقدار سیمان',
      cementInRange: 'مقدار سیمان در محدوده مجاز است.',
      cementAboveMax: 'هشدار: سیمان', cementAboveMax2: 'از حداکثر مجاز', cementAboveMax3: 'بیشتر است.',
      cementBelowMin: 'هشدار: سیمان', cementBelowMin2: 'از حداقل مجاز', cementBelowMin3: 'کمتر است.',
      cementAboveSoft: 'هشدار: سیمان', cementAboveSoft2: 'از حد پیش‌فرض', cementAboveSoft3: 'بیشتر است.',
      corrFactor: 'ضریب اصلاح آب (kg/10kg)', extraCement: 'سیمان اضافی', extraWater: 'آب اضافی',
      chooseAction: '--- انتخاب کنید ---', proceed: '1. نادیده گرفتن و ادامه',
      gradingFix: '2. اصلاح بافت دانه‌بندی', wcFix: '3. اصلاح نسبت آب به سیمان',
      acceptMin: 'پذیرش حداقل مجاز و ادامه', acceptMax: 'پذیرش حداکثر مجاز و ادامه',
      menuTitle: 'منوی برنامه', menuPrint: '🖨️ نمایش و چاپ گزارش', menuLanguage: '🌐 زبان',
      menuGuide: '📖 راهنما', menuContact: '✉️ ارتباط با سازنده', contactBadge: 'ارتباط با سازنده',
      contactEmail: 'ایمیل', contactSend: 'ارسال ایمیل', contactCopy: 'کپی ایمیل',
      contactCopied: '✓ کپی شد', contactFooter: 'با آرزوی موفقیت 🌟', author: 'مهدی پناهی',
      close: 'بستن', notAvailable: 'در دسترس نیست', error: 'خطا',
      confirmRestore: 'طرح بازیابی شد.', invalidFile: 'فایل معتبر نیست.', restoreError: 'خطا: ',
      splashLoading: 'در حال بارگذاری...', printNotAvailable: 'پلاگین چاپ در دسترس نیست. لطفاً APK را با پلاگین سازگار مجدداً بسازید.',
      printError: 'خطا در چاپ: ', swError: 'SW ثبت نشد:', saveError: 'ذخیره ناموفق',
      validation: {
        invalidNumber: 'باید عدد معتبر باشد.', positive: 'باید مثبت باشد.',
        slumpRange: 'اسلامپ باید بین', and: 'و', invalidNmsa: 'NMSA معتبر نیست.',
        wcRange: 'نسبت آب به سیمان باید بین صفر و یک باشد.',
        coarseRange: 'سهم حجمی شن باید بین صفر و یک باشد.', airRange: 'درصد هوا باید بین صفر و ۱۵ باشد.',
        densityPositive: 'چگالی نسبی باید مثبت باشد.', waterAbsNegative: 'درصد جذب آب نمی‌تواند منفی باشد.',
        admRange: 'درصد افزودنی باید بین صفر و ۱۰۰ باشد.', admDensityPositive: 'چگالی افزودنی باید مثبت باشد.',
        waterRedRange: 'درصد کاهش آب باید بین صفر و ۱۰۰ باشد.', minCementPositive: 'حداقل سیمان باید مثبت باشد.',
        maxCementPositive: 'حداکثر سیمان باید مثبت باشد.', maxWcRange: 'حداکثر نسبت آب به سیمان باید بین صفر و یک باشد.',
        aggFracture: 'درصد شکستگی سنگدانه', aggSg: 'چگالی نسبی سنگدانه', aggWaterAbs: 'درصد جذب آب سنگدانه',
        invalid: 'نامعتبر است.', passingSieve: 'درصد عبوری سنگدانه', fromSieve: 'از الک',
        moreThanCoarser: 'از الک درشت‌تر بیشتر است.', sharesComplete: 'سهم‌بندی سنگدانه‌ها در صفحه سهم‌بندی باید کامل و مجموعاً ۱۰۰٪ باشد.',
        aggVolumePositive: 'حجم باقی‌مانده برای سنگدانه مثبت نیست.', shareRange: 'سهم باید بین صفر و ۱۰۰ باشد.',
        invalidCount: 'تعداد نامعتبر', cementOutOfRange: 'مقدار سیمان در محدوده مجاز نیست.'
      }
    },
    report: {
      headerDate: 'تاریخ', headerFile: 'نام فایل', sec1: '۱. اطلاعات اولیه',
      charStrength: 'مقاومت مشخصه', slumpClass: 'رده اسلامپ', slump: 'اسلامپ', nmsa: 'NMSA',
      cementClass: 'رده سیمان', air: 'هوا', admixture: 'افزودنی', admixturePct: 'درصد افزودنی',
      none: 'ندارد', sec2: '۲. مقاومت هدف', workshopRank: 'رتبه کارگاه', target: 'هدف',
      sec3: '۳. مشخصات سنگدانه‌ها', name: 'نام', sg: 'چگالی نسبی', waterAbs: 'جذب آب (٪)',
      fracture: 'شکستگی (٪)', share: 'سهم (٪)', sec4: '۴. منحنی دانه‌بندی', sec5: '۵. نسبت آب به سیمان',
      sec6: '۶. آب آزاد', sec7: '۷. نتایج نهایی', cement: 'سیمان', effectiveWater: 'آب مؤثر',
      admixtureLabel: 'افزودنی', sandSSD: 'ماسه SSD', gravelSSD: 'شن SSD', totalDry: 'خشک کل',
      parameter: 'پارامتر', value: 'مقدار', cementC: 'سیمان (C)', waterW: 'آب مؤثر (W)',
      sandSSD2: 'ماسه SSD', gravelSSD2: 'شن SSD', sandDry: 'ماسه خشک', gravelDry: 'شن خشک',
      admixtureLabel2: 'افزودنی', aggVolume: 'حجم سنگدانه', gammaSSD: 'γ<sub>SSD</sub>',
      aggregatesInM3: 'نتایج نهایی سنگدانه‌ها', aggregate1: 'سنگدانه ۱', aggregate2: 'سنگدانه ۲',
      sgSSD: 'چگالی نسبی SSD', volumeM3: 'حجم سنگدانه (m³)', massSSD: 'وزن سنگدانه SSD (kg)', dryMass: 'وزن سنگدانه خشک (kg)',
      totalWater: 'آب کل (W_total)', dryMassAd: 'جرم خشک (Ad)', finalDensity: 'چگالی نهایی (G)',
      finalSummary: 'خلاصه نهایی'
    }
  },
  en: {
    appTitle: 'Concrete Mix Design',
    appSub: 'Iranian Concrete Mix Design',
    credit: 'Compiled by',
    reportTitle: 'Final Concrete Mix Design Report',
    reportFileNamePrompt: 'Enter report file name:',
    reportDefaultName: 'Concrete-Mix-Design-Report',
    tabs: ['Initial Info', 'Aggregate Properties', 'Aggregate Shares', 'Water to Cement', 'Free Water', 'Cement Content', 'Final Report'],
    btnPrev: 'Previous',
    btnNext: 'Next',
    fields: {
      strength: 'Characteristic strength (MPa)', slump: 'Slump (mm)', water: 'Base free water (kg/m³)',
      wc: 'Water/cement ratio', coarseShare: 'Volume share of gravel', air: 'Concrete air (%)',
      sgCement: 'Cement relative density', sgSand: 'Sand relative density', waterAbsSand: 'Sand water absorption (%)',
      sgGravel: 'Gravel relative density', waterAbsGravel: 'Gravel water absorption (%)', sgAdmixture: 'Admixture relative density'
    },
    misc: {
      projectName: 'Project name', concreteAir: 'Concrete air', minCementOn: 'Apply minimum cement',
      maxCementOn: 'Apply maximum cement', minCement: 'Minimum cement (kg/m³)', maxCement: 'Maximum cement (kg/m³)',
      wcLimitOn: 'Apply maximum W/C ratio', wcLimit: 'Maximum W/C ratio',
      slumpClass: 'Slump class', cementClass: 'Cement strength class', admixture: 'Admixture type',
      admixturePct: 'Admixture/sement ratio (%)', sgAdmixture: 'Admixture density', optionalControls: 'Optional design controls',
      aggregateCount: 'Number of aggregate types', nmsa: 'Nominal maximum aggregate size (NMSA)',
      aggName: 'Aggregate name', aggSg: 'Aggregate relative density', aggWaterAbs: 'Aggregate water absorption (%)',
      aggFracture: 'Fracture (%)', sievePassing: 'Passing sieve', specs: 'Property',
      targetStrengthTitle: 'Target strength determination', targetMethod: 'Target strength method',
      manual: 'Manual entry', auto: 'Automatic calculation', workshopRank: 'Workshop rank',
      rankA: 'A', rankB: 'B', rankC: 'C',
      charStrength: 'Characteristic strength', stdDev: 'Standard deviation S', noStdDev: 'Standard deviation value not available for this strength in the current table.',
      targetManual: 'Target strength (MPa)', targetSelected: 'Selected target strength', autoUnavailable: 'Automatic calculation not available.',
      sharesTitle: 'Aggregate shares', share: 'Share', showCurves: 'Select visible curves',
      showAggCurve: 'Show curve', showMix: 'Show combined mix curve', showRef: 'Show reference curves A, B, C',
      fm: 'Mix fineness modulus', notDefined: 'Not determined', gradingChart: 'Grading curves',
      sieveSize: 'Sieve size (mm) — logarithmic scale', passingPct: 'Passing (%)',
      wcTitle: 'Water/cement ratio determination', wcSelected: 'Selected water/cement ratio',
      avgStrength: 'Average compressive strength (MPa)', wcLimitWarning: 'Warning: selected W/C ratio',
      wcLimitWarning2: 'exceeds the maximum allowed', moreThan: '.', continueBtn: 'Continue', fixBtn: 'Fix',
      wcChart: 'W/C ratio vs. compressive strength',
      wcTargetText: 'W/C ratio corresponding to target strength',
      outOfRange: 'is out of range.', setTarget: 'Please set the target strength.',
      strengthAxis: 'Compressive strength (N/mm²)', wcAxis: 'Water/cement ratio',
      waterTitle: 'Free water determination', waterChart: 'Free water chart based on fineness modulus',
      calcParams: 'Calculation parameters', fmMixed: 'Mix fineness modulus', slumpSpec: 'Specified slump',
      waterCurve: 'Required free water from curve (kg/m³)', waterReduction: 'Water reduction by admixture (%)',
      waterReductionAmt: 'Water reduction amount (kg/m³)', finalWater: 'Final free water (kg/m³)',
      waterAxis: 'Free water (kg/m³)', fmAxis: 'Fineness modulus (F.M.)',
      cementTitle: 'Cement content determination', cementFormula: 'Cement content determination',
      cementInRange: 'Cement content is within the allowed range.',
      cementAboveMax: 'Warning: cement', cementAboveMax2: 'exceeds the maximum allowed', cementAboveMax3: '.',
      cementBelowMin: 'Warning: cement', cementBelowMin2: 'is below the minimum allowed', cementBelowMin3: '.',
      cementAboveSoft: 'Warning: cement', cementAboveSoft2: 'exceeds the default limit', cementAboveSoft3: '.',
      corrFactor: 'Water correction factor (kg/10kg)', extraCement: 'Extra cement', extraWater: 'Extra water',
      chooseAction: '--- Choose ---', proceed: '1. Ignore and continue',
      gradingFix: '2. Fix grading', wcFix: '3. Fix W/C ratio',
      acceptMin: 'Accept minimum and continue', acceptMax: 'Accept maximum and continue',
      menuTitle: 'App menu', menuPrint: '🖨️ View & print report', menuLanguage: '🌐 Language',
      menuGuide: '📖 Guide', menuContact: '✉️ Contact developer', contactBadge: 'Contact developer',
      contactEmail: 'Email', contactSend: 'Send email', contactCopy: 'Copy email',
      contactCopied: '✓ Copied', contactFooter: 'Best wishes 🌟', author: 'Mahdi Panahi',
      close: 'Close', notAvailable: 'Not available', error: 'Error',
      confirmRestore: 'Design restored.', invalidFile: 'Invalid file.', restoreError: 'Error: ',
      splashLoading: 'Loading...', printNotAvailable: 'Print plugin not available. Please rebuild the APK with a compatible plugin.',
      printError: 'Print error: ', swError: 'SW registration failed:', saveError: 'Save failed',
      validation: {
        invalidNumber: 'must be a valid number.', positive: 'must be positive.',
        slumpRange: 'Slump must be between', and: 'and', invalidNmsa: 'Invalid NMSA.',
        wcRange: 'W/C ratio must be between 0 and 1.',
        coarseRange: 'Gravel volume share must be between 0 and 1.', airRange: 'Air content must be between 0 and 15.',
        densityPositive: 'Relative density must be positive.', waterAbsNegative: 'Water absorption cannot be negative.',
        admRange: 'Admixture percentage must be between 0 and 100.', admDensityPositive: 'Admixture density must be positive.',
        waterRedRange: 'Water reduction percentage must be between 0 and 100.', minCementPositive: 'Minimum cement must be positive.',
        maxCementPositive: 'Maximum cement must be positive.', maxWcRange: 'Maximum W/C ratio must be between 0 and 1.',
        aggFracture: 'Aggregate fracture percentage', aggSg: 'Aggregate relative density', aggWaterAbs: 'Aggregate water absorption',
        invalid: 'is invalid.', passingSieve: 'Passing percentage of aggregate', fromSieve: 'from sieve',
        moreThanCoarser: 'is greater than the coarser sieve.', sharesComplete: 'Aggregate shares must be complete and sum to 100%.',
        aggVolumePositive: 'Remaining volume for aggregate is not positive.', shareRange: 'Share must be between 0 and 100.',
        invalidCount: 'Invalid count', cementOutOfRange: 'Cement content is out of allowed range.'
      }
    },
    report: {
      headerDate: 'Date', headerFile: 'File name', sec1: '1. Initial Info',
      charStrength: 'Characteristic strength', slumpClass: 'Slump class', slump: 'Slump', nmsa: 'NMSA',
      cementClass: 'Cement class', air: 'Air', admixture: 'Admixture', admixturePct: 'Admixture (%)',
      none: 'None', sec2: '2. Target Strength', workshopRank: 'Workshop rank', target: 'Target',
      sec3: '3. Aggregate Properties', name: 'Name', sg: 'Relative density', waterAbs: 'Water absorption (%)',
      fracture: 'Fracture (%)', share: 'Share (%)', sec4: '4. Grading Curve', sec5: '5. Water/Cement Ratio',
      sec6: '6. Free Water', sec7: '7. Final Results', cement: 'Cement', effectiveWater: 'Effective water',
      admixtureLabel: 'Admixture', sandSSD: 'Sand SSD', gravelSSD: 'Gravel SSD', totalDry: 'Total dry',
      parameter: 'Parameter', value: 'Value', cementC: 'Cement (C)', waterW: 'Effective water (W)',
      sandSSD2: 'Sand SSD', gravelSSD2: 'Gravel SSD', sandDry: 'Dry sand', gravelDry: 'Dry gravel',
      admixtureLabel2: 'Admixture', aggVolume: 'Aggregate volume', gammaSSD: 'γ<sub>SSD</sub>',
      aggregatesInM3: 'Final Aggregate Results', aggregate1: 'Aggregate 1', aggregate2: 'Aggregate 2',
      sgSSD: 'SSD relative density', volumeM3: 'Aggregate volume (m³)', massSSD: 'Aggregate SSD weight (kg)', dryMass: 'Aggregate dry weight (kg)',
      totalWater: 'Total water (W_total)', dryMassAd: 'Dry mass (Ad)', finalDensity: 'Final density (G)',
      finalSummary: 'Final summary'
    }
  }
};

function t(key) {
  const parts = key.split('.');
  let obj = translations[currentLang];
  for (const p of parts) { if (obj == null) return key; obj = obj[p]; }
  return obj != null ? obj : key;
}

function isFa() { return currentLang === 'fa'; }

function toggleLanguage() {
  currentLang = currentLang === 'fa' ? 'en' : 'fa';
  try { localStorage.setItem(LANG_KEY, currentLang); } catch (_) {}
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  view();
}

/* ================= defaults ================= */
const defaults = {
  strength: 30, slumpClass: 'S3', slump: 125, msa: 19, aggregateCount: 2,
  cementClass: '42.5', water: 185, wc: 0.50, coarseShare: 0.60, grading: 'continuous',
  admixture: 'none', admixturePct: 0, waterReductionPct: '', sgAdmixture: 1.1,
  limitMinCementOn: false, limitMinCement: 280, limitMaxCementOn: false,
  limitMaxCement: 450, limitWcOn: false, limitWc: 0.50, wcContinueWithExcess: false,
  air: 2, sgCement: 3.15, sgSand: 2.65, waterAbsSand: 0.5, sgGravel: 2.70,
  waterAbsGravel: 0.5, targetMethod: 'manual', workshopRank: 'A',
  targetStrengthManual: '', step1Strength: null, aggregateShares: ['', '', '', ''],
  showAggregateCurves: [true, true, true, true], showMixCurve: true,
  showReferenceCurves: true, correctionFactor: 1.5, cementAction: '',
  projectName: '', reportFileName: ''
};

const sieves = [
  { mm: 37.5, label: '1/2 1' }, { mm: 25, label: '1' }, { mm: 19, label: '3/4' },
  { mm: 12.5, label: '1/2' }, { mm: 9.5, label: '3/8' }, { mm: 6.35, label: '1/4' },
  { mm: 4.75, label: '4' }, { mm: 2.36, label: '8' }, { mm: 1.18, label: '16' },
  { mm: 0.6, label: '30' }, { mm: 0.3, label: '50' }, { mm: 0.15, label: '100' }
];

const slumpClasses = {
  S1: { label: 'S1 (10-40 mm)', min: 10, max: 40 },
  S2: { label: 'S2 (50-90 mm)', min: 50, max: 90 },
  S3: { label: 'S3 (100-150 mm)', min: 100, max: 150 },
  S4: { label: 'S4 (160-210 mm)', min: 160, max: 210 }
};

const standardDeviationTable = {
  16: { A: 2.5, B: 3.5, C: 4.0 }, 20: { A: 3.0, B: 4.0, C: 5.0 },
  25: { A: 3.5, B: 4.5, C: 5.5 }, 30: { A: 4.0, B: 5.0, C: 6.0 },
  35: { A: 4.0, B: 5.0, C: 6.0 }, 40: { A: 4.5, B: 5.5, C: 6.5 }
};

const referenceCurves = {
  '9.5': { A: [100,100,100,100,100,90,83,66,51,37,27,12], B: [100,100,100,100,100,84,74,52,35,24,14,6], C: [100,100,100,100,100,75,61,37,22,12,6,2] },
  '12.5': { A: [100,100,100,100,93,84,77,62,48,35,24,11], B: [100,100,100,100,89,75,66,47,32,21,13,6], C: [100,100,100,100,82,62,51,31,18,10,5,2] },
  '19': { A: [100,100,100,90,84,76,70,56,44,31,20,10], B: [100,100,100,85,75,62,55,40,28,18,11,5], C: [100,100,100,74,62,47,38,22,13,8,4,2] },
  '25': { A: [100,100,94,85,79,71,65,52,41,29,19,9], B: [100,100,89,75,67,56,49,36,25,16,9,4], C: [100,100,82,62,51,39,32,19,11,6,3,1] }
};

const SIEVE_635_INDEX = sieves.findIndex(s => s.mm === 6.35);
const aggregateSieves = sieves.map((sieve, j) => ({ sieve, j })).filter(({ sieve }) => sieve.mm !== 6.35);
const chartSieves = sieves.filter(s => s.mm !== 6.35);

const titles = t('tabs');

const fields = {
  strength: [t('fields.strength'), 0.1], slump: [t('fields.slump'), 1],
  water: [t('fields.water'), 0.1], wc: [t('fields.wc'), 0.001],
  coarseShare: [t('fields.coarseShare'), 0.001], air: [t('fields.air'), 0.1],
  sgCement: [t('fields.sgCement'), 0.01], sgSand: [t('fields.sgSand'), 0.01],
  waterAbsSand: [t('fields.waterAbsSand'), 0.1], sgGravel: [t('fields.sgGravel'), 0.01],
  waterAbsGravel: [t('fields.waterAbsGravel'), 0.1], sgAdmixture: [t('fields.sgAdmixture'), 0.01]
};

let stored = {};
try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { stored = {}; }

const data = { ...defaults, ...stored };

function defaultAggregate(index) {
  return { name: isFa() ? `سنگدانه ${index + 1}` : `Aggregate ${index + 1}`, fracture: 0, sg: index === 0 ? 2.65 : 2.70, waterAbs: 0.5, passing: Array(sieves.length).fill('') };
}

function sanitizeData() {
  if (!['S1', 'S2', 'S3', 'S4'].includes(data.slumpClass)) data.slumpClass = 'S3';
  if (!['none', 'slump', 'water_reducer'].includes(data.admixture)) data.admixture = 'none';
  if (!['manual', 'auto'].includes(data.targetMethod)) data.targetMethod = 'manual';
  if (!['A', 'B', 'C'].includes(data.workshopRank)) data.workshopRank = 'A';
  if (!['32.5', '42.5', '52.5'].includes(String(data.cementClass))) data.cementClass = '42.5';
  if (!['continuous', 'gap_graded'].includes(data.grading)) data.grading = 'continuous';
  data.limitMinCementOn = data.limitMinCementOn === true;
  data.limitMaxCementOn = data.limitMaxCementOn === true;
  data.limitWcOn = data.limitWcOn === true;
  data.wcContinueWithExcess = data.wcContinueWithExcess === true;

  const numericFallbacks = {
    strength: 30, slump: 125, water: 185, wc: 0.5, coarseShare: 0.6, air: 2,
    sgCement: 3.15, sgSand: 2.65, sgGravel: 2.7, waterAbsSand: 0.5, waterAbsGravel: 0.5,
    sgAdmixture: 1.1, admixturePct: 0, limitMinCement: 280, limitMaxCement: 450,
    limitWc: 0.5, correctionFactor: 1.5
  };
  for (const [k, fb] of Object.entries(numericFallbacks)) {
    if (!Number.isFinite(Number(data[k]))) data[k] = fb;
  }
  if (data.waterReductionPct !== '' && data.waterReductionPct != null && !Number.isFinite(Number(data.waterReductionPct))) data.waterReductionPct = '';
  if (data.step1Strength === undefined || data.step1Strength === '') data.step1Strength = null;
  else if (data.step1Strength !== null && !Number.isFinite(Number(data.step1Strength))) data.step1Strength = null;
  else if (data.step1Strength !== null) data.step1Strength = Number(data.step1Strength);
}

function normalizeData() {
  const msaValue = Number(data.msa);
  data.msa = [9.5, 12.5, 19, 25].includes(msaValue) ? msaValue : 19;
  if (!Array.isArray(data.aggregates)) data.aggregates = [];
  data.aggregates = data.aggregates.map((a, i) => {
    const base = defaultAggregate(i);
    const sourcePassing = Array.isArray(a.passing) ? a.passing.slice() : [];
    if (sourcePassing.length === 11) sourcePassing.splice(SIEVE_635_INDEX, 0, '');
    const legacySg = i === 0 ? data.sgSand : data.sgGravel;
    const legacyAbs = i === 0 ? data.waterAbsSand : data.waterAbsGravel;
    return {
      ...base, ...a,
      sg: (a.sg === undefined || a.sg === '') ? (Number.isFinite(Number(legacySg)) ? Number(legacySg) : base.sg) : Number(a.sg),
      waterAbs: (a.waterAbs === undefined || a.waterAbs === '') ? (Number.isFinite(Number(legacyAbs)) ? Number(legacyAbs) : base.waterAbs) : Number(a.waterAbs),
      passing: sieves.map((sieve, j) => {
        if (sieve.mm === 6.35) return '';
        const v = sourcePassing[j];
        return v === '' || v == null ? '' : Number(v);
      })
    };
  });
  while (data.aggregates.length < 4) data.aggregates.push(defaultAggregate(data.aggregates.length));
  data.aggregates = data.aggregates.slice(0, 4);
  data.aggregateCount = Math.max(2, Math.min(4, Number(data.aggregateCount) || 2));
  data.aggregateShares = Array.from({ length: 4 }, (_, i) => {
    const source = Array.isArray(data.aggregateShares) ? data.aggregateShares[i] : '';
    return source === '' || source == null ? '' : Number(source);
  });
  data.showAggregateCurves = Array.from({ length: 4 }, (_, i) => {
    const source = Array.isArray(data.showAggregateCurves) ? data.showAggregateCurves[i] : true;
    return source !== false;
  });
  data.showMixCurve = data.showMixCurve !== false;
  data.showReferenceCurves = data.showReferenceCurves !== false;
  sanitizeData();
}

normalizeData();

let page = 0;

function save() {
  const n = Math.max(2, Math.min(4, Number(data.aggregateCount) || 2));
  const sand = data.aggregates[0];
  if (sand && Number.isFinite(Number(sand.sg))) {
    data.sgSand = Number(sand.sg);
    data.waterAbsSand = Number(sand.waterAbs) || 0;
  }
  const gr = data.aggregates.slice(1, n);
  if (gr.length) {
    data.sgGravel = gr.reduce((s, a) => s + (Number(a.sg) || 0), 0) / gr.length;
    data.waterAbsGravel = gr.reduce((s, a) => s + (Number(a.waterAbs) || 0), 0) / gr.length;
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (error) { console.warn(t('misc.saveError'), error); }
}

function num(key) { return Number(data[key]); }

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

function selected(key, value) { return String(data[key]) === String(value) ? 'selected' : ''; }

function numberInput(key, label, step, extra = '') {
  return `<label class="field"><span>${label}</span><input type="text" inputmode="decimal" enterkeyhint="next" data-key="${key}" data-step="${step}" value="${escapeHtml(data[key] ?? '')}" ${extra}></label>`;
}

function selectInput(key, label, options) {
  return `<label class="field"><span>${label}</span><select data-key="${key}">${options.map(o => `<option value="${o.value}" ${selected(key, o.value)}>${o.label}</option>`).join('')}</select></label>`;
}

function slumpRange() { return slumpClasses[data.slumpClass] || slumpClasses.S3; }

function requireNumber(key, label) {
  const raw = data[key];
  if (raw === '' || raw == null || !Number.isFinite(Number(raw))) throw Error(`${label} ${t('misc.validation.invalidNumber')}`);
  return Number(raw);
}

function effectiveWater() {
  const water = num('water');
  if (data.admixture !== 'none') {
    const pct = Number(data.waterReductionPct) || 0;
    return water * (1 - pct / 100);
  }
  return water;
}

function validate() {
  const v = t('misc.validation');
  const required = { strength: t('fields.strength'), slump: t('fields.slump'), msa: t('misc.nmsa'), water: t('fields.water'), wc: t('fields.wc'), coarseShare: t('fields.coarseShare'), air: t('fields.air'), sgCement: t('fields.sgCement'), sgSand: t('fields.sgSand'), waterAbsSand: t('fields.waterAbsSand'), sgGravel: t('fields.sgGravel'), waterAbsGravel: t('fields.waterAbsGravel') };
  for (const [key, label] of Object.entries(required)) requireNumber(key, label);
  if (data.admixture !== 'none') requireNumber('sgAdmixture', t('fields.sgAdmixture'));
  if (num('strength') <= 0) throw Error(`${t('fields.strength')} ${v.positive}`);
  const range = slumpRange();
  if (num('slump') < range.min || num('slump') > range.max) throw Error(`${v.slumpRange} ${range.min} ${v.and} ${range.max}`);
  if (![9.5, 12.5, 19, 25].includes(num('msa'))) throw Error(v.invalidNmsa);
  if (num('water') <= 0) throw Error(`${t('fields.water')} ${v.positive}`);
  if (num('wc') <= 0 || num('wc') >= 1) throw Error(v.wcRange);
  if (num('coarseShare') <= 0 || num('coarseShare') >= 1) throw Error(v.coarseRange);
  if (num('air') < 0 || num('air') >= 15) throw Error(v.airRange);
  for (const key of ['sgCement', 'sgSand', 'sgGravel']) if (num(key) <= 0) throw Error(v.densityPositive);
  if (num('waterAbsSand') < 0 || num('waterAbsGravel') < 0) throw Error(v.waterAbsNegative);
  if (data.admixture !== 'none') {
    const pct = requireNumber('admixturePct', t('misc.admixturePct'));
    if (pct < 0 || pct >= 100) throw Error(v.admRange);
    if (num('sgAdmixture') <= 0) throw Error(v.admDensityPositive);
    if (data.waterReductionPct !== '' && data.waterReductionPct != null) {
      const rp = Number(data.waterReductionPct);
      if (!Number.isFinite(rp) || rp < 0 || rp >= 100) throw Error(v.waterRedRange);
    }
  }
  if (data.limitMinCementOn) { const minimum = requireNumber('limitMinCement', t('misc.minCement')); if (minimum <= 0) throw Error(v.minCementPositive); }
  if (data.limitMaxCementOn) { const maximum = requireNumber('limitMaxCement', t('misc.maxCement')); if (maximum <= 0) throw Error(v.maxCementPositive); }
  if (data.limitWcOn) { const maximum = requireNumber('limitWc', t('misc.wcLimit')); if (maximum <= 0 || maximum >= 1) throw Error(v.maxWcRange); }
}

function validateAggregates() {
  const v = t('misc.validation');
  for (let i = 0; i < data.aggregateCount; i++) {
    const a = data.aggregates[i];
    if (a.fracture === '' || !Number.isFinite(Number(a.fracture)) || Number(a.fracture) < 0 || Number(a.fracture) > 100) throw Error(`${v.aggFracture} ${i + 1} ${v.invalid}`);
    if (a.sg === '' || !Number.isFinite(Number(a.sg)) || Number(a.sg) <= 0) throw Error(`${v.aggSg} ${i + 1} ${v.invalid}`);
    if (a.waterAbs === '' || !Number.isFinite(Number(a.waterAbs)) || Number(a.waterAbs) < 0) throw Error(`${v.aggWaterAbs} ${i + 1} ${v.invalid}`);
    let previous = null;
    for (let j = 0; j < sieves.length; j++) {
      if (sieves[j].mm === 6.35) continue;
      const raw = a.passing[j];
      if (raw === '' || raw == null) continue;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0 || value > 100) throw Error(`${v.passingSieve} ${i + 1} ${v.fromSieve} ${sieves[j].mm} ${v.invalid}`);
      if (previous !== null && value > previous) throw Error(`${v.aggFracture} ${i + 1} ${v.passingSieve} ${sieves[j].mm} ${v.moreThanCoarser}`);
      previous = value;
    }
  }
}

function requireShares() {
  const sharesInfo = getSharesInfo();
  if (!sharesInfo.valid) throw Error(t('misc.validation.sharesComplete'));
  return sharesInfo;
}

class Step4 { run() { validate(); requireShares(); return { cement: effectiveWater() / num('wc') }; } }

class Step5 {
  run(overrides = {}) {
    validate();
    const info = requireShares();
    const water = Number.isFinite(overrides.water) ? overrides.water : effectiveWater();
    const cement = Number.isFinite(overrides.cement) ? overrides.cement : (water / num('wc'));
    const admixtureMass = data.admixture === 'none' ? 0 : cement * num('admixturePct') / 100;
    const sgAdm = num('sgAdmixture') || 1.1;
    const vc = cement / (num('sgCement') * 1000);
    const vw = water / 1000;
    const va = num('air') / 100;
    const va_adm = data.admixture === 'none' ? 0 : admixtureMass / (sgAdm * 1000);
    const aggregateVolume = 1 - vc - vw - va - va_adm;
    if (aggregateVolume <= 0) throw Error(t('misc.validation.aggVolumePositive'));
    const gravelFrac = 1 - Number(info.shares[0]) / 100;
    const sandFrac = 1 - gravelFrac;
    const gravelVolume = aggregateVolume * gravelFrac;
    const sandVolume = aggregateVolume * sandFrac;
    const ssdSand = sandVolume * num('sgSand') * 1000;
    const ssdGravel = gravelVolume * num('sgGravel') * 1000;
    const drySand = ssdSand / (1 + num('waterAbsSand') / 100);
    const dryGravel = ssdGravel / (1 + num('waterAbsGravel') / 100);
    return { cement, water, ssdSand, ssdGravel, drySand, dryGravel, admixtureMass, vc, vw, va, va_adm, aggregateVolume, sandVolume, gravelVolume, sandFrac, gravelFrac };
  }
}

function getSoftMaxCement() {
  if (data.limitMaxCementOn && Number.isFinite(Number(data.limitMaxCement)) && Number(data.limitMaxCement) > 0) return Number(data.limitMaxCement);
  return 350;
}

function checkboxField(key, label, valueKey, valueLabel, step, disabled = false) {
  return `<div class="limit-box"><label class="checkline"><input type="checkbox" data-check="${key}" ${data[key] ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${label}</span></label>${data[key] ? numberInput(valueKey, valueLabel, step) : ''}</div>`;
}

function renderHome() {
  const range = slumpRange();
  const minDisabled = data.limitMaxCementOn;
  const maxDisabled = data.limitMinCementOn;
  return `
<h2>${t('tabs.0')}</h2>
<div class="grid">
  <label class="field" style="width:100%; flex-wrap:nowrap;">
    <span style="flex-shrink:0; max-width:110px;">${t('misc.projectName')}</span>
    <input type="text" enterkeyhint="next" data-key="projectName" value="${escapeHtml(data.projectName ?? '')}" style="width:100% !important; max-width:100%; text-align:right; flex:1;">
  </label>
</div>
<div class="grid">
  ${numberInput('strength', t('fields.strength'), 0.1)}
  ${selectInput('slumpClass', t('misc.slumpClass'), Object.entries(slumpClasses).map(([value, item]) => ({ value, label: item.label })))}
  ${numberInput('slump', t('fields.slump'), 1, `min="${range.min}" max="${range.max}"`)}
  ${numberInput('air', t('fields.air'), 0.1)}
</div>
<div class="grid">
  ${selectInput('cementClass', t('misc.cementClass'), [{ value: '32.5', label: '32.5' }, { value: '42.5', label: '42.5' }, { value: '52.5', label: '52.5' }])}
  ${numberInput('sgCement', t('fields.sgCement'), 0.01)}
</div>
<div class="grid">
  ${selectInput('admixture', t('misc.admixture'), [{ value: 'none', label: isFa() ? 'بدون افزودنی' : 'No admixture' }, { value: 'slump', label: isFa() ? 'افزودنی افزایش‌دهنده اسلامپ' : 'Slump increasing admixture' }, { value: 'water_reducer', label: isFa() ? 'افزودنی کاهنده آب' : 'Water reducing admixture' }])}
  ${numberInput('admixturePct', t('misc.admixturePct'), 0.1, data.admixture === 'none' ? 'min="0" max="99.9" disabled' : 'min="0" max="99.9"')}
  ${numberInput('sgAdmixture', t('misc.sgAdmixture'), 0.01, data.admixture === 'none' ? 'disabled' : '')}
</div>
<h3>${t('misc.optionalControls')}</h3>
${checkboxField('limitMinCementOn', t('misc.minCementOn'), 'limitMinCement', t('misc.minCement'), 1, minDisabled)}
${checkboxField('limitMaxCementOn', t('misc.maxCementOn'), 'limitMaxCement', t('misc.maxCement'), 1, maxDisabled)}
${checkboxField('limitWcOn', t('misc.wcLimitOn'), 'limitWc', t('misc.wcLimit'), 0.001)}
`;
}

function getClosestDeviationRow(fc) {
  const keys = Object.keys(standardDeviationTable).map(Number);
  if (standardDeviationTable[fc]) return standardDeviationTable[fc];
  let nearest = keys[0]; let minDiff = Math.abs(fc - nearest);
  for (const k of keys) { const diff = Math.abs(fc - k); if (diff < minDiff) { minDiff = diff; nearest = k; } }
  return standardDeviationTable[nearest];
}

function targetCalculations() {
  let fc = num('strength');
  if (!Number.isFinite(fc) || fc <= 0) fc = 30;
  const row = getClosestDeviationRow(fc);
  if (!row) return null;
  let S = row[data.workshopRank];
  if (!Number.isFinite(S)) S = row['A'];
  if (!Number.isFinite(S)) S = 4.0;
  const fcm1 = fc + 1.34 * S;
  const fcm2 = 0.9 * fc + 2.33 * S;
  return { fc, S, fcm1, fcm2, target: Math.max(fcm1, fcm2) };
}

function getTargetStrength() {
  if (data.targetMethod === 'manual') {
    const raw = data.targetStrengthManual;
    if (raw === '' || raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  const result = targetCalculations();
  return result ? result.target : null;
}

function renderTargetStrength() {
  const result = targetCalculations();
  const fc = num('strength');
  return `
<h3>${t('misc.targetStrengthTitle')}</h3>
<div class="grid">
  ${selectInput('targetMethod', t('misc.targetMethod'), [{ value: 'manual', label: t('misc.manual') }, { value: 'auto', label: t('misc.auto') }])}
  ${selectInput('workshopRank', t('misc.workshopRank'), [{ value: 'A', label: t('misc.rankA') }, { value: 'B', label: t('misc.rankB') }, { value: 'C', label: t('misc.rankC') }])}
</div>
<p>${t('misc.charStrength')}: <strong>${Number.isFinite(fc) ? fc.toFixed(2) : '—'} MPa</strong></p>
${result ? `<p>${t('misc.stdDev')}: <strong>${result.S.toFixed(2)} MPa</strong></p>` : `<p class="hint">${t('misc.noStdDev')}</p>`}
${data.targetMethod === 'manual'
  ? numberInput('targetStrengthManual', t('misc.targetManual'), 0.1, 'min="0"')
  : result
    ? `<p>fcm1 = fc + 1.34 × S = <strong>${result.fcm1.toFixed(2)}</strong> MPa</p>
       <p>fcm2 = 0.9 × fc + 2.33 × S = <strong>${result.fcm2.toFixed(2)}</strong> MPa</p>
       <p>${t('misc.targetSelected')}: <strong>${result.target.toFixed(2)} MPa</strong></p>`
    : `<p class="hint">${t('misc.autoUnavailable')}</p>`}
`;
}

function renderAggregateTable() {
  const count = data.aggregateCount;
  const headers = Array.from({ length: count }, (_, i) => `<th>${isFa() ? 'سنگدانه' : 'Aggregate'} ${i + 1}</th>`).join('');
  const nameRow = `<tr><th>${t('misc.aggName')}</th>${Array.from({ length: count }, (_, i) => `<td><input class="table-input" type="text" enterkeyhint="next" data-agg="${i}" data-agg-field="name" value="${escapeHtml(data.aggregates[i].name)}"></td>`).join('')}</tr>`;
  const sgRow = `<tr><th>${t('misc.aggSg')}</th>${Array.from({ length: count }, (_, i) => `<td><input class="table-input" type="text" inputmode="decimal" enterkeyhint="next" min="0" data-agg="${i}" data-agg-field="sg" value="${escapeHtml(data.aggregates[i].sg ?? '')}"></td>`).join('')}</tr>`;
  const waterAbsRow = `<tr><th>${t('misc.aggWaterAbs')}</th>${Array.from({ length: count }, (_, i) => `<td><input class="table-input" type="text" inputmode="decimal" enterkeyhint="next" min="0" data-agg="${i}" data-agg-field="waterAbs" value="${escapeHtml(data.aggregates[i].waterAbs ?? '')}"></td>`).join('')}</tr>`;
  const fractureRow = `<tr><th>${t('misc.aggFracture')}</th>${Array.from({ length: count }, (_, i) => `<td><input class="table-input" type="text" inputmode="decimal" enterkeyhint="next" min="0" max="100" data-agg="${i}" data-agg-field="fracture" value="${data.aggregates[i].fracture}"></td>`).join('')}</tr>`;
  const sieveRows = sieves.map((sieve, j) => {
    if (sieve.mm === 6.35) return '';
    return `<tr><th>${t('misc.sievePassing')} ${sieve.label}</th>${Array.from({ length: count }, (_, i) => `<td><input class="table-input" type="text" inputmode="decimal" enterkeyhint="next" min="0" max="100" data-agg="${i}" data-sieve="${j}" value="${data.aggregates[i].passing[j] ?? ''}"></td>`).join('')}</tr>`;
  }).join('');
  return `
<h2>${t('tabs.1')}</h2>
<div class="grid">
  ${selectInput('aggregateCount', t('misc.aggregateCount'), [{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }])}
  ${selectInput('msa', t('misc.nmsa'), [{ value: 9.5, label: '9.5' }, { value: 12.5, label: '12.5' }, { value: 19, label: '19' }, { value: 25, label: '25' }])}
</div>
<div class="table-scroll" style="overflow-x:auto; -webkit-overflow-scrolling:touch;">
  <table class="aggregate-table">
    <thead><tr><th style="width: 140px;">${t('misc.specs')}</th>${headers}</tr></thead>
    <tbody>${nameRow}${sgRow}${waterAbsRow}${fractureRow}${sieveRows}</tbody>
  </table>
</div>
${renderTargetStrength()}
`;
}

function getSharesInfo() {
  const count = data.aggregateCount;
  const shares = data.aggregateShares.slice(0, count);
  const entered = shares.every(v => v !== '' && v != null && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100);
  const total = entered ? shares.reduce((sum, value) => sum + Number(value), 0) : null;
  return { count, shares, entered, total, valid: entered && Math.abs(total - 100) < 0.0001 };
}

function combinedGrading() {
  const info = getSharesInfo();
  if (!info.valid) return null;
  const aggregates = data.aggregates.slice(0, info.count);
  const allEntered = aggregates.every(a => aggregateSieves.every(({ j }) => {
    const v = a.passing[j];
    return v !== '' && v != null && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100;
  }));
  if (!allEntered) return null;
  return aggregateSieves.map(({ sieve, j }) => ({ mm: sieve.mm, value: aggregates.reduce((sum, a, i) => sum + Number(a.passing[j]) * Number(info.shares[i]) / 100, 0) }));
}

function finenessModulus(points) {
  if (!points) return null;
  const fmSieves = [37.5, 19, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15];
  let total = 0;
  for (const mm of fmSieves) {
    const point = points.find(p => p.mm === mm);
    if (!point) return null;
    total += 100 - point.value;
  }
  return total / 100;
}

function getReferenceSeries() {
  const msa = Number(data.msa);
  const source = referenceCurves[String(msa)];
  if (!source) return [];
  const result = [];
  for (const name of ['A', 'B', 'C']) {
    const values = source[name];
    if (!Array.isArray(values) || values.length !== sieves.length) continue;
    const points = sieves.map((sieve, i) => ({ mm: sieve.mm, value: values[i] })).filter(p => p.mm <= msa + 0.001);
    if (!points.length) continue;
    if (!points.every(p => typeof p.value === 'number' && Number.isFinite(p.value) && p.value >= 0 && p.value <= 100)) continue;
    let monotonic = true;
    for (let i = 1; i < points.length; i++) { if (points[i].value > points[i - 1].value + 0.0001) { monotonic = false; break; } }
    if (!monotonic) continue;
    result.push({ name, points });
  }
  return result;
}

function renderGradingChart(combined) {
  const width = 680, height = 390, left = 65, right = 25, top = 25, bottom = 75;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const minLog = Math.log10(0.075), maxLog = Math.log10(37.5);
  const x = mm => left + (Math.log10(mm) - minLog) / (maxLog - minLog) * plotWidth;
  const y = value => top + (100 - value) / 100 * plotHeight;

  function drawSeries(points, color, dash = '', thickness = 2.5, sieveList = sieves) {
    let valid = points.filter(p => p.value !== '' && p.value != null && Number.isFinite(Number(p.value)) && Number(p.value) >= 0 && Number(p.value) <= 100).sort((a, b) => a.mm - b.mm);
    if (!valid.length) return '';
    const first100Index = valid.findIndex(p => Number(p.value) === 100);
    let last0Index = -1;
    valid.forEach((p, idx) => { if (Number(p.value) === 0) last0Index = idx; });
    valid = valid.filter((p, idx) => {
      const v = Number(p.value);
      if (v === 100 && idx !== first100Index) return false;
      if (v === 0 && idx !== last0Index) return false;
      return true;
    });
    const segments = []; let current = []; let prevIdx = null;
    for (const p of valid) {
      const idx = sieveList.findIndex(s => Math.abs(s.mm - p.mm) < 0.0001);
      if (current.length && prevIdx !== null && idx !== -1 && idx - prevIdx > 1) { segments.push(current); current = []; }
      current.push({ ...p, index: idx }); prevIdx = idx;
    }
    if (current.length) segments.push(current);
    const lines = segments.map(segment => {
      if (segment.length < 2) return '';
      const coords = segment.map(p => `${x(p.mm)},${y(Number(p.value))}`).join(' ');
      return `<polyline points="${coords}" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-dasharray="${dash}" stroke-linejoin="round" />`;
    }).join('');
    const circles = valid.map(p => `<circle cx="${x(p.mm)}" cy="${y(Number(p.value))}" r="3" fill="${color}" />`).join('');
    return lines + circles;
  }

  const aggregateColors = ['#2563eb', '#ea580c', '#16a34a', '#9333ea'];
  const referenceColor = '#0ea5e9';
  const aggregateLines = data.aggregates.slice(0, data.aggregateCount).map((aggregate, i) => {
    if (!data.showAggregateCurves[i]) return '';
    const points = sieves.map((sieve, j) => ({ mm: sieve.mm, value: aggregate.passing[j] }));
    return drawSeries(points, aggregateColors[i], '6 4', 2.2, chartSieves);
  }).join('');
  const referenceSeries = getReferenceSeries();
  const referenceLines = data.showReferenceCurves ? referenceSeries.map(series => drawSeries(series.points, referenceColor, '', 2.8)).join('') : '';
  const mixLine = data.showMixCurve && combined ? drawSeries(combined, '#000000', '', 3.5, chartSieves) : '';
  const horizontalGrid = [0, 20, 40, 60, 80, 100].map(value => `<line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#d7e0e8" /><text x="${left - 25}" y="${y(value) + 4}" text-anchor="end" font-size="12" fill="#334155">${value}</text>`).join('');
  const xTickValues = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 6.35, 9.5, 12.5, 19, 25, 37.5];
  const xTicks = xTickValues.map(mm => `<line x1="${x(mm)}" y1="${top}" x2="${x(mm)}" y2="${height - bottom}" stroke="#e2e8f0" /><text x="${x(mm)}" y="${height - bottom + 20}" text-anchor="middle" font-size="11" fill="#334155">${mm}</text>`).join('');
  return `<h3>${t('misc.gradingChart')}</h3><div class="table-scroll"><svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:900px;background:white">
${horizontalGrid}${xTicks}
<line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
<line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
${referenceLines}${aggregateLines}${mixLine}
<text x="${width / 2}" y="${height - 16}" text-anchor="middle" font-size="13" fill="#334155">${t('misc.sieveSize')}</text>
<text x="17" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155" transform="rotate(-90 17 ${height / 2})">${t('misc.passingPct')}</text>
</svg></div>`;
}

function renderShares() {
  const count = data.aggregateCount;
  const shareInputs = Array.from({ length: count }, (_, i) => {
    const name = data.aggregates[i].name || (isFa() ? `سنگدانه ${i + 1}` : `Aggregate ${i + 1}`);
    return `<label class="field"><span>${t('misc.share')} ${escapeHtml(name)} (%)</span><input type="text" inputmode="decimal" enterkeyhint="next" min="0" max="100" data-share="${i}" value="${data.aggregateShares[i] ?? ''}"></label>`;
  }).join('');
  const combined = combinedGrading();
  const fm = finenessModulus(combined);
  const curveCheckboxes = Array.from({ length: count }, (_, i) => {
    const name = data.aggregates[i].name || (isFa() ? `سنگدانه ${i + 1}` : `Aggregate ${i + 1}`);
    return `<label class="checkline" style="margin:8px 0"><input type="checkbox" data-curve-aggregate="${i}" ${data.showAggregateCurves[i] ? 'checked' : ''}><span>${t('misc.showAggCurve')} ${escapeHtml(name)}</span></label>`;
  }).join('');
  return `
<h2>${t('misc.sharesTitle')}</h2>
<div class="grid">${shareInputs}</div>
<h3>${t('misc.showCurves')}</h3>
<div class="limit-box">
  ${curveCheckboxes}
  <label class="checkline" style="margin:8px 0"><input type="checkbox" data-curve-mix ${data.showMixCurve ? 'checked' : ''}><span>${t('misc.showMix')}</span></label>
  <label class="checkline" style="margin:8px 0"><input type="checkbox" data-curve-reference ${data.showReferenceCurves ? 'checked' : ''}><span>${t('misc.showRef')}</span></label>
</div>
<p>${t('misc.fm')}: <strong>${fm === null ? t('misc.notDefined') : fm.toFixed(2)}</strong></p>
${renderGradingChart(combined)}
`;
}

function getActiveCurve() {
  const cement = String(data.cementClass || '42.5');
  let isCrushed = false;
  if (data.aggregates && data.aggregates.length > 0) isCrushed = data.aggregates.slice(0, data.aggregateCount).some(a => Number(a.fracture) > 0);
  const type = isCrushed ? 'C' : 'R';
  const hasAdmixture = data.admixture && data.admixture !== 'none';
  let curveSet;
  if (hasAdmixture) {
    curveSet = {
      '32.5': { R: { a: 107.59, b: -198.24, c: 102.72, name: '325-R', color: '#3b82f6', width: 1.5, dash: 'none' }, C: { a: 126.73, b: -228.34, c: 116.36, name: '325-C', color: '#2563eb', width: 2.5, dash: 'none' } },
      '42.5': { R: { a: 123.42, b: -234.33, c: 122.57, name: '425-R', color: '#f87171', width: 1.5, dash: '6,4' }, C: { a: 119.86, b: -240.12, c: 130.32, name: '425-C', color: '#dc2626', width: 2.5, dash: 'none' } },
      '52.5': { R: { a: 80.04, b: -207, c: 126.63, name: '525-R', color: '#4ade80', width: 1.5, dash: '8,4,2,4' }, C: { a: 43.589, b: -173.59, c: 124.01, name: '525-C', color: '#16a34a', width: 2.5, dash: 'none' } }
    };
  } else {
    curveSet = {
      '32.5': { R: { a: 505.05, b: -769.26, c: 305.34, d: 6.9242, name: '325-R', color: '#3b82f6', width: 1.5, dash: 'none' }, C: { a: 545.45, b: -823.38, c: 319.24, d: 11.818, name: '325-C', color: '#2563eb', width: 2.5, dash: 'none' } },
      '42.5': { R: { a: 707.07, b: -1087.4, c: 450.57, d: -5.6061, name: '425-R', color: '#f87171', width: 1.5, dash: '2,4' }, C: { a: 525.25, b: -817.75, c: 313.6, d: 22.121, name: '425-C', color: '#dc2626', width: 2.5, dash: 'none' } },
      '52.5': { R: { a: 545.45, b: -894.81, c: 369.48, d: 13.818, name: '525-R', color: '#4ade80', width: 1.5, dash: '8,4,2,4' }, C: { a: 573.91, b: -984.34, c: 435.71, d: 4.4767, name: '525-C', color: '#16a34a', width: 2.5, dash: 'none' } }
    };
  }
  return curveSet[cement] ? curveSet[cement][type] : curveSet['42.5']['C'];
}

function calculateStrength(wc, curve) {
  if (!curve) return null;
  if (!Number.isFinite(wc) || wc <= 0) return null;
  let y;
  if (curve.d !== undefined) y = curve.a * Math.pow(wc, 3) + curve.b * Math.pow(wc, 2) + curve.c * wc + curve.d;
  else y = curve.a * Math.pow(wc, 2) + curve.b * wc + curve.c;
  if (!Number.isFinite(y)) return null;
  return Math.max(10, Math.min(70, y));
}

function calculateWc(strength, curve) {
  if (!curve) return null;
  if (!Number.isFinite(strength) || strength <= 0) return null;
  let low = 0.3, high = 0.75;
  const evalCurve = x => (curve.d !== undefined) ? curve.a * Math.pow(x, 3) + curve.b * Math.pow(x, 2) + curve.c * x + curve.d : curve.a * Math.pow(x, 2) + curve.b * x + curve.c;
  const fLow = evalCurve(low), fHigh = evalCurve(high);
  if (strength > fLow || strength < fHigh) return null;
  for (let i = 0; i < 100; i++) { const mid = (low + high) / 2; const fMid = evalCurve(mid); if (fMid > strength) low = mid; else high = mid; }
  return (low + high) / 2;
}

function renderWCChart() {
  const width = 680, height = 400, left = 60, right = 60, top = 20, bottom = 60;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const xMin = 0.3, xMax = 0.75, yMin = 10, yMax = 70;
  const x = val => left + (val - xMin) / (xMax - xMin) * plotWidth;
  const y = val => top + (yMax - val) / (yMax - yMin) * plotHeight;
  const hasAdmixture = data.admixture && data.admixture !== 'none';
  let allCurves;
  if (hasAdmixture) {
    allCurves = [
      { a: 43.589, b: -173.59, c: 124.01, name: '525-C', color: '#16a34a', width: 2.5, dash: 'none' },
      { a: 80.04, b: -207, c: 126.63, name: '525-R', color: '#4ade80', width: 1.5, dash: '8,4,2,4' },
      { a: 119.86, b: -240.12, c: 130.32, name: '425-C', color: '#dc2626', width: 2.5, dash: 'none' },
      { a: 123.42, b: -234.33, c: 122.57, name: '425-R', color: '#f87171', width: 1.5, dash: '6,4' },
      { a: 126.73, b: -228.34, c: 116.36, name: '325-C', color: '#2563eb', width: 2.5, dash: 'none' },
      { a: 107.59, b: -198.24, c: 102.72, name: '325-R', color: '#3b82f6', width: 1.5, dash: 'none' }
    ];
  } else {
    allCurves = [
      { a: 573.91, b: -984.34, c: 435.71, d: 4.4767, name: '525-C', color: '#16a34a', width: 2.5, dash: 'none' },
      { a: 545.45, b: -894.81, c: 369.48, d: 13.818, name: '525-R', color: '#4ade80', width: 1.5, dash: '8,4,2,4' },
      { a: 525.25, b: -817.75, c: 313.6, d: 22.121, name: '425-C', color: '#dc2626', width: 2.5, dash: 'none' },
      { a: 707.07, b: -1087.4, c: 450.57, d: -5.6061, name: '425-R', color: '#f87171', width: 1.5, dash: '2,4' },
      { a: 545.45, b: -823.38, c: 319.24, d: 11.818, name: '325-C', color: '#2563eb', width: 2.5, dash: 'none' },
      { a: 505.05, b: -769.26, c: 305.34, d: 6.9242, name: '325-R', color: '#3b82f6', width: 1.5, dash: 'none' }
    ];
  }
  const activeCurve = getActiveCurve();
  const targetY = getTargetStrength();
  let targetX = null;
  if (targetY !== null && activeCurve) targetX = calculateWc(targetY, activeCurve);
  let grid = '';
  for (let i = 0; i <= 60; i += 5) {
    const val = yMin + i;
    if (val > yMax) break;
    const py = y(val);
    grid += `<line x1="${left}" y1="${py}" x2="${width - right}" y2="${py}" stroke="#d7e0e8" /><text x="${left - 25}" y="${py + 4}" text-anchor="end" font-size="12" fill="#334155">${val}</text>`;
  }
  for (let i = 0; i <= 9; i++) {
    const val = xMin + i * 0.05;
    if (val > xMax + 0.001) break;
    const px = x(val);
    grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${height - bottom}" stroke="#d7e0e8" /><text x="${px}" y="${height - bottom + 20}" text-anchor="middle" font-size="12" fill="#334155">${val.toFixed(2).replace(/\.?0+$/, '')}</text>`;
  }
  let curveLines = '';
  allCurves.forEach(c => {
    let path = '';
    for (let wc = 0.35; wc <= 0.7001; wc += 0.005) {
      const val = (c.d !== undefined) ? (c.a * Math.pow(wc, 3) + c.b * Math.pow(wc, 2) + c.c * wc + c.d) : (c.a * Math.pow(wc, 2) + c.b * wc + c.c);
      path += `${path === '' ? 'M' : 'L'} ${x(wc)} ${y(val)} `;
    }
    curveLines += `<path d="${path}" fill="none" stroke="${c.color}" stroke-width="${c.width}" stroke-dasharray="${c.dash}" />`;
    const labelWc = 0.35;
    const labelVal = (c.d !== undefined) ? (c.a * Math.pow(labelWc, 3) + c.b * Math.pow(labelWc, 2) + c.c * labelWc + c.d) : (c.a * Math.pow(labelWc, 2) + c.b * labelWc + c.c);
    if (labelVal >= 5 && labelVal <= 75) curveLines += `<text x="${x(labelWc)}" y="${y(labelVal) - 5}" font-size="11" fill="${c.color}" font-weight="bold" text-anchor="start">${c.name}</text>`;
  });
  let intersectionLines = '', intersectionText = '';
  if (targetX !== null) {
    const px = x(targetX), py = y(targetY);
    intersectionLines += `<line x1="${left}" y1="${py}" x2="${px}" y2="${py}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${height - bottom}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<circle cx="${px}" cy="${py}" r="4" fill="#dc2626" />`;
    intersectionText = `<div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">${t('misc.wcTargetText')}: <strong>${targetX.toFixed(3)}</strong></div>`;
  } else if (targetY !== null) intersectionText = `<div class="hint" style="margin-top: 15px; text-align: center; color: #b91c1c;">${t('misc.strengthAxis')} ${targetY.toFixed(1)} MPa ${t('misc.outOfRange')}</div>`;
  else intersectionText = `<div class="hint" style="margin-top: 15px; text-align: center; color: #b91c1c;">${t('misc.setTarget')}</div>`;
  let userMarker = '';
  const currentWc = num('wc');
  const currentStrength = calculateStrength(currentWc, activeCurve);
  if (currentStrength !== null && Number.isFinite(currentWc) && currentWc >= xMin && currentWc <= xMax) userMarker = `<circle cx="${x(currentWc)}" cy="${y(currentStrength)}" r="5" fill="#059669" stroke="white" stroke-width="2" />`;
  return `<h3>${t('misc.wcChart')}</h3><div class="table-scroll"><svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:900px;background:white">
<defs><clipPath id="plot-area-clip"><rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" /></clipPath></defs>
${grid}
<line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
<line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
<g clip-path="url(#plot-area-clip)">${curveLines}${intersectionLines}${userMarker}</g>
<text x="${left - 45}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155" transform="rotate(-90 ${left - 45} ${height / 2})">${t('misc.strengthAxis')}</text>
<text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#334155">${t('misc.wcAxis')}</text>
</svg></div>${intersectionText}`;
}

function renderStep1() {
  const activeCurve = getActiveCurve();
  const targetY = getTargetStrength();
  let targetX = null;
  if (targetY !== null && activeCurve) targetX = calculateWc(targetY, activeCurve);

  const isManualStep1 = data.step1Strength !== null && data.step1Strength !== '' && Number(data.step1Strength) > 0;

  if (!isManualStep1 && targetX !== null) {
    if (Math.abs(num('wc') - targetX) > 0.0001) {
      data.wc = Number(targetX.toFixed(3));
      save();
    }
  }

  const wcDisplay = Number.isFinite(Number(data.wc)) ? Number(data.wc).toFixed(3) : '';
  const strengthDisplay = isManualStep1 ? Number(data.step1Strength).toFixed(2) : (targetY !== null ? targetY.toFixed(2) : '');
  const wcLimitActive = data.limitWcOn && Number(data.limitWc) > 0 && Number(data.limitWc) < 1;
  const currentWcNum = num('wc');
  const wcExceeds = wcLimitActive && Number.isFinite(currentWcNum) && currentWcNum > Number(data.limitWc);
  return `
<h2>${t('misc.wcTitle')}</h2>
${wcExceeds ? `<div style="background:#fffbeb; border:1px solid #f59e0b; color:#92400e; padding:12px; border-radius:6px; margin-bottom:15px; font-size:13px;">
<strong>${t('misc.wcLimitWarning')}</strong> (${currentWcNum.toFixed(3)}) ${t('misc.wcLimitWarning2')} (${Number(data.limitWc).toFixed(3)}) ${t('misc.moreThan')}
<div style="display:flex; gap:10px; margin-top:10px;">
<button type="button" id="wc-limit-continue" style="flex:1;">${t('misc.continueBtn')}</button>
<button type="button" id="wc-limit-fix" style="flex:1; background:linear-gradient(180deg,#6b7280,#4b5563);">${t('misc.fixBtn')}</button>
</div></div>` : ''}
<div class="grid" style="margin-bottom: 15px;">
  <label class="field"><span>${t('misc.wcSelected')}</span><input type="text" inputmode="decimal" enterkeyhint="next" data-key="wc" value="${wcDisplay}"></label>
  <label class="field"><span>${t('misc.avgStrength')}</span><input type="text" inputmode="decimal" enterkeyhint="next" data-key="step1Strength" value="${strengthDisplay}"></label>
</div>
${renderWCChart()}
`;
}

function getInterpolatedWaterCurve(isCrushed, slump) {
  const eqs = isCrushed ? {
    S1: { a: 3.2682, b: -56.602, c: 355.02, mid: 25 }, S2: { a: 3.922, b: -68.531, c: 433.0, mid: 70 },
    S3: { a: 4.4766, b: -76.242, c: 473.31, mid: 125 }, S4: { a: 5.0816, b: -84.654, c: 517.28, mid: 185 }
  } : {
    S1: { a: 2.4397, b: -45.811, c: 305.64, mid: 25 }, S2: { a: 2.9217, b: -55.384, c: 372.47, mid: 70 },
    S3: { a: 3.3593, b: -62.257, c: 408.7, mid: 125 }, S4: { a: 3.8367, b: -69.7547, c: 448.22, mid: 185 }
  };
  if (slump <= eqs.S1.mid) return eqs.S1;
  if (slump >= eqs.S4.mid) return eqs.S4;
  if (slump < eqs.S2.mid) { const t = (slump - eqs.S1.mid) / (eqs.S2.mid - eqs.S1.mid); return { a: eqs.S1.a * (1 - t) + eqs.S2.a * t, b: eqs.S1.b * (1 - t) + eqs.S2.b * t, c: eqs.S1.c * (1 - t) + eqs.S2.c * t }; }
  else if (slump < eqs.S3.mid) { const t = (slump - eqs.S2.mid) / (eqs.S3.mid - eqs.S2.mid); return { a: eqs.S2.a * (1 - t) + eqs.S3.a * t, b: eqs.S2.b * (1 - t) + eqs.S3.b * t, c: eqs.S2.c * (1 - t) + eqs.S3.c * t }; }
  else { const t = (slump - eqs.S3.mid) / (eqs.S4.mid - eqs.S3.mid); return { a: eqs.S3.a * (1 - t) + eqs.S4.a * t, b: eqs.S3.b * (1 - t) + eqs.S4.b * t, c: eqs.S3.c * (1 - t) + eqs.S4.c * t }; }
}

function computeWaterFromCurve() {
  const combined = combinedGrading();
  const fm = finenessModulus(combined) || 4.5;
  const activeAggs = data.aggregates.slice(0, data.aggregateCount);
  const avgFracture = activeAggs.length > 0 ? activeAggs.reduce((sum, a) => sum + Number(a.fracture || 0), 0) / activeAggs.length : 0;
  const isCrushed = avgFracture > 0;
  const curve = getInterpolatedWaterCurve(isCrushed, num('slump'));
  const water = curve.a * fm * fm + curve.b * fm + curve.c;
  return { fm, isCrushed, avgFracture, water };
}

function syncWater() {
  const { water } = computeWaterFromCurve();
  if (Number.isFinite(water) && water > 0) data.water = Math.round(water * 10) / 10;
}

function renderWaterChart(fm, waterFromCurve, isCrushed, slump) {
  const width = 680, height = 400, left = 60, right = 60, top = 20, bottom = 60;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const xMin = 3.0, xMax = 8.5, yMin = 100, yMax = 320;
  const x = val => left + (val - xMin) / (xMax - xMin) * plotWidth;
  const y = val => top + (yMax - val) / (yMax - yMin) * plotHeight;
  let baseCurves;
  if (isCrushed) baseCurves = [{ a: 5.0816, b: -84.654, c: 517.28, name: 'S4', color: '#b91c1c' }, { a: 4.4766, b: -76.242, c: 473.31, name: 'S3', color: '#991b1b' }, { a: 3.922, b: -68.531, c: 433.0, name: 'S2', color: '#ec4899' }, { a: 3.2682, b: -56.602, c: 355.02, name: 'S1', color: '#2563eb' }];
  else baseCurves = [{ a: 3.8367, b: -69.7547, c: 448.22, name: 'S4', color: '#b91c1c' }, { a: 3.3593, b: -62.257, c: 408.7, name: 'S3', color: '#991b1b' }, { a: 2.9217, b: -55.384, c: 372.47, name: 'S2', color: '#ec4899' }, { a: 2.4397, b: -45.811, c: 305.64, name: 'S1', color: '#2563eb' }];
  const activeEq = getInterpolatedWaterCurve(isCrushed, slump);
  let grid = '';
  for (let i = 100; i <= 320; i += 20) { const py = y(i); grid += `<line x1="${left}" y1="${py}" x2="${width - right}" y2="${py}" stroke="#d7e0e8" /><text x="${left - 25}" y="${py + 4}" text-anchor="end" font-size="12" fill="#334155">${i}</text>`; }
  for (let i = 3.0; i <= 8.5; i += 0.5) { const px = x(i); grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${height - bottom}" stroke="#d7e0e8" /><text x="${px}" y="${height - bottom + 20}" text-anchor="middle" font-size="12" fill="#334155">${i.toFixed(2)}</text>`; }
  const labelSuffix = isCrushed ? '-C' : '-R';
  let curveLines = '';
  baseCurves.forEach(c => {
    let path = '';
    for (let xv = 3.35; xv <= 8.01; xv += 0.1) { const yv = c.a * xv * xv + c.b * xv + c.c; if (yv < 105) break; path += `${path === '' ? 'M' : 'L'} ${x(xv)} ${y(yv)} `; }
    curveLines += `<path d="${path}" fill="none" stroke="${c.color}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5" />`;
    const labelY = c.a * 3.35 * 3.35 + c.b * 3.35 + c.c;
    if (labelY >= yMin && labelY <= yMax) curveLines += `<text x="${x(3.35)}" y="${y(labelY) - 5}" font-size="12" fill="${c.color}" opacity="0.6" text-anchor="start">${c.name}${labelSuffix}</text>`;
  });
  let interpPath = '';
  for (let xv = 3.35; xv <= 8.01; xv += 0.1) { const yv = activeEq.a * xv * xv + activeEq.b * xv + activeEq.c; if (yv < 105) break; interpPath += `${interpPath === '' ? 'M' : 'L'} ${x(xv)} ${y(yv)} `; }
  curveLines += `<path d="${interpPath}" fill="none" stroke="#059669" stroke-width="4" />`;
  const rightLabelY = activeEq.a * 7.8 * 7.8 + activeEq.b * 7.8 + activeEq.c;
  if (rightLabelY >= yMin && rightLabelY <= yMax) curveLines += `<text x="${x(7.8)}" y="${y(rightLabelY) - 10}" font-size="14" fill="#059669" font-weight="bold" text-anchor="end">S = ${slump}</text>`;
  let intersectionLines = '';
  if (Number.isFinite(fm) && Number.isFinite(waterFromCurve) && fm >= xMin && fm <= xMax && waterFromCurve >= yMin && waterFromCurve <= yMax) {
    const px = x(fm), py = y(waterFromCurve);
    intersectionLines += `<line x1="${left}" y1="${py}" x2="${px}" y2="${py}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${height - bottom}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<circle cx="${px}" cy="${py}" r="5" fill="#dc2626" />`;
  }
  return `<h3>${t('misc.waterChart')}</h3><div class="table-scroll"><svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:900px;background:white">
<defs><clipPath id="water-plot-area"><rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" /></clipPath></defs>
${grid}
<line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
<line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
<g clip-path="url(#water-plot-area)">${curveLines}${intersectionLines}</g>
<text x="${left - 45}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155" transform="rotate(-90 ${left - 45} ${height / 2})">${t('misc.waterAxis')}</text>
<text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#334155">${t('misc.fmAxis')}</text>
</svg></div>`;
}

function renderWater() {
  const { fm, isCrushed, avgFracture, water } = computeWaterFromCurve();
  const reductionPct = Number(data.waterReductionPct) || 0;
  const reduction = (data.admixture !== 'none') ? (water * reductionPct / 100) : 0;
  const calculatedWater = water - reduction;
  const fmt = v => Number.isFinite(v) ? v.toFixed(1) : t('misc.notDefined');
  return `
<h2>${t('misc.waterTitle')}</h2>
${renderWaterChart(fm, water, isCrushed, num('slump'))}
<h3 style="margin-top: 20px;">${t('misc.calcParams')}</h3>
<table><tbody>
<tr><td>1. ${t('misc.fmMixed')}</td><td>${Number.isFinite(fm) ? fm.toFixed(2) : '—'}</td></tr>
<tr><td>2. ${t('misc.slumpSpec')}</td><td>${data.slump} mm</td></tr>
<tr><td>3. ${t('misc.waterCurve')}</td><td>${fmt(water)}</td></tr>
<tr><td>4. ${t('misc.waterReduction')}</td><td><input type="text" inputmode="decimal" enterkeyhint="next" data-key="waterReductionPct" value="${escapeHtml(data.waterReductionPct ?? '')}" ${data.admixture === 'none' ? 'disabled' : ''} style="width: 80px; padding: 4px;"></td></tr>
<tr><td>5. ${t('misc.waterReductionAmt')}</td><td>${fmt(reduction)}</td></tr>
<tr><td>6. ${t('misc.finalWater')}</td><td>${fmt(calculatedWater)}</td></tr>
</tbody></table>
`;
}

function renderCement() {
  const result = new Step4().run();
  const wf = effectiveWater();
  const wc = num('wc');
  const cement = result.cement;
  const softMax = getSoftMaxCement();
  const isLimited = cement > softMax;
  const minActive = data.limitMinCementOn && Number(data.limitMinCement) > 0;
  const maxActive = data.limitMaxCementOn && Number(data.limitMaxCement) > 0;
  let extraC = 0, extraW = 0, wfNew = wf, cNew = cement;
  const factor = Number(data.correctionFactor) || 1.5;
  if (isLimited) { extraC = cement - softMax; extraW = extraC * (factor / 10); wfNew = wf + extraW; cNew = wfNew / wc; }
  const formulaBox = `<div style="display:flex; align-items:center; gap:10px; padding:10px; background:#f8fafc; border-radius:6px; margin-bottom:15px; border:1px solid #e2e8f0; direction:ltr; font-size:13px;">
<span style="font-weight:bold;">C =</span>
<div style="display:flex; flex-direction:column; align-items:center; font-size:11px;"><span style="border-bottom:1px solid #333; padding:0 5px;">Wf</span><span style="padding:0 5px;">W/C</span></div>
<span style="font-weight:bold;">=</span>
<div style="display:flex; flex-direction:column; align-items:center; font-size:11px;"><span style="border-bottom:1px solid #333; padding:0 5px;">${wf.toFixed(2)}</span><span style="padding:0 5px;">${wc.toFixed(3)}</span></div>
<span style="font-weight:bold;">=</span>
<span style="background:#e2e8f0; padding:4px 10px; border-radius:4px; font-weight:bold;">${cement.toFixed(2)}</span>
<span>kg/m³</span></div>`;
  const belowMin = minActive && cement < Number(data.limitMinCement);
  const aboveMax = maxActive && cement > Number(data.limitMaxCement);
  const needsChoice = isLimited || belowMin || aboveMax;
  let contentHtml = '';
  if (!needsChoice) contentHtml = `<div style="background:#ecfdf5; border:1px solid #10b981; color:#065f46; padding:12px; border-radius:6px; text-align:center; font-size:13px;"><strong>${t('misc.cementInRange')}</strong><div style="font-size:11px; margin-top:5px;">(${cement.toFixed(2)} kg/m³)</div></div>`;
  else {
    let reasonHtml = '';
    if (aboveMax) reasonHtml = `<strong>${t('misc.cementAboveMax')}</strong> (${cement.toFixed(2)}) ${t('misc.cementAboveMax2')} (${Number(data.limitMaxCement)}) ${t('misc.cementAboveMax3')}`;
    else if (belowMin) reasonHtml = `<strong>${t('misc.cementBelowMin')}</strong> (${cement.toFixed(2)}) ${t('misc.cementBelowMin2')} (${Number(data.limitMinCement)}) ${t('misc.cementBelowMin3')}`;
    else if (isLimited) reasonHtml = `<strong>${t('misc.cementAboveSoft')}</strong> (${cement.toFixed(2)}) ${t('misc.cementAboveSoft2')} (${softMax}) ${t('misc.cementAboveSoft3')}`;
    contentHtml = `<div style="background:#fffbeb; border:1px solid #f59e0b; color:#92400e; padding:12px; border-radius:6px; font-size:13px;">
${reasonHtml}
${isLimited ? `<div style="background:white; padding:10px; border-radius:6px; margin-top:10px; border:1px solid #fcd34d;">
<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:12px;"><span>${t('misc.corrFactor')}</span><input type="text" inputmode="decimal" data-key="correctionFactor" value="${factor}" style="width:60px; padding:2px 4px; text-align:center; border:1px solid #cbd5e1; border-radius:4px;"></div>
<div style="display:flex; flex-wrap:wrap; gap:8px; font-size:11px; margin-bottom:10px;"><div>${t('misc.extraCement')}: <strong>${extraC.toFixed(2)}</strong> kg</div><div>${t('misc.extraWater')}: <strong>${extraW.toFixed(2)}</strong> kg</div></div>
</div>` : ''}
<div style="display: flex; justify-content: center; width: 100%; margin-top: 15px;">
<select id="cement-action" style="width: 720px; height: 45px; padding: 10px; border-radius: 8px; border: 1px solid #fcd34d; font-family: inherit; font-size: 13px; background: white; color: #92400e; text-align: center; max-width: 100%;">
<option value="" disabled ${data.cementAction === '' ? 'selected' : ''}>${t('misc.chooseAction')}</option>
${isLimited ? `<option value="proceed" ${data.cementAction === 'proceed' ? 'selected' : ''}>${t('misc.proceed')}</option>` : ''}
${isLimited ? `<option value="grading" ${data.cementAction === 'grading' ? 'selected' : ''}>${t('misc.gradingFix')}</option>` : ''}
${isLimited ? `<option value="wc" ${data.cementAction === 'wc' ? 'selected' : ''}>${t('misc.wcFix')}</option>` : ''}
${minActive ? `<option value="min_cement" ${data.cementAction === 'min_cement' ? 'selected' : ''}>${t('misc.acceptMin')}</option>` : ''}
${maxActive ? `<option value="max_cement" ${data.cementAction === 'max_cement' ? 'selected' : ''}>${t('misc.acceptMax')}</option>` : ''}
</select></div></div>`;
  }
  return `<h2>${t('misc.cementTitle')}</h2>${formulaBox}${contentHtml}`;
}

function renderReport() {
  let result = new Step5().run();
  const softMax = getSoftMaxCement();
  const minActive = data.limitMinCementOn && Number(data.limitMinCement) > 0;
  const maxActive = data.limitMaxCementOn && Number(data.limitMaxCement) > 0;
  if (data.cementAction === 'min_cement' && minActive) result = new Step5().run({ cement: Number(data.limitMinCement), water: Number(data.limitMinCement) * num('wc') });
  else if (data.cementAction === 'max_cement' && maxActive) result = new Step5().run({ cement: Number(data.limitMaxCement), water: Number(data.limitMaxCement) * num('wc') });
  else if (result.cement > softMax && data.cementAction === 'proceed') {
    const factor = Number(data.correctionFactor) || 1.5;
    const extraC = result.cement - softMax;
    const extraW = extraC * (factor / 10);
    result = new Step5().run({ water: result.water + extraW, cement: (result.water + extraW) / num('wc') });
  }
  const c = result.cement, w = result.water;
  const air = data.air / 100;
  const totalDry = result.dryGravel + result.drySand;
  const totalWater = w + (result.ssdSand - result.drySand) + (result.ssdGravel - result.dryGravel);
  const finalDensity = c + totalWater + totalDry;
  const Vassd = result.aggregateVolume;

  const formulaHtml = `
<div style="text-align: center; direction: ltr; margin-bottom: 12px; font-family: monospace; white-space: nowrap; overflow-x: auto; background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #cbd5e1; display:flex; justify-content:flex-start; align-items:center;">
  <span style="font-size: 12px; margin-right: 8px;">VAssd = 1 - (</span>
  <div style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 2px; font-size:10px;"><span style="border-bottom:1px solid #333; padding:0 4px;">${c.toFixed(2)}</span><span style="padding:0 4px;">${(1000 * data.sgCement).toFixed(0)}</span></div>
  <span style="font-size: 12px;"> + </span>
  <div style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 2px; font-size:10px;"><span style="border-bottom:1px solid #333; padding:0 4px;">${w.toFixed(2)}</span><span style="padding:0 4px;">1000</span></div>
  <span style="font-size: 12px;"> + </span>
  <div style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 2px; font-size:10px;"><span style="border-bottom:1px solid #333; padding:0 4px;">${result.admixtureMass.toFixed(2)}</span><span style="padding:0 4px;">${(1000 * (Number(data.sgAdmixture) || 1.1)).toFixed(0)}</span></div>
  <span style="font-size: 12px;"> + </span>
  <div style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 2px; font-size:10px;"><span style="border-bottom:1px solid #333; padding:0 4px;">${air.toFixed(2)}</span><span style="padding:0 4px;">1</span></div>
  <span style="font-size: 12px;"> ) = ${Vassd.toFixed(3)} m³</span>
</div>`;

  const r = t('report');
  return `<div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1;">
<h2 style="text-align: center; color: #1e293b; margin-bottom: 20px; font-size: 18px;">${t('reportTitle')}</h2>
<div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); overflow-x:auto;">
${formulaHtml}
</div>
<div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
<h3 style="font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">${r.aggregatesInM3}</h3>
<table><thead><tr><th>${r.parameter}</th><th>${r.aggregate1}</th><th>${r.aggregate2}</th></tr></thead><tbody>
<tr><td>${r.sgSSD}</td><td>${data.sgSand.toFixed(2)}</td><td>${data.sgGravel.toFixed(2)}</td></tr>
<tr><td>${r.waterAbs}</td><td>${data.waterAbsSand}</td><td>${data.waterAbsGravel}</td></tr>
<tr><td>${r.fracture}</td><td>${data.aggregates[0].fracture || 0}</td><td>${data.aggregates[1] ? data.aggregates[1].fracture || 0 : 0}</td></tr>
<tr><td>${r.share}</td><td>${(result.sandFrac * 100).toFixed(1)}</td><td>${(result.gravelFrac * 100).toFixed(1)}</td></tr>
<tr><td>${r.volumeM3}</td><td>${result.sandVolume.toFixed(3)}</td><td>${result.gravelVolume.toFixed(3)}</td></tr>
<tr><td>${r.massSSD}</td><td>${result.ssdSand.toFixed(0)}</td><td>${result.ssdGravel.toFixed(0)}</td></tr>
<tr><td>${r.dryMass}</td><td>${result.drySand.toFixed(0)}</td><td>${result.dryGravel.toFixed(0)}</td></tr>
</tbody></table></div>
<div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
<h3 style="font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">${r.finalSummary}</h3>
<div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px;">
<div style="background: #f1f5f9; padding: 10px; border-radius: 6px; flex: 1; min-width: 120px; text-align: center;"><div style="font-size: 11px; color: #64748b;">${r.totalWater}</div><strong style="font-size: 16px;">${totalWater.toFixed(0)} kg/m³</strong></div>
<div style="background: #f1f5f9; padding: 10px; border-radius: 6px; flex: 1; min-width: 120px; text-align: center;"><div style="font-size: 11px; color: #64748b;">${r.dryMassAd}</div><strong style="font-size: 16px;">${totalDry.toFixed(0)} kg/m³</strong></div>
<div style="background: #e0f2fe; padding: 10px; border-radius: 6px; flex: 1; min-width: 120px; text-align: center; border: 1px solid #bae6fd;"><div style="font-size: 11px; color: #0369a1;">${r.finalDensity}</div><strong style="font-size: 16px; color: #0284c7;">${finalDensity.toFixed(0)} kg/m³</strong></div>
</div></div>
<div style="margin-top: 15px; text-align: center; font-size: 9px; color: #1e293b; direction: ltr; font-family: monospace;">
${r.gammaSSD} = ${result.drySand.toFixed(0)} + ${result.dryGravel.toFixed(0)} + ${c.toFixed(0)} + ${totalWater.toFixed(0)} = <strong>${finalDensity.toFixed(0)} kg/m³</strong>
</div>
</div>`;
}

const TEXT_KEYS = new Set(['slumpClass', 'cementClass', 'admixture', 'targetMethod', 'workshopRank', 'projectName']);

function view() {
  const tabs = document.getElementById('tabs');
  const screen = document.getElementById('screen');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  if (!tabs || !screen || !prev || !next) { console.error('Main elements not found'); return; }
  
  const titlesCurrent = t('tabs');
  tabs.innerHTML = titlesCurrent.map((title, i) => `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''}">${title}</button>`).join('');
  
  prev.textContent = t('btnPrev');
  next.textContent = t('btnNext');

  let html = '';
  try {
    switch (page) {
      case 0: html = renderHome(); break;
      case 1: html = renderAggregateTable(); break;
      case 2: html = renderShares(); break;
      case 3: html = renderStep1(); break;
      case 4: html = renderWater(); break;
      case 5: html = renderCement(); break;
      case 6: html = renderReport(); break;
      default: html = renderHome();
    }
  } catch (error) { console.error(error); html = `<p class="bad">${escapeHtml(error.message)}</p>`; }
  screen.innerHTML = `<article class="panel" dir="${isFa() ? 'rtl' : 'ltr'}" style="text-align: ${isFa() ? 'right' : 'left'};">${html}</article>`;
  document.querySelectorAll('[data-page]').forEach(button => { button.onclick = () => { page = Number(button.dataset.page); view(); }; });
  const wcContinueBtn = document.getElementById('wc-limit-continue');
  const wcFixBtn = document.getElementById('wc-limit-fix');
  if (wcContinueBtn) wcContinueBtn.onclick = () => { data.wcContinueWithExcess = true; save(); page = 4; view(); };
  if (wcFixBtn) wcFixBtn.onclick = () => {
    data.wcContinueWithExcess = false;
    data.wc = Number(data.limitWc);
    const y = calculateStrength(num('wc'), getActiveCurve());
    if (y !== null) data.step1Strength = y;
    save(); view();
  };
  document.querySelectorAll('[data-key]').forEach(element => {
    element.onchange = () => {
      const key = element.dataset.key;
      const oldState = { value: data[key], slump: data.slump, admixturePct: data.admixturePct, waterReductionPct: data.waterReductionPct, wc: data.wc, step1Strength: data.step1Strength, targetStrengthManual: data.targetStrengthManual, targetMethod: data.targetMethod, wcContinueWithExcess: data.wcContinueWithExcess };
      const rawVal = element.value;
      let value;
      if (rawVal === '') value = '';
      else if (TEXT_KEYS.has(key)) value = rawVal;
      else if (key === 'waterReductionPct') value = rawVal;
      else value = Number(rawVal);
      data[key] = value;
      try {
        if (key === 'aggregateCount') { const count = Number(value); if (![2, 3, 4].includes(count)) throw Error(t('misc.validation.invalidCount')); data.aggregateCount = count; }
        if (key === 'slumpClass') { const range = slumpRange(); if (num('slump') < range.min || num('slump') > range.max) data.slump = range.min; syncWater(); }
        if (key === 'slump') { const r = slumpRange(); const v = Number(data.slump); if (!Number.isFinite(v) || v < r.min || v > r.max) throw Error(`${t('misc.validation.slumpRange')} ${r.min} ${t('misc.validation.and')} ${r.max}`); }
        if (key === 'admixture') { if (value === 'none') data.waterReductionPct = ''; else { if (data.admixturePct === '' || data.admixturePct == null) data.admixturePct = 0; if (data.sgAdmixture === '' || data.sgAdmixture == null) data.sgAdmixture = 1.1; } }
        if (key === 'wc') { const y = calculateStrength(num('wc'), getActiveCurve()); if (y !== null) data.step1Strength = y; validate(); }
        else if (key === 'step1Strength') { const x = calculateWc(num('step1Strength'), getActiveCurve()); if (x !== null) data.wc = x; validate(); }
        else if (key === 'targetStrengthManual') { const x = calculateWc(num('targetStrengthManual'), getActiveCurve()); if (x !== null) data.wc = x; data.targetMethod = 'manual'; data.step1Strength = null; validate(); }
        else if (['cementClass', 'admixture', 'admixturePct', 'slump'].includes(key)) { const target = getTargetStrength(); if (target !== null) { const newWc = calculateWc(target, getActiveCurve()); if (newWc !== null) data.wc = newWc; } syncWater(); }
        else if (key === 'waterReductionPct') { if (value !== '') { const rp = Number(value); if (!Number.isFinite(rp) || rp < 0 || rp >= 100) throw Error(t('misc.validation.waterRedRange')); } validate(); }
        else if (['targetMethod', 'workshopRank', 'aggregateCount', 'correctionFactor', 'sgAdmixture', 'projectName'].includes(key)) { /* بدون validate */ }
        else validate();
        if (key === 'wc' && data.limitWcOn) { const mx = Number(data.limitWc); if (Number.isFinite(mx) && Number(data.wc) <= mx) data.wcContinueWithExcess = false; }
        save(); view();
      } catch (error) {
        data[key] = oldState.value; data.slump = oldState.slump; data.admixturePct = oldState.admixturePct; data.waterReductionPct = oldState.waterReductionPct; data.wc = oldState.wc; data.step1Strength = oldState.step1Strength; data.targetStrengthManual = oldState.targetStrengthManual; data.targetMethod = oldState.targetMethod; data.wcContinueWithExcess = oldState.wcContinueWithExcess;
        view(); alert(error.message);
      }
    };
    element.oninput = (e) => {
      let val = e.target.value;
      if (!val) return;
      const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      const en = ['0','1','2','3','4','5','6','7','8','9'];
      for (let i = 0; i < 10; i++) val = val.replace(new RegExp(fa[i], 'g'), en[i]).replace(new RegExp(ar[i], 'g'), en[i]);
      if (e.target.value !== val) e.target.value = val;
    };
  });
  document.querySelectorAll('[data-check]').forEach(element => {
    element.onchange = () => {
      const key = element.dataset.check;
      const oldValue = data[key];
      if (key === 'limitMinCementOn' && element.checked) data.limitMaxCementOn = false;
      if (key === 'limitMaxCementOn' && element.checked) data.limitMinCementOn = false;
      data[key] = element.checked;
      try { validate(); save(); view(); } catch (error) { data[key] = oldValue; view(); alert(error.message); }
    };
  });
  document.querySelectorAll('[data-agg]').forEach(element => {
    element.onchange = () => {
      const index = Number(element.dataset.agg), field = element.dataset.aggField, sieveIndex = Number(element.dataset.sieve);
      const aggregate = data.aggregates[index];
      let oldValue;
      if (field === 'name') { oldValue = aggregate.name; aggregate.name = element.value; }
      else if (field === 'fracture') { oldValue = aggregate.fracture; aggregate.fracture = element.value === '' ? '' : Number(element.value); }
      else if (field === 'sg' || field === 'waterAbs') { oldValue = aggregate[field]; aggregate[field] = element.value === '' ? '' : Number(element.value); }
      else { oldValue = aggregate.passing[sieveIndex]; aggregate.passing[sieveIndex] = element.value === '' ? '' : Number(element.value); }
      try { validateAggregates(); syncWater(); save(); } catch (error) {
        if (field === 'name') aggregate.name = oldValue;
        else if (field === 'fracture') aggregate.fracture = oldValue;
        else if (field === 'sg' || field === 'waterAbs') aggregate[field] = oldValue;
        else aggregate.passing[sieveIndex] = oldValue;
        alert(error.message);
      }
    };
    element.onkeydown = (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const aggIdx = Number(element.dataset.agg), field = element.dataset.aggField;
      let nextInput = null;
      if (field === 'name') nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-agg-field="sg"]`);
      else if (field === 'sg') nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-agg-field="waterAbs"]`);
      else if (field === 'waterAbs') nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-agg-field="fracture"]`);
      else if (field === 'fracture') nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-sieve="0"]`);
      else { const columnInputs = Array.from(document.querySelectorAll(`[data-agg="${aggIdx}"][data-sieve]`)); const currentIdx = columnInputs.indexOf(element); if (currentIdx !== -1 && currentIdx < columnInputs.length - 1) nextInput = columnInputs[currentIdx + 1]; else nextInput = document.querySelector(`[data-agg="${aggIdx + 1}"][data-agg-field="name"]`); }
      if (nextInput) { nextInput.focus(); nextInput.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    };
    element.oninput = (e) => {
      let val = e.target.value;
      if (!val) return;
      const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      const en = ['0','1','2','3','4','5','6','7','8','9'];
      for (let i = 0; i < 10; i++) val = val.replace(new RegExp(fa[i], 'g'), en[i]).replace(new RegExp(ar[i], 'g'), en[i]);
      if (e.target.value !== val) e.target.value = val;
    };
  });
  document.querySelectorAll('[data-share]').forEach(element => {
    element.onchange = () => {
      const index = Number(element.dataset.share), raw = element.value, value = raw === '' ? '' : Number(raw);
      if (value !== '' && (!Number.isFinite(value) || value < 0 || value > 100)) { alert(t('misc.validation.shareRange')); return; }
      data.aggregateShares[index] = value;
      syncWater(); save(); view();
      setTimeout(() => { const newEl = document.querySelector(`[data-share="${index}"]`); if (newEl) { newEl.focus(); newEl.select(); } }, 10);
    };
    element.oninput = (e) => {
      let val = e.target.value;
      if (!val) return;
      const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
      const en = ['0','1','2','3','4','5','6','7','8','9'];
      for (let i = 0; i < 10; i++) val = val.replace(new RegExp(fa[i], 'g'), en[i]).replace(new RegExp(ar[i], 'g'), en[i]);
      if (e.target.value !== val) e.target.value = val;
    };
  });
  document.querySelectorAll('[data-curve-aggregate]').forEach(element => {
    element.onchange = () => { const index = Number(element.dataset.curveAggregate); data.showAggregateCurves[index] = element.checked; save(); view(); };
  });
  const mixCheckbox = document.querySelector('[data-curve-mix]');
  if (mixCheckbox) mixCheckbox.onchange = () => { data.showMixCurve = mixCheckbox.checked; save(); view(); };
  const referenceCheckbox = document.querySelector('[data-curve-reference]');
  if (referenceCheckbox) referenceCheckbox.onchange = () => { data.showReferenceCurves = referenceCheckbox.checked; save(); view(); };
  const printButton = document.getElementById('print');
  if (printButton) printButton.onclick = () => window.print();
  const cementAction = document.getElementById('cement-action');
  if (cementAction) {
    cementAction.onchange = (e) => {
      const val = e.target.value;
      data.cementAction = val;
      save();
      if (val === 'grading') page = 2; else if (val === 'wc') page = 3;
      view();
    };
  }
  let wcBlocked = false;
  if (page === 3 && data.limitWcOn && Number(data.limitWc) > 0 && Number(data.limitWc) < 1) {
    const currentWc = num('wc'), maxWc = Number(data.limitWc);
    if (Number.isFinite(currentWc) && currentWc > maxWc && !data.wcContinueWithExcess) wcBlocked = true;
  }
  prev.disabled = page === 0;
  if (page === 3 && wcBlocked) next.disabled = true;
  else {
    try {
      if (page === 5) {
        const result = new Step4().run();
        const cement = result.cement;
        const softMax = getSoftMaxCement();
        const minActive = data.limitMinCementOn && Number(data.limitMinCement) > 0;
        const maxActive = data.limitMaxCementOn && Number(data.limitMaxCement) > 0;
        const isLimited = cement > softMax;
        const belowMin = minActive && cement < Number(data.limitMinCement);
        const aboveMax = maxActive && cement > Number(data.limitMaxCement);
        const needsChoice = isLimited || belowMin || aboveMax;
        const allowedActions = new Set();
        if (isLimited) allowedActions.add('proceed');
        if (minActive) allowedActions.add('min_cement');
        if (maxActive) allowedActions.add('max_cement');
        if (needsChoice && !allowedActions.has(data.cementAction)) next.disabled = true;
        else next.disabled = page === titles.length - 1;
      } else next.disabled = page === titles.length - 1;
    } catch (_) { next.disabled = false; }
  }
}

function injectWindowsTheme() {
  const style = document.createElement('style');
  style.innerHTML = `:root {
  --primary: #0067c0;
  --primary-hover: #1976d2;
  --accent: #0078d4;
  --border: #d6dbe1;
  --border-strong: #b8c0ca;
  --text: #1a1a1a;
  --text-muted: #5b6570;
  --bg-soft: #f4f7fb;
  --bg-card: #ffffff;
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-sm: 0 2px 6px rgba(15, 35, 70, 0.08);
  --shadow-md: 0 8px 24px rgba(15, 35, 70, 0.12);
  --shadow-lg: 0 20px 48px rgba(15, 35, 70, 0.18);
}
* { box-sizing: border-box; touch-action: pan-x pan-y pinch-zoom; }
body {
  font-family: 'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
  background:
    radial-gradient(circle at 15% 10%, rgba(0, 120, 212, 0.18), transparent 45%),
    radial-gradient(circle at 85% 90%, rgba(99, 102, 241, 0.16), transparent 50%),
    linear-gradient(135deg, #eaf1fb 0%, #dfe8f5 100%);
  background-attachment: fixed;
  color: var(--text);
  margin: 0;
  padding: 24px 16px;
  direction: ${isFa() ? 'rtl' : 'ltr'};
  min-height: 100vh;
}
#app {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 1120px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
  outline: 1px solid rgba(0, 120, 212, 0.08);
}
#tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: linear-gradient(180deg, rgba(240, 245, 252, 0.95), rgba(228, 236, 246, 0.85));
  border-bottom: 1px solid var(--border);
  gap: 4px;
  padding: 10px 10px 0 10px;
}
#tabs button {
  background: transparent;
  border: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  padding: 10px 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: inherit;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
}
#tabs button:hover { background: rgba(255, 255, 255, 0.7); color: var(--primary); }
#tabs button.active {
  background: #ffffff;
  color: var(--primary);
  border-bottom: 3px solid var(--primary);
  box-shadow: 0 -2px 10px rgba(0, 120, 212, 0.08);
}
.panel { padding: 22px; }
.grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.field {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  background: var(--bg-soft);
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 11px;
  white-space: nowrap;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.15); }
.field > span { flex-shrink: 0; max-width: 130px; overflow: hidden; text-overflow: ellipsis; }
input[type="number"], input[type="text"], select {
  width: ${isFa() ? '150px' : '120px'} !important;
  padding: 6px 8px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-family: 'Segoe UI', Arial, sans-serif !important;
  font-size: 12px;
  background: #fff;
  text-align: center;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input[type="number"]:focus, input[type="text"]:focus, select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.15);
}
input.table-input[type="text"] { width: 75px !important; text-align: right; }
button {
  background: linear-gradient(180deg, var(--primary), var(--primary-hover));
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s;
}
button:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); filter: brightness(1.05); }
button:active { transform: translateY(0); box-shadow: var(--shadow-sm); }
button:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; filter: none; }
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}
th, td { border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); padding: 9px; text-align: right; font-size: 12px; }
th:last-child, td:last-child { border-right: none; }
tr:last-child td { border-bottom: none; }
th { background: linear-gradient(180deg, #eef3fa, #e3eaf3); font-weight: 600; color: #2a3542; }
tr:nth-child(even) td { background: #fafcff; }
tr:hover td { background: #eef6ff; }

.aggregate-table {
  overflow: visible !important;
  border-radius: 0;
}
.aggregate-table th:first-child {
  position: sticky;
  ${isFa() ? 'right' : 'left'}: 0;
  background: linear-gradient(180deg, #eef3fa, #e3eaf3);
  z-index: 10;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.06);
}
.aggregate-table td:first-child {
  position: sticky;
  ${isFa() ? 'right' : 'left'}: 0;
  background: #f8fafc;
  z-index: 9;
  font-weight: 600;
  box-shadow: -2px 0 6px rgba(0, 0, 0, 0.04);
}
.aggregate-table tr:nth-child(even) td:first-child { background: #eef3fa; }
.aggregate-table tr:hover td:first-child { background: #e0ecff; }

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
h2 { color: var(--primary); border-bottom: 2px solid rgba(0, 120, 212, 0.15); padding-bottom: 8px; }
h3 { color: #334155; }
.limit-box {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
.hint { color: var(--text-muted); font-size: 12px; }
.bad { color: #b91c1c; background: #fef2f2; padding: 12px; border-radius: var(--radius-md); border: 1px solid #fecaca; }
.checkline { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
@media (max-width: 600px) {
  body { padding: 12px 6px; }
  #tabs button { font-size: 11px; padding: 8px 2px; }
  .panel { padding: 12px; }
  .field { width: 100%; justify-content: space-between; }
  .field > span { max-width: none; }
}`;
  document.head.appendChild(style);
}

function startApp() {
  injectWindowsTheme();
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  if (!prev || !next) { console.error('Navigation buttons not found'); return; }
  prev.onclick = () => { page = Math.max(0, page - 1); view(); };
  next.onclick = () => { page = Math.min(titles.length - 1, page + 1); view(); };
  if (data.admixture === 'none' && data.admixturePct == null) data.admixturePct = 0;
  syncWater();
  save();
  view();
}

function showSplash() {
  if (document.getElementById('splash-screen')) return;
  const splash = document.createElement('div');
  splash.id = 'splash-screen';
  splash.innerHTML = `
    <div class="splash-card">
      <div class="splash-title">${t('appTitle')}</div>
      <div class="splash-sub">${t('appSub')}</div>
      <div class="splash-divider"></div>
      <div class="splash-credit">${t('credit')}: <strong>${t('misc.author')}</strong></div>
      <div class="splash-email">talkhestan@gmail.com</div>
      <div class="splash-spinner"></div>
    </div>
  `;
  document.body.appendChild(splash);
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #splash-screen {
      position: fixed; inset: 0; z-index: 999999;
      background: radial-gradient(circle at 20% 20%, #1e3a8a, #0b1220 70%);
      display: flex; align-items: center; justify-content: center;
      direction: ${isFa() ? 'rtl' : 'ltr'};
      animation: splashIn 0.4s ease;
    }
    #splash-screen.fade-out { animation: splashOut 0.5s ease forwards; }
    .splash-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 24px;
      padding: 42px 52px;
      text-align: center;
      color: #e5edff;
      backdrop-filter: blur(14px);
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      animation: splashCardIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .splash-title { font-size: 26px; font-weight: 800; letter-spacing: 1px;
      background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
      -webkit-background-clip: text; background-clip: text; color: transparent; }
    .splash-sub { font-size: 12px; color: #93a4c4; margin-top: 6px; letter-spacing: 2px; }
    .splash-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); margin: 20px 0; }
    .splash-credit { font-size: 14px; color: #dbe6ff; }
    .splash-credit strong { color: #93c5fd; }
    .splash-email { font-size: 12px; color: #7dd3fc; margin-top: 6px; direction: ltr; }
    .splash-spinner {
      width: 32px; height: 32px; margin: 22px auto 0;
      border: 3px solid rgba(255,255,255,0.15);
      border-top-color: #60a5fa;
      border-radius: 50%;
      animation: splashSpin 0.9s linear infinite;
    }
    @keyframes splashSpin { to { transform: rotate(360deg); } }
    @keyframes splashIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes splashOut { to { opacity: 0; visibility: hidden; } }
    @keyframes splashCardIn {
      from { opacity: 0; transform: scale(0.9) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => splash.remove(), 520);
  }, 4000);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn(t('misc.swError'), error));
  });
}

/* ============================================================
   Print function
   ============================================================ */
async function printFullReport() {
  let step5 = null;
  try { step5 = new Step5().run(); } catch (err) { step5 = null; }
  const target = targetCalculations();
  const combined = combinedGrading();
  const fm = finenessModulus(combined);
  const waterCalc = computeWaterFromCurve();
  const activeCurve = getActiveCurve();
  const targetStrength = getTargetStrength();
  const sharesInfo = getSharesInfo();

  const fileNameRaw = prompt(
    t('reportFileNamePrompt'),
    data.reportFileName || (data.projectName ? data.projectName : t('reportDefaultName'))
  );
  if (fileNameRaw === null) return;
  const reportFileName = fileNameRaw.trim() || t('reportDefaultName');
  data.reportFileName = reportFileName;
  save();

  const gradingSvg = renderGradingChart(combined)
    .replace(/<h3>.*?<\/h3>/, '')
    .replace(/<div class="table-scroll">/, '')
    .replace(/<\/div>$/, '');

  const wcSvg = renderWCChart()
    .replace(/<h3>.*?<\/h3>/, '')
    .replace(/<div class="table-scroll">/, '')
    .replace(/<\/div>[\s\S]*$/, '');

  const waterSvg = renderWaterChart(waterCalc.fm, waterCalc.water, waterCalc.isCrushed, num('slump'))
    .replace(/<h3>.*?<\/h3>/, '')
    .replace(/<div class="table-scroll">/, '')
    .replace(/<\/div>$/, '');

  const fmt = (v, d = 2) => Number.isFinite(v) ? Number(v).toFixed(d) : '—';

  const aggRows = data.aggregates.slice(0, data.aggregateCount).map((a, i) => `
    <tr>
      <td>${escapeHtml(a.name)}</td>
      <td>${fmt(a.sg)}</td>
      <td>${fmt(a.waterAbs)}</td>
      <td>${fmt(a.fracture)}</td>
      <td>${sharesInfo.shares[i] ?? '—'}</td>
    </tr>`).join('');

  const c = step5 ? step5.cement : null;
  const w = step5 ? step5.water : null;
  const drySand = step5 ? step5.drySand : null;
  const dryGravel = step5 ? step5.dryGravel : null;
  const ssdSand = step5 ? step5.ssdSand : null;
  const ssdGravel = step5 ? step5.ssdGravel : null;
  const admMass = step5 ? step5.admixtureMass : 0;

  const projectName = (data.projectName || '').trim();
  const docTitle = projectName ? `${t('reportTitle')} — ${projectName}` : t('reportTitle');
  const today = new Date().toLocaleDateString(isFa() ? 'fa-IR' : 'en-US');

  const r = t('report');
  const html = `<!DOCTYPE html>
<html lang="${currentLang}" dir="${isFa() ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(docTitle)}</title>
<style>
  @page { size: A4 portrait; margin: 5mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; height: 100%; }
  body {
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    font-size: 10.5px;
    color: #111;
    direction: ${isFa() ? 'rtl' : 'ltr'};
    line-height: 1.35;
    position: relative;
  }

  .sheet {
    padding: 2mm 3mm;
    min-height: 287mm;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }
  .sheet > * { position: relative; z-index: 1; }

  .header {
    border-bottom: 1.5px solid #0078d4;
    padding-bottom: 4px;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    background: rgba(255,255,255,0.55);
  }
  .header-title { font-size: 15px; font-weight: bold; color: #0078d4; }
  .header-info { font-size: 9px; text-align: left; line-height: 1.4; }
  .header-info div { margin-bottom: 1px; }

  h2 {
    font-size: 11px;
    background: rgba(238,242,247,0.6);
    padding: 3px 8px;
    border-${isFa() ? 'right' : 'left'}: 3px solid #0078d4;
    margin: 6px 0 4px;
    font-weight: bold;
  }

  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9.5px; background: rgba(255,255,255,0.6); }
  th, td { border: 0.6px solid #999; padding: 2.5px 5px; text-align: ${isFa() ? 'right' : 'left'}; line-height: 1.25; }
  th { background: rgba(226,232,240,0.7); font-weight: bold; font-size: 9.5px; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex: 1 1 auto; }
  .two-col > div { display: flex; flex-direction: column; }
  .two-col .chart-box { flex: 1 1 auto; display: flex; align-items: center; justify-content: center; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; }

  .chart-box {
    border: 0.6px solid #bbb;
    padding: 3px;
    page-break-inside: avoid;
    background: rgba(255,255,255,0.6);
  }
  .chart-box svg { width: 100%; height: auto; display: block; background: transparent; }

  .result-card {
    background: rgba(241,245,249,0.6);
    border: 0.6px solid #cbd5e1;
    padding: 4px;
    border-radius: 3px;
    text-align: center;
    font-size: 9px;
  }
  .result-card .label { font-size: 8px; color: #555; }
  .result-card .value { font-size: 11.5px; font-weight: bold; color: #0078d4; }

  .footer {
    margin-top: auto;
    padding-top: 4px;
    text-align: center;
    font-size: 8px;
    color: #666;
    border-top: 0.6px solid #ccc;
    background: rgba(255,255,255,0.55);
  }
</style>
</head>
<body>

<div class="sheet">

  <div class="header">
    <div class="header-title">${escapeHtml(docTitle)}</div>
    <div class="header-info">
      <div><strong>${r.headerDate}:</strong> ${today}</div>
      <div><strong>${r.headerFile}:</strong> ${escapeHtml(reportFileName)}</div>
    </div>
  </div>

  <h2>${r.sec1}</h2>
  <table>
    <tr>
      <th>${r.charStrength}</th><td>${fmt(num('strength'), 1)} MPa</td>
      <th>${r.slumpClass}</th><td>${data.slumpClass}</td>
      <th>${r.slump}</th><td>${data.slump} mm</td>
      <th>${r.nmsa}</th><td>${data.msa} mm</td>
    </tr>
    <tr>
      <th>${r.cementClass}</th><td>${data.cementClass}</td>
      <th>${r.air}</th><td>${fmt(num('air'), 1)}%</td>
      <th>${r.admixture}</th><td>${data.admixture === 'none' ? r.none : data.admixture}</td>
      <th>${r.admixturePct}</th><td>${fmt(num('admixturePct'), 1)}%</td>
    </tr>
  </table>

  <h2>${r.sec2}</h2>
  <table>
    <tr>
      <th>${r.workshopRank}</th><td>${data.workshopRank}</td>
      <th>S</th><td>${target ? fmt(target.S) + ' MPa' : '—'}</td>
      <th>fcm1</th><td>${target ? fmt(target.fcm1) : '—'}</td>
      <th>fcm2</th><td>${target ? fmt(target.fcm2) : '—'}</td>
      <th>${r.target}</th><td><strong>${targetStrength ? fmt(targetStrength) + ' MPa' : '—'}</strong></td>
    </tr>
  </table>

  <h2>${r.sec3}</h2>
  <table>
    <tr><th>${r.name}</th><th>${r.sg}</th><th>${r.waterAbs}</th><th>${r.fracture}</th><th>${r.share}</th></tr>
    ${aggRows}
  </table>

  <div class="two-col">
    <div>
      <h2>${r.sec4} (F.M. = ${fmt(fm)})</h2>
      <div class="chart-box">${gradingSvg}</div>
    </div>
    <div>
      <h2>${r.sec5} (W/C = ${fmt(num('wc'), 3)})</h2>
      <div class="chart-box">${wcSvg}</div>
    </div>
  </div>

  <div class="two-col" style="margin-top:6px;">
    <div>
      <h2>${r.sec6} (F.M. = ${fmt(waterCalc.fm)})</h2>
      <div class="chart-box">${waterSvg}</div>
    </div>
    <div>
      <h2>${r.sec7}</h2>
      <div class="three-col" style="margin-bottom:4px;">
        <div class="result-card"><div class="label">${r.cement}</div><div class="value">${fmt(c, 1)} kg</div></div>
        <div class="result-card"><div class="label">${r.effectiveWater}</div><div class="value">${fmt(w, 1)} kg</div></div>
        <div class="result-card"><div class="label">${r.admixtureLabel}</div><div class="value">${fmt(admMass, 2)} kg</div></div>
      </div>
      <div class="three-col" style="margin-bottom:4px;">
        <div class="result-card"><div class="label">${r.sandSSD}</div><div class="value">${fmt(ssdSand, 0)} kg</div></div>
        <div class="result-card"><div class="label">${r.gravelSSD}</div><div class="value">${fmt(ssdGravel, 0)} kg</div></div>
        <div class="result-card"><div class="label">${r.totalDry}</div><div class="value">${step5 ? fmt(step5.drySand + step5.dryGravel, 0) : '—'} kg</div></div>
      </div>
      <table>
        <tr><th>${r.parameter}</th><th>${r.value}</th></tr>
        <tr><td>${r.cementC}</td><td>${fmt(c, 2)} kg/m³</td></tr>
        <tr><td>${r.waterW}</td><td>${fmt(w, 2)} kg/m³</td></tr>
        <tr><td>${r.sandSSD2}</td><td>${fmt(ssdSand, 1)} kg/m³</td></tr>
        <tr><td>${r.gravelSSD2}</td><td>${fmt(ssdGravel, 1)} kg/m³</td></tr>
        <tr><td>${r.sandDry}</td><td>${fmt(drySand, 1)} kg/m³</td></tr>
        <tr><td>${r.gravelDry}</td><td>${fmt(dryGravel, 1)} kg/m³</td></tr>
        <tr><td>${r.admixtureLabel2}</td><td>${fmt(admMass, 2)} kg/m³</td></tr>
        <tr><td>${r.aggVolume}</td><td>${step5 ? fmt(step5.aggregateVolume, 3) : '—'} m³</td></tr>
      </table>
    </div>
  </div>

  <div class="footer">
    ${today}${projectName ? ' | ' + escapeHtml(projectName) : ''} | ${escapeHtml(reportFileName)}
  </div>

</div>
</body>
</html>`;

  try {
    const PrinterPlugin = window.Capacitor?.Plugins?.Printer;
    if (PrinterPlugin && typeof PrinterPlugin.print === 'function') {
      await PrinterPlugin.print({
        content: html,
        name: reportFileName,
        orientation: 'portrait'
      });
      return;
    }
    alert(t('misc.printNotAvailable'));
  } catch (error) {
    console.error(t('misc.printError'), error);
    alert(t('misc.printError') + (error.message || error));
  }
}

function showGuideReport() {
  if (document.getElementById('guide-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'guide-overlay';
  overlay.style.cssText = `position: fixed; inset: 0; z-index: 9999999; background: white;`;
  const iframe = document.createElement('iframe');
  iframe.src = './guide-viewer.html';
  iframe.title = 'راهنمای برنامه';
  iframe.style.cssText = `width: 100%; height: 100%; border: none; display: block;`;
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);
}
window.closeGuideViewer = function() {
  const overlay = document.getElementById('guide-overlay');
  if (overlay) overlay.remove();
};

function initNewMenu() {
  const menuHTML = `<div id="app-options-menu" style="position: fixed; top: 15px; left: 15px; z-index: 99999; direction: ${isFa() ? 'rtl' : 'ltr'}; font-family: inherit;">
<button id="app-menu-btn" style="background: linear-gradient(180deg, #0078d4, #005a9e); color: white; border: none; border-radius: 12px; padding: 8px 14px; font-size: 20px; cursor: pointer; box-shadow: 0 6px 14px rgba(0,120,212,0.35); display: flex; align-items: center; justify-content: center; line-height: 1; transition: all 0.2s;">⋮</button>
<div id="app-menu-dropdown" style="display: none; position: absolute; top: 50px; left: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); border: 1px solid rgba(0,120,212,0.2); border-radius: 14px; box-shadow: 0 12px 32px rgba(15,35,70,0.22); min-width: 200px; overflow: hidden;">
<button id="app-menu-save" style="display: block; width: 100%; padding: 13px 14px; text-align: ${isFa() ? 'right' : 'left'}; background: none; border: none; border-bottom: 1px solid #eef2f7; cursor: pointer; font-family: inherit; font-size: 14px; color: #1e293b; transition: background 0.15s;">${t('misc.menuPrint')}</button>
<button id="app-menu-guide" style="display: block; width: 100%; padding: 13px 14px; text-align: ${isFa() ? 'right' : 'left'}; background: none; border: none; border-bottom: 1px solid #eef2f7; cursor: pointer; font-family: inherit; font-size: 14px; color: #1e293b; transition: background 0.15s;">${t('misc.menuGuide')}</button>
<button id="app-menu-lang" style="display: block; width: 100%; padding: 13px 14px; text-align: ${isFa() ? 'right' : 'left'}; background: none; border: none; border-bottom: 1px solid #eef2f7; cursor: pointer; font-family: inherit; font-size: 14px; color: #1e293b; transition: background 0.15s;">${t('misc.menuLanguage')}</button>
<button id="app-menu-contact" style="display: block; width: 100%; padding: 13px 14px; text-align: ${isFa() ? 'right' : 'left'}; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 14px; color: #0078d4; font-weight: 700; transition: background 0.15s;">${t('misc.menuContact')}</button>
</div></div>`;
  document.body.insertAdjacentHTML('beforeend', menuHTML);

  const menuBtn = document.getElementById('app-menu-btn');
  const menuDropdown = document.getElementById('app-menu-dropdown');
  const menuSave = document.getElementById('app-menu-save');
  const menuGuide = document.getElementById('app-menu-guide');
  const menuLang = document.getElementById('app-menu-lang');
  const menuContact = document.getElementById('app-menu-contact');

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('app-options-menu');
    if (menu && !menu.contains(e.target)) menuDropdown.style.display = 'none';
  });

  menuSave.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuDropdown.style.display = 'none';
    try { printFullReport(); } catch (err) { alert(t('misc.printError') + (err.message || err)); }
  };

  menuGuide.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuDropdown.style.display = 'none';
    showGuideReport();
  };

  menuLang.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    menuDropdown.style.display = 'none';
    toggleLanguage();
    const oldMenu = document.getElementById('app-options-menu');
    if (oldMenu) oldMenu.remove();
    initNewMenu();
  };

  menuContact.onclick = () => {
    menuDropdown.style.display = 'none';
    openContactCard();
  };
}

function openContactCard() {
  if (document.getElementById('contact-card-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'contact-card-overlay';
  overlay.innerHTML = `
    <div class="contact-card">
      <button type="button" class="contact-close" aria-label="${t('misc.close')}">×</button>
      <div class="contact-header">
        <div class="contact-badge">${t('misc.contactBadge')}</div>
        <div class="contact-title">${t('appTitle')}</div>
        <div class="contact-sub">${t('appSub')}</div>
      </div>
      <div class="contact-divider"></div>
      <div class="contact-body">
        <div class="contact-row"><span class="contact-label">${t('credit')}</span><span class="contact-value">${t('misc.author')}</span></div>
        <div class="contact-row"><span class="contact-label">${t('misc.contactEmail')}</span><span class="contact-value contact-email">talkhestan@gmail.com</span></div>
      </div>
      <div class="contact-divider"></div>
      <div class="contact-actions">
        <a class="contact-btn" href="mailto:talkhestan@gmail.com">${t('misc.contactSend')}</a>
        <button type="button" class="contact-btn contact-btn-secondary" id="contact-copy">${t('misc.contactCopy')}</button>
      </div>
      <div class="contact-footer">${t('misc.contactFooter')}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #contact-card-overlay {
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(10, 20, 40, 0.55);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: contactFade 0.25s ease;
    }
    .contact-card {
      position: relative;
      background: linear-gradient(160deg, #ffffff 0%, #f0f7ff 100%);
      border-radius: 22px;
      padding: 28px 26px 22px;
      width: 100%; max-width: 380px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.6) inset;
      border: 1px solid rgba(0,120,212,0.25);
      overflow: hidden;
      animation: contactPop 0.4s cubic-bezier(0.2, 0.9, 0.2, 1.2);
      direction: ${isFa() ? 'rtl' : 'ltr'};
    }
    .contact-card::before {
      content: ''; position: absolute; inset: 0;
      padding: 3px;
      border-radius: 22px;
      background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6, #fbbf24, #34d399, #60a5fa);
      background-size: 300% 300%;
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      animation: contactBorder 6s linear infinite;
      pointer-events: none;
    }
    .contact-close {
      position: absolute; top: 10px; left: 10px;
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(0,0,0,0.06); border: none; cursor: pointer;
      font-size: 20px; line-height: 1; color: #64748b;
      padding: 0; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .contact-close:hover { background: rgba(0,0,0,0.12); color: #dc2626; transform: rotate(90deg); }
    .contact-header { text-align: center; margin-bottom: 16px; }
    .contact-badge {
      display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1px;
      color: #ffffff;
      background: linear-gradient(90deg, #0078d4, #6366f1);
      padding: 4px 12px; border-radius: 20px; margin-bottom: 10px;
      box-shadow: 0 4px 10px rgba(0,120,212,0.3);
    }
    .contact-title {
      font-size: 22px; font-weight: 800;
      background: linear-gradient(90deg, #0078d4, #6366f1, #a855f7);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      margin-bottom: 4px;
    }
    .contact-sub { font-size: 11px; color: #64748b; letter-spacing: 2px; }
    .contact-divider {
      height: 1px; margin: 14px 0;
      background: linear-gradient(90deg, transparent, rgba(0,120,212,0.4), transparent);
    }
    .contact-body { display: flex; flex-direction: column; gap: 10px; }
    .contact-row {
      display: flex; justify-content: space-between; align-items: center;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(0,120,212,0.15);
      border-radius: 12px; padding: 10px 14px;
    }
    .contact-label { font-size: 12px; color: #64748b; font-weight: 600; }
    .contact-value { font-size: 14px; color: #0f172a; font-weight: 700; }
    .contact-email { direction: ltr; color: #0369a1; font-family: 'Segoe UI', monospace; }
    .contact-actions { display: flex; gap: 10px; margin-top: 16px; }
    .contact-btn {
      flex: 1; padding: 11px; border-radius: 12px; border: none; cursor: pointer;
      font-family: inherit; font-size: 13px; font-weight: 700;
      text-decoration: none; text-align: center;
      background: linear-gradient(180deg, #0078d4, #005a9e); color: white;
      box-shadow: 0 6px 14px rgba(0,120,212,0.3);
      transition: all 0.2s;
    }
    .contact-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,120,212,0.4); }
    .contact-btn-secondary {
      background: linear-gradient(180deg, #f8fafc, #e2e8f0);
      color: #334155; box-shadow: 0 6px 14px rgba(0,0,0,0.1);
    }
    .contact-btn-secondary:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
    .contact-footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 16px; }
    @keyframes contactFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes contactPop { from { opacity: 0; transform: scale(0.85) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes contactBorder { 0% { background-position: 0% 50%; } 100% { background-position: 300% 50%; } }
  `;
  document.head.appendChild(styleEl);
  const close = () => overlay.remove();
  overlay.querySelector('.contact-close').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#contact-copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText('talkhestan@gmail.com');
      const btn = overlay.querySelector('#contact-copy');
      const orig = btn.textContent;
      btn.textContent = t('misc.contactCopied');
      setTimeout(() => { btn.textContent = orig; }, 1500);
    } catch (_) {
      alert('talkhestan@gmail.com');
    }
  };
}

function bootstrap() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = isFa() ? 'rtl' : 'ltr';
  showSplash();
  // تأخیر در استارت برنامه تا اسپلش اسکرین ابتدا نمایش داده شود
  setTimeout(() => {
    startApp();
    initNewMenu();
  }, 100);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
else bootstrap();
