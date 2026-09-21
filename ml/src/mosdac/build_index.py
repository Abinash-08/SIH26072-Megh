import json
import re
import pandas as pd

from pathlib import Path


# ============================================================
# PATHS
# ============================================================

INPUT_FILE = Path(
    "data/metadata/mosdac_2026-04-06.json"
)

OUTPUT_FILE = Path(
    "data/metadata/mosdac_satellite_index.csv"
)


# ============================================================
# LOAD MOSDAC RESPONSE
# ============================================================

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)


entries = data.get(
    "entries",
    []
)


# ============================================================
# EXTRACT METADATA
# ============================================================

records = []


for item in entries:

    identifier = item.get(
        "identifier"
    )

    record_id = item.get(
        "id"
    )

    updated = item.get(
        "updated"
    )


    # --------------------------------------------------------
    # Extract timestamp from filename
    # --------------------------------------------------------

    timestamp = None

    if identifier:

        match = re.search(
            r"3SIMG_(\d{2}[A-Z]{3}\d{4})_(\d{4})",
            identifier
        )

        if match:

            date_part = match.group(1)

            time_part = match.group(2)

            timestamp = pd.to_datetime(
                date_part + "_" + time_part,
                format="%d%b%Y_%H%M",
                errors="coerce"
            )


    records.append({

        "dataset_id": "3SIMG_L1B_STD",

        "identifier": identifier,

        "record_id": record_id,

        "updated": updated,

        "timestamp": timestamp

    })


# ============================================================
# DATAFRAME
# ============================================================

df = pd.DataFrame(
    records
)


# ============================================================
# SORT
# ============================================================

df = df.sort_values(
    "timestamp"
).reset_index(
    drop=True
)


# ============================================================
# ADD USEFUL TIME FEATURES
# ============================================================

df["date"] = (
    df["timestamp"]
    .dt.strftime("%Y-%m-%d")
)

df["time_utc"] = (
    df["timestamp"]
    .dt.strftime("%H:%M")
)

df["hour"] = (
    df["timestamp"]
    .dt.hour
)

df["minute"] = (
    df["timestamp"]
    .dt.minute
)


# ============================================================
# SAVE
# ============================================================

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# DISPLAY
# ============================================================

print(
    "\n========== SATELLITE INDEX ==========\n"
)

print(
    "Records:",
    len(df)
)

print(
    "\nTime range:"
)

print(
    df["timestamp"].min()
)

print(
    df["timestamp"].max()
)

print(
    "\nFiles:\n"
)

print(
    df[
        [
            "identifier",
            "record_id",
            "timestamp"
        ]
    ].to_string(
        index=False
    )
)


print(
    "\nSaved:"
)

print(
    OUTPUT_FILE
)