from pathlib import Path

import numpy as np
from PIL import Image


# ============================================================
# PATHS
# ============================================================

FRAME_DIR = Path("data/processed/radar/frames")
DBZ_DIR = Path("data/processed/radar/reflectivity")
OUT_DIR = Path("data/processed/radar/validation")

OUT_DIR.mkdir(parents=True, exist_ok=True)


print("\n========== RADAR MASK VALIDATION ==========\n")


# ============================================================
# FIND RADAR FRAMES
# ============================================================

files = sorted(FRAME_DIR.glob("*_radar.png"))

if not files:
    print("[ERROR] No cropped radar frames found.")
    raise SystemExit(1)


for frame_file in files:

    print("----------------------------------------")
    print("Frame:", frame_file.name)

    # --------------------------------------------------------
    # Load original cropped radar image
    # --------------------------------------------------------

    image = Image.open(frame_file).convert("RGB")
    rgb = np.asarray(image)

    # --------------------------------------------------------
    # Corresponding dBZ file
    # --------------------------------------------------------

    dbz_file = DBZ_DIR / (
        frame_file.stem + ".npy"
    )

    if not dbz_file.exists():
        print("[ERROR] Missing:", dbz_file)
        continue

    dbz = np.load(dbz_file)

    if dbz.shape != rgb.shape[:2]:
        print(
            "[ERROR] Shape mismatch:",
            rgb.shape[:2],
            dbz.shape
        )
        continue

    valid = np.isfinite(dbz)

    print(
        "Image shape:",
        rgb.shape
    )

    print(
        "Valid pixels:",
        int(valid.sum())
    )

    # --------------------------------------------------------
    # Create overlay
    #
    # Keep the original image visible.
    # Mark extracted reflectivity pixels in WHITE.
    # --------------------------------------------------------

    overlay = rgb.copy()

    overlay[valid] = [255, 255, 255]

    output_file = OUT_DIR / (
        frame_file.stem + "_mask_overlay.png"
    )

    Image.fromarray(overlay).save(output_file)

    print(
        "[OK] Saved:",
        output_file
    )

    # --------------------------------------------------------
    # Create binary mask
    # --------------------------------------------------------

    mask = np.zeros(
        dbz.shape,
        dtype=np.uint8
    )

    mask[valid] = 255

    mask_file = OUT_DIR / (
        frame_file.stem + "_mask.png"
    )

    Image.fromarray(mask).save(mask_file)

    print(
        "[OK] Mask:",
        mask_file
    )


print("\n========== COMPLETE ==========\n")