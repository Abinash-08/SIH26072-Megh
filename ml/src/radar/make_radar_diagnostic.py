from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


INPUT = Path(
    "data/raw/radar/current/paradip_ppi_z_20260901T080415Z.gif"
)

OUTPUT = Path(
    "data/processed/radar/frames/"
    "paradip_ppi_z_diagnostic.png"
)


print(
    "\n========== RADAR DIAGNOSTIC ==========\n"
)


if not INPUT.exists():

    print("[ERROR] Radar image not found:")
    print(INPUT)
    raise SystemExit(1)


image = Image.open(INPUT).convert("RGB")

width, height = image.size

print("Image size:", image.size)


draw = ImageDraw.Draw(image)


# ------------------------------------------------------------
# Draw 40-pixel grid
# ------------------------------------------------------------

for x in range(0, width, 40):

    draw.line(
        [(x, 0), (x, height)],
        fill=(255, 0, 0),
        width=1
    )

    draw.text(
        (x + 2, 5),
        str(x),
        fill=(255, 0, 0)
    )


for y in range(0, height, 40):

    draw.line(
        [(0, y), (width, y)],
        fill=(255, 0, 0),
        width=1
    )

    draw.text(
        (5, y + 2),
        str(y),
        fill=(255, 0, 0)
    )


# ------------------------------------------------------------
# Add center marker
# ------------------------------------------------------------

cx = width // 2
cy = height // 2

draw.line(
    [(cx - 15, cy), (cx + 15, cy)],
    fill=(255, 255, 0),
    width=3
)

draw.line(
    [(cx, cy - 15), (cx, cy + 15)],
    fill=(255, 255, 0),
    width=3
)


# ------------------------------------------------------------
# Save
# ------------------------------------------------------------

OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True
)

image.save(
    OUTPUT
)

print(
    "\nDiagnostic saved:"
)

print(OUTPUT)

print(
    "\n========== COMPLETE ==========\n"
)