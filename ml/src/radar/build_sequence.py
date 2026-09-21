from pathlib import Path
import numpy as np
import pandas as pd


TENSOR_DIR = Path(
    "data/processed/radar/tensors"
)

INDEX_FILE = Path(
    "data/processed/radar/radar_observation_index.csv"
)

OUTPUT_DIR = Path(
    "data/processed/radar/sequences"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# CONFIGURATION
# ============================================================

SEQUENCE_LENGTH = 5

TARGET_SHAPE = (
    128,
    128,
    1
)


print("\n========== RADAR SEQUENCE BUILDER ==========\n")

print(
    "Required sequence length:",
    SEQUENCE_LENGTH
)

print(
    "Expected frame shape:",
    TARGET_SHAPE
)


# ============================================================
# LOAD INDEX
# ============================================================

if not INDEX_FILE.exists():

    print(
        "[ERROR] Radar observation index not found:"
    )

    print(INDEX_FILE)

    raise SystemExit(1)


index = pd.read_csv(
    INDEX_FILE
)

index["timestamp"] = pd.to_datetime(
    index["timestamp"],
    utc=True
)

index = index.sort_values(
    "timestamp"
).reset_index(drop=True)


print(
    "\nTotal radar observations:",
    len(index)
)

print(
    "Unique timestamps:",
    index["timestamp"].nunique()
)


# ============================================================
# GROUP BY TIMESTAMP
# ============================================================

timestamp_groups = []

for timestamp, group in index.groupby(
    "timestamp",
    sort=True
):

    timestamp_groups.append(
        {
            "timestamp": timestamp,
            "products": group["product"].tolist(),
            "files": group["file"].tolist()
        }
    )


print(
    "Unique timestamps:",
    len(timestamp_groups)
)


# ============================================================
# TEMPORAL READINESS
# ============================================================

if len(timestamp_groups) < SEQUENCE_LENGTH:

    print("\n[INFO] Temporal sequence cannot be built yet.")

    print(
        "Available timestamps:",
        len(timestamp_groups)
    )

    print(
        "Required timestamps:",
        SEQUENCE_LENGTH
    )

    print(
        "\nReason:"
    )

    print(
        "MAX_Z and PPI_Z at the same timestamp "
        "are products, not separate temporal frames."
    )

    print(
        "\nNeed at least:",
        SEQUENCE_LENGTH,
        "different radar timestamps."
    )

    raise SystemExit(0)


# ============================================================
# BUILD SEQUENCES
# ============================================================

sequences = []


for start in range(
    len(timestamp_groups) - SEQUENCE_LENGTH + 1
):

    window = timestamp_groups[
        start:
        start + SEQUENCE_LENGTH
    ]

    timestamps = [
        item["timestamp"]
        for item in window
    ]

    # --------------------------------------------------------
    # Check temporal continuity
    # --------------------------------------------------------

    deltas = []

    for i in range(1, len(timestamps)):

        delta = (
            timestamps[i] -
            timestamps[i - 1]
        ).total_seconds() / 60.0

        deltas.append(delta)


    # --------------------------------------------------------
    # Use PPI_Z as primary sequence channel
    # --------------------------------------------------------

    frames = []

    valid_sequence = True


    for item in window:

        matching = index[
            (index["timestamp"] == item["timestamp"]) &
            (index["product"] == "PPI_Z")
        ]

        if matching.empty:

            valid_sequence = False
            break


        tensor_file = Path(
            matching.iloc[0]["file"]
        )

        if not tensor_file.exists():

            valid_sequence = False
            break


        tensor = np.load(
            tensor_file
        )


        if tensor.shape != TARGET_SHAPE:

            print(
                "[WARNING] Invalid tensor shape:",
                tensor.shape
            )

            valid_sequence = False
            break


        frames.append(tensor)


    if not valid_sequence:
        continue


    sequence = np.stack(
        frames,
        axis=0
    )


    print("\n----------------------------------------")

    print(
        "Sequence:",
        start + 1
    )

    print(
        "Time range:",
        timestamps[0],
        "→",
        timestamps[-1]
    )

    print(
        "Intervals:",
        deltas
    )

    print(
        "Sequence shape:",
        sequence.shape
    )


    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    filename = (
        f"sequence_{start + 1:04d}.npy"
    )

    output_file = (
        OUTPUT_DIR / filename
    )

    np.save(
        output_file,
        sequence
    )

    print(
        "[OK] Saved:",
        output_file
    )


    sequences.append(
        {
            "sequence_id": start + 1,
            "start_time": timestamps[0],
            "end_time": timestamps[-1],
            "intervals_minutes": str(deltas),
            "shape": str(sequence.shape),
            "file": str(output_file)
        }
    )


# ============================================================
# SAVE MANIFEST
# ============================================================

if sequences:

    manifest = pd.DataFrame(
        sequences
    )

    manifest_file = (
        OUTPUT_DIR /
        "sequence_manifest.csv"
    )

    manifest.to_csv(
        manifest_file,
        index=False
    )

    print(
        "\nSequence manifest saved:"
    )

    print(manifest_file)

else:

    print(
        "\nNo valid temporal sequences generated."
    )


print(
    "\n========== COMPLETE ==========\n"
)