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
  { mm: 6.35, label: '۶٫۳۵' },
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

const standardDeviationTable = {
  16: { A: 2.5, B: 3.5, C: 4.0 },
  20: { A: 3.0, B: 4.0, C: 5.0 },
  25: { A: 3.5, B: 4.5, C: 5.5 },
  30: { A: 4.0, B: 5.0, C: 6.0 },
  35: { A: 4.0, B: 5.0, C: 6.0 },
  40: { A: 4.5, B: 5.5, C: 6.5 }
};

const referenceCurves = {
  '9.5': {
    A: [100, 100, 100, 100, 100,  90, 83, 66, 51, 37, 27, 12],
    B: [100, 100, 100, 100, 100,  84, 74, 52, 35, 24, 14,  6],
    C: [100, 100, 100, 100, 100,  75, 61, 37, 22, 12,  6,  2]
  },
  '12.5': {
    A: [100, 100, 100, 100, 93, 84, 77, 62, 48, 35, 24, 11],
    B: [100, 100, 100, 100, 89, 75, 66, 47, 32, 21, 13,  6],
    C: [100, 100, 100, 100, 82, 62, 51, 31, 18, 10,  5,  2]
  },
  '19': {
    A: [100, 100, 100, 90, 84, 76, 70, 56, 44, 31, 20, 10],
    B: [100, 100, 100, 85, 75, 62, 55, 40, 28, 18, 11,  5],
    C: [100, 100, 100, 74, 62, 47, 38, 22, 13,  8,  4,  2]
  },
  '25': {
    A: [100, 100, 94, 85, 79, 71, 65, 52, 41, 29, 19,  9],
    B: [100, 100, 89, 75, 67, 56, 49, 36, 25, 16,  9,  4],
    C: [100, 100, 82, 62, 51, 39, 32, 19, 11,  6,  3,  1]
  }
};

const SIEVE_635_INDEX = sieves.findIndex(s => s.mm === 6.35);

const aggregateSieves = sieves
  .map((sieve, j) => ({ sieve, j }))
  .filter(({ sieve }) => sieve.mm !== 6.35);

const chartSieves = sieves.filter(s => s.mm !== 6.35);

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

data.aggregates = data.aggregates.map((a, i) => {
  const base = defaultAggregate(i);
  let sourcePassing = Array.isArray(a.passing)
    ? a.passing.slice()
    : [];

  if (sourcePassing.length === 11) {
    sourcePassing.splice(SIEVE_635_INDEX, 0, '');
  }

  return {
    ...base,
    ...a,
    passing: sieves.map((sieve, j) => {
      if (sieve.mm === 6.35) return '';
      const v = sourcePassing[j];
      return v === '' || v == null ? '' : Number(v);
    })
  };
});

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
      if (sieves[j].mm === 6.35) continue;

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

  const sieveRows = sieves.map((sieve, j) => {
    if (sieve.mm === 6.35) return '';

    return `
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
    `;
  }).join('');

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
   سهم‌بندی
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
    aggregateSieves.every(({ j }) => {
      const v = a.passing[j];

      return v !== '' &&
        v != null &&
        Number.isFinite(Number(v)) &&
        Number(v) >= 0 &&
        Number(v) <= 100;
    })
  );

  if (!allEntered) return null;

  return aggregateSieves.map(({ sieve, j }) => ({
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

    const points = sieves
      .map((sieve, i) => ({
        mm: sieve.mm,
        value: values[i]
      }))
      .filter(p => p.mm <= msa + 0.001);

    if (!points.length) continue;

    if (!points.every(
      p => typeof p.value === 'number' &&
        Number.isFinite(p.value) &&
        p.value >= 0 &&
        p.value <= 100
    )) {
      continue;
    }

    let monotonic = true;
    for (let i = 1; i < points.length; i++) {
      if (points[i].value > points[i - 1].value + 0.0001) {
        monotonic = false;
        break;
      }
    }
    if (!monotonic) continue;

    result.push({ name, points });
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

  function drawSeries(
    points,
    color,
    dash = '',
    thickness = 2.5,
    sieveList = sieves
  ) {
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
      const originalIndex = sieveList.findIndex(
        s => Math.abs(s.mm - p.mm) < 0.0001
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

    const lines = segments.map(segment => {
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
    }).join('');

    let last100Index = -1;
    valid.forEach((p, idx) => {
      if (Number(p.value) === 100) last100Index = idx;
    });

    const circles = valid.map((p, idx) => {
      const v = Number(p.value);
      if (v === 100 && idx !== last100Index) return '';

      return `
        <circle
          cx="${x(p.mm)}"
          cy="${y(v)}"
          r="3"
          fill="${color}"
        />
      `;
    }).join('');

    return lines + circles;
  }

  const aggregateColors = [
    '#2563eb',
    '#ea580c',
    '#16a34a',
    '#9333ea'
  ];

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
        2.2,
        chartSieves
      );
    }).join('');

  const referenceSeries = getReferenceSeries();

  const referenceLines = data.showReferenceCurves
    ? referenceSeries.map(series =>
        drawSeries(
          series.points,
          referenceColor,
          '',
          2.8
        )
      ).join('')
    : '';

  const mixLine =
    data.showMixCurve && combined
      ? drawSeries(combined, '#087e8b', '', 3.5, chartSieves)
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

  const xTickValues = [
    0.075, 0.15, 0.3, 0.6,
    1.18, 2.36, 4.75, 6.35,
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
   نمودار نسبت آب به سیمان (صفحه چهارم)
========================================= */

function getActiveCurve() {
  const cement = String(data.cementClass || '42.5');
  let isCrushed = false;
  if (data.aggregates && data.aggregates.length > 0) {
    isCrushed = data.aggregates.slice(0, data.aggregateCount).some(a => Number(a.fracture) > 0);
  }
  const type = isCrushed ? 'C' : 'R';

  const hasAdmixture = data.admixture && data.admixture !== 'none';

  let curveSet;
  if (hasAdmixture) {
    curveSet = {
      '32.5': {
        R: { a: 107.59, b: -198.24, c: 102.72, name: '325-R', color: '#3b82f6', width: 1.5, dash: 'none' },
        C: { a: 126.73, b: -228.34, c: 116.36, name: '325-C', color: '#2563eb', width: 2.5, dash: 'none' }
      },
      '42.5': {
        R: { a: 123.42, b: -234.33, c: 122.57, name: '425-R', color: '#f87171', width: 1.5, dash: '6,4' },
        C: { a: 119.86, b: -240.12, c: 130.32, name: '425-C', color: '#dc2626', width: 2.5, dash: 'none' }
      },
      '52.5': {
        R: { a: 80.04, b: -207, c: 126.63, name: '525-R', color: '#4ade80', width: 1.5, dash: '8,4,2,4' },
        C: { a: 43.589, b: -173.59, c: 124.01, name: '525-C', color: '#16a34a', width: 2.5, dash: 'none' }
      }
    };
  } else {
    curveSet = {
      '32.5': {
        R: { a: 505.05, b: -769.26, c: 305.34, d: 6.9242, name: '325-R', color: '#3b82f6', width: 1.5, dash: 'none' },
        C: { a: 545.45, b: -823.38, c: 319.24, d: 11.818, name: '325-C', color: '#2563eb', width: 2.5, dash: 'none' }
      },
      '42.5': {
        R: { a: 707.07, b: -1087.4, c: 450.57, d: -5.6061, name: '425-R', color: '#f87171', width: 1.5, dash: '2,4' },
        C: { a: 525.25, b: -817.75, c: 313.6, d: 22.121, name: '425-C', color: '#dc2626', width: 2.5, dash: 'none' }
      },
      '52.5': {
        R: { a: 545.45, b: -894.81, c: 369.48, d: 13.818, name: '525-R', color: '#4ade80', width: 1.5, dash: '8,4,2,4' },
        C: { a: 573.91, b: -984.34, c: 435.71, d: 4.4767, name: '525-C', color: '#16a34a', width: 2.5, dash: 'none' }
      }
    };
  }

  return curveSet[cement] ? curveSet[cement][type] : curveSet['42.5']['C'];
}

function calculateStrength(wc, curve) {
  if (!curve) return null;
  let y;
  if (curve.d !== undefined) {
    y = curve.a * Math.pow(wc, 3) + curve.b * Math.pow(wc, 2) + curve.c * wc + curve.d;
  } else {
    y = curve.a * Math.pow(wc, 2) + curve.b * wc + curve.c;
  }
  return Math.max(10, Math.min(70, y));
}

function calculateWc(strength, curve) {
  if (!curve) return null;
  let low = 0.3;
  let high = 0.75;
  
  function evalCurve(x) {
    if (curve.d !== undefined) {
      return curve.a * Math.pow(x, 3) + curve.b * Math.pow(x, 2) + curve.c * x + curve.d;
    } else {
      return curve.a * Math.pow(x, 2) + curve.b * x + curve.c;
    }
  }

  let fLow = evalCurve(low);
  let fHigh = evalCurve(high);

  if (strength > fLow || strength < fHigh) return null;

  for (let i = 0; i < 100; i++) {
    let mid = (low + high) / 2;
    let fMid = evalCurve(mid);
    if (fMid > strength) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

function renderWCChart() {
  const width = 680;
  const height = 400;
  const left = 60;
  const right = 60; 
  const top = 20;
  const bottom = 60;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const xMin = 0.3;
  const xMax = 0.75;
  const yMin = 10;
  const yMax = 70;

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

  if (targetY !== null && activeCurve) {
    targetX = calculateWc(targetY, activeCurve);
  }

  let grid = '';
  for (let i = 0; i <= 60; i += 5) {
    const val = yMin + i;
    if (val > yMax) break;
    const py = y(val);
    grid += `<line x1="${left}" y1="${py}" x2="${width - right}" y2="${py}" stroke="#d7e0e8" />`;
    grid += `<text x="${left - 15}" y="${py + 4}" text-anchor="end" font-size="12" fill="#334155">${val}</text>`;
  }
  for (let i = 0; i <= 9; i++) {
    const val = xMin + i * 0.05;
    if (val > xMax + 0.001) break;
    const px = x(val);
    grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${height - bottom}" stroke="#d7e0e8" />`;
    grid += `<text x="${px}" y="${height - bottom + 20}" text-anchor="middle" font-size="12" fill="#334155">${val.toFixed(2).replace(/\.?0+$/, '')}</text>`;
  }

  let curveLines = '';
  allCurves.forEach(c => {
    let path = '';
    for (let wc = 0.35; wc <= 0.7001; wc += 0.005) {
      let val = (c.d !== undefined) ? 
        (c.a * Math.pow(wc, 3) + c.b * Math.pow(wc, 2) + c.c * wc + c.d) :
        (c.a * Math.pow(wc, 2) + c.b * wc + c.c);
      
      path += `${path === '' ? 'M' : 'L'} ${x(wc)} ${y(val)} `;
    }
    curveLines += `<path d="${path}" fill="none" stroke="${c.color}" stroke-width="${c.width}" stroke-dasharray="${c.dash}" />`;
    
    const labelWc = 0.35; 
    const labelVal = (c.d !== undefined) ? 
      (c.a * Math.pow(labelWc, 3) + c.b * Math.pow(labelWc, 2) + c.c * labelWc + c.d) :
      (c.a * Math.pow(labelWc, 2) + c.b * labelWc + c.c);
    
    if (labelVal >= 5 && labelVal <= 75) {
        curveLines += `<text x="${x(labelWc)}" y="${y(labelVal) - 5}" font-size="11" fill="${c.color}" font-weight="bold" text-anchor="start">${c.name}</text>`;
    }
  });

  let intersectionLines = '';
  let intersectionText = '';
  if (targetX !== null) {
    const px = x(targetX);
    const py = y(targetY);

    intersectionLines += `<line x1="${left}" y1="${py}" x2="${px}" y2="${py}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${height - bottom}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<circle cx="${px}" cy="${py}" r="4" fill="#dc2626" />`;

    intersectionText = `
      <div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">
        نسبت آب به سیمان متناظر با مقاومت هدف: <strong>${targetX.toFixed(3)}</strong>
      </div>
    `;
  } else if (targetY !== null) {
     intersectionText = `
      <div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">
        مقاومت هدف ${targetY.toFixed(1)} MPa خارج از محدوده نمودار است.
      </div>
    `;
  } else {
    intersectionText = `
      <div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">
        لطفاً مقاومت هدف را تعیین کنید.
      </div>
    `;
  }

  return `
    <h3>نمودار نسبت آب به سیمان و مقاومت فشاری</h3>
    <div class="table-scroll">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="نمودار نسبت آب به سیمان" style="width:100%;max-width:900px;background:white">
        <defs>
          <clipPath id="plot-area-clip">
            <rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" />
          </clipPath>
        </defs>

        ${grid}
        
        <line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
        <line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />

        <g clip-path="url(#plot-area-clip)">
          ${curveLines}
          ${intersectionLines}
        </g>

        <text x="${left - 45}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155" transform="rotate(-90 ${left - 45} ${height / 2})">مقاومت فشاری متوسط (N/mm²)</text>
        <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#334155">نسبت آب به سیمان</text>
      </svg>
    </div>
    ${intersectionText}
  `;
}

/* =========================================
   صفحات محاسبات
========================================= */

function renderStep1() {
  return `
    <h2>گام اول — تعیین نسبت آب به سیمان</h2>

    <div class="grid" style="margin-bottom: 15px;">
      <label class="field">
        نسبت آب به سیمان انتخابی
        <input
          type="number"
          data-key="wc"
          step="0.001"
          value="${data.wc}"
        >
      </label>
      <label class="field">
        مقاومت فشاری متوسط متناظر (MPa)
        <input
          type="number"
          data-key="targetStrengthManual"
          step="0.1"
          value="${getTargetStrength() !== null ? getTargetStrength().toFixed(1) : ''}"
        >
      </label>
    </div>

    ${renderWCChart()}

    <p class="hint" style="margin-top: 15px;">
      توجه: با تغییر هر یک از ورودی‌های بالا (نسبت آب به سیمان یا مقاومت)، مقدار دیگری بر اساس منحنی فعال محاسبه شده و نقطه تقاطع روی نمودار جابجا می‌شود.
    </p>
  `;
}

/* =========================================
   نمودار آب آزاد (صفحه پنجم)
========================================= */

function syncWater() {
  const combined = combinedGrading();
  const fm = finenessModulus(combined) || 4.5;
  const activeAggs = data.aggregates.slice(0, data.aggregateCount);
  const avgFracture = activeAggs.length > 0 ? activeAggs.reduce((sum, a) => sum + Number(a.fracture || 0), 0) / activeAggs.length : 0;
  const isCrushed = avgFracture > 0;

  const eqs = isCrushed ? {
    S3: [4.4766, -76.242, 473.31],
    S2: [3.922, -68.531, 433.0],
    S1: [3.2682, -56.602, 355.02]
  } : {
    S3: [3.3593, -62.257, 408.7],
    S2: [2.9217, -55.384, 372.47],
    S1: [2.4397, -45.811, 305.64]
  };
  const activeEq = eqs[data.slumpClass] || eqs['S3'];
  const waterFromCurve = activeEq[0] * fm * fm + activeEq[1] * fm + activeEq[2];
  if (waterFromCurve) {
    data.water = Math.round(waterFromCurve * 10) / 10;
  }
}

function renderWaterChart(fm, water, isCrushed) {
  const width = 680;
  const height = 400;
  const left = 60;
  const right = 60; 
  const top = 20;
  const bottom = 60;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const xMin = 3.0;
  const xMax = 8.5;
  const yMin = 100;
  const yMax = 320;

  const x = val => left + (val - xMin) / (xMax - xMin) * plotWidth;
  const y = val => top + (yMax - val) / (yMax - yMin) * plotHeight;

  let allCurves;
  if (isCrushed) {
    allCurves = [
      { a: 4.4766, b: -76.242, c: 473.31, name: 'S3', color: '#991b1b' },
      { a: 3.922, b: -68.531, c: 433.0, name: 'S2', color: '#ec4899' },
      { a: 3.2682, b: -56.602, c: 355.02, name: 'S1', color: '#2563eb' }
    ];
  } else {
    allCurves = [
      { a: 3.3593, b: -62.257, c: 408.7, name: 'S3', color: '#991b1b' },
      { a: 2.9217, b: -55.384, c: 372.47, name: 'S2', color: '#ec4899' },
      { a: 2.4397, b: -45.811, c: 305.64, name: 'S1', color: '#2563eb' }
    ];
  }

  const activeEq = allCurves.find(c => c.name === data.slumpClass) || allCurves[0];
  const waterFromCurve = activeEq.a * fm * fm + activeEq.b * fm + activeEq.c;

  let grid = '';
  for (let i = 100; i <= 320; i += 20) {
    const py = y(i);
    grid += `<line x1="${left}" y1="${py}" x2="${width - right}" y2="${py}" stroke="#d7e0e8" />`;
    grid += `<text x="${left - 15}" y="${py + 4}" text-anchor="end" font-size="12" fill="#334155">${i}</text>`;
  }
  for (let i = 3.0; i <= 8.5; i += 0.5) {
    const px = x(i);
    grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${height - bottom}" stroke="#d7e0e8" />`;
    grid += `<text x="${px}" y="${height - bottom + 20}" text-anchor="middle" font-size="12" fill="#334155">${i.toFixed(2)}</text>`;
  }

  let curveLines = '';
  allCurves.forEach(c => {
    let path = '';
    for (let xv = 3.35; xv <= 8.01; xv += 0.1) {
      let yv = c.a * xv * xv + c.b * xv + c.c;
      path += `${path === '' ? 'M' : 'L'} ${x(xv)} ${y(yv)} `;
    }
    curveLines += `<path d="${path}" fill="none" stroke="${c.color}" stroke-width="2.5" />`;
    
    const labelY = c.a * 3.35 * 3.35 + c.b * 3.35 + c.c;
    if (labelY >= yMin && labelY <= yMax) {
      curveLines += `<text x="${x(3.35)}" y="${y(labelY) - 5}" font-size="12" fill="${c.color}" font-weight="bold" text-anchor="start">${c.name}</text>`;
    }
  });

  let intersectionLines = '';
  if (fm >= xMin && fm <= xMax && water >= yMin && water <= yMax) {
    const px = x(fm);
    const py = y(water);
    intersectionLines += `<line x1="${left}" y1="${py}" x2="${px}" y2="${py}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${height - bottom}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
    intersectionLines += `<circle cx="${px}" cy="${py}" r="4" fill="#dc2626" />`;
  }

  return `
    <h3>نمودار تعیین آب آزاد بر اساس مدول نرمی</h3>
    <div class="table-scroll">
      <svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:900px;background:white">
        <defs>
          <clipPath id="water-plot-area">
            <rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" />
          </clipPath>
        </defs>
        ${grid}
        <line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
        <line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
        <g clip-path="url(#water-plot-area)">
          ${curveLines}
          ${intersectionLines}
        </g>
        <text x="${left - 45}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155" transform="rotate(-90 ${left - 45} ${height / 2})">آب آزاد (kg/m³)</text>
        <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#334155">مدول نرمی (F.M.)</text>
      </svg>
    </div>
  `;
}

function renderWater() {
  const combined = combinedGrading();
  const fm = finenessModulus(combined) || 4.5;
  
  const activeAggs = data.aggregates.slice(0, data.aggregateCount);
  const avgFracture = activeAggs.length > 0 ? activeAggs.reduce((sum, a) => sum + Number(a.fracture || 0), 0) / activeAggs.length : 0;
  const isCrushed = avgFracture > 0;

  let waterFromCurve = null;
  const eqs = isCrushed ? {
    S3: [4.4766, -76.242, 473.31],
    S2: [3.922, -68.531, 433.0],
    S1: [3.2682, -56.602, 355.02]
  } : {
    S3: [3.3593, -62.257, 408.7],
    S2: [2.9217, -55.384, 372.47],
    S1: [2.4397, -45.811, 305.64]
  };
  const activeEq = eqs[data.slumpClass] || eqs['S3'];
  waterFromCurve = activeEq[0] * fm * fm + activeEq[1] * fm + activeEq[2];

  const reduction = data.admixture === 'water_reducer' ? (waterFromCurve * num('admixturePct') / 100) : 0;
  const reductionPct = data.admixture === 'water_reducer' ? num('admixturePct') : 0;
  const calculatedWater = waterFromCurve - reduction;

  return `
    <h2>گام دوم — تعیین آب آزاد</h2>
    
    <div class="grid" style="margin-bottom: 15px;">
      <label class="field">
        مدول نرمی مخلوط (F.M.)
        <input type="number" readonly value="${fm.toFixed(2)}">
      </label>
      <label class="field">
        میزان آب آزاد انتخابی (kg/m³)
        <input type="number" data-key="water" step="0.1" value="${data.water}">
      </label>
    </div>

    ${renderWaterChart(fm, data.water, isCrushed)}

    <h3 style="margin-top: 20px;">پارامترهای محاسباتی</h3>
    <table>
      <tbody>
        <tr><td>۱. مدول نرمی مخلوط سنگدانه</td><td>${fm.toFixed(2)}</td></tr>
        <tr><td>۲. اسلامپ مشخصه</td><td>${data.slumpClass} (${data.slump} mm)</td></tr>
        <tr><td>۳. درصد شکستگی متوسط معادل برای مخلوط سنگدانه</td><td>${avgFracture.toFixed(1)}٪ (${isCrushed ? 'تیزگوشه' : 'گردگوشه'})</td></tr>
        <tr><td>۴. میزان آب آزاد مورد نیاز حاصل از منحنی (kg/m³)</td><td>${waterFromCurve ? waterFromCurve.toFixed(1) : 'نامشخص'}</td></tr>
        <tr>
          <td>۵. درصد کاهش مقدار آب آزاد ناشی از مصرف روان‌کننده (%)</td>
          <td>
            <input type="number" data-key="admixturePct" step="0.1" value="${data.admixture === 'water_reducer' ? data.admixturePct : 0}" ${data.admixture !== 'water_reducer' ? 'disabled' : ''} style="width: 80px; padding: 4px;">
          </td>
        </tr>
        <tr><td>۶. مقدار کاهش آب آزاد (kg/m³)</td><td>${reduction.toFixed(1)}</td></tr>
        <tr><td>۷. میزان آب آزاد مورد نیاز محاسبه شده (kg/m³)</td><td>${calculatedWater.toFixed(1)}</td></tr>
      </tbody>
    </table>
  `;
}

/* =========================================
   صفحه ششم (تعیین مقدار سیمان)
========================================= */

function renderCement() {
  const result = new Step4().run();
  const wf = effectiveWater();
  const wc = num('wc');
  const cement = result.cement;
  
  const maxC = data.limitMaxCementOn ? num('limitMaxCement') : 350;
  const minC = data.limitMinCementOn ? num('limitMinCement') : 280;
  
  const isOk = cement < maxC;

  return `
    <h2>گام سوم — تعیین مقدار سیمان</h2>

    <!-- Top Formula Section -->
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 15px; margin-bottom: 30px; font-size: 1.1em; padding: 15px; border-bottom: 2px solid #e2e8f0;">
      <div style="display: flex; align-items: center;">
        <span style="font-weight: bold; margin-left: 10px;">C =</span>
        <div style="display: flex; flex-direction: column; align-items: center; margin-left: 10px;">
          <span style="border-bottom: 1px solid #333; padding: 0 5px; font-size: 0.9em;">میزان آب مورد نیاز انتخاب شده (Wf)</span>
          <span style="padding: 0 5px; font-size: 0.9em;">نسبت آب به سیمان انتخاب شده (W/C)</span>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;">
        <span style="border-bottom: 1px solid #333; padding: 0 5px;">${wf.toFixed(2)}</span>
        <span style="padding: 0 5px;">${wc.toFixed(3)}</span>
      </div>

      <span style="font-weight: bold; font-size: 1.5em;">=</span>
      
      <div style="background: #f1f5f9; padding: 8px 20px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 1.3em; margin: 0 10px;">
        ${cement.toFixed(2)}
      </div>
      
      <span>Kg/m3</span>
      
      <span style="margin-right: 20px;">&lt; ${maxC} Kg/m3</span>
      
      ${isOk ? '<span style="color: #16a34a; font-weight: bold; margin-right: 10px;">OK</span>' : '<span style="color: #dc2626; font-weight: bold; margin-right: 10px;">محدودیت دارد</span>'}
    </div>

    <!-- Middle Section (Correction) -->
    <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
      <h4 style="margin-top: 0; margin-bottom: 15px; color: #475569; text-align: right;">اصلاح مقدار آب و محاسبه مجدد مقدار سیمان</h4>
      <div style="display: flex; justify-content: space-between; align-items: center;">
         <div style="font-size: 0.95em;">مقدار افزایش آب به ازای هر ۱۰ کیلوگرم سیمان اضافی</div>
         <div style="display: flex; align-items: center;">
             <div style="background: white; border: 1px solid #94a3b8; padding: 6px 12px; margin-left: 10px; min-width: 60px; text-align: center; font-weight: bold;">1/50</div>
             <div>Kg/10 kg</div>
         </div>
      </div>
    </div>

    <!-- Bottom Right Section (3 parameters) -->
    <div style="display: flex; justify-content: flex-end;">
      <div style="border: 1px solid #cbd5e1; padding: 25px; width: 100%; max-width: 450px; background: #f8fafc; border-radius: 8px;">
         
         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            <span>حداکثر مقدار سیمان</span>
            <div style="display: flex; align-items: center;">
                <input type="number" value="${maxC}" readonly style="width: 80px; text-align: center; border: 1px solid #cbd5e1; padding: 4px; background: #fff; border-radius: 4px; margin-left: 10px;">
                <span>Kg/m3</span>
            </div>
         </div>

         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            <span>مقدار سیمان محاسبه شده</span>
            <div style="display: flex; align-items: center;">
                <span style="background: #e2e8f0; padding: 6px 15px; font-weight: bold; border-radius: 4px; margin-left: 10px;">${cement.toFixed(2)}</span>
                <span>Kg/m3</span>
            </div>
         </div>

         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            <span>حداقل مقدار سیمان</span>
            <div style="display: flex; align-items: center;">
                <input type="number" value="${minC}" readonly style="width: 80px; text-align: center; border: 1px solid #cbd5e1; padding: 4px; background: #fff; border-radius: 4px; margin-left: 10px;">
                <span>Kg/m3</span>
            </div>
         </div>

         <div style="text-align: center; font-size: 0.9em; color: #64748b; margin-top: 15px;">
            نتیجه: مقدار سیمان بین حدود تعیین شده در مشخصات طرح قرار دارد.
         </div>
      </div>
    </div>
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
      ['نسبت آب به سیمان', num('wc')],
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
        const oldWc = data.wc;
        const oldTarget = data.targetStrengthManual;
        const oldMethod = data.targetMethod;

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
            syncWater();
          }

          if (key === 'admixture' && value === 'none') {
            data.admixturePct = 0;
          }

          if (key === 'wc') {
            const curve = getActiveCurve();
            const y = calculateStrength(num('wc'), curve);
            if (y !== null) {
              data.targetStrengthManual = y;
              data.targetMethod = 'manual';
            }
          } else if (key === 'targetStrengthManual') {
            const curve = getActiveCurve();
            const x = calculateWc(num('targetStrengthManual'), curve);
            if (x !== null) {
              data.wc = x;
            }
            data.targetMethod = 'manual';
          } else if (['cementClass', 'admixture', 'admixturePct'].includes(key)) {
            const curve = getActiveCurve();
            const target = getTargetStrength();
            if (target !== null) {
              const newWc = calculateWc(target, curve);
              if (newWc !== null) data.wc = newWc;
            }
            validate();
          } else if (key === 'targetMethod' || key === 'workshopRank' || key === 'aggregateCount') {
            // No strict validation needed for these keys
          } else if (key === 'water') {
            validate();
          } else {
            validate();
          }

          save();
          view();
        } catch (error) {
          data[key] = oldValue;
          data.slump = oldSlump;
          data.admixturePct = oldPct;
          data.wc = oldWc;
          data.targetStrengthManual = oldTarget;
          data.targetMethod = oldMethod;

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
          
          if (field === 'fracture') {
            const curve = getActiveCurve();
            const target = getTargetStrength();
            if (target !== null) {
              const newWc = calculateWc(target, curve);
              if (newWc !== null) data.wc = newWc;
            }
            syncWater();
          }

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
        syncWater();

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

/* =========================================
   کدهای جدید: منوی سه نقطه‌ای
========================================= */

function initNewMenu() {
  const menuHTML = `
    <div id="app-options-menu" style="position: fixed; top: 15px; left: 15px; z-index: 99999; direction: rtl; font-family: inherit;">
      <button id="app-menu-btn" style="background: #2563eb; color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 20px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; line-height: 1;">⋮</button>
      <div id="app-menu-dropdown" style="display: none; position: absolute; top: 45px; left: 0; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 160px; overflow: hidden;">
        <button id="app-menu-save" style="display: block; width: 100%; padding: 12px; text-align: right; background: none; border: none; border-bottom: 1px solid #eee; cursor: pointer; font-family: inherit; font-size: 14px; color: #333;">💾 ذخیره طرح</button>
        <button id="app-menu-load" style="display: block; width: 100%; padding: 12px; text-align: right; background: none; border: none; border-bottom: 1px solid #eee; cursor: pointer; font-family: inherit; font-size: 14px; color: #333;">📂 بازیابی طرح</button>
        <button id="app-menu-exit" style="display: block; width: 100%; padding: 12px; text-align: right; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 14px; color: #dc2626;">🚪 خروج</button>
      </div>
    </div>
    <input type="file" id="app-hidden-file-input" accept=".json" style="display: none;">
  `;
  
  document.body.insertAdjacentHTML('beforeend', menuHTML);

  const menuBtn = document.getElementById('app-menu-btn');
  const menuDropdown = document.getElementById('app-menu-dropdown');
  const menuSave = document.getElementById('app-menu-save');
  const menuLoad = document.getElementById('app-menu-load');
  const menuExit = document.getElementById('app-menu-exit');
  const fileInput = document.getElementById('app-hidden-file-input');

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', (e) => {
    if (!document.getElementById('app-options-menu').contains(e.target)) {
      menuDropdown.style.display = 'none';
    }
  });

  menuSave.onclick = () => {
    menuDropdown.style.display = 'none';
    if (confirm('آیا از ذخیره طرح اطمینان دارید؟')) {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beton_project_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('فایل طرح با موفقیت ذخیره شد.');
    }
  };

  menuLoad.onclick = () => {
    fileInput.click();
    menuDropdown.style.display = 'none';
  };

  menuExit.onclick = () => {
    menuDropdown.style.display = 'none';
    const confirmSave = confirm('آیا مایل به ذخیره اطلاعات طرح قبل از خروج هستید؟');
    if (confirmSave) {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beton_project_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTimeout(() => {
        window.close();
        setTimeout(() => alert('مرورگر اجازه بستن خودکار را نمی‌دهد. لطفاً تب را دستی ببندید.'), 500);
      }, 800);
    } else {
      window.close();
      setTimeout(() => alert('مرورگر اجازه بستن خودکار را نمی‌دهد. لطفاً تب را دستی ببندید.'), 500);
    }
  };

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target.result);
        if (loadedData && typeof loadedData === 'object') {
          Object.assign(data, loadedData);
          save();
          view();
          alert('طرح با موفقیت بازیابی شد.');
        } else {
          alert('فایل انتخاب شده معتبر نیست.');
        }
      } catch (err) {
        alert('خطا در خواندن فایل: ' + err.message);
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewMenu);
} else {
  initNewMenu();
}
