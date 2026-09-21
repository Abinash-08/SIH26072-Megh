from pathlib import Path
import re
import pandas as pd


TENSOR_DIR = Path(
    "data/processed/radar/tensors"
)

OUTPUT_DIR = Path(
    "data/processed/radar"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print("\n========== RADAR OBSERVATION INDEX ==========\n")


files = sorted(
    TENSOR_DIR.glob("*.npy")
)


if not files:
    print("[ERROR] No radar tensors found.")
    raise SystemExit(1)


records = []


for file in files:

    name = file.name

    # Example:
    # paradip_ppi_z_20260901T080415Z_radar_128x128.npy

    match = re.search(
        r"(\d{8}T\d{6}Z)",
        name
    )

    if not match:
        print(
            "[WARNING] Timestamp not found:",
            name
        )
        continue


    timestamp = match.group(1)


    if "ppi" in name.lower():
        product = "PPI_Z"

    elif "max" in name.lower():
        product = "MAX_Z"

    else:
        product = "UNKNOWN"


    records.append(
        {
            "timestamp": timestamp,
            "product": product,
            "file": str(file),
        }
    )


df = pd.DataFrame(records)


if df.empty:
    print("[ERROR] No valid radar observations.")
    raise SystemExit(1)


df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    format="%Y%m%dT%H%M%SZ",
    utc=True
)


df = df.sort_values(
    ["timestamp", "product"]
).reset_index(drop=True)


print("Total tensor files:", len(df))

print(
    "Unique timestamps:",
    df["timestamp"].nunique()
)

print("\nProducts:")
print(
    df["product"].value_counts()
)

print("\n========== OBSERVATIONS ==========\n")

print(df.to_string(index=False))


output = OUTPUT_DIR / "radar_observation_index.csv"

df.to_csv(
    output,
    index=False
)


print("\nSaved:")
print(output)


print(
    "\n========== TEMPORAL READINESS ==========\n"
)

timestamps = sorted(
    df["timestamp"].unique()
)

for timestamp in timestamps:

    products = df.loc[
        df["timestamp"] == timestamp,
        "product"
    ].tolist()

    print(
        timestamp,
        "->",
        ", ".join(products)
    )


if len(timestamps) < 3:

    print(
        "\n[INFO] Not enough timestamps "
        "for temporal sequence construction."
    )

    print(
        "[INFO] Need multiple radar timestamps."
    )

else:

    print(
        "\n[OK] Enough timestamps "
        "for sequence construction."
    )


print("\n========== COMPLETE ==========\n")