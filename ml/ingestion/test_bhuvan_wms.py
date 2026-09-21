import requests

BASE_URL = "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe"

params = {
    "service": "WMS",
    "request": "GetCapabilities",
}

print("Requesting:", BASE_URL)

response = requests.get(
    BASE_URL,
    params=params,
    timeout=30
)

print("\nURL:")
print(response.url)

print("\nSTATUS:")
print(response.status_code)

print("\nCONTENT TYPE:")
print(response.headers.get("Content-Type"))

print("\nRESPONSE:")
print(response.text[:15000])