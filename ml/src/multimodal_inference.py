from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

MODEL_PATH = Path(
    "models/model_a2_logistic.joblib"
)

FEATURE_PATH = Path(
    "models/model_a2_features.json"
)

RADAR_FEATURE_PATH = Path(
    "data/processed/radar/features/radar_features.csv"
)

OUTPUT_DIR = Path(
    "reports"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print("\n========== MEGHDRISHTI MULTIMODAL INFERENCE ==========\n")


# ============================================================
# LOAD A2 MODEL
# ============================================================

if not MODEL_PATH.exists():

    print("[ERROR] A2 model not found:")
    print(MODEL_PATH)

    raise SystemExit(1)


if not FEATURE_PATH.exists():

    print("[ERROR] A2 feature list not found:")
    print(FEATURE_PATH)

    raise SystemExit(1)


model = joblib.load(MODEL_PATH)


with open(
    FEATURE_PATH,
    "r"
) as f:

    a2_features = json.load(f)


print("A2 model loaded.")

print(
    "Number of A2 features:",
    len(a2_features)
)


# ============================================================
# LOAD ORIGINAL SOUNDING DATA
# ============================================================

SOUNDING_PATH = Path(
    "reports/validated_sounding_dataset.csv"
)

if not SOUNDING_PATH.exists():

    print(
        "\n[ERROR] Missing:",
        SOUNDING_PATH
    )

    print(
        "Use the validated sounding dataset "
        "that was used for A2."
    )

    raise SystemExit(1)


df = pd.read_csv(
    SOUNDING_PATH
)


# ============================================================
# SELECT A VALID OBSERVATION
# ============================================================

available = (
    ~df[a2_features]
    .isna()
    .all(axis=1)
)


df_valid = df.loc[
    available
].copy()


if df_valid.empty:

    print(
        "[ERROR] No usable A2 sounding observation."
    )

    raise SystemExit(1)


# Use the most recent available observation
row = df_valid.iloc[-1]


X = row[
    a2_features
].to_frame().T


# ============================================================
# A2 PREDICTION
# ============================================================

a2_probability = float(
    model.predict_proba(X)[0, 1]
)


a2_prediction = int(
    a2_probability >= 0.5
)


print("\n========== A2 RESULT ==========\n")

print(
    "A2 probability:",
    f"{a2_probability * 100:.2f}%"
)

print(
    "A2 prediction:",
    "THUNDERSTORM"
    if a2_prediction
    else "NO THUNDERSTORM"
)


# ============================================================
# LOAD RADAR FEATURES
# ============================================================

if not RADAR_FEATURE_PATH.exists():

    print(
        "\n[ERROR] Radar feature file not found:"
    )

    print(RADAR_FEATURE_PATH)

    raise SystemExit(1)


radar = pd.read_csv(
    RADAR_FEATURE_PATH
)


print("\n========== RADAR RESULT ==========\n")

print(
    radar[
        [
            "product",
            "max_dbz",
            "mean_dbz",
            "p95_dbz",
            "p99_dbz",
            "echo_fraction",
            "fraction_ge_30",
            "fraction_ge_35",
            "fraction_ge_40"
        ]
    ].to_string(index=False)
)


# ============================================================
# BUILD MULTIMODAL FEATURE VECTOR
# ============================================================

multimodal = {
    "a2_probability": a2_probability,
    "a2_prediction": a2_prediction
}


for _, r in radar.iterrows():

    product = r["product"].lower()

    prefix = f"radar_{product}"

    multimodal[
        f"{prefix}_max_dbz"
    ] = r["max_dbz"]

    multimodal[
        f"{prefix}_mean_dbz"
    ] = r["mean_dbz"]

    multimodal[
        f"{prefix}_p95_dbz"
    ] = r["p95_dbz"]

    multimodal[
        f"{prefix}_p99_dbz"
    ] = r["p99_dbz"]

    multimodal[
        f"{prefix}_echo_fraction"
    ] = r["echo_fraction"]

    multimodal[
        f"{prefix}_ge30"
    ] = r["fraction_ge_30"]

    multimodal[
        f"{prefix}_ge35"
    ] = r["fraction_ge_35"]

    multimodal[
        f"{prefix}_ge40"
    ] = r["fraction_ge_40"]


fusion_df = pd.DataFrame(
    [multimodal]
)


# ============================================================
# SAVE
# ============================================================

output = (
    OUTPUT_DIR /
    "multimodal_current_observation.csv"
)


fusion_df.to_csv(
    output,
    index=False
)


print("\n========== MULTIMODAL VECTOR ==========\n")

print(
    fusion_df.to_string(index=False)
)


print("\nSaved:")
print(output)


print(
    "\n========== COMPLETE ==========\n"
)