import numpy as np
from PIL import Image
import os


# ============================================================
# LOAD RADAR-DERIVED VIL
# ============================================================

vil = np.load(
    "processed/vil_2018_09_07_06_42_36.npy"
)

print("Original shape:", vil.shape)


# ============================================================
# CROP RADAR REGION
#
# X: 33 → 306
# Y: 141 → 414
#
# 274 × 274 square
# ============================================================

x_min = 33
x_max = 307

y_min = 141
y_max = 415

crop = vil[
    y_min:y_max,
    x_min:x_max
]


print("Crop shape:", crop.shape)
print("Crop max:", float(crop.max()))
print("Crop non-zero:", int(np.count_nonzero(crop)))


# ============================================================
# RESIZE TO MODEL SIZE
# ============================================================

crop_uint16 = (
    np.clip(crop, 0, None) * 1000
).astype(np.uint16)


image = Image.fromarray(
    crop_uint16
)

image = image.resize(
    (48, 48),
    Image.Resampling.BILINEAR
)

vil_48 = (
    np.asarray(image).astype(np.float32)
    / 1000.0
)


# ============================================================
# SAVE
# ============================================================

os.makedirs(
    "processed",
    exist_ok=True
)

output_file = (
    "processed/"
    "vil_2018_09_07_06_42_36_48x48.npy"
)

np.save(
    output_file,
    vil_48
)


print()
print("48×48 VIL")
print("---------")
print("Shape:", vil_48.shape)
print("Min:", float(vil_48.min()))
print("Max:", float(vil_48.max()))
print("Mean:", float(vil_48.mean()))
print(
    "Non-zero:",
    int(np.count_nonzero(vil_48))
)

print()
print("Saved:", output_file)