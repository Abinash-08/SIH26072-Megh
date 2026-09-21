import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

DATA_FILE = Path(
    "data/raw/bhubaneswar_april_2026.csv"
)

MODEL_DIR = Path("models")
REPORT_DIR = Path("reports")

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# EXACT A2 FEATURES FROM YOUR ABLATION EXPERIMENT
# ============================================================
FEATURES = [
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

# ============================================================
# LOAD
# ============================================================

print("\n========== FINAL A2 BASELINE ==========\n")

df = pd.read_csv(DATA_FILE)

print(
    "Original observations:",
    len(df)
)


# ============================================================
# REQUIRED COLUMNS
# ============================================================

required = [
    "DATE",
    "TIME",
    "EVENT_CLASS",
    "THUNDERSTORM",
] + FEATURES

missing_columns = [
    column
    for column in required
    if column not in df.columns
]

if missing_columns:

    print("\n[ERROR] Missing columns:")

    for column in missing_columns:
        print(" -", column)

    raise SystemExit(1)


# ============================================================
# DATE / LABEL CLEANING
# ============================================================

df["DATE"] = pd.to_datetime(
    df["DATE"],
    format="%d/%m/%Y",
    errors="coerce"
)

df["THUNDERSTORM"] = pd.to_numeric(
    df["THUNDERSTORM"],
    errors="coerce"
)


# Keep rows with valid date + target
df = df[
    df["DATE"].notna()
    &
    df["THUNDERSTORM"].notna()
].copy()


# ============================================================
# REMOVE COMPLETELY EMPTY SOUNDINGS
# ============================================================

feature_empty = df[
    FEATURES
].isna().all(axis=1)

print(
    "Completely empty observations:",
    feature_empty.sum()
)

df_model = df[
    ~feature_empty
].copy()


print(
    "Usable observations:",
    len(df_model)
)


# ============================================================
# CLASS DISTRIBUTION
# ============================================================

print(
    "\nClass distribution:"
)

print(
    df_model["THUNDERSTORM"]
    .astype(int)
    .value_counts()
    .sort_index()
)


print(
    "\nUnique dates:",
    df_model["DATE"].nunique()
)


# ============================================================
# X / y / GROUPS
# ============================================================

X = df_model[
    FEATURES
].copy()

y = df_model[
    "THUNDERSTORM"
].astype(int)

groups = (
    df_model["DATE"]
    .dt.strftime("%Y-%m-%d")
)


print(
    "\nNumber of A2 features:",
    len(FEATURES)
)


# ============================================================
# DATE-GROUPED CV
# ============================================================

cv = StratifiedGroupKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


fold_results = []
all_predictions = []


# ============================================================
# CROSS VALIDATION
# ============================================================

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

    print(
        f"\n========== FOLD {fold} =========="
    )

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


    pipeline = Pipeline([

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
                class_weight="balanced",
                max_iter=3000,
                random_state=42
            )
        )

    ])


    pipeline.fit(
        X_train,
        y_train
    )


    probability = pipeline.predict_proba(
        X_test
    )[:, 1]


    prediction = (
        probability >= 0.5
    ).astype(int)


    precision = precision_score(
        y_test,
        prediction,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        prediction,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        prediction,
        zero_division=0
    )


    if len(
        np.unique(y_test)
    ) == 2:

        roc_auc = roc_auc_score(
            y_test,
            probability
        )

        pr_auc = average_precision_score(
            y_test,
            probability
        )

    else:

        roc_auc = np.nan
        pr_auc = np.nan


    print(
        f"Precision: {precision:.3f}"
    )

    print(
        f"Recall:    {recall:.3f}"
    )

    print(
        f"F1:        {f1:.3f}"
    )

    print(
        f"ROC-AUC:   {roc_auc:.3f}"
    )

    print(
        f"PR-AUC:    {pr_auc:.3f}"
    )


    fold_results.append({

        "fold": fold,

        "precision": precision,

        "recall": recall,

        "f1": f1,

        "roc_auc": roc_auc,

        "pr_auc": pr_auc,

        "train_dates":
            groups.iloc[
                train_idx
            ].nunique(),

        "test_dates":
            groups.iloc[
                test_idx
            ].nunique(),

        "test_samples":
            len(test_idx)

    })


    fold_predictions = df_model.iloc[
        test_idx
    ][
        [
            "DATE",
            "TIME",
            "EVENT_CLASS",
            "THUNDERSTORM"
        ]
    ].copy()


    fold_predictions[
        "fold"
    ] = fold

    fold_predictions[
        "probability"
    ] = probability

    fold_predictions[
        "prediction"
    ] = prediction


    all_predictions.append(
        fold_predictions
    )


# ============================================================
# RESULTS
# ============================================================

results = pd.DataFrame(
    fold_results
)

predictions = pd.concat(
    all_predictions,
    ignore_index=True
)


# ============================================================
# FOLD RESULTS
# ============================================================

print(
    "\n========== DATE-GROUPED FOLD RESULTS ==========\n"
)

print(
    results.to_string(
        index=False
    )
)


# ============================================================
# OVERALL OOF METRICS
# ============================================================

y_true = predictions[
    "THUNDERSTORM"
].astype(int)

y_pred = predictions[
    "prediction"
].astype(int)

y_probability = predictions[
    "probability"
]


overall_precision = precision_score(
    y_true,
    y_pred,
    zero_division=0
)

overall_recall = recall_score(
    y_true,
    y_pred,
    zero_division=0
)

overall_f1 = f1_score(
    y_true,
    y_pred,
    zero_division=0
)

overall_roc_auc = roc_auc_score(
    y_true,
    y_probability
)

overall_pr_auc = average_precision_score(
    y_true,
    y_probability
)


print(
    "\n========== OVERALL OUT-OF-FOLD PERFORMANCE ==========\n"
)

print(
    f"Precision: {overall_precision:.3f}"
)

print(
    f"Recall:    {overall_recall:.3f}"
)

print(
    f"F1:        {overall_f1:.3f}"
)

print(
    f"ROC-AUC:   {overall_roc_auc:.3f}"
)

print(
    f"PR-AUC:    {overall_pr_auc:.3f}"
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred
)


print(
    "\n========== OVERALL CONFUSION MATRIX ==========\n"
)

print(cm)


# ============================================================
# FOLD MEAN / STD
# ============================================================

metric_columns = [
    "precision",
    "recall",
    "f1",
    "roc_auc",
    "pr_auc"
]

print(
    "\n========== FOLD MEAN ==========\n"
)

print(
    results[
        metric_columns
    ].mean()
)


print(
    "\n========== FOLD STD ==========\n"
)

print(
    results[
        metric_columns
    ].std()
)


# ============================================================
# SAVE REPORTS
# ============================================================

results.to_csv(
    REPORT_DIR /
    "model_a2_final_folds.csv",
    index=False
)


predictions.to_csv(
    REPORT_DIR /
    "model_a2_final_predictions.csv",
    index=False
)


pd.DataFrame(
    cm,
    index=[
        "actual_0",
        "actual_1"
    ],
    columns=[
        "predicted_0",
        "predicted_1"
    ]
).to_csv(
    REPORT_DIR /
    "model_a2_final_confusion_matrix.csv"
)


summary = pd.DataFrame([{

    "model": "A2_LOGISTIC_DATE_GROUPED",

    "observations": len(df_model),

    "dates": groups.nunique(),

    "features": len(FEATURES),

    "precision": overall_precision,

    "recall": overall_recall,

    "f1": overall_f1,

    "roc_auc": overall_roc_auc,

    "pr_auc": overall_pr_auc

}])


summary.to_csv(
    REPORT_DIR /
    "model_a2_final_summary.csv",
    index=False
)


# ============================================================
# TRAIN FINAL PRODUCTION MODEL
# ============================================================

print(
    "\n========== TRAINING FINAL MODEL ==========\n"
)


final_pipeline = Pipeline([

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
            class_weight="balanced",
            max_iter=3000,
            random_state=42
        )
    )

])


final_pipeline.fit(
    X,
    y
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    final_pipeline,
    MODEL_DIR /
    "model_a2_logistic.joblib"
)


with open(
    MODEL_DIR /
    "model_a2_features.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        FEATURES,
        f,
        indent=2
    )


print(
    "\n========== FINAL MODEL ==========\n"
)

print(
    "Model saved:"
)

print(
    MODEL_DIR /
    "model_a2_logistic.joblib"
)

print(
    "\nFeatures saved:"
)

print(
    MODEL_DIR /
    "model_a2_features.json"
)


print(
    "\n========== COMPLETE ==========\n"
)