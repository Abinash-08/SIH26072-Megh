import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)


# ============================================================
# PATHS
# ============================================================

INPUT_FILE = Path(
    "data/raw/bhubaneswar_april_2026.csv"
)

REPORT_DIR = Path("reports")
MODEL_DIR = Path("models")

REPORT_DIR.mkdir(exist_ok=True)
MODEL_DIR.mkdir(exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)


# ============================================================
# DATE
# ============================================================

df["DATE_PARSED"] = pd.to_datetime(
    df["DATE"],
    dayfirst=True,
    errors="coerce"
)


# ============================================================
# FEATURES
# ============================================================

FEATURES = [

    # Thermodynamic indices
    "K_INDEX",
    "TOTAL_TOTALS",
    "LIFTED_INDEX",
    "SHOWALTER_INDEX",
    "SWEAT",

    # Moisture
    "MIXR_MU",

    # CAPE
    "CAPE_SB",
    "CAPE_MU",
    "CAPE_ML",

    # CIN
    "CIN_SB",
    "CIN_MU",
    "CIN_ML",

    # Cloud-base related
    "LCL_SB",
    "LCL_MU",
    "LCL_ML",

    # LFC
    "LFC_SB",
    "LFC_MU",
    "LFC_ML",

    # Shear
    "WMAXSHR_MU"
]


# ============================================================
# NUMERIC CONVERSION
# ============================================================

for col in FEATURES:

    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )


# ============================================================
# REMOVE COMPLETELY MISSING SOUNDING
# ============================================================

feature_available = ~df[FEATURES].isna().all(axis=1)

df_model = df.loc[
    feature_available
].copy()


print("\n========== MODEL A DATASET ==========\n")

print(
    "Total observations:",
    len(df)
)

print(
    "Usable sounding observations:",
    len(df_model)
)

print(
    "Removed completely missing soundings:",
    (~feature_available).sum()
)


# ============================================================
# X / y / GROUP
# ============================================================

X = df_model[FEATURES]

y = df_model["THUNDERSTORM"].astype(int)

groups = (
    df_model["DATE_PARSED"]
    .dt.strftime("%Y-%m-%d")
)


print("\nClass distribution:")

print(
    y.value_counts()
)


# ============================================================
# PIPELINE
# ============================================================

pipeline = Pipeline(
    steps=[

        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        ),

        (
            "scaler",
            StandardScaler()
        ),

        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                class_weight="balanced",
                solver="liblinear"
            )
        )
    ]
)


# ============================================================
# GROUPED CROSS VALIDATION
# ============================================================

cv = StratifiedGroupKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# ============================================================
# RESULTS
# ============================================================

results = []

probabilities = []

actuals = []

fold_numbers = []


for fold, (train_idx, test_idx) in enumerate(
    cv.split(X, y, groups),
    start=1
):

    X_train = X.iloc[train_idx]
    X_test = X.iloc[test_idx]

    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]

    pipeline.fit(
        X_train,
        y_train
    )

    y_prob = pipeline.predict_proba(
        X_test
    )[:, 1]

    y_pred = (
        y_prob >= 0.5
    ).astype(int)


    precision = precision_score(
        y_test,
        y_pred,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        y_prob
    )

    pr_auc = average_precision_score(
        y_test,
        y_prob
    )


    results.append({

        "fold": fold,

        "precision": precision,

        "recall": recall,

        "f1": f1,

        "roc_auc": roc_auc,

        "pr_auc": pr_auc
    })


    probabilities.extend(
        y_prob
    )

    actuals.extend(
        y_test
    )

    fold_numbers.extend(
        [fold] * len(y_test)
    )


# ============================================================
# RESULTS TABLE
# ============================================================

results_df = pd.DataFrame(
    results
)

print(
    "\n========== FOLD RESULTS ==========\n"
)

print(
    results_df
)


print(
    "\n========== MEAN PERFORMANCE ==========\n"
)

print(
    results_df[
        [
            "precision",
            "recall",
            "f1",
            "roc_auc",
            "pr_auc"
        ]
    ].mean()
)


# ============================================================
# SAVE RESULTS
# ============================================================

results_df.to_csv(
    REPORT_DIR /
    "model_a_cv_results.csv",
    index=False
)


# ============================================================
# TRAIN FINAL MODEL
# ============================================================

pipeline.fit(
    X,
    y
)


# ============================================================
# SAVE COEFFICIENTS
# ============================================================

classifier = pipeline.named_steps[
    "classifier"
]

coefficients = pd.DataFrame({

    "feature": FEATURES,

    "coefficient":
        classifier.coef_[0]

})

coefficients[
    "abs_coefficient"
] = coefficients[
    "coefficient"
].abs()


coefficients = coefficients.sort_values(
    "abs_coefficient",
    ascending=False
)


coefficients.to_csv(
    REPORT_DIR /
    "model_a_coefficients.csv",
    index=False
)


print(
    "\n========== FEATURE COEFFICIENTS ==========\n"
)

print(
    coefficients
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

final_prob = pipeline.predict_proba(
    X
)[:, 1]

final_pred = (
    final_prob >= 0.5
).astype(int)


cm = confusion_matrix(
    y,
    final_pred
)


print(
    "\n========== TRAINING CONFUSION MATRIX ==========\n"
)

print(cm)


print(
    "\nModel A training completed."
)