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
    average_precision_score
)


# ============================================================
# PATHS
# ============================================================

INPUT_FILE = Path(
    "data/raw/bhubaneswar_april_2026.csv"
)

REPORT_DIR = Path("reports")

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)

print("\n========== ABLATION STUDY ==========\n")

print("Original dataset:", df.shape)


# ============================================================
# DATE
# ============================================================

df["DATE_PARSED"] = pd.to_datetime(
    df["DATE"],
    dayfirst=True,
    errors="coerce"
)


# ============================================================
# FEATURE GROUPS
# ============================================================

# ------------------------------------------------------------
# A0 — Traditional instability indices
# ------------------------------------------------------------

A0 = [
    "K_INDEX",
    "TOTAL_TOTALS",
    "LIFTED_INDEX",
    "SHOWALTER_INDEX",
    "SWEAT"
]


# ------------------------------------------------------------
# A1 — A0 + thermodynamic environment
# ------------------------------------------------------------

A1 = A0 + [

    "MIXR_MU",

    "CAPE_MU",

    "CIN_MU",

    "LCL_MU",

    "LFC_MU"
]


# ------------------------------------------------------------
# A2 — A1 + wind shear
# ------------------------------------------------------------

A2 = A1 + [

    "WMAXSHR_MU"
]


# ------------------------------------------------------------
# A3 — Expanded atmospheric feature set
# ------------------------------------------------------------

A3 = [

    "K_INDEX",
    "TOTAL_TOTALS",
    "LIFTED_INDEX",
    "SHOWALTER_INDEX",
    "SWEAT",

    "MIXR_SB",
    "MIXR_MU",
    "MIXR_ML",

    "CAPE_SB",
    "CAPE_MU",
    "CAPE_ML",

    "CAPE03_SB",
    "CAPE03_MU",
    "CAPE03_ML",

    "CAPEHGL_SB",
    "CAPEHGL_MU",
    "CAPEHGL_ML",

    "CIN_SB",
    "CIN_MU",
    "CIN_ML",

    "LI_SB",
    "LI_MU",
    "LI_ML",

    "LCL_SB",
    "LCL_MU",
    "LCL_ML",

    "LFC_SB",
    "LFC_MU",
    "LFC_ML",

    "EL_SB",
    "EL_MU",
    "EL_ML",

    "WMAXSHR_SB",
    "WMAXSHR_MU",
    "WMAXSHR_ML"
]


FEATURE_SETS = {
    "A0": A0,
    "A1": A1,
    "A2": A2,
    "A3": A3
}


# ============================================================
# NUMERIC CONVERSION
# ============================================================

all_features = sorted(
    set(
        feature
        for features in FEATURE_SETS.values()
        for feature in features
    )
)

for feature in all_features:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )


# ============================================================
# REMOVE COMPLETELY EMPTY SOUNDING
# ============================================================

all_feature_missing = df[
    all_features
].isna().all(axis=1)

df_model = df.loc[
    ~all_feature_missing
].copy()


print(
    "Usable observations:",
    len(df_model)
)

print(
    "Removed completely missing observations:",
    all_feature_missing.sum()
)


# ============================================================
# TARGET
# ============================================================

y = df_model[
    "THUNDERSTORM"
].astype(int)


# ============================================================
# GROUPS
# ============================================================

groups = (
    df_model[
        "DATE_PARSED"
    ].dt.strftime("%Y-%m-%d")
)


# ============================================================
# CROSS VALIDATION
# ============================================================

cv = StratifiedGroupKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# ============================================================
# FUNCTION TO RUN ONE MODEL
# ============================================================

def evaluate_model(
    model_name,
    features
):

    print(
        f"\n{'=' * 60}"
    )

    print(
        f"{model_name}"
    )

    print(
        f"{'=' * 60}"
    )

    print(
        "Number of features:",
        len(features)
    )

    X = df_model[
        features
    ]

    fold_results = []

    for fold, (
        train_idx,
        test_idx
    ) in enumerate(
        cv.split(
            X,
            y,
            groups
        ),
        start=1
    ):

        X_train = X.iloc[
            train_idx
        ]

        X_test = X.iloc[
            test_idx
        ]

        y_train = y.iloc[
            train_idx
        ]

        y_test = y.iloc[
            test_idx
        ]


        # ----------------------------------------------------
        # Pipeline
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # Train
        # ----------------------------------------------------

        pipeline.fit(
            X_train,
            y_train
        )


        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        y_probability = pipeline.predict_proba(
            X_test
        )[:, 1]

        y_prediction = (
            y_probability >= 0.5
        ).astype(int)


        # ----------------------------------------------------
        # Metrics
        # ----------------------------------------------------

        precision = precision_score(
            y_test,
            y_prediction,
            zero_division=0
        )

        recall = recall_score(
            y_test,
            y_prediction,
            zero_division=0
        )

        f1 = f1_score(
            y_test,
            y_prediction,
            zero_division=0
        )

        roc_auc = roc_auc_score(
            y_test,
            y_probability
        )

        pr_auc = average_precision_score(
            y_test,
            y_probability
        )


        fold_results.append({

            "model": model_name,

            "fold": fold,

            "precision": precision,

            "recall": recall,

            "f1": f1,

            "roc_auc": roc_auc,

            "pr_auc": pr_auc
        })


    return fold_results


# ============================================================
# RUN ALL MODELS
# ============================================================

all_results = []


for model_name, features in FEATURE_SETS.items():

    results = evaluate_model(
        model_name,
        features
    )

    all_results.extend(
        results
    )


# ============================================================
# RESULTS DATAFRAME
# ============================================================

results_df = pd.DataFrame(
    all_results
)


# ============================================================
# FOLD RESULTS
# ============================================================

print(
    "\n\n========== ALL FOLD RESULTS ==========\n"
)

print(
    results_df.to_string(
        index=False
    )
)


# ============================================================
# MEAN RESULTS
# ============================================================

mean_results = (
    results_df
    .groupby("model")[
        [
            "precision",
            "recall",
            "f1",
            "roc_auc",
            "pr_auc"
        ]
    ]
    .mean()
    .reset_index()
)


# ============================================================
# STANDARD DEVIATION
# ============================================================

std_results = (
    results_df
    .groupby("model")[
        [
            "precision",
            "recall",
            "f1",
            "roc_auc",
            "pr_auc"
        ]
    ]
    .std()
    .reset_index()
)


# Rename columns

std_results = std_results.rename(
    columns={
        "precision": "precision_std",
        "recall": "recall_std",
        "f1": "f1_std",
        "roc_auc": "roc_auc_std",
        "pr_auc": "pr_auc_std"
    }
)


# ============================================================
# COMBINE
# ============================================================

comparison = mean_results.merge(
    std_results,
    on="model"
)


# ============================================================
# PRINT
# ============================================================

print(
    "\n\n========== ABLATION COMPARISON ==========\n"
)

print(
    comparison.to_string(
        index=False
    )
)


# ============================================================
# SAVE
# ============================================================

results_df.to_csv(
    REPORT_DIR /
    "model_a_ablation_folds.csv",
    index=False
)

comparison.to_csv(
    REPORT_DIR /
    "model_a_ablation_comparison.csv",
    index=False
)


print(
    "\nResults saved:"
)

print(
    "reports/model_a_ablation_folds.csv"
)

print(
    "reports/model_a_ablation_comparison.csv"
)


# ============================================================
# BEST MODEL
# ============================================================

best_model = comparison.loc[
    comparison["pr_auc"].idxmax()
]

print(
    "\n========== BEST MODEL BY PR-AUC ==========\n"
)

print(
    best_model.to_string()
)

print(
    "\nAblation study completed."
)