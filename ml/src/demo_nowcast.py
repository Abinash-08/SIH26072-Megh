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

DATASET_PATH = Path(
    "reports/validated_sounding_dataset.csv"
)

RADAR_FEATURES = Path(
    "data/processed/radar/features/radar_features.csv"
)

OUTPUT_PATH = Path(
    "reports/demo_nowcast_result.json"
)


print("\n========== MEGHDRISHTI DEMO NOWCAST ==========\n")


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load(MODEL_PATH)

with open(FEATURE_PATH, "r") as f:
    features = json.load(f)

print("A2 model loaded.")
print("A2 features:", len(features))


# ============================================================
# LOAD SOUNDING DATA
# ============================================================

df = pd.read_csv(DATASET_PATH)

valid = ~df[features].isna().all(axis=1)

df = df.loc[valid].copy()

if df.empty:
    raise RuntimeError(
        "No valid A2 observations available."
    )


# Use the latest available sounding row
row = df.iloc[-1]

X = row[features].to_frame().T

a2_probability = float(
    model.predict_proba(X)[0, 1]
)


# ============================================================
# LOAD RADAR FEATURES
# ============================================================

radar = pd.read_csv(
    RADAR_FEATURES
)

if radar.empty:
    raise RuntimeError(
        "No radar features available."
    )


# ============================================================
# RADAR EVIDENCE
# ============================================================

radar_results = []

for _, r in radar.iterrows():

    max_dbz = float(r["max_dbz"])
    echo_fraction = float(r["echo_fraction"])

    if max_dbz >= 40:
        intensity = "STRONG"

    elif max_dbz >= 35:
        intensity = "MODERATE"

    elif max_dbz >= 30:
        intensity = "WEAK_TO_MODERATE"

    else:
        intensity = "WEAK"

    radar_results.append(
        {
            "product": r["product"],
            "max_dbz": max_dbz,
            "p95_dbz": float(r["p95_dbz"]),
            "p99_dbz": float(r["p99_dbz"]),
            "echo_fraction": echo_fraction,
            "intensity_category": intensity
        }
    )


# ============================================================
# DEMO INTERPRETATION
# ============================================================

if a2_probability >= 0.80:
    atmospheric_signal = "HIGH"

elif a2_probability >= 0.50:
    atmospheric_signal = "MODERATE"

else:
    atmospheric_signal = "LOW"


max_radar_dbz = max(
    r["max_dbz"]
    for r in radar_results
)


if max_radar_dbz >= 40:
    radar_signal = "HIGH"

elif max_radar_dbz >= 35:
    radar_signal = "MODERATE"

else:
    radar_signal = "LOW"


# ------------------------------------------------------------
# IMPORTANT:
# This is an evidence summary, NOT a trained fusion model.
# ------------------------------------------------------------

result = {

    "system": "MEGHDRISHTI",

    "mode": "single_frame_demo",

    "a2": {

        "probability": a2_probability,

        "probability_percent":
            round(
                a2_probability * 100,
                2
            ),

        "prediction":
            "THUNDERSTORM"
            if a2_probability >= 0.5
            else "NO_THUNDERSTORM",

        "signal": atmospheric_signal
    },

    "radar": {

        "signal": radar_signal,

        "maximum_dbz":
            max_radar_dbz,

        "products":
            radar_results
    },

    "temporal_status": {

        "required_frames": 5,

        "available_timestamps":
            1,

        "temporal_model_ready":
            False
    },

    "fusion_status":
        "EVIDENCE_ONLY_NOT_TRAINED",

    "note":
        "Radar and atmospheric evidence are "
        "reported separately because synchronized "
        "multi-frame radar training data is not "
        "currently available."
}


# ============================================================
# DISPLAY
# ============================================================

print("\n========== ATMOSPHERIC SIGNAL ==========\n")

print(
    f"A2 probability: "
    f"{a2_probability * 100:.2f}%"
)

print(
    "Atmospheric signal:",
    atmospheric_signal
)


print("\n========== RADAR SIGNAL ==========\n")

for r in radar_results:

    print(
        f"{r['product']}: "
        f"max={r['max_dbz']:.2f} dBZ | "
        f"P95={r['p95_dbz']:.2f} dBZ | "
        f"echo={r['echo_fraction'] * 100:.2f}% | "
        f"{r['intensity_category']}"
    )


print("\n========== TEMPORAL STATUS ==========\n")

print("Required frames: 5")
print("Available timestamps: 1")
print("Temporal model: NOT READY")


print("\n========== DEMO RESULT ==========\n")

print(
    "Atmospheric prediction:",
    result["a2"]["prediction"]
)

print(
    "Atmospheric probability:",
    result["a2"]["probability_percent"],
    "%"
)

print(
    "Radar signal:",
    radar_signal
)

print(
    "\nFusion status:",
    result["fusion_status"]
)


# ============================================================
# SAVE
# ============================================================

with open(
    OUTPUT_PATH,
    "w"
) as f:

    json.dump(
        result,
        f,
        indent=4
    )


print("\nSaved:")
print(OUTPUT_PATH)

print("\n========== COMPLETE ==========\n")