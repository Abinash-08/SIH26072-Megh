import pandas as pd
import numpy as np

from pathlib import Path

import tensorflow as tf

from sklearn.model_selection import StratifiedGroupKFold
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

np.random.seed(42)
tf.random.set_seed(42)


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
# A2 FEATURES
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
# LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)

df["DATE_PARSED"] = pd.to_datetime(
    df["DATE"],
    dayfirst=True,
    errors="coerce"
)


# ============================================================
# NUMERIC CONVERSION
# ============================================================

for feature in FEATURES:

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )


# ============================================================
# REMOVE COMPLETELY MISSING SOUNDING
# ============================================================

complete_missing = df[
    FEATURES
].isna().all(axis=1)

df_model = df.loc[
    ~complete_missing
].copy()


print("\n========== MODEL A2 MLP ==========\n")

print(
    "Total observations:",
    len(df)
)

print(
    "Usable observations:",
    len(df_model)
)

print(
    "Removed:",
    complete_missing.sum()
)


# ============================================================
# X / Y
# ============================================================

X = df_model[FEATURES].values

y = df_model[
    "THUNDERSTORM"
].astype(int).values


# ============================================================
# GROUPS = DATE
# ============================================================

groups = (
    df_model[
        "DATE_PARSED"
    ].dt.strftime("%Y-%m-%d")
    .values
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
# RESULTS
# ============================================================

results = []


# ============================================================
# CROSS-VALIDATION
# ============================================================

for fold, (
    train_idx,
    test_idx
) in enumerate(
    cv.split(X, y, groups),
    start=1
):

    print(
        f"\n========== FOLD {fold} =========="
    )


    X_train = X[train_idx]
    X_test = X[test_idx]

    y_train = y[train_idx]
    y_test = y[test_idx]


    # --------------------------------------------------------
    # Imputation
    # --------------------------------------------------------

    imputer = SimpleImputer(
        strategy="median"
    )

    X_train = imputer.fit_transform(
        X_train
    )

    X_test = imputer.transform(
        X_test
    )


    # --------------------------------------------------------
    # Scaling
    # --------------------------------------------------------

    scaler = StandardScaler()

    X_train = scaler.fit_transform(
        X_train
    )

    X_test = scaler.transform(
        X_test
    )


    # --------------------------------------------------------
    # MODEL
    # --------------------------------------------------------

    model = tf.keras.Sequential([

        tf.keras.layers.Input(
            shape=(len(FEATURES),)
        ),

        tf.keras.layers.Dense(
            32,
            activation="relu"
        ),

        tf.keras.layers.Dropout(
            0.25
        ),

        tf.keras.layers.Dense(
            16,
            activation="relu"
        ),

        tf.keras.layers.Dropout(
            0.20
        ),

        tf.keras.layers.Dense(
            1,
            activation="sigmoid"
        )
    ])


    # --------------------------------------------------------
    # COMPILE
    # --------------------------------------------------------

    model.compile(

        optimizer=tf.keras.optimizers.Adam(
            learning_rate=0.001
        ),

        loss="binary_crossentropy",

        metrics=[
            tf.keras.metrics.AUC(
                name="auc"
            )
        ]
    )


    # --------------------------------------------------------
    # EARLY STOPPING
    # --------------------------------------------------------

    early_stopping = tf.keras.callbacks.EarlyStopping(

        monitor="val_loss",

        patience=20,

        restore_best_weights=True
    )


    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    model.fit(

        X_train,

        y_train,

        validation_split=0.20,

        epochs=200,

        batch_size=8,

        callbacks=[
            early_stopping
        ],

        verbose=0
    )


    # --------------------------------------------------------
    # PREDICTION
    # --------------------------------------------------------

    y_probability = model.predict(
        X_test,
        verbose=0
    ).ravel()


    y_prediction = (
        y_probability >= 0.5
    ).astype(int)


    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

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


    results.append({

        "model": "A2_MLP",

        "fold": fold,

        "precision": precision,

        "recall": recall,

        "f1": f1,

        "roc_auc": roc_auc,

        "pr_auc": pr_auc
    })


# ============================================================
# RESULTS
# ============================================================

results_df = pd.DataFrame(
    results
)


print(
    "\n========== MLP FOLD RESULTS ==========\n"
)

print(
    results_df.to_string(
        index=False
    )
)


# ============================================================
# MEAN
# ============================================================

mean_metrics = results_df[
    [
        "precision",
        "recall",
        "f1",
        "roc_auc",
        "pr_auc"
    ]
].mean()


std_metrics = results_df[
    [
        "precision",
        "recall",
        "f1",
        "roc_auc",
        "pr_auc"
    ]
].std()


print(
    "\n========== MLP MEAN ==========\n"
)

print(
    mean_metrics
)


print(
    "\n========== MLP STD ==========\n"
)

print(
    std_metrics
)


# ============================================================
# SAVE
# ============================================================

results_df.to_csv(
    REPORT_DIR /
    "model_a2_mlp_results.csv",
    index=False
)


summary = pd.DataFrame({

    "metric": mean_metrics.index,

    "mean": mean_metrics.values,

    "std": std_metrics.values
})


summary.to_csv(
    REPORT_DIR /
    "model_a2_mlp_summary.csv",
    index=False
)


print(
    "\nResults saved."
)

print(
    "reports/model_a2_mlp_results.csv"
)

print(
    "reports/model_a2_mlp_summary.csv"
)