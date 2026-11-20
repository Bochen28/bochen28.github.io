# Rebuild: pdftocairo -svg iru-cmr-model-2007-en-fr.pdf model.svg && python3 make_template.py model.svg iru-cmr-2007.svg
# Source: https://www.iru.org/sites/default/files/2017-01/iru-cmr-model-2007-en-fr.pdf
"""Turns IRU's blank CMR model (PDF converted with pdftocairo -svg) into the print template:
removes the sample number and the copy-1 heading (they are drawn per copy by the app), makes the
form colour `currentColor` so each copy can be printed in its own colour, and wraps the drawing
in a <symbol> the pages reuse."""
import re, sys
import xml.etree.ElementTree as ET

src, dst = sys.argv[1], sys.argv[2]
SVG = "http://www.w3.org/2000/svg"; XL = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG); ET.register_namespace("xlink", XL)
tree = ET.parse(src); root = tree.getroot()
RED = "rgb(92.941284%, 10.980225%, 14.117432%)"

def remove_region(x, y):
    if y < 39 and x < 125: return "copy heading"        # big "1", Exemplaire de l'expéditeur / Copy for sender
    if y < 36 and x > 520: return "sample number top"   # No 24382
    if y > 832 and x < 100: return "sample number bottom"
    return None

parents = {c: p for p in root.iter() for c in p}
def transformed(el):
    while el in parents:
        el = parents[el]
        if el.get("transform"): return True
    return False

removed = {}
for use in list(root.iter(f"{{{SVG}}}use")):
    x, y = use.get("x"), use.get("y")
    if x is None or transformed(use): continue
    why = remove_region(float(x), float(y))
    if why:
        parents[use].remove(use); removed[why] = removed.get(why, 0) + 1
# White page background: the sheet is white already.
for path in list(root.iter(f"{{{SVG}}}path")):
    if path.get("fill") == "rgb(100%, 100%, 100%)":
        parents[path].remove(path); removed["background"] = 1
print("removed:", removed, file=sys.stderr)

defs = root.find(f"{{{SVG}}}defs")
body = [c for c in root if c is not defs]
text_defs = ET.tostring(defs, encoding="unicode")
text_body = "".join(ET.tostring(c, encoding="unicode") for c in body)
out = (f'<svg xmlns="{SVG}" xmlns:xlink="{XL}" width="0" height="0" style="position:absolute">'
       f'{text_defs}<symbol id="cmr-iru-2007" viewBox="0 0 595.22 842">{text_body}</symbol></svg>')
out = re.sub(r'\s*xmlns(:\w+)?="[^"]*"', "", out, count=0)  # namespaces re-added on the root below
out = out.replace("<svg ", f'<svg xmlns="{SVG}" xmlns:xlink="{XL}" ', 1)
out = out.replace(RED, "currentColor")
out = out.replace('id="glyph-', 'id="cmrt-glyph-').replace('#glyph-', '#cmrt-glyph-')
out = re.sub(r'id="clip-(\d+)"', r'id="cmrt-clip-\1"', out).replace("url(#clip-", "url(#cmrt-clip-")
# Path and glyph coordinates to 0.01 pt (plenty for print); transforms stay exact.
round2 = lambda m: re.sub(r"(\d+\.\d{2})\d+", r"\1", m.group(0))
out = re.sub(r' (d|x|y)="[^"]*"', round2, out)
out = re.sub(r"\s*(fill|stroke)-opacity=\"1\"", "", out)
out = out.replace("ns0:", "").replace("ns1:", "")
open(dst, "w").write("<!-- Blank CMR consignment note: IRU CMR Model 2007, (c) IRU, downloaded from iru.org. -->\n" + out + "\n")
