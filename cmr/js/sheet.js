// Builds one A4 page of the CMR note as HTML, and shrinks text that does not fit its box.
import { T, copyInfo } from "./texts.js";
import { goodsTotals } from "./numbers.js";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// "2026-11-20" → "20.11.2026"
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso || "";
}

// A label in every chosen language: one per line, or on one line separated by slashes.
function label(key, langs, inline = false) {
  const parts = langs.map((lang, i) => `<span class="${i ? "l2" : "l1"}">${esc(T[key][lang])}</span>`);
  return inline
    ? `<span class="lt inline">${parts.join('<span class="sep"> / </span>')}</span>`
    : `<span class="lt">${parts.join("")}</span>`;
}

function head(num, key, langs, inline) {
  return `<div class="lbl"><b class="num">${num}</b>${label(key, langs, inline)}</div>`;
}

// A box whose value fills the space under its label, shrunk to fit if needed.
function box(num, key, value, langs, { inline = false, cls = "", height, size = 9 } = {}) {
  return `<div class="box ${cls}" style="height:${height}mm">${head(num, key, langs, inline)}
    <div class="val" data-fit="${size}">${esc(value)}</div></div>`;
}

const check = (on) => `<span class="cb">${on ? "✕" : ""}</span>`;

const GOODS_COLS = [
  ["6", "b6", "marks", ""],
  ["7", "b7", "packages", "num-col"],
  ["8", "b8", "packing", ""],
  ["9", "b9", "nature", ""],
  ["10", "b10", "stat", ""],
  ["11", "b11", "weight", "num-col"],
  ["12", "b12", "volume", "num-col"],
];

const CHARGE_ROWS = ["carriage", "deductions", "balance", "supplements", "other", "misc", "total"];

function goods(data, langs) {
  const items = (data.items || []).filter((item) => GOODS_COLS.some(([, , field]) => String(item[field] || "").trim()));
  const cells = [];
  for (const [num, key, , cls] of GOODS_COLS) {
    cells.push(`<div class="gh ${cls}"><b class="num">${num}</b>${label(key, langs)}</div>`);
  }
  for (const item of items) {
    for (const [, , field, cls] of GOODS_COLS) cells.push(`<div class="gc ${cls}">${esc(item[field])}</div>`);
  }
  for (const [, , , cls] of GOODS_COLS) cells.push(`<div class="gc filler ${cls}"></div>`);

  const totals = goodsTotals(items);
  const showTotals = items.length > 1 && (totals.packages || totals.weight || totals.volume);
  if (showTotals) {
    const byField = { marks: label("goodsTotal", langs, true), packages: totals.packages, weight: totals.weight, volume: totals.volume };
    for (const [, , field, cls] of GOODS_COLS) {
      const value = field === "marks" ? byField.marks : esc(byField[field] || "");
      cells.push(`<div class="gc total ${cls}">${value}</div>`);
    }
  }

  const rows = `auto ${items.length ? `repeat(${items.length}, min-content) ` : ""}1fr${showTotals ? " auto" : ""}`;
  const adrCell = (key, field) =>
    `<div class="adr-cell">${label(key, langs, true)}<div class="adr-val" data-fit="8">${esc(data[field])}</div></div>`;

  return `<div class="goods">
    <div class="ggrid" data-fit="8.5" data-min="5" style="grid-template-rows:${rows}">${cells.join("")}</div>
    <div class="adr">
      <div class="adr-tag">${esc(T.adr.en)}</div>
      ${adrCell("adrUn", "adrUn")}${adrCell("adrName", "adrName")}${adrCell("adrLabel", "adrLabel")}${adrCell("adrGroup", "adrGroup")}
    </div>
  </div>`;
}

function charges(data, langs) {
  const c = data.charges || {};
  const cells = [
    `<div class="ch-h first">${head(20, "b20", langs, true)}</div>`,
    `<div class="ch-h">${label("paySender", langs, true)}</div>`,
    `<div class="ch-h">${label("payCurrency", langs, true)}</div>`,
    `<div class="ch-h">${label("payConsignee", langs, true)}</div>`,
  ];
  for (const row of CHARGE_ROWS) {
    const r = c[row] || {};
    cells.push(
      `<div class="ch-l${row === "total" ? " strong" : ""}">${label(row, langs, true)}</div>`,
      `<div class="ch-v">${esc(r.sender)}</div>`,
      `<div class="ch-v">${esc(r.currency)}</div>`,
      `<div class="ch-v">${esc(r.consignee)}</div>`,
    );
  }
  return `<div class="box charges" style="height:36mm"><div class="chgrid">${cells.join("")}</div></div>`;
}

export function copyBand(index, langs) {
  const info = copyInfo(index);
  const names = langs.map((lang, i) => `<span class="${i ? "l2" : "l1"}">${esc(info.names[lang])}</span>`).join('<span class="sep"> / </span>');
  return `<span class="copy-no" style="background:${info.color}">${info.number}</span><span class="copy-name">${names}</span>
    <span class="copy-bar" style="background:${info.color}"></span>`;
}

// data: the form contents; langs: printed languages, first one is the main one; copy: 0-based copy index.
export function renderSheet(data, langs, copy) {
  const d = data || {};
  const takeover = [d.takeoverPlace, formatDate(d.takeoverDate)].filter(Boolean).join("     ");
  const titles = langs.map((lang, i) => `<span class="${i ? "l2" : "l1"}">${esc(T.title[lang])}</span>`).join("");
  const clause = langs.map((lang, i) => `<span class="${i ? "l2" : "l1"}">${esc(T.clause[lang])}</span>`).join("");
  const note = langs.map((lang, i) => `<span class="${i ? "l2" : "l1"}">${esc(T.note[lang])}</span>`).join(" ");

  return `<div class="sheet" data-langs="${langs.length}">
  <div class="copy-band">${copyBand(copy, langs)}</div>
  <div class="frame">
    <div class="sec two">
      <div class="col">
        ${box(1, "b1", d.sender, langs, { height: 24 })}
        ${box(2, "b2", d.consignee, langs, { height: 24 })}
        ${box(3, "b3", d.delivery, langs, { height: 12 })}
        <div class="box" style="height:14mm">${head(4, "b4", langs)}
          <div class="val" data-fit="9">${esc(takeover)}</div></div>
        ${box(5, "b5", d.documents, langs, { height: 12, inline: true })}
      </div>
      <div class="col">
        <div class="titleblk" style="height:20mm">
          <div class="tb-top">
            <div class="tb-titles" data-fit="6.6" data-min="4.5">${titles}</div>
            <div class="tb-cmr">CMR</div>
          </div>
          <div class="tb-no">${label("no", langs, true)}<span class="tb-no-val" data-fit="11" data-min="6">${esc(d.no)}</span></div>
        </div>
        <div class="clause" style="height:12mm" data-fit="5.2" data-min="3.8">${clause}</div>
        ${box(16, "b16", d.carrier, langs, { height: 20, cls: "bold" })}
        ${box(17, "b17", d.successive, langs, { height: 17, cls: "bold" })}
        ${box(18, "b18", d.reservations, langs, { height: 17, cls: "bold" })}
      </div>
    </div>
    ${goods(d, langs)}
    <div class="sec two">
      <div class="col">
        ${box(13, "b13", d.instructions, langs, { height: 22 })}
        <div class="box" style="height:16mm">${head(14, "b14", langs, true)}
          <div class="pay">
            <span class="opt">${check(d.payment === "paid")}${label("paid", langs, true)}</span>
            <span class="opt">${check(d.payment === "forward")}${label("forward", langs, true)}</span>
          </div>
          <div class="val" data-fit="8.5">${esc(d.paymentNote)}</div></div>
        ${box(15, "b15", d.cod, langs, { height: 12, inline: true })}
      </div>
      <div class="col">
        ${box(19, "b19", d.special, langs, { height: 14, inline: true })}
        ${charges(d, langs)}
      </div>
    </div>
    <div class="sec two r21" style="height:9mm">
      <div class="col"><div class="box">${head(21, "b21", langs, true)}<div class="val" data-fit="9">${esc(d.issuedPlace)}</div></div></div>
      <div class="col"><div class="box">${head("", "on", langs, true)}<div class="val" data-fit="9">${esc(formatDate(d.issuedDate))}</div></div></div>
    </div>
    <div class="sec sigs" style="height:32mm">
      <div class="box sig"><b class="num">22</b><div class="sig-space"></div>${label("b22", langs)}</div>
      <div class="box sig bold"><b class="num">23</b><div class="sig-space"></div>${label("b23", langs)}</div>
      <div class="box sig">${head(24, "b24", langs, true)}
        <div class="recv"><span>${label("place", langs, true)}</span><span class="dots"></span><span>${label("on", langs, true)}</span><span class="dots short"></span></div>
        <div class="sig-space"></div>${label("b24sign", langs)}</div>
    </div>
    <div class="sec two r25" style="height:12mm">
      <div class="col"><div class="box bold">${head(25, "b25", langs, true)}
        <div class="regs">
          <span class="reg">${label("truck", langs, true)}<b data-fit="9" data-min="6">${esc(d.truck)}</b></span>
          <span class="reg">${label("trailer", langs, true)}<b data-fit="9" data-min="6">${esc(d.trailer)}</b></span>
        </div></div></div>
      <div class="col note"><div class="note-text" data-fit="5" data-min="3.6">${note}</div></div>
    </div>
  </div>
</div>`;
}

const overflows = (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;

// Shrinks every [data-fit] element of a sheet (attached to the page) until its text fits.
export function fitSheet(sheet) {
  for (const el of sheet.querySelectorAll("[data-fit]")) {
    const max = parseFloat(el.dataset.fit);
    const min = parseFloat(el.dataset.min || "5.5");
    let size = max;
    el.style.fontSize = `${size}pt`;
    if (!el.textContent.trim()) continue;
    while (size > min && overflows(el)) {
      size = Math.max(min, size - 0.25);
      el.style.fontSize = `${size}pt`;
    }
  }
}
