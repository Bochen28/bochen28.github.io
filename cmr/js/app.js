// CMR Form: fill in the consignment note, preview it on IRU's blank CMR (Model 2007) and print it
// in as many copies as needed.
import { copyInfo } from "./texts.js";
import { renderSheet, fitSheet, copyHead } from "./sheet.js";
import { goodsTotals } from "./numbers.js";

const STORE_KEY = "cmr-form:v1";
const TEMPLATE_URL = "template/iru-cmr-2007.svg";
const MAX_COPIES = 10;
// Kept when starting a new CMR: they are usually the same for every note from this warehouse.
const KEEP_ON_NEW = ["country", "sender", "takeoverPlace", "takeoverCountry", "issuedPlace"];
const ITEM_FIELDS = ["marks", "packages", "packing", "nature", "weight", "volume"];
const CHARGE_ROWS = [
  ["carriage", "Carriage charges"],
  ["supplementary", "Supplementary charges"],
  ["customs", "Customs duties"],
  ["other", "Other charges"],
];
const CHARGE_COLS = [
  ["sender", "Sender"],
  ["consignee", "Consignee"],
];

const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const emptyItem = () => Object.fromEntries(ITEM_FIELDS.map((f) => [f, ""]));

function emptyData() {
  return {
    no: "", country: "", sender: "", consignee: "",
    takeoverPlace: "", takeoverCountry: "", takeoverDate: "",
    deliveryPlace: "", deliveryCountry: "", deliveryHours: "",
    instructions: "", carrier: "", succName: "", succAddress: "", succCountry: "",
    reservations: "", documents: "",
    items: [emptyItem()],
    adrUn: "", adrLabel: "", adrGroup: "",
    special: "", charges: {}, truck: "", trailer: "", other: "", cod: "",
    issuedPlace: "", issuedDate: "",
  };
}

// ---------- Saved state ----------

let data = emptyData();
let settings = { copies: 3, view: 0 };

function load() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    saved = null;
  }
  if (saved && typeof saved === "object") {
    const old = saved.data || {};
    // Notes saved by the first version (own layout) used "delivery" for the place of delivery.
    if (old.delivery && !old.deliveryPlace) old.deliveryPlace = old.delivery;
    data = Object.fromEntries(Object.entries(emptyData()).map(([key, empty]) => [key, old[key] ?? empty]));
    if (!Array.isArray(data.items) || !data.items.length) data.items = [emptyItem()];
    data.items = data.items.map((item) => ({ ...emptyItem(), ...Object.fromEntries(ITEM_FIELDS.map((f) => [f, item[f] ?? ""])) }));
    if (typeof data.charges !== "object" || !data.charges) data.charges = {};
    settings.copies = (saved.settings || {}).copies ?? settings.copies;
  } else {
    data.takeoverDate = today();
    data.issuedDate = today();
  }
  settings.copies = clampCopies(settings.copies);
  settings.view = 0;
}

let saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 250);
}
function saveNow() {
  clearTimeout(saveTimer);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ data, settings: { copies: settings.copies } }));
  } catch {
    // Private mode or storage full: the form still works, it just is not remembered.
  }
}

const clampCopies = (n) => Math.min(MAX_COPIES, Math.max(1, Math.round(Number(n)) || 1));

// ---------- Form ----------

const form = $("#form");

function fillForm() {
  for (const el of form.querySelectorAll("[data-key]")) el.value = data[el.dataset.key] ?? "";
  renderItems();
  renderCharges();
  if (data.adrUn || data.adrLabel || data.adrGroup) $("#adr-details").open = true;
}

function renderItems() {
  const many = data.items.length > 1;
  $("#items").innerHTML = data.items
    .map((item, i) => {
      const input = (field, attrs = "") =>
        `<input data-item="${i}" data-field="${field}" type="text" value="${esc(item[field])}" ${attrs}>`;
      return `<fieldset class="item">
        <div class="item-head"><span>Line ${i + 1}</span>
          <button class="icon-btn" type="button" data-remove="${i}" aria-label="${many ? "Remove" : "Clear"} line ${i + 1}">✕</button></div>
        <div class="item-grid">
          <label class="field span2"><span class="fl"><b>13</b> Nature of the goods</span>${input("nature")}</label>
          <label class="field"><span class="fl"><b>11</b> Number of packages</span>${input("packages", 'inputmode="numeric"')}</label>
          <label class="field"><span class="fl"><b>12</b> Method of packing</span>${input("packing", 'list="packing-list"')}</label>
          <label class="field"><span class="fl"><b>14</b> Gross weight, kg</span>${input("weight", 'inputmode="decimal"')}</label>
          <label class="field"><span class="fl"><b>15</b> Volume, m³</span>${input("volume", 'inputmode="decimal"')}</label>
          <label class="field span2"><span class="fl"><b>10</b> Marks and Nos</span>${input("marks")}</label>
        </div>
      </fieldset>`;
    })
    .join("");
  renderGoodsTotal();
}

function renderGoodsTotal() {
  const t = goodsTotals(data.items);
  const parts = [];
  if (t.packages) parts.push(`${t.packages} packages`);
  if (t.weight) parts.push(`${t.weight} kg`);
  if (t.volume) parts.push(`${t.volume} m³`);
  $("#goods-total").textContent = parts.length ? `Total: ${parts.join(" · ")}` : "";
}

function renderCharges() {
  const c = data.charges || {};
  const head = `<span></span>${CHARGE_COLS.map(([, name]) => `<span class="ch-head">${name}</span>`).join("")}`;
  const rows = CHARGE_ROWS.map(
    ([row, name]) =>
      `<span class="ch-name">${name}</span>${CHARGE_COLS.map(
        ([col, colName]) =>
          `<input type="text" data-charge="${row}" data-col="${col}" value="${esc(c[row]?.[col])}" aria-label="${name}: ${colName}">`,
      ).join("")}`,
  ).join("");
  $("#charges").innerHTML = head + rows;
}

form.addEventListener("input", onEdit);
form.addEventListener("change", onEdit);
form.addEventListener("submit", (e) => e.preventDefault());

function onEdit(event) {
  const el = event.target;
  if (el.dataset.key) {
    data[el.dataset.key] = el.value;
  } else if (el.dataset.item !== undefined) {
    data.items[Number(el.dataset.item)][el.dataset.field] = el.value;
    renderGoodsTotal();
  } else if (el.dataset.charge) {
    data.charges[el.dataset.charge] = { ...(data.charges[el.dataset.charge] || {}), [el.dataset.col]: el.value };
  } else {
    return;
  }
  changed();
}

$("#items").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-remove]");
  if (!btn) return;
  const i = Number(btn.dataset.remove);
  if (data.items.length > 1) data.items.splice(i, 1);
  else data.items = [emptyItem()];
  renderItems();
  changed();
});

$("#add-item").addEventListener("click", () => {
  data.items.push(emptyItem());
  renderItems();
  changed();
  $("#items").querySelector(`[data-item="${data.items.length - 1}"]`)?.focus();
});

$("#new-btn").addEventListener("click", () => {
  if (!confirm("Start a new CMR?\n\nThe sender, the place of taking over, the country and the place of issue stay. Everything else is cleared and the dates are set to today.")) return;
  const kept = Object.fromEntries(KEEP_ON_NEW.map((k) => [k, data[k]]));
  data = { ...emptyData(), ...kept, takeoverDate: today(), issuedDate: today() };
  fillForm();
  changed();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#clear-btn").addEventListener("click", () => {
  if (!confirm("Clear every field of this CMR, the sender included?")) return;
  data = emptyData();
  fillForm();
  changed();
});

// ---------- Copies ----------

const copiesInput = $("#copies");

function renderCopies() {
  copiesInput.value = settings.copies;
  $("#copies-minus").disabled = settings.copies <= 1;
  $("#copies-plus").disabled = settings.copies >= MAX_COPIES;
  $("#print-btn").textContent = settings.copies === 1 ? "Print 1 copy" : `Print ${settings.copies} copies`;
  if (settings.view >= settings.copies) settings.view = settings.copies - 1;
  $("#copy-chips").innerHTML = Array.from({ length: settings.copies }, (_, i) => {
    const info = copyInfo(i);
    return `<button type="button" class="chip copy-chip" data-copy="${i}" aria-pressed="${i === settings.view}">
      <span class="dot" style="background:${info.color}"></span>${info.number} ${info.short}</button>`;
  }).join("");
}

function setCopies(n) {
  settings.copies = clampCopies(n);
  renderCopies();
  renderPreview();
  changed();
}

$("#copies-minus").addEventListener("click", () => setCopies(settings.copies - 1));
$("#copies-plus").addEventListener("click", () => setCopies(settings.copies + 1));
copiesInput.addEventListener("change", () => setCopies(copiesInput.value));
copiesInput.addEventListener("focus", () => copiesInput.select());

$("#copy-chips").addEventListener("click", (event) => {
  const chip = event.target.closest("[data-copy]");
  if (!chip) return;
  settings.view = Number(chip.dataset.copy);
  renderCopies();
  renderPreview();
});

// ---------- Preview ----------

const preview = $("#preview");
const previewWrap = $("#preview-wrap");
let templateReady = false;

function renderPreview() {
  if (!templateReady) return;
  preview.innerHTML = renderSheet(data, settings.view);
  const tooLong = fitSheet(preview.firstElementChild);
  const warning = $("#fit-warning");
  warning.hidden = !tooLong.length;
  warning.textContent = tooLong.length
    ? `Too much text for the form: ${tooLong.join(", ")}. Shorten it, or the end is cut off on the print.`
    : "";
  scalePreview();
}

function scalePreview() {
  const sheet = preview.firstElementChild;
  if (!sheet) return;
  const scale = Math.min(1.25, previewWrap.clientWidth / sheet.offsetWidth);
  preview.style.transform = `scale(${scale})`;
  previewWrap.style.height = `${sheet.offsetHeight * scale}px`;
}

new ResizeObserver(scalePreview).observe(previewWrap);

let previewTimer = 0;
let printPrepared = false;
function changed() {
  printPrepared = false;
  save();
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderPreview, 120);
}

// IRU's blank form, drawn on every page with <use>, in the colour of each copy.
async function loadTemplate() {
  try {
    const response = await fetch(TEMPLATE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    $("#form-art").innerHTML = await response.text();
    templateReady = true;
    $("#print-btn").disabled = false;
    $("#blank-btn").disabled = false;
    renderPreview();
  } catch (err) {
    console.error("CMR form template could not be loaded", err);
    preview.innerHTML = `<p class="load-error">The blank CMR form could not be loaded. Check the connection and reload the page.</p>`;
  }
}

// ---------- Printing ----------

// Fills the hidden print area with one page per copy: the first page is laid out and fitted,
// the other copies are clones of it with their own heading and colour.
function buildPrint(blank) {
  const root = $("#print-root");
  root.innerHTML = renderSheet(blank ? emptyData() : data, 0);
  const first = root.firstElementChild;
  fitSheet(first);
  for (let i = 1; i < settings.copies; i++) {
    const page = first.cloneNode(true);
    page.style.setProperty("--form", copyInfo(i).color);
    page.querySelector(".copy-head").innerHTML = copyHead(i);
    root.append(page);
  }
  printPrepared = true;
}

function print(blank) {
  if (!templateReady) return;
  saveNow();
  buildPrint(blank);
  window.print();
}

$("#print-btn").addEventListener("click", () => print(false));
$("#blank-btn").addEventListener("click", () => print(true));
// Printing from the browser menu (Ctrl+P) prints the filled-in note too.
window.addEventListener("beforeprint", () => {
  if (!printPrepared && templateReady) buildPrint(false);
});
window.addEventListener("afterprint", () => {
  printPrepared = false;
});

window.addEventListener("pagehide", saveNow);

// ---------- Start ----------

load();
renderCopies();
fillForm();
$("#blank-btn").disabled = true;
loadTemplate();

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch((err) => console.warn("Offline mode unavailable", err));
}
