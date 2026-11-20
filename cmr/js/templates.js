// Templates: the fields that are the same on many CMR notes (sender, a regular consignee, the carrier …),
// saved under a name. They are kept in the browser and can be exported to a JSON file and imported again,
// to keep a copy or to use them on another computer.

export const ITEM_FIELDS = ["marks", "packages", "packing", "nature", "weight", "volume"];
export const CHARGE_ROWS = ["carriage", "supplementary", "customs", "other"];
export const CHARGE_COLS = ["sender", "consignee"];

// What a template can hold, in parts the user ticks when saving. `off`: not ticked by default because it
// usually changes from shipment to shipment. Never saved: CMR number, dates, carrier's reservations (8).
export const GROUPS = [
  { id: "sender", boxes: "1", label: "Sender", keys: ["sender"] },
  { id: "takeover", boxes: "3", label: "Taking over: place and country", keys: ["takeoverPlace", "takeoverCountry"] },
  { id: "consignee", boxes: "2", label: "Consignee", keys: ["consignee"] },
  { id: "delivery", boxes: "4", label: "Delivery: place, country, opening hours", keys: ["deliveryPlace", "deliveryCountry", "deliveryHours"] },
  { id: "carrier", boxes: "6, 7", label: "Carrier and successive carrier", keys: ["carrier", "succName", "succAddress", "succCountry"] },
  { id: "vehicle", boxes: "18", label: "Vehicle and trailer reg. numbers", keys: ["truck", "trailer"], off: true },
  { id: "instructions", boxes: "5, 9, 16, 18, 19", label: "Instructions, documents, agreements, other particulars, cash on delivery", keys: ["instructions", "documents", "special", "other", "cod"] },
  { id: "goods", boxes: "10–15", label: "Goods lines and ADR", keys: ["items", "adrUn", "adrLabel", "adrGroup"], off: true },
  { id: "charges", boxes: "17", label: "To be paid by", keys: ["charges"] },
  { id: "issue", boxes: "21", label: "Pays / Country and place of issue", keys: ["country", "issuedPlace"] },
];

const TEXT_KEYS = GROUPS.flatMap((g) => g.keys).filter((k) => k !== "items" && k !== "charges");
const FILE_TYPE = "cmr-form-templates";
const MAX_TEXT = 2000;
const MAX_ITEMS = 50;
const MAX_TEMPLATES = 500;

const filledText = (v) => typeof v === "string" && v.trim() !== "";
const filledItems = (items) => Array.isArray(items) && items.some((item) => ITEM_FIELDS.some((f) => filledText(item?.[f])));
const filledCharges = (c) => !!c && CHARGE_ROWS.some((r) => CHARGE_COLS.some((col) => filledText(c[r]?.[col])));

function filled(key, value) {
  if (key === "items") return filledItems(value);
  if (key === "charges") return filledCharges(value);
  return filledText(value);
}

export const groupFilled = (group, data) => group.keys.some((k) => filled(k, data[k]));

// A short preview of a group's contents for the save dialog.
export function groupPreview(group, data) {
  if (group.id === "goods") {
    const n = (data.items || []).filter((item) => ITEM_FIELDS.some((f) => filledText(item[f]))).length;
    return n ? `${n} goods line${n === 1 ? "" : "s"}` : "";
  }
  if (group.id === "charges") return filledCharges(data.charges) ? "charges filled in" : "";
  return group.keys
    .map((k) => data[k])
    .filter(filledText)
    .map((v) => v.trim().split("\n")[0])
    .join(" · ");
}

const copy = (value) => JSON.parse(JSON.stringify(value));

// The fields of the ticked groups (only filled ones), to store in a template.
export function pickFields(data, groupIds) {
  const fields = {};
  for (const group of GROUPS) {
    if (!groupIds.includes(group.id)) continue;
    for (const key of group.keys) if (filled(key, data[key])) fields[key] = copy(data[key]);
  }
  return fields;
}

// Names of the parts a template holds, e.g. "Sender · Consignee · Carrier".
export function summary(fields) {
  return GROUPS.filter((g) => g.keys.some((k) => k in fields))
    .map((g) => g.label.split(/[:,]/)[0])
    .join(" · ");
}

const text = (v) => (typeof v === "string" ? v.slice(0, MAX_TEXT) : typeof v === "number" ? String(v) : null);

// Keeps only known fields with the right shape, so a file from anywhere cannot put anything else into the form.
export function cleanFields(raw) {
  const fields = {};
  if (!raw || typeof raw !== "object") return fields;
  for (const key of TEXT_KEYS) {
    const v = text(raw[key]);
    if (v !== null) fields[key] = v;
  }
  if (Array.isArray(raw.items)) {
    const items = raw.items.slice(0, MAX_ITEMS).filter((item) => item && typeof item === "object")
      .map((item) => Object.fromEntries(ITEM_FIELDS.map((f) => [f, text(item[f]) ?? ""])));
    if (items.length) fields.items = items;
  }
  if (raw.charges && typeof raw.charges === "object") {
    const charges = {};
    for (const row of CHARGE_ROWS) {
      const r = raw.charges[row];
      if (!r || typeof r !== "object") continue;
      const cols = {};
      for (const col of CHARGE_COLS) {
        const v = text(r[col]);
        if (v !== null) cols[col] = v;
      }
      if (Object.keys(cols).length) charges[row] = cols;
    }
    if (Object.keys(charges).length) fields.charges = charges;
  }
  return fields;
}

export function cleanTemplates(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const t of list.slice(0, MAX_TEMPLATES)) {
    const name = typeof t?.name === "string" ? t.name.trim().slice(0, 80) : "";
    if (!name || seen.has(name.toLowerCase())) continue;
    const fields = cleanFields(t.fields);
    if (!Object.keys(fields).length) continue;
    seen.add(name.toLowerCase());
    out.push({ name, fields, saved: typeof t.saved === "string" ? t.saved : "" });
  }
  return out;
}

export const sortTemplates = (list) => [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

export function exportText(templates) {
  return `${JSON.stringify({ type: FILE_TYPE, version: 1, exported: new Date().toISOString(), templates }, null, 2)}\n`;
}

// Reads an exported file. Throws an Error with a message for the user when it is not a templates file.
export function parseFile(content) {
  let json;
  try {
    json = JSON.parse(content);
  } catch {
    throw new Error("This file is not a CMR templates file (it could not be read as JSON).");
  }
  if (!json || json.type !== FILE_TYPE || !Array.isArray(json.templates)) {
    throw new Error("This file is not a CMR templates file. Choose a file exported with “Export to file”.");
  }
  const templates = cleanTemplates(json.templates);
  if (!templates.length) throw new Error("The file has no templates in it.");
  return templates;
}
