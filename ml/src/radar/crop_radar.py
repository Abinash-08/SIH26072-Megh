from pathlib import Path
from PIL import Image


RAW_DIR = Path("data/raw/radar/current")

OUT_DIR = Path("data/processed/radar/frames")
OUT_DIR.mkdir(parents=True, exist_ok=True)


print("\n========== RADAR SPATIAL CROP ==========\n")


files = sorted(RAW_DIR.glob("*.gif"))

if not files:
    print("[ERROR] No radar GIF files found.")
    raise SystemExit(1)


for input_file in files:

    print("Processing:", input_file.name)

    image = Image.open(input_file).convert("RGB")

    width, height = image.size

    print("Original:", width, "x", height)

    # --------------------------------------------------------
    # Radar/map region identified from diagnostic inspection
    # --------------------------------------------------------

    crop = image.crop(
        (0, 0, 720, 720)
    )

    output_file = OUT_DIR / (
        input_file.stem + "_radar.png"
    )

    crop.save(output_file)

    print(
        "[OK]",
        input_file.name,
        "->",
        output_file.name
    )

    print(
        "Output size:",
        crop.size
    )

    print()


print("========== COMPLETE ==========\n")