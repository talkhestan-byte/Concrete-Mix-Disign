'use strict';

/* =========================================================
   طرح ملی مخلوط بتن ـ نسخه یکپارچه
   منحنی‌های مرجع A/B/C بر اساس جدول ارائه‌شده
   ========================================================= */

/* ---------- تنظیمات اولیه ---------- */

const defaults = {
  strength: 30,
  slumpClass: 'S3',
  slump: 120,
  msa: 19,
  aggregateCount: 2,
  cementClass: 42.5,
  water: 185,
  wc: 0.50,
  coarseShare: 60,
  grading: 'continuous',
  admixture: 'none',
  admixturePct: 0,
  minCementEnabled: false,
  minCement: 280,
  maxCementEnabled: false,
  maxCement: 450,
  maxWcEnabled: false,
  maxWc: 0.50,
  air: 2,
  sgCement: 3.15,
  sgSand: 2.65,
  sgGravel: 2.70,
  targetMethod: 'manual',
  workshopRank: 'B',
  targetStrengthManual: '',
  aggregateShares: ['', '', '', ''],
  showAggregateCurves: [true, true, true, true]
};

const STORAGE_KEY = 'beton479';

const storedData = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
})();

const data = Object.assign({}, defaults, storedData);

data.aggregateCount = Math.max(
  2,
  Math.min(4, Number(data.aggregateCount) || 2)
);

data.aggregateShares = Array.isArray(data.aggregateShares)
  ? [...data.aggregateShares, '', '', '', ''].slice(0, 4)
  : ['', '', '', ''];

data.showAggregateCurves = Array.isArray(data.showAggregateCurves)
  ? [...data.showAggregateCurves, true, true, true, true].slice(0, 4)
  : [true, true, true, true];

/* ---------- الک‌ها ---------- */

const sieves = [
  { label: '۳۷٫۵', mm: 37.5 },
  { label: '۲۵', mm: 25 },
  { label: '۱۹', mm: 19 },
  { label: '۱۲٫۵', mm: 12.5 },
  { label: '۹٫۵', mm: 9.5 },
  { label: '۴٫۷۵', mm: 4.75 },
  { label: '۲٫۳۶', mm: 2.36 },
  { label: '۱٫۱۸', mm: 1.18 },
  { label: '۰٫۶', mm: 0.6 },
  { label: '۰٫۳', mm: 0.3 },
  { label: '۰٫۱۵', mm: 0.15 }
];

/* ---------- جدول منحنی‌های مرجع ---------- */
/* هر ردیف: [A, B, C] و ترتیب ردیف‌ها مطابق sieves است. */

const p3Reference = {
  37.5: [
    [100, 100, 100],
    [75, 85, 91],
    [62, 76, 86],
    [47, 64, 77],
    [39, 57, 72],
    [24, 42, 60],
    [14, 30, 48],
    [9, 21, 37],
    [5, 14, 27],
    [2, 8, 17],
    [1, 4, 8]
  ],
  25: [
    [100, 100, 100],
    [100, 100, 100],
    [83, 89, 94],
    [62, 75, 85],
    [51, 67, 79],
    [32, 49, 65],
    [19, 36, 52],
    [11, 25, 41],
    [6, 16, 29],
    [3, 9, 19],
    [1, 4, 9]
  ],
  19: [
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [75, 84, 90],
    [62, 75, 84],
    [38, 55, 70],
    [23, 40, 56],
    [14, 28, 43],
    [8, 18, 31],
    [4, 11, 20],
    [2, 5, 10]
  ],
  12.5: [
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [82, 89, 93],
    [51, 66, 77],
    [31, 47, 62],
    [18, 33, 48],
    [10, 21, 35],
    [5, 12, 22],
    [2, 5, 11]
  ],
  9.5: [
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100],
    [61, 74, 83],
    [37, 53, 66],
    [22, 37, 51],
    [12, 24, 37],
    [6, 14, 24],
    [2, 6, 12]
  ]
};

const slumpClasses = {
  S1: { min: 10, max: 40, title: 'S1' },
  S2: { min: 50, max: 90, title: 'S2' },
  S3: { min: 100, max: 150, title: 'S3' },
  S4: { min: 160, max: 210, title: 'S4' }
};

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

let page = 0;

/* ---------- ابزارهای عمومی ---------- */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('ذخیره اطلاعات انجام نشد.', e);
  }
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function num(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fmt(value, digits = 2) {
  if (!Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString('fa-IR', {
    maximumFractionDigits: digits
  });
}

function selected(current, value) {
  return String(current) === String(value) ? ' selected' : '';
}

function checked(value) {
  return value ? ' checked' : '';
}

function numberInput(key, label, value, min, max, step = 1, unit = '') {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <span class="input-line">
        <input type="number"
          data-key="${escapeHtml(key)}"
          value="${escapeHtml(value)}"
          min="${min}" max="${max}" step="${step}">
        ${unit ? `<small>${escapeHtml(unit)}</small>` : ''}
      </span>
    </label>`;
}

function selectInput(key, label, value, options) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <select data-key="${escapeHtml(key)}">
        ${options.map(o => `
          <option value="${escapeHtml(o.value)}"
            ${selected(value, o.value)}>
            ${escapeHtml(o.label)}
          </option>`).join('')}
      </select>
    </label>`;
}

function checkboxField(key, label, value) {
  return `
    <label class="check-field">
      <input type="checkbox" data-key="${escapeHtml(key)}"
        ${checked(value)}>
      <span>${escapeHtml(label)}</span>
    </label>`;
}

function group(title, content) {
  return `<section class="panel">
    <h3>${escapeHtml(title)}</h3>
    ${content}
  </section>`;
}

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

data.aggregates = data.aggregates.slice(0, 4);

while (data.aggregates.length < 4) {
  data.aggregates.push(defaultAggregate(data.aggregates.length));
}

data.aggregates = data.aggregates.map((aggregate, index) => {
  const base = defaultAggregate(index);
  const item = Object.assign(base, aggregate || {});
  item.passing = Array.isArray(item.passing)
    ? [...item.passing, ...Array(sieves.length).fill('')].slice(0, sieves.length)
    : Array(sieves.length).fill('');
  return item;
});

function slumpRange() {
  return slumpClasses[data.slumpClass] || slumpClasses.S3;
}

function effectiveWater() {
  const baseWater = num(data.water, 185);
  const pct = num(data.admixturePct, 0);

  if (data.admixture === 'water_reducer') {
    return baseWater * (1 - Math.max(0, Math.min(pct, 40)) / 100);
  }

  return baseWater;
}

function getTargetStrength() {
  const strength = num(data.strength, 30);
  const keys = Object.keys(standardDeviationTable).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((best, current) =>
    Math.abs(current - strength) < Math.abs(best - strength) ? current : best
  , keys[0]);

  const rank = ['A', 'B', 'C'].includes(data.workshopRank)
    ? data.workshopRank
    : 'B';

  const deviation = standardDeviationTable[nearest][rank];

  return {
    characteristic: strength,
    deviation,
    target: data.targetStrengthManual !== ''
      ? num(data.targetStrengthManual, strength + deviation)
      : strength + deviation,
    tableStrength: nearest
  };
}

function validateAggregates() {
  const errors = [];

  for (let i = 0; i < data.aggregateCount; i++) {
    const aggregate = data.aggregates[i];
    let previousPassing = null;

    for (let j = 0; j < sieves.length; j++) {
      const raw = aggregate.passing[j];
      if (raw === '' || raw === null || raw === undefined) continue;

      const passing = Number(raw);

      if (!Number.isFinite(passing) || passing < 0 || passing > 100) {
        errors.push(`${aggregate.name}: درصد عبوری هر الک باید بین صفر و ۱۰۰ باشد.`);
        break;
      }

      if (previousPassing !== null && passing > previousPassing) {
        errors.push(
          `${aggregate.name}: درصد عبوری الک ریزتر نباید از الک درشت‌تر بیشتر باشد.`
        );
        break;
      }

      previousPassing = passing;
    }
  }

  return errors;
}

/* ---------- صفحه اول ---------- */

function renderHome() {
  const slump = slumpRange();

  return `
    ${group('مشخصات بتن', `
      <div class="fields">
        ${numberInput('strength', 'مقاومت مشخصه (نمونه استوانه‌ای)', data.strength, 10, 100, 1, 'MPa')}
        ${selectInput('slumpClass', 'رده اسلامپ', data.slumpClass, [
          { value: 'S1', label: 'S1' },
          { value: 'S2', label: 'S2' },
          { value: 'S3', label: 'S3' },
          { value: 'S4', label: 'S4' }
        ])}
        ${numberInput('slump', 'اسلامپ', data.slump, slump.min, slump.max, 1, 'میلی‌متر')}
        ${selectInput('cementClass', 'رده مقاومتی سیمان', data.cementClass, [
          { value: 32.5, label: '۳۲٫۵' },
          { value: 42.5, label: '۴۲٫۵' },
          { value: 52.5, label: '۵۲٫۵' }
        ])}
        ${numberInput('sgCement', 'وزن مخصوص سیمان', data.sgCement, 2, 4, 0.01)}
      </div>
      <p class="hint">محدوده اسلامپ رده انتخاب‌شده: ${slump.min} تا ${slump.max} میلی‌متر.</p>
    `)}

    ${group('بافت و دانه‌بندی', `
      ${selectInput('grading', 'وضعیت دانه‌بندی', data.grading, [
        { value: 'continuous', label: 'پیوسته — توزیع تدریجی اندازه دانه‌ها' },
        { value: 'fine_deficient', label: 'کمبود ریزدانه — کاهش سهم دانه‌های ریز' },
        { value: 'coarse_deficient', label: 'کمبود درشت‌دانه — کاهش سهم دانه‌های درشت' },
        { value: 'gap', label: 'گسسته — فقدان بخشی از اندازه‌های میانی' }
      ])}
    `)}

    ${group('افزودنی', `
      <div class="fields">
        ${selectInput('admixture', 'نوع افزودنی', data.admixture, admixtureOptions)}
        ${numberInput('admixturePct', 'درصد اثر یا مقدار کاهندگی آب', data.admixturePct, 0, 40, 1, '%')}
      </div>
      <p class="hint">درصد کاهندگی آب فقط در حالت «افزودنی کاهنده نیاز آب» در محاسبه آب مؤثر استفاده می‌شود.</p>
    `)}

    ${group('محدودیت‌های اختیاری طرح', `
      <div class="fields">
        <div>
          ${checkboxField('minCementEnabled', 'حداقل سیمان', data.minCementEnabled)}
          ${numberInput('minCement', 'حداقل مقدار سیمان', data.minCement, 0, 1000, 5, 'kg/m³')}
        </div>
        <div>
          ${checkboxField('maxCementEnabled', 'حداکثر سیمان', data.maxCementEnabled)}
          ${numberInput('maxCement', 'حداکثر مقدار سیمان', data.maxCement, 0, 1500, 5, 'kg/m³')}
        </div>
        <div>
          ${checkboxField('maxWcEnabled', 'حداکثر نسبت آب به سیمان', data.maxWcEnabled)}
          ${numberInput('maxWc', 'حداکثر نسبت آب به سیمان', data.maxWc, 0.1, 1, 0.01)}
        </div>
      </div>
    `)}
  `;
}

/* ---------- صفحه دوم: مشخصات سنگدانه‌ها ---------- */

function renderAggregateTable() {
  const rows = sieves.map((sieve, sieveIndex) => `
    <tr>
      <th>درصد گذشته از الک ${sieve.label} میلی‌متر</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input type="number" min="0" max="100" step="1"
            data-aggregate="${i}" data-sieve="${sieveIndex}"
            value="${escapeHtml(data.aggregates[i].passing[sieveIndex])}"
            aria-label="${escapeHtml(data.aggregates[i].name)} الک ${sieve.label}">
        </td>
      `).join('')}
    </tr>
  `).join('');

  const nameRow = `
    <tr>
      <th>نام سنگدانه</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input type="text" data-aggregate-name="${i}"
            value="${escapeHtml(data.aggregates[i].name)}">
        </td>
      `).join('')}
    </tr>`;

  const fractureRow = `
    <tr>
      <th>درصد شکستگی (در صورت نیاز)</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input type="number" min="0" max="100" step="1"
            data-fracture="${i}"
            value="${escapeHtml(data.aggregates[i].fracture)}">
        </td>
      `).join('')}
    </tr>`;

  return `
    ${group('تنظیمات سنگدانه', `
      <div class="fields">
        ${selectInput('aggregateCount', 'تعداد انواع سنگدانه', data.aggregateCount, [
          { value: 2, label: '۲ نوع' },
          { value: 3, label: '۳ نوع' },
          { value: 4, label: '۴ نوع' }
        ])}
        ${selectInput('msa', 'NMSA — اندازه اسمی حداکثر سنگدانه', data.msa, [
          { value: 9.5, label: '۹٫۵ میلی‌متر' },
          { value: 12.5, label: '۱۲٫۵ میلی‌متر' },
          { value: 19, label: '۱۹ میلی‌متر' },
          { value: 25, label: '۲۵ میلی‌متر' }
        ])}
      </div>
    `)}

    ${group('جدول دانه‌بندی سنگدانه‌ها', `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>الک / مشخصات</th>
              ${Array.from({ length: data.aggregateCount }, (_, i) =>
                `<th>${escapeHtml(data.aggregates[i].name)}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>${nameRow}${fractureRow}${rows}</tbody>
        </table>
      </div>
      <p class="hint">درصدهای گذشته از الک را طبق نتایج آزمایش دانه‌بندی وارد کن. خانه‌های خالی به‌صورت داده صفر در نظر گرفته نمی‌شوند.</p>
    `)}

    ${group('وزن مخصوص سنگدانه‌ها', `
      <div class="fields">
        ${numberInput('sgSand', 'وزن مخصوص سنگدانه ریز', data.sgSand, 1, 4, 0.01)}
        ${numberInput('sgGravel', 'وزن مخصوص سنگدانه درشت', data.sgGravel, 1, 4, 0.01)}
      </div>
      <p class="hint">وزن‌های نهایی سنگدانه‌ها بر مبنای وزن خشک گزارش می‌شوند؛ ورودی رطوبت ماسه و شن در این نسخه وجود ندارد.</p>
    `)}

    ${renderTargetStrength()}
  `;
}

function renderTargetStrength() {
  const result = getTargetStrength();

  return group('تعیین مقاومت هدف طرح', `
    <div class="fields">
      ${selectInput('workshopRank', 'رتبه کارگاه', data.workshopRank, [
        { value: 'A', label: 'A — کنترل کیفی خوب' },
        { value: 'B', label: 'B — کنترل کیفی متوسط' },
        { value: 'C', label: 'C — کنترل کیفی ضعیف‌تر' }
      ])}
      ${numberInput('targetStrengthManual', 'مقاومت هدف واردشده توسط کاربر', data.targetStrengthManual, 1, 150, 0.1, 'MPa')}
    </div>
    <p>مقاومت مشخصه واردشده: <strong>${fmt(result.characteristic, 1)} MPa</strong></p>
    <p>انحراف معیار جدول برای رتبه انتخاب‌شده: <strong>${fmt(result.deviation, 2)} MPa</strong></p>
    <p class="hint">مقدار انحراف معیار نمایش‌داده‌شده از جدول داخلی برنامه خوانده می‌شود. اعتبار نهایی اعداد باید با جدول مرجع راهنمای طرح کنترل شود.</p>
  `);
}

/* ---------- صفحه سوم: سهم‌بندی و منحنی‌ها ---------- */

function getCombinedPassing() {
  const count = data.aggregateCount;
  const aggregates = data.aggregates.slice(0, count);

  const shares = aggregates.map((aggregate, index) =>
    num(data.aggregateShares[index], 0)
  );

  const totalShare = shares.reduce((sum, value) => sum + value, 0);

  if (totalShare <= 0) return null;

  const allDataEntered = aggregates.every(aggregate =>
    aggregate.passing.every(value =>
      value !== '' && value !== null && value !== undefined &&
      Number.isFinite(Number(value))
    )
  );

  if (!allDataEntered) return null;

  return sieves.map((sieve, sieveIndex) => {
    const weighted = aggregates.reduce((sum, aggregate, index) => {
      return sum + Number(aggregate.passing[sieveIndex]) * shares[index] / totalShare;
    }, 0);

    return {
      mm: sieve.mm,
      value: weighted
    };
  });
}

function renderShares() {
  const count = data.aggregateCount;

  const shareFields = Array.from({ length: count }, (_, i) => `
    <div class="share-row">
      <label class="field">
        <span>سهم ${escapeHtml(data.aggregates[i].name)}</span>
        <span class="input-line">
          <input type="number" min="0" max="100" step="1"
            data-share="${i}"
            value="${escapeHtml(data.aggregateShares[i])}">
          <small>درصد</small>
        </span>
      </label>
      <label class="check-field">
        <input type="checkbox" data-show-aggregate="${i}"
          ${checked(data.showAggregateCurves[i])}>
        <span>نمایش منحنی این سنگدانه</span>
      </label>
    </div>
  `).join('');

  const combined = getCombinedPassing();

  return `
    ${group('سهم هر سنگدانه در مخلوط', `
      <div class="share-list">${shareFields}</div>
      <p class="hint">سهم‌ها برای رسم منحنی مخلوط به‌صورت خودکار نسبت‌بندی می‌شوند. مجموع سهم‌های واردشده لازم نیست دقیقاً ۱۰۰ باشد.</p>
    `)}

    ${group('منحنی‌های دانه‌بندی', `
      <p class="hint">منحنی‌های مرجع A، B و C بر اساس NMSA انتخاب‌شده رسم می‌شوند. برای رسم منحنی هر سنگدانه، تیک کنار نام آن را فعال کن.</p>
      ${renderGradingChart(combined)}
    `)}
  `;
}

/* ---------- رسم نمودار SVG ---------- */

function renderGradingChart(combinedPoints) {
  const reference = p3Reference[Number(data.msa)];

  if (!reference) {
    return `<p class="notice">برای NMSA انتخاب‌شده جدول مرجع در برنامه وجود ندارد.</p>`;
  }

  const width = 620;
  const height = 390;
  const left = 58;
  const right = 18;
  const top = 22;
  const bottom = 94;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const minX = 0.075;
  const maxX = 37.5;

  const x = mm => left +
    (Math.log10(mm) - Math.log10(minX)) /
    (Math.log10(maxX) - Math.log10(minX)) * plotWidth;

  const y = value => top + (100 - value) / 100 * plotHeight;

  const series = [
    {
      name: 'مرجع A',
      color: '#d94841',
      points: sieves.map((sieve, i) => ({
        mm: sieve.mm,
        value: reference[i][0]
      }))
    },
    {
      name: 'مرجع B',
      color: '#2878b5',
      points: sieves.map((sieve, i) => ({
        mm: sieve.mm,
        value: reference[i][1]
      }))
    },
    {
      name: 'مرجع C',
      color: '#299764',
      points: sieves.map((sieve, i) => ({
        mm: sieve.mm,
        value: reference[i][2]
      }))
    }
  ];

  for (let i = 0; i < data.aggregateCount; i++) {
    if (!data.showAggregateCurves[i]) continue;

    const aggregate = data.aggregates[i];
    const complete = aggregate.passing.every(value =>
      value !== '' && value !== null && value !== undefined &&
      Number.isFinite(Number(value))
    );

    if (!complete) continue;

    series.push({
      name: aggregate.name || `سنگدانه ${i + 1}`,
      color: ['#8e44ad', '#d68910', '#008b8b', '#555555'][i],
      points: sieves.map((sieve, j) => ({
        mm: sieve.mm,
        value: Number(aggregate.passing[j])
      }))
    });
  }

  if (combinedPoints) {
    series.push({
      name: 'منحنی مخلوط',
      color: '#111111',
      points: combinedPoints
    });
  }

  const xTicks = [
    0.075, 0.15, 0.3, 0.6, 1.18, 2.36,
    4.75, 9.5, 12.5, 19, 25, 37.5
  ];

  let svg = `
    <svg class="grading-svg" viewBox="0 0 ${width} ${height}"
      role="img" aria-label="نمودار منحنی‌های مرجع و دانه‌بندی سنگدانه‌ها">
      <rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}"
        fill="#ffffff" stroke="#667788" stroke-width="1"/>
  `;

  for (let value = 0; value <= 100; value += 20) {
    const yy = y(value);

    svg += `
      <line x1="${left}" y1="${yy}" x2="${width - right}" y2="${yy}"
        stroke="#d7e0e7" stroke-width="1"/>
      <text x="${left - 9}" y="${yy + 4}" text-anchor="end"
        font-size="11" fill="#263746">${value}</text>
    `;
  }

  xTicks.forEach(mm => {
    const xx = x(mm);

    svg += `
      <line x1="${xx}" y1="${top}" x2="${xx}" y2="${top + plotHeight}"
        stroke="#e6ebef" stroke-width="1"/>
      <line x1="${xx}" y1="${top + plotHeight}"
        x2="${xx}" y2="${top + plotHeight + 5}"
        stroke="#667788" stroke-width="1"/>
      <text x="${xx}" y="${top + plotHeight + 17}"
        transform="rotate(-42 ${xx} ${top + plotHeight + 17})"
        text-anchor="end" font-size="10" fill="#263746">${mm}</text>
    `;
  });

  svg += `
    <text x="${left + plotWidth / 2}" y="${height - 9}"
      text-anchor="middle" font-size="12" fill="#263746">
      اندازه الک (میلی‌متر) — مقیاس لگاریتمی
    </text>
    <text x="15" y="${top + plotHeight / 2}"
      transform="rotate(-90 15 ${top + plotHeight / 2})"
      text-anchor="middle" font-size="12" fill="#263746">
      درصد عبوری
    </text>
  `;

  series.forEach(item => {
    const points = item.points
      .filter(point =>
        Number.isFinite(Number(point.mm)) &&
        Number.isFinite(Number(point.value))
      )
      .sort((a, b) => a.mm - b.mm);

    if (!points.length) return;

    const polyline = points.map(point =>
      `${x(point.mm).toFixed(2)},${y(point.value).toFixed(2)}`
    ).join(' ');

    const strokeWidth = item.name === 'منحنی مخلوط' ? 3.5 : 2.4;

    svg += `
      <polyline points="${polyline}"
        fill="none" stroke="${item.color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round" stroke-linejoin="round"/>
    `;

    points.forEach(point => {
      svg += `
        <circle cx="${x(point.mm)}" cy="${y(point.value)}" r="2.5"
          fill="${item.color}" stroke="#ffffff" stroke-width="0.6"/>
      `;
    });
  });

  svg += `<g class="chart-legend">`;

  const legendCols = 2;
  const legendStartY = height - 62;

  series.forEach((item, index) => {
    const col = index % legendCols;
    const row = Math.floor(index / legendCols);
    const lx = left + col * 275;
    const ly = legendStartY + row * 20;

    svg += `
      <line x1="${lx}" y1="${ly}" x2="${lx + 25}" y2="${ly}"
        stroke="${item.color}" stroke-width="3"/>
      <text x="${lx + 33}" y="${ly + 4}"
        font-size="11" fill="#263746">${escapeHtml(item.name)}</text>
    `;
  });

  svg += `</g></svg>`;

  return `
    <div class="chart-wrap">
      ${svg}
    </div>
  `;
}

/* ---------- گام‌های محاسباتی ---------- */

class Step1 {
  run() {
    const strength = num(data.strength, 30);
    const target = getTargetStrength().target;

    if (strength <= 0 || target <= 0) {
      throw new Error('مقاومت مشخصه و مقاومت هدف باید بزرگ‌تر از صفر باشند.');
    }

    const slump = num(data.slump, 0);
    const range = slumpRange();

    if (slump < range.min || slump > range.max) {
      throw new Error(
        `اسلامپ واردشده باید در محدوده ${range.min} تا ${range.max} میلی‌متر باشد.`
      );
    }

    return {
      strength,
      target,
      slump
    };
  }
}

class Step3 {
  run() {
    const water = effectiveWater();
    const wc = num(data.wc, 0.5);

    if (water <= 0) throw new Error('مقدار آب باید بزرگ‌تر از صفر باشد.');
    if (wc <= 0 || wc > 1.5) {
      throw new Error('نسبت آب به سیمان باید مقداری مثبت و معتبر باشد.');
    }

    if (data.maxWcEnabled && wc > num(data.maxWc, 0.5)) {
      throw new Error('نسبت آب به سیمان از حداکثر تعیین‌شده بیشتر است.');
    }

    return { water, wc };
  }
}

class Step4 {
  run() {
    const water = effectiveWater();
    const wc = num(data.wc, 0.5);

    let cement = water / wc;

    if (data.minCementEnabled) {
      cement = Math.max(cement, num(data.minCement, 280));
    }

    if (data.maxCementEnabled) {
      cement = Math.min(cement, num(data.maxCement, 450));
    }

    if (cement <= 0) throw new Error('مقدار سیمان محاسبه‌شده معتبر نیست.');

    return { water, wc, cement };
  }
}

class Step5 {
  run() {
    const cementResult = new Step4().run();

    const cement = cementResult.cement;
    const water = cementResult.water;
    const airFraction = Math.max(0, Math.min(num(data.air, 2), 15)) / 100;

    const sgCement = num(data.sgCement, 3.15);
    const sgSand = num(data.sgSand, 2.65);
    const sgGravel = num(data.sgGravel, 2.70);

    if (sgCement <= 0 || sgSand <= 0 || sgGravel <= 0) {
      throw new Error('وزن مخصوص مصالح باید بزرگ‌تر از صفر باشد.');
    }

    const cementVolume = cement / (sgCement * 1000);
    const waterVolume = water / 1000;
    const aggregateVolume = 1 - cementVolume - waterVolume - airFraction;

    if (aggregateVolume <= 0) {
      throw new Error('حجم مطلق سنگدانه‌ها مثبت نیست؛ ورودی‌ها را بررسی کن.');
    }

    const coarseShare = Math.max(0, Math.min(num(data.coarseShare, 60), 100)) / 100;
    const gravelVolume = aggregateVolume * coarseShare;
    const sandVolume = aggregateVolume * (1 - coarseShare);

    const gravelMass = gravelVolume * sgGravel * 1000;
    const sandMass = sandVolume * sgSand * 1000;

    return {
      cement,
      water,
      wc: cementResult.wc,
      sandMass,
      gravelMass,
      aggregateVolume,
      cementVolume,
      waterVolume,
      airFraction
    };
  }
}

/* ---------- گزارش نهایی ---------- */

function renderReport() {
  const calculation = new Step5();
  let result;

  try {
    result = calculation.run();
  } catch (error) {
    return group('گزارش نهایی', `
      <p class="notice">${escapeHtml(error.message)}</p>
      <p>برای تکمیل گزارش، ورودی‌های مراحل قبل را بررسی کن.</p>
    `);
  }

  const target = getTargetStrength();

  return `
    ${group('گزارش طرح مخلوط بتن', `
      <div class="result-grid">
        <div class="result-item">
          <span>مقاومت مشخصه</span>
          <strong>${fmt(target.characteristic, 1)} MPa</strong>
        </div>
        <div class="result-item">
          <span>مقاومت هدف واردشده</span>
          <strong>${fmt(target.target, 1)} MPa</strong>
        </div>
        <div class="result-item">
          <span>آب مؤثر</span>
          <strong>${fmt(result.water, 1)} kg/m³</strong>
        </div>
        <div class="result-item">
          <span>نسبت آب به سیمان</span>
          <strong>${fmt(result.wc, 3)}</strong>
        </div>
        <div class="result-item">
          <span>سیمان</span>
          <strong>${fmt(result.cement, 1)} kg/m³</strong>
        </div>
        <div class="result-item">
          <span>سنگدانه ریز خشک</span>
          <strong>${fmt(result.sandMass, 1)} kg/m³</strong>
        </div>
        <div class="result-item">
          <span>سنگدانه درشت خشک</span>
          <strong>${fmt(result.gravelMass, 1)} kg/m³</strong>
        </div>
      </div>
      <p class="hint">این گزارش از مدل محاسباتی ساده‌شده فعلی برنامه تولید شده است. پیش از استفاده اجرایی، نتایج باید با الزامات کامل نشریه ۴۷۹ و مشخصات مصالح کنترل شوند.</p>
    `)}
  `;
}

/* ---------- محتوای صفحات ---------- */

function renderPageContent() {
  switch (page) {
    case 0:
      return renderHome();
    case 1:
      return renderAggregateTable();
    case 2:
      return renderShares();
    case 3:
      return group('نسبت آب به سیمان', `
        <div class="fields">
          ${numberInput('wc', 'نسبت آب به سیمان', data.wc, 0.1, 1.5, 0.01)}
        </div>
        <p>آب مؤثر فعلی: <strong>${fmt(effectiveWater(), 1)} kg/m³</strong></p>
        <p class="hint">این نسبت را مطابق الزامات دوام و مقاومت طرح تعیین کن.</p>
      `);
    case 4:
      return group('آب آزاد', `
        <div class="fields">
          ${numberInput('water', 'مقدار آب پایه', data.water, 1, 500, 1, 'kg/m³')}
          ${numberInput('air', 'درصد هوای محبوس', data.air, 0, 15, 0.5, '%')}
        </div>
        <p>آب مؤثر پس از اعمال کاهش ناشی از افزودنی: <strong>${fmt(effectiveWater(), 1)} kg/m³</strong></p>
      `);
    case 5:
      return group('مقدار سیمان', `
        <p>مقدار سیمان محاسبه‌شده: <strong>${fmt(new Step4().run().cement, 1)} kg/m³</strong></p>
        <p>این مقدار بر اساس آب مؤثر و نسبت آب به سیمان واردشده محاسبه می‌شود.</p>
      `);
    case 6:
      return renderReport();
    default:
      return renderHome();
  }
}

/* ---------- رابط کاربری ---------- */

function render() {
  const tabs = document.getElementById('tabs');
  const screen = document.getElementById('screen');

  if (!tabs || !screen) {
    console.error('عناصر #tabs و #screen در index.html پیدا نشدند.');
    return;
  }

  tabs.innerHTML = titles.map((title, index) => `
    <button type="button"
      class="tab ${page === index ? 'active' : ''}"
      data-page="${index}">
      ${escapeHtml(title)}
    </button>
  `).join('');

  screen.innerHTML = `
    <h2 class="page-title">${escapeHtml(titles[page])}</h2>
    ${renderPageContent()}
  `;

  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (prev) prev.disabled = page === 0;
  if (next) {
    next.disabled = page === titles.length - 1;
    next.textContent = page === titles.length - 1 ? 'پایان' : 'مرحله بعد';
  }

  attachEvents();
}

function setDataValue(key, value) {
  if (key === 'aggregateCount') {
    data.aggregateCount = Math.max(2, Math.min(4, Number(value) || 2));
    return;
  }

  if (key === 'msa') {
    data.msa = Number(value);
    return;
  }

  if ([
    'strength', 'slump', 'cementClass', 'water', 'wc',
    'coarseShare', 'admixturePct', 'minCement', 'maxCement',
    'maxWc', 'air', 'sgCement', 'sgSand', 'sgGravel'
  ].includes(key)) {
    data[key] = value === '' ? '' : Number(value);
    return;
  }

  if ([
    'minCementEnabled', 'maxCementEnabled', 'maxWcEnabled'
  ].includes(key)) {
    data[key] = Boolean(value);
    return;
  }

  data[key] = value;
}

function attachEvents() {
  document.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      page = Number(button.dataset.page);
      render();
    });
  });

  document.querySelectorAll('[data-key]').forEach(element => {
    const eventName = element.type === 'checkbox' ? 'change' : 'change';

    element.addEventListener(eventName, () => {
      const key = element.dataset.key;
      const value = element.type === 'checkbox'
        ? element.checked
        : element.value;

      setDataValue(key, value);
      save();

      if (key === 'aggregateCount') {
        render();
        return;
      }

      if (key === 'slumpClass') {
        const range = slumpRange();
        const currentSlump = num(data.slump, range.min);

        if (currentSlump < range.min || currentSlump > range.max) {
          data.slump = Math.round((range.min + range.max) / 2);
        }

        save();
        render();
        return;
      }

      if (key === 'msa' || key === 'workshopRank' ||
          key === 'strength' || key === 'targetStrengthManual' ||
          key === 'admixture' || key === 'admixturePct' ||
          key === 'water' || key === 'wc' ||
          key === 'air' || key === 'aggregateCount') {
        render();
        return;
      }

      if (page === 2) {
        render();
      }
    });
  });

  document.querySelectorAll('[data-aggregate]').forEach(element => {
    element.addEventListener('change', () => {
      const aggregateIndex = Number(element.dataset.aggregate);
      const sieveIndex = Number(element.dataset.sieve);

      data.aggregates[aggregateIndex].passing[sieveIndex] = element.value;
      save();
      render();
    });
  });

  document.querySelectorAll('[data-aggregate-name]').forEach(element => {
    element.addEventListener('change', () => {
      const index = Number(element.dataset.aggregateName);
      data.aggregates[index].name = element.value || `سنگدانه ${index + 1}`;
      save();
      render();
    });
  });

  document.querySelectorAll('[data-fracture]').forEach(element => {
    element.addEventListener('change', () => {
      const index = Number(element.dataset.fracture);
      data.aggregates[index].fracture = num(element.value, 0);
      save();
    });
  });

  document.querySelectorAll('[data-share]').forEach(element => {
    element.addEventListener('change', () => {
      const index = Number(element.dataset.share);
      data.aggregateShares[index] = element.value;
      save();
      render();
    });
  });

  document.querySelectorAll('[data-show-aggregate]').forEach(element => {
    element.addEventListener('change', () => {
      const index = Number(element.dataset.showAggregate);
      data.showAggregateCurves[index] = element.checked;
      save();
      render();
    });
  });
}

/* ---------- دکمه‌های جابه‌جایی ---------- */

const prevButton = document.getElementById('prev');
if (prevButton) {
  prevButton.addEventListener('click', () => {
    if (page > 0) {
      page--;
      render();
    }
  });
}

const nextButton = document.getElementById('next');
if (nextButton) {
  nextButton.addEventListener('click', () => {
    if (page < titles.length - 1) {
      page++;
      render();
    }
  });
}

/* ---------- راه‌اندازی ---------- */

save();
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('ثبت Service Worker انجام نشد:', error);
    });
  });
}
