from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model


SEQUENCE_LENGTH = 5
HEIGHT = 128
WIDTH = 128
CHANNELS = 1


print("\n========== RADAR TEMPORAL MODEL ==========\n")

print("Expected input:")
print(
    f"({SEQUENCE_LENGTH}, {HEIGHT}, {WIDTH}, {CHANNELS})"
)


# ============================================================
# MODEL
# ============================================================

inputs = layers.Input(
    shape=(
        SEQUENCE_LENGTH,
        HEIGHT,
        WIDTH,
        CHANNELS
    ),
    name="radar_sequence"
)


x = layers.ConvLSTM2D(
    filters=16,
    kernel_size=(3, 3),
    padding="same",
    return_sequences=True,
    activation="relu",
    name="convlstm_1"
)(inputs)


x = layers.BatchNormalization(
    name="batch_norm_1"
)(x)


x = layers.ConvLSTM2D(
    filters=32,
    kernel_size=(3, 3),
    padding="same",
    return_sequences=False,
    activation="relu",
    name="convlstm_2"
)(x)


x = layers.BatchNormalization(
    name="batch_norm_2"
)(x)


x = layers.GlobalAveragePooling2D(
    name="global_average_pool"
)(x)


embedding = layers.Dense(
    32,
    activation="relu",
    name="radar_embedding"
)(x)


outputs = layers.Dense(
    1,
    activation="sigmoid",
    name="radar_probability"
)(embedding)


model = Model(
    inputs=inputs,
    outputs=outputs,
    name="Meghdrishti_Radar_ConvLSTM"
)


model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=[
        "accuracy"
    ]
)


# ============================================================
# DISPLAY
# ============================================================

model.summary()


# ============================================================
# SHAPE TEST
# ============================================================

dummy = np.zeros(
    (
        1,
        SEQUENCE_LENGTH,
        HEIGHT,
        WIDTH,
        CHANNELS
    ),
    dtype=np.float32
)


prediction = model.predict(
    dummy,
    verbose=0
)


print("\n========== SHAPE TEST ==========\n")

print(
    "Dummy input shape:",
    dummy.shape
)

print(
    "Model output shape:",
    prediction.shape
)

print(
    "Dummy probability:",
    float(prediction[0, 0])
)


# ============================================================
# SAVE MODEL ARCHITECTURE
# ============================================================

OUTPUT_DIR = Path(
    "models"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


MODEL_PATH = (
    OUTPUT_DIR /
    "radar_convlstm_untrained.keras"
)


model.save(
    MODEL_PATH
)


print("\nSaved untrained model:")
print(MODEL_PATH)


print("\n========== COMPLETE ==========\n")