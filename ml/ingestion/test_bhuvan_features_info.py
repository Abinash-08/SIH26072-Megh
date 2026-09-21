import requests

BASE_URL = "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe"

# India bounding box
MIN_LAT = 6.6
MIN_LON = 68.0
MAX_LAT = 37.1
MAX_LON = 97.5

WIDTH = 1200
HEIGHT = 800

# Test location
# Odisha
LAT = 20.30
LON = 85.80

# Historical test date/hour
DATE = "2023-06-15"
HOUR = "12"

# Convert geographic coordinate to image pixel
i = int(
    (LON - MIN_LON)
    / (MAX_LON - MIN_LON)
    * WIDTH
)

j = int(
    (MAX_LAT - LAT)
    / (MAX_LAT - MIN_LAT)
    * HEIGHT
)

print("Test location:")
print("Latitude :", LAT)
print("Longitude:", LON)

print("\nCalculated pixel:")
print("i =", i)
print("j =", j)

params = {
    "service": "WMS",
    "version": "1.3.0",
    "request": "GetFeatureInfo",

    # Lightning layer
    "layers": "lighthourly",
    "query_layers": "lighthourly",

    "styles": "default",

    "crs": "EPSG:4326",

    # WMS 1.3.0 EPSG:4326
    # axis order = latitude, longitude
    "bbox": f"{MIN_LAT},{MIN_LON},{MAX_LAT},{MAX_LON}",

    "width": WIDTH,
    "height": HEIGHT,

    # Pixel clicked
    "i": i,
    "j": j,

    # Ask for machine-readable response
    "info_format": "application/vnd.ogc.gml",

    # Bhuvan lightning parameters
    "date": DATE,
    "hour": HOUR,
}

print("\nRequesting:")
print(BASE_URL)

response = requests.get(
    BASE_URL,
    params=params,
    timeout=60
)

print("\n--------------------------------")
print("STATUS:")
print(response.status_code)

print("\nCONTENT TYPE:")
print(response.headers.get("Content-Type"))

print("\nURL:")
print(response.url)

print("\n--------------------------------")
print("RESPONSE:")
print(response.text[:10000])