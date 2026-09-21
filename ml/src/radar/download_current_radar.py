from pathlib import Path
from datetime import datetime, timezone
import requests


BASE_URL = "https://mausam.imd.gov.in/Radar"

OUTPUT_DIR = Path(
    "data/raw/radar/current"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


PRODUCTS = {
    "ppi_z": "ppz_pdp.gif",
    "max_z": "caz_pdp.gif"
}


print(
    "\n========== MEGHDRISHTI RADAR COLLECTOR ==========\n"
)


timestamp = datetime.now(
    timezone.utc
).strftime(
    "%Y%m%dT%H%M%SZ"
)


for product, filename in PRODUCTS.items():

    url = f"{BASE_URL}/{filename}"

    output = (
        OUTPUT_DIR
        / f"paradip_{product}_{timestamp}.gif"
    )

    print(
        f"\nDownloading {product}"
    )

    print(
        "URL:",
        url
    )

    try:

        response = requests.get(
            url,
            timeout=30
        )

        response.raise_for_status()

        output.write_bytes(
            response.content
        )

        print(
            "Saved:",
            output
        )

        print(
            "Size:",
            len(response.content),
            "bytes"
        )

    except Exception as exc:

        print(
            "[ERROR]",
            exc
        )


print(
    "\n========== COMPLETE ==========\n"
)