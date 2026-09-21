import requests

BASE_URL = "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe"

params = {
    "service": "WMS",
    "version": "1.3.0",
    "request": "GetMap",

    # Hourly observed lightning
    "layers": "lighthourly",

    "styles": "default",

    # India bounding box
    # EPSG:4326 in WMS 1.3.0 uses latitude,longitude order
    "crs": "EPSG:4326",
    "bbox": "6.6,68,37.1,97.5",

    "width": 1200,
    "height": 800,

    "format": "image/png",

    # Historical test date
    "date": "2023-06-15",

    # Test hour
    "hour": "12",
}

print("Requesting Bhuvan hourly lightning...")

response = requests.get(
    BASE_URL,
    params=params,
    timeout=60
)

print("\nURL:")
print(response.url)

print("\nSTATUS:")
print(response.status_code)

print("\nCONTENT TYPE:")
print(response.headers.get("Content-Type"))

if response.status_code == 200:

    content_type = response.headers.get("Content-Type", "")

    if "image" in content_type:

        output_file = "bhuvan_lightning_2023-06-15_12.png"

        with open(output_file, "wb") as f:
            f.write(response.content)

        print("\nSUCCESS!")
        print("Saved:", output_file)
        print("Size:", len(response.content), "bytes")

    else:
        print("\nServer returned something other than an image:")
        print(response.text[:5000])

else:
    print("\nREQUEST FAILED")
    print(response.text[:5000])