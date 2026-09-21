import requests

BASE_URL = "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe"

DATE = "2023-06-15"
HOUR = "12"

# Try several locations around Odisha
locations = [
    (20.30, 85.80),
    (20.35, 85.85),
    (20.40, 85.90),
    (20.25, 85.75),
    (21.00, 86.00),
]

MIN_LAT = 6.6
MIN_LON = 68.0
MAX_LAT = 37.1
MAX_LON = 97.5

WIDTH = 2000
HEIGHT = 1200


def latlon_to_pixel(lat, lon):

    i = int(
        (lon - MIN_LON)
        / (MAX_LON - MIN_LON)
        * WIDTH
    )

    j = int(
        (MAX_LAT - lat)
        / (MAX_LAT - MIN_LAT)
        * HEIGHT
    )

    return i, j


for lat, lon in locations:

    i, j = latlon_to_pixel(lat, lon)

    params = {
        "service": "WMS",
        "version": "1.3.0",
        "request": "GetFeatureInfo",

        "layers": "grid",
        "query_layers": "grid",

        "styles": "default",
        "crs": "EPSG:4326",

        "bbox": f"{MIN_LAT},{MIN_LON},{MAX_LAT},{MAX_LON}",

        "width": WIDTH,
        "height": HEIGHT,

        "i": i,
        "j": j,

        "info_format": "text/plain",

        "date": DATE,
        "hour": HOUR,
    }

    print("\n======================================")
    print("LOCATION")
    print("Lat:", lat)
    print("Lon:", lon)

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=60
    )

    print("\nSTATUS:", response.status_code)
    print("CONTENT TYPE:", response.headers.get("Content-Type"))

    print("\nRESPONSE:")
    print(response.text[:5000])