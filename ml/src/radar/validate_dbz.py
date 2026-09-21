from pathlib import Path
import numpy as np


DBZ_DIR = Path("data/processed/radar/reflectivity")


print("\n========== dBZ FIELD VALIDATION ==========\n")


files = sorted(DBZ_DIR.glob("*_radar.npy"))

if not files:
    print("[ERROR] No radar .npy files found.")
    raise SystemExit(1)


for file in files:

    print("----------------------------------------")
    print("File:", file.name)

    dbz = np.load(file)

    print("Shape:", dbz.shape)
    print("Data type:", dbz.dtype)

    valid = np.isfinite(dbz)

    total = dbz.size
    valid_count = int(valid.sum())
    missing_count = int((~valid).sum())

    print("Total pixels:", total)
    print("Valid pixels:", valid_count)
    print("Missing pixels:", missing_count)

    if valid_count == 0:
        print("[WARNING] No valid radar data.")
        continue

    values = dbz[valid]

    print(
        "Coverage: %.2f%%"
        % (100.0 * valid_count / total)
    )

    print("Minimum dBZ:", float(values.min()))
    print("Maximum dBZ:", float(values.max()))
    print("Mean dBZ:", float(values.mean()))
    print("Median dBZ:", float(np.median(values)))

    print("\nUnique dBZ values:")

    unique, counts = np.unique(
        values,
        return_counts=True
    )

    for value, count in zip(unique, counts):

        print(
            "  %6.2f dBZ : %d pixels"
            % (value, count)
        )


print("\n========== COMPLETE ==========\n")