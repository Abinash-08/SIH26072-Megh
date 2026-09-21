from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ml.ingestion.bhuvan_api import get_grid_id


app = FastAPI(
    title="MeghDhristi AI Weather API",
    version="1.0"
)


# Allow your frontend to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():

    return {
        "project": "MeghDhristi",
        "status": "online"
    }


@app.get("/api/lightning/grid")
def lightning_grid(
    lat: float,
    lon: float
):

    try:

        result = get_grid_id(
            lat,
            lon
        )

        return {
            "success": True,
            "source": "NRSC / Bhuvan",
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )