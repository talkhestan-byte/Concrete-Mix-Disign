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
  wetGravel: 1
};

const sieves = [
  { label: '۳۷٫۵ mm (حدود الک ۳۸)', mm: 37.5 },
  { label: '۲۵ mm', mm: 25 },
  { label: '۱۹ mm', mm: 19 },
  { label: '۱۲٫۵ mm', mm: 12.5 },
  { label: '۹٫۵ mm', mm: 9.5 },
  { label: '۴٫۷۵ mm', mm: 4.75 },
  { label: '۲٫۳۶ mm', mm: 2.36 },
  { label: '۱٫۱۸ mm', mm: 1.18 },
  { label: '۰٫۶ mm ـ الک ۳۰', mm: 0.6 },
  { label: '۰٫۳ mm ـ الک ۵۰', mm: 0.3 },
  { label: '۰٫۱۵ mm ـ الک ۱۰۰', mm: 0.15 }
];

const slumpClasses = {
  S1: { label: 'S1 ـ روانی کم', min: 10, max: 40 },
  S2: { label: 'S2 ـ روانی متوسط', min: 50, max: 90 },
  S3: { label: 'S3 ـ روانی نسبتاً زیاد', min: 100, max: 150 },
  S4: { label: 'S4 ـ روانی زیاد', min: 160, max: 210 }
};

const gradingOptions = [
  { value: 'continuous', label: 'پیوسته' },
  { value: 'fine_deficient', label: 'کمبود ریزدانه' },
  { value: 'coarse_deficient', label: 'کمبود درشت‌دانه' },
  { value: 'gap', label: 'دانه‌بندی گسسته' }
];

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
  const oldPassing = index === 0
    ? [100, 100, 98, 90, 72, 48, 22, 5, 0, 0, 0]
    : [100, 100, 95, 70, 25, 5, 1, 0, 0, 0, 0];

  return {
    name: `سنگدانه ${index + 1}`,
    fracture: 0,
    passing: oldPassing
  };
}

if (!Array.isArray(data.aggregates)) {
  data.aggregates = [defaultAggregate(0), defaultAggregate(1)];
} else {
  data.aggregates = data.aggregates.map((a, i) => ({
    ...defaultAggregate(i),
    ...a,
    passing: Array.isArray(a.passing)
      ? sieves.map((_, j) => Number(a.passing[j] ?? 0))
      : defaultAggregate(i).passing
  }));
}

data.aggregateCount = Math.max(2, Math.min(4, Number(data.aggregateCount) || 2));

while (data.aggregates.length < data.aggregateCount) {
  data.aggregates.push(defaultAggregate(data.aggregates.length));
}

data.aggregates = data.aggregates.slice(0, 4);

let page = 0;

const fields = {
  strength: ['مقاومت مشخصه (نمونه استوانه‌ای) (MPa)', 0.1],
  slump: ['اسلامپ (mm)', 1],
  msa: ['حداکثر اندازه اسمی سنگدانه (mm)', 0.1],
  water: ['آب آزاد پایه انتخاب‌شده (kg/m³)', 0.1],
  wc: ['نسبت آب به سیمان انتخاب‌شده', 0.001],
  coarseShare: ['سهم حجمی شن از کل سنگدانه', 0.001],
  air: ['هوای بتن (%)', 0.1],
  sgCement: ['چگالی نسبی سیمان', 0.01],
  sgSand: ['چگالی نسبی ماسه (SSD)', 0.01],
  sgGravel: ['چگالی نسبی شن (SSD)', 0.01]
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
    <input data-key="${key}" type="number" step="${step}" value="${data[key]}" ${extra}>
  </label>`;
}

function selectInput(key, label, options) {
  return `<label class="field">${label}
    <select data-key="${key}">
      ${options.map(o =>
        `<option value="${o.value}" ${selected(key, o.value)}>${o.label}</option>`
      ).join('')}
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
    'strength', 'slump', 'msa', 'water', 'wc', 'coarseShare',
    'air', 'sgCement', 'sgSand', 'sgGravel', 'admixturePct',
    'limitMinCement', 'limitMaxCement', 'limitWc'
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
    throw Error(`اسلامپ باید در بازه ${range.min} تا ${range.max} میلی‌متر باشد.`);
  }

  if (![9.5, 12.5, 19, 25].includes(num('msa'))) {
    throw Error('حداکثر اندازه اسمی سنگدانه انتخاب‌شده معتبر نیست.');
  }

  if (num('water') <= 0 || num('wc') <= 0 || num('wc') >= 1) {
    throw Error('آب باید مثبت و نسبت آب به سیمان بین صفر و یک باشد.');
  }

  if (num('coarseShare') <= 0 || num('coarseShare') >= 1) {
    throw Error('سهم شن باید بین صفر و یک باشد.');
  }

  if (num('air') < 0 || num('air') >= 15) {
    throw Error('درصد هوا نامعتبر است.');
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
    throw Error('نسبت آب به سیمان از حداکثر مجاز واردشده بیشتر است.');
  }
}

function validateAggregates() {
  if (![2, 3, 4].includes(Number(data.aggregateCount))) {
    throw Error('تعداد سنگدانه‌ها باید ۲، ۳ یا ۴ باشد.');
  }

  for (let i = 0; i < data.aggregateCount; i++) {
    const aggregate = data.aggregates[i];

    if (!Number.isFinite(Number(aggregate.fracture)) ||
        aggregate.fracture < 0 || aggregate.fracture > 100) {
      throw Error(`درصد شکستگی سنگدانه ${i + 1} باید بین صفر و ۱۰۰ باشد.`);
    }

    if (!Array.isArray(aggregate.passing) || aggregate.passing.length !== sieves.length) {
      throw Error(`اطلاعات دانه‌بندی سنگدانه ${i + 1} کامل نیست.`);
    }

    for (let j = 0; j < sieves.length; j++) {
      const value = Number(aggregate.passing[j]);

      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw Error(`درصد عبوری سنگدانه ${i + 1} در الک ${sieves[j].label} باید بین صفر و ۱۰۰ باشد.`);
      }
    }
  }
}

class Step1 {
  run() {
    return { wc: num('wc'), strength: num('strength') };
  }
}

class Step3 {
  run() {
    return { water: effectiveWater(), baseWater: num('water') };
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

function renderHome() {
  const range = slumpRange();

  return `
    <h2>اطلاعات اولیه طرح</h2>

    <div class="grid">
      ${numberInput('strength', fields.strength[0], 0.1)}
      ${selectInput('slumpClass', 'رده اسلامپ', Object.entries(slumpClasses).map(([value, item]) => ({
        value,
        label: `${item.label} (${item.min}–${item.max} mm)`
      })))}
      ${numberInput('slump', fields.slump[0], 1, `min="${range.min}" max="${range.max}"`)}
      ${numberInput('air', fields.air[0], 0.1)}
    </div>

    <p class="hint">
      محدوده‌های اسلامپ فعلی مقادیر اولیه برنامه‌اند و باید با مرجع معتبر کنترل شوند.
    </p>

    <div class="grid">
      ${selectInput('cementClass', 'نوع سیمان مصرفی', [
        { value: '42.5', label: 'رده مقاومتی ۴۲٫۵' },
        { value: '52.5', label: 'رده مقاومتی ۵۲٫۵' }
      ])}
      ${numberInput('sgCement', fields.sgCement[0], 0.01)}
    </div>

    <div class="grid">
      ${selectInput('admixture', 'نوع افزودنی', admixtureOptions)}
      ${numberInput('admixturePct', 'درصد افزودنی نسبت به جرم سیمان (%)', 0.1, 'min="0" max="99.9"')}
    </div>

    <p class="hint">
      برای افزودنی کاهنده نیاز آب، درصد واردشده به‌صورت کاهش آب در محاسبات اعمال می‌شود.
      برای افزودنی افزایش‌دهنده اسلامپ، کاهش آب به‌طور خودکار فرض نمی‌شود.
    </p>

    <h3>کنترل‌های اختیاری طرح</h3>

    ${checkboxField('limitMinCementOn', 'اعمال حداقل مقدار سیمان', 'limitMinCement', 'حداقل سیمان (kg/m³)', 1)}
    ${checkboxField('limitMaxCementOn', 'اعمال حداکثر مقدار سیمان', 'limitMaxCement', 'حداکثر سیمان (kg/m³)', 1)}
    ${checkboxField('limitWcOn', 'اعمال حداکثر نسبت آب به سیمان', 'limitWc', 'حداکثر نسبت آب به سیمان', 0.001)}

    <details>
      <summary>تنظیمات پیشرفته مصالح</summary>
      <div class="grid advanced-grid">
        ${numberInput('sgSand', fields.sgSand[0], 0.01)}
        ${numberInput('sgGravel', fields.sgGravel[0], 0.01)}
      </div>
      <p class="hint">
        وزن خشک سنگدانه‌ها با چگالی‌های واردشده محاسبه می‌شود. برای نتایج اجرایی،
        چگالی‌ها باید با مبنای وزن خشک موردنظر سازگار باشند.
      </p>
    </details>
  `;
}

function checkboxField(key, label, valueKey, valueLabel, step) {
  return `<div class="limit-box">
    <label class="checkline">
      <input type="checkbox" data-check="${key}" ${data[key] ? 'checked' : ''}>
      <span>${label}</span>
    </label>
    ${data[key] ? numberInput(valueKey, valueLabel, step) : ''}
  </div>`;
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

  const headers = Array.from({ length: data.aggregateCount }, (_, i) =>
    `<th>سنگدانه ${i + 1}</th>`
  ).join('');

  const fractureRow = `
    <tr>
      <th>درصد شکستگی (%)</th>
      ${Array.from({ length: data.aggregateCount }, (_, i) => `
        <td>
          <input class="table-input" type="number" min="0" max="100" step="0.1"
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
          <input class="table-input" type="number" min="0" max="100" step="0.1"
            aria-label="درصد عبوری سنگدانه ${i + 1} از ${sieve.label}"
            data-agg="${i}" data-sieve="${j}"
            value="${data.aggregates[i].passing[j]}">
        </td>
      `).join('')}
    </tr>
  `).join('');

  return `
    <h2>مشخصات سنگدانه‌ها</h2>

    <div class="grid">
      ${selectInput('aggregateCount', 'تعداد انواع سنگدانه', countOptions)}
      ${selectInput('msa', 'حداکثر اندازه اسمی سنگدانه (MSA)', msaOptions)}
    </div>

    <p class="hint">
      درصد عبوری و درصد شکستگی را بر اساس نتایج آزمایش هر سنگدانه وارد کنید.
      مقادیر این جدول خودکار از روی MSA ساخته نمی‌شوند.
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
          ${fractureRow}
          ${sieveRows}
        </tbody>
      </table>
    </div>

    <p class="hint">
      فهرست الک‌ها از حدود الک ۳۷٫۵ میلی‌متر تا الک شماره ۱۰۰ (۰٫۱۵ میلی‌متر) تنظیم شده است.
      پیش از استفاده مهندسی، سری الک‌ها را با نسخه معتبر استاندارد ملی ایران ۳۰۲ تطبیق دهید.
    </p>
  `;
}

function renderSharesPlaceholder() {
  return `
    <h2>سهم‌بندی سنگدانه‌ها</h2>
    <p class="hint">
      این صفحه در مرحله بعد تکمیل می‌شود. در این مرحله سهم هر سنگدانه وارد نمی‌شود
      و منحنی دانه‌بندی ترکیبی نیز محاسبه نخواهد شد.
    </p>
    <p>تعداد سنگدانه‌های تعریف‌شده: <strong>${data.aggregateCount}</strong></p>
    <p>حداکثر اندازه اسمی انتخاب‌شده: <strong>${data.msa} mm</strong></p>
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

function renderStep1() {
  const r = new Step1().run();

  return `
    <h2>گام اول — تعیین نسبت آب به سیمان</h2>
    ${group(['wc'])}
    <p class="hint">
      نسبت آب به سیمان باید با توجه به مقاومت، دوام، نوع سیمان و مصالح از مرجع معتبر انتخاب شود.
      در این نسخه مقدار منتخب کاربر ثبت می‌شود و منحنی رسمی تولید نمی‌شود.
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
      آب آزاد پایه را بر اساس مرجع معتبر انتخاب کنید. اگر افزودنی کاهنده نیاز آب انتخاب شده باشد،
      کاهش واردشده در مقدار آب محاسباتی اعمال می‌شود.
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
      رابطه محاسباتی: سیمان = آب محاسباتی ÷ نسبت آب به سیمان.
      محدودیت‌های اختیاری در صفحه اول کنترل می‌شوند.
    </p>
  `;
}

function renderReport() {
  const r = new Step5().run();

  return `
    <h2>گزارش نهایی — وزن خشک مصالح</h2>
    ${table([
      ['رده مقاومتی سیمان', data.cementClass],
      ['حداکثر اندازه اسمی سنگدانه (mm)', num('msa')],
      ['آب مؤثر طرح (kg/m³)', r.water],
      ['سیمان (kg/m³)', r.cement],
      ['ماسه خشک (kg/m³)', r.drySand],
      ['شن خشک (kg/m³)', r.dryGravel],
      ['جرم افزودنی (kg/m³)', r.admixtureMass],
      ['حجم محاسباتی اجزا (m³)', r.volume]
    ])}
    <button type="button" id="print">چاپ / ذخیره PDF</button>
    <p class="hint">
      وزن ماسه و شن در این گزارش بر مبنای وزن خشک محاسبه می‌شود.
      سهم‌بندی چند سنگدانه‌ای هنوز به محاسبات گزارش متصل نشده است؛ بنابراین گزارش نهایی
      فعلاً از مدل ساده ماسه و شن استفاده می‌کند.
    </p>
  `;
}

function view() {
  document.getElementById('tabs').innerHTML = titles.map((title, i) =>
    `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''}">${title}</button>`
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
        html = renderSharesPlaceholder();
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
    html = `<p class="bad">${error.message}</p><p>ورودی‌های این بخش را بررسی کنید.</p>`;
  }

  document.getElementById('screen').innerHTML = `<article class="panel">${html}</article>`;

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
      data[key] = element.type === 'number' ? Number(element.value) : element.value;

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
            data.slump = Math.min(range.max, Math.max(range.min, num('slump')));
          }
        }

        if (key === 'slump') {
          const range = slumpRange();
          if (num('slump') < range.min || num('slump') > range.max) {
            throw Error(`اسلامپ باید بین ${range.min} و ${range.max} میلی‌متر باشد.`);
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
      const oldValue = element.value;

      if (element.dataset.aggField === 'fracture') {
        data.aggregates[index].fracture = Number(element.value);
      } else {
        const sieveIndex = Number(element.dataset.sieve);
        data.aggregates[index].passing[sieveIndex] = Number(element.value);
      }

      try {
        validateAggregates();
        save();
      } catch (error) {
        if (element.dataset.aggField === 'fracture') {
          data.aggregates[index].fracture = Number(oldValue);
        } else {
          const sieveIndex = Number(element.dataset.sieve);
          data.aggregates[index].passing[sieveIndex] = Number(oldValue);
        }

        view();
        alert(error.message);
      }
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
