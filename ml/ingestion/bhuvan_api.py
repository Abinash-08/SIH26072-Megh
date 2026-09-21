import requests


BHUVAN_URL = "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe"

# India grid extent
MIN_LAT = 6.6
MIN_LON = 68.0
MAX_LAT = 37.1
MAX_LON = 97.5


def latlon_to_pixel(lat, lon, width=2000, height=1200):
    """
    Convert latitude/longitude to WMS pixel coordinates.
    """

    i = int(
        (lon - MIN_LON)
        / (MAX_LON - MIN_LON)
        * width
    )

    j = int(
        (MAX_LAT - lat)
        / (MAX_LAT - MIN_LAT)
        * height
    )

    return i, j


def get_grid_id(lat, lon):
    """
    Get Bhuvan grid ID for a geographic coordinate.
    """

    width = 2000
    height = 1200

    i, j = latlon_to_pixel(
        lat,
        lon,
        width,
        height
    )

    params = {
        "service": "WMS",
        "version": "1.3.0",
        "request": "GetFeatureInfo",

        "layers": "grid",
        "query_layers": "grid",

        "styles": "default",
        "crs": "EPSG:4326",

        "bbox": (
            f"{MIN_LAT},{MIN_LON},"
            f"{MAX_LAT},{MAX_LON}"
        ),

        "width": width,
        "height": height,

        "i": i,
        "j": j,

        "info_format": "text/plain",
    }

    response = requests.get(
        BHUVAN_URL,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    text = response.text

    # Example:
    #
    # Layer 'grid'
    #   Feature 8518:
    #

    gid = None

    for line in text.splitlines():

        line = line.strip()

        if line.startswith("Feature "):

            try:
                gid = int(
                    line.split("Feature ")[1]
                    .split(":")[0]
                )
            except ValueError:
                pass

            break

    return {
        "latitude": lat,
        "longitude": lon,
        "grid_id": gid,
        "raw_response": text
    }


if __name__ == "__main__":

    result = get_grid_id(
        20.30,
        85.80
    )

    print(result)