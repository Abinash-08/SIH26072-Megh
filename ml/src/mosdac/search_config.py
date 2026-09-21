from pathlib import Path

# ============================================================
# MEGHDRISHTI MOSDAC SEARCH CONFIG
# ============================================================

DATASET_ID = "3SIMG_L1B_STD"

# Known TSRA event
START_DATE = "2026-04-06"
END_DATE = "2026-04-06"

# Odisha / Bhubaneswar prototype region
MIN_LON = 84.0
MIN_LAT = 19.0
MAX_LON = 87.0
MAX_LAT = 21.5

BOUNDING_BOX = (
    f"{MIN_LON},{MIN_LAT},{MAX_LON},{MAX_LAT}"
)

# Keep the first test small
COUNT = 10

# Project paths
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "data"

RAW_DIR = DATA_DIR / "raw" / "satellite"

PROCESSED_DIR = DATA_DIR / "processed" / "satellite"

METADATA_DIR = DATA_DIR / "metadata"

REPORT_DIR = PROJECT_ROOT / "reports"

# Create directories
RAW_DIR.mkdir(
    parents=True,
    exist_ok=True
)

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True
)

METADATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


if __name__ == "__main__":

    print("\n========== MEGHDRISHTI MOSDAC CONFIG ==========\n")

    print("Dataset:", DATASET_ID)

    print("Start:", START_DATE)

    print("End:", END_DATE)

    print("Bounding box:", BOUNDING_BOX)

    print("Count:", COUNT)

    print("\nRaw directory:")
    print(RAW_DIR)

    print("\nProcessed directory:")
    print(PROCESSED_DIR)

    print("\nMetadata directory:")
    print(METADATA_DIR)