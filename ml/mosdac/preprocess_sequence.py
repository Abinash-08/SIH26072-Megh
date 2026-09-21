import xarray as xr
import numpy as np
from PIL import Image
import os


# ============================================================
# FOUR MOSDAC RADAR FRAMES
# ============================================================

files = [
    "raw/v2_2018_09_07_06_42_36_dprf_corrected.nc",
    "raw/v2_2018_09_07_06_57_38_dprf_corrected.nc",
    "raw/v2_2018_09_07_07_12_57_dprf_corrected.nc",
    "raw/v2_2018_09_07_07_28_16_dprf_corrected.nc",
]


# ============================================================
# FIXED SPATIAL WINDOW
#
# Same window for every frame.
# This is important because the model needs spatially
# consistent frames.
# ============================================================

x_min = 33
x_max = 307

y_min = 141
y_max = 415


# ============================================================
# OUTPUT
# ============================================================

os.makedirs("processed/sequence", exist_ok=True)

sequence = []


# ============================================================
# PROCESS EACH RADAR FILE
# ============================================================

for index, file_path in enumerate(files):

    print()
    print("=" * 60)
    print(f"FRAME {index + 1}")
    print("=" * 60)

    print("File:", file_path)


    # --------------------------------------------------------
    # LOAD NETCDF
    # --------------------------------------------------------

    ds = xr.open_dataset(file_path)

    dbz = (
        ds["DBZ"]
        .isel(time=0)
        .values
        .astype(np.float32)
    )

    heights = ds["height"].values.astype(
        np.float32
    )


    # --------------------------------------------------------
    # RADAR REFLECTIVITY → LINEAR Z
    # --------------------------------------------------------

    valid = np.isfinite(dbz)

    Z = np.zeros_like(
        dbz,
        dtype=np.float32
    )

    Z[valid] = (
        10.0 ** (dbz[valid] / 10.0)
    )


    # --------------------------------------------------------
    # RADAR-DERIVED VIL
    # --------------------------------------------------------

    vil_integrand = np.zeros_like(
        Z,
        dtype=np.float32
    )

    vil_integrand[valid] = (
        Z[valid] ** (4.0 / 7.0)
    )


    vil = (
        3.44e-6
        * np.trapezoid(
            vil_integrand,
            x=heights,
            axis=0
        )
    )


    vil = np.nan_to_num(
        vil,
        nan=0.0,
        posinf=0.0,
        neginf=0.0
    ).astype(np.float32)


    # --------------------------------------------------------
    # FIXED CROP
    # --------------------------------------------------------

    crop = vil[
        y_min:y_max,
        x_min:x_max
    ]


    # --------------------------------------------------------
    # RESIZE TO 48 × 48
    # --------------------------------------------------------

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


    frame = (
        np.asarray(image).astype(
            np.float32
        ) / 1000.0
    )


    # --------------------------------------------------------
    # STORE
    # --------------------------------------------------------

    sequence.append(frame)


    # --------------------------------------------------------
    # SAVE INDIVIDUAL FRAME
    # --------------------------------------------------------

    timestamp = (
        os.path.basename(file_path)
        .replace(
            "v2_",
            ""
        )
        .replace(
            "_dprf_corrected.nc",
            ""
        )
    )

    output_file = (
        f"processed/sequence/"
        f"vil_{timestamp}_48x48.npy"
    )

    np.save(
        output_file,
        frame
    )


    print("Timestamp:", timestamp)
    print("Original DBZ shape:", dbz.shape)
    print(
        "Valid DBZ:",
        int(np.isfinite(dbz).sum())
    )
    print("VIL max:", float(vil.max()))
    print("48×48 max:", float(frame.max()))
    print("48×48 mean:", float(frame.mean()))
    print(
        "48×48 non-zero:",
        int(np.count_nonzero(frame))
    )

    ds.close()


# ============================================================
# CREATE 4-FRAME SEQUENCE
# ============================================================

sequence = np.stack(
    sequence,
    axis=0
).astype(np.float32)


print()
print("=" * 60)
print("FINAL SEQUENCE")
print("=" * 60)

print("Shape:", sequence.shape)
print("Min:", float(sequence.min()))
print("Max:", float(sequence.max()))
print("Mean:", float(sequence.mean()))
print(
    "Non-zero:",
    int(np.count_nonzero(sequence))
)


# ============================================================
# SAVE SEQUENCE
# ============================================================

sequence_file = (
    "processed/"
    "mosdac_sequence_4frames_48x48.npy"
)

np.save(
    sequence_file,
    sequence
)

print()
print("Saved:")
print(sequence_file)