# CMR Form

Fill in the CMR consignment note and print it on the official blank **IRU CMR Model 2007** form (French /
English), in as many copies as you need.

**Open:** https://bochen28.github.io/cmr/

## How it works

1. Fill in the boxes. Each field shows the box number of the IRU form (1 Sender, 2 Consignee, 3 Taking over the
   goods …). Goods (boxes 10–15) can have several lines; packages, weight and volume are totalled on the note.
   Vehicle and trailer registration numbers are printed in box 18.
2. The preview on the right (on phones: below the form) shows the page exactly as it prints. Text that is too
   long for its box is printed smaller; if it still does not fit, a warning above the preview names the box.
3. Choose the number of **Copies** (1–10) and tap **Print**. Every copy gets its own page in the IRU colours:
   **1 Copy for sender** (red), **2 Copy for consignee** (blue), **3 Copy for carrier** (green), then
   **Additional copy** (black). Keep the scale at 100% in the print dialog, or choose **Save as PDF**.
4. **Print blank forms** prints the empty IRU form, to fill in by hand.
5. **New CMR** clears the note for the next shipment but keeps the sender, the place and country of taking over,
   the country (Pays/Country) and the place of issue; the dates are set to today.

Boxes 22–24 (signatures, stamps, goods received), the arrival and departure times and the non-contractual part are
left empty for writing by hand. The form is printed at 97.5% of its size, centred, so nothing falls into the edge
of the paper that printers cannot print.

Everything stays in the browser on this device (it is saved after every change); nothing is sent anywhere. After
the first start it also works offline and can be installed like the other tools.

## The form

`template/iru-cmr-2007.svg` is IRU's blank model, downloaded from
https://www.iru.org/sites/default/files/2017-01/iru-cmr-model-2007-en-fr.pdf (IRU's CMR FAQ: "This model may be
downloaded from the IRU web site"; the copyright stays with IRU, and the form is used unchanged apart from the
sample number and the copy heading, which the app prints per copy). `template/make_template.py` rebuilds it from the
PDF: it removes the sample number "No 24382" and the copy-1 heading, and makes the red of the form `currentColor` so
each copy can be printed in its own colour.

## Development

Plain HTML/CSS/JavaScript, no build step: `js/sheet.js` places the data on the form (positions in pt, measured from
IRU's PDF), `js/texts.js` holds the copy names and colours, `js/app.js` runs the form. Run locally from the
repository root with `python -m http.server 8123`, then open http://localhost:8123/cmr/. Bump `CACHE` in `sw.js` when
releasing a change so installed copies update.
