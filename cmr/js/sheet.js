// One A4 page of the CMR note: IRU's blank form (template/iru-cmr-2007.svg) in the colour of the copy,
// with the filled-in data placed in its boxes. Positions are in pt on the IRU page (595.22 × 842 pt),
// measured from the form itself; text that does not fit its box is shrunk.
import { copyInfo } from "./texts.js";
import { goodsTotals } from "./numbers.js";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// "2026-11-20" → ["20", "11", "2026"]
function dateParts(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? [m[3], m[2], m[1]] : null;
}
export function formatDate(iso) {
  const p = dateParts(iso);
  return p ? p.join(".") : iso || "";
}

// Baseline of the text in a line box with line-height 1 (Arial / Helvetica / Roboto metrics).
const BASELINE = 0.845;
const pt = (n) => `${Math.round(n * 100) / 100}pt`;

// One line of text sitting on a printed baseline, next to a label of the form. Shrunk text stays on
// the baseline (the line box is aligned to its bottom) and only its width is checked.
function line(box, x, baseline, width, value, size = 8.5, cls = "") {
  if (!String(value ?? "").trim()) return "";
  return `<div class="v line ${cls}" style="left:${pt(x)};top:${pt(baseline - BASELINE * size)};width:${pt(width)};height:${pt(size)}"
    data-fit="${size}" data-min="4.5" data-axis="x" data-box="${box}">${esc(value)}</div>`;
}

// A block of text filling the free part of a box.
function block(box, x, y, width, height, value, size = 9) {
  if (!String(value ?? "").trim()) return "";
  return `<div class="v block" style="left:${pt(x)};top:${pt(y)};width:${pt(width)};height:${pt(height)}"
    data-fit="${size}" data-min="5" data-box="${box}">${esc(value)}</div>`;
}

// A cell of the box 17 table: right-aligned, centred vertically.
function cell(x, y, width, height, value) {
  if (!String(value ?? "").trim()) return "";
  return `<div class="v cell" style="left:${pt(x)};top:${pt(y)};width:${pt(width)};height:${pt(height)}"
    data-fit="8.5" data-min="5" data-box="17 To be paid by"><span>${esc(value)}</span></div>`;
}

// Boxes 10–15. Column edges follow the form; the numbers columns are right-aligned.
const GOODS = { x: 41, y: 338, width: 514, height: 130 };
const GOODS_COLS = [
  ["marks", 84, ""],
  ["packages", 88, "num"],
  ["packing", 85, ""],
  ["nature", 132.8, ""],
  ["weight", 62.2, "num"],
  ["volume", 62, "num"],
];

function goods(data) {
  const items = (data.items || []).filter((item) => GOODS_COLS.some(([field]) => String(item[field] || "").trim()));
  if (!items.length) return "";
  const cells = [];
  for (const item of items) {
    for (const [field, , cls] of GOODS_COLS) cells.push(`<div class="gc ${field} ${cls}">${esc(item[field])}</div>`);
  }
  for (const [field, , cls] of GOODS_COLS) cells.push(`<div class="gc filler ${field} ${cls}"></div>`);
  const totals = goodsTotals(items);
  const showTotals = items.length > 1 && (totals.packages || totals.weight || totals.volume);
  if (showTotals) {
    const values = { marks: "Total", packages: totals.packages, weight: totals.weight, volume: totals.volume };
    for (const [field, , cls] of GOODS_COLS) cells.push(`<div class="gc total ${field} ${cls}">${esc(values[field] || "")}</div>`);
  }
  const rows = `repeat(${items.length}, min-content) 1fr${showTotals ? " auto" : ""}`;
  return `<div class="ggrid" data-fit="8.5" data-min="4" data-box="Goods (10–15)" style="left:${pt(GOODS.x)};top:${pt(GOODS.y)};width:${pt(GOODS.width)};height:${pt(GOODS.height)};
    grid-template-columns:${GOODS_COLS.map(([, w]) => pt(w)).join(" ")};grid-template-rows:${rows}">${cells.join("")}</div>`;
}

const parts = (list) => list.map(([text, bold]) => (bold ? `<b>${esc(text)}</b>` : esc(text))).join("");

// The copy heading at the top left ("1 Exemplaire de l'expéditeur / Copy for sender") in the copy's colour.
export function copyHead(index) {
  const info = copyInfo(index);
  return `<div class="copy-no">${info.number}</div>
    <div class="copy-name" style="top:${pt(24.7 - BASELINE * 5)}">${parts(info.fr)}</div>
    <div class="copy-name" style="top:${pt(30.7 - BASELINE * 5)}">${parts(info.en)}</div>`;
}

// data: the form contents; copy: 0-based copy index.
export function renderSheet(data, copy) {
  const d = data || {};
  const info = copyInfo(copy);
  const c = d.charges || {};
  const plates = [d.truck && `Véhicule / Vehicle: ${d.truck}`, d.trailer && `Remorque / Trailer: ${d.trailer}`].filter(Boolean).join("     ");
  const issued = dateParts(d.issuedDate);
  const no = esc(d.no);

  return `<div class="sheet" style="--form:${info.color}">
  <div class="page">
    <svg class="art" viewBox="0 0 595.22 842" aria-hidden="true"><use href="#cmr-iru-2007"/></svg>
    <div class="copy-head">${copyHead(copy)}</div>
    <div class="v line no-top" style="top:${pt(32.8 - BASELINE * 9)}" data-fit="9" data-min="4.5" data-axis="x" data-box="CMR number"><span class="form-text">No</span> ${no}</div>
    <div class="v no-bottom" style="top:${pt(838.1 - BASELINE * 8)}"><span class="form-text">No</span> ${no}</div>
    ${line("Pays / Country", 418, 25, 56, d.country, 8, "center strong")}

    ${block("1 Sender", 50.3, 52, 242, 52, d.sender)}
    ${block("2 Consignee", 50.3, 125, 242, 51, d.consignee)}
    ${/* the place is only 6 pt below the box heading: a little smaller and lower so it clears it */ ""}
    ${line("3 Taking over: place", 88, 191, 204, d.takeoverPlace, 7.5)}
    ${line("3 Taking over: country", 88, 202.4, 204, d.takeoverCountry)}
    ${line("3 Taking over: date", 88, 214.4, 80, formatDate(d.takeoverDate))}
    ${line("4 Delivery: place", 88, 242.4, 204, d.deliveryPlace)}
    ${line("4 Delivery: country", 88, 254.4, 204, d.deliveryCountry)}
    ${line("4 Opening hours", 180, 266.4, 112, d.deliveryHours)}
    ${block("5 Sender's instructions", 50.3, 287.5, 242, 32, d.instructions, 8.5)}

    ${block("6 Carrier", 308.8, 53.5, 243, 51, d.carrier)}
    ${line("7 Successive carrier", 355, 122.9, 196, d.succName)}
    ${line("7 Successive carrier", 355, 134.9, 196, d.succAddress)}
    ${line("7 Successive carrier", 355, 146.8, 196, d.succCountry)}
    ${block("8 Carrier's reservations", 310, 193.5, 242, 76, d.reservations, 8.5)}
    ${block("9 Documents", 308, 289, 244, 30.5, d.documents, 8.5)}

    ${goods(d)}
    ${line("ADR: UN number", 78, 480.2, 47, d.adrUn, 8)}
    ${line("ADR: label number", 259, 480.2, 39, d.adrLabel, 8)}
    ${line("ADR: packing group", 348, 480.2, 57, d.adrGroup, 8)}

    ${block("16 Special agreements", 50.7, 501, 242, 76, d.special, 8.5)}
    ${cell(367, 503, 90.6, 16.5, c.carriage?.sender)}${cell(461.6, 503, 90, 16.5, c.carriage?.consignee)}
    ${cell(367, 522, 90.6, 16, c.supplementary?.sender)}${cell(461.6, 522, 90, 16, c.supplementary?.consignee)}
    ${cell(367, 541, 90.6, 16.5, c.customs?.sender)}${cell(461.6, 541, 90, 16.5, c.customs?.consignee)}
    ${cell(367, 560, 90.6, 16.5, c.other?.sender)}${cell(461.6, 560, 90, 16.5, c.other?.consignee)}
    ${block("18 Other useful particulars", 50.2, 593.5, 242, 32, [plates, d.other].filter(Boolean).join("\n"), 8.5)}
    ${block("19 Cash on delivery", 309, 596, 243, 29.5, d.cod, 8.5)}

    ${line("21 Established in", 116, 659.8, 88, d.issuedPlace)}
    ${issued ? line("21 Date", 225, 659.8, 118, `${issued[0]}.${issued[1]}.`) : ""}
    ${issued ? line("21 Date", 353.3, 659.8, 24, issued[2].startsWith("20") ? issued[2].slice(2) : issued[2]) : ""}
  </div>
</div>`;
}

// Width of the text itself: right-aligned or centred text that is too long sticks out to the left,
// which scrollWidth does not count.
function textWidth(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
}
const overflows = (el) =>
  el.dataset.axis === "x"
    ? textWidth(el) > el.getBoundingClientRect().width * 1.002 + 0.5
    : el.scrollWidth > el.clientWidth + 0.5 || el.scrollHeight > el.clientHeight + 0.5;

// Shrinks every [data-fit] element of a sheet (attached to the page) until its text fits.
// Returns the names of the boxes whose text still does not fit at the smallest size.
export function fitSheet(sheet) {
  const tooLong = new Set();
  for (const el of sheet.querySelectorAll("[data-fit]")) {
    const max = parseFloat(el.dataset.fit);
    const min = parseFloat(el.dataset.min || "5.5");
    let size = max;
    el.style.fontSize = `${size}pt`;
    while (size > min && overflows(el)) {
      size = Math.max(min, size - 0.25);
      el.style.fontSize = `${size}pt`;
    }
    if (overflows(el)) tooLong.add(el.dataset.box);
  }
  return [...tooLong];
}
