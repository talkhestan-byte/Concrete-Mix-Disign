'use strict';

const defaults = {
  strength: 30,
  slumpClass: 'S3',
  slump: 120,
  msa: 19,
  grading: 'continuous',
  admixture: 'none',
  admixturePct: 0,
  limitMinCementOn: false,
  limitMinCement: 280,
  limitMaxCementOn: false,
  limitMaxCement: 450,
  limitWcOn: false,
  limitWc: 0.50,
  cementClass: '42.5',
  water: 185,
  wc: 0.50,
  coarseShare: 0.60,
  air: 2,
  sgCement: 3.15,
  sgSand: 2.65,
  sgGravel: 2.70,
  absSand: 1,
  wetSand: 3,
  absGravel: 0.5,
  wetGravel: 1,
  sandPassing: '100,100,98,90,72,48,22,5',
  gravelPassing: '100,100,95,70,25,5,1,0'
};

let stored = {};
try {
  stored = JSON.parse(localStorage.getItem('beton479') || '{}') || {};
} catch (_) {}

const data = { ...defaults, ...stored };
let page = 0;

const titles = [
  'اطلاعات اولیه',
  '۱. آب به سیمان',
  '۲. دانه‌بندی',
  '۳. آب آزاد',
  '۴. سیمان',
  '۵. سنگ‌دانه و گزارش'
];

/*
  این بازه‌ها صرفاً مقادیر اولیه قابل ویرایش‌اند.
  پیش از استفاده مهندسی باید با نسخه معتبر مرجع موردنظر تطبیق داده شوند.
*/
const slumpClasses = {
  S1: { label: 'S1 ـ روانی کم', min: 10, max: 40 },
  S2: { label: 'S2 ـ روانی متوسط', min: 50, max: 90 },
  S3: { label: 'S3 ـ روانی نسبتاً زیاد', min: 100, max: 150 },
  S4: { label: 'S4 ـ روانی زیاد', min: 160, max: 210 }
};

const gradingOptions = [
  {
    value: 'continuous',
    label: 'پیوسته',
    description: 'اندازه‌های مختلف دانه در محدوده مصالح حضور دارند؛ منحنی واقعی باید بررسی شود.'
  },
  {
    value: 'fine_deficient',
    label: 'کمبود ریزدانه',
    description: 'سهم دانه‌های ریز کمتر است و ممکن است کارایی و انسجام مخلوط تغییر کند.'
  },
  {
    value: 'coarse_deficient',
    label: 'کمبود درشت‌دانه',
    description: 'سهم دانه‌های درشت کمتر است و نسبت سطح ویژه و نیاز خمیر می‌تواند تغییر کند.'
  },
  {
    value: 'gap',
    label: 'گسسته',
    description: 'یک یا چند محدوده اندازه دانه کم‌نمایی دارند؛ کنترل جداگانه منحنی ضروری است.'
  }
];

const admixtureOptions = [
  { value: 'none', label: 'بدون افزودنی' },
  { value: 'slump', label: 'افزودنی افزایش‌دهنده اسلامپ' },
  { value: 'water_reducer', label: 'افزودنی کاهنده نیاز آب' }
];

const fields = {
  strength: ['مقاومت مشخصه (نمونه استوانه‌ای) (MPa)', 0.1],
  slump: ['اسلامپ (mm)', 1],
  msa: ['حداکثر اندازه اسمی سنگدانه (mm)', 0.1],
  water: ['آب آزاد پایه انتخاب‌شده (kg/m³)', 0.1],
  wc: ['نسبت آب به سیمان انتخاب‌شده', 0.001],
  coarseShare: ['سهم حجمی شن از کل سنگ‌دانه', 0.001],
  air: ['هوای بتن (%)', 0.1],
  sgCement: ['چگالی نسبی سیمان', 0.01],
  sgSand: ['چگالی نسبی ماسه (SSD)', 0.01],
  sgGravel: ['چگالی نسبی شن (SSD)', 0.01]
};

function save() {
  try {
    localStorage.setItem('beton479', JSON.stringify(data));
  } catch (_) {}
}

function num(k) {
  return Number(data[k]);
}

function selected(key, value) {
  return String(data[key]) === String(value) ? 'selected' : '';
}

function numberInput(k, label, step, extra = '') {
  return `<label class="field">${label}
    <input data-key="${k}" type="number" step="${step}" value="${data[k]}" ${extra}>
  </label>`;
}

function selectInput(k, label, options) {
  return `<label class="field">${label}
    <select data-key="${k}">
      ${options.map(o => `<option value="${o.value}" ${selected(k, o.value)}>${o.label}</option>`).join('')}
    </select>
  </label>`;
}

function group(keys) {
  return `<div class="grid">${keys.map(k => {
    const [label, step] = fields[k];
    return numberInput(k, label, step);
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
    'strength', 'slump', 'msa', 'water', 'wc', 'coarseShare', 'air',
    'sgCement', 'sgSand', 'sgGravel', 'admixturePct',
    'limitMinCement', 'limitMaxCement', 'limitWc'
  ];

  for (const k of numericKeys) {
    if (!Number.isFinite(Number(data[k]))) {
      throw Error('یکی از ورودی‌های عددی نامعتبر است.');
    }
  }

  if (num('strength') <= 0 || num('msa') <= 0) {
    throw Error('مقاومت و اندازه اسمی سنگدانه باید مثبت باشند.');
  }

  const range = slumpRange();
  if (num('slump') < range.min || num('slump') > range.max) {
    throw Error(`اسلامپ رده انتخابی باید بین ${range.min} و ${range.max} میلی‌متر باشد.`);
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

  if (num('admixturePct') < 0 || num('admixturePct') > 20) {
    throw Error('درصد افزودنی باید بین صفر و ۲۰ باشد.');
  }

  if (data.admixture !== 'water_reducer' && num('admixturePct') > 0) {
    // درصد برای گزارش دوز افزودنی نیز پذیرفته می‌شود.
  }

  if (data.admixture === 'water_reducer' && num('admixturePct') >= 100) {
    throw Error('درصد کاهش آب باید کمتر از ۱۰۰ باشد.');
  }

  for (const k of ['sgCement', 'sgSand', 'sgGravel']) {
    if (num(k) <= 0) throw Error('چگالی نسبی باید مثبت باشد.');
  }

  for (const k of ['absSand', 'absGravel', 'wetSand', 'wetGravel']) {
    if (Number(data[k]) < 0) throw Error('مقادیر داخلی جذب آب و رطوبت نمی‌توانند منفی باشند.');
  }

  const water = effectiveWater();
  const cement = water / num('wc');

  if (data.limitMinCementOn && cement < num('limitMinCement')) {
    throw Error(`مقدار سیمان ${cement.toFixed(1)} kg/m³ کمتر از حداقل تعیین‌شده است.`);
  }

  if (data.limitMaxCementOn && cement > num('limitMaxCement')) {
    throw Error(`مقدار سیمان ${cement.toFixed(1)} kg/m³ از حداکثر تعیین‌شده بیشتر است.`);
  }

  if (data.limitWcOn && num('wc') > num('limitWc')) {
    throw Error('نسبت آب به سیمان از حداکثر مجاز واردشده بیشتر است.');
  }
}

class Step1 {
  run() {
    return { wc: num('wc'), strength: num('strength') };
  }
}

class Step2 {
  run() {
    const sieve = [37.5, 25, 19, 12.5, 9.5, 4.75, 2.36, 0.6];
    const parse = k => String(data[k]).split(',').map(x => Number(x.trim()));
    const sand = parse('sandPassing');
    const gravel = parse('gravelPassing');

    if (sand.length !== 8 || gravel.length !== 8 ||
        [...sand, ...gravel].some(x => !Number.isFinite(x) || x < 0 || x > 100)) {
      throw Error('برای هر مصالح، ۸ درصد عبوری بین صفر تا ۱۰۰ وارد کنید.');
    }

    const share = num('coarseShare');
    return {
      sieve,
      sand,
      gravel,
      mix: sand.map((v, i) => v * (1 - share) + gravel[i] * share)
    };
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

    const c = new Step4().run().cement;
    const w = effectiveWater();
    const vc = c / (num('sgCement') * 1000);
    const vw = w / 1000;
    const va = num('air') / 100;
    const agg = 1 - vc - vw - va;

    if (agg <= 0) throw Error('حجم باقی‌مانده برای سنگ‌دانه مثبت نیست.');

    const vg = agg * num('coarseShare');
    const vs = agg - vg;
    const s = vs * num('sgSand') * 1000;
    const g = vg * num('sgGravel') * 1000;

    // مقادیر رطوبت داخلی‌اند؛ ورودی صفحه برای آن‌ها نمایش داده نمی‌شود.
    const as = Number(data.absSand) / 100;
    const ag = Number(data.absGravel) / 100;
    const ms = Number(data.wetSand) / 100;
    const mg = Number(data.wetGravel) / 100;

    const sw = s * (1 + ms) / (1 + as);
    const gw = g * (1 + mg) / (1 + ag);
    const batchWater = w
      - s * (ms - as) / (1 + as)
      - g * (mg - ag) / (1 + ag);

    const admixtureMass = c * num('admixturePct') / 100;

    return {
      c, w, s, g, sw, gw, batchWater,
      vc, vw, va, vs, vg, admixtureMass,
      volume: vc + vw + va + vs + vg
    };
  }
}

function graph(xs, lines, log = false) {
  const W = 660, H = 310, L = 55, R = 20, T = 22, B = 47;
  const X = x => log
    ? L + (Math.log(x) - Math.log(xs[xs.length - 1])) /
      (Math.log(xs[0]) - Math.log(xs[xs.length - 1])) * (W - L - R)
    : L + x * (W - L - R) / (xs.length - 1);
  const Y = y => T + (100 - y) * (H - T - B) / 100;
  const parts = [`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="نمودار درصد عبوری">`];

  for (let n = 0; n <= 100; n += 20) {
    parts.push(`<line x1="${L}" y1="${Y(n)}" x2="${W-R}" y2="${Y(n)}" stroke="#dbe5eb"/>`);
    parts.push(`<text x="${L-8}" y="${Y(n)+4}" text-anchor="end" font-size="11">${n}</text>`);
  }

  xs.forEach((x, i) => {
    parts.push(`<text x="${X(log ? x : i)}" y="${H-21}" text-anchor="middle" font-size="10">${x}</text>`);
  });

  lines.forEach(([name, values, color], j) => {
    const pts = values.map((y, i) => `${X(log ? xs[i] : i)},${Y(y)}`).join(' ');
    parts.push(`<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3"/>`);
    parts.push(`<text x="${L+j*150}" y="${H-4}" font-size="12" fill="${color}">${name}</text>`);
  });

  return parts.join('') + '</svg>';
}

function table(rows) {
  return `<table><tbody>${rows.map(([k, v]) =>
    `<tr><td>${k}</td><td>${typeof v === 'number' ? v.toFixed(2) : v}</td></tr>`
  ).join('')}</tbody></table>`;
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

function renderHome() {
  const range = slumpRange();
  const grading = gradingOptions.find(o => o.value === data.grading) || gradingOptions[0];

  return `
    <h2>اطلاعات اولیه طرح</h2>
    <div class="grid">
      ${numberInput('strength', fields.strength[0], fields.strength[1])}
      ${selectInput('slumpClass', 'رده اسلامپ', Object.entries(slumpClasses).map(([value, o]) => ({
        value, label: `${o.label} (${o.min}–${o.max} mm)`
      })))}
      ${numberInput('slump', fields.slump[0], 1, `min="${range.min}" max="${range.max}"`)}
      ${numberInput('msa', fields.msa[0], 0.1)}
    </div>
    <p class="hint">بازه اسلامپ نمایش‌داده‌شده مقدار اولیه برنامه است و باید با مرجع معتبر کنترل شود. عدد واردشده فقط در بازه رده انتخابی پذیرفته می‌شود.</p>

    <div class="grid">
      ${selectInput('grading', 'وضعیت کلی دانه‌بندی', gradingOptions)}
      ${selectInput('admixture', 'نوع افزودنی', admixtureOptions)}
      ${numberInput('admixturePct', 'درصد افزودنی نسبت به جرم سیمان (%)', 0.1, 'min="0" max="20"')}
      ${numberInput('air', 'هوای بتن (%)', 0.1)}
    </div>
    <p class="hint">${grading.description}</p>
    <p class="hint">در حالت «کاهنده نیاز آب»، درصد واردشده به‌عنوان کاهش آب در محاسبات اعمال می‌شود؛ مقدار واقعی باید طبق مشخصات محصول و طرح آزمایشی تعیین شود. برای افزودنی افزایش‌دهنده اسلامپ، کاهش آب به‌طور خودکار فرض نمی‌شود.</p>

    <h3>کنترل‌های اختیاری طرح</h3>
    ${checkboxField('limitMinCementOn', 'اعمال حداقل مقدار سیمان', 'limitMinCement', 'حداقل سیمان (kg/m³)', 1)}
    ${checkboxField('limitMaxCementOn', 'اعمال حداکثر مقدار سیمان', 'limitMaxCement', 'حداکثر سیمان (kg/m³)', 1)}
    ${checkboxField('limitWcOn', 'اعمال حداکثر نسبت آب به سیمان', 'limitWc', 'حداکثر نسبت آب به سیمان', 0.001)}

    <details>
      <summary>تنظیمات پیشرفته مصالح</summary>
      <div class="grid advanced-grid">
        ${numberInput('sgCement', fields.sgCement[0], 0.01)}
        ${numberInput('sgSand', fields.sgSand[0], 0.01)}
        ${numberInput('sgGravel', fields.sgGravel[0], 0.01)}
      </div>
      <p class="hint">مقادیر رطوبت و جذب آب در این نسخه از مقادیر داخلی پیش‌فرض استفاده می‌کنند و در صفحه نمایش داده نمی‌شوند. برای گزارش اجرایی باید این مقادیر با داده‌های واقعی مصالح جایگزین شوند.</p>
    </details>
    <p class="hint">مقادیر پیش‌فرض نمونه‌اند؛ نمودارها و حدود رسمی مرجع هنوز در این نسخه اعتبارسنجی نشده‌اند.</p>
  `;
}

function view() {
  document.getElementById('tabs').innerHTML = titles.map((t, i) =>
    `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''}">${t}</button>`
  ).join('');

  let html = '';

  try {
    switch (page) {
      case 0:
        html = renderHome();
        break;

      case 1: {
        const r = new Step1().run();
        html = `<h2>گام اول — تعیین نسبت آب به سیمان</h2>
          ${group(['wc'])}
          <p class="hint">نسبت آب به سیمان باید با توجه به مقاومت، دوام، نوع سیمان و مصالح از مرجع معتبر انتخاب شود. برنامه در این بخش مقدار انتخابی کاربر را ثبت می‌کند و منحنی رسمی تولید نمی‌کند.</p>
          ${table([
            ['مقاومت مشخصه (MPa)', r.strength],
            ['نسبت آب به سیمان منتخب', r.wc]
          ])}`;
        break;
      }

      case 2: {
        const r = new Step2().run();
        html = `<h2>گام دوم — منحنی مخلوط دانه‌بندی</h2>
          ${group(['msa', 'coarseShare'])}
          <p class="hint">درصد عبوری را به ترتیب الک‌های 37.5، 25، 19، 12.5، 9.5، 4.75، 2.36 و 0.6 میلی‌متر وارد کنید. حدود مجاز رسمی هنوز در این نسخه اعمال نشده‌اند.</p>
          <label class="field">درصد عبوری ماسه (۸ عدد با ویرگول)
            <input data-key="sandPassing" value="${data.sandPassing}">
          </label>
          <label class="field">درصد عبوری شن (۸ عدد با ویرگول)
            <input data-key="gravelPassing" value="${data.gravelPassing}">
          </label>
          ${graph(r.sieve, [
            ['ماسه', r.sand, '#dd8c27'],
            ['شن', r.gravel, '#267eae'],
            ['مخلوط', r.mix, '#208257']
          ], true)}
          ${table(r.sieve.map((x, i) => ['عبوری مخلوط از الک ' + x + ' mm', r.mix[i]]))}`;
        break;
      }

      case 3: {
        const r = new Step3().run();
        html = `<h2>گام سوم — تعیین آب آزاد</h2>
          ${group(['water'])}
          <p class="hint">آب آزاد پایه را از مرجع معتبر انتخاب کنید. اگر گزینه کاهنده نیاز آب فعال باشد، کاهش واردشده در مقدار آب مؤثر اعمال می‌شود.</p>
          ${table([
            ['آب آزاد پایه (kg/m³)', r.baseWater],
            ['آب آزاد پس از اعمال کاهش انتخابی (kg/m³)', r.water]
          ])}`;
        break;
      }

      case 4: {
        const r = new Step4().run();
        html = `<h2>گام چهارم — تعیین مقدار سیمان</h2>
          ${group(['wc', 'water'])}
          ${table([
            ['آب مؤثر محاسبات (kg/m³)', effectiveWater()],
            ['سیمان محاسباتی (kg/m³)', r.cement],
            ['درصد افزودنی از جرم سیمان (%)', num('admixturePct')],
            ['جرم افزودنی (kg/m³)', r.cement * num('admixturePct') / 100]
          ])}
          <p class="hint">رابطه محاسباتی: سیمان = آب مؤثر ÷ نسبت آب به سیمان. محدودیت‌های اختیاری در صفحه اطلاعات اولیه کنترل می‌شوند؛ مقادیر مجاز باید توسط طراح از مرجع معتبر وارد شوند.</p>`;
        break;
      }

      case 5: {
        const r = new Step5().run();
        html = `<h2>گام پنجم — سنگ‌دانه و گزارش</h2>
          ${group(['coarseShare'])}
          ${table([
            ['آب آزاد مؤثر طرح (kg/m³)', r.w],
            ['سیمان (kg/m³)', r.c],
            ['ماسه SSD (kg/m³)', r.s],
            ['شن SSD (kg/m³)', r.g],
            ['ماسه مرطوب قابل توزین (kg/m³)', r.sw],
            ['شن مرطوب قابل توزین (kg/m³)', r.gw],
            ['آب قابل افزودن به مخلوط‌کن (kg/m³)', r.batchWater],
            ['جرم افزودنی (kg/m³)', r.admixtureMass],
            ['حجم محاسباتی اجزا (m³)', r.volume]
          ])}
          <button type="button" id="print">چاپ / ذخیره PDF</button>
          <p class="hint">گزارش بر مبنای روش حجم مطلق و مقادیر داخلی جذب آب و رطوبت است. چون رطوبت واقعی مصالح در این نسخه دریافت نمی‌شود، نتایج توزین و آب افزودنی را پیش از استفاده اجرایی کنترل کنید.</p>`;
        break;
      }
    }
  } catch (e) {
    html = `<p class="bad">${e.message}</p><p>ورودی‌های این بخش را اصلاح کنید.</p>`;
  }

  document.getElementById('screen').innerHTML = `<article class="panel">${html}</article>`;

  document.querySelectorAll('[data-page]').forEach(b => {
    b.onclick = () => {
      page = Number(b.dataset.page);
      view();
    };
  });

  document.querySelectorAll('[data-key]').forEach(el => {
    el.onchange = () => {
      const key = el.dataset.key;
      const oldValue = data[key];
      data[key] = el.type === 'number' ? Number(el.value) : el.value;

      try {
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
        if (key === 'sandPassing' || key === 'gravelPassing') new Step2().run();
        save();
        view();
      } catch (e) {
        data[key] = oldValue;
        view();
        alert(e.message);
      }
    };
  });

  document.querySelectorAll('[data-check]').forEach(el => {
    el.onchange = () => {
      data[el.dataset.check] = el.checked;
      save();
      view();
    };
  });

  const printButton = document.getElementById('print');
  if (printButton) printButton.onclick = () => window.print();

  document.getElementById('prev').disabled = page === 0;
  document.getElementById('next').disabled = page === 5;
}

document.getElementById('prev').onclick = () => {
  page = Math.max(0, page - 1);
  view();
};

document.getElementById('next').onclick = () => {
  page = Math.min(5, page + 1);
  view();
};

save();
view();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
