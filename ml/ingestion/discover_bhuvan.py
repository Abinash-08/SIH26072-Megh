import re
import requests
from urllib.parse import urljoin

BASE = "https://bhuvan-app1.nrsc.gov.in/lightning/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 Chrome/131.0 Safari/537.36"
}

session = requests.Session()

print("=" * 70)
print("BHUVAN LIGHTNING ENDPOINT DISCOVERY")
print("=" * 70)

# ---------------------------------------------------------
# 1. Download main HTML
# ---------------------------------------------------------

print("\n[1] Downloading main page...")

r = session.get(BASE, headers=HEADERS, timeout=30)

print("STATUS:", r.status_code)
print("SIZE:", len(r.text))

r.raise_for_status()

html = r.text

# Save it so we can inspect it
with open("bhuvan_page.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Saved: bhuvan_page.html")


# ---------------------------------------------------------
# 2. Search HTML itself
# ---------------------------------------------------------

print("\n[2] Searching HTML for possible data endpoints...")

patterns = [
    r'https?://[^"\']+',
    r'["\'][^"\']+\.php[^"\']*["\']',
    r'["\'][^"\']+\.json[^"\']*["\']',
    r'["\'][^"\']+\.geojson[^"\']*["\']',
    r'["\'][^"\']+/wms[^"\']*["\']',
    r'["\'][^"\']+/wfs[^"\']*["\']',
    r'["\'][^"\']+lightning[^"\']*["\']',
    r'["\'][^"\']+ecv[^"\']*["\']',
]

found = set()

for pattern in patterns:

    matches = re.findall(
        pattern,
        html,
        flags=re.IGNORECASE
    )

    for item in matches:
        item = item.strip("\"'")

        if len(item) > 5:
            found.add(item)


for item in sorted(found):

    lower = item.lower()

    if any(x in lower for x in [
        "lightning",
        "ecv",
        ".php",
        ".json",
        "wms",
        "wfs",
        "geojson"
    ]):

        print("FOUND:", item)


# ---------------------------------------------------------
# 3. Find inline JavaScript
# ---------------------------------------------------------

print("\n[3] Extracting inline JavaScript...")

inline_scripts = re.findall(
    r"<script[^>]*>(.*?)</script>",
    html,
    flags=re.IGNORECASE | re.DOTALL
)

print("Inline script blocks:", len(inline_scripts))


# ---------------------------------------------------------
# 4. Search inline JS for AJAX / URLs / layers
# ---------------------------------------------------------

keywords = [
    "lightning",
    "ecv",
    "ajax",
    "$.get",
    "$.post",
    "$.ajax",
    "url:",
    "OpenLayers.Layer",
    "WMS",
    "WFS",
    "GeoJSON",
    ".php",
]

print("\n[4] Searching inline JavaScript...")

for index, js in enumerate(inline_scripts):

    for keyword in keywords:

        positions = [
            m.start()
            for m in re.finditer(
                re.escape(keyword),
                js,
                flags=re.IGNORECASE
            )
        ]

        if positions:

            print(
                f"\nFOUND '{keyword}' "
                f"in inline script #{index}"
            )

            for pos in positions[:5]:

                start = max(0, pos - 400)
                end = min(len(js), pos + 1000)

                print("-" * 60)
                print(js[start:end])


# ---------------------------------------------------------
# 5. Download external JavaScript
# ---------------------------------------------------------

print("\n[5] Finding external JavaScript files...")

scripts = re.findall(
    r'<script[^>]+src=["\']([^"\']+)["\']',
    html,
    flags=re.IGNORECASE
)

print("Scripts:", len(scripts))

for script in scripts:

    url = urljoin(BASE, script)

    print("\nDownloading:")
    print(url)

    try:

        js_response = session.get(
            url,
            headers=HEADERS,
            timeout=30
        )

        js = js_response.text

        print(
            "STATUS:",
            js_response.status_code,
            "SIZE:",
            len(js)
        )

    except Exception as e:

        print("ERROR:", e)
        continue


    # Save JS locally
    filename = url.split("/")[-1]

    with open(
        "bhuvan_" + filename,
        "w",
        encoding="utf-8",
        errors="ignore"
    ) as f:

        f.write(js)


    # Search interesting terms
    for keyword in [
        "lightning",
        "ecv",
        "ajax",
        ".php",
        "wms",
        "wfs",
        "geojson",
        "getCapabilities"
    ]:

        positions = [
            m.start()
            for m in re.finditer(
                re.escape(keyword),
                js,
                flags=re.IGNORECASE
            )
        ]

        if positions:

            print(
                f"\nFOUND '{keyword}' "
                f"in {filename}"
            )

            for pos in positions[:3]:

                start = max(0, pos - 300)
                end = min(len(js), pos + 800)

                print("-" * 60)
                print(js[start:end])


print("\n" + "=" * 70)
print("DISCOVERY COMPLETE")
print("=" * 70)