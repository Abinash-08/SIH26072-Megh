import requests

BASE_URL = (
    "https://bhuvan-ras2.nrsc.gov.in/"
    "usrtasks/heatwave/get/hourlygridvalue.php"
)

# We got this from GetFeatureInfo
GID = 8518

DATE = "2023-06-15"
HOUR = "12"

# Bhuvan frontend uses a user parameter.
# Try without username first.
params = {
    "gid": GID,
    "date": DATE,
    "hour": HOUR,
}

print("Requesting Bhuvan lightning value...")

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