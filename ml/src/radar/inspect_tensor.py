from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt


INPUT_DIR = Path(
    "data/processed/radar/tensors"
)

OUTPUT_DIR = Path(
    "data/processed/radar/tensor_previews"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


print("\n========== RADAR TENSOR INSPECTION ==========\n")


files = sorted(
    INPUT_DIR.glob("*.npy")
)


if not files:

    print("[ERROR] No tensor files found.")
    raise SystemExit(1)


print("Tensor files:", len(files))


for file in files:

    print("\n----------------------------------------")
    print("File:", file.name)


    tensor = np.load(file)


    print("Shape:", tensor.shape)
    print("dtype:", tensor.dtype)
    print("Min:", float(tensor.min()))
    print("Max:", float(tensor.max()))
    print("Mean:", float(tensor.mean()))


    # Remove channel dimension
    field = tensor[:, :, 0]


    # Convert normalized values back to dBZ
    dbz = field * 40.0 + 20.0


    print(
        "Approx dBZ min:",
        float(dbz.min())
    )

    print(
        "Approx dBZ max:",
        float(dbz.max())
    )

    print(
        "Approx dBZ mean:",
        float(dbz.mean())
    )


    # ------------------------------------------------
    # Save preview
    # ------------------------------------------------

    output_file = (
        OUTPUT_DIR /
        f"{file.stem}_preview.png"
    )


    plt.figure(
        figsize=(7, 6)
    )

    plt.imshow(
        dbz,
        vmin=20,
        vmax=60,
        cmap="turbo"
    )

    plt.colorbar(
        label="Reflectivity (dBZ)"
    )

    plt.title(
        file.stem
    )

    plt.axis("off")

    plt.tight_layout()

    plt.savefig(
        output_file,
        dpi=150
    )

    plt.close()


    print(
        "[OK] Preview:",
        output_file
    )


print("\n========== COMPLETE ==========\n")