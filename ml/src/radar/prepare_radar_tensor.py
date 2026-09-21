from pathlib import Path

import numpy as np
from PIL import Image


# ============================================================
# DIRECTORIES
# ============================================================

INPUT_DIR = Path("data/processed/radar/reflectivity")

OUTPUT_DIR = Path("data/processed/radar/tensors")

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


TARGET_SIZE = (128, 128)


print("\n========== RADAR TENSOR PREPARATION ==========\n")

print("Input:")
print(INPUT_DIR)

print("\nOutput:")
print(OUTPUT_DIR)

print("\nTarget size:")
print(TARGET_SIZE)


files = sorted(
    INPUT_DIR.glob("*_radar.npy")
)


if not files:

    print("\n[ERROR] No radar fields found.")

    raise SystemExit(1)


print("\nRadar fields found:", len(files))


# ============================================================
# PROCESS EACH FIELD
# ============================================================

for file in files:

    print("\n----------------------------------------")
    print("Processing:", file.name)

    dbz = np.load(file).astype(np.float32)

    print("Original shape:", dbz.shape)

    valid = np.isfinite(dbz)

    if not valid.any():

        print("[WARNING] No valid radar pixels.")
        continue


    # --------------------------------------------------------
    # Replace missing/background with minimum reflectivity
    # --------------------------------------------------------

    # 24 dBZ is the minimum detected echo in our extraction.
    # Missing pixels are therefore treated as no detected echo.
    fill_value = 24.0

    dbz_clean = np.where(
        valid,
        dbz,
        fill_value
    )


    # --------------------------------------------------------
    # Clip reflectivity
    # --------------------------------------------------------

    dbz_clean = np.clip(
        dbz_clean,
        20.0,
        60.0
    )


    # --------------------------------------------------------
    # Normalize to 0–1
    # --------------------------------------------------------

    normalized = (
        dbz_clean - 20.0
    ) / 40.0

    normalized = np.clip(
        normalized,
        0.0,
        1.0
    )


    # --------------------------------------------------------
    # Resize
    # --------------------------------------------------------

    image = Image.fromarray(
        normalized.astype(np.float32),
        mode="F"
    )

    image = image.resize(
        TARGET_SIZE,
        resample=Image.Resampling.BILINEAR
    )

    tensor = np.array(
        image,
        dtype=np.float32
    )


    # --------------------------------------------------------
    # Add channel dimension
    # --------------------------------------------------------

    tensor = tensor[..., np.newaxis]


    print("Tensor shape:", tensor.shape)

    print(
        "Tensor min:",
        float(tensor.min())
    )

    print(
        "Tensor max:",
        float(tensor.max())
    )

    print(
        "Tensor mean:",
        float(tensor.mean())
    )


    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_name = (
        file.stem + "_128x128.npy"
    )

    output_file = OUTPUT_DIR / output_name

    np.save(
        output_file,
        tensor
    )

    print("[OK] Saved:", output_file)


print("\n========== COMPLETE ==========\n")