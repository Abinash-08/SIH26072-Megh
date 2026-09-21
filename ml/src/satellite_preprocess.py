from pathlib import Path
import sys


RAW_DIR = Path(
    "data/raw/satellite"
)

PROCESSED_DIR = Path(
    "data/processed/satellite"
)

FRAMES_DIR = (
    PROCESSED_DIR / "frames"
)

SEQUENCES_DIR = (
    PROCESSED_DIR / "sequences"
)


def main():

    print(
        "\n========== MEGHDRISHTI SATELLITE PIPELINE ==========\n"
    )

    print("Raw directory:")
    print(RAW_DIR)

    print("\nProcessed directory:")
    print(PROCESSED_DIR)

    print("\nFrames directory:")
    print(FRAMES_DIR)

    print("\nSequences directory:")
    print(SEQUENCES_DIR)


    for directory in [
        RAW_DIR,
        PROCESSED_DIR,
        FRAMES_DIR,
        SEQUENCES_DIR,
    ]:

        directory.mkdir(
            parents=True,
            exist_ok=True
        )


    h5_files = sorted(
        RAW_DIR.glob("*.h5")
    )


    print(
        "\nHDF5 files found:",
        len(h5_files)
    )


    if not h5_files:

        print(
            "\n[INFO] No HDF5 satellite files available yet."
        )

        print(
            "MOSDAC metadata is ready."
        )

        print(
            "Waiting for a complete INSAT-3DS HDF5 file."
        )

        return


    print(
        "\n========== FILES ==========\n"
    )


    for file in h5_files:

        size_mb = (
            file.stat().st_size
            / (1024 * 1024)
        )

        print(
            f"{file.name} "
            f"({size_mb:.2f} MB)"
        )


if __name__ == "__main__":
    main()