'use strict';

const STORAGE_KEY = 'beton479';

const defaults = {
  strength: 30,
  targetStrength: 35,
  slumpClass: 'S3',
  slump: 125,
  msa: 19,
  aggregateCount: 2,
  cementClass: '42.5',
  water: 185,
  wc: 0.50,
  grading: 'continuous',
  admixture: 'none',
  admixturePct: 0,
  sgAdmixture: 1.10,
  limitMinCementOn: false,
  limitMinCement: 280,
  limitMaxCementOn: false,
  limitMaxCement: 450,
  limitWcOn: false,
  limitWc: 0.50,
  air: 2,
  sgCement: 3.15,
  targetMethod: 'manual',
  workshopRank: 'A',
  aggregateShares: ['', '', '', ''],
  showMixCurve: true
};

const sieves = [
  37.5, 25, 19, 12.5, 9.5,
  4.75, 2.36, 1.18, 0.6, 0.3, 0.15
];

const slumpClasses = {
  S1: { min: 10, max: 40 },
  S2: { min: 50, max: 90 },
  S3: { min: 100, max: 150 },
  S4: { min: 160, max: 210 }
};

const standardDeviationTable = {
  16: { A: 2.5, B: 3.5, C: 4 },
  20: { A: 3, B: 4, C: 5 },
  25: { A: 3.5, B: 4.5, C: 5.5 },
  30: { A: 4, B: 5, C: 6 },
  35: { A: 4, B: 5, C: 6 },
  40: { A: 4.5, B: 5.5, C: 6.5 }
};

function defaultAggregate(i) {
  return {
    name: `سنگدانه ${i + 1}`,
    fracture: 0,
    passing: Array(sieves.length).fill(''),
    sg: i === 0 ? 2.65 : 2.70,
    absorption: 0.5
  };
}

let stored = {};
try {
  stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
} catch (_) {}

const data = { ...defaults, ...stored };
let page = 0;

function normalizeData() {
  data.msa = [9.5, 12.5, 19, 25].includes(Number(data.msa))
    ? Number(data.msa) : 19;

  data.aggregateCount = [2, 3, 4].includes(Number(data.aggregateCount))
    ? Number(data.aggregateCount) : 2;

  const old = Array.isArray(data.aggregates) ? data.aggregates : [];

  data.aggregates = Array.from({ length: 4 }, (_, i) => {
    const base = defaultAggregate(i);
    const a = old[i] || {};
    let passing = Array.isArray(a.passing) ? a.passing.slice() : [];

    if (passing.length === 12) passing.splice(5, 1);
    if (passing.length !== 11) passing = Array(11).fill('');

    return {
      ...base,
      ...a,
      passing,
      sg: a.sg ?? base.sg,
      absorption: a.absorption ?? base.absorption
    };
  });

  data.aggregateShares = Array.from({ length: 4 }, (_, i) =>
    Array.isArray(data.aggregateShares)
      ? data.aggregateShares[i] ?? ''
      : ''
  );

  if (!slumpClasses[data.slumpClass]) data.slumpClass = 'S3';
  if (!['none', 'slump', 'water_reducer'].includes(data.admixture)) {
    data.admixture = 'none';
  }
  if (!['manual', 'auto'].includes(data.targetMethod)) {
    data.targetMethod = 'manual';
  }
  if (!['A', 'B', 'C'].includes(data.workshopRank)) {
    data.workshopRank = 'A';
  }
  if (!['32.5', '42.5', '52.5'].includes(String(data.cementClass))) {
    data.cementClass = '42.5';
  }

  for (const k of [
    'limitMinCementOn',
    'limitMaxCementOn',
    'limitWcOn'
  ]) {
    data[k] = data[k] === true;
  }
}

normalizeData();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('ذخیره اطلاعات ناموفق بود:', e);
  }
}

function n(v) {
  const x = Number(String(v ?? '').replace(/٫/g, '.')
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return Number.isFinite(x) ? x : NaN;
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function field(key, label, value, step = 'any', type = 'number') {
  return `<label class="field">
    <span>${label}</span>
    <input type="${type}" inputmode="decimal"
      data-key="${key}" step="${step}" value="${esc(value)}">
  </label>`;
}

function selectField(key, label, options) {
  return `<label class="field"><span>${label}</span>
    <select data-key="${key}">
      ${options.map(o => `<option value="${o.value}"
        ${String(data[key]) === String(o.value) ? 'selected' : ''}>
        ${esc(o.label)}
      </option>`).join('')}
    </select>
  </label>`;
}

function checkbox(key, label, valueKey, valueLabel) {
  return `<div class="limit-box">
    <label class="checkline">
      <input type="checkbox" data-check="${key}"
        ${data[key] ? 'checked' : ''}>
      <span>${label}</span>
    </label>
    ${data[key] ? field(valueKey, valueLabel, data[valueKey], 'any') : ''}
  </div>`;
}

function validateCore() {
  const positive = [
    ['strength', 'مقاومت مشخصه'],
    ['water', 'آب آزاد'],
    ['wc', 'نسبت آب به سیمان'],
    ['sgCement', 'چگالی سیمان']
  ];

  for (const [key, label] of positive) {
    if (!Number.isFinite(n(data[key])) || n(data[key]) <= 0) {
      throw Error(`${label} باید عددی مثبت باشد.`);
    }
  }

  if (n(data.wc) >= 1) {
    throw Error('نسبت آب به سیمان باید کمتر از یک باشد.');
  }

  if (!Number.isFinite(n(data.air)) || n(data.air) < 0 || n(data.air) >= 15) {
    throw Error('درصد هوا باید بین صفر و ۱۵ باشد.');
  }

  const range = slumpClasses[data.slumpClass];
  if (!range || n(data.slump) < range.min || n(data.slump) > range.max) {
    throw Error(`اسلامپ باید بین ${range.min} و ${range.max} میلی‌متر باشد.`);
  }

  if (data.admixture !== 'none') {
    if (!Number.isFinite(n(data.admixturePct)) ||
        n(data.admixturePct) < 0 || n(data.admixturePct) >= 100) {
      throw Error('درصد افزودنی باید بین صفر و ۱۰۰ باشد.');
    }
    if (!Number.isFinite(n(data.sgAdmixture)) || n(data.sgAdmixture) <= 0) {
      throw Error('چگالی افزودنی باید مثبت باشد.');
    }
  }

  const cement = effectiveWater() / n(data.wc);

  if (data.limitMinCementOn && cement < n(data.limitMinCement)) {
    throw Error('مقدار سیمان کمتر از حداقل تعیین‌شده است.');
  }

  if (data.limitMaxCementOn && cement > n(data.limitMaxCement)) {
    throw Error('مقدار سیمان از حداکثر تعیین‌شده بیشتر است.');
  }

  if (data.limitWcOn && n(data.wc) > n(data.limitWc)) {
    throw Error('نسبت آب به سیمان از حداکثر تعیین‌شده بیشتر است.');
  }
}

/* درصد افزودنی فقط یک‌بار روی مقدار آب پایه اعمال می‌شود. */
function effectiveWater() {
  const base = n(data.water);
  const pct = data.admixture === 'none' ? 0 : n(data.admixturePct);
  return base * (1 - pct / 100);
}

function getShares() {
  const shares = data.aggregateShares
    .slice(0, data.aggregateCount)
    .map(n);

  const valid = shares.length === data.aggregateCount &&
    shares.every(v => Number.isFinite(v) && v >= 0 && v <= 100) &&
    Math.abs(shares.reduce((a, b) => a + b, 0) - 100) < 0.001;

  return { shares, valid };
}

function combinedGrading() {
  const { shares, valid } = getShares();
  if (!valid) return null;

  const active = data.aggregates.slice(0, data.aggregateCount);
  for (const a of active) {
    if (sieves.some((_, i) => a.passing[i] === '' ||
        !Number.isFinite(n(a.passing[i])) ||
        n(a.passing[i]) < 0 || n(a.passing[i]) > 100)) {
      return null;
    }
  }

  return sieves.map((mm, j) => ({
    mm,
    value: active.reduce((sum, a, i) =>
      sum + n(a.passing[j]) * shares[i] / 100, 0)
  }));
}

function finenessModulus(points) {
  if (!points) return null;
  const selected = [37.5, 19, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15];
  let sum = 0;

  for (const mm of selected) {
    const p = points.find(x => x.mm === mm);
    if (!p) return null;
    sum += 100 - p.value;
  }

  return sum / 100;
}

function getStandardDeviation() {
  const fc = n(data.strength);
  const ranks = standardDeviationTable;
  const grades = Object.keys(ranks).map(Number);
  const nearest = grades.reduce((a, b) =>
    Math.abs(b - fc) < Math.abs(a - fc) ? b : a
  );
  return ranks[nearest][data.workshopRank] ?? null;
}

function targetStrengthInfo() {
  const fc = n(data.strength);
  const s = getStandardDeviation();

  if (!Number.isFinite(fc) || fc <= 0 || s === null) return null;

  const f1 = fc + 1.34 * s;
  const f2 = 0.9 * fc + 2.33 * s;

  return {
    fc,
    s,
    f1,
    f2,
    target: Math.max(f1, f2)
  };
}

function renderHome() {
  const range = slumpClasses[data.slumpClass];

  return `<h2>اطلاعات اولیه</h2>
    <div class="grid">
      ${field('strength', 'مقاومت مشخصه استوانه‌ای (MPa)', data.strength, '0.1')}
      ${selectField('slumpClass', 'رده اسلامپ', [
        { value: 'S1', label: 'S1' },
        { value: 'S2', label: 'S2' },
        { value: 'S3', label: 'S3' },
        { value: 'S4', label: 'S4' }
      ])}
      ${field('slump', `اسلامپ (mm)، بازه ${range.min} تا ${range.max}`, data.slump, '1')}
      ${selectField('cementClass', 'رده سیمان', [
        { value: '32.5', label: '32.5' },
        { value: '42.5', label: '42.5' },
        { value: '52.5', label: '52.5' }
      ])}
      ${field('sgCement', 'چگالی نسبی سیمان', data.sgCement, '0.01')}
      ${selectField('grading', 'نوع دانه‌بندی', [
        { value: 'continuous', label: 'پیوسته' },
        { value: 'fine_gap', label: 'کمبود ریزدانه' },
        { value: 'coarse_gap', label: 'کمبود درشت‌دانه' },
        { value: 'gap', label: 'گسسته' }
      ])}
      ${selectField('admixture', 'نوع افزودنی', [
        { value: 'none', label: 'بدون افزودنی' },
        { value: 'slump', label: 'افزایش‌دهنده اسلامپ' },
        { value: 'water_reducer', label: 'کاهنده نیاز آب' }
      ])}
      ${field('admixturePct', 'درصد کاهش آب افزودنی (%)', data.admixturePct, '0.1')}
      ${field('sgAdmixture', 'چگالی نسبی افزودنی', data.sgAdmixture, '0.01')}
    </div>
    ${checkbox('limitMinCementOn', 'اعمال حداقل سیمان', 'limitMinCement', 'حداقل سیمان (kg/m³)')}
    ${checkbox('limitMaxCementOn', 'اعمال حداکثر سیمان', 'limitMaxCement', 'حداکثر سیمان (kg/m³)')}
    ${checkbox('limitWcOn', 'اعمال حداکثر نسبت آب به سیمان', 'limitWc', 'حداکثر W/C')}
    <p class="hint">بازه‌های اسلامپ در این برنامه تنظیمات ورودی هستند؛ پیش از استفاده اجرایی، با مرجع پروژه تطبیق دهید.</p>`;
}

function renderAggregateTable() {
  let html = `<h2>مشخصات سنگدانه‌ها</h2><div class="grid">
    ${selectField('aggregateCount', 'تعداد سنگدانه‌ها', [
      { value: 2, label: '۲ نوع' },
      { value: 3, label: '۳ نوع' },
      { value: 4, label: '۴ نوع' }
    ])}
    ${selectField('msa', 'NMSA (mm)', [
      { value: 9.5, label: '9.5' },
      { value: 12.5, label: '12.5' },
      { value: 19, label: '19' },
      { value: 25, label: '25' }
    ])}
  </div><div class="table-scroll"><table class="aggregate-table">
    <thead><tr><th>مشخصات</th>${data.aggregates.slice(0, data.aggregateCount)
      .map((a, i) => `<th>${esc(a.name || `سنگدانه ${i + 1}`)}</th>`).join('')}
    </tr></thead><tbody>`;

  const row = (label, make) =>
    `<tr><th>${label}</th>${data.aggregates.slice(0, data.aggregateCount)
      .map((a, i) => `<td>${make(a, i)}</td>`).join('')}</tr>`;

  html += row('نام سنگدانه', (a, i) =>
    `<input class="table-input" data-agg="${i}" data-field="name" value="${esc(a.name)}">`);
  html += row('درصد شکستگی (%)', (a, i) =>
    `<input class="table-input" type="number" min="0" max="100" data-agg="${i}" data-field="fracture" value="${esc(a.fracture)}">`);
  html += row('چگالی نسبی ذرات', (a, i) =>
    `<input class="table-input" type="number" min="0.1" step="0.01" data-agg="${i}" data-field="sg" value="${esc(a.sg)}">`);
  html += row('جذب آب (%)', (a, i) =>
    `<input class="table-input" type="number" min="0" step="0.1" data-agg="${i}" data-field="absorption" value="${esc(a.absorption)}">`);

  for (let j = 0; j < sieves.length; j++) {
    html += row(`درصد گذشته از الک ${sieves[j]} mm`, (a, i) =>
      `<input class="table-input" type="number" min="0" max="100" data-agg="${i}" data-sieve="${j}" value="${esc(a.passing[j])}">`);
  }

  html += '</tbody></table></div>';
  return html;
}

function renderShares() {
  return `<h2>سهم‌بندی سنگدانه‌ها</h2>
    <p>سهم هر سنگدانه از کل سنگدانه‌ها را وارد کنید؛ مجموع باید ۱۰۰ درصد باشد.</p>
    <div class="grid">${data.aggregates.slice(0, data.aggregateCount).map((a, i) =>
      field(`share_${i}`, a.name || `سنگدانه ${i + 1}`, data.aggregateShares[i], '0.1')
    ).join('')}</div>`;
}

function renderWc() {
  const t = targetStrengthInfo();
  return `<h2>۱. نسبت آب به سیمان</h2>
    <div class="grid">
      ${field('wc', 'نسبت آب به سیمان انتخابی', data.wc, '0.001')}
      ${field('targetStrength', 'مقاومت هدف طرح (MPa)', data.targetStrength, '0.1')}
    </div>
    ${selectField('workshopRank', 'رتبه کارگاه', [
      { value: 'A', label: 'الف' },
      { value: 'B', label: 'ب' },
      { value: 'C', label: 'ج' }
    ])}
    ${t ? `<p>انحراف معیار انتخاب‌شده: ${t.s.toFixed(2)} MPa</p>
      <p>رابطه اول: ${t.f1.toFixed(2)} MPa</p>
      <p>رابطه دوم: ${t.f2.toFixed(2)} MPa</p>
      <p>بزرگ‌ترِ دو نتیجه: ${t.target.toFixed(2)} MPa</p>` : ''}
    <p class="hint">نسبت آب به سیمان را بر اساس جدول یا منحنی معتبر مرجع تعیین کنید؛ این نسخه مقاومت را با یک منحنی تجربی تأییدنشده به W/C تبدیل نمی‌کند.</p>`;
}

function renderWater() {
  const fm = finenessModulus(combinedGrading());
  return `<h2>۲. آب آزاد</h2>
    ${field('water', 'آب آزاد پایه (kg/m³)', data.water, '0.1')}
    <p>آب پس از اعمال کاهش افزودنی: <strong>${effectiveWater().toFixed(1)} kg/m³</strong></p>
    ${fm === null ? '<p class="hint">برای محاسبه مدول نرمی، درصد عبوری همه الک‌ها و سهم تمام سنگدانه‌ها را کامل کنید.</p>' :
      `<p>مدول نرمی مخلوط: <strong>${fm.toFixed(2)}</strong></p>`}
    <p class="hint">مقدار آب آزاد را از جدول یا منحنی معتبر متناسب با اسلامپ، NMSA و ویژگی سنگدانه‌ها وارد کنید.</p>`;
}

function renderCement() {
  const water = effectiveWater();
  const cement = water / n(data.wc);
  const maxOn = data.limitMaxCementOn;
  const max = n(data.limitMaxCement);
  const over = maxOn && cement > max;

  return `<h2>۳. مقدار سیمان</h2>
    <p>رابطه محاسبه: سیمان = آب مؤثر ÷ نسبت آب به سیمان</p>
    <p>آب مؤثر: ${water.toFixed(2)} kg/m³</p>
    <p>W/C: ${n(data.wc).toFixed(3)}</p>
    <p><strong>سیمان محاسبه‌شده: ${cement.toFixed(2)} kg/m³</strong></p>
    ${maxOn ? `<p>${over ? 'هشدار: مقدار سیمان از سقف تعیین‌شده بیشتر است.' : 'مقدار سیمان از سقف تعیین‌شده بیشتر نیست.'}</p>` : ''}
    ${data.limitMinCementOn ? `<p>حداقل تعیین‌شده: ${n(data.limitMinCement)} kg/m³</p>` : ''}
    <p class="hint">اگر محدودیت حداکثر سیمان خاموش باشد، هیچ سقف پیش‌فرضی اعمال نمی‌شود.</p>`;
}

function calculateFinal() {
  validateCore();

  const { shares, valid } = getShares();
  if (!valid) throw Error('مجموع سهم سنگدانه‌های فعال باید دقیقاً ۱۰۰ درصد باشد.');

  const active = data.aggregates.slice(0, data.aggregateCount);
  for (let i = 0; i < active.length; i++) {
    const a = active[i];
    if (!Number.isFinite(n(a.sg)) || n(a.sg) <= 0) {
      throw Error(`چگالی سنگدانه ${i + 1} باید مثبت باشد.`);
    }
    if (!Number.isFinite(n(a.absorption)) || n(a.absorption) < 0) {
      throw Error(`جذب آب سنگدانه ${i + 1} نامعتبر است.`);
    }
  }

  const water = effectiveWater();
  const cement = water / n(data.wc);
  const admixtureMass = data.admixture === 'none'
    ? 0
    : cement * n(data.admixturePct) / 100;

  const vc = cement / (n(data.sgCement) * 1000);
  const vw = water / 1000;
  const va = n(data.air) / 100;
  const vadm = data.admixture === 'none'
    ? 0
    : admixtureMass / (n(data.sgAdmixture) * 1000);

  const aggregateVolume = 1 - vc - vw - va - vadm;
  if (aggregateVolume <= 0) {
    throw Error('حجم باقی‌مانده برای سنگدانه‌ها مثبت نیست؛ ورودی‌ها را بررسی کنید.');
  }

  const aggregates = active.map((a, i) => {
    const volume = aggregateVolume * shares[i] / 100;
    const ssd = volume * n(a.sg) * 1000;
    const dry = ssd / (1 + n(a.absorption) / 100);
    return {
      name: a.name || `سنگدانه ${i + 1}`,
      sg: n(a.sg),
      absorption: n(a.absorption),
      share: shares[i],
      volume,
      ssd,
      dry
    };
  });

  const totalDry = aggregates.reduce((s, a) => s + a.dry, 0);
  const totalWater = water + aggregates.reduce(
    (s, a) => s + a.dry * a.absorption / 100, 0
  );

  return {
    water, cement, admixtureMass, aggregateVolume,
    vc, vw, va, vadm, aggregates, totalDry, totalWater,
    finalDensity: cement + totalWater + totalDry + admixtureMass
  };
}

function renderReport() {
  const r = calculateFinal();
  const fmt = (v, d = 2) => Number(v).toFixed(d);

  return `<h2>گزارش نهایی طرح مخلوط بتن</h2>
    <p>NMSA: ${data.msa} mm</p>
    <p>سیمان: ${fmt(r.cement)} kg/m³</p>
    <p>آب آزاد مؤثر: ${fmt(r.water)} kg/m³</p>
    ${data.admixture !== 'none' ? `<p>افزودنی: ${fmt(r.admixtureMass)} kg/m³</p>` : ''}
    <p>حجم سنگدانه‌ها: ${fmt(r.aggregateVolume, 4)} m³</p>
    <div class="table-scroll"><table>
      <thead><tr><th>مشخصات</th>${r.aggregates.map(a => `<th>${esc(a.name)}</th>`).join('')}</tr></thead>
      <tbody>
        <tr><th>سهم (%)</th>${r.aggregates.map(a => `<td>${fmt(a.share, 1)}</td>`).join('')}</tr>
        <tr><th>حجم (m³)</th>${r.aggregates.map(a => `<td>${fmt(a.volume, 4)}</td>`).join('')}</tr>
        <tr><th>جرم SSD (kg)</th>${r.aggregates.map(a => `<td>${fmt(a.ssd, 1)}</td>`).join('')}</tr>
        <tr><th>جرم خشک (kg)</th>${r.aggregates.map(a => `<td>${fmt(a.dry, 1)}</td>`).join('')}</tr>
      </tbody>
    </table></div>
    <p>مجموع جرم خشک سنگدانه‌ها: <strong>${fmt(r.totalDry)} kg/m³</strong></p>
    <p>آب کل با احتساب آب جذب‌شده: <strong>${fmt(r.totalWater)} kg/m³</strong></p>
    <p>چگالی محاسباتی مخلوط: <strong>${fmt(r.finalDensity)} kg/m³</strong></p>
    <button id="print-report" type="button">چاپ گزارش</button>
    <p class="hint">این گزارش بر مبنای جرم خشک سنگدانه‌هاست. آب جذب‌شده در برآورد آب کل لحاظ شده است؛ پیش از اجرای واقعی، مبنای رطوبتی و روش طراحی را با مرجع پروژه تطبیق دهید.</p>`;
}

const titles = [
  'اطلاعات اولیه',
  'مشخصات سنگدانه‌ها',
  'سهم‌بندی سنگدانه‌ها',
  '۱. آب به سیمان',
  '۲. آب آزاد',
  '۳. مقدار سیمان',
  'گزارش نهایی'
];

function injectStyle() {
  if (document.getElementById('beton479-style')) return;

  const style = document.createElement('style');
  style.id = 'beton479-style';
  style.textContent = `
    body{direction:rtl;font-family:Tahoma,Arial,sans-serif;background:#eef3f8;margin:0;padding:10px;color:#222}
    #app{max-width:1100px;margin:10px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px #0001}
    #tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:8px;background:#f3f6fa}
    #tabs button{font-size:12px;padding:10px 4px;background:#e4eaf2;color:#234;border:0;border-radius:7px}
    #tabs button.active{background:#0877c9;color:#fff}
    .panel{padding:16px}
    .grid{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}
    .field{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px;background:#f7f9fc;border:1px solid #d9e1eb;border-radius:7px;flex:1;min-width:220px;font-size:12px}
    input,select{max-width:145px;width:45%;box-sizing:border-box;padding:7px;border:1px solid #bdc8d5;border-radius:5px;background:#fff}
    button{cursor:pointer;padding:9px 15px;border:0;border-radius:6px;background:#0877c9;color:#fff}
    button:disabled{opacity:.4}
    .limit-box{padding:10px;margin:10px 0;border:1px solid #d9e1eb;border-radius:8px}
    .checkline{display:flex;gap:8px;align-items:center;font-size:13px}
    .checkline input{width:auto}
    .table-scroll{overflow-x:auto}
    table{border-collapse:collapse;width:100%;margin:12px 0}
    th,td{border:1px solid #d9e1eb;padding:7px;text-align:center;font-size:12px}
    th{background:#f1f5f9}
    .table-input{width:85px;max-width:none}
    .hint{padding:10px;background:#fff7df;border-radius:6px;font-size:12px;line-height:1.8}
    .bad{color:#b91c1c;padding:12px}
    @media(max-width:600px){body{padding:3px}#tabs button{font-size:10px;padding:7px 2px}.panel{padding:9px}.field{min-width:100%;box-sizing:border-box}}
  `;
  document.head.appendChild(style);
}

function view() {
  const tabs = document.getElementById('tabs');
  const screen = document.getElementById('screen');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');

  if (!tabs || !screen || !prev || !next) {
    console.error('در index.html باید عناصر tabs، screen، prev و next وجود داشته باشند.');
    return;
  }

  const renderers = [
    renderHome,
    renderAggregateTable,
    renderShares,
    renderWc,
    renderWater,
    renderCement,
    renderReport
  ];

  tabs.innerHTML = titles.map((title, i) =>
    `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''}">${title}</button>`
  ).join('');

  try {
    screen.innerHTML = `<article class="panel">${renderers[page]()}</article>`;
  } catch (e) {
    screen.innerHTML = `<div class="panel bad">${esc(e.message)}</div>`;
  }

  tabs.querySelectorAll('[data-page]').forEach(button => {
    button.onclick = () => {
      page = Number(button.dataset.page);
      view();
    };
  });

  screen.querySelectorAll('[data-key]').forEach(el => {
    el.onchange = () => {
      const key = el.dataset.key;
      const raw = el.value;
      const textKeys = ['slumpClass', 'cementClass', 'grading', 'admixture', 'workshopRank'];

      data[key] = textKeys.includes(key) ? raw : raw === '' ? '' : n(raw);

      if (key === 'slumpClass') {
        const range = slumpClasses[data.slumpClass];
        if (data.slump < range.min || data.slump > range.max) data.slump = range.min;
      }

      if (key === 'admixture' && raw === 'none') data.admixturePct = 0;

      try {
        validateCore();
        save();
        view();
      } catch (e) {
        alert(e.message);
        view();
      }
    };
  });

  screen.querySelectorAll('[data-check]').forEach(el => {
    el.onchange = () => {
      data[el.dataset.check] = el.checked;
      try {
        validateCore();
        save();
        view();
      } catch (e) {
        alert(e.message);
        view();
      }
    };
  });

  screen.querySelectorAll('[data-agg]').forEach(el => {
    el.onchange = () => {
      const i = Number(el.dataset.agg);
      const a = data.aggregates[i];

      if (el.dataset.field) {
        const key = el.dataset.field;
        a[key] = key === 'name' ? el.value : n(el.value);
      } else if (el.dataset.sieve !== undefined) {
        const j = Number(el.dataset.sieve);
        a.passing[j] = el.value === '' ? '' : n(el.value);
      }

      save();
    };
  });

  screen.querySelectorAll('[data-key^="share_"]').forEach(el => {
    el.onchange = () => {
      const i = Number(el.dataset.key.split('_')[1]);
      data.aggregateShares[i] = el.value === '' ? '' : n(el.value);
      save();
      view();
    };
  });

  const print = document.getElementById('print-report');
  if (print) print.onclick = () => window.print();

  prev.disabled = page === 0;
  next.disabled = page === titles.length - 1;
  prev.onclick = () => {
    page = Math.max(0, page - 1);
    view();
  };
  next.onclick = () => {
    page = Math.min(titles.length - 1, page + 1);
    view();
  };
}

function startApp() {
  injectStyle();
  view();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  });
   }
