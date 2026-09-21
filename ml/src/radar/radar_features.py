from pathlib import Path

import numpy as np
import pandas as pd


TENSOR_DIR = Path(
    "data/processed/radar/tensors"
)

OUTPUT_DIR = Path(
    "data/processed/radar/features"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print("\n========== RADAR FEATURE EXTRACTION ==========\n")


files = sorted(
    TENSOR_DIR.glob("*_radar_128x128.npy")
)


if not files:
    print("[ERROR] No radar tensors found.")
    raise SystemExit(1)


records = []


for file in files:

    print("----------------------------------------")
    print("File:", file.name)

    tensor = np.load(file)

    if tensor.ndim != 3:
        print("[ERROR] Unexpected tensor shape:", tensor.shape)
        continue

    field = tensor[:, :, 0]

    # Convert normalized value back to approximate dBZ
    dbz = field * 40.0 + 20.0

    # Current tensor uses 24 dBZ as the no-echo fill value.
    echo_mask = dbz > 24.0

    values = dbz[echo_mask]

    if values.size == 0:
        print("[WARNING] No detected echo pixels.")
        continue

    # --------------------------------------------------------
    # Timestamp
    # --------------------------------------------------------

    timestamp = file.name.split("_radar_")[0]

    # --------------------------------------------------------
    # Product
    # --------------------------------------------------------

    name_lower = file.name.lower()

    if "max_z" in name_lower:
        product = "MAX_Z"

    elif "ppi_z" in name_lower:
        product = "PPI_Z"

    else:
        product = "UNKNOWN"

    # --------------------------------------------------------
    # Radar statistics
    # --------------------------------------------------------

    max_dbz = float(values.max())

    mean_dbz = float(values.mean())

    median_dbz = float(np.median(values))

    p90_dbz = float(np.percentile(values, 90))

    p95_dbz = float(np.percentile(values, 95))

    p99_dbz = float(np.percentile(values, 99))

    echo_pixels = int(echo_mask.sum())

    total_pixels = int(dbz.size)

    echo_fraction = (
        echo_pixels / total_pixels
    )

    # --------------------------------------------------------
    # Threshold fractions
    # --------------------------------------------------------

    fraction_30 = float(
        np.mean(values >= 30.0)
    )

    fraction_35 = float(
        np.mean(values >= 35.0)
    )

    fraction_40 = float(
        np.mean(values >= 40.0)
    )

    fraction_45 = float(
        np.mean(values >= 45.0)
    )

    record = {

        "timestamp": timestamp,

        "product": product,

        "max_dbz": max_dbz,

        "mean_dbz": mean_dbz,

        "median_dbz": median_dbz,

        "p90_dbz": p90_dbz,

        "p95_dbz": p95_dbz,

        "p99_dbz": p99_dbz,

        "echo_pixels": echo_pixels,

        "total_pixels": total_pixels,

        "echo_fraction": echo_fraction,

        "fraction_ge_30": fraction_30,

        "fraction_ge_35": fraction_35,

        "fraction_ge_40": fraction_40,

        "fraction_ge_45": fraction_45,
    }

    records.append(record)

    print("Product:", product)
    print("Max dBZ:", max_dbz)
    print("Mean dBZ:", mean_dbz)
    print("Median dBZ:", median_dbz)
    print("P90 dBZ:", p90_dbz)
    print("P95 dBZ:", p95_dbz)
    print("P99 dBZ:", p99_dbz)
    print("Echo pixels:", echo_pixels)
    print("Echo fraction:", echo_fraction)
    print(">=30 dBZ:", fraction_30)
    print(">=35 dBZ:", fraction_35)
    print(">=40 dBZ:", fraction_40)
    print(">=45 dBZ:", fraction_45)


# ============================================================
# SAVE
# ============================================================

df = pd.DataFrame(records)

output = OUTPUT_DIR / "radar_features.csv"

df.to_csv(
    output,
    index=False
)


print("\n========== SUMMARY ==========\n")

print(df.to_string(index=False))

print("\nSaved:")
print(output)

print("\n========== COMPLETE ==========\n")