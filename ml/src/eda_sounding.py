import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# ============================================================
# PATHS
# ============================================================

INPUT_FILE = Path("data/raw/bhubaneswar_april_2026.csv")
REPORT_DIR = Path("reports")
PLOT_DIR = REPORT_DIR / "eda"

REPORT_DIR.mkdir(parents=True, exist_ok=True)
PLOT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)

print("\n========== EDA: BHUBANESWAR APRIL 2026 ==========\n")

print("Dataset shape:", df.shape)

# ============================================================
# DATE / TIME
# ============================================================

df["DATE_PARSED"] = pd.to_datetime(
    df["DATE"],
    dayfirst=True,
    errors="coerce"
)

print("\n========== DATE/TIME ==========")

print("Unique dates:", df["DATE_PARSED"].dt.date.nunique())
print("\nTime:")
print(df["TIME"].value_counts())

# ============================================================
# LABEL SUMMARY
# ============================================================

print("\n========== EVENT DISTRIBUTION ==========")

print(
    df["EVENT_CLASS"]
    .value_counts()
    .sort_index()
)

print("\nEvent classes:")
print("0 = NONE")
print("1 = TS")
print("2 = TSRA")

print("\n========== BINARY DISTRIBUTION ==========")

print(
    df["THUNDERSTORM"]
    .value_counts()
    .sort_index()
)

# ============================================================
# FEATURE LIST
# ============================================================

feature_columns = [
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

# ============================================================
# NUMERIC CONVERSION
# ============================================================

for col in feature_columns:
    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )

# ============================================================
# SUMMARY STATISTICS
# ============================================================

summary = df[feature_columns].describe().T

summary["missing"] = df[feature_columns].isna().sum()

summary["missing_percent"] = (
    summary["missing"] / len(df) * 100
)

summary.to_csv(
    REPORT_DIR / "sounding_feature_summary.csv"
)

print("\n========== FEATURE SUMMARY ==========\n")

print(
    summary[
        [
            "count",
            "mean",
            "std",
            "min",
            "50%",
            "max",
            "missing"
        ]
    ]
)

# ============================================================
# EVENT-WISE MEANS
# ============================================================

event_means = (
    df.groupby("EVENT_CLASS")[feature_columns]
    .mean(numeric_only=True)
)

event_means.to_csv(
    REPORT_DIR / "event_feature_means.csv"
)

print("\n========== EVENT-WISE MEANS ==========\n")

print(event_means.T)

# ============================================================
# THUNDERSTORM VS NONE
# ============================================================

binary_means = (
    df.groupby("THUNDERSTORM")[feature_columns]
    .mean(numeric_only=True)
)

binary_means.to_csv(
    REPORT_DIR / "thunderstorm_feature_means.csv"
)

print("\n========== THUNDERSTORM VS NONE ==========\n")

print(binary_means.T)

# ============================================================
# KEY FEATURES
# ============================================================

key_features = [
    "CAPE_SB",
    "CAPE_MU",
    "CAPE_ML",
    "CIN_SB",
    "CIN_MU",
    "CIN_ML",
    "LI_SB",
    "LI_MU",
    "LI_ML",
    "K_INDEX",
    "TOTAL_TOTALS",
    "SWEAT",
    "WMAXSHR_SB",
    "WMAXSHR_MU",
    "WMAXSHR_ML"
]

# ============================================================
# BOX PLOTS: THUNDERSTORM VS NONE
# ============================================================

for feature in key_features:

    plt.figure(figsize=(7, 5))

    groups = [
        df.loc[df["THUNDERSTORM"] == 0, feature].dropna(),
        df.loc[df["THUNDERSTORM"] == 1, feature].dropna()
    ]

    plt.boxplot(
        groups,
        labels=["NONE", "TS/TSRA"]
    )

    plt.title(
        f"{feature}: Thunderstorm vs Non-Thunderstorm"
    )

    plt.ylabel(feature)

    plt.tight_layout()

    plt.savefig(
        PLOT_DIR / f"{feature}_binary_boxplot.png",
        dpi=200
    )

    plt.close()

# ============================================================
# EVENT CLASS BOXPLOTS
# ============================================================

for feature in key_features:

    plt.figure(figsize=(7, 5))

    groups = [
        df.loc[df["EVENT_CLASS"] == 0, feature].dropna(),
        df.loc[df["EVENT_CLASS"] == 1, feature].dropna(),
        df.loc[df["EVENT_CLASS"] == 2, feature].dropna()
    ]

    plt.boxplot(
        groups,
        labels=["NONE", "TS", "TSRA"]
    )

    plt.title(
        f"{feature}: Event Class Comparison"
    )

    plt.ylabel(feature)

    plt.tight_layout()

    plt.savefig(
        PLOT_DIR / f"{feature}_event_boxplot.png",
        dpi=200
    )

    plt.close()

# ============================================================
# CORRELATION MATRIX
# ============================================================

correlation = df[feature_columns].corr()

correlation.to_csv(
    REPORT_DIR / "feature_correlation.csv"
)

plt.figure(figsize=(16, 14))

plt.imshow(
    correlation,
    aspect="auto"
)

plt.colorbar()

plt.xticks(
    range(len(feature_columns)),
    feature_columns,
    rotation=90,
    fontsize=6
)

plt.yticks(
    range(len(feature_columns)),
    feature_columns,
    fontsize=6
)

plt.title(
    "Atmospheric Feature Correlation Matrix"
)

plt.tight_layout()

plt.savefig(
    PLOT_DIR / "correlation_matrix.png",
    dpi=250
)

plt.close()

# ============================================================
# 00Z VS 12Z
# ============================================================

time_means = (
    df.groupby("TIME")[key_features]
    .mean(numeric_only=True)
)

time_means.to_csv(
    REPORT_DIR / "00Z_vs_12Z_means.csv"
)

print("\n========== 00Z VS 12Z ==========\n")

print(time_means.T)

print("\nEDA completed.")

print("\nPlots saved to:")
print(PLOT_DIR)

print("\nReports saved to:")
print(REPORT_DIR)