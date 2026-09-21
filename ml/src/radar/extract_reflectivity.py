from pathlib import Path
import numpy as np
from PIL import Image


# ============================================================
# PATHS
# ============================================================

INPUT_DIR = Path("data/processed/radar/frames")
OUTPUT_DIR = Path("data/processed/radar/reflectivity")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


print("\n========== RADAR REFLECTIVITY EXTRACTION ==========\n")


# ============================================================
# IMD PARADIP REFLECTIVITY PALETTE
#
# Extracted from the actual IMD radar legend.
#
# Each colour represents one reflectivity interval.
# We use the midpoint of each interval as the numerical value.
# ============================================================

PALETTE = {
    (203, 0, 0): 60.0,          # > 60.0 dBZ
    (240, 0, 0): 58.65,         # 57.3 - 60.0
    (255, 63, 0): 55.999,       # 54.7 - 57.3
    (255, 115, 0): 53.35,       # 52.0 - 54.7
    (255, 187, 0): 50.65,       # 49.3 - 52.0
    (255, 230, 0): 48.0,        # 46.7 - 49.3
    (255, 248, 193): 45.35,     # 44.0 - 46.7

    # 41.3 - 44.0
    # The corresponding swatch is not present as an exact
    # colour in the extracted legend, so it is intentionally
    # NOT guessed.

    (179, 241, 255): 40.0,      # 38.7 - 41.3
    (83, 209, 255): 37.35,      # 36.0 - 38.7
    (26, 163, 255): 34.65,      # 33.3 - 36.0
    (0, 121, 255): 32.0,        # 30.7 - 33.3
    (5, 48, 245): 29.35,        # 28.0 - 30.7
    (28, 5, 191): 26.65,        # 25.3 - 28.0
    (26, 0, 125): 24.0,         # 22.7 - 25.3
}


# ============================================================
# PROCESS FILES
# ============================================================

files = sorted(INPUT_DIR.glob("*_radar.png"))

if not files:
    print("[ERROR] No processed radar PNG files found.")
    print("Expected directory:")
    print(INPUT_DIR)
    raise SystemExit(1)


for input_file in files:

    print("----------------------------------------")
    print("File:", input_file.name)

    image = Image.open(input_file).convert("RGB")

    rgb = np.asarray(image)

    height, width, _ = rgb.shape

    print("Image shape:", rgb.shape)

    # --------------------------------------------------------
    # Numerical output
    #
    # NaN = no usable radar reflectivity colour
    # --------------------------------------------------------

    reflectivity = np.full(
        (height, width),
        np.nan,
        dtype=np.float32
    )

    # --------------------------------------------------------
    # Exact colour matching
    # --------------------------------------------------------

    for colour, dbz in PALETTE.items():

        mask = np.all(
            rgb == np.array(colour, dtype=np.uint8),
            axis=2
        )

        reflectivity[mask] = dbz

    # --------------------------------------------------------
    # Statistics
    # --------------------------------------------------------

    valid = np.isfinite(reflectivity)

    valid_pixels = int(valid.sum())
    total_pixels = reflectivity.size

    coverage = (
        100.0 * valid_pixels / total_pixels
        if total_pixels > 0
        else 0.0
    )

    print("Valid radar pixels:", valid_pixels)
    print("Total pixels:", total_pixels)
    print("Radar coverage: %.2f%%" % coverage)

    if valid_pixels > 0:

        print(
            "Minimum dBZ:",
            float(np.nanmin(reflectivity))
        )

        print(
            "Maximum dBZ:",
            float(np.nanmax(reflectivity))
        )

        print(
            "Mean dBZ:",
            float(np.nanmean(reflectivity))
        )

    # --------------------------------------------------------
    # Save numerical radar field
    # --------------------------------------------------------

    output_npy = (
        OUTPUT_DIR /
        (input_file.stem + ".npy")
    )

    np.save(
        output_npy,
        reflectivity
    )

    print(
        "[OK] Saved:",
        output_npy
    )

    # --------------------------------------------------------
    # Diagnostic preview
    #
    # Valid pixels are scaled 20-60 dBZ -> 0-255.
    # Invalid pixels remain black.
    # --------------------------------------------------------

    preview = np.zeros(
        (height, width),
        dtype=np.uint8
    )

    if valid_pixels > 0:

        clipped = np.clip(
            reflectivity[valid],
            20.0,
            60.0
        )

        scaled = (
            (clipped - 20.0) /
            40.0 *
            255.0
        )

        preview[valid] = scaled.astype(
            np.uint8
        )

    output_preview = (
        OUTPUT_DIR /
        (input_file.stem + "_preview.png")
    )

    Image.fromarray(
        preview,
        mode="L"
    ).save(output_preview)

    print(
        "[OK] Diagnostic:",
        output_preview
    )


print("\n========== COMPLETE ==========\n")