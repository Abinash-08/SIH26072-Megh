import numpy as np

vil = np.load(
    "processed/vil_2018_09_07_06_42_36.npy"
)

mask = vil > 0

ys, xs = np.where(mask)

if len(xs) == 0:
    print("No non-zero VIL pixels found.")
else:
    print("Non-zero pixels:", len(xs))

    print()
    print("Echo bounding box")
    print("-----------------")
    print("X min:", xs.min())
    print("X max:", xs.max())
    print("Y min:", ys.min())
    print("Y max:", ys.max())

    print()
    print("Echo width:", xs.max() - xs.min() + 1)
    print("Echo height:", ys.max() - ys.min() + 1)