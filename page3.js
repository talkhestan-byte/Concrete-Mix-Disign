
/* Beton479 — صفحه سوم: دانه‌بندی و سهم‌بندی سنگدانه‌ها
   این فایل باید پس از app.js بارگذاری شود.
*/

'use strict';

const p3Reference = {
  '9.5': [
    [100,100,100],[100,100,100],[100,100,100],[100,100,100],
    [100,100,100],[75,84,90],[61,74,82],[37,53,66],
    [22,37,51],[12,24,37],[6,14,24],[2,6,12]
  ],
  '12.5': [
    [100,100,100],[100,100,100],[100,100,100],[100,100,100],
    [83,89,93],[62,75,84],[51,66,77],[31,47,62],
    [18,32,48],[10,21,35],[5,13,22],[2,5,11]
  ],
  '19': [
    [100,100,100],[100,100,100],[100,100,100],[75,84,90],
    [62,75,84],[47,62,76],[38,55,70],[22,40,56],
    [14,28,43],[8,18,31],[4,11,20],[2,5,10]
  ],
  '25': [
    [100,100,100],[100,100,100],[83,89,94],[62,75,85],
    [51,67,79],[39,56,71],[32,49,65],[19,36,52],
    [11,25,41],[6,16,29],[3,9,19],[1,4,9]
  ]
};

const p3RefSieves = [
  37.5,25,19,12.5,9.5,6.35,4.75,2.38,1.19,0.6,0.3,0.15
];

const p3Colors = ['#ed7c40','#15986c','#8e5ab5','#cc537f'];

const p3Escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[c]));

const p3Num = v => v === '' || v == null ? NaN : Number(v);

function p3EnsureDefaults() {
  if (!Array.isArray(data.aggregateShares)) {
    data.aggregateShares = ['', '', '', ''];
  }

  const n = Number(data.aggregateCount) || 2;
  const current = data.aggregateShares.slice(0, n);

  if (current.every(v => v === '' || v == null)) {
    for (let i = 0; i < n; i++) {
      data.aggregateShares[i] =
        n === 2 ? 50 : Number((100 / n).toFixed(2));
    }

    if (n === 3) data.aggregateShares[2] = 33.34;
    save();
  }

  if (!Array.isArray(data.p3Visible)) {
    data.p3Visible = [true, true, true, true];
  }
}

function p3Combined() {
  const n = Number(data.aggregateCount);
  const shares = data.aggregateShares.slice(0, n).map(p3Num);
  const total = shares.reduce((a, b) => a + b, 0);

  const validShares =
    shares.every(v => Number.isFinite(v) && v >= 0 && v <= 100) &&
    Math.abs(total - 100) < 0.011;

  const ready = validShares &&
    sieves.every((_, j) =>
      data.aggregates.slice(0, n).every(a => {
        const v = p3Num(a.passing[j]);
        return Number.isFinite(v) && v >= 0 && v <= 100;
      })
    );

  const values = ready
    ? sieves.map((s, j) => ({
        mm: s.mm,
        value: data.aggregates.slice(0, n).reduce(
          (sum, a, i) =>
            sum + Number(a.passing[j]) * shares[i] / 100,
          0
        )
      }))
    : [];

  const fractureReady = validShares &&
    data.aggregates.slice(0, n).every(
      a => Number.isFinite(p3Num(a.fracture))
    );

  const fracture = fractureReady
    ? data.aggregates.slice(0, n).reduce(
        (sum, a, i) =>
          sum + Number(a.fracture) * shares[i] / 100,
        0
      )
    : null;

  const fmSizes = [9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15];

  const fm = ready
    ? fmSizes.reduce((sum, mm) => {
        const point = values.find(
          p => Math.abs(p.mm - mm) < 0.02
        );
        return sum + (point ? 100 - point.value : 0);
      }, 0) / 100
    : null;

  return {
    n, shares, total, validShares,
    ready, values, fracture, fm
  };
}

function p3Chart(result) {
  const W = 850, H = 415;
  const L = 48, R = 22, T = 44, B = 42;

  const min = Math.log10(0.15);
  const max = Math.log10(37.5);

  const x = v =>
    L + (Math.log10(v) - min) / (max - min) * (W - L - R);

  const y = v =>
    H - B - v / 100 * (H - T - B);

  const path = points => points.map((p, i) =>
    `${i ? 'L' : 'M'}${x(p.mm).toFixed(2)},${y(p.value).toFixed(2)}`
  ).join(' ');

  const ref = p3Reference[String(data.msa)];

  let svg = `<svg viewBox="0 0 ${W} ${H}"
    style="width:100%;min-width:650px;display:block;background:#fff"
    role="img" aria-label="منحنی‌های دانه‌بندی مرجع و مخلوط">`;

  for (let v = 0; v <= 100; v += 10) {
    svg += `
      <line x1="${L}" y1="${y(v)}"
        x2="${W-R}" y2="${y(v)}" stroke="#e2e8f0"/>
      <text x="${L-8}" y="${y(v)+4}"
        text-anchor="end" font-size="12" fill="#334155">${v}</text>`;
  }

  for (const mm of p3RefSieves) {
    svg += `
      <line x1="${x(mm)}" y1="${T}"
        x2="${x(mm)}" y2="${H-B}"
        stroke="#aebccc" stroke-dasharray="4 4"/>
      <text x="${x(mm)}" y="${T-11}"
        text-anchor="middle" font-size="11" fill="#334155">${mm}</text>`;
  }

  svg += `
    <line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"
      stroke="#475569"/>
    <line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"
      stroke="#475569"/>`;

  if (ref) {
    for (let k = 0; k < 3; k++) {
      const pts = p3RefSieves.map((mm, i) => ({
        mm,
        value: ref[i][k]
      }));

      svg += `
        <path d="${path(pts)}" fill="none"
          stroke="#6dc9f2" stroke-width="${k === 1 ? 2.7 : 2}"/>`;

      const labelAt = pts.find(p => p.mm === 2.38);

      svg += `
        <text x="${x(labelAt.mm)+7}" y="${y(labelAt.value)-7}"
          font-size="17" font-weight="bold" fill="#208ec9">
          ${['A', 'B', 'C'][k]}
        </text>`;
    }
  }

  for (let i = 0; i < result.n; i++) {
    if (data.p3Visible[i] === false) continue;

    const a = data.aggregates[i];
    const pts = sieves.map((s, j) => ({
      mm: s.mm,
      value: p3Num(a.passing[j])
    }));

    if (pts.every(p =>
      Number.isFinite(p.value) &&
      p.value >= 0 &&
      p.value <= 100
    )) {
      svg += `
        <path d="${path(pts)}" fill="none"
          stroke="${p3Colors[i]}" stroke-width="2.3"/>`;
    }
  }

  if (result.ready) {
    svg += `
      <path d="${path(result.values)}" fill="none"
        stroke="#111827" stroke-width="3.2"/>`;
  }

  svg += `
    <text x="${W/2}" y="${H-7}"
      text-anchor="middle" font-size="13" fill="#334155">
      اندازه الک (میلی‌متر) ـ مقیاس لگاریتمی
    </text>
  </svg>`;

  return svg;
}

function p3Output() {
  const r = p3Combined();
  const chart = document.getElementById('p3-chart');
  const summary = document.getElementById('p3-summary');

  if (chart) chart.innerHTML = p3Chart(r);
  if (!summary) return;

  const totalText = Number.isFinite(r.total)
    ? r.total.toFixed(2)
    : '—';

  const message = !r.validShares
    ? 'مجموع سهم‌ها باید ۱۰۰٪ باشد.'
    : !r.ready
      ? 'برای رسم منحنی مخلوط، درصد عبوری تمام الک‌های صفحه دوم را وارد کنید.'
      : 'منحنی سیاه، دانه‌بندی ترکیبی محاسبه‌شده است.';

  const rows = r.ready
    ? r.values.map(p => `
        <tr>
          <td>${p.mm}</td>
          <td>${p.value.toFixed(2)}٪</td>
        </tr>`).join('')
    : `<tr><td colspan="2">داده‌های کامل هنوز وارد نشده‌اند.</td></tr>`;

  summary.innerHTML = `
    <p><strong>مجموع سهم‌ها: ${totalText}٪</strong> — ${message}</p>

    <div class="table-scroll">
      <table>
        <thead>
          <tr><th>الک (mm)</th><th>عبوری مخلوط</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <p>درصد شکستگی معادل مخلوط:
      <strong>${r.fracture == null ? '—' : r.fracture.toFixed(2) + '٪'}</strong>
    </p>

    <p>مدول نرمی محاسباتی مخلوط:
      <strong>${r.fm == null ? '—' : r.fm.toFixed(2)}</strong>
    </p>

    <p class="hint">
      مدول نرمی با جمع درصد مانده تجمعی روی الک‌های متعارف محاسبه شده است.
      مبنای الک‌ها باید با راهنمای طرح مخلوط تطبیق داده شود.
    </p>`;
}

renderShares = function () {
  p3EnsureDefaults();

  const n = Number(data.aggregateCount);

  const rows = Array.from({ length: n }, (_, i) => `
    <tr>
      <td>${p3Escape(data.aggregates[i].name)}</td>
      <td>
        <input type="number" inputmode="decimal"
          min="0" max="100" step="0.1"
          data-p3-share="${i}"
          value="${data.aggregateShares[i] ?? ''}"
          style="max-width:95px"> ٪
      </td>
      <td>
        <input type="checkbox"
          data-p3-visible="${i}"
          ${data.p3Visible[i] === false ? '' : 'checked'}
          aria-label="نمایش منحنی ${p3Escape(data.aggregates[i].name)}">
      </td>
    </tr>`).join('');

  return `
    <h2>سهم‌بندی و منحنی دانه‌بندی سنگدانه‌ها</h2>

    <p class="hint">
      NMSA انتخاب‌شده:
      <strong>${data.msa} میلی‌متر</strong>
      — منحنی‌های A، B و C از جدول مرجع فراخوانی می‌شوند.
    </p>

    <div class="table-scroll" id="p3-chart"></div>

    <h3>جدول سهم‌بندی و نمایش منحنی‌ها</h3>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>نام سنگدانه</th>
            <th>سهم جرمی در مخلوط</th>
            <th>نمایش منحنی</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div id="p3-summary"></div>

    <p class="hint">
      برای دو سنگدانه سهم اولیه هرکدام ۵۰٪ است.
      تغییر سهم‌ها بلافاصله منحنی مخلوط را به‌روزرسانی می‌کند.
    </p>`;
};

const p3OriginalView = view;

view = function () {
  p3OriginalView();

  if (page === 2) p3Output();
};

document.addEventListener('input', function (event) {
  const el = event.target;

  if (!el.matches('[data-p3-share]')) return;

  const i = Number(el.dataset.p3Share);
  const v = el.value === '' ? '' : Number(el.value);

  data.aggregateShares[i] = v;
  save();
  p3Output();
});

document.addEventListener('change', function (event) {
  const el = event.target;

  if (!el.matches('[data-p3-visible]')) return;

  data.p3Visible[Number(el.dataset.p3Visible)] = el.checked;
  save();
  p3Output();
});

if (page === 2) view();
