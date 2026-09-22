import tensorflow as tf
from tensorflow.keras import layers
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

VIL_MIN = -0.2063957
VIL_MAX = 3.04316092
STORM_THRESHOLD = 1.0


MOSDAC_SEQUENCE_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "ml",
        "mosdac",
        "processed",
        "mosdac_sequence_4frames_48x48.npy"
    )
)

# -----------------------------
# Custom layer
# -----------------------------
@tf.keras.utils.register_keras_serializable()
class RepeatTime(layers.Layer):
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


# -----------------------------
# Load trained model
# -----------------------------
model = tf.keras.models.load_model(
    "models/meghdrishti_convlstm_deployment.keras",
    custom_objects={"RepeatTime": RepeatTime},
    compile=False
)

print("MODEL LOADED SUCCESSFULLY")
print("Input shape:", model.input_shape)
print("Output shape:", model.output_shape)


# -----------------------------
# FastAPI
# -----------------------------
app = FastAPI(
    title="Meghdrishti API",
    description="AI Weather Nowcasting Backend",
    version="1.0.0"
)


# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Health check
# -----------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "Meghdrishti ConvLSTM",
        "input_shape": model.input_shape,
        "output_shape": model.output_shape
    }
    
    
from pydantic import BaseModel
import numpy as np


class PredictionRequest(BaseModel):
    frames: list


def get_risk_level(max_vil):
    if max_vil >= 3.0:
        return "extreme"
    elif max_vil >= 2.0:
        return "high"
    elif max_vil >= 1.0:
        return "moderate"
    else:
        return "low"
    
    
@app.post("/predict")
def predict(request: PredictionRequest):

    raw_input = np.array(request.frames, dtype=np.float32)

    if raw_input.shape != (4, 48, 48):
        return {
            "status": "error",
            "error": "Input must have shape [4, 48, 48]",
            "received_shape": list(raw_input.shape)
        }

    # Normalize exactly as during training
    normalized_input = np.clip(
        raw_input,
        VIL_MIN,
        VIL_MAX
    )

    normalized_input = (
        (normalized_input - VIL_MIN)
        / (VIL_MAX - VIL_MIN)
    ).astype(np.float32)

    normalized_input = normalized_input[..., np.newaxis]
    normalized_input = normalized_input[np.newaxis, ...]

    # AI inference
    prediction = model.predict(
        normalized_input,
        verbose=0
    )

    prediction = prediction[0, :, :, :, 0]

    # Denormalize
    forecast_vil = (
        prediction * (VIL_MAX - VIL_MIN)
        + VIL_MIN
    )

    forecasts = []

    for minute, frame in zip([5, 10], forecast_vil):

        max_vil = float(frame.max())
        mean_vil = float(frame.mean())

        storm_coverage = float(
            np.mean(frame >= STORM_THRESHOLD) * 100
        )

        forecasts.append({
            "minutes_ahead": minute,
            "max_vil": max_vil,
            "mean_vil": mean_vil,
            "storm_coverage_percent": storm_coverage,
            "risk_level": get_risk_level(max_vil)
        })

    return {
        "status": "success",
        "model": "Meghdrishti ConvLSTM",
        "input_history_minutes": 20,
        "forecast": forecasts,
        "forecast_shape": [2, 48, 48],

        # Raw forecast grids for the map
        "forecast_vil": forecast_vil.tolist()
    }
    
    
@app.post("/predict-summary")
def predict_summary(request: PredictionRequest):

    raw_input = np.array(request.frames, dtype=np.float32)

    if raw_input.shape != (4, 48, 48):
        return {
            "status": "error",
            "error": "Input must have shape [4, 48, 48]",
            "received_shape": list(raw_input.shape)
        }

    # Normalize
    normalized_input = np.clip(
        raw_input,
        VIL_MIN,
        VIL_MAX
    )

    normalized_input = (
        (normalized_input - VIL_MIN)
        / (VIL_MAX - VIL_MIN)
    ).astype(np.float32)

    normalized_input = normalized_input[..., np.newaxis]
    normalized_input = normalized_input[np.newaxis, ...]

    # Prediction
    prediction = model.predict(
        normalized_input,
        verbose=0
    )

    prediction = prediction[0, :, :, :, 0]

    # Denormalize
    forecast_vil = (
        prediction * (VIL_MAX - VIL_MIN)
        + VIL_MIN
    )

    forecasts = []

    for minute, frame in zip([5, 10], forecast_vil):

        max_vil = float(frame.max())
        mean_vil = float(frame.mean())

        storm_coverage = float(
            np.mean(frame >= STORM_THRESHOLD) * 100
        )

        risk_level = get_risk_level(max_vil)

        forecasts.append({
            "minutes_ahead": minute,
            "max_vil": round(max_vil, 3),
            "mean_vil": round(mean_vil, 3),
            "storm_coverage_percent": round(storm_coverage, 2),
            "risk_level": risk_level
        })

    return {
        "status": "success",
        "model": "Meghdrishti ConvLSTM",
        "input_history_minutes": 20,
        "forecast": forecasts
    }
    
    
@app.post("/predict-mosdac")
def predict_mosdac():

    if not os.path.exists(MOSDAC_SEQUENCE_PATH):
        raise HTTPException(
            status_code=404,
            detail="MOSDAC sequence file not found."
        )

    # ---------------------------------------------
    # Load real MOSDAC 4-frame sequence
    # ---------------------------------------------

    sequence = np.load(
        MOSDAC_SEQUENCE_PATH
    ).astype(np.float32)
    
    original_sequence = sequence.copy()

    if sequence.shape != (4, 48, 48):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MOSDAC sequence shape: {sequence.shape}"
        )

    # ---------------------------------------------
    # Apply same normalization used during training
    # ---------------------------------------------

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

    # Add batch + channel dimensions
    X = sequence[
        np.newaxis,
        ...,
        np.newaxis
    ]

    # ---------------------------------------------
    # ConvLSTM inference
    # ---------------------------------------------

    prediction = model.predict(
        X,
        verbose=0
    )

    # Remove batch/channel dimensions
    prediction = prediction[0, ..., 0]

    # ---------------------------------------------
    # Convert back to VIL
    # ---------------------------------------------

    prediction_vil = (
        prediction * (VIL_MAX - VIL_MIN)
        + VIL_MIN
    )
    
    # Actual forecast grids for frontend animation
    forecast_frames = prediction_vil.tolist()

    # ---------------------------------------------
    # Build forecast summary
    # ---------------------------------------------

    forecast = []

    for i, minutes_ahead in enumerate([5, 10]):

        frame = prediction_vil[i]

        max_vil = float(
            np.max(frame)
        )

        mean_vil = float(
            np.mean(frame)
        )

        storm_pixels = (
            frame >= STORM_THRESHOLD
        )

        storm_coverage = (
            float(
                np.mean(storm_pixels)
            ) * 100
        )

        forecast.append({
            "minutes_ahead": minutes_ahead,
            "max_vil": round(max_vil, 4),
            "mean_vil": round(mean_vil, 4),
            "storm_coverage_percent": round(
                storm_coverage,
                2
            ),
            "risk_level": get_risk_level(
                max_vil
            )
        })

    return {
    "status": "success",
    "source": "MOSDAC TERLS DWR",
    "model": "Meghdrishti ConvLSTM",

    "input_shape": list(sequence.shape),

    "input_cadence_note": (
        "Experimental sequence using approximately "
        "15-minute MOSDAC observations; model was "
        "trained on 5-minute SEVIR sequences."
    ),
    
    "input_frames": original_sequence.tolist(),

    "forecast_frames": forecast_frames,

    "forecast": forecast
}
   
   
@app.get("/analytics")
def analytics():

    if not os.path.exists(MOSDAC_SEQUENCE_PATH):
        raise HTTPException(
            status_code=404,
            detail="MOSDAC sequence file not found."
        )

    # ---------------------------------------------
    # Load MOSDAC sequence
    # ---------------------------------------------

    sequence = np.load(
        MOSDAC_SEQUENCE_PATH
    ).astype(np.float32)

    if sequence.shape != (4, 48, 48):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MOSDAC sequence shape: {sequence.shape}"
        )

    # Keep original VIL
    original_sequence = sequence.copy()

    # ---------------------------------------------
    # Current / latest observed frame
    # ---------------------------------------------

    current_frame = original_sequence[-1]

    current_max_vil = float(
        np.max(current_frame)
    )

    current_mean_vil = float(
        np.mean(current_frame)
    )

    current_storm_coverage = float(
        np.mean(
            current_frame >= STORM_THRESHOLD
        ) * 100
    )

    # ---------------------------------------------
    # Normalize exactly like training
    # ---------------------------------------------

    normalized = np.clip(
        sequence,
        VIL_MIN,
        VIL_MAX
    )

    normalized = (
        normalized - VIL_MIN
    ) / (
        VIL_MAX - VIL_MIN
    )

    X = normalized[
        np.newaxis,
        ...,
        np.newaxis
    ]

    # ---------------------------------------------
    # ConvLSTM inference
    # ---------------------------------------------

    prediction = model.predict(
        X,
        verbose=0
    )

    prediction = prediction[0, ..., 0]

    # ---------------------------------------------
    # Denormalize
    # ---------------------------------------------

    prediction_vil = (
        prediction * (VIL_MAX - VIL_MIN)
        + VIL_MIN
    )

    # ---------------------------------------------
    # Calculate forecast analytics
    # ---------------------------------------------

    forecast_analytics = []

    for i, minutes_ahead in enumerate([5, 10]):

        frame = prediction_vil[i]

        max_vil = float(
            np.max(frame)
        )

        mean_vil = float(
            np.mean(frame)
        )

        storm_coverage = float(
            np.mean(
                frame >= STORM_THRESHOLD
            ) * 100
        )

        forecast_analytics.append({
            "minutes_ahead": minutes_ahead,
            "max_vil": round(max_vil, 4),
            "mean_vil": round(mean_vil, 4),
            "storm_coverage_percent": round(
                storm_coverage,
                2
            ),
            "risk_level": get_risk_level(max_vil)
        })

    # ---------------------------------------------
    # VIL trend
    # ---------------------------------------------

    t5_max = forecast_analytics[0]["max_vil"]
    t10_max = forecast_analytics[1]["max_vil"]

    if t10_max > t5_max + 0.05:
        trend = "increasing"
    elif t10_max < t5_max - 0.05:
        trend = "decreasing"
    else:
        trend = "stable"

    # ---------------------------------------------
    # Coverage trend
    # ---------------------------------------------

    t5_coverage = forecast_analytics[0][
        "storm_coverage_percent"
    ]

    t10_coverage = forecast_analytics[1][
        "storm_coverage_percent"
    ]

    coverage_change = (
        t10_coverage - t5_coverage
    )

    # ---------------------------------------------
    # Return Analytics
    # ---------------------------------------------

    return {

        "status": "success",

        "source": "MOSDAC TERLS DWR",

        "model": "Meghdrishti ConvLSTM",

        "forecast_horizon_minutes": [
            5,
            10
        ],

        "current": {
            "max_vil": round(
                current_max_vil,
                4
            ),

            "mean_vil": round(
                current_mean_vil,
                4
            ),

            "storm_coverage_percent": round(
                current_storm_coverage,
                2
            ),

            "risk_level": get_risk_level(
                current_max_vil
            )
        },

        "forecast": forecast_analytics,

        "trend": {
            "vil": trend,

            "max_vil_change_t5_to_t10": round(
                t10_max - t5_max,
                4
            ),

            "storm_coverage_change_percent": round(
                coverage_change,
                2
            )
        },

        "model_metrics": {

            "test_mae": 0.0483,

            "test_rmse": 0.1974,

            "pod_percent": 74.6,

            "far_percent": 16.8,

            "csi_percent": 64.8
        },

        "notes": {

            "threshold_vil": STORM_THRESHOLD,

            "input_history_minutes": 20,

            "forecast_interval_minutes": [
                5,
                10
            ],

            "experimental_mosdac_domain_transfer": True
        }
    } 
    
    
        
