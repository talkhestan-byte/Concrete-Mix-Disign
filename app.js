'use strict';

/* =========================================
طرح ملی مخلوط بتن
app.js  (اصلاح‌شده)
========================================= */

const STORAGE_KEY = 'beton479';

const defaults = {
strength: 30,
slumpClass: 'S3',
slump: 125,
msa: 19,
aggregateCount: 2,
cementClass: '42.5',
water: 185,
wc: 0.50,
coarseShare: 0.60,
grading: 'continuous',
admixture: 'none',
admixturePct: 0,
waterReductionPct: '',
sgAdmixture: 1.1,
limitMinCementOn: false,
limitMinCement: 280,
limitMaxCementOn: false,
limitMaxCement: 450,
limitWcOn: false,
limitWc: 0.50,
air: 2,
sgCement: 3.15,
sgSand: 2.65,
waterAbsSand: 0.5,
sgGravel: 2.70,
waterAbsGravel: 0.5,
targetMethod: 'manual',
workshopRank: 'A',
targetStrengthManual: '',
step1Strength: null,
aggregateShares: ['', '', '', ''],
showAggregateCurves: [true, true, true, true],
showMixCurve: true,
showReferenceCurves: true,
correctionFactor: 1.5,
cementAction: ''
};

const sieves = [
{ mm: 37.5, label: '37.5' },
{ mm: 25, label: '25' },
{ mm: 19, label: '19' },
{ mm: 12.5, label: '12.5' },
{ mm: 9.5, label: '9.5' },
{ mm: 6.35, label: '6.35' },
{ mm: 4.75, label: '4.75' },
{ mm: 2.36, label: '2.36' },
{ mm: 1.18, label: '1.18' },
{ mm: 0.6, label: '0.6' },
{ mm: 0.3, label: '0.3' },
{ mm: 0.15, label: '0.15' }
];

const slumpClasses = {
S1: { label: 'S1 (10-40 mm)', min: 10, max: 40 },
S2: { label: 'S2 (50-90 mm)', min: 50, max: 90 },
S3: { label: 'S3 (100-150 mm)', min: 100, max: 150 },
S4: { label: 'S4 (160-210 mm)', min: 160, max: 210 }
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
'1. آب به سیمان',
'2. آب آزاد',
'3. مقدار سیمان',
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
waterAbsSand: ['درصد جذب آب ماسه (%)', 0.1],
sgGravel: ['چگالی نسبی شن', 0.01],
waterAbsGravel: ['درصد جذب آب شن (%)', 0.1],
sgAdmixture: ['چگالی نسبی افزودنی', 0.01]
};

/* =========================================
داده‌ها و ذخیره‌سازی
========================================= */

let stored = {};
try {
stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
} catch (_) {
stored = {};
}

const data = { ...defaults, ...stored };

function defaultAggregate(index) {
return {
name: `سنگدانه ${index + 1}`,
fracture: 0,
sg: index === 0 ? 2.65 : 2.70,
waterAbs: 0.5,
passing: Array(sieves.length).fill('')
};
}

function sanitizeData() {
if (!['S1', 'S2', 'S3', 'S4'].includes(data.slumpClass)) {
data.slumpClass = 'S3';
}
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
if (!['continuous', 'gap_graded'].includes(data.grading)) {
data.grading = 'continuous';
}

data.limitMinCementOn = data.limitMinCementOn === true;
data.limitMaxCementOn = data.limitMaxCementOn === true;
data.limitWcOn = data.limitWcOn === true;

const numericFallbacks = {
strength: 30, slump: 125, water: 185, wc: 0.5,
coarseShare: 0.6, air: 2, sgCement: 3.15, sgSand: 2.65,
sgGravel: 2.7, waterAbsSand: 0.5, waterAbsGravel: 0.5,
sgAdmixture: 1.1, admixturePct: 0, limitMinCement: 280,
limitMaxCement: 450, limitWc: 0.5, correctionFactor: 1.5
};
for (const [k, fb] of Object.entries(numericFallbacks)) {
if (!Number.isFinite(Number(data[k]))) data[k] = fb;
}

if (data.waterReductionPct !== '' && data.waterReductionPct != null &&
!Number.isFinite(Number(data.waterReductionPct))) {
data.waterReductionPct = '';
}

if (data.step1Strength === undefined || data.step1Strength === '') {
data.step1Strength = null;
} else if (data.step1Strength !== null && !Number.isFinite(Number(data.step1Strength))) {
data.step1Strength = null;
} else if (data.step1Strength !== null) {
data.step1Strength = Number(data.step1Strength);
}
}

function normalizeData() {
const msaValue = Number(data.msa);
data.msa = [9.5, 12.5, 19, 25].includes(msaValue) ? msaValue : 19;

if (!Array.isArray(data.aggregates)) data.aggregates = [];

data.aggregates = data.aggregates.map((a, i) => {
const base = defaultAggregate(i);
const sourcePassing = Array.isArray(a.passing) ? a.passing.slice() : [];
if (sourcePassing.length === 11) {
sourcePassing.splice(SIEVE_635_INDEX, 0, '');
}
const legacySg = i === 0 ? data.sgSand : data.sgGravel;
const legacyAbs = i === 0 ? data.waterAbsSand : data.waterAbsGravel;
return {
...base,
...a,
sg: (a.sg === undefined || a.sg === '')
? (Number.isFinite(Number(legacySg)) ? Number(legacySg) : base.sg)
: Number(a.sg),
waterAbs: (a.waterAbs === undefined || a.waterAbs === '')
? (Number.isFinite(Number(legacyAbs)) ? Number(legacyAbs) : base.waterAbs)
: Number(a.waterAbs),
passing: sieves.map((sieve, j) => {
if (sieve.mm === 6.35) return '';
const v = sourcePassing[j];
return v === '' || v == null ? '' : Number(v);
})
};
});

while (data.aggregates.length < 4) {
data.aggregates.push(defaultAggregate(data.aggregates.length));
}
data.aggregates = data.aggregates.slice(0, 4);

data.aggregateCount = Math.max(2, Math.min(4, Number(data.aggregateCount) || 2));

data.aggregateShares = Array.from({ length: 4 }, (_, i) => {
const source = Array.isArray(data.aggregateShares) ? data.aggregateShares[i] : '';
return source === '' || source == null ? '' : Number(source);
});

data.showAggregateCurves = Array.from({ length: 4 }, (_, i) => {
const source = Array.isArray(data.showAggregateCurves) ? data.showAggregateCurves[i] : true;
return source !== false;
});

data.showMixCurve = data.showMixCurve !== false;
data.showReferenceCurves = data.showReferenceCurves !== false;

sanitizeData();
}

normalizeData();

let page = 0;

function save() {
const n = Math.max(2, Math.min(4, Number(data.aggregateCount) || 2));
const sand = data.aggregates[0];
if (sand && Number.isFinite(Number(sand.sg))) {
data.sgSand = Number(sand.sg);
data.waterAbsSand = Number(sand.waterAbs) || 0;
}
const gr = data.aggregates.slice(1, n);
if (gr.length) {
data.sgGravel = gr.reduce((s, a) => s + (Number(a.sg) || 0), 0) / gr.length;
data.waterAbsGravel = gr.reduce((s, a) => s + (Number(a.waterAbs) || 0), 0) / gr.length;
}
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
} catch (error) {
console.warn('ذخیره اطلاعات ناموفق بود', error);
}
}

function num(key) {
return Number(data[key]);
}

function escapeHtml(value) {
return String(value ?? '').replace(/[&<>"']/g, ch => ({
'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
}

function selected(key, value) {
return String(data[key]) === String(value) ? 'selected' : '';
}

function numberInput(key, label, step, extra = '') {
return `<label class="field"><span>${label}</span><input type="text" inputmode="decimal" enterkeyhint="next" data-key="${key}" data-step="${step}" value="${escapeHtml(data[key] ?? '')}" ${extra}></label>`;
}

function selectInput(key, label, options) {
return `<label class="field"><span>${label}</span><select data-key="${key}">${options.map(o =>
`<option value="${o.value}" ${selected(key, o.value)}>${o.label}</option>`
).join('')}</select></label>`;
}

/* =========================================
اعتبارسنجی
========================================= */

function slumpRange() {
return slumpClasses[data.slumpClass] || slumpClasses.S3;
}

function requireNumber(key, label) {
const raw = data[key];
if (raw === '' || raw == null || !Number.isFinite(Number(raw))) {
throw Error(`${label} باید عدد معتبر باشد.`);
}
return Number(raw);
}

function effectiveWater() {
const water = num('water');
if (data.admixture !== 'none') {
const pct = Number(data.waterReductionPct) || 0;
return water * (1 - pct / 100);
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
waterAbsSand: 'درصد جذب آب ماسه',
sgGravel: 'چگالی شن',
waterAbsGravel: 'درصد جذب آب شن'
};
for (const [key, label] of Object.entries(required)) {
requireNumber(key, label);
}

if (data.admixture !== 'none') {
requireNumber('sgAdmixture', 'چگالی افزودنی');
}

if (num('strength') <= 0) throw Error('مقاومت مشخصه باید مثبت باشد.');

const range = slumpRange();
if (num('slump') < range.min || num('slump') > range.max) {
throw Error(`اسلامپ باید بین ${range.min} و ${range.max} باشد.`);
}

if (![9.5, 12.5, 19, 25].includes(num('msa'))) throw Error('NMSA معتبر نیست.');
if (num('water') <= 0) throw Error('آب آزاد باید مثبت باشد.');
if (num('wc') <= 0 || num('wc') >= 1) throw Error('نسبت آب به سیمان باید بین صفر و یک باشد.');
if (num('coarseShare') <= 0 || num('coarseShare') >= 1) {
throw Error('سهم حجمی شن باید بین صفر و یک باشد.');
}
if (num('air') < 0 || num('air') >= 15) throw Error('درصد هوا باید بین صفر و ۱۵ باشد.');

for (const key of ['sgCement', 'sgSand', 'sgGravel']) {
if (num(key) <= 0) throw Error('چگالی نسبی باید مثبت باشد.');
}

if (num('waterAbsSand') < 0 || num('waterAbsGravel') < 0) {
throw Error('درصد جذب آب نمی‌تواند منفی باشد.');
}

if (data.admixture !== 'none') {
const pct = requireNumber('admixturePct', 'درصد افزودنی');
if (pct < 0 || pct >= 100) throw Error('درصد افزودنی باید بین صفر و ۱۰۰ باشد.');
if (num('sgAdmixture') <= 0) throw Error('چگالی افزودنی باید مثبت باشد.');

if (data.waterReductionPct !== '' && data.waterReductionPct != null) {
const rp = Number(data.waterReductionPct);
if (!Number.isFinite(rp) || rp < 0 || rp >= 100) {
throw Error('درصد کاهش آب باید بین صفر و ۱۰۰ باشد.');
}
}
}

if (data.limitMinCementOn) {
const minimum = requireNumber('limitMinCement', 'حداقل سیمان');
if (minimum <= 0) throw Error('حداقل سیمان باید مثبت باشد.');
}

if (data.limitMaxCementOn) {
const maximum = requireNumber('limitMaxCement', 'حداکثر سیمان');
if (maximum <= 0) throw Error('حداکثر سیمان باید مثبت باشد.');
}

if (data.limitWcOn) {
const maximum = requireNumber('limitWc', 'حداکثر نسبت آب به سیمان');
if (maximum <= 0 || maximum >= 1) {
throw Error('حداکثر نسبت آب به سیمان باید بین صفر و یک باشد.');
}
}
}

function validateAggregates() {
for (let i = 0; i < data.aggregateCount; i++) {
const a = data.aggregates[i];
if (a.fracture === '' || !Number.isFinite(Number(a.fracture)) ||
Number(a.fracture) < 0 || Number(a.fracture) > 100) {
throw Error(`درصد شکستگی سنگدانه ${i + 1} نامعتبر است.`);
}
if (a.sg === '' || !Number.isFinite(Number(a.sg)) || Number(a.sg) <= 0) {
throw Error(`چگالی نسبی سنگدانه ${i + 1} نامعتبر است.`);
}
if (a.waterAbs === '' || !Number.isFinite(Number(a.waterAbs)) || Number(a.waterAbs) < 0) {
throw Error(`درصد جذب آب سنگدانه ${i + 1} نامعتبر است.`);
}
let previous = null;
for (let j = 0; j < sieves.length; j++) {
if (sieves[j].mm === 6.35) continue;
const raw = a.passing[j];
if (raw === '' || raw == null) continue;
const value = Number(raw);
if (!Number.isFinite(value) || value < 0 || value > 100) {
throw Error(`درصد عبوری سنگدانه ${i + 1} از الک ${sieves[j].mm} نامعتبر است.`);
}
if (previous !== null && value > previous) {
throw Error(`در سنگدانه ${i + 1} درصد عبوری الک ${sieves[j].mm} از الک درشت‌تر بیشتر است.`);
}
previous = value;
}
}
}

function requireShares() {
const sharesInfo = getSharesInfo();
if (!sharesInfo.valid) {
throw Error('سهم‌بندی سنگدانه‌ها در صفحه سهم‌بندی باید کامل و مجموعاً ۱۰۰٪ باشد.');
}
return sharesInfo;
}

/* =========================================
محاسبات
========================================= */

class Step1 {
run() {
return { wc: num('wc'), strength: num('strength') };
}
}

class Step3 {
run() {
return { baseWater: num('water'), water: effectiveWater() };
}
}

class Step4 {
run() {
validate();
requireShares();
return { cement: effectiveWater() / num('wc') };
}
}

class Step5 {
run(overrides = {}) {
validate();
const info = requireShares();

const water = Number.isFinite(overrides.water) ? overrides.water : effectiveWater();
const cement = Number.isFinite(overrides.cement) ? overrides.cement : (water / num('wc'));
const admixtureMass = data.admixture === 'none'
? 0
: cement * num('admixturePct') / 100;
const sgAdm = num('sgAdmixture') || 1.1;

const vc = cement / (num('sgCement') * 1000);
const vw = water / 1000;
const va = num('air') / 100;
const va_adm = data.admixture === 'none' ? 0 : admixtureMass / (sgAdm * 1000);

const aggregateVolume = 1 - vc - vw - va - va_adm;
if (aggregateVolume <= 0) throw Error('حجم باقی‌مانده برای سنگدانه مثبت نیست.');

const gravelFrac = 1 - Number(info.shares[0]) / 100;
const sandFrac = 1 - gravelFrac;

const gravelVolume = aggregateVolume * gravelFrac;
const sandVolume = aggregateVolume * sandFrac;

const ssdSand = sandVolume * num('sgSand') * 1000;
const ssdGravel = gravelVolume * num('sgGravel') * 1000;

const drySand = ssdSand / (1 + num('waterAbsSand') / 100);
const dryGravel = ssdGravel / (1 + num('waterAbsGravel') / 100);

return {
cement, water, ssdSand, ssdGravel, drySand, dryGravel,
admixtureMass, vc, vw, va, va_adm,
aggregateVolume, sandVolume, gravelVolume,
sandFrac, gravelFrac
};
}
}

function getSoftMaxCement() {
if (data.limitMaxCementOn &&
Number.isFinite(Number(data.limitMaxCement)) &&
Number(data.limitMaxCement) > 0) {
return Number(data.limitMaxCement);
}
return 350;
}

/* =========================================
صفحه اول
========================================= */

function checkboxField(key, label, valueKey, valueLabel, step, disabled = false) {
return `<div class="limit-box"><label class="checkline"><input type="checkbox" data-check="${key}" ${data[key] ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${label}</span></label>${data[key] ? numberInput(valueKey, valueLabel, step) : ''}</div>`;
}

function renderHome() {
const range = slumpRange();
const minDisabled = data.limitMaxCementOn;
const maxDisabled = data.limitMinCementOn;
return `
<h2>اطلاعات اولیه طرح</h2>

<div class="grid">
  ${numberInput('strength', fields.strength[0], 0.1)}

  ${selectInput('slumpClass', 'رده اسلامپ',
    Object.entries(slumpClasses).map(([value, item]) => ({ value, label: item.label })))}

  ${numberInput('slump', fields.slump[0], 1, `min="${range.min}" max="${range.max}"`)}

  ${numberInput('air', fields.air[0], 0.1)}
</div>

<div class="grid">
  ${selectInput('cementClass', 'رده مقاومتی سیمان', [
    { value: '32.5', label: '32.5' },
    { value: '42.5', label: '42.5' },
    { value: '52.5', label: '52.5' }
  ])}
  ${numberInput('sgCement', fields.sgCement[0], 0.01)}
</div>

<div class="grid">
  ${selectInput('admixture', 'نوع افزودنی', [
    { value: 'none', label: 'بدون افزودنی' },
    { value: 'slump', label: 'افزودنی افزایش‌دهنده اسلامپ' },
    { value: 'water_reducer', label: 'افزودنی کاهنده نیاز آب' }
  ])}

  ${numberInput('admixturePct', 'درصد افزودنی نسبت به جرم سیمان (%)', 0.1,
    data.admixture === 'none' ? 'min="0" max="99.9" disabled' : 'min="0" max="99.9"')}

  ${numberInput('sgAdmixture', 'چگالی افزودنی', 0.01,
    data.admixture === 'none' ? 'disabled' : '')}
</div>

<h3>کنترل‌های اختیاری طرح</h3>

${checkboxField('limitMinCementOn', 'اعمال حداقل مقدار سیمان',
  'limitMinCement', 'حداقل سیمان (kg/m³)', 1, minDisabled)}

${checkboxField('limitMaxCementOn', 'اعمال حداکثر مقدار سیمان',
  'limitMaxCement', 'حداکثر سیمان (kg/m³)', 1, maxDisabled)}

${checkboxField('limitWcOn', 'اعمال حداکثر نسبت آب به سیمان',
  'limitWc', 'حداکثر نسبت آب به سیمان', 0.001)}

`;
}

/* =========================================
مقاومت هدف
========================================= */

function getClosestDeviationRow(fc) {
const keys = Object.keys(standardDeviationTable).map(Number);
if (standardDeviationTable[fc]) return standardDeviationTable[fc];
let nearest = keys[0];
let minDiff = Math.abs(fc - nearest);
for (const k of keys) {
const diff = Math.abs(fc - k);
if (diff < minDiff) { minDiff = diff; nearest = k; }
}
return standardDeviationTable[nearest];
}

function targetCalculations() {
let fc = num('strength');
if (!Number.isFinite(fc) || fc <= 0) fc = 30;

const row = getClosestDeviationRow(fc);
if (!row) return null;

let S = row[data.workshopRank];
if (!Number.isFinite(S)) S = row['A'];
if (!Number.isFinite(S)) S = 4.0;

const fcm1 = fc + 1.34 * S;
const fcm2 = 0.9 * fc + 2.33 * S;
return { fc, S, fcm1, fcm2, target: Math.max(fcm1, fcm2) };
}

function getTargetStrength() {
if (data.targetMethod === 'manual') {
const raw = data.targetStrengthManual;
if (raw === '' || raw == null) return null;
const value = Number(raw);
return Number.isFinite(value) && value > 0 ? value : null;
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
  ${selectInput('targetMethod', 'روش تعیین مقاومت هدف', [
    { value: 'manual', label: 'ورود دستی' },
    { value: 'auto', label: 'محاسبه خودکار' }
  ])}

  ${selectInput('workshopRank', 'رتبه کارگاه', [
    { value: 'A', label: 'الف' },
    { value: 'B', label: 'ب' },
    { value: 'C', label: 'ج' }
  ])}
</div>

<p>مقاومت مشخصه: <strong>${Number.isFinite(fc) ? fc.toFixed(2) : '—'} MPa</strong></p>

${result
  ? `<p>انحراف معیار S: <strong>${result.S.toFixed(2)} MPa</strong></p>`
  : `<p class="hint">برای این مقاومت، مقدار انحراف معیار در جدول فعلی موجود نیست.</p>`}

${data.targetMethod === 'manual'
  ? numberInput('targetStrengthManual', 'مقاومت هدف طرح (MPa)', 0.1, 'min="0"')
  : result
    ? `
      <p>رابطه اول: fcm1 = fc + 1.34 × S</p>
      <p>${fc.toFixed(2)} + 1.34 × ${result.S.toFixed(2)} = ${result.fcm1.toFixed(2)} MPa</p>

      <p>رابطه دوم: fcm2 = 0.9 × fc + 2.33 × S</p>
      <p>0.9 × ${fc.toFixed(2)} + 2.33 × ${result.S.toFixed(2)} = ${result.fcm2.toFixed(2)} MPa</p>

      <p>مقاومت هدف انتخابی: <strong>${result.target.toFixed(2)} MPa</strong></p>
    `
    : `<p class="hint">محاسبه خودکار در دسترس نیست.</p>`}

`;
}

/* =========================================
صفحه دوم ـ سنگدانه‌ها
========================================= */

function renderAggregateTable() {
const count = data.aggregateCount;
const headers = Array.from({ length: count }, (_, i) => `<th>سنگدانه ${i + 1}</th>`).join('');

const nameRow = `<tr><th>نام سنگدانه</th>${Array.from({ length: count }, (_, i) =>
`<td>
<input class="table-input" type="text" enterkeyhint="next"
data-agg="${i}" data-agg-field="name"
value="${escapeHtml(data.aggregates[i].name)}">
</td>`
).join('')}</tr>`;

const sgRow = `<tr><th>چگالی نسبی سنگدانه</th>${Array.from({ length: count }, (_, i) =>
`<td>
<input class="table-input" type="text" inputmode="decimal"
enterkeyhint="next" min="0"
data-agg="${i}" data-agg-field="sg"
value="${escapeHtml(data.aggregates[i].sg ?? '')}">
</td>`
).join('')}</tr>`;

const waterAbsRow = `<tr><th>درصد جذب آب سنگدانه (%)</th>${Array.from({ length: count }, (_, i) =>
`<td>
<input class="table-input" type="text" inputmode="decimal"
enterkeyhint="next" min="0"
data-agg="${i}" data-agg-field="waterAbs"
value="${escapeHtml(data.aggregates[i].waterAbs ?? '')}">
</td>`
).join('')}</tr>`;

const fractureRow = `<tr><th>درصد شکستگی (%)</th>${Array.from({ length: count }, (_, i) =>
`<td>
<input class="table-input" type="text" inputmode="decimal"
enterkeyhint="next" min="0" max="100"
data-agg="${i}" data-agg-field="fracture"
value="${data.aggregates[i].fracture}">
</td>`
).join('')}</tr>`;

const sieveRows = sieves.map((sieve, j) => {
if (sieve.mm === 6.35) return '';
return `<tr><th>درصد عبوری از الک ${sieve.label}</th>${Array.from({ length: count }, (_, i) =>
`<td>
<input class="table-input" type="text" inputmode="decimal"
enterkeyhint="next" min="0" max="100"
data-agg="${i}" data-sieve="${j}"
value="${data.aggregates[i].passing[j] ?? ''}">
</td>`
).join('')}</tr>`;
}).join('');

return `
<h2>مشخصات سنگدانه‌ها</h2>

<div class="grid">
  ${selectInput('aggregateCount', 'تعداد انواع سنگدانه', [
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' }
  ])}

  ${selectInput('msa', 'حداکثر اندازه اسمی سنگدانه NMSA', [
    { value: 9.5, label: '9.5' },
    { value: 12.5, label: '12.5' },
    { value: 19, label: '19' },
    { value: 25, label: '25' }
  ])}
</div>

<div class="table-scroll">
  <table class="aggregate-table">
    <thead><tr><th style="width: 140px;">مشخصات</th>${headers}</tr></thead>
    <tbody>${nameRow}${sgRow}${waterAbsRow}${fractureRow}${sieveRows}</tbody>
  </table>
</div>

${renderTargetStrength()}

`;
}

/* =========================================
سهم‌بندی
========================================= */

function getSharesInfo() {
const count = data.aggregateCount;
const shares = data.aggregateShares.slice(0, count);

const entered = shares.every(v =>
v !== '' && v != null && Number.isFinite(Number(v)) &&
Number(v) >= 0 && Number(v) <= 100
);

const total = entered
? shares.reduce((sum, value) => sum + Number(value), 0)
: null;

return {
count, shares, entered, total,
valid: entered && Math.abs(total - 100) < 0.0001
};
}

function combinedGrading() {
const info = getSharesInfo();
if (!info.valid) return null;

const aggregates = data.aggregates.slice(0, info.count);
const allEntered = aggregates.every(a =>
aggregateSieves.every(({ j }) => {
const v = a.passing[j];
return v !== '' && v != null && Number.isFinite(Number(v)) &&
Number(v) >= 0 && Number(v) <= 100;
})
);
if (!allEntered) return null;

return aggregateSieves.map(({ sieve, j }) => ({
mm: sieve.mm,
value: aggregates.reduce(
(sum, a, i) => sum + Number(a.passing[j]) * Number(info.shares[i]) / 100, 0
)
}));
}

function finenessModulus(points) {
if (!points) return null;
const fmSieves = [37.5, 19, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15];
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
if (!Array.isArray(values) || values.length !== sieves.length) continue;

const points = sieves
  .map((sieve, i) => ({ mm: sieve.mm, value: values[i] }))
  .filter(p => p.mm <= msa + 0.001);
if (!points.length) continue;

if (!points.every(p =>
  typeof p.value === 'number' && Number.isFinite(p.value) &&
  p.value >= 0 && p.value <= 100
)) continue;

let monotonic = true;
for (let i = 1; i < points.length; i++) {
  if (points[i].value > points[i - 1].value + 0.0001) { monotonic = false; break; }
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
const left = 65, right = 25, top = 25, bottom = 75;
const plotWidth = width - left - right;
const plotHeight = height - top - bottom;
const minLog = Math.log10(0.075);
const maxLog = Math.log10(37.5);

const x = mm => left + (Math.log10(mm) - minLog) / (maxLog - minLog) * plotWidth;
const y = value => top + (100 - value) / 100 * plotHeight;

function drawSeries(points, color, dash = '', thickness = 2.5, sieveList = sieves) {
let valid = points
.filter(p => p.value !== '' && p.value != null &&
Number.isFinite(Number(p.value)) &&
Number(p.value) >= 0 && Number(p.value) <= 100)
.sort((a, b) => a.mm - b.mm);
if (!valid.length) return '';

const first100Index = valid.findIndex(p => Number(p.value) === 100);
let last0Index = -1;
valid.forEach((p, idx) => { if (Number(p.value) === 0) last0Index = idx; });

valid = valid.filter((p, idx) => {
  const v = Number(p.value);
  if (v === 100 && idx !== first100Index) return false;
  if (v === 0 && idx !== last0Index) return false;
  return true;
});

const segments = [];
let current = [];
for (const p of valid) {
  const originalIndex = sieveList.findIndex(s => Math.abs(s.mm - p.mm) < 0.0001);
  if (current.length && originalIndex !== -1 &&
      current[current.length - 1].index !== -1 &&
      Math.abs(originalIndex - current[current.length - 1].index) !== 1) {
    segments.push(current); current = [];
  }
  current.push({ ...p, index: originalIndex });
}
if (current.length) segments.push(current);

const lines = segments.map(segment => {
  if (segment.length < 2) return '';
  const coords = segment.map(p => `${x(p.mm)},${y(Number(p.value))}`).join(' ');
  return `<polyline points="${coords}" fill="none" stroke="${color}"
          stroke-width="${thickness}" stroke-dasharray="${dash}"
          stroke-linejoin="round" />`;
}).join('');

const circles = valid.map(p =>
  `<circle cx="${x(p.mm)}" cy="${y(Number(p.value))}" r="3" fill="${color}" />`
).join('');

return lines + circles;

}

const aggregateColors = ['#2563eb', '#ea580c', '#16a34a', '#9333ea'];
const referenceColor = '#0ea5e9';

const aggregateLines = data.aggregates
.slice(0, data.aggregateCount)
.map((aggregate, i) => {
if (!data.showAggregateCurves[i]) return '';
const points = sieves.map((sieve, j) => ({ mm: sieve.mm, value: aggregate.passing[j] }));
return drawSeries(points, aggregateColors[i], '6 4', 2.2, chartSieves);
}).join('');

const referenceSeries = getReferenceSeries();
const referenceLines = data.showReferenceCurves
? referenceSeries.map(series => drawSeries(series.points, referenceColor, '', 2.8)).join('')
: '';

const mixLine = data.showMixCurve && combined
? drawSeries(combined, '#000000', '', 3.5, chartSieves)
: '';

const horizontalGrid = [0, 20, 40, 60, 80, 100].map(value => `<line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}" stroke="#d7e0e8" /><text x="${left - 25}" y="${y(value) + 4}" text-anchor="end" font-size="12" fill="#334155">${value}</text>`).join('');

const xTickValues = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 6.35, 9.5, 12.5, 19, 25, 37.5];
const xTicks = xTickValues.map(mm => `<line x1="${x(mm)}" y1="${top}" x2="${x(mm)}" y2="${height - bottom}" stroke="#e2e8f0" /><text x="${x(mm)}" y="${height - bottom + 20}" text-anchor="middle" font-size="11" fill="#334155">${mm}</text>`).join('');

return `<h3>منحنی‌های دانه‌بندی</h3><div class="table-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="نمودار دانه‌بندی"
style="width:100%;max-width:900px;background:white">
${horizontalGrid}
${xTicks}
<line x1="${left}" y1="${top}" x2="${left}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
<line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="#475569" stroke-width="1.5" />
${referenceLines}
${aggregateLines}
${mixLine}
<text x="${width / 2}" y="${height - 16}" text-anchor="middle" font-size="13" fill="#334155">اندازه الک (mm) ـ مقیاس لگاریتمی</text>
<text x="17" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155"
transform="rotate(-90 17 ${height / 2})">درصد عبوری</text>
</svg></div>`;
}

/* =========================================
صفحه سوم
========================================= */

function renderShares() {
const count = data.aggregateCount;

const shareInputs = Array.from({ length: count }, (_, i) => {
const name = data.aggregates[i].name || `سنگدانه ${i + 1}`;
return `<label class="field"><span>سهم ${escapeHtml(name)} (%)</span><input type="text" inputmode="decimal" enterkeyhint="next" min="0" max="100" data-share="${i}" value="${data.aggregateShares[i] ?? ''}"></label>`;
}).join('');

const combined = combinedGrading();
const fm = finenessModulus(combined);

const curveCheckboxes = Array.from({ length: count }, (_, i) => {
const name = data.aggregates[i].name || `سنگدانه ${i + 1}`;
return `<label class="checkline" style="margin:8px 0"><input type="checkbox" data-curve-aggregate="${i}" ${data.showAggregateCurves[i] ? 'checked' : ''}><span>نمایش منحنی ${escapeHtml(name)}</span></label>`;
}).join('');

return `
<h2>سهم‌بندی سنگدانه‌ها</h2>

<div class="grid">${shareInputs}</div>

<h3>انتخاب منحنی‌های قابل نمایش</h3>
<div class="limit-box">
  ${curveCheckboxes}
  <label class="checkline" style="margin:8px 0">
    <input type="checkbox" data-curve-mix ${data.showMixCurve ? 'checked' : ''}>
    <span>نمایش منحنی مخلوط ترکیبی</span>
  </label>
  <label class="checkline" style="margin:8px 0">
    <input type="checkbox" data-curve-reference ${data.showReferenceCurves ? 'checked' : ''}>
    <span>نمایش منحنی‌های مرجع A، B و C</span>
  </label>
</div>

<p>مدول نرمی مخلوط: <strong>${fm === null ? 'تعیین نشده' : fm.toFixed(2)}</strong></p>

${renderGradingChart(combined)}

`;
}

/* =========================================
نمودار نسبت آب به سیمان
========================================= */

function getActiveCurve() {
const cement = String(data.cementClass || '42.5');
let isCrushed = false;
if (data.aggregates && data.aggregates.length > 0) {
isCrushed = data.aggregates.slice(0, data.aggregateCount)
.some(a => Number(a.fracture) > 0);
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
if (!Number.isFinite(wc) || wc <= 0) return null;
let y;
if (curve.d !== undefined) {
y = curve.a * Math.pow(wc, 3) + curve.b * Math.pow(wc, 2) + curve.c * wc + curve.d;
} else {
y = curve.a * Math.pow(wc, 2) + curve.b * wc + curve.c;
}
if (!Number.isFinite(y)) return null;
return Math.max(10, Math.min(70, y));
}

function calculateWc(strength, curve) {
if (!curve) return null;
if (!Number.isFinite(strength) || strength <= 0) return null;

let low = 0.3;
let high = 0.75;

const evalCurve = x => (curve.d !== undefined)
? curve.a * Math.pow(x, 3) + curve.b * Math.pow(x, 2) + curve.c * x + curve.d
: curve.a * Math.pow(x, 2) + curve.b * x + curve.c;

const fLow = evalCurve(low);
const fHigh = evalCurve(high);
if (strength > fLow || strength < fHigh) return null;

for (let i = 0; i < 100; i++) {
const mid = (low + high) / 2;
const fMid = evalCurve(mid);
if (fMid > strength) low = mid;
else high = mid;
}
return (low + high) / 2;
}

function renderWCChart() {
const width = 680, height = 400;
const left = 60, right = 60, top = 20, bottom = 60;
const plotWidth = width - left - right;
const plotHeight = height - top - bottom;

const xMin = 0.3, xMax = 0.75, yMin = 10, yMax = 70;
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
grid += `<text x="${left - 25}" y="${py + 4}" text-anchor="end" font-size="12" fill="#334155">${val}</text>`;
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
const val = (c.d !== undefined)
? (c.a * Math.pow(wc, 3) + c.b * Math.pow(wc, 2) + c.c * wc + c.d)
: (c.a * Math.pow(wc, 2) + c.b * wc + c.c);
path += `${path === '' ? 'M' : 'L'} ${x(wc)} ${y(val)} `;
}
curveLines += `<path d="${path}" fill="none" stroke="${c.color}" stroke-width="${c.width}" stroke-dasharray="${c.dash}" />`;

const labelWc = 0.35;
const labelVal = (c.d !== undefined)
  ? (c.a * Math.pow(labelWc, 3) + c.b * Math.pow(labelWc, 2) + c.c * labelWc + c.d)
  : (c.a * Math.pow(labelWc, 2) + c.b * labelWc + c.c);
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
intersectionText = `<div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">نسبت آب به سیمان متناظر با مقاومت هدف: <strong>${targetX.toFixed(3)}</strong></div>`;
} else if (targetY !== null) {
intersectionText = `<div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">مقاومت هدف ${targetY.toFixed(1)} MPa خارج از محدوده نمودار است.</div>`;
} else {
intersectionText = `<div class="hint" style="margin-top: 15px; font-size: 1.1em; text-align: center; color: #b91c1c;">لطفاً مقاومت هدف را تعیین کنید.</div>`;
}

// نشانگر سبز موقعیت جاری کاربر (بدون تغییر نشانگر قرمز)
let userMarker = '';
const currentWc = num('wc');
const currentStrength = calculateStrength(currentWc, activeCurve);
if (currentStrength !== null && Number.isFinite(currentWc) && currentWc >= xMin && currentWc <= xMax) {
const ux = x(currentWc);
const uy = y(currentStrength);
userMarker = `<circle cx="${ux}" cy="${uy}" r="5" fill="#059669" stroke="white" stroke-width="2" />`;
}

return `<h3>نمودار نسبت آب به سیمان و مقاومت فشاری</h3><div class="table-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="نمودار نسبت آب به سیمان"
style="width:100%;max-width:900px;background:white">
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
${userMarker}
</g>
<text x="${left - 45}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155"
transform="rotate(-90 ${left - 45} ${height / 2})">مقاومت فشاری متوسط (N/mm²)</text>
<text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#334155">نسبت آب به سیمان</text>
</svg></div>
${intersectionText}`;
}

/* =========================================
صفحه نسبت آب به سیمان
========================================= */

function renderStep1() {
const wcDisplay = Number.isFinite(Number(data.wc)) ? Number(data.wc).toFixed(3) : '';
const step1Valid = data.step1Strength !== null
&& data.step1Strength !== ''
&& Number.isFinite(Number(data.step1Strength))
&& Number(data.step1Strength) > 0;
const target = getTargetStrength();
const strengthDisplay = step1Valid
? Number(data.step1Strength).toFixed(1)
: (target !== null ? target.toFixed(1) : '');

return `
<h2>تعیین نسبت آب به سیمان</h2>

<div class="grid" style="margin-bottom: 15px;">
  <label class="field">
    <span>نسبت آب به سیمان انتخابی</span>
    <input type="text" inputmode="decimal" enterkeyhint="next"
      data-key="wc" value="${wcDisplay}">
  </label>
  <label class="field">
    <span>مقاومت فشاری متوسط متناظر (MPa)</span>
    <input type="text" inputmode="decimal" enterkeyhint="next"
      data-key="step1Strength" value="${strengthDisplay}">
  </label>
</div>

${renderWCChart()}

`;
}

/* =========================================
نمودار آب آزاد
========================================= */

function getInterpolatedWaterCurve(isCrushed, slump) {
const eqs = isCrushed ? {
S1: { a: 3.2682, b: -56.602, c: 355.02, mid: 25 },
S2: { a: 3.922, b: -68.531, c: 433.0, mid: 70 },
S3: { a: 4.4766, b: -76.242, c: 473.31, mid: 125 },
S4: { a: 5.0816, b: -84.654, c: 517.28, mid: 185 }
} : {
S1: { a: 2.4397, b: -45.811, c: 305.64, mid: 25 },
S2: { a: 2.9217, b: -55.384, c: 372.47, mid: 70 },
S3: { a: 3.3593, b: -62.257, c: 408.7, mid: 125 },
S4: { a: 3.8367, b: -69.7547, c: 448.22, mid: 185 }
};

if (slump <= eqs.S1.mid) return eqs.S1;
if (slump >= eqs.S4.mid) return eqs.S4;

if (slump < eqs.S2.mid) {
const t = (slump - eqs.S1.mid) / (eqs.S2.mid - eqs.S1.mid);
return {
a: eqs.S1.a * (1 - t) + eqs.S2.a * t,
b: eqs.S1.b * (1 - t) + eqs.S2.b * t,
c: eqs.S1.c * (1 - t) + eqs.S2.c * t
};
} else if (slump < eqs.S3.mid) {
const t = (slump - eqs.S2.mid) / (eqs.S3.mid - eqs.S2.mid);
return {
a: eqs.S2.a * (1 - t) + eqs.S3.a * t,
b: eqs.S2.b * (1 - t) + eqs.S3.b * t,
c: eqs.S2.c * (1 - t) + eqs.S3.c * t
};
} else {
const t = (slump - eqs.S3.mid) / (eqs.S4.mid - eqs.S3.mid);
return {
a: eqs.S3.a * (1 - t) + eqs.S4.a * t,
b: eqs.S3.b * (1 - t) + eqs.S4.b * t,
c: eqs.S3.c * (1 - t) + eqs.S4.c * t
};
}
}

function computeWaterFromCurve() {
const combined = combinedGrading();
const fm = finenessModulus(combined) || 4.5;
const activeAggs = data.aggregates.slice(0, data.aggregateCount);
const avgFracture = activeAggs.length > 0
? activeAggs.reduce((sum, a) => sum + Number(a.fracture || 0), 0) / activeAggs.length
: 0;
const isCrushed = avgFracture > 0;
const curve = getInterpolatedWaterCurve(isCrushed, num('slump'));
const water = curve.a * fm * fm + curve.b * fm + curve.c;
return { fm, isCrushed, avgFracture, water };
}

function syncWater() {
const { water } = computeWaterFromCurve();
if (Number.isFinite(water) && water > 0) {
data.water = Math.round(water * 10) / 10;
}
}

function renderWaterChart(fm, waterFromCurve, isCrushed, slump) {
const width = 680, height = 400;
const left = 60, right = 60, top = 20, bottom = 60;
const plotWidth = width - left - right;
const plotHeight = height - top - bottom;
const xMin = 3.0, xMax = 8.5, yMin = 100, yMax = 320;

const x = val => left + (val - xMin) / (xMax - xMin) * plotWidth;
const y = val => top + (yMax - val) / (yMax - yMin) * plotHeight;

let baseCurves;
if (isCrushed) {
baseCurves = [
{ a: 5.0816, b: -84.654, c: 517.28, name: 'S4', color: '#b91c1c' },
{ a: 4.4766, b: -76.242, c: 473.31, name: 'S3', color: '#991b1b' },
{ a: 3.922, b: -68.531, c: 433.0, name: 'S2', color: '#ec4899' },
{ a: 3.2682, b: -56.602, c: 355.02, name: 'S1', color: '#2563eb' }
];
} else {
baseCurves = [
{ a: 3.8367, b: -69.7547, c: 448.22, name: 'S4', color: '#b91c1c' },
{ a: 3.3593, b: -62.257, c: 408.7, name: 'S3', color: '#991b1b' },
{ a: 2.9217, b: -55.384, c: 372.47, name: 'S2', color: '#ec4899' },
{ a: 2.4397, b: -45.811, c: 305.64, name: 'S1', color: '#2563eb' }
];
}

const activeEq = getInterpolatedWaterCurve(isCrushed, slump);

let grid = '';
for (let i = 100; i <= 320; i += 20) {
const py = y(i);
grid += `<line x1="${left}" y1="${py}" x2="${width - right}" y2="${py}" stroke="#d7e0e8" />`;
grid += `<text x="${left - 25}" y="${py + 4}" text-anchor="end" font-size="12" fill="#334155">${i}</text>`;
}
for (let i = 3.0; i <= 8.5; i += 0.5) {
const px = x(i);
grid += `<line x1="${px}" y1="${top}" x2="${px}" y2="${height - bottom}" stroke="#d7e0e8" />`;
grid += `<text x="${px}" y="${height - bottom + 20}" text-anchor="middle" font-size="12" fill="#334155">${i.toFixed(2)}</text>`;
}

const labelSuffix = isCrushed ? '-C' : '-R';
let curveLines = '';

baseCurves.forEach(c => {
let path = '';
for (let xv = 3.35; xv <= 8.01; xv += 0.1) {
const yv = c.a * xv * xv + c.b * xv + c.c;
if (yv < 105) break;
path += `${path === '' ? 'M' : 'L'} ${x(xv)} ${y(yv)} `;
}
curveLines += `<path d="${path}" fill="none" stroke="${c.color}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.5" />`;
const labelY = c.a * 3.35 * 3.35 + c.b * 3.35 + c.c;
if (labelY >= yMin && labelY <= yMax) {
curveLines += `<text x="${x(3.35)}" y="${y(labelY) - 5}" font-size="12" fill="${c.color}" opacity="0.6" text-anchor="start">${c.name}${labelSuffix}</text>`;
}
});

let interpPath = '';
for (let xv = 3.35; xv <= 8.01; xv += 0.1) {
const yv = activeEq.a * xv * xv + activeEq.b * xv + activeEq.c;
if (yv < 105) break;
interpPath += `${interpPath === '' ? 'M' : 'L'} ${x(xv)} ${y(yv)} `;
}
curveLines += `<path d="${interpPath}" fill="none" stroke="#059669" stroke-width="4" />`;

const rightLabelY = activeEq.a * 7.8 * 7.8 + activeEq.b * 7.8 + activeEq.c;
if (rightLabelY >= yMin && rightLabelY <= yMax) {
curveLines += `<text x="${x(7.8)}" y="${y(rightLabelY) - 10}" font-size="14" fill="#059669" font-weight="bold" text-anchor="end">S = ${slump}</text>`;
}

let intersectionLines = '';
if (Number.isFinite(fm) && Number.isFinite(waterFromCurve) &&
fm >= xMin && fm <= xMax && waterFromCurve >= yMin && waterFromCurve <= yMax) {
const px = x(fm);
const py = y(waterFromCurve);
intersectionLines += `<line x1="${left}" y1="${py}" x2="${px}" y2="${py}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
intersectionLines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${height - bottom}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,4" />`;
intersectionLines += `<circle cx="${px}" cy="${py}" r="5" fill="#dc2626" />`;
}

return `<h3>نمودار تعیین آب آزاد بر اساس مدول نرمی</h3><div class="table-scroll"><svg viewBox="0 0 ${width} ${height}" style="width:100%;max-width:900px;background:white">
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
<text x="${left - 45}" y="${height / 2}" text-anchor="middle" font-size="13" fill="#334155"
transform="rotate(-90 ${left - 45} ${height / 2})">آب آزاد (kg/m³)</text>
<text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="13" fill="#334155">مدول نرمی (F.M.)</text>
</svg></div>`;
}

function renderWater() {
const { fm, isCrushed, avgFracture, water } = computeWaterFromCurve();

const reductionPct = Number(data.waterReductionPct) || 0;
const reduction = (data.admixture !== 'none') ? (water * reductionPct / 100) : 0;
const calculatedWater = water - reduction;

const fmt = v => Number.isFinite(v) ? v.toFixed(1) : 'نامشخص';

return `
<h2>تعیین آب آزاد</h2>

${renderWaterChart(fm, water, isCrushed, num('slump'))}

<h3 style="margin-top: 20px;">پارامترهای محاسباتی</h3>
<table>
  <tbody>
    <tr><td>1. مدول نرمی مخلوط سنگدانه</td><td>${Number.isFinite(fm) ? fm.toFixed(2) : '—'}</td></tr>
    <tr><td>2. اسلامپ مشخصه</td><td>${data.slump} mm</td></tr>
    <tr><td>3. درصد شکستگی متوسط معادل برای مخلوط سنگدانه</td><td>${Number.isFinite(avgFracture) ? avgFracture.toFixed(1) : '—'}٪ (${isCrushed ? 'تیزگوشه' : 'گردگوشه'})</td></tr>
    <tr><td>4. میزان آب آزاد مورد نیاز حاصل از منحنی (kg/m³)</td><td>${fmt(water)}</td></tr>
    <tr>
      <td>5. درصد کاهش مقدار آب آزاد ناشی از مصرف روان‌کننده (%)</td>
      <td>
        <input type="text" inputmode="decimal" enterkeyhint="next"
          data-key="waterReductionPct"
          value="${escapeHtml(data.waterReductionPct ?? '')}"
          ${data.admixture === 'none' ? 'disabled' : ''}
          style="width: 80px; padding: 4px;">
      </td>
    </tr>
    <tr><td>6. مقدار کاهش آب آزاد (kg/m³)</td><td>${fmt(reduction)}</td></tr>
    <tr><td>7. میزان آب آزاد مورد نیاز محاسبه شده (kg/m³)</td><td>${fmt(calculatedWater)}</td></tr>
  </tbody>
</table>

`;
}

/* =========================================
صفحه مقدار سیمان
========================================= */

function renderCement() {
const result = new Step4().run();
const wf = effectiveWater();
const wc = num('wc');
const cement = result.cement;

const softMax = getSoftMaxCement();
const isLimited = cement > softMax;

const minActive = data.limitMinCementOn && Number(data.limitMinCement) > 0;
const maxActive = data.limitMaxCementOn && Number(data.limitMaxCement) > 0;

let extraC = 0, extraW = 0, wfNew = wf, cNew = cement;
const factor = Number(data.correctionFactor) || 1.5;

if (isLimited) {
extraC = cement - softMax;
extraW = extraC * (factor / 10);
wfNew = wf + extraW;
cNew = wfNew / wc;
}

const formulaBox = `<div class="compact-formula" style="display:flex; align-items:center; gap:10px; padding:10px; background:#f8fafc; border-radius:6px; margin-bottom:15px; border:1px solid #e2e8f0; direction:ltr; font-size:13px;">
<span style="font-weight:bold;">C =</span>
<div style="display:flex; flex-direction:column; align-items:center; font-size:11px;">
<span style="border-bottom:1px solid #333; padding:0 5px;">Wf</span>
<span style="padding:0 5px;">W/C</span>
</div>
<span style="font-weight:bold;">=</span>
<div style="display:flex; flex-direction:column; align-items:center; font-size:11px;">
<span style="border-bottom:1px solid #333; padding:0 5px;">${wf.toFixed(2)}</span>
<span style="padding:0 5px;">${wc.toFixed(3)}</span>
</div>
<span style="font-weight:bold;">=</span>
<span style="background:#e2e8f0; padding:4px 10px; border-radius:4px; font-weight:bold;">${cement.toFixed(2)}</span>
<span>kg/m³</span>
</div>`;

const belowMin = minActive && cement < Number(data.limitMinCement);
const aboveMax = maxActive && cement > Number(data.limitMaxCement);
const needsChoice = isLimited || belowMin || aboveMax;

let contentHtml = '';

if (!needsChoice) {
contentHtml = `<div style="background:#ecfdf5; border:1px solid #10b981; color:#065f46; padding:12px; border-radius:6px; text-align:center; font-size:13px;">
<strong>مقدار سیمان در محدوده مجاز است.</strong>
<div style="font-size:11px; margin-top:5px;">(${cement.toFixed(2)} kg/m³)</div>
</div>`;
} else {
let reasonHtml = '';
if (isLimited) {
reasonHtml = `<strong>هشدار:</strong> مقدار سیمان (${cement.toFixed(2)}) بیش از حد مجاز پیش‌فرض (${softMax}) است.`;
} else if (belowMin) {
reasonHtml = `<strong>هشدار:</strong> مقدار سیمان (${cement.toFixed(2)}) کمتر از حداقل انتخاب‌شده (${Number(data.limitMinCement)}) است.`;
} else if (aboveMax) {
reasonHtml = `<strong>هشدار:</strong> مقدار سیمان (${cement.toFixed(2)}) بیشتر از حداکثر انتخاب‌شده (${Number(data.limitMaxCement)}) است.`;
}

contentHtml = `
<div style="background:#fffbeb; border:1px solid #f59e0b; color:#92400e; padding:12px; border-radius:6px; font-size:13px;">
${reasonHtml}
${isLimited ? `
<div style="background:white; padding:10px; border-radius:6px; margin-top:10px; border:1px solid #fcd34d;">
<div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:12px;">
<span>ضریب اصلاح آب (kg/10kg):</span>
<input type="text" inputmode="decimal" data-key="correctionFactor" value="${factor}"
style="width:60px; padding:2px 4px; text-align:center; border:1px solid #cbd5e1; border-radius:4px;">
</div>
<div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:11px; margin-bottom:10px;">
<div>سیمان اضافی: <strong>${extraC.toFixed(2)}</strong> kg</div>
<div>آب اضافی: <strong>${extraW.toFixed(2)}</strong> kg</div>
</div>
<div class="compact-formula" style="display:flex; align-items:center; gap:10px; padding:8px; background:#f8fafc; border-radius:6px; border:1px solid #e2e8f0; direction:ltr; font-size:12px;">
<span style="font-weight:bold;">C_new =</span>
<div style="display:flex; flex-direction:column; align-items:center; font-size:11px;">
<span style="border-bottom:1px solid #333; padding:0 5px;">${wfNew.toFixed(2)}</span>
<span style="padding:0 5px;">${wc.toFixed(3)}</span>
</div>
<span style="font-weight:bold;">=</span>
<span style="background:#e2e8f0; padding:4px 8px; border-radius:4px; font-weight:bold;">${cNew.toFixed(2)}</span>
</div>
</div>` : ''}

<div style="display: flex; justify-content: center; width: 100%; margin-top: 15px;">
      <select id="cement-action" style="width: 340px; height: 45px; padding: 10px; border-radius: 8px; border: 1px solid #fcd34d; font-family: inherit; font-size: 13px; background: white; color: #92400e; cursor: pointer; outline: none; text-align: center;">
        <option value="" disabled ${data.cementAction === '' ? 'selected' : ''}>--- انتخاب کنید ---</option>
        ${isLimited ? `<option value="proceed" ${data.cementAction === 'proceed' ? 'selected' : ''}>1. نادیده گرفتن مقدار سیمان و ادامه</option>` : ''}
        ${isLimited ? `<option value="grading" ${data.cementAction === 'grading' ? 'selected' : ''}>2. اصلاح بافت دانه‌بندی</option>` : ''}
        ${isLimited ? `<option value="wc" ${data.cementAction === 'wc' ? 'selected' : ''}>3. اصلاح نسبت آب به سیمان</option>` : ''}
        ${minActive ? `<option value="min_cement" ${data.cementAction === 'min_cement' ? 'selected' : ''}>چون حداقل سیمان انتخاب شده، با همین مقدار ادامه بده</option>` : ''}
        ${maxActive ? `<option value="max_cement" ${data.cementAction === 'max_cement' ? 'selected' : ''}>چون حداکثر سیمان انتخاب شده، با همین مقدار ادامه بده</option>` : ''}
      </select>
    </div>
  </div>
`;
}

return `<h2>تعیین مقدار سیمان</h2>${formulaBox}${contentHtml}`;
}

/* =========================================
گزارش نهایی
========================================= */

function renderReport() {
let result = new Step5().run();

const softMax = getSoftMaxCement();
if (result.cement > softMax && data.cementAction === 'proceed') {
const factor = Number(data.correctionFactor) || 1.5;
const extraC = result.cement - softMax;
const extraW = extraC * (factor / 10);
const newWater = result.water + extraW;
const newCement = newWater / num('wc');
result = new Step5().run({ water: newWater, cement: newCement });
}

const c = result.cement;
const w = result.water;
const air = data.air / 100;

const totalDry = result.dryGravel + result.drySand;
const totalWater = w + (result.ssdSand - result.drySand) + (result.ssdGravel - result.dryGravel);
const finalDensity = c + totalWater + totalDry;

return `
<div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1;">
<h2 style="text-align: center; color: #1e293b; margin-bottom: 20px; font-size: 18px;">گزارش نهایی طرح مخلوط بتن</h2>

<div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
    <h3 style="font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">محاسبه حجم سنگدانه‌ها</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center; font-size: 13px; direction: ltr; justify-content: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #64748b;">Air:</span>
        <strong>${(air * 100).toFixed(2)}%</strong>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #64748b;">MSA:</span>
        <strong>${data.msa} mm</strong>
      </div>
      <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: bold;">V_{Assd} = 1 - (</span>
        <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
          <span style="border-bottom: 1px solid #333; padding: 0 5px;">${c.toFixed(2)}</span>
          <span style="padding: 0 5px;">${(data.sgCement * 1000).toFixed(0)}</span>
        </div>
        <span>+</span>
        <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
          <span style="border-bottom: 1px solid #333; padding: 0 5px;">${w.toFixed(2)}</span>
          <span style="padding: 0 5px;">1000</span>
        </div>
        <span>+</span>
        <span>${air.toFixed(3)}</span>
        ${data.admixture !== 'none' ? `
        <span>+</span>
        <div style="display: flex; flex-direction: column; align-items: center; font-size: 11px;">
          <span style="border-bottom: 1px solid #333; padding: 0 5px;">${result.admixtureMass.toFixed(2)}</span>
          <span style="padding: 0 5px;">${(data.sgAdmixture * 1000).toFixed(0)}</span>
        </div>` : ''}
        <span style="font-weight: bold;">) =</span>
        <strong style="color: #2563eb;">${result.aggregateVolume.toFixed(3)} m³</strong>
      </div>
    </div>
  </div>

  <div style="background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
    <h3 style="font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">مقدار سنگدانه‌ها در یک متر مکعب بتن</h3>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 12px;">
        <thead>
          <tr style="background: #f1f5f9; color: #334155;">
            <th style="padding: 8px; border: 1px solid #e2e8f0;">مشخصات</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; background: #e0f2fe;">سنگدانه 1 (ماسه)</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0;">سنگدانه 2 (شن)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #475569;">نوع سنگدانه</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">ماسه</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">شن</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">چگالی ذرات SSD (g/cm³)</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${data.sgSand.toFixed(2)}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${data.sgGravel.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">درصد جذب آب (%)</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${data.waterAbsSand}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${data.waterAbsGravel}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">درصد شکستگی</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${data.aggregates[0].fracture || 0}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${data.aggregates[1] ? data.aggregates[1].fracture || 0 : 0}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">سهم در مخلوط (%)</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${(result.sandFrac * 100).toFixed(1)}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${(result.gravelFrac * 100).toFixed(1)}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: bold;">حجم در 1m³ (m³)</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; color: #2563eb; font-weight: bold;">${result.sandVolume.toFixed(3)}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; color: #2563eb; font-weight: bold;">${result.gravelVolume.toFixed(3)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">جرم SSD (kg)</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${result.ssdSand.toFixed(0)}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${result.ssdGravel.toFixed(0)}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0;">جرم خشک (kg)</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${result.drySand.toFixed(0)}</td>
            <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">${result.dryGravel.toFixed(0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
    <h3 style="font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">خلاصه مقادیر نهایی (بر مبنای وزن خشک)</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; justify-content: space-between;">
      <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; flex: 1; min-width: 120px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">جرم آب کل (W_total)</div>
        <strong style="font-size: 16px; color: #0f172a;">${totalWater.toFixed(0)} <span style="font-size: 10px;">kg/m³</span></strong>
      </div>
      <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; flex: 1; min-width: 120px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">جرم کل خشک (Ad)</div>
        <strong style="font-size: 16px; color: #0f172a;">${totalDry.toFixed(0)} <span style="font-size: 10px;">kg/m³</span></strong>
      </div>
      <div style="background: #e0f2fe; padding: 10px; border-radius: 6px; flex: 1; min-width: 120px; text-align: center; border: 1px solid #bae6fd;">
        <div style="font-size: 11px; color: #0369a1; margin-bottom: 4px;">چگالی نهایی بتن (G)</div>
        <strong style="font-size: 16px; color: #0284c7;">${finalDensity.toFixed(0)} <span style="font-size: 10px;">kg/m³</span></strong>
      </div>
    </div>
    <div style="margin-top: 10px; font-size: 11px; color: #64748b; text-align: center; direction: ltr;">
      G = C + W_total + Ad = ${c.toFixed(2)} + ${totalWater.toFixed(2)} + ${totalDry.toFixed(0)} = ${finalDensity.toFixed(0)} kg/m³
    </div>
  </div>
</div>

`;
}

/* =========================================
نمایش و رویدادها
========================================= */

const TEXT_KEYS = new Set([
'slumpClass', 'cementClass', 'admixture',
'targetMethod', 'workshopRank'
]);

function view() {
const tabs = document.getElementById('tabs');
const screen = document.getElementById('screen');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

if (!tabs || !screen || !prev || !next) {
console.error('عناصر اصلی صفحه پیدا نشدند.');
return;
}

document.querySelectorAll('p, div, span').forEach(el => {
if (el.textContent && el.textContent.includes('نسخه محاسبات مقدماتی است')) {
el.remove();
}
});

tabs.innerHTML = titles.map((title, i) => `<button type="button" data-page="${i}" class="${i === page ? 'active' : ''}">${title}</button>`).join('');

let html = '';
try {
switch (page) {
case 0: html = renderHome(); break;
case 1: html = renderAggregateTable(); break;
case 2: html = renderShares(); break;
case 3: html = renderStep1(); break;
case 4: html = renderWater(); break;
case 5: html = renderCement(); break;
case 6: html = renderReport(); break;
default: html = renderHome();
}
} catch (error) {
console.error(error);
html = `<p class="bad">${escapeHtml(error.message)}</p><p>ورودی‌های این بخش را بررسی کنید.</p>`;
}

screen.innerHTML = `<article class="panel">${html}</article>`;

document.querySelectorAll('[data-page]').forEach(button => {
button.onclick = () => {
page = Number(button.dataset.page);
view();
};
});

document.querySelectorAll('[data-key]').forEach(element => {
element.onchange = () => {
const key = element.dataset.key;
const oldState = {
value: data[key],
slump: data.slump,
admixturePct: data.admixturePct,
waterReductionPct: data.waterReductionPct,
wc: data.wc,
step1Strength: data.step1Strength,
targetStrengthManual: data.targetStrengthManual,
targetMethod: data.targetMethod
};

const rawVal = element.value;
let value;
if (rawVal === '') {
  value = '';
} else if (TEXT_KEYS.has(key)) {
  value = rawVal;
} else if (key === 'waterReductionPct') {
  value = rawVal;
} else {
  value = Number(rawVal);
}

data[key] = value;

try {
  if (key === 'aggregateCount') {
    const count = Number(value);
    if (![2, 3, 4].includes(count)) throw Error('تعداد سنگدانه نامعتبر است.');
    data.aggregateCount = count;
  }

  if (key === 'slumpClass') {
    const range = slumpRange();
    if (num('slump') < range.min || num('slump') > range.max) {
      data.slump = range.min;
    }
    syncWater();
  }

  if (key === 'admixture') {
    if (value === 'none') {
      data.waterReductionPct = '';
    } else {
      if (data.admixturePct === '' || data.admixturePct == null) data.admixturePct = 0;
      if (data.sgAdmixture === '' || data.sgAdmixture == null) data.sgAdmixture = 1.1;
    }
  }

  if (key === 'wc') {
    const curve = getActiveCurve();
    const y = calculateStrength(num('wc'), curve);
    if (y !== null) {
      data.step1Strength = y;
    }
    validate();
  } else if (key === 'step1Strength') {
    const curve = getActiveCurve();
    const x = calculateWc(num('step1Strength'), curve);
    if (x !== null) data.wc = x;
    validate();
  } else if (key === 'targetStrengthManual') {
    const curve = getActiveCurve();
    const x = calculateWc(num('targetStrengthManual'), curve);
    if (x !== null) data.wc = x;
    data.targetMethod = 'manual';
    data.step1Strength = null;
    validate();
  } else if (['cementClass', 'admixture', 'admixturePct', 'slump'].includes(key)) {
    const curve = getActiveCurve();
    const target = getTargetStrength();
    if (target !== null) {
      const newWc = calculateWc(target, curve);
      if (newWc !== null) data.wc = newWc;
    }
    syncWater();
  } else if (key === 'waterReductionPct') {
    if (value !== '') {
      const rp = Number(value);
      if (!Number.isFinite(rp) || rp < 0 || rp >= 100) {
        throw Error('درصد کاهش آب باید بین صفر و ۱۰۰ باشد.');
      }
    }
    validate();
  } else if (key === 'targetMethod' || key === 'workshopRank' || key === 'aggregateCount' || key === 'correctionFactor' || key === 'sgAdmixture') {
    // بدون validate
  } else {
    validate();
  }

  save();
  view();
} catch (error) {
  data[key] = oldState.value;
  data.slump = oldState.slump;
  data.admixturePct = oldState.admixturePct;
  data.waterReductionPct = oldState.waterReductionPct;
  data.wc = oldState.wc;
  data.step1Strength = oldState.step1Strength;
  data.targetStrengthManual = oldState.targetStrengthManual;
  data.targetMethod = oldState.targetMethod;
  view();
  alert(error.message);
}
};

element.oninput = (e) => {
  let val = e.target.value;
  if (!val) return;
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const en = ['0','1','2','3','4','5','6','7','8','9'];
  for (let i = 0; i < 10; i++) {
    val = val.replace(new RegExp(fa[i], 'g'), en[i]).replace(new RegExp(ar[i], 'g'), en[i]);
  }
  if (e.target.value !== val) e.target.value = val;
};

});

document.querySelectorAll('[data-check]').forEach(element => {
element.onchange = () => {
const key = element.dataset.check;
const oldValue = data[key];

if (key === 'limitMinCementOn' && element.checked) {
    data.limitMaxCementOn = false;
}
if (key === 'limitMaxCementOn' && element.checked) {
    data.limitMinCementOn = false;
}

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
});

document.querySelectorAll('[data-agg]').forEach(element => {
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
    aggregate.fracture = element.value === '' ? '' : Number(element.value);
  } else if (field === 'sg' || field === 'waterAbs') {
    oldValue = aggregate[field];
    aggregate[field] = element.value === '' ? '' : Number(element.value);
  } else {
    oldValue = aggregate.passing[sieveIndex];
    aggregate.passing[sieveIndex] = element.value === '' ? '' : Number(element.value);
  }

  try {
    validateAggregates();
    syncWater();
    save();
  } catch (error) {
    if (field === 'name') aggregate.name = oldValue;
    else if (field === 'fracture') aggregate.fracture = oldValue;
    else if (field === 'sg' || field === 'waterAbs') aggregate[field] = oldValue;
    else aggregate.passing[sieveIndex] = oldValue;
    alert(error.message);
  }
};

element.onkeydown = (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const aggIdx = Number(element.dataset.agg);
  const field = element.dataset.aggField;
  let nextInput = null;

  if (field === 'name') {
    nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-agg-field="sg"]`);
  } else if (field === 'sg') {
    nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-agg-field="waterAbs"]`);
  } else if (field === 'waterAbs') {
    nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-agg-field="fracture"]`);
  } else if (field === 'fracture') {
    nextInput = document.querySelector(`[data-agg="${aggIdx}"][data-sieve="0"]`);
  } else {
    const columnInputs = Array.from(document.querySelectorAll(`[data-agg="${aggIdx}"][data-sieve]`));
    const currentIdx = columnInputs.indexOf(element);
    if (currentIdx !== -1 && currentIdx < columnInputs.length - 1) {
      nextInput = columnInputs[currentIdx + 1];
    } else {
      nextInput = document.querySelector(`[data-agg="${aggIdx + 1}"][data-agg-field="name"]`);
    }
  }

  if (nextInput) {
    nextInput.focus();
    nextInput.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};

element.oninput = (e) => {
  let val = e.target.value;
  if (!val) return;
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const en = ['0','1','2','3','4','5','6','7','8','9'];
  for (let i = 0; i < 10; i++) {
    val = val.replace(new RegExp(fa[i], 'g'), en[i]).replace(new RegExp(ar[i], 'g'), en[i]);
  }
  if (e.target.value !== val) e.target.value = val;
};

});

document.querySelectorAll('[data-share]').forEach(element => {
element.onchange = () => {
const index = Number(element.dataset.share);
const raw = element.value;
const value = raw === '' ? '' : Number(raw);

if (value !== '' && (!Number.isFinite(value) || value < 0 || value > 100)) {
    alert('سهم سنگدانه باید بین صفر و ۱۰۰ باشد.');
    return;
  }

  data.aggregateShares[index] = value;
  syncWater();
  save();
  view();

  setTimeout(() => {
    const newEl = document.querySelector(`[data-share="${index}"]`);
    if (newEl) { newEl.focus(); newEl.select(); }
  }, 10);
};

element.oninput = (e) => {
  let val = e.target.value;
  if (!val) return;
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  const en = ['0','1','2','3','4','5','6','7','8','9'];
  for (let i = 0; i < 10; i++) {
    val = val.replace(new RegExp(fa[i], 'g'), en[i]).replace(new RegExp(ar[i], 'g'), en[i]);
  }
  if (e.target.value !== val) e.target.value = val;
};

});

document.querySelectorAll('[data-curve-aggregate]').forEach(element => {
element.onchange = () => {
const index = Number(element.dataset.curveAggregate);
data.showAggregateCurves[index] = element.checked;
save();
view();
};
});

const mixCheckbox = document.querySelector('[data-curve-mix]');
if (mixCheckbox) {
mixCheckbox.onchange = () => {
data.showMixCurve = mixCheckbox.checked;
save();
view();
};
}

const referenceCheckbox = document.querySelector('[data-curve-reference]');
if (referenceCheckbox) {
referenceCheckbox.onchange = () => {
data.showReferenceCurves = referenceCheckbox.checked;
save();
view();
};
}

const printButton = document.getElementById('print');
if (printButton) printButton.onclick = () => window.print();

const cementAction = document.getElementById('cement-action');
if (cementAction) {
cementAction.onchange = (e) => {
const val = e.target.value;
data.cementAction = val;
save();
if (val === 'grading') page = 2;
else if (val === 'wc') page = 3;
view();
};
}

prev.disabled = page === 0;

try {
if (page === 5) {
const result = new Step4().run();
const cement = result.cement;
const softMax = getSoftMaxCement();

const minActive = data.limitMinCementOn && Number(data.limitMinCement) > 0;
const maxActive = data.limitMaxCementOn && Number(data.limitMaxCement) > 0;

const isLimited = cement > softMax;
const belowMin = minActive && cement < Number(data.limitMinCement);
const aboveMax = maxActive && cement > Number(data.limitMaxCement);
const needsChoice = isLimited || belowMin || aboveMax;

const allowedActions = new Set();
if (isLimited) allowedActions.add('proceed');
if (minActive) allowedActions.add('min_cement');
if (maxActive) allowedActions.add('max_cement');

if (needsChoice && !allowedActions.has(data.cementAction)) {
next.disabled = true;
} else {
next.disabled = page === titles.length - 1;
}
} else {
next.disabled = page === titles.length - 1;
}
} catch (_) {
next.disabled = false;
}
}

/* =========================================
تم و راه‌اندازی
========================================= */

function injectWindowsTheme() {
const style = document.createElement('style');
style.innerHTML = `:root {
  --primary: #0078d4;
  --primary-hover: #005a9e;
  --bg: #f3f2f1;
  --panel-bg: #ffffff;
  --border: #d2d0ce;
  --text: #201f1e;
  --text-muted: #605e5c;
  --shadow: 0 4px 12px rgba(0,0,0,0.08);
}
body {
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  color: var(--text);
  margin: 0;
  padding: 20px;
  direction: rtl;
}
#app {
  background: var(--panel-bg);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset;
  max-width: 1100px;
  margin: 20px auto;
  overflow: hidden;
  border: 1px solid var(--border);
}
#tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  gap: 4px;
  padding: 8px 8px 0 8px;
}
#tabs button {
  background: transparent;
  border: none;
  border-radius: 10px 10px 0 0;
  padding: 8px 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s ease;
  font-family: inherit;
}
#tabs button:hover { background: #edebe9; color: var(--primary); }
#tabs button.active {
  background: var(--panel-bg);
  color: var(--primary);
  border-bottom: 3px solid var(--primary);
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
}
.panel { padding: 20px; }
.grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.field {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  padding: 4px 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 11px;
  color: var(--text);
  transition: box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
.field:hover { box-shadow: 0 3px 6px rgba(0,0,0,0.06); }
input[type="number"], input[type="text"], select {
  width: 130px !important;
  padding: 4px 6px;
  border: 1px solid #c8c6c4;
  border-radius: 4px;
  font-family: Arial, sans-serif !important;
  font-variant-numeric: lining-nums tabular-nums;
  font-size: 12px;
  background: #fff;
  text-align: center;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
input[type="number"]:focus, input[type="text"]:focus, select:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,120,212,0.2);
}
input.table-input[type="text"] { width: 75px !important; text-align: right; }
button {
  background: linear-gradient(180deg, #0078d4, #005a9e);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  box-shadow: 0 3px 5px rgba(0,120,212,0.2), 0 1px 2px rgba(0,0,0,0.1);
  transform: translateY(0);
}
button:hover {
  background: linear-gradient(180deg, #106ebe, #004578);
  box-shadow: 0 5px 10px rgba(0,120,212,0.3);
  transform: translateY(-1px);
}
button:active { transform: translateY(1px); box-shadow: none; }
table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
th, td {
  border: 1px solid var(--border);
  padding: 8px;
  text-align: right;
  font-size: 12px;
  font-variant-numeric: lining-nums tabular-nums;
}
th { background: #f3f2f1; font-weight: 600; color: var(--text); }
tr:nth-child(even) { background: #faf9f8; }
.aggregate-table th:first-child {
  position: sticky;
  right: 0;
  background-color: #f3f2f1;
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0,0,0,0.05);
}
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 10px;
}
.table-scroll::-webkit-scrollbar { height: 8px; }
.table-scroll::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
@media (max-width: 600px) {
  #tabs button { font-size: 11px; padding: 6px 2px; }
  .panel { padding: 12px; }
  .field { width: 100%; justify-content: space-between; }
}`;
document.head.appendChild(style);
}

function startApp() {
injectWindowsTheme();

const prev = document.getElementById('prev');
const next = document.getElementById('next');
if (!prev || !next) {
console.error('دکمه‌های پیمایش پیدا نشدند.');
return;
}

prev.onclick = () => { page = Math.max(0, page - 1); view(); };
next.onclick = () => { page = Math.min(titles.length - 1, page + 1); view(); };

if (data.admixture === 'none') {
if (data.admixturePct == null) data.admixturePct = 0;
}

syncWater();

save();
view();
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', startApp);
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
.catch(error => console.warn('Service Worker ثبت نشد:', error));
});
}

/* =========================================
منوی سه نقطه‌ای
========================================= */

function initNewMenu() {
const menuHTML = `<div id="app-options-menu" style="position: fixed; top: 15px; left: 15px; z-index: 99999; direction: rtl; font-family: inherit;">
<button id="app-menu-btn" style="background: linear-gradient(180deg, #0078d4, #005a9e); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 20px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; line-height: 1; transition: all 0.2s;">⋮</button>
<div id="app-menu-dropdown" style="display: none; position: absolute; top: 45px; left: 0; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 160px; overflow: hidden;">
<button id="app-menu-save" style="display: block; width: 100%; padding: 12px; text-align: right; background: none; border: none; border-bottom: 1px solid #eee; cursor: pointer; font-family: inherit; font-size: 14px; color: #333; transition: background 0.2s;">💾 ذخیره طرح</button>
<button id="app-menu-load" style="display: block; width: 100%; padding: 12px; text-align: right; background: none; border: none; border-bottom: 1px solid #eee; cursor: pointer; font-family: inherit; font-size: 14px; color: #333; transition: background 0.2s;">📂 بازیابی طرح</button>
<button id="app-menu-exit" style="display: block; width: 100%; padding: 12px; text-align: right; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 14px; color: #dc2626; transition: background 0.2s;">🚪 خروج</button>
</div>
</div>
<input type="file" id="app-hidden-file-input" accept=".json" style="display: none;">`;
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

const downloadProject = () => {
const jsonStr = JSON.stringify(data, null, 2);
const blob = new Blob([jsonStr], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `beton_project_${new Date().toISOString().slice(0, 10)}.json`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
};

menuSave.onclick = () => {
menuDropdown.style.display = 'none';
if (confirm('آیا از ذخیره طرح اطمینان دارید؟')) {
downloadProject();
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
downloadProject();
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
normalizeData();
syncWater();
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
