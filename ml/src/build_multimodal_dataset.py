from pathlib import Path
import json

import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

A2_DATASET = Path(
    "reports/validated_sounding_dataset.csv"
)

RADAR_INDEX = Path(
    "data/processed/radar/radar_observation_index.csv"
)

SEQUENCE_MANIFEST = Path(
    "data/processed/radar/sequences/sequence_manifest.csv"
)

OUTPUT_DIR = Path(
    "data/processed/multimodal"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# CONFIGURATION
# ============================================================

A2_FEATURES = [
    "K_INDEX",
    "TOTAL_TOTALS",
    "LIFTED_INDEX",
    "SHOWALTER_INDEX",
    "SWEAT",
    "MIXR_MU",
    "CAPE_MU",
    "CIN_MU",
    "LCL_MU",
    "LFC_MU",
    "WMAXSHR_MU"
]

SEQUENCE_LENGTH = 5

RADAR_SHAPE = (
    128,
    128,
    1
)


print(
    "\n========== MULTIMODAL DATASET CHECK ==========\n"
)


# ============================================================
# A2 DATA
# ============================================================

if not A2_DATASET.exists():

    print("[ERROR] A2 dataset not found:")
    print(A2_DATASET)

    raise SystemExit(1)


df = pd.read_csv(
    A2_DATASET
)


print("A2 dataset shape:", df.shape)


missing_features = [
    f for f in A2_FEATURES
    if f not in df.columns
]


if missing_features:

    print(
        "\n[ERROR] Missing A2 features:"
    )

    print(missing_features)

    raise SystemExit(1)


if "THUNDERSTORM" not in df.columns:

    print(
        "\n[ERROR] THUNDERSTORM label missing."
    )

    raise SystemExit(1)


a2_valid = (
    ~df[A2_FEATURES]
    .isna()
    .all(axis=1)
)


a2_df = df.loc[
    a2_valid
].copy()


print(
    "Usable A2 observations:",
    len(a2_df)
)


print(
    "\nA2 class distribution:"
)

print(
    a2_df["THUNDERSTORM"].value_counts()
)


# ============================================================
# RADAR INDEX
# ============================================================

if not RADAR_INDEX.exists():

    print(
        "\n[ERROR] Radar index not found:"
    )

    print(RADAR_INDEX)

    raise SystemExit(1)


radar = pd.read_csv(
    RADAR_INDEX
)


radar["timestamp"] = pd.to_datetime(
    radar["timestamp"],
    utc=True
)


print(
    "\nRadar tensor files:",
    len(radar)
)


print(
    "Radar timestamps:",
    radar["timestamp"].nunique()
)


# ============================================================
# TEMPORAL SEQUENCES
# ============================================================

if not SEQUENCE_MANIFEST.exists():

    print(
        "\n[INFO] No radar sequence manifest exists."
    )

    print(
        "This is expected until at least",
        SEQUENCE_LENGTH,
        "different radar timestamps are available."
    )

    sequences = 0

else:

    manifest = pd.read_csv(
        SEQUENCE_MANIFEST
    )

    sequences = len(manifest)


print(
    "Available radar sequences:",
    sequences
)


# ============================================================
# READINESS
# ============================================================

print(
    "\n========== DATASET READINESS ==========\n"
)


a2_ready = len(a2_df) > 0

radar_ready = sequences > 0


print(
    "A2 branch:",
    "READY" if a2_ready else "NOT READY"
)


print(
    "Radar temporal branch:",
    "READY" if radar_ready else "NOT READY"
)


if a2_ready and radar_ready:

    print(
        "\n[OK] Multimodal training dataset "
        "can be constructed."
    )

else:

    print(
        "\n[WAIT] Multimodal training dataset "
        "cannot be constructed yet."
    )


# ============================================================
# SAVE STATUS
# ============================================================

status = {

    "a2_observations": int(
        len(a2_df)
    ),

    "a2_features": len(
        A2_FEATURES
    ),

    "radar_tensor_files": int(
        len(radar)
    ),

    "radar_unique_timestamps": int(
        radar["timestamp"].nunique()
    ),

    "radar_sequences": int(
        sequences
    ),

    "sequence_length": SEQUENCE_LENGTH,

    "radar_shape": RADAR_SHAPE,

    "a2_ready": bool(
        a2_ready
    ),

    "radar_ready": bool(
        radar_ready
    ),

    "training_ready": bool(
        a2_ready and radar_ready
    )
}


status_file = (
    OUTPUT_DIR /
    "dataset_readiness.json"
)


with open(
    status_file,
    "w"
) as f:

    json.dump(
        status,
        f,
        indent=4
    )


print(
    "\nSaved:"
)

print(
    status_file
)


print(
    "\n========== COMPLETE ==========\n"
)