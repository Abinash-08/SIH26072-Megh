import numpy as np
import matplotlib.pyplot as plt


sequence = np.load(
    "processed/mosdac_sequence_4frames_48x48.npy"
)

timestamps = [
    "06:42",
    "06:57",
    "07:12",
    "07:28"
]


fig, axes = plt.subplots(
    1,
    4,
    figsize=(16, 4)
)


for i, ax in enumerate(axes):

    im = ax.imshow(
        sequence[i],
        origin="lower",
        cmap="turbo"
    )

    ax.set_title(
        timestamps[i]
    )

    ax.set_xlabel(
        "X"
    )

    ax.set_ylabel(
        "Y"
    )


fig.colorbar(
    im,
    ax=axes.ravel().tolist(),
    label="Radar-derived VIL"
)


fig.suptitle(
    "MOSDAC TERLS Radar-derived VIL Sequence"
)

plt.tight_layout()

plt.savefig(
    "processed/mosdac_sequence_visualization.png",
    dpi=150
)

plt.show()