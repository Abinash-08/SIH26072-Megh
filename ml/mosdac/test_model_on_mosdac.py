import numpy as np
import tensorflow as tf


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = "../../backend/models/meghdrishti_convlstm_deployment.keras"


# ============================================================
# LOAD MODEL
# ============================================================

class RepeatTime(tf.keras.layers.Layer):

    def __init__(self, repeats=2, **kwargs):
        super().__init__(**kwargs)
        self.repeats = repeats

    def call(self, inputs):
        return tf.repeat(
            inputs[:, tf.newaxis, ...],
            repeats=self.repeats,
            axis=1
        )

    def get_config(self):
        config = super().get_config()
        config.update({
            "repeats": self.repeats
        })
        return config


model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "RepeatTime": RepeatTime
    },
    compile=False
)

print("Model loaded.")


# ============================================================
# LOAD MOSDAC SEQUENCE
# ============================================================

sequence = np.load(
    "processed/mosdac_sequence_4frames_48x48.npy"
).astype(np.float32)

print("Original sequence shape:", sequence.shape)

print(
    "Original range:",
    float(sequence.min()),
    "to",
    float(sequence.max())
)


# ============================================================
# SAME NORMALIZATION RANGE USED DURING TRAINING
# ============================================================

VIL_MIN = -0.2063957
VIL_MAX = 3.04316092

sequence = np.clip(
    sequence,
    VIL_MIN,
    VIL_MAX
)

sequence = (
    sequence - VIL_MIN
) / (
    VIL_MAX - VIL_MIN
)

sequence = sequence.astype(
    np.float32
)


# ============================================================
# ADD BATCH + CHANNEL DIMENSIONS
# ============================================================

X = sequence[
    np.newaxis,
    ...,
    np.newaxis
]

print("Model input shape:", X.shape)


# ============================================================
# INFERENCE
# ============================================================

prediction = model.predict(
    X,
    verbose=0
)

print(
    "Prediction shape:",
    prediction.shape
)


# ============================================================
# DENORMALIZE
# ============================================================

prediction_vil = (
    prediction
    * (VIL_MAX - VIL_MIN)
    + VIL_MIN
)


prediction_vil = prediction_vil[0, ..., 0]


# ============================================================
# RESULTS
# ============================================================

print()
print("MOSDAC EXPERIMENTAL FORECAST")
print("-----------------------------")

for i in range(2):

    frame = prediction_vil[i]

    print(
        f"+{(i + 1) * 5} min:"
    )

    print(
        "  Min VIL:",
        float(frame.min())
    )

    print(
        "  Max VIL:",
        float(frame.max())
    )

    print(
        "  Mean VIL:",
        float(frame.mean())
    )