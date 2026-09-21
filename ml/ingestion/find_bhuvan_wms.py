import requests
import re

BASE = "https://bhuvan-app1.nrsc.gov.in/lightning/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0 Safari/537.36"
    )
}

session = requests.Session()

print("=" * 80)
print("BHUvan LIGHTNING WMS DISCOVERY")
print("=" * 80)

# -------------------------------------------------------
# Download heatwave.js
# -------------------------------------------------------

url = BASE + "usrtasks/heatwave/heatwave.js"

print("\nDownloading:")
print(url)

r = session.get(url, headers=HEADERS, timeout=30)

print("STATUS:", r.status_code)
print("SIZE:", len(r.text))

if r.status_code != 200:
    print(r.text[:1000])
    raise SystemExit()

js = r.text

with open(
    "bhuvan_heatwave.js",
    "w",
    encoding="utf-8",
    errors="ignore"
) as f:
    f.write(js)

print("Saved: bhuvan_heatwave.js")


# -------------------------------------------------------
# Find lightning positions
# -------------------------------------------------------

print("\n" + "=" * 80)
print("SEARCHING FOR LIGHTNING CODE")
print("=" * 80)

terms = [
    "lighthourly",
    "lightforecast",
    'layerName = "light"',
    "new OpenLayers.Layer.WMS",
    "hourlygridvalue.php"
]

for term in terms:

    print("\nTERM:", term)

    positions = [
        m.start()
        for m in re.finditer(
            re.escape(term),
            js,
            re.IGNORECASE
        )
    ]

    print("Matches:", len(positions))

    for pos in positions[:10]:

        start = max(0, pos - 2000)
        end = min(len(js), pos + 3000)

        print("\n" + "-" * 80)
        print(js[start:end])
        print("-" * 80)


# -------------------------------------------------------
# Find all URLs
# -------------------------------------------------------

print("\n" + "=" * 80)
print("ALL HTTP/HTTPS URLs")
print("=" * 80)

urls = sorted(set(
    re.findall(
        r'https?://[^\'"\s]+',
        js,
        re.IGNORECASE
    )
))

for u in urls:
    print(u)


# -------------------------------------------------------
# Search for assignments to url
# -------------------------------------------------------

print("\n" + "=" * 80)
print("URL VARIABLE ASSIGNMENTS")
print("=" * 80)

patterns = [
    r'\burl\s*=\s*[^;]+;',
    r'\bvar\s+url\s*=\s*[^;]+;',
    r'\blet\s+url\s*=\s*[^;]+;',
    r'\bconst\s+url\s*=\s*[^;]+;',
    r'\burl\s*:\s*[^,]+,'
]

for pattern in patterns:

    matches = re.findall(
        pattern,
        js,
        flags=re.IGNORECASE
    )

    for match in matches:
        print(match)


print("\n" + "=" * 80)
print("DONE")
print("=" * 80)