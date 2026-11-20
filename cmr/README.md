# CMR Form

Fill in the CMR international consignment note and print it on A4, in as many copies as you need.

**Open:** https://bochen28.github.io/cmr/

## How it works

1. Fill in the boxes. Each field shows the box number of the printed note (1 Sender, 2 Consignee …). Goods
   (boxes 6–12) can have several lines; packages, weight and volume are totalled on the note.
2. The preview on the right (on phones: below the form) shows the A4 page exactly as it prints. Text that is too
   long for its box is printed smaller so it always fits.
3. Choose the number of **Copies** (1–10) and tap **Print**. Every copy gets its own page with its name and
   colour: **1 Copy for sender** (red), **2 Copy for consignee** (blue), **3 Copy for carrier** (green), then
   **Additional copy** (grey). In the print dialog keep the scale at 100%, or choose **Save as PDF**.
4. **Print blank forms** prints the empty note, to fill in by hand.
5. **New CMR** clears the note for the next shipment but keeps the sender, the place of taking over and the place
   of issue; the dates are set to today.

The printed labels are in up to three languages: pick the main one under **Printed in** (English, Polish, German or
French) and up to two more. Boxes 22–24 (signatures, stamps, goods received) are left empty for signing by hand.

Everything stays in the browser on this device (it is saved after every change); nothing is sent anywhere. After
the first start it also works offline and can be installed like the other tools.

## Development

Plain HTML/CSS/JavaScript, no build step: `js/texts.js` holds the printed texts in every language, `js/sheet.js`
builds the A4 page, `js/app.js` runs the form. Run locally from the repository root with
`python -m http.server 8123`, then open http://localhost:8123/cmr/. Bump `CACHE` in `sw.js` when releasing a
change so installed copies update.
