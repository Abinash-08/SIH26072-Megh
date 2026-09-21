import pandas as pd
from pathlib import Path

INPUT_FILE = Path("data/raw/bhubaneswar_april_2026.csv")
REPORT_DIR = Path("reports")

REPORT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(INPUT_FILE)

print("\n========== DATASET VALIDATION ==========\n")

print("Shape:", df.shape)

print("\nColumns:")
for col in df.columns:
    print(" -", col)

# -----------------------------------------
# Required columns
# -----------------------------------------

required_columns = [
    "DATE",
    "TIME",
    "EVENT_CLASS",
    "THUNDERSTORM"
]

print("\n========== REQUIRED COLUMN CHECK ==========")

for col in required_columns:
    if col in df.columns:
        print(f"[OK] {col}")
    else:
        print(f"[MISSING] {col}")

# -----------------------------------------
# Basic information
# -----------------------------------------

print("\n========== BASIC INFO ==========")

print("Rows:", len(df))
print("Columns:", len(df.columns))

# -----------------------------------------
# Date/time
# -----------------------------------------

print("\n========== DATE/TIME ==========")

if "DATE" in df.columns:

    dates = pd.to_datetime(
        df["DATE"],
        errors="coerce",
        dayfirst=True
    )

    print("Valid dates:", dates.notna().sum())
    print("Invalid dates:", dates.isna().sum())
    print("Unique dates:", dates.dt.date.nunique())

if "TIME" in df.columns:
    print("\nTime distribution:")
    print(df["TIME"].value_counts(dropna=False))

# -----------------------------------------
# Labels
# -----------------------------------------

print("\n========== EVENT CLASS ==========")

if "EVENT_CLASS" in df.columns:
    print(df["EVENT_CLASS"].value_counts(dropna=False).sort_index())

print("\n========== THUNDERSTORM ==========")

if "THUNDERSTORM" in df.columns:
    print(df["THUNDERSTORM"].value_counts(dropna=False).sort_index())

# -----------------------------------------
# Missing values
# -----------------------------------------

print("\n========== MISSING VALUES ==========")

missing = df.isna().sum()

missing = missing[missing > 0].sort_values(
    ascending=False
)

if len(missing) == 0:
    print("No missing values.")
else:
    print(missing)

# -----------------------------------------
# Completely empty feature rows
# -----------------------------------------

label_columns = [
    "EVENT_CLASS",
    "THUNDERSTORM"
]

metadata_columns = [
    "DATE",
    "TIME"
]

feature_columns = [
    c for c in df.columns
    if c not in label_columns + metadata_columns
]

empty_rows = df[feature_columns].isna().all(axis=1)

print("\n========== EMPTY FEATURE ROWS ==========")

print("Count:", empty_rows.sum())

if empty_rows.any():

    print(
        df.loc[
            empty_rows,
            [
                c for c in
                ["DATE", "TIME",
                 "EVENT_CLASS",
                 "THUNDERSTORM"]
                if c in df.columns
            ]
        ]
    )

# -----------------------------------------
# Duplicate date/time
# -----------------------------------------

print("\n========== DUPLICATE OBSERVATIONS ==========")

if "DATE" in df.columns and "TIME" in df.columns:

    duplicates = df.duplicated(
        subset=["DATE", "TIME"],
        keep=False
    )

    print(
        "Duplicate DATE+TIME rows:",
        duplicates.sum()
    )

# -----------------------------------------
# Save report
# -----------------------------------------

missing_report = pd.DataFrame({
    "column": df.columns,
    "missing_count": df.isna().sum().values,
    "missing_percent":
        df.isna().sum().values / len(df) * 100
})

missing_report.to_csv(
    REPORT_DIR / "sounding_missing_report.csv",
    index=False
)

print("\nValidation completed.")