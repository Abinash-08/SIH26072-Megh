from pathlib import Path
import pandas as pd

DATA_FILE = Path(
    "data/raw/bhubaneswar_april_2026.csv"
)

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
    "WMAXSHR_MU",
]

print("\n========== A2 DATA DEBUG ==========\n")

df = pd.read_csv(DATA_FILE)

print("Initial shape:", df.shape)

print("\nDATE:")
print("Non-null:", df["DATE"].notna().sum())
print("Unique:", df["DATE"].nunique())

print("\nTHUNDERSTORM:")
print(df["THUNDERSTORM"].value_counts(dropna=False))

print("\nA2 FEATURE MISSING COUNTS:")

for feature in FEATURES:
    print(
        f"{feature:20s} "
        f"missing={df[feature].isna().sum():2d} "
        f"valid={df[feature].notna().sum():2d}"
    )

print("\n========== ROW-WISE A2 AVAILABILITY ==========\n")

df["A2_AVAILABLE"] = (
    ~df[FEATURES].isna().all(axis=1)
)

print(
    df[
        [
            "DATE",
            "TIME",
            "THUNDERSTORM",
            "A2_AVAILABLE"
        ]
    ].to_string(index=True)
)

print(
    "\nRows with at least one A2 feature:",
    df["A2_AVAILABLE"].sum()
)

print(
    "Rows with all A2 features missing:",
    (~df["A2_AVAILABLE"]).sum()
)

print(
    "\n========== DATE PARSING ==========\n"
)

parsed_dates = pd.to_datetime(
    df["DATE"],
    format="%d/%m/%Y",
    errors="coerce"
)

print(
    "Valid parsed dates:",
    parsed_dates.notna().sum()
)

print(
    "Invalid parsed dates:",
    parsed_dates.isna().sum()
)

print(
    "\n========== LABEL PARSING ==========\n"
)

labels = pd.to_numeric(
    df["THUNDERSTORM"],
    errors="coerce"
)

print(
    "Valid labels:",
    labels.notna().sum()
)

print(
    "Invalid labels:",
    labels.isna().sum()
)

print(
    "\n========== COMBINED FILTER ==========\n"
)

combined = (
    parsed_dates.notna()
    &
    labels.notna()
    &
    df["A2_AVAILABLE"]
)

print(
    "Rows surviving all filters:",
    combined.sum()
)

print(
    "\nRows removed:"
)

print(
    df.loc[
        ~combined,
        [
            "DATE",
            "TIME",
            "THUNDERSTORM"
        ]
    ].to_string(index=True)
)

print(
    "\n========== COMPLETE ==========\n"
)