import h5py
from pathlib import Path
import sys


# ============================================================
# USAGE
# ============================================================

if len(sys.argv) != 2:
    print(
        "Usage:\n"
        "python src/mosdac/inspect_h5.py <file.h5>"
    )
    raise SystemExit(1)


file_path = Path(sys.argv[1])


if not file_path.exists():
    print("[ERROR] File not found:")
    print(file_path)
    raise SystemExit(1)


print("\n========== INSAT HDF5 INSPECTION ==========\n")
print("File:", file_path)
print("Size MB:", round(file_path.stat().st_size / (1024**2), 2))


def visit(name, obj):

    if isinstance(obj, h5py.Dataset):

        print("\nDATASET")
        print("Path:", name)
        print("Shape:", obj.shape)
        print("Dtype:", obj.dtype)

        if obj.attrs:

            print("Attributes:")

            for key, value in obj.attrs.items():

                print(
                    f"  {key}: {value}"
                )


    elif isinstance(obj, h5py.Group):

        print("\nGROUP")
        print("Path:", name)


with h5py.File(
    file_path,
    "r"
) as f:

    print("\n========== ROOT ==========\n")

    for key in f.keys():

        print(
            key
        )

    print(
        "\n========== COMPLETE STRUCTURE =========="
    )

    f.visititems(
        visit
    )


print(
    "\n========== INSPECTION COMPLETE ==========\n"
)