
'use strict';

/* صفحه سوم ـ دانه‌بندی و سهم‌بندی سنگدانه‌ها */

const p3Sieves = [
  37.5, 25, 19, 12.5, 9.5,
  4.75, 2.36, 1.18, 0.6, 0.3, 0.15
];
const p3Reference = {
  37.5: [
    [100,100,100],
    [75,85,91],
    [62,76,86],
    [47,64,77],
    [39,57,72],
    [24,42,60],
    [14,30,48],
    [9,21,37],
    [5,14,27],
    [2,8,17],
    [1,4,8]
  ],
  25: [
    [100,100,100],
    [100,100,100],
    [83,89,94],
    [62,75,85],
    [51,67,79],
    [32,49,65],
    [19,36,52],
    [11,25,41],
    [6,16,29],
    [3,9,19],
    [1,4,9]
  ],
  19: [
    [100,100,100],
    [100,100,100],
    [100,100,100],
    [75,84,90],
    [62,75,84],
    [38,55,70],
    [23,40,56],
    [14,28,43],
    [8,18,31],
    [4,11,20],
    [2,5,10]
  ],
  12.5: [
    [100,100,100],
    [100,100,100],
    [100,100,100],
    [100,100,100],
    [82,89,93],
    [51,66,77],
    [31,47,62],
    [18,33,48],
    [10,21,35],
    [5,12,22],
    [2,5,11]
  ],
  9.5: [
    [100,100,100],
    [100,100,100],
    [100,100,100],
    [100,100,100],
    [100,100,100],
    [61,74,83],
    [37,53,66],
    [22,37,51],
    [12,24,37],
    [6,14,24],
    [2,6,12]
  ]
};

const p3Colors = ['#e87942', '#168b70', '#8656ad', '#d14f78'];

function p3Escape(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  })[c]);
}

function p3Init() {
  if (!Array.isArray(data.aggregateShares)) {
    data.aggregateShares = ['', '', '', ''];
  }

  const n = Number(data.aggregateCount) || 2;

  if (data.aggregateShares.slice(0, n).every(
    v => v === '' || v == null
  )) {
    for (let i = 0; i < n; i++) {
      data.aggregateShares[i] = Number((100 / n).toFixed(2));
    }
    if (n === 3) data.aggregateShares[2] = 33.34;
    save();
  }

  if (!Array.isArray(data.p3Visible)) {
    data.p3Visible = [true, true, true, true];
  }
}

function p3Calculate() {
  const n = Number(data.aggregateCount);
  const aggregates = data.aggregates.slice(0, n);

  const shares = data.aggregateShares
    .slice(0, n)
    .map(v => v === '' || v == null ? NaN : Number(v));

  const total = shares.reduce(
    (sum, v) => sum + (Number.isFinite(v) ? v : 0),
    0
  );

  const validShares =
    shares.length === n &&
    shares.every(v =>
      Number.isFinite(v) && v >= 0 && v <= 100
    ) &&
    Math.abs(total - 100) < 0.011;

  const passingIndex = p3Sieves.map(mm =>
    sieves.findIndex(s => Math.abs(s.mm - mm) < 0.02)
  );

  const ready = validShares &&
    aggregates.length === n &&
    passingIndex.every(j => j >= 0) &&
    aggregates.every(a =>
      passingIndex.every(j => {
        const value = a.passing[j];
        return value !== '' &&
          value != null &&
          Number.isFinite(Number(value)) &&
          Number(value) >= 0 &&
          Number(value) <= 100;
      })
    );

  const combined = ready
    ? p3Sieves.map((mm, i) => ({
        mm,
        value: aggregates.reduce(
          (sum, a, k) =>
            sum + Number(a.passing[passingIndex[i]]) *
              shares[k] / 100,
          0
        )
      }))
    : [];

  const fractureReady = validShares &&
    aggregates.length === n &&
    aggregates.every(a =>
      a.fracture !== '' &&
      a.fracture != null &&
      Number.isFinite(Number(a.fracture)) &&
      Number(a.fracture) >= 0 &&
      Number(a.fracture) <= 100
    );

  const fracture = fractureReady
    ? aggregates.reduce(
        (sum, a, i) =>
          sum + Number(a.fracture) * shares[i] / 100,
        0
      )
    : null;

  const fmSizes = [
    9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15
  ];

  const fm = ready
    ? fmSizes.every(mm =>
        combined.some(p => Math.abs(p.mm - mm) < 0.02)
      )
      ? fmSizes.reduce((sum, mm) => {
          const p = combined.find(
            v => Math.abs(v.mm - mm) < 0.02
          );
          return sum + 100 - p.value;
        }, 0) / 100
      : null
    : null;

  return {
    n,
    shares,
    total,
    validShares,
    ready,
    combined,
    fracture,
    fm
  };
}
function p3Chart(r) {
  const W = 850, H = 420, L = 48, R = 20, T = 48, B = 42;
  const min = Math.log10(0.15), max = Math.log10(37.5);

  const x = mm => L +
    (Math.log10(mm) - min) / (max - min) * (W - L - R);

  const y = v => H - B - v / 100 * (H - T - B);

  const path = pts => pts.map((p, i) =>
    `${i ? 'L' : 'M'}${x(p.mm).toFixed(2)},${y(p.value).toFixed(2)}`
  ).join(' ');

  let svg = `<svg viewBox="0 0 ${W} ${H}"
    style="width:100%;min-width:620px;background:#fff"
    role="img" aria-label="نمودار دانه‌بندی سنگدانه‌ها">`;

  for (let v = 0; v <= 100; v += 10) {
    svg += `
      <line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}"
        stroke="#d9e2ec"/>
      <text x="${L-7}" y="${y(v)+4}" text-anchor="end"
        font-size="12" fill="#334155">${v}</text>`;
  }

  for (const mm of p3Sieves) {
    svg += `
      <line x1="${x(mm)}" y1="${T}" x2="${x(mm)}" y2="${H-B}"
        stroke="#a8b6c6" stroke-dasharray="4 4"/>
      <text x="${x(mm)}" y="${T-12}" text-anchor="middle"
        font-size="11" fill="#334155">${mm}</text>`;
  }

  svg += `
    <line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#475569"/>
    <line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#475569"/>`;

  const ref = p3Reference[Number(data.msa)];

  if (ref) {
    ['A', 'B', 'C'].forEach((label, k) => {
      const pts = p3Sieves.map((mm, i) => ({
        mm, value: ref[i][k]
      }));

      svg += `<path d="${path(pts)}" fill="none"
        stroke="#72c9f0" stroke-width="2.4"/>`;

      const p = pts[7];
      svg += `<text x="${x(p.mm)+7}" y="${y(p.value)-6}"
        font-size="16" font-weight="bold" fill="#238dbb">${label}</text>`;
    });
  }

  for (let i = 0; i < r.n; i++) {
    if (data.p3Visible[i] === false) continue;

    const a = data.aggregates[i];
    const pts = p3Sieves.map(mm => {
      const j = sieves.findIndex(s => Math.abs(s.mm - mm) < 0.02);
      return { mm, value: j >= 0 ? Number(a.passing[j]) : NaN };
    });

    if (pts.every(p => Number.isFinite(p.value) &&
      p.value >= 0 && p.value <= 100)) {
      svg += `<path d="${path(pts)}" fill="none"
        stroke="${p3Colors[i]}" stroke-width="2.3"/>`;
    }
  }

  if (r.ready) {
    svg += `<path d="${path(r.combined)}" fill="none"
      stroke="#111111" stroke-width="3.2"/>`;
  }

  svg += `
    <text x="${W/2}" y="${H-7}" text-anchor="middle"
      font-size="13" fill="#334155">اندازه الک (mm) ـ محور لگاریتمی</text>
  </svg>`;

  return svg;
}

function p3Refresh() {
  const r = p3Calculate();
  const chart = document.getElementById('p3-chart');
  const summary = document.getElementById('p3-summary');
  if (chart) chart.innerHTML = p3Chart(r);
  if (!summary) return;

  const message = !r.validShares
    ? 'مجموع سهم‌ها باید ۱۰۰٪ باشد.'
    : !r.ready
      ? 'برای رسم مخلوط، درصد عبوری الک‌ها را در صفحه دوم وارد کنید.'
      : 'منحنی سیاه نشان‌دهنده دانه‌بندی ترکیبی است.';

  const rows = r.ready
    ? r.combined.map(p => `<tr><td>${p.mm}</td>
        <td>${p.value.toFixed(2)}٪</td></tr>`).join('')
    : '<tr><td colspan="2">اطلاعات دانه‌بندی کامل نیست.</td></tr>';

  summary.innerHTML = `
    <p><strong>مجموع سهم‌ها: ${r.total.toFixed(2)}٪</strong></p>
    <p>${message}</p>
    <div class="table-scroll">
      <table><thead><tr><th>الک (mm)</th>
        <th>درصد عبوری مخلوط</th></tr></thead>
        <tbody>${rows}</tbody></table>
    </div>
    <p>درصد شکستگی معادل مخلوط:
      <strong>${r.fracture == null ? '—' : r.fracture.toFixed(2) + '٪'}</strong>
    </p>
    <p>مدول نرمی محاسباتی:
      <strong>${r.fm == null ? '—' : r.fm.toFixed(2)}</strong>
    </p>`;
}

renderShares = function () {
  p3Init();
  const n = Number(data.aggregateCount);

  const rows = Array.from({ length: n }, (_, i) => `
    <tr>
      <td>${p3Escape(data.aggregates[i].name)}</td>
      <td><input type="number" min="0" max="100" step="0.1"
        inputmode="decimal" data-p3-share="${i}"
        value="${data.aggregateShares[i] ?? ''}" style="width:85px">٪</td>
      <td><input type="checkbox" data-p3-visible="${i}"
        ${data.p3Visible[i] === false ? '' : 'checked'}></td>
    </tr>`).join('');

  return `
    <h2>سهم‌بندی و منحنی دانه‌بندی سنگدانه‌ها</h2>
    <p class="hint">NMSA انتخاب‌شده: ${data.msa} میلی‌متر</p>
    <div class="table-scroll" id="p3-chart"></div>
    <h3>سهم سنگدانه‌ها</h3>
    <div class="table-scroll">
      <table><thead><tr><th>نام سنگدانه</th>
        <th>سهم جرمی</th><th>نمایش منحنی</th></tr></thead>
        <tbody>${rows}</tbody></table>
    </div>
    <div id="p3-summary"></div>`;
};

const p3OldView = view;

view = function () {
  p3OldView();
  if (page === 2) p3Refresh();
};

document.addEventListener('input', event => {
  const el = event.target;
  if (!el.matches('[data-p3-share]')) return;
  data.aggregateShares[Number(el.dataset.p3Share)] =
    el.value === '' ? '' : Number(el.value);
  save();
  p3Refresh();
});

document.addEventListener('change', event => {
  const el = event.target;
  if (!el.matches('[data-p3-visible]')) return;
  data.p3Visible[Number(el.dataset.p3Visible)] = el.checked;
  save();
  p3Refresh();
});

if (page === 2) view();
