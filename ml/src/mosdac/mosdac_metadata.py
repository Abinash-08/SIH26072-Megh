import requests
import json
from pathlib import Path


# ============================================================
# MOSDAC METADATA SEARCH — PAGINATED
# ============================================================

SEARCH_URL = "https://mosdac.gov.in/apios/datasets.json"

DATASET_ID = "3SIMG_L1B_STD"

START_TIME = "2026-04-06"
END_TIME = "2026-04-06"

COUNT = 100

BOUNDING_BOX = "84.0,19.0,87.0,21.5"

OUTPUT_FILE = Path(
    "data/metadata/mosdac_2026-04-06_all.json"
)


# ============================================================
# SEARCH
# ============================================================

print("\n========== MOSDAC PAGINATED SEARCH ==========\n")

print("Dataset:", DATASET_ID)
print("Start:", START_TIME)
print("End:", END_TIME)
print("Bounding box:", BOUNDING_BOX)


all_entries = []

start_index = 1


while True:

    params = {
        "datasetId": DATASET_ID,
        "startTime": START_TIME,
        "endTime": END_TIME,
        "count": COUNT,
        "boundingBox": BOUNDING_BOX,
        "startIndex": start_index
    }

    print(
        f"\nSearching records starting at {start_index}..."
    )

    try:

        response = requests.get(
            SEARCH_URL,
            params=params,
            timeout=30
        )

        print(
            "HTTP Status:",
            response.status_code
        )

        response.raise_for_status()

        data = response.json()

    except requests.exceptions.RequestException as e:

        print("\n[ERROR] MOSDAC request failed:")
        print(e)

        raise SystemExit(1)

    except ValueError:

        print(
            "\n[ERROR] Invalid JSON returned by MOSDAC."
        )

        print(
            response.text[:1000]
        )

        raise SystemExit(1)


    entries = data.get(
        "entries",
        []
    )

    print(
        "Entries returned:",
        len(entries)
    )


    if not entries:
        break


    all_entries.extend(
        entries
    )


    total_results = data.get(
        "totalResults"
    )

    print(
        "Total results reported:",
        total_results
    )


    # --------------------------------------------------------
    # Stop conditions
    # --------------------------------------------------------

    if total_results is not None:

        if len(all_entries) >= int(
            total_results
        ):
            break


    if len(entries) < COUNT:
        break


    start_index += COUNT


# ============================================================
# REMOVE DUPLICATES
# ============================================================

unique_entries = {}

for item in all_entries:

    identifier = item.get(
        "identifier"
    )

    if identifier:

        unique_entries[
            identifier
        ] = item


all_entries = list(
    unique_entries.values()
)


# ============================================================
# SORT BY TIME
# ============================================================

all_entries.sort(
    key=lambda x: x.get(
        "updated",
        ""
    )
)


# ============================================================
# BUILD OUTPUT
# ============================================================

output = {

    "datasetId": DATASET_ID,

    "startTime": START_TIME,

    "endTime": END_TIME,

    "boundingBox": BOUNDING_BOX,

    "totalResults": len(
        all_entries
    ),

    "entries": all_entries

}


# ============================================================
# SAVE
# ============================================================

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        output,
        f,
        indent=2
    )


# ============================================================
# DISPLAY
# ============================================================

print(
    "\n========== FINAL METADATA ==========\n"
)

print(
    "Unique records:",
    len(all_entries)
)

print(
    "Saved:",
    OUTPUT_FILE
)


print(
    "\n========== FILES ==========\n"
)

for i, item in enumerate(
    all_entries,
    start=1
):

    print(
        f"{i:02d}. "
        f"{item.get('updated')}  "
        f"{item.get('identifier')}"
    )


print(
    "\n========== COMPLETE ==========\n"
)