'use strict';

/* =========================================
   طرح ملی مخلوط بتن
   app.js
========================================= */

const STORAGE_KEY = 'beton479';

const defaults = {
  strength: 30,
  slumpClass: 'S3',
  slump: 120,
  msa: 19,
  aggregateCount: 2,
  cementClass: '42.5',
  water: 185,
  wc: 0.50,
  coarseShare: 0.60,
  grading: 'continuous',
  admixture: 'none',
  admixturePct: 0,
  limitMinCementOn: false,
  limitMinCement: 280,
  limitMaxCementOn: false,
  limitMaxCement: 450,
  limitWcOn: false,
  limitWc: 0.50,
  air: 2,
  sgCement: 3.15,
  sgSand: 2.65,
  sgGravel: 2.70,
  targetMethod: 'manual',
  workshopRank: 'A',
  targetStrengthManual: '',
  aggregateShares: ['', '', '', ''],
  showAggregateCurves: [true, true, true, true],
  showMixCurve: true,
  showReferenceCurves: true
};

const sieves = [
  { mm: 37.5, label: '۳۷٫۵' },
  { mm: 25, label: '۲۵' },
  { mm: 19, label: '۱۹' },
  { mm: 12.5, label: '۱۲٫۵' },
  { mm: 9.5, label: '۹٫۵' },
  { mm: 4.75, label: '۴٫۷۵' },
  { mm: 2.36, label: '۲٫۳۶' },
  { mm: 1.18, label: '۱٫۱۸' },
  { mm: 0.6, label: '۰٫۶' },
  { mm: 0.3, label: '۰٫۳' },
  { mm: 0.15, label: '۰٫۱۵' }
];

const slumpClasses = {
  S1: { label: 'S1 ـ روانی کم', min: 10, max: 40 },
  S2: { label: 'S2 ـ روانی متوسط', min: 50, max: 90 },
  S3: { label: 'S3 ـ روانی نسبتاً زیاد', min: 100, max: 150 },
  S4: { label: 'S4 ـ روانی زیاد', min: 160, max: 210 }
};

/*
  جدول موقت انحراف معیار.
  قبل از استفاده اجرایی باید با مرجع کنترل شود.
*/
const standardDeviationTable = {
  16: { A: 2.5, B: 3.5, C: 4.0 },
  20: { A: 3.0, B: 4.0, C: 5.0 },
  25: { A: 3.5, B: 4.5, C: 5.5 },
  30: { A: 4.0, B: 5.0, C: 6.0 },
  35: { A: 4.0, B: 5.0, C: 6.0 },
  40: { A: 4.5, B: 5.5, C: 6.5 }
};

/*
  داده‌های مرجع A/B/C
  مقادیر درصد عبوری مستقیماً از جدول راهنمای
  ملی طرح مخلوط بتن استخراج شده‌اند.
  ترتیب مقادیر مطابق آرایه sieves است:
  37.5, 25, 19, 12.5, 9.5, 4.75,
  2.36, 1.18, 0.6, 0.3, 0.15
*/
const referenceCurves = {
  '9.5': {
    A: [100, 100, 100, 100, 100, 82, 68, 55, 41, 23, 13],
    B: [100, 100, 100, 100, 100, 71, 58, 45, 32, 17, 8],
    C: [100, 100, 100, 100, 100, 63, 52, 40, 28, 14, 6]
  },
  '12.5': {
    A: [100, 100, 100, 100, 91, 62, 50, 37, 25, 15, 10],
    B: [100, 100, 100, 95, 80, 55, 42, 32, 20, 12, 5],
    C: [100, 100, 100, 85, 71, 46, 34, 25, 14, 6, 2]
  },
  '19': {
    A: [100, 100, 95, 82, 70, 47, 35, 23, 15, 8, 5],
    B: [100, 93, 83, 70, 60, 38, 25, 15, 9, 4, 2],
    C: [100, 88, 74, 62, 50, 30, 20, 12, 6, 3, 1]
  },
  '25': {
    A: [100, 91, 77, 62, 51, 32, 21, 13, 8, 5, 2],
    B: [100, 85, 68, 53, 43, 26, 17, 9, 4, 2, 1],
    C: [100, 72, 56, 44, 35, 20, 13, 7, 3, 1, 0]
  }
};

const titles = [
  'اطلاعات اولیه',
  'مشخصات سنگدانه‌ها',
  'سهم‌بندی سنگدانه‌ها',
  '۱. آب به سیمان',
  '۲. آب آزاد',
  '۳. مقدار سیمان',
  'گزارش نهایی'
];

const fields = {
  strength: ['مقاومت مشخصه استوانه‌ای (MPa)', 0.1],
  slump: ['اسلامپ (mm)', 1],
  water: ['آب آزاد پایه (kg/m³)', 0.1],
  wc: ['نسبت آب به سیمان', 0.001],
  coarseShare: ['سهم حجمی شن از کل سنگدانه', 0.001],
  air: ['هوای بتن (%)', 0.1],
  sgCement: ['چگالی نسبی سیمان', 0.01],
  sgSand: ['چگالی نسبی ماسه', 0.01],
  sgGravel: ['چگالی نسبی شن', 0.01]
};

/* =========================================
   داده‌ها و ذخیره‌سازی
========================================= */

let stored = {};

try {
  stored = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '{}'
  ) || {};
} catch (_) {
  stored = {};
}

const data = {
  ...defaults,
  ...stored
};

/* نرمال‌سازی NMSA تا همیشه یکی از چهار مقدار معتبر باشد */
{
  const msaValue = Number(data.msa);
  data.msa = [9.5, 12.5, 19, 25].includes(msaValue)
    ? msaValue
    : 19;
}

function defaultAggregate(index) {
  return {
    name: `سنگدانه ${index + 1}`,
    fracture: 0,
    passing: Array(sieves.length).fill('')
  };
}

if (!Array.isArray(data.aggregates)) {
  data.aggregates = [];
}

data.aggregates = data.aggregates.map((a, i) => ({
  ...defaultAggregate(i),
  ...a,
  passing: Array.isArray(a.passing)
    ? sieves.map((_, j) => {
        const v = a.passing[j];
        return v === '' || v == null
          ? ''
          : Number(v);
      })
    : Array(sieves.length).fill('')
}));

while (data.aggregates.length < 4) {
  data.aggregates.push(
    defaultAggregate(data.aggregates.length)
  );
}

data.aggregates = data.aggregates.slice(0, 4);

data.aggregateCount = Math.max(
  2,
  Math.min(4, Number(data.aggregateCount) || 2)
);

data.aggregateShares = Array.from(
  { length: 4 },
  (_, i) => {
    const source = Array.isArray(data.aggregateShares)
      ? data.aggregateShares[i]
      : '';

    return source === '' || source == null
      ? ''
      : Number(source);
  }
);

data.showAggregateCurves = Array.from(
  { length: 4 },
  (_, i) => {
    const source = Array.isArray(data.showAggregateCurves)
      ? data.showAggregateCurves[i]
      : true;

    return source !== false;
  }
);

data.showMixCurve = data.showMixCurve !== false;
data.showReferenceCurves = data.showReferenceCurves !== false;

let page = 0;

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn('ذخیره اطلاعات ناموفق بود', error);
  }
}

function num(key) {
  return Number(data[key]);
}

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]
  );
}

function selected(key, value) {
  return String(data[key]) === String(value)
    ? 'selected'
    : '';
}

function numberInput(key, label, step, extra = '') {
  return `
    <label class="field">
      ${label}
      <input
        type="number"
        data-key="${key}"
        step="${step}"
        value="${escapeHtml(data[key] ?? '')}"
        ${extra}
      >
    </label>
  `;
}

function selectInput(key, label, options) {
  return `
    <label class="field">
      ${label}
      <select data-key="${key}">
        ${options.map(o => `
          <option
            value="${o.value}"
            ${selected(key, o.value)}
          >${o.label}</option>
        `).join('')}
      </select>
    </label>
  `;
}

function group(keys) {
  return `
    <div class="grid">
      ${keys.map(key => {
        const [label, step] = fields[key];
        return numberInput(key, label, step);
      }).join('')}
    </div>
  `;
}

function table(rows) {
  return `
    <table>
      <tbody>
        ${rows.map(([label, value]) => `
          <tr>
            <td>${escapeHtml(label)}</td>
            <td>
              ${typeof value === 'number'
                ? Number.isFinite(value)
                  ? value.toFixed(2)
                  : 'نامعتبر'
                : escapeHtml(value)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* =========================================
   اعتبارسنجی
========================================= */

function slumpRange() {
  return slumpClasses[data.slumpClass] ||
    slumpClasses.S3;
}

function requireNumber(key, label) {
  const raw = data[key];

  if (
    raw === '' ||
    raw == null ||
    !Number.isFinite(Number(raw))
  ) {
    throw Error(`${label} باید عدد معتبر باشد.`);
  }

  return Number(raw);
}

function effectiveWater() {
  const water = num('water');

  if (data.admixture === 'water_reducer') {
    return water * (
      1 - num('admixturePct') / 100
    );
  }

  return water;
}

function validate() {
  const required = {
    strength: 'مقاومت مشخصه',
    slump: 'اسلامپ',
    msa: 'NMSA',
    water: 'آب آزاد',
    wc: 'نسبت آب به سیمان',
    coarseShare: 'سهم شن',
    air: 'درصد هوا',
    sgCement: 'چگالی سیمان',
    sgSand: 'چگالی ماسه',
    sgGravel: 'چگالی شن'
  };

  for (const [key, label] of Object.entries(required)) {
    requireNumber(key, label);
  }

  if (num('strength') <= 0) {
    throw Error('مقاومت مشخصه باید مثبت باشد.');
  }

  const range = slumpRange();

  if (
    num('slump') < range.min ||
    num('slump') > range.max
  ) {
    throw Error(
      `اسلامپ باید بین ${range.min} و ${range.max} باشد.`
    );
  }

  if (![9.5, 12.5, 19, 25].includes(num('msa'))) {
    throw Error('NMSA معتبر نیست.');
  }

  if (num('water') <= 0) {
    throw Error('آب آزاد باید مثبت باشد.');
  }

  if (num('wc') <= 0 || num('wc') >= 1) {
    throw Error('نسبت آب به سیمان باید بین صفر و یک باشد.');
  }

  if (
    num('coarseShare') <= 0 ||
    num('coarseShare') >= 1
  ) {
    throw Error('سهم حجمی شن باید بین صفر و یک باشد.');
  }

  if (num('air') < 0 || num('air') >= 15) {
    throw Error('درصد هوا باید بین صفر و ۱۵ باشد.');
  }

  for (const key of [
    'sgCement',
    'sgSand',
    'sgGravel'
  ]) {
    if (num(key) <= 0) {
      throw Error('چگالی نسبی باید مثبت باشد.');
    }
  }

  if (data.admixture !== 'none') {
    const pct = requireNumber(
      'admixturePct',
      'درصد افزودنی'
    );

    if (pct < 0 || pct >= 100) {
      throw Error('درصد افزودنی باید بین صفر و ۱۰۰ باشد.');
    }
  }

  const cement = effectiveWater() / num('wc');

  if (data.limitMinCementOn) {
    const minimum = requireNumber(
      'limitMinCement',
      'حداقل سیمان'
    );

    if (minimum <= 0 || cement < minimum) {
      throw Error('مقدار سیمان از حداقل تعیین‌شده کمتر است.');
    }
  }

  if (data.limitMaxCementOn) {
    const maximum = requireNumber(
      'limitMaxCement',
      'حداکثر سیمان'
    );

    if (maximum <= 0 || cement > maximum) {
      throw Error('مقدار سیمان از حداکثر تعیین‌شده بیشتر است.');
    }
  }

  if (data.limitWcOn) {
    const maximum = requireNumber(
      'limitWc',
      'حداکثر نسبت آب به سیمان'
    );

    if (
      maximum <= 0 ||
      maximum >= 1 ||
      num('wc') > maximum
    ) {
      throw Error('نسبت آب به سیمان از حداکثر مجاز بیشتر است.');
    }
  }
}

function validateAggregates() {
  for (let i = 0; i < data.aggregateCount; i++) {
    const a = data.aggregates[i];

    if (
      a.fracture === '' ||
      !Number.isFinite(Number(a.fracture)) ||
      Number(a.fracture) < 0 ||
      Number(a.fracture) > 100
    ) {
      throw Error(
        `درصد شکستگی سنگدانه ${i + 1} نامعتبر است.`
      );
    }

    let previous = null;

    for (let j = 0; j < sieves.length; j++) {
      const raw = a.passing[j];

      if (raw === '' || raw == null) {
        continue;
      }

      const value = Number(raw);

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100
      ) {
        throw Error(
          `درصد عبوری سنگدانه ${i + 1} از الک ${sieves[j].mm} نامعتبر است.`
        );
      }

      if (previous !== null && value > previous) {
        throw Error(
          `در سنگدانه ${i + 1} درصد عبوری الک ${sieves[j].mm} از الک درشت‌تر بیشتر است.`
        );
      }

      previous = value;
    }
  }
}

/* =========================================
   محاسبات
========================================= */

class Step1 {
  run() {
    return {
      wc: num('wc'),
      strength: num('strength')
    };
  }
}

class Step3 {
  run() {
    return {
      baseWater: num('water'),
      water: effectiveWater()
    };
  }
}

class Step4 {
  run() {
    validate();

    return {
      cement: effectiveWater() / num('wc')
    };
  }
}

class Step5 {
  run() {
    validate();

    const cement = new Step4().run().cement;
    const water = effectiveWater();

    const vc = cement / (num('sgCement') * 1000);
    const vw = water / 1000;
    const va = num('air') / 100;

    const aggregateVolume = 1 - vc - vw - va;

    if (aggregateVolume <= 0) {
      throw Error('حجم باقی‌مانده برای سنگدانه مثبت نیست.');
    }

    const gravelVolume =
      aggregateVolume * num('coarseShare');

    const sandVolume =
      aggregateVolume - gravelVolume;

    const drySand =
      sandVolume * num('sgSand') * 1000;

    const dryGravel =
      gravelVolume * num('sgGravel') * 1000;

    const admixtureMass =
      data.admixture === 'none'
        ? 0
        : cement * num('admixturePct') / 100;

    return {
      cement,
      water,
      drySand,
      dryGravel,
      admixtureMass,
      volume:
        vc + vw + va +
        sandVolume + gravelVolume
    };
  }
}

/* =========================================
   صفحه اول
========================================= */

function checkboxField(
  key,
  label,
  valueKey,
  valueLabel,
  step
) {
  return `
    <div class="limit-box">
      <label class="checkline">
        <input
          type="checkbox"
          data-check="${key}"
          ${data[key] ? 'checked' : ''}
        >
        <span>${label}</span>
      </label>

      ${data[key]
        ? numberInput(valueKey, valueLabel, step)
        : ''}
    </div>
  `;
}

function renderHome() {
  const range = slumpRange();

  return `
    <h2>اطلاعات اولیه طرح</h2>

    <div class="grid">
      ${numberInput('strength', fields.strength[0], 0.1)}

      ${selectInput(
        'slumpClass',
        'رده اسلامپ',
        Object.entries(slumpClasses).map(
          ([value, item]) => ({
            value,
            label:
              `${item.label} (${item.min}–${item.max} mm)`
          })
        )
      )}

      ${numberInput(
        'slump',
        fields.slump[0],
        1,
        `min="${range.min}" max="${range.max}"`
      )}

      ${numberInput('air', fields.air[0], 0.1)}
    </div>

    <p class="hint">
      محدوده‌های اسلامپ باید با مرجع معتبر کنترل شوند.
    </p>

    <div class="grid">
      ${selectInput(
        'cementClass',
        'رده مقاومتی سیمان',
        [
          { value: '32.5', label: '۳۲٫۵' },
          { value: '42.5', label: '۴۲٫۵' },
          { value: '52.5', label: '۵۲٫۵' }
        ]
      )}

      ${numberInput('sgCement', fields.sgCement[0], 0.01)}
    </div>

    <div class="grid">
      ${selectInput(
        'grading',
        'نوع دانه‌بندی',
        [
          { value: 'continuous', label: 'پیوسته' },
          { value: 'fine_gap', label: 'کمبود ریزدانه' },
          { value: 'coarse_gap', label: 'کمبود درشت‌دانه' },
          { value: 'gap', label: 'گسسته' }
        ]
      )}

      ${selectInput(
        'admixture',
        'نوع افزودنی',
        [
          { value: 'none', label: 'بدون افزودنی' },
          { value: 'slump', label: 'افزودنی افزایش‌دهنده اسلامپ' },
          { value: 'water_reducer', label: 'افزودنی کاهنده نیاز آب' }
        ]
      )}

      ${numberInput(
        'admixturePct',
        'درصد افزودنی نسبت به جرم سیمان (%)',
        0.1,
        data.admixture === 'none'
          ? 'min="0" max="99.9" disabled'
          : 'min="0" max="99.9"'
      )}
    </div>

    <p class="hint">
      مدل کاهش آب ساده‌سازی شده و باید با
      مشخصات فنی افزودنی کنترل شود.
    </p>

    <h3>کنترل‌های اختیاری طرح</h3>

    ${checkboxField(
      'limitMinCementOn',
      'اعمال حداقل مقدار سیمان',
      'limitMinCement',
      'حداقل سیمان (kg/m³)',
      1
    )}

    ${checkboxField(
      'limitMaxCementOn',
      'اعمال حداکثر مقدار سیمان',
      'limitMaxCement',
      'حداکثر سیمان (kg/m³)',
      1
    )}

    ${checkboxField(
      'limitWcOn',
      'اعمال حداکثر نسبت آب به سیمان',
      'limitWc',
      'حداکثر نسبت آب به سیمان',
      0.001
    )}
  `;
}

/* =========================================
   مقاومت هدف
========================================= */

function targetCalculations() {
  const fc = num('strength');
  const row = standardDeviationTable[fc];

  if (!row) return null;

  const S = row[data.workshopRank];

  if (!Number.isFinite(S)) return null;

  const fcm1 = fc + 1.34 * S;
  const fcm2 = 0.9 * fc + 2.33 * S;

  return {
    fc,
    S,
    fcm1,
    fcm2,
    target: Math.max(fcm1, fcm2)
  };
}

function getTargetStrength() {
  if (data.targetMethod === 'manual') {
    const raw = data.targetStrengthManual;

    if (raw === '' || raw == null) {
      return null;
    }

    const value = Number(raw);

    return Number.isFinite(value) && value > 0
      ? value
      : null;
  }

  const result = targetCalculations();

  return result ? result.target : null;
}

function renderTargetStrength() {
  const result = targetCalculations();
  const fc = num('strength');

  return `
    <h3>تعیین مقاومت هدف طرح</h3>

    <div class="grid">
      ${selectInput(
        'targetMethod',
        'روش تعیین مقاومت هدف',
        [
          { value: 'manual', label: 'ورود دستی' },
          { value: 'auto', label: 'محاسبه خودکار' }
        ]
      )}

      ${selectInput(
        'workshopRank',
        'رتبه کارگاه',
        [
          { value: 'A', label: 'الف' },
          { value: 'B', label: 'ب' },
          { value: 'C', label: 'ج' }
        ]
      )}
    </div>

    <p>
      مقاومت مشخصه:
      <strong>${fc.toFixed(2)} MPa</strong>
    </p>

    ${result
      ? `
        <p>
          انحراف معیار S:
          <strong>${result.S.toFixed(2)} MPa</strong>
        </p>
      `
      : `
        <p class="hint">
          برای این مقاومت، مقدار انحراف معیار
          در جدول فعلی موجود نیست.
        </p>
      `
    }

    ${data.targetMethod === 'manual'
      ? numberInput(
          'targetStrengthManual',
          'مقاومت هدف طرح (MPa)',
          0.1,
          'min="0"'
        )
      : result
        ? `
          <p>رابطه اول: fcm1 = fc + 1.34 × S</p>
          <p>
            ${fc.toFixed(2)} +
            1.34 × ${result.S.toFixed(2)}
            = ${result.fcm1.toFixed(2)} MPa
          </p>

          <p>رابطه دوم: fcm2 = 0.9 × fc + 2.33 × S</p>
          <p>
            0.9 × ${fc.toFixed(2)} +
            2.33 × ${result.S.toFixed(2)}
            = ${result.fcm2.toFixed(2)} MPa
          </p>

          <p>
            مقاومت هدف انتخابی:
            <strong>${result.target.toFixed(2)} MPa</strong>
          </p>
        `
        : `
          <p class="hint">
            محاسبه خودکار در دسترس نیست.
          </p>
        `
    }

    <p class="hint">
      جدول انحراف معیار موقت است و باید
      با مرجع اصلی کنترل شود.
    </p>
  `;
}

/* =========================================
   صفحه دوم ـ سنگدانه‌ها
========================================= */

function renderAggregateTable() {
  const count = data.aggregateCount;

  const headers = Array.from(
    { length: count },
    (_, i) => `<th>سنگدانه ${i + 1}</th>`
  ).join('');

  const nameRow = `
    <tr>
      <th>نام سنگدانه</th>
      ${Array.from({ length: count }, (_, i) => `
        <td>
          <input
            class="table-input"
            type="text"
            data-agg="${i}"
            data-agg-field="name"
            value="${escapeHtml(data.aggregates[i].name)}"
          >
        </td>
      `).join('')}
    </tr>
  `;

  const fractureRow = `
    <tr>
      <th>درصد شکستگی (%)</th>
      ${Array.from({ length: count }, (_, i) => `
        <td>
          <input
            class="table-input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            data-agg="${i}"
            data-agg-field="fracture"
            value="${data.aggregates[i].fracture}"
          >
        </td>
      `).join('')}
    </tr>
  `;

  const sieveRows = sieves.map((sieve, j) => `
    <tr>
      <th>درصد گذشته از الک ${sieve.label} mm</th>
      ${Array.from({ length: count }, (_, i) => `
        <td>
          <input
            class="table-input"
            type="number"
            min="0"
            max="100"
            step="0.1"
            data-agg="${i}"
            data-sieve="${j}"
            value="${data.aggregates[i].passing[j] ?? ''}"
          >
        </td>
      `).join('')}
    </tr>
  `).join('');

  return `
    <h2>مشخصات سنگدانه‌ها</h2>

    <div class="grid">
      ${selectInput(
        'aggregateCount',
        'تعداد انواع سنگدانه',
        [
          { value: 2, label: '۲ نوع سنگدانه' },
          { value: 3, label: '۳ نوع سنگدانه' },
          { value: 4, label: '۴ نوع سنگدانه' }
        ]
      )}

      ${selectInput(
        'msa',
        'حداکثر اندازه اسمی سنگدانه NMSA',
        [
          { value: 9.5, label: '۹٫۵ میلی‌متر' },
          { value: 12.5, label: '۱۲٫۵ میلی‌متر' },
          { value: 19, label: '۱۹ میلی‌متر' },
          { value: 25, label: '۲۵ میلی‌متر' }
        ]
      )}
    </div>

    <p class="hint">
      خانه‌های خالی به معنی داده واردنشده‌اند،
      نه درصد عبوری صفر.
    </p>

    <div class="table-scroll">
      <table class="aggregate-table">
        <thead>
          <tr>
            <th>مشخصات</th>
            ${headers}
          </tr>
        </thead>
        <tbody>
          ${nameRow}
          ${fractureRow}
          ${sieveRows}
        </tbody>
      </table>
    </div>

    <h3>مشخصات تکمیلی مصالح</h3>

    <div class="grid">
      ${numberInput('sgSand', fields.sgSand[0], 0.01)}
      ${numberInput('sgGravel', fields.sgGravel[0], 0.01)}
    </div>

    <p class="hint">
      وزن نهایی مصالح بر مبنای وزن خشک محاسبه می‌شود.
    </p>

    ${renderTargetStrength()}

    <p class="hint">
      سری الک‌ها باید با نسخه معتبر
      استاندارد ملی ایران ۳۰۲ تطبیق داده شود.
    </p>
  `;
}

/* =========================================
   سهم‌بندی و محاسبه ترکیب
========================================= */

function getSharesInfo() {
  const count = data.aggregateCount;
  const shares = data.aggregateShares.slice(0, count);

  const entered = shares.every(
    v => v !== '' &&
      v != null &&
      Number.isFinite(Number(v)) &&
      Number(v) >= 0 &&
      Number(v) <= 100
  );

  const total = entered
    ? shares.reduce(
        (sum, value) => sum + Number(value),
        0
      )
    : null;

  return {
    count,
    shares,
    entered,
    total,
    valid:
      entered &&
      Math.abs(total - 100) < 0.0001
  };
}

function combinedGrading() {
  const info = getSharesInfo();

  if (!info.valid) return null;

  const aggregates = data.aggregates.slice(
    0,
    info.count
  );

  const allEntered = aggregates.every(a =>
    sieves.every((_, j) => {
      const v = a.passing[j];

      return v !== '' &&
        v != null &&
        Number.isFinite(Number(v)) &&
        Number(v) >= 0 &&
        Number(v) <= 100;
    })
  );

  if (!allEntered) return null;

  return sieves.map((sieve, j) => ({
    mm: sieve.mm,
    value: aggregates.reduce(
      (sum, a, i) =>
        sum +
        Number(a.passing[j]) *
        Number(info.shares[i]) / 100,
      0
    )
  }));
}

function finenessModulus(points) {
  if (!points) return null;

  const fmSieves = [
    37.5, 19, 9.5, 4.75,
    2.36, 1.18, 0.6, 0.3, 0.15
  ];

  let total = 0;

  for (const mm of fmSieves) {
    const point = points.find(p => p.mm === mm);

    if (!point) return null;

    total += 100 - point.value;
  }

  return total / 100;
}

/* =========================================
   داده‌های مرجع A/B/C
========================================= */

function getReferenceSeries() {
  const msa = Number(data.msa);
  const source = referenceCurves[String(msa)];

  if (!source) return [];

  const result = [];

  for (const name of ['A', 'B', 'C']) {
    const values = source[name];

    if (
      !Array.isArray(values) ||
      values.length !== sieves.length
    ) {
      continue;
    }

    if (!values.every(
      v => typeof v === 'number' &&
        Number.isFinite(v) &&
        v >= 0 &&
        v <= 100
    )) {
      continue;
    }

    let monotonic = true;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) {
        monotonic = false;
        break;
      }
    }

    if (!monotonic) continue;

    result.push({
      name,
      points: sieves.map((sieve, i) => ({
        mm: sieve.mm,
        value: values[i]
      }))
    });
  }

  return result;
}

/* =========================================
   نمودار دانه‌بندی
========================================= */

function renderGradingChart(combined) {
  const width = 680;
  const height = 390;

  const left = 65;
  const right = 25;
  const top = 25;
  const bottom = 75;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const minLog = Math.log10(0.075);
  const maxLog = Math.log10(37.5);

  const x = mm =>
    left +
    (Math.log10(mm) - minLog) /
    (maxLog - minLog) * plotWidth;

  const y = value =>
    top +
    (100 - value) / 100 * plotHeight;

  function drawSeries(points, color, dash = '', thickness = 2.5) {
    const valid = points
      .filter(p =>
        p.value !== '' &&
        p.value != null &&
        Number.isFinite(Number(p.value)) &&
        Number(p.value) >= 0 &&
        Number(p.value) <= 100
      )
      .sort((a, b) => a.mm - b.mm);

    if (!valid.length) return '';

    const segments = [];
    let current = [];

    for (const p of valid) {
      const originalIndex = sieves.findIndex(
        s => s.mm === p.mm
      );

      if (
        current.length &&
        Math.abs(
          originalIndex -
          current[current.length - 1].index
        ) !== 1
      ) {
        segments.push(current);
        current = [];
      }

      current.push({
        ...p,
        index: originalIndex
      });
    }

    if (current.length) {
      segments.push(current);
    }

    return `
      ${segments.map(segment => {
        if (segment.length < 2) return '';

        const coords = segment.map(
          p => `${x(p.mm)},${y(Number(p.value))}`
        ).join(' ');

        return `
          <polyline
            points="${coords}"
            fill="none"
            stroke="${color}"
            stroke-width="${thickness}"
            stroke-dasharray="${dash}"
            stroke-linejoin="round"
          />
        `;
      }).join('')}

      ${valid.map(p => `
        <circle
          cx="${x(p.mm)}"
          cy="${y(Number(p.value))}"
          r="3"
          fill="${color}"
        />
      `).join('')}
    `;
  }

  const aggregateColors = [
    '#2563eb',
    '#ea580c',
    '#16a34a',
    '#9333ea'
  ];

  /* همه منحنی‌های مرجع با رنگ آبی آسمانی یکسان */
  const referenceColor = '#0ea5e9';

  const aggregateLines = data.aggregates
    .slice(0, data.aggregateCount)
    .map((aggregate, i) => {
      if (!data.showAggregateCurves[i]) {
        return '';
      }

      const points = sieves.map((sieve, j) => ({
        mm: sieve.mm,
        value: aggregate.passing[j]
      }));

      return drawSeries(
        points,
        aggregateColors[i],
        '6 4',
        2.2
      );
    }).join('');

  const referenceSeries = getReferenceSeries();

  const referenceLines = data.showReferenceCurves
    ? referenceSeries.map(series =>
        drawSeries(
          series.points,
          referenceColor,
          '',          // خط توپر بدون خط‌چین
          2.8
        )
      ).join('')
    : '';

  const mixLine =
    data.showMixCurve && combined
      ? drawSeries(combined, '#087e8b', '', 3.5)
      : '';

  const horizontalGrid = [
    0, 20, 40, 60, 80, 100
  ].map(value => `
    <line
      x1="${left}"
      y1="${y(value)}"
      x2="${width - right}"
      y2="${y(value)}"
      stroke="#d7e0e8"
    />
    <text
      x="${left - 12}"
      y="${y(value) + 4}"
      text-anchor="end"
      font-size="12"
      fill="#334155"
    >${value}</text>
  `).join('');

  /* محور افقی شامل تمام الک‌های جدول */
  const xTickValues = [
    0.075, 0.15, 0.3, 0.6,
    1.18, 2.36, 4.75,
    9.5, 12.5, 19, 25, 37.5
  ];

  const xTicks = xTickValues.map(mm => `
    <line
      x1="${x(mm)}"
      y1="${top}"
      x2="${x(mm)}"
      y2="${height - bottom}"
      stroke="#e2e8f0"
    />
    <text
      x="${x(mm)}"
      y="${height - bottom + 20}"
      text-anchor="middle"
      font-size="11"
      fill="#334155"
    >${mm}</text>
  `).join('');

  return `
    <h3>منحنی‌های دانه‌بندی</h3>

    <div class="table-scroll">
      <svg
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-label="نمودار دانه‌بندی"
        style="width:100%;max-width:900px;background:white"
      >
        ${horizontalGrid}
        ${xTicks}

        <line
          x1="${left}"
          y1="${top}"
          x2="${left}"
          y2="${height - bottom}"
          stroke="#475569"
          stroke-width="1.5"
        />

        <line
          x1="${left}"
          y1="${height - bottom}"
          x2="${width - right}"
          y2="${height - bottom}"
          stroke="#475569"
          stroke-width="1.5"
        />

        ${referenceLines}
        ${aggregateLines}
        ${mixLine}

        <text
          x="${width / 2}"
          y="${height - 16}"
          text-anchor="middle"
          font-size="13"
          fill="#334155"
        >اندازه الک (mm) ـ مقیاس لگاریتمی</text>

        <text
          x="17"
          y="${height / 2}"
          text-anchor="middle"
          font-size="13"
          fill="#334155"
          transform="rotate(-90 17 ${height / 2})"
        >درصد عبوری</text>
      </svg>
    </div>
  `;
}

/* =========================================
   صفحه سوم
========================================= */

function renderShares() {
  const count = data.aggregateCount;

  const shareInputs = Array.from(
    { length: count },
    (_, i) => `
      <label class="field">
        سهم ${escapeHtml(data.aggregates[i].name)} (%)
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          data-share="${i}"
          value="${data.aggregateShares[i] ?? ''}"
        >
      </label>
    `
  ).join('');

  const combined = combinedGrading();
  const fm = finenessModulus(combined);

  const curveCheckboxes = Array.from(
    { length: count },
    (_, i) => `
      <label class="checkline" style="margin:8px 0">
        <input
          type="checkbox"
          data-curve-aggregate="${i}"
          ${data.showAggregateCurves[i] ? 'checked' : ''}
        >
        <span>
          نمایش منحنی ${escapeHtml(data.aggregates[i].name)}
        </span>
      </label>
    `
  ).join('');

  return `
    <h2>سهم‌بندی سنگدانه‌ها</h2>

    <div class="grid">
      ${shareInputs}
    </div>

    <h3>انتخاب منحنی‌های قابل نمایش</h3>

    <div class="limit-box">
      ${curveCheckboxes}

      <label class="checkline" style="margin:8px 0">
        <input
          type="checkbox"
          data-curve-mix
          ${data.showMixCurve ? 'checked' : ''}
        >
        <span>نمایش منحنی مخلوط ترکیبی</span>
      </label>

      <label class="checkline" style="margin:8px 0">
        <input
          type="checkbox"
          data-curve-reference
          ${data.showReferenceCurves ? 'checked' : ''}
        >
        <span>نمایش منحنی‌های مرجع A، B و C</span>
      </label>
    </div>

    <p>
      مدول نرمی مخلوط:
      <strong>
        ${fm === null ? 'تعیین نشده' : fm.toFixed(2)}
      </strong>
    </p>

    ${renderGradingChart(combined)}
  `;
}

/* =========================================
   صفحات محاسبات
========================================= */

function renderStep1() {
  const result = new Step1().run();

  return `
    <h2>گام اول — تعیین نسبت آب به سیمان</h2>

    ${group(['wc'])}

    ${table([
      ['مقاومت مشخصه (MPa)', result.strength],
      ['رده مقاومتی سیمان', data.cementClass],
      ['نسبت آب به سیمان', result.wc]
    ])}

    <p class="hint">
      نسبت آب به سیمان باید با توجه به
      مقاومت و دوام موردنیاز کنترل شود.
    </p>
  `;
}

function renderWater() {
  const result = new Step3().run();

  return `
    <h2>گام دوم — تعیین آب آزاد</h2>

    ${group(['water'])}

    ${table([
      ['آب آزاد پایه (kg/m³)', result.baseWater],
      ['آب محاسباتی (kg/m³)', result.water]
    ])}
  `;
}

function renderCement() {
  const result = new Step4().run();

  const admixtureMass =
    data.admixture === 'none'
      ? 0
      : result.cement * num('admixturePct') / 100;

  return `
    <h2>گام سوم — تعیین مقدار سیمان</h2>

    ${group(['wc', 'water'])}

    ${table([
      ['آب محاسباتی (kg/m³)', effectiveWater()],
      ['سیمان (kg/m³)', result.cement],
      ['افزودنی (kg/m³)', admixtureMass]
    ])}

    <p class="hint">
      سیمان = آب محاسباتی ÷ نسبت آب به سیمان
    </p>
  `;
}

/* =========================================
   گزارش نهایی
========================================= */

function renderReport() {
  const result = new Step5().run();
  const target = getTargetStrength();

  return `
    <h2>گزارش نهایی — وزن خشک مصالح</h2>

    ${table([
      ['رده مقاومتی سیمان', data.cementClass],
      ['مقاومت مشخصه (MPa)', num('strength')],
      [
        'مقاومت هدف (MPa)',
        target === null ? 'تعیین نشده' : target
      ],
      ['NMSA (mm)', num('msa')],
      ['آب مؤثر طرح (kg/m³)', result.water],
      ['سیمان (kg/m³)', result.cement],
      ['ماسه خشک (kg/m³)', result.drySand],
      ['شن خشک (kg/m³)', result.dryGravel],
      ['افزودنی (kg/m³)', result.admixtureMass],
      ['حجم محاسباتی اجزا (m³)', result.volume]
    ])}

    <button type="button" id="print">
      چاپ / ذخیره PDF
    </button>

    <p class="hint">
      وزن خشک ماسه و شن با مدل ساده
      دو سنگدانه‌ای محاسبه شده است.
      سهم‌بندی چندسنگدانه‌ای هنوز به
      محاسبات وزن نهایی متصل نشده است.
    </p>

    <p class="hint">
      نتایج پیش از استفاده اجرایی باید
      با مرجع معتبر کنترل شوند.
    </p>
  `;
}

/* =========================================
   نمایش و رویدادها
========================================= */

function view() {
  const tabs = document.getElementById('tabs');
  const screen = document.getElementById('screen');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (!tabs || !screen || !prev || !next) {
    console.error('عناصر اصلی صفحه پیدا نشدند.');
    return;
  }

  tabs.innerHTML = titles.map((title, i) => `
    <button
      type="button"
      data-page="${i}"
      class="${i === page ? 'active' : ''}"
    >${title}</button>
  `).join('');

  let html = '';

  try {
    switch (page) {
      case 0:
        html = renderHome();
        break;
      case 1:
        html = renderAggregateTable();
        break;
      case 2:
        html = renderShares();
        break;
      case 3:
        html = renderStep1();
        break;
      case 4:
        html = renderWater();
        break;
      case 5:
        html = renderCement();
        break;
      case 6:
        html = renderReport();
        break;
      default:
        html = renderHome();
    }
  } catch (error) {
    console.error(error);

    html = `
      <p class="bad">
        ${escapeHtml(error.message)}
      </p>
      <p>ورودی‌های این بخش را بررسی کنید.</p>
    `;
  }

  screen.innerHTML = `
    <article class="panel">
      ${html}
    </article>
  `;

  document.querySelectorAll('[data-page]').forEach(
    button => {
      button.onclick = () => {
        page = Number(button.dataset.page);
        view();
      };
    }
  );

  document.querySelectorAll('[data-key]').forEach(
    element => {
      element.onchange = () => {
        const key = element.dataset.key;
        const oldValue = data[key];
        const oldSlump = data.slump;
        const oldPct = data.admixturePct;

        const value = element.type === 'number'
          ? element.value === ''
            ? ''
            : Number(element.value)
          : element.value;

        data[key] = value;

        try {
          if (key === 'aggregateCount') {
            const count = Number(value);

            if (![2, 3, 4].includes(count)) {
              throw Error('تعداد سنگدانه نامعتبر است.');
            }

            data.aggregateCount = count;
          }

          if (key === 'slumpClass') {
            const range = slumpRange();

            if (
              num('slump') < range.min ||
              num('slump') > range.max
            ) {
              data.slump = range.min;
            }
          }

          if (key === 'admixture' && value === 'none') {
            data.admixturePct = 0;
          }

          if (key === 'targetStrengthManual') {
            if (
              value !== '' &&
              (!Number.isFinite(Number(value)) ||
                Number(value) <= 0)
            ) {
              throw Error('مقاومت هدف باید مثبت باشد.');
            }
          } else if (
            key !== 'targetMethod' &&
            key !== 'workshopRank' &&
            key !== 'aggregateCount'
          ) {
            validate();
          }

          save();
          view();
        } catch (error) {
          data[key] = oldValue;
          data.slump = oldSlump;
          data.admixturePct = oldPct;

          view();
          alert(error.message);
        }
      };
    }
  );

  document.querySelectorAll('[data-check]').forEach(
    element => {
      element.onchange = () => {
        const key = element.dataset.check;
        const oldValue = data[key];

        data[key] = element.checked;

        try {
          validate();
          save();
          view();
        } catch (error) {
          data[key] = oldValue;
          view();
          alert(error.message);
        }
      };
    }
  );

  document.querySelectorAll('[data-agg]').forEach(
    element => {
      element.onchange = () => {
        const index = Number(element.dataset.agg);
        const field = element.dataset.aggField;
        const sieveIndex = Number(element.dataset.sieve);
        const aggregate = data.aggregates[index];

        let oldValue;

        if (field === 'name') {
          oldValue = aggregate.name;
          aggregate.name = element.value;

        } else if (field === 'fracture') {
          oldValue = aggregate.fracture;
          aggregate.fracture =
            element.value === ''
              ? ''
              : Number(element.value);

        } else {
          oldValue = aggregate.passing[sieveIndex];
          aggregate.passing[sieveIndex] =
            element.value === ''
              ? ''
              : Number(element.value);
        }

        try {
          validateAggregates();
          save();
          view();
        } catch (error) {
          if (field === 'name') {
            aggregate.name = oldValue;
          } else if (field === 'fracture') {
            aggregate.fracture = oldValue;
          } else {
            aggregate.passing[sieveIndex] = oldValue;
          }

          view();
          alert(error.message);
        }
      };
    }
  );

  document.querySelectorAll('[data-share]').forEach(
    element => {
      element.onchange = () => {
        const index = Number(element.dataset.share);
        const raw = element.value;

        const value = raw === ''
          ? ''
          : Number(raw);

        if (
          value !== '' &&
          (
            !Number.isFinite(value) ||
            value < 0 ||
            value > 100
          )
        ) {
          view();
          alert('سهم سنگدانه باید بین صفر و ۱۰۰ باشد.');
          return;
        }

        data.aggregateShares[index] = value;

        save();
        view();
      };
    }
  );

  document.querySelectorAll(
    '[data-curve-aggregate]'
  ).forEach(element => {
    element.onchange = () => {
      const index = Number(
        element.dataset.curveAggregate
      );

      data.showAggregateCurves[index] =
        element.checked;

      save();
      view();
    };
  });

  const mixCheckbox = document.querySelector(
    '[data-curve-mix]'
  );

  if (mixCheckbox) {
    mixCheckbox.onchange = () => {
      data.showMixCurve = mixCheckbox.checked;
      save();
      view();
    };
  }

  const referenceCheckbox = document.querySelector(
    '[data-curve-reference]'
  );

  if (referenceCheckbox) {
    referenceCheckbox.onchange = () => {
      data.showReferenceCurves =
        referenceCheckbox.checked;

      save();
      view();
    };
  }

  const printButton = document.getElementById('print');

  if (printButton) {
    printButton.onclick = () => window.print();
  }

  prev.disabled = page === 0;
  next.disabled = page === titles.length - 1;
}

/* =========================================
   راه‌اندازی
========================================= */

function startApp() {
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (!prev || !next) {
    console.error('دکمه‌های پیمایش پیدا نشدند.');
    return;
  }

  prev.onclick = () => {
    page = Math.max(0, page - 1);
    view();
  };

  next.onclick = () => {
    page = Math.min(
      titles.length - 1,
      page + 1
    );
    view();
  };

  if (data.admixture === 'none') {
    data.admixturePct = 0;
  }

  save();
  view();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    startApp
  );
} else {
  startApp();
}

/* =========================================
   Service Worker
========================================= */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .catch(error => {
        console.warn(
          'Service Worker ثبت نشد:',
          error
        );
      });
  });
}
