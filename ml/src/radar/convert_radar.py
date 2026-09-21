from pathlib import Path
from PIL import Image


INPUT_DIR = Path(
    "data/raw/radar/current"
)

OUTPUT_DIR = Path(
    "data/processed/radar/frames"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print(
    "\n========== RADAR CONVERSION ==========\n"
)


for file in sorted(INPUT_DIR.glob("*.gif")):

    image = Image.open(file)

    output = (
        OUTPUT_DIR /
        f"{file.stem}.png"
    )

    image.convert("RGBA").save(
        output
    )

    print(
        f"[OK] {file.name} → {output.name}"
    )


print(
    "\n========== COMPLETE ==========\n"
)