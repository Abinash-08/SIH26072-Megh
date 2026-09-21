import json
from pathlib import Path

import joblib
import pandas as pd


MODEL_PATH = Path(
    "models/model_a2_logistic.joblib"
)

FEATURE_PATH = Path(
    "models/model_a2_features.json"
)


print(
    "\n========== MEGHDRISHTI A2 INFERENCE ==========\n"
)


model = joblib.load(
    MODEL_PATH
)

with open(
    FEATURE_PATH,
    "r",
    encoding="utf-8"
) as f:

    FEATURES = json.load(f)


print(
    "Model loaded."
)

print(
    "Features:",
    len(FEATURES)
)


# ------------------------------------------------------------
# Example observation
# ------------------------------------------------------------
#
# Replace these values later with live radiosonde/NWP values.
#

example = {

    "K_INDEX": 35.0,

    "TOTAL_TOTALS": 45.0,

    "LIFTED_INDEX": -4.0,

    "SHOWALTER_INDEX": -2.0,

    "SWEAT": 200.0,

    "MIXR_MU": 15.0,

    "CAPE_MU": 2500.0,

    "CIN_MU": 20.0,

    "LCL_MU": 900.0,

    "LFC_MU": 800.0,

    "WMAXSHR_MU": 20.0,
}


X = pd.DataFrame(
    [example]
)[FEATURES]


probability = model.predict_proba(
    X
)[0, 1]


prediction = int(
    probability >= 0.5
)


print(
    f"\nThunderstorm probability: "
    f"{probability * 100:.2f}%"
)


print(
    "Prediction:",
    "THUNDERSTORM"
    if prediction
    else "NO THUNDERSTORM"
)


print(
    "\n========== COMPLETE ==========\n"
)