
'use strict';

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
  absSand: 1,
  wetSand: 3,
  absGravel: 0.5,
  wetGravel: 1,
  targetMethod: 'manual',
  workshopRank: 'A',
  targetStrengthManual: '',
  aggregateShares: ['', '', '', '']
};

const sieves = [
  { label: 'درصد گذشته از الک ۳۷٫۵ mm', mm: 37.5 },
  { label: 'درصد گذشته از الک ۲۵ mm', mm: 25 },
  { label: 'درصد گذشته از الک ۱۹ mm', mm: 19 },
  { label: 'درصد گذشته از الک ۱۲٫۵ mm', mm: 12.5 },
  { label: 'درصد گذشته از الک ۹٫۵ mm', mm: 9.5 },
  { label: 'درصد گذشته از الک ۴٫۷۵ mm', mm: 4.75 },
  { label: 'درصد گذشته از الک ۲٫۳۶ mm', mm: 2.36 },
  { label: 'درصد گذشته از الک ۱٫۱۸ mm', mm: 1.18 },
  { label: 'درصد گذشته از الک ۰٫۶ mm ـ الک ۳۰', mm: 0.6 },
  { label: 'درصد گذشته از الک ۰٫۳ mm ـ الک ۵۰', mm: 0.3 },
  { label: 'درصد گذشته از الک ۰٫۱۵ mm ـ الک ۱۰۰', mm: 0.15 }
];

const slumpClasses = {
  S1: { label: 'S1 ـ روانی کم', min: 10, max: 40 },
  S2: { label: 'S2 ـ روانی متوسط', min: 50, max: 90 },
  S3: { label: 'S3 ـ روانی نسبتاً زیاد', min: 100, max: 150 },
  S4: { label: 'S4 ـ روانی زیاد', min: 160, max: 210 }
};

/*
 * جدول موقت انحراف معیار.
 * پیش از استفاده مهندسی باید با مرجع اصلی تطبیق داده شود.
 * فقط مقاومت‌های دقیقاً موجود در جدول قابل محاسبه‌اند.
 */
const standardDeviationTable = {
  16: { A: 2.5, B: 3.5, C: 4.0 },
  20: { A: 3.0, B: 4.0, C: 5.0 },
  25: { A: 3.5, B: 4.5, C: 5.5 },
  30: { A: 4.0, B: 5.0, C: 6.0 },
  35: { A: 4.0, B: 5.0, C: 6.0 },
  40: { A: 4.5, B: 5.5, C: 6.5 }
};

const admixtureOptions = [
  { value: 'none', label: 'بدون افزودنی' },
  { value: 'slump', label: 'افزودنی افزایش‌دهنده اسلامپ' },
  { value: 'water_reducer', label: 'افزودنی کاهنده نیاز آب' }
];

const titles = [
  'اطلاعات اولیه',
  'مشخصات سنگدانه‌ها',
  'سهم‌بندی سنگدانه‌ها',
  '۱. آب به سیمان',
  '۲. آب آزاد',
  '۳. مقدار سیمان',
  'گزارش نهایی'
];

let stored = {};

try {
  stored = JSON.parse(localStorage.getItem('beton479') || '{}') || {};
} catch (_) {}

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
} else {
  data.aggregates = data.aggregates.map((a, i) => ({
    ...defaultAggregate(i),
    ...a,
    passing: Array.isArray(a.passing)
      ? sieves.map((_, j) => {
          const v = a.passing[j];
          return v === '' || v == null ? '' : Number(v);
        })
      : defaultAggregate(i).passing
  }));
}

data.aggregateCount = Math.max(
  2,
  Math.min(4, Number(data.aggregateCount) || 2)
);

while (data.aggregates.length < data.aggregateCount) {
  data.aggregates.push(defaultAggregate(data.aggregates.length));
}

data.aggregates = data.aggregates.slice(0, 4);

if (!Array.isArray(data.aggregateShares)) {
  data.aggregateShares = ['', '', '', ''];
}

data.aggregateShares = Array.from({ length: 4 }, (_, i) => {
  const v = data.aggregateShares[i];
  return v === '' || v == null ? '' : Number(v);
});

let page = 0;

const fields = {
  strength: ['مقاومت مشخصه استوانه‌ای (MPa)', 0.1],
  slump: ['اسلامپ (mm)', 1],
  msa: ['حداکثر اندازه اسمی سنگدانه NMSA (mm)', 0.1],
  water: ['آب آزاد پایه (kg/m³)', 0.1],
  wc: ['نسبت آب به سیمان', 0.001],
  coarseShare: ['سهم حجمی شن از کل سنگدانه', 0.001],
  air: ['هوای بتن (%)', 0.1],
  sgCement: ['چگالی نسبی سیمان', 0.01],
  sgSand: ['چگالی نسبی ماسه', 0.01],
  sgGravel: ['چگالی نسبی شن', 0.01]
};

function num(key) {
  return Number(data[key]);
}

function save() {
  try {
    localStorage.setItem('beton479', JSON.stringify(data));
  } catch (_) {}
}

function selected(key, value) {
  return String(data[key]) === String(value) ? 'selected' : '';
}

function numberInput(key, label, step, extra = '') {
  return `<label class="field">${label}
    <input data-key="${key}" type="number"
      step="${step}" value="${data[key]}" ${extra}>
  </label>`;
}

function selectInput(key, label, options) {
  return `<label class="field">${label}
    <select data-key="${key}">
      ${options.map(o => `
        <option value="${o.value}" ${selected(key, o.value)}>
          ${o.label}
        </option>
      `).join('')}
    </select>
  </label>`;
}

function group(keys) {
  return `<div class="grid">${keys.map(key => {
    const [label, step] = fields[key];
    return numberInput(key, label, step);
  }).join('')}</div>`;
}

function slumpRange() {
  return slumpClasses[data.slumpClass] || slumpClasses.S3;
}

function effectiveWater() {
  const base = num('water');

  if (data.admixture === 'water_reducer') {
    return base * (1 - num('admixturePct') / 100);
  }

  return base;
}

function validate() {
  const numericKeys = [
    'strength', 'slump', 'msa', 'water', 'wc',
    'coarseShare', 'air', 'sgCement', 'sgSand',
    'sgGravel', 'admixturePct', 'limitMinCement',
    'limitMaxCement', 'limitWc'
  ];

  for (const key of numericKeys) {
    if (!Number.isFinite(Number(data[key]))) {
      throw Error('یکی از ورودی‌های عددی نامعتبر است.');
    }
  }

  if (num('strength') <= 0) {
    throw Error('مقاومت مشخصه باید مثبت باشد.');
  }

  const range = slumpRange();

  if (num('slump') < range.min || num('slump') > range.max) {
    throw Error(
      `اسلامپ باید در بازه ${range.min} تا ${range.max} میلی‌متر باشد.`
    );
  }

  if (![9.5, 12.5, 19, 25].includes(num('msa'))) {
    throw Error('حداکثر اندازه اسمی سنگدانه معتبر نیست.');
  }

  if (num('water') <= 0 || num('wc') <= 0 || num('wc') >= 1) {
    throw Error('آب باید مثبت و نسبت آب به سیمان بین صفر و یک باشد.');
  }

  if (num('coarseShare') <= 0 || num('coarseShare') >= 1) {
    throw Error('سهم شن باید بین صفر و یک باشد.');
  }

  if (num('air') < 0 || num('air') >= 15) {
    throw Error('درصد هوای بتن نامعتبر است.');
  }

  if (num('admixturePct') < 0 || num('admixturePct') >= 100) {
    throw Error('درصد افزودنی باید حداقل صفر و کمتر از ۱۰۰ باشد.');
  }

  for (const key of ['sgCement', 'sgSand', 'sgGravel']) {
    if (num(key) <= 0) {
      throw Error('چگالی نسبی باید مثبت باشد.');
    }
  }

  const cement = effectiveWater() / num('wc');

  if (data.limitMinCementOn && cement < num('limitMinCement')) {
    throw Error('مقدار سیمان از حداقل تعیین‌شده کمتر است.');
  }

  if (data.limitMaxCementOn && cement > num('limitMaxCement')) {
    throw Error('مقدار سیمان از حداکثر تعیین‌شده بیشتر است.');
  }

  if (data.limitWcOn && num('wc') > num('limitWc')) {
    throw Error('نسبت آب به سیمان از حداکثر مجاز بیشتر است.');
  }
}

function validateAggregates() {
  if (![2, 3, 4].includes(Number(data.aggregateCount))) {
    throw Error('تعداد سنگدانه‌ها باید ۲، ۳ یا ۴ باشد.');
  }

  for (let i = 0; i < data.aggregateCount; i++) {
    const a = data.aggregates[i];

    if (
      a.fracture === '' ||
      !Number.isFinite(Number(a.fracture)) ||
      Number(a.fracture) < 0 ||
      Number(a.fracture) > 100
    ) {
      throw Error(`درصد شکستگی سنگدانه ${i + 1} باید بین صفر و ۱۰۰ باشد.`);
    }

    if (!Array.isArray(a.passing) || a.passing.length !== sieves.length) {
      throw Error(`اطلاعات دانه‌بندی سنگدانه ${i + 1} معتبر نیست.`);
    }

    for (let j = 0; j < sieves.length; j++) {
      const v = a.passing[j];

      if (v === '' || v == null) continue;

      if (
        !Number.isFinite(Number(v)) ||
        Number(v) < 0 ||
        Number(v) > 100
      ) {
        throw Error(
          `درصد عبوری از الک ${sieves[j].mm} باید بین صفر و ۱۰۰ باشد.`
        );
      }
    }
  }
}

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
    return { cement: effectiveWater() / num('wc') };
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

    const gravelVolume = aggregateVolume * num('coarseShare');
    const sandVolume = aggregateVolume - gravelVolume;

    const drySand = sandVolume * num('sgSand') * 1000;
    const dryGravel = gravelVolume * num('sgGravel') * 1000;
    const admixtureMass = cement * num('admixturePct') / 100;

    return {
      cement,
      water,
      drySand,
      dryGravel,
      admixtureMass,
      volume: vc + vw + va + sandVolume + gravelVolume
    };
  }
}

function checkboxField(key, label, valueKey, valueLabel, step) {
  return `<div class="limit-box">
    <label class="checkline">
      <input type="checkbox" data-check="${key}"
        ${data[key] ? 'checked' : ''}>
      <span>${label}</span>
    </label>
    ${data[key] ? numberInput(valueKey, valueLabel, step) : ''}
  </div>`;
}

function renderHome() {
  const range = slumpRange();

  return `
    <h2>اطلاعات اولیه طرح</h2>

    <div class="grid">
      ${numberInput('strength', fields.strength[0], 0.1)}
      ${selectInput('slumpClass', 'رده اسلامپ',
        Object.entries(slumpClasses).map(([value, item]) => ({
          value,
          label: `${item.label} (${item.min}–${item.max} mm)`
        }))
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
      محدوده‌های اسلامپ فعلی اولیه‌اند و باید با مرجع معتبر کنترل شوند.
    </p>

    <div class="grid">
      ${selectInput('cementClass', 'رده مقاومتی سیمان', [
        { value: '32.5', label: '۳۲٫۵' },
        { value: '42.5', label: '۴۲٫۵' },
        { value: '52.5', label: '۵۲٫۵' }
      ])}
      ${numberInput('sgCement', fields.sgCement[0], 0.01)}
    </div>

    <div class="grid">
      ${selectInput('admixture', 'نوع افزودنی', admixtureOptions)}
      ${numberInput(
        'admixturePct',
        'درصد افزودنی نسبت به جرم سیمان (%)',
        0.1,
        'min="0" max="99.9"'
      )}
    </div>

    <p class="hint">
      درصد افزودنی کاهنده نیاز آب به‌صورت کاهش آب در محاسبات اعمال می‌شود.
      این مدل ساده است و باید با مشخصات محصول کنترل شود.
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
function renderTargetStrength() {
  const fc = num('strength');
  const rank = data.workshopRank;
  const row = standardDeviationTable[fc];
  const S = row ? row[rank] : null;
  const validS = Number.isFinite(S);

  const fcm1 = validS ? fc + 1.34 * S : null;
  const fcm2 = validS ? 0.9 * fc + 2.33 * S : null;
  const targetAuto = validS ? Math.max(fcm1, fcm2) : null;

  return `
    <h3>تعیین مقاومت هدف طرح</h3>

    <div class="grid">
      <label class="field">روش تعیین مقاومت هدف
        <select data-key="targetMethod">
          <option value="manual" ${selected('targetMethod', 'manual')}>
            ورود دستی
          </option>
          <option value="auto" ${selected('targetMethod', 'auto')}>
            محاسبه خودکار
          </option>
        </select>
      </label>

      <label class="field">رتبه کارگاه
        <select data-key="workshopRank">
          <option value="A" ${selected('workshopRank', 'A')}>الف</option>
          <option value="B" ${selected('workshopRank', 'B')}>ب</option>
          <option value="C" ${selected('workshopRank', 'C')}>ج</option>
        </select>
      </label>
    </div>

    <p>
      مقاومت مشخصه:
      <strong>${fc.toFixed(2)} MPa</strong>
    </p>

    ${
      validS
        ? `<p>انحراف معیار S: <strong>${S.toFixed(2)} MPa</strong></p>`
        : `<p class="hint">
            برای مقاومت ${fc} مگاپاسکال در جدول فعلی مقدار S وجود ندارد.
            مقادیر جدول: ۱۶، ۲۰، ۲۵، ۳۰، ۳۵ و ۴۰ مگاپاسکال هستند.
          </p>`
    }

    ${
      data.targetMethod === 'manual'
        ? `
          <label class="field">مقاومت هدف طرح (MPa)
            <input type="number" min="0" step="0.1"
              data-key="targetStrengthManual"
              value="${data.targetStrengthManual}">
          </label>
          <p class="hint">
            مقدار مقاومت هدف را پس از محاسبه و کنترل با مرجع طرح وارد کنید.
          </p>
        `
        : validS
          ? `
                        <p>رابطه اول: fcm1 = fc + 1.34 × S</p>
            <p>
              جایگذاری:
              ${fc.toFixed(2)} + 1.34 × ${S.toFixed(2)}
              = ${fcm1.toFixed(2)} MPa
            </p>

            <p>رابطه دوم: fcm2 = 0.9 × fc + 2.33 × S</p>
            <p>
              جایگذاری:
              0.9 × ${fc.toFixed(2)} + 2.33 × ${S.toFixed(2)}
              = ${fcm2.toFixed(2)} MPa
            </p>
            <p>
              مقاومت هدف انتخابی:
              <strong>${targetAuto.toFixed(2)} MPa</strong>
            </p>
          `
          : `<p class="hint">محاسبه خودکار در دسترس نیست.</p>`
    }

    <p class="hint">
      جدول S موقت است و باید با مرجع اصلی طرح مخلوط تطبیق داده شود.
    </p>
  `;
}

function renderAggregateTable() {
  const countOptions = [
    { value: 2, label: '۲ نوع سنگدانه' },
    { value: 3, label: '۳ نوع سنگدانه' },
    { value: 4, label: '۴ نوع سنگدانه' }
  ];

  const msaOptions = [
    { value: 9.5, label: '۹٫۵ میلی‌متر' },
    { value: 12.5, label: '۱۲٫۵ میلی‌متر' },
    { value: 19, label: '۱۹ میلی‌متر' },
    { value: 25, label: '۲۵ میلی‌متر' }
  ];

  const headers = Array.from(
    { length: data.aggregateCount },
    (_, i) => `<th>سنگدانه ${i + 1}</th>`
  ).join('');

  const nameRow = `
    <tr>
      <th>نام سنگدانه</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input class="table-input" type="text"
            data-agg="${i}" data-agg-field="name"
            value="${escapeAttribute(data.aggregates[i].name)}">
        </td>
      `).join('')}
    </tr>
  `;

  const fractureRow = `
    <tr>
      <th>درصد شکستگی (%)</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input class="table-input" type="number"
            min="0" max="100" step="0.1"
            data-agg="${i}" data-agg-field="fracture"
            value="${data.aggregates[i].fracture}">
        </td>
      `).join('')}
    </tr>
  `;

  const sieveRows = sieves.map((sieve, j) => `
    <tr>
      <th>${sieve.label}</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input class="table-input" type="number"
            min="0" max="100" step="0.1"
            aria-label="درصد عبوری سنگدانه ${i + 1} از ${sieve.mm} میلی‌متر"
            data-agg="${i}" data-sieve="${j}"
            value="${data.aggregates[i].passing[j] ?? ''}">
        </td>
      `).join('')}
    </tr>
  `).join('');

  return `
    <h2>مشخصات سنگدانه‌ها</h2>

    <div class="grid">
      ${selectInput('aggregateCount', 'تعداد انواع سنگدانه', countOptions)}
      ${selectInput('msa', 'حداکثر اندازه اسمی سنگدانه NMSA', msaOptions)}
    </div>

    <p class="hint">
      درصد عبوری و درصد شکستگی را از نتایج آزمایش وارد کنید.
      خانه‌های خالی به معنی داده واردنشده هستند و با صفر یکسان نیستند.
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
      وزن نهایی ماسه و شن بر مبنای وزن خشک محاسبه می‌شود.
      چگالی نسبی را مطابق مشخصات مصالح وارد کنید.
    </p>

    ${renderTargetStrength()}

    <p class="hint">
      سری الک‌ها باید با نسخه معتبر استاندارد ملی ایران ۳۰۲ تطبیق داده شود.
    </p>
  `;
}

function renderShares() {
  const count = data.aggregateCount;
  const shares = data.aggregateShares.slice(0, count);

  const allSharesEntered = shares.every(
    v => v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0
  );

  const shareTotal = allSharesEntered
    ? shares.reduce((sum, v) => sum + Number(v), 0)
    : null;

  const sharesValid =
    allSharesEntered && Math.abs(shareTotal - 100) < 0.0001;

  const shareInputs = Array.from({ length: count }, (_, i) => `
    <label class="field">
      سهم ${escapeHtml(data.aggregates[i].name)} (%)
      <input type="number" min="0" max="100" step="0.1"
        data-share="${i}"
        value="${data.aggregateShares[i] ?? ''}">
    </label>
  `).join('');

  let combinedRows = '';
  let chart = '';

  if (sharesValid) {
    const allSieveDataEntered = sieves.every((_, j) =>
      data.aggregates.slice(0, count).every(a =>
        a.passing[j] !== '' &&
        a.passing[j] != null &&
        Number.isFinite(Number(a.passing[j]))
      )
    );

    if (allSieveDataEntered) {
      const combined = sieves.map((sieve, j) => {
        const value = data.aggregates
          .slice(0, count)
          .reduce((sum, a, i) => {
            return sum +
              Number(a.passing[j]) *
              Number(data.aggregateShares[i]) / 100;
          }, 0);

        return { mm: sieve.mm, value };
      });

      combinedRows = combined.map(item => `
        <tr>
          <td>${item.mm} mm</td>
          <td>${item.value.toFixed(2)}%</td>
        </tr>
      `).join('');

      chart = renderGradingChart(combined);
    } else {
      combinedRows = `
        <tr>
          <td colspan="2">
            برای محاسبه دانه‌بندی ترکیبی، درصد عبوری تمام سنگدانه‌ها
            از تمام الک‌ها را وارد کنید.
          </td>
        </tr>
      `;
    }
  } else {
    combinedRows = `
      <tr>
        <td colspan="2">
          مجموع سهم سنگدانه‌ها باید دقیقاً ۱۰۰ درصد باشد.
        </td>
      </tr>
    `;
  }

  return `
    <h2>سهم‌بندی سنگدانه‌ها</h2>

    <p class="hint">
      سهم هر سنگدانه را به درصد وارد کنید. مجموع سهم‌ها باید ۱۰۰٪ باشد.
    </p>

    <div class="grid">
      ${shareInputs}
    </div>

    <p>
      مجموع سهم‌ها:
      <strong>${shareTotal === null ? '—' : shareTotal.toFixed(2) + '%'}</strong>
    </p>

    <h3>دانه‌بندی ترکیبی</h3>

    <div class="table-scroll">
      <table>
        <thead>
          <tr><th>اندازه الک</th><th>درصد عبوری ترکیبی</th></tr>
        </thead>
        <tbody>${combinedRows}</tbody>
      </table>
    </div>

    ${chart}

    <p class="hint">
      دانه‌بندی ترکیبی با میانگین وزنی درصدهای عبوری محاسبه می‌شود.
      این نتیجه به‌تنهایی به معنی تأیید انطباق با محدوده استاندارد نیست.
    </p>
  `;
}

function renderGradingChart(points) {
  const width = 340;
  const height = 220;
  const pad = 35;

  const sorted = [...points].sort((a, b) => a.mm - b.mm);

  const minLog = Math.log10(sorted[0].mm);
  const maxLog = Math.log10(sorted[sorted.length - 1].mm);

  const coords = sorted.map(p => {
    const x = pad +
      ((Math.log10(p.mm) - minLog) / (maxLog - minLog)) *
      (width - 2 * pad);

    const y = height - pad -
      (p.value / 100) * (height - 2 * pad);

    return { x, y, mm: p.mm, value: p.value };
  });

  const polyline = coords.map(p => `${p.x},${p.y}`).join(' ');

  return `
    <h3>منحنی دانه‌بندی ترکیبی</h3>
    <div class="table-scroll">
      <svg viewBox="0 0 ${width} ${height}"
        role="img" aria-label="منحنی دانه‌بندی ترکیبی"
        style="width:100%;max-width:500px;background:#fff">
        <line x1="${pad}" y1="${pad}" x2="${pad}"
          y2="${height - pad}" stroke="#64748b" />
        <line x1="${pad}" y1="${height - pad}"
          x2="${width - pad}" y2="${height - pad}"
          stroke="#64748b" />

        ${[0, 20, 40, 60, 80, 100].map(v => {
          const y = height - pad -
            (v / 100) * (height - 2 * pad);

          return `
            <line x1="${pad}" y1="${y}"
              x2="${width - pad}" y2="${y}"
              stroke="#d7e0e8" stroke-width="1" />
            <text x="${pad - 5}" y="${y + 4}"
              text-anchor="end" font-size="9" fill="#334155">${v}</text>
          `;
        }).join('')}

        <polyline points="${polyline}" fill="none"
          stroke="#087e8b" stroke-width="2.5" />

        ${coords.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="3" fill="#087e8b" />
        `).join('')}

        <text x="${width / 2}" y="${height - 5}"
          text-anchor="middle" font-size="10" fill="#334155">
          اندازه الک (mm) ـ محور افقی لگاریتمی
        </text>

        <text x="12" y="${height / 2}"
          text-anchor="middle" font-size="10"
          fill="#334155" transform="rotate(-90 12 ${height / 2})">
          درصد عبوری
        </text>
      </svg>
    </div>
  `;
}

function renderStep1() {
  const r = new Step1().run();

  return `
    <h2>گام اول — تعیین نسبت آب به سیمان</h2>
    ${group(['wc'])}

    <p class="hint">
      نسبت آب به سیمان باید با توجه به مقاومت، دوام، سیمان و مصالح
      از مرجع معتبر انتخاب شود. در این نسخه مقدار منتخب کاربر ثبت می‌شود.
    </p>

    ${table([
      ['مقاومت مشخصه (MPa)', r.strength],
      ['رده مقاومتی سیمان', data.cementClass],
      ['نسبت آب به سیمان منتخب', r.wc]
    ])}
  `;
}

function renderWater() {
  const r = new Step3().run();

  return `
    <h2>گام دوم — تعیین آب آزاد</h2>
    ${group(['water'])}

    <p class="hint">
      آب آزاد پایه را بر اساس مرجع معتبر انتخاب کنید.
    </p>

    ${table([
      ['آب آزاد پایه (kg/m³)', r.baseWater],
      ['آب محاسباتی پس از کاهش انتخابی (kg/m³)', r.water]
    ])}
  `;
}

function renderCement() {
  const r = new Step4().run();

  return `
    <h2>گام سوم — تعیین مقدار سیمان</h2>
    ${group(['wc', 'water'])}

    ${table([
      ['آب مؤثر محاسبات (kg/m³)', effectiveWater()],
      ['مقدار سیمان محاسباتی (kg/m³)', r.cement],
      ['جرم افزودنی (kg/m³)', r.cement * num('admixturePct') / 100]
    ])}

    <p class="hint">
      سیمان = آب محاسباتی ÷ نسبت آب به سیمان.
    </p>
  `;
}

function getTargetStrength() {
  const fc = num('strength');

  if (data.targetMethod === 'manual') {
    const value = Number(data.targetStrengthManual);

    return data.targetStrengthManual !== '' &&
      Number.isFinite(value) &&
      value > 0
      ? value
      : null;
  }

  const row = standardDeviationTable[fc];

  if (!row) return null;

  const S = row[data.workshopRank];

  if (!Number.isFinite(S)) return null;

  return Math.max(
    fc + 1.34 * S,
    0.9 * fc + 2.33 * S
  );
}

function renderReport() {
  const r = new Step5().run();
  const target = getTargetStrength();

  return `
    <h2>گزارش نهایی — وزن خشک مصالح</h2>

    ${table([
      ['رده مقاومتی سیمان', data.cementClass],
      ['مقاومت مشخصه (MPa)', num('strength')],
      ['مقاومت هدف طرح (MPa)', target === null ? 'تعیین نشده' : target],
      ['حداکثر اندازه اسمی سنگدانه NMSA (mm)', num('msa')],
      ['آب مؤثر طرح (kg/m³)', r.water],
      ['سیمان (kg/m³)', r.cement],
      ['ماسه خشک (kg/m³)', r.drySand],
      ['شن خشک (kg/m³)', r.dryGravel],
      ['جرم افزودنی (kg/m³)', r.admixtureMass],
      ['حجم محاسباتی اجزا (m³)', r.volume]
    ])}

    <button type="button" id="print">چاپ / ذخیره PDF</button>

    <p class="hint">
      وزن خشک ماسه و شن از مدل ساده دو سنگدانه‌ای محاسبه می‌شود.
      سهم‌بندی چندسنگدانه‌ای صفحه سوم هنوز به محاسبات وزن نهایی متصل نیست.
      برای استفاده اجرایی، ورودی‌ها و روابط باید با مرجع معتبر کنترل شوند.
    </p>
  `;
}

function table(rows) {
  return `<table><tbody>${rows.map(([label, value]) => `
    <tr>
      <td>${label}</td>
      <td>${typeof value === 'number' ? value.toFixed(2) : value}</td>
    </tr>
  `).join('')}</tbody></table>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function view() {
  document.getElementById('tabs').innerHTML = titles.map((title, i) =>
    `<button type="button" data-page="${i}"
      class="${i === page ? 'active' : ''}">${title}</button>`
  ).join('');

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
    }
  } catch (error) {
    html = `
      <p class="bad">${escapeHtml(error.message)}</p>
      <p>ورودی‌های این بخش را بررسی کنید.</p>
    `;
  }

  document.getElementById('screen').innerHTML =
    `<article class="panel">${html}</article>`;

  document.querySelectorAll('[data-page]').forEach(button => {
    button.onclick = () => {
      page = Number(button.dataset.page);
      view();
    };
  });

  document.querySelectorAll('[data-key]').forEach(element => {
    element.onchange = () => {
      const key = element.dataset.key;
      const oldValue = data[key];

      if (element.type === 'number' && element.value === '') {
        data[key] = '';
      } else {
        data[key] = element.type === 'number'
          ? Number(element.value)
          : element.value;
      }

      try {
        if (key === 'aggregateCount') {
          data.aggregateCount = Number(data.aggregateCount);

          while (data.aggregates.length < data.aggregateCount) {
            data.aggregates.push(defaultAggregate(data.aggregates.length));
          }

          data.aggregates = data.aggregates.slice(0, 4);
        }

        if (key === 'slumpClass') {
          const range = slumpRange();

          if (num('slump') < range.min || num('slump') > range.max) {
            data.slump = Math.min(
              range.max,
              Math.max(range.min, num('slump'))
            );
          }
        }

        if (key === 'slump') {
          const range = slumpRange();

          if (num('slump') < range.min || num('slump') > range.max) {
            throw Error(
              `اسلامپ باید بین ${range.min} و ${range.max} میلی‌متر باشد.`
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
  });

  document.querySelectorAll('[data-check]').forEach(element => {
    element.onchange = () => {
      data[element.dataset.check] = element.checked;
      save();
      view();
    };
  });

  document.querySelectorAll('[data-agg]').forEach(element => {
    element.onchange = () => {
      const index = Number(element.dataset.agg);
      const field = element.dataset.aggField;
      const sieveIndex = Number(element.dataset.sieve);
      let oldValue;

      if (field === 'name') {
        oldValue = data.aggregates[index].name;
        data.aggregates[index].name = element.value;
      } else if (field === 'fracture') {
        oldValue = data.aggregates[index].fracture;
        data.aggregates[index].fracture =
          element.value === '' ? '' : Number(element.value);
      } else {
        oldValue = data.aggregates[index].passing[sieveIndex];
        data.aggregates[index].passing[sieveIndex] =
          element.value === '' ? '' : Number(element.value);
      }

      try {
        if (field === 'fracture' && (
          data.aggregates[index].fracture === '' ||
          !Number.isFinite(data.aggregates[index].fracture) ||
          data.aggregates[index].fracture < 0 ||
          data.aggregates[index].fracture > 100
        )) {
          throw Error('درصد شکستگی باید بین صفر و ۱۰۰ باشد.');
        }

        if (field !== 'name' && field !== 'fracture') {
          const value = data.aggregates[index].passing[sieveIndex];

          if (value !== '' && (
            !Number.isFinite(value) || value < 0 || value > 100
          )) {
            throw Error('درصد عبوری باید بین صفر و ۱۰۰ باشد.');
          }
        }

        save();
        view();
      } catch (error) {
        if (field === 'name') {
          data.aggregates[index].name = oldValue;
        } else if (field === 'fracture') {
          data.aggregates[index].fracture = oldValue;
        } else {
          data.aggregates[index].passing[sieveIndex] = oldValue;
        }

        view();
        alert(error.message);
      }
    };
  });

  document.querySelectorAll('[data-share]').forEach(element => {
    element.onchange = () => {
      const index = Number(element.dataset.share);
      const oldValue = data.aggregateShares[index];
      const value = element.value === '' ? '' : Number(element.value);

      if (
        value !== '' &&
        (!Number.isFinite(value) || value < 0 || value > 100)
      ) {
        alert('سهم هر سنگدانه باید بین صفر و ۱۰۰ باشد.');
        view();
        return;
      }

      data.aggregateShares[index] = value;
      save();
      view();
    };
  });

  const printButton = document.getElementById('print');

  if (printButton) {
    printButton.onclick = () => window.print();
  }

  document.getElementById('prev').disabled = page === 0;
  document.getElementById('next').disabled = page === titles.length - 1;
}

document.getElementById('prev').onclick = () => {
  page = Math.max(0, page - 1);
  view();
};

document.getElementById('next').onclick = () => {
  page = Math.min(titles.length - 1, page + 1);
  view();
};

save();
view();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

function updateAdmixtureField() {
  const admixtureSelect = document.querySelector(
    '[data-key="admixture"]'
  );

  const admixtureInput = document.querySelector(
    '[data-key="admixturePct"]'
  );

  if (!admixtureSelect || !admixtureInput) return;

  const noAdmixture =
    admixtureSelect.value === 'none';

  admixtureInput.disabled = noAdmixture;

  if (noAdmixture) {
    admixtureInput.value = 0;
    data.admixturePct = 0;
  }
}

document.addEventListener('change', function(e) {
  if (e.target.matches('[data-key="admixture"]')) {
    updateAdmixtureField();
  }
});

const originalUpdateAdmixtureView = view;

view = function(...args) {
  const result = originalUpdateAdmixtureView(...args);
  updateAdmixtureField();
  return result;
};
