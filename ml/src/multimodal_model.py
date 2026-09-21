from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model


# ============================================================
# CONFIGURATION
# ============================================================

A2_FEATURES = 11

SEQUENCE_LENGTH = 5
HEIGHT = 128
WIDTH = 128
CHANNELS = 1


print("\n========== MEGHDRISHTI MULTIMODAL MODEL ==========\n")

print("A2 input features:", A2_FEATURES)

print(
    "Radar input:",
    f"({SEQUENCE_LENGTH}, {HEIGHT}, {WIDTH}, {CHANNELS})"
)


# ============================================================
# A2 ATMOSPHERIC BRANCH
# ============================================================

a2_input = layers.Input(
    shape=(A2_FEATURES,),
    name="a2_atmospheric_input"
)


a2 = layers.Dense(
    32,
    activation="relu",
    name="a2_dense_1"
)(a2_input)


a2 = layers.BatchNormalization(
    name="a2_batch_norm"
)(a2)


a2 = layers.Dense(
    16,
    activation="relu",
    name="a2_embedding"
)(a2)


# ============================================================
# RADAR TEMPORAL BRANCH
# ============================================================

radar_input = layers.Input(
    shape=(
        SEQUENCE_LENGTH,
        HEIGHT,
        WIDTH,
        CHANNELS
    ),
    name="radar_sequence_input"
)


radar = layers.ConvLSTM2D(
    filters=16,
    kernel_size=(3, 3),
    padding="same",
    return_sequences=True,
    activation="relu",
    name="radar_convlstm_1"
)(radar_input)


radar = layers.BatchNormalization(
    name="radar_bn_1"
)(radar)


radar = layers.ConvLSTM2D(
    filters=32,
    kernel_size=(3, 3),
    padding="same",
    return_sequences=False,
    activation="relu",
    name="radar_convlstm_2"
)(radar)


radar = layers.BatchNormalization(
    name="radar_bn_2"
)(radar)


radar = layers.GlobalAveragePooling2D(
    name="radar_global_pool"
)(radar)


radar = layers.Dense(
    32,
    activation="relu",
    name="radar_embedding"
)(radar)


# ============================================================
# MULTIMODAL FUSION
# ============================================================

fusion = layers.Concatenate(
    name="multimodal_fusion"
)(
    [
        a2,
        radar
    ]
)


fusion = layers.Dense(
    32,
    activation="relu",
    name="fusion_dense"
)(fusion)


fusion = layers.Dropout(
    0.30,
    name="fusion_dropout"
)(fusion)


fusion = layers.Dense(
    16,
    activation="relu",
    name="fusion_dense_2"
)(fusion)


# ============================================================
# OUTPUT
# ============================================================

output = layers.Dense(
    1,
    activation="sigmoid",
    name="thunderstorm_probability"
)(fusion)


# ============================================================
# MODEL
# ============================================================

model = Model(
    inputs=[
        a2_input,
        radar_input
    ],
    outputs=output,
    name="MEGHDRISHTI_Multimodal"
)


model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=[
        "accuracy"
    ]
)


# ============================================================
# MODEL SUMMARY
# ============================================================

model.summary()


# ============================================================
# SHAPE TEST
# ============================================================

dummy_a2 = np.zeros(
    (
        1,
        A2_FEATURES
    ),
    dtype=np.float32
)


dummy_radar = np.zeros(
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
    {
        "a2_atmospheric_input": dummy_a2,
        "radar_sequence_input": dummy_radar
    },
    verbose=0
)


print("\n========== SHAPE TEST ==========\n")

print(
    "A2 input:",
    dummy_a2.shape
)

print(
    "Radar input:",
    dummy_radar.shape
)

print(
    "Output:",
    prediction.shape
)

print(
    "Dummy probability:",
    float(prediction[0, 0])
)


# ============================================================
# SAVE
# ============================================================

MODEL_DIR = Path(
    "models"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


MODEL_PATH = (
    MODEL_DIR /
    "meghdrishti_multimodal_untrained.keras"
)


model.save(
    MODEL_PATH
)


print("\nSaved:")
print(MODEL_PATH)


print("\n========== COMPLETE ==========\n")