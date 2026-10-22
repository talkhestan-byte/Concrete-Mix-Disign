
'use strict';

/* =========================================
   طرح ملی مخلوط بتن
   فایل اصلی app.js
========================================= */

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
  aggregateShares: ['', '', '', '']
};

const sieves = [
  { mm: 37.5, label: 'درصد گذشته از الک ۳۷٫۵ mm' },
  { mm: 25, label: 'درصد گذشته از الک ۲۵ mm' },
  { mm: 19, label: 'درصد گذشته از الک ۱۹ mm' },
  { mm: 12.5, label: 'درصد گذشته از الک ۱۲٫۵ mm' },
  { mm: 9.5, label: 'درصد گذشته از الک ۹٫۵ mm' },
  { mm: 4.75, label: 'درصد گذشته از الک ۴٫۷۵ mm' },
  { mm: 2.36, label: 'درصد گذشته از الک ۲٫۳۶ mm' },
  { mm: 1.18, label: 'درصد گذشته از الک ۱٫۱۸ mm' },
  { mm: 0.6, label: 'درصد گذشته از الک ۰٫۶ mm ـ الک ۳۰' },
  { mm: 0.3, label: 'درصد گذشته از الک ۰٫۳ mm ـ الک ۵۰' },
  { mm: 0.15, label: 'درصد گذشته از الک ۰٫۱۵ mm ـ الک ۱۰۰' }
];

const slumpClasses = {
  S1: { label: 'S1 ـ روانی کم', min: 10, max: 40 },
  S2: { label: 'S2 ـ روانی متوسط', min: 50, max: 90 },
  S3: { label: 'S3 ـ روانی نسبتاً زیاد', min: 100, max: 150 },
  S4: { label: 'S4 ـ روانی زیاد', min: 160, max: 210 }
};

/*
  جدول موقت؛ باید با مرجع معتبر کنترل شود.
*/
const standardDeviationTable = {
  16: { A: 2.5, B: 3.5, C: 4.0 },
  20: { A: 3.0, B: 4.0, C: 5.0 },
  25: { A: 3.5, B: 4.5, C: 5.5 },
  30: { A: 4.0, B: 5.0, C: 6.0 },
  35: { A: 4.0, B: 5.0, C: 6.0 },
  40: { A: 4.5, B: 5.5, C: 6.5 }
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
   ذخیره و بازیابی اطلاعات
========================================= */

let stored = {};

try {
  stored = JSON.parse(
    localStorage.getItem('beton479') || '{}'
  ) || {};
} catch (error) {
  stored = {};
}

const data = { ...defaults, ...stored };

function defaultAggregate(index) {
  return {
    name: `سنگدانه ${index + 1}`,
    fracture: 0,
    passing: Array(sieves.length).fill('')
  };
}

if (!Array.isArray(data.aggregates)) {
  data.aggregates = [
    defaultAggregate(0),
    defaultAggregate(1)
  ];
}

data.aggregates = data.aggregates.map((a, i) => ({
  ...defaultAggregate(i),
  ...a,
  passing: Array.isArray(a.passing)
    ? sieves.map((_, j) => {
        const value = a.passing[j];
        return value === '' || value == null
          ? ''
          : Number(value);
      })
    : Array(sieves.length).fill('')
}));

data.aggregateCount = Math.max(
  2,
  Math.min(4, Number(data.aggregateCount) || 2)
);

while (data.aggregates.length < 4) {
  data.aggregates.push(
    defaultAggregate(data.aggregates.length)
  );
}

data.aggregates = data.aggregates.slice(0, 4);

if (!Array.isArray(data.aggregateShares)) {
  data.aggregateShares = ['', '', '', ''];
}

data.aggregateShares = Array.from(
  { length: 4 },
  (_, i) => {
    const value = data.aggregateShares[i];
    return value === '' || value == null
      ? ''
      : Number(value);
  }
);

let page = 0;

function save() {
  try {
    localStorage.setItem(
      'beton479',
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn('خطا در ذخیره اطلاعات', error);
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
  const value = data[key] ?? '';

  return `
    <label class="field">
      ${label}
      <input
        type="number"
        data-key="${key}"
        step="${step}"
        value="${escapeHtml(value)}"
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
        ${options.map(option => `
          <option
            value="${option.value}"
            ${selected(key, option.value)}
          >
            ${option.label}
          </option>
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
            <td>${label}</td>
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
  const value = data[key];

  if (
    value === '' ||
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    throw Error(`${label} باید عدد معتبر باشد.`);
  }

  return Number(value);
}

function effectiveWater() {
  const base = num('water');

  if (data.admixture === 'water_reducer') {
    return base * (
      1 - num('admixturePct') / 100
    );
  }

  return base;
}

function validate() {
  const numericFields = {
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

  for (const [key, label] of Object.entries(numericFields)) {
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
    throw Error('مقدار NMSA معتبر نیست.');
  }

  if (num('water') <= 0) {
    throw Error('آب آزاد باید مثبت باشد.');
  }

  if (num('wc') <= 0 || num('wc') >= 1) {
    throw Error(
      'نسبت آب به سیمان باید بین صفر و یک باشد.'
    );
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
      throw Error(
        'درصد افزودنی باید بین صفر و ۱۰۰ باشد.'
      );
    }
  }

  const cement = effectiveWater() / num('wc');

  if (data.limitMinCementOn) {
    const min = requireNumber(
      'limitMinCement',
      'حداقل سیمان'
    );

    if (min <= 0 || cement < min) {
      throw Error(
        'مقدار سیمان با حداقل تعیین‌شده سازگار نیست.'
      );
    }
  }

  if (data.limitMaxCementOn) {
    const max = requireNumber(
      'limitMaxCement',
      'حداکثر سیمان'
    );

    if (max <= 0 || cement > max) {
      throw Error(
        'مقدار سیمان با حداکثر تعیین‌شده سازگار نیست.'
      );
    }
  }

  if (data.limitWcOn) {
    const maxWc = requireNumber(
      'limitWc',
      'حداکثر نسبت آب به سیمان'
    );

    if (
      maxWc <= 0 ||
      maxWc >= 1 ||
      num('wc') > maxWc
    ) {
      throw Error(
        'نسبت آب به سیمان از حداکثر مجاز بیشتر است.'
      );
    }
  }
}

function validateAggregates() {
  const count = Number(data.aggregateCount);

  if (![2, 3, 4].includes(count)) {
    throw Error('تعداد سنگدانه‌ها باید ۲ تا ۴ باشد.');
  }

  for (let i = 0; i < count; i++) {
    const aggregate = data.aggregates[i];

    if (!aggregate) {
      throw Error('مشخصات سنگدانه موجود نیست.');
    }

    const fracture = Number(aggregate.fracture);

    if (
      aggregate.fracture === '' ||
      !Number.isFinite(fracture) ||
      fracture < 0 ||
      fracture > 100
    ) {
      throw Error(
        `درصد شکستگی سنگدانه ${i + 1} نامعتبر است.`
      );
    }

    let previous = null;

    for (let j = 0; j < sieves.length; j++) {
      const raw = aggregate.passing[j];

      if (raw === '' || raw == null) {
        continue;
      }

      const passing = Number(raw);

      if (
        !Number.isFinite(passing) ||
        passing < 0 ||
        passing > 100
      ) {
        throw Error(
          `درصد عبوری سنگدانه ${i + 1} از الک ${sieves[j].mm} نامعتبر است.`
        );
      }

      /*
        الک‌ها از درشت به ریز مرتب شده‌اند.
        درصد عبوری نباید با ریزتر شدن الک افزایش یابد.
      */
      if (
        previous !== null &&
        passing > previous
      ) {
        throw Error(
          `در سنگدانه ${i + 1}، درصد عبوری الک ${sieves[j].mm} نباید از الک درشت‌تر بیشتر باشد.`
        );
      }

      previous = passing;
    }
  }
}

/* =========================================
   محاسبات طرح
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
      water: effectiveWater(),
      baseWater: num('water')
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
      throw Error(
        'حجم باقی‌مانده برای سنگدانه مثبت نیست.'
      );
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
      ${numberInput(
        'strength',
        fields.strength[0],
        0.1
      )}

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

      ${numberInput(
        'air',
        fields.air[0],
        0.1
      )}
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

      ${numberInput(
        'sgCement',
        fields.sgCement[0],
        0.01
      )}
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
      مدل کاهش آب فعلاً ساده‌سازی شده است و باید
      با مشخصات فنی افزودنی کنترل شود.
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
      ? `
        ${numberInput(
          'targetStrengthManual',
          'مقاومت هدف طرح (MPa)',
          0.1,
          'min="0"'
        )}
      `
      : result
        ? `
          <p>رابطه اول: fcm1 = fc + 1.34 × S</p>

          <p>
            ${fc.toFixed(2)} +
            1.34 × ${result.S.toFixed(2)}
            = ${result.fcm1.toFixed(2)} MPa
          </p>

          <p>
            رابطه دوم:
            fcm2 = 0.9 × fc + 2.33 × S
          </p>

          <p>
            0.9 × ${fc.toFixed(2)} +
            2.33 × ${result.S.toFixed(2)}
            = ${result.fcm2.toFixed(2)} MPa
          </p>

          <p>
            مقاومت هدف انتخابی:
            <strong>
              ${result.target.toFixed(2)} MPa
            </strong>
          </p>
        `
        : `
          <p class="hint">
            محاسبه خودکار در دسترس نیست.
          </p>
        `
    }

    <p class="hint">
      جدول انحراف معیار موقت است و برای
      استفاده مهندسی باید با مرجع اصلی تطبیق داده شود.
    </p>
  `;
}

/* =========================================
   صفحه دوم ـ مشخصات سنگدانه‌ها
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
      <th>${sieve.label}</th>

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
      ${numberInput(
        'sgSand',
        fields.sgSand[0],
        0.01
      )}

      ${numberInput(
        'sgGravel',
        fields.sgGravel[0],
        0.01
      )}
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
   صفحه سوم ـ سهم‌بندی و دانه‌بندی
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

  return sieves.map((sieve, j) => {
    const value = aggregates.reduce(
      (sum, a, i) =>
        sum +
        Number(a.passing[j]) *
        Number(info.shares[i]) / 100,
      0
    );

    return {
      mm: sieve.mm,
      value
    };
  });
}

/*
  مدول نرمی با الک‌های انتخابی محاسبه می‌شود.
  الک‌های ۲۵ و ۱۲٫۵ در این مجموعه لحاظ نشده‌اند.
  تعریف نهایی باید با روش آزمون مرجع کنترل شود.
*/
function finenessModulus(points) {
  if (!points) return null;

  const fmSieves = [
    37.5, 19, 9.5, 4.75,
    2.36, 1.18, 0.6, 0.3, 0.15
  ];

  let totalRetained = 0;

  for (const mm of fmSieves) {
    const point = points.find(p => p.mm === mm);

    if (!point) return null;

    totalRetained += 100 - point.value;
  }

  return totalRetained / 100;
}

function renderGradingChart(combined) {
  const width = 620;
  const height = 350;

  const left = 58;
  const right = 22;
  const top = 22;
  const bottom = 67;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const minLog = Math.log10(0.075);
  const maxLog = Math.log10(37.5);

  function x(mm) {
    return left +
      (Math.log10(mm) - minLog) /
      (maxLog - minLog) * plotWidth;
  }

  function y(value) {
    return top +
      (100 - value) / 100 * plotHeight;
  }

  function drawSeries(points, color, dash = '') {
    const valid = points
      .filter(p =>
        p.value !== '' &&
        p.value != null &&
        Number.isFinite(Number(p.value))
      )
      .sort((a, b) => a.mm - b.mm);

    if (!valid.length) return '';

    const polyline = valid.map(
      p => `${x(p.mm)},${y(Number(p.value))}`
    ).join(' ');

    return `
      <polyline
        points="${polyline}"
        fill="none"
        stroke="${color}"
        stroke-width="2.5"
        stroke-dasharray="${dash}"
      />

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

  const colors = [
    '#2563eb',
    '#ea580c',
    '#16a34a',
    '#9333ea'
  ];

  const aggregateLines = data.aggregates
    .slice(0, data.aggregateCount)
    .map((a, i) => {
      const points = sieves.map((s, j) => ({
        mm: s.mm,
        value: a.passing[j]
      }));

      return drawSeries(points, colors[i], '6 4');
    }).join('');

  const mixLine = combined
    ? drawSeries(combined, '#087e8b')
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
      x="${left - 10}"
      y="${y(value) + 4}"
      text-anchor="end"
      font-size="12"
      fill="#334155"
    >${value}</text>
  `).join('');

  const xTicks = [
    0.075, 0.15, 0.3, 0.6,
    1.18, 2.36, 4.75, 9.5,
    19, 37.5
  ].map(mm => `
    <line
      x1="${x(mm)}"
      y1="${top}"
      x2="${x(mm)}"
      y2="${height - bottom}"
      stroke="#e2e8f0"
    />

    <text
      x="${x(mm)}"
      y="${height - bottom + 18}"
      text-anchor="middle"
      font-size="10"
      fill="#334155"
    >${mm}</text>
  `).join('');

  const legend = data.aggregates
    .slice(0, data.aggregateCount)
    .map((a, i) => `
      <span style="margin:5px;color:${colors[i]}">
        ● ${escapeHtml(a.name)}
      </span>
    `).join('');

  return `
    <h3>منحنی‌های دانه‌بندی</h3>

    <div class="table-scroll">
      <svg
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-label="منحنی دانه‌بندی سنگدانه‌ها و مخلوط"
        style="width:100%;max-width:850px;background:white"
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

        ${aggregateLines}
        ${mixLine}

        <text
          x="${width / 2}"
          y="${height - 13}"
          text-anchor="middle"
          font-size="13"
          fill="#334155"
        >اندازه الک (mm) ـ مقیاس لگاریتمی</text>

        <text
          x="15"
          y="${height / 2}"
          text-anchor="middle"
          font-size="13"
          fill="#334155"
          transform="rotate(-90 15 ${height / 2})"
        >درصد عبوری</text>
      </svg>
    </div>

    <div class="hint">
      ${legend}
      ${combined
        ? '<span style="color:#087e8b">● مخلوط ترکیبی</span>'
        : ''}
    </div>

    <p class="hint">
      محور افقی از الک ۰٫۰۷۵ میلی‌متر آغاز می‌شود.
      در صورت نبود داده برای این الک، نقطه‌ای
      به‌صورت فرضی رسم نمی‌شود.
    </p>
  `;
}

function renderShares() {
  const info = getSharesInfo();

  const shareInputs = Array.from(
    { length: info.count },
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

  const combinedRows = combined
    ? combined.map(p => `
        <tr>
          <td>${p.mm} mm</td>
          <td>${p.value.toFixed(2)}%</td>
        </tr>
      `).join('')
    : `
        <tr>
          <td colspan="2">
            برای محاسبه دانه‌بندی ترکیبی،
            مجموع سهم‌ها باید ۱۰۰٪ باشد و
            تمام درصدهای عبوری وارد شوند.
          </td>
        </tr>
      `;

  const fm = finenessModulus(combined);

  return `
    <h2>سهم‌بندی سنگدانه‌ها</h2>

    <p class="hint">
      سهم هر سنگدانه را وارد کنید.
      مجموع سهم‌ها باید ۱۰۰ درصد باشد.
    </p>

    <div class="grid">
      ${shareInputs}
    </div>

    <p>
      مجموع سهم‌ها:
      <strong>
        ${info.total === null
          ? '—'
          : info.total.toFixed(2) + '%'}
      </strong>
    </p>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>اندازه الک</th>
            <th>درصد عبوری ترکیبی</th>
          </tr>
        </thead>

        <tbody>
          ${combinedRows}
        </tbody>
      </table>
    </div>

    <p>
      مدول نرمی مخلوط:
      <strong>
        ${fm === null ? 'تعیین نشده' : fm.toFixed(2)}
      </strong>
    </p>

    ${renderGradingChart(combined)}

    <p class="hint">
      دانه‌بندی ترکیبی از میانگین وزنی
      درصدهای عبوری محاسبه شده است.
      انطباق با محدوده استاندارد هنوز
      به‌صورت خودکار بررسی نمی‌شود.
    </p>
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
      نسبت آب به سیمان فعلاً توسط کاربر انتخاب می‌شود
      و باید با مقاومت و دوام موردنیاز کنترل شود.
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

    <p class="hint">
      مقدار آب پایه باید با مرجع معتبر انتخاب شود.
    </p>
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
      مقدار سیمان = آب محاسباتی ÷ نسبت آب به سیمان
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
      محاسبه وزن خشک ماسه و شن فعلاً با مدل
      ساده دو سنگدانه‌ای انجام می‌شود.
      سهم‌بندی چندسنگدانه‌ای هنوز به
      محاسبات وزن نهایی متصل نشده است.
    </p>

    <p class="hint">
      پیش از استفاده اجرایی، تمام ورودی‌ها،
      روابط و نتایج باید با مرجع معتبر کنترل شوند.
    </p>
  `;
}

/* =========================================
   نمایش صفحات
========================================= */

function view() {
  const tabs = document.getElementById('tabs');
  const screen = document.getElementById('screen');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (!tabs || !screen || !prev || !next) {
    console.error(
      'عناصر اصلی برنامه در index.html پیدا نشدند.'
    );
    return;
  }

  tabs.innerHTML = titles.map((title, i) => `
    <button
      type="button"
      data-page="${i}"
      class="${i === page ? 'active' : ''}"
    >
      ${title}
    </button>
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

  /* تغییر صفحه */

  document.querySelectorAll('[data-page]').forEach(
    button => {
      button.onclick = () => {
        page = Number(button.dataset.page);
        view();
      };
    }
  );

  /* ورودی‌های عمومی */

  document.querySelectorAll('[data-key]').forEach(
    element => {
      element.onchange = () => {
        const key = element.dataset.key;
        const oldValue = data[key];

        let value = element.value;

        if (element.type === 'number') {
          value = value === ''
            ? ''
            : Number(value);
        }

        data[key] = value;

        try {
          if (key === 'aggregateCount') {
            data.aggregateCount = Number(value);

            while (
              data.aggregates.length <
              data.aggregateCount
            ) {
              data.aggregates.push(
                defaultAggregate(data.aggregates.length)
              );
            }
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

          /*
            ورودی‌های غیرعددی مانند روش مقاومت هدف
            نباید به علت مقدار نامعتبر یک فیلد
            نامرتبط، مسدود شوند.
          */

          if (
            key !== 'targetMethod' &&
            key !== 'workshopRank' &&
            key !== 'aggregateCount' &&
            key !== 'targetStrengthManual'
          ) {
            validate();
          }

          if (key === 'targetStrengthManual') {
            if (
              value !== '' &&
              (!Number.isFinite(Number(value)) ||
                Number(value) <= 0)
            ) {
              throw Error(
                'مقاومت هدف باید عددی مثبت باشد.'
              );
            }
          }

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

  /* کنترل‌های اختیاری */

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

  /* جدول مشخصات سنگدانه‌ها */

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

  /* سهم‌بندی سنگدانه‌ها */

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
          alert(
            'سهم سنگدانه باید بین صفر و ۱۰۰ باشد.'
          );
          return;
        }

        data.aggregateShares[index] = value;

        save();
        view();

        /*
          هنگام ورود تدریجی سهم‌ها،
          مجموع الزاماً ۱۰۰ نیست.
          بنابراین تا تکمیل ورودی‌ها
          نباید تغییرات رد شوند.
        */
      };
    }
  );

  /* چاپ */

  const printButton = document.getElementById('print');

  if (printButton) {
    printButton.onclick = () => window.print();
  }

  prev.disabled = page === 0;
  next.disabled = page === titles.length - 1;
}

/* =========================================
   راه‌اندازی برنامه
========================================= */

function startApp() {
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (!prev || !next) {
    console.error(
      'دکمه‌های قبلی و بعدی در HTML موجود نیستند.'
    );
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
