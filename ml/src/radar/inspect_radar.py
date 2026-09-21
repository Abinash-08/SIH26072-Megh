from pathlib import Path
from PIL import Image


RADAR_DIR = Path(
    "data/raw/radar/current"
)


print(
    "\n========== RADAR IMAGE INSPECTION ==========\n"
)


files = sorted(
    RADAR_DIR.glob("*.gif")
)


if not files:
    print("[ERROR] No GIF radar files found.")
    raise SystemExit(1)


for file in files:

    print("\n----------------------------------------")
    print("File:", file.name)

    image = Image.open(file)

    print("Format:", image.format)
    print("Mode:", image.mode)
    print("Size:", image.size)
    print("Frames:", getattr(image, "n_frames", 1))

    print(
        "Info:",
        image.info
    )

    print(
        "Palette:",
        image.getpalette() is not None
    )

    print(
        "Transparency:",
        image.info.get("transparency")
    )


print(
    "\n========== COMPLETE ==========\n"
)