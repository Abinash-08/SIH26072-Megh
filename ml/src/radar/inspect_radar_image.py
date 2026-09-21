from pathlib import Path

from PIL import Image


RADAR_DIR = Path(
    "data/raw/radar"
)


print(
    "\n========== MEGHDRISHTI RADAR IMAGE INSPECTION ==========\n"
)


files = sorted(
    [
        p
        for p in RADAR_DIR.iterdir()
        if p.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]
    ]
)


print(
    "Radar images found:",
    len(files)
)


for file in files:

    try:

        image = Image.open(file)

        print(
            f"\n{file.name}"
        )

        print(
            "Size:",
            image.size
        )

        print(
            "Mode:",
            image.mode
        )

        print(
            "Format:",
            image.format
        )

    except Exception as exc:

        print(
            f"[ERROR] {file.name}: {exc}"
        )


print(
    "\n========== COMPLETE ==========\n"
)