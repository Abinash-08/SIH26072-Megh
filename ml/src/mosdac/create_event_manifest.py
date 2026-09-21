import json
import pandas as pd

from pathlib import Path


# ============================================================
# CONFIG
# ============================================================

INPUT_FILE = Path(
    "data/metadata/mosdac_2026-04-06_all.json"
)

OUTPUT_FILE = Path(
    "data/metadata/event_06apr2026_manifest.csv"
)

EVENT_DATE = "2026-04-06"

EVENT_CLASS = "TSRA"


# ============================================================
# LOAD ALL 43 MOSDAC RECORDS
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


print(
    "\n========== BUILDING EVENT MANIFEST ==========\n"
)

print(
    "MOSDAC records found:",
    len(entries)
)


# ============================================================
# BUILD RECORDS
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

    timestamp = pd.to_datetime(
        updated,
        utc=True,
        errors="coerce"
    )


    records.append({

        "event_date": EVENT_DATE,

        "event_class": EVENT_CLASS,

        "satellite_timestamp": timestamp,

        "satellite_identifier": identifier,

        "satellite_record_id": record_id,

        "satellite_available": 1,

        "radar_available": None,

        "lightning_available": None,

        "nwp_available": None
    })


# ============================================================
# DATAFRAME
# ============================================================

manifest = pd.DataFrame(
    records
)


# ============================================================
# REMOVE INVALID TIMESTAMPS
# ============================================================

manifest = manifest[
    manifest[
        "satellite_timestamp"
    ].notna()
].copy()


# ============================================================
# SORT
# ============================================================

manifest = manifest.sort_values(
    "satellite_timestamp"
).reset_index(
    drop=True
)


# ============================================================
# ADD TIME FEATURES
# ============================================================

manifest["time_utc"] = (
    manifest[
        "satellite_timestamp"
    ].dt.strftime("%H:%M")
)

manifest["hour"] = (
    manifest[
        "satellite_timestamp"
    ].dt.hour
)

manifest["minute"] = (
    manifest[
        "satellite_timestamp"
    ].dt.minute
)


# ============================================================
# IDENTIFY TEMPORAL GAPS
# ============================================================

manifest["delta_minutes"] = (
    manifest[
        "satellite_timestamp"
    ]
    .diff()
    .dt.total_seconds()
    .div(60)
)


# ============================================================
# SAVE
# ============================================================

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

manifest.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# DISPLAY
# ============================================================

print(
    "\n========== EVENT MANIFEST ==========\n"
)

print(
    "Event date:",
    EVENT_DATE
)

print(
    "Event class:",
    EVENT_CLASS
)

print(
    "Valid satellite observations:",
    len(manifest)
)

print(
    "\n========== TIMELINE ==========\n"
)

print(
    manifest[
        [
            "satellite_timestamp",
            "satellite_identifier",
            "delta_minutes"
        ]
    ].to_string(
        index=False
    )
)


print(
    "\n========== GAPS > 30 MIN ==========\n"
)

gaps = manifest[
    manifest["delta_minutes"] > 30
]

if len(gaps) == 0:

    print(
        "No gaps detected."
    )

else:

    print(
        gaps[
            [
                "satellite_timestamp",
                "delta_minutes"
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