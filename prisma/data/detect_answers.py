"""Read correct answers from solution images: green crossed boxes in a 5-column grid (А–Д)."""
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage

LET = ["А", "Б", "В", "Г", "Д"]


def components(mask, min_px):
    lab, n = ndimage.label(mask)
    out = []
    for sl in ndimage.find_objects(lab):
        h = sl[0].stop - sl[0].start
        w = sl[1].stop - sl[1].start
        if h * w >= min_px:
            out.append((sl[1].start, sl[0].start, w, h))
    return out


def detect(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g > 140) & (r < 150) & (b < 150) & (g - r > 50)
    gray = (abs(r - g) < 12) & (abs(g - b) < 12) & (r > 170) & (r < 235)
    H, W = r.shape
    scale = W / 354.0
    gboxes = [c for c in components(ndimage.binary_dilation(green, iterations=2), int(150 * scale * scale)) if 0.6 < c[2] / max(c[3], 1) < 1.6]
    if not gboxes:
        return None
    side = np.median([c[3] for c in gboxes])
    allboxes = gboxes + [c for c in components(ndimage.binary_dilation(gray, iterations=1), int(0.4 * side * side))
                         if abs(c[2] - side) < side * 0.35 and abs(c[3] - side) < side * 0.35]
    # rows
    rows = []
    for c in sorted(allboxes, key=lambda c: c[1]):
        cy = c[1] + c[3] / 2
        for row in rows:
            if abs(row["y"] - cy) < side * 0.5:
                row["boxes"].append(c); break
        else:
            rows.append({"y": cy, "boxes": [c]})
    res = []
    for row in rows:
        xs = sorted(set(round(c[0] + c[2] / 2) for c in row["boxes"]))
        # merge near-duplicates
        cols = []
        for x in xs:
            if not cols or x - cols[-1] > side * 0.5:
                cols.append(x)
        gin = [c for c in gboxes if abs(c[1] + c[3] / 2 - row["y"]) < side * 0.5]
        if not gin:
            continue
        gx = gin[0][0] + gin[0][2] / 2
        idx = min(range(len(cols)), key=lambda i: abs(cols[i] - gx))
        res.append({"ncols": len(cols), "idx": idx, "letter": LET[idx] if idx < 5 else "?"})
    return res


if __name__ == "__main__":
    root = sys.argv[1]
    out = {}
    for d in ["sections", "previousNMT", "quick_test"]:
        sd = os.path.join(root, d, "solutions")
        for f in sorted(os.listdir(sd)):
            out[f"{d}/{f}"] = detect(os.path.join(sd, f))
    json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
    from collections import Counter
    kinds = Counter()
    for k, v in out.items():
        if v is None:
            kinds["none"] += 1
        else:
            kinds[(len(v), tuple(x["ncols"] for x in v))] += 1
    print(kinds)
