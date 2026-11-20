// Totals of the goods lines. Numbers may be typed with a comma or a dot as the decimal mark,
// and with spaces between thousands ("1 250,5").

export function parseNumber(text) {
  // A unit typed after the number is ignored: "12 kg", "18,4 m³", "5 pcs".
  let s = String(text ?? "").replace(/[\s ']/g, "").replace(/(kg|m3|m³|pcs|szt\.?|ks|Stk\.?)$/i, "");
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    // Both marks: the last one is the decimal mark, the other separates thousands.
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma >= 0) {
    // "1,5" is a decimal; "1,250,000" separates thousands.
    s = s.split(",").length > 2 ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (s.split(".").length > 2) {
    s = s.replace(/\./g, "");
  }
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  return Number(s);
}

export function formatNumber(value, decimalMark = ",") {
  const rounded = Math.round(value * 1000) / 1000;
  const [int, frac] = String(rounded).split(".");
  // Thousands separated by a space, which reads right with either decimal mark: "4 916,5".
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return frac ? `${grouped}${decimalMark}${frac}` : grouped;
}

// Sums packages, weight and volume; empty string when no line has a number in that column.
export function goodsTotals(items) {
  const usesDot = items.some((item) => /\.\d/.test(`${item.weight || ""}${item.volume || ""}`) && !/,/.test(`${item.weight || ""}${item.volume || ""}`));
  const mark = usesDot ? "." : ",";
  const sum = (field) => {
    let total = 0;
    let any = false;
    for (const item of items) {
      const n = parseNumber(item[field]);
      if (n !== null) {
        total += n;
        any = true;
      }
    }
    return any ? formatNumber(total, mark) : "";
  };
  return { packages: sum("packages"), weight: sum("weight"), volume: sum("volume") };
}
