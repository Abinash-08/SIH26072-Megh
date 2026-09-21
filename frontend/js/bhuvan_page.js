const API_URL = "http://127.0.0.1:8000";

const BHUVAN_WMS =
    "https://bhuvan-ras2.nrsc.gov.in/cgi-bin/light.exe";

let bhuvanMap = null;
let locationMarker = null;
let lightningLayer = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMap();

    // Give Leaflet a moment to render the container
    setTimeout(() => {
        if (bhuvanMap) {
            bhuvanMap.invalidateSize();
        }
    }, 300);

    refreshBhuvan();
});


/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initializeMap() {

    const mapElement =
        document.getElementById("bhuvan-map");

    if (!mapElement) {
        console.error("Bhuvan map container not found.");
        return;
    }

    bhuvanMap = L.map("bhuvan-map", {
        zoomControl: true,
        attributionControl: true
    }).setView(
        [22.5, 80.0],
        5
    );


    /* Base map */

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 12,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(bhuvanMap);


    /* Click map → query grid */

    bhuvanMap.on("click", async (event) => {

        const lat = event.latlng.lat;
        const lon = event.latlng.lng;

        updateMarker(lat, lon);

        await queryBhuvan(lat, lon);

    });
}


/* =========================================================
   BHUVAN OBSERVATION TIME
========================================================= */

function getBhuvanObservationTime() {

    const now = new Date();

    /*
       NRSC/Bhuvan lightning dissemination has
       approximately a one-day lag.

       Therefore use the previous UTC day.
    */

    const observation =
        new Date(
            now.getTime() -
            24 * 60 * 60 * 1000
        );


    const year =
        observation.getUTCFullYear();

    const month =
        String(
            observation.getUTCMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            observation.getUTCDate()
        ).padStart(2, "0");

    const hour =
        String(
            observation.getUTCHours()
        ).padStart(2, "0");


    return {
        date: `${year}-${month}-${day}`,
        hour: hour
    };
}


/* =========================================================
   REFRESH
========================================================= */

async function refreshBhuvan() {

    setLoadingState();

    /*
       Load the real Bhuvan layer immediately.
       The map should work even if GPS/backend fails.
    */

    loadLightningLayer();


    try {

        const position =
            await getCurrentLocation();

        const lat =
            position.coords.latitude;

        const lon =
            position.coords.longitude;


        updateMarker(lat, lon);

        /*
           Query backend for actual Bhuvan grid.
        */

        await queryBhuvan(lat, lon);


    } catch (error) {

        console.warn(
            "GPS unavailable:",
            error
        );

        setStatus("MAP READY");

        const gridStatus =
            document.getElementById("grid-status");

        if (gridStatus) {
            gridStatus.textContent =
                "GPS UNAVAILABLE";
        }

    }
}


/* =========================================================
   GPS
========================================================= */

function getCurrentLocation() {

    return new Promise(
        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );

        }
    );
}


/* =========================================================
   BHUVAN LIGHTNING WMS
========================================================= */

function loadLightningLayer() {

    if (!bhuvanMap) {
        return;
    }


    if (lightningLayer) {

        bhuvanMap.removeLayer(
            lightningLayer
        );

    }


    const observation =
        getBhuvanObservationTime();


    console.log(
        "Loading Bhuvan:",
        observation.date,
        observation.hour,
        "UTC"
    );


    setStatus("LOADING");


    /*
       Bhuvan hourly lightning WMS.

       Include state + grid overlays as well.
    */

    lightningLayer =
        L.tileLayer.wms(
            BHUVAN_WMS,
            {

                layers:
                    "lighthourly,state,grid",

                styles:
                    "default",

                format:
                    "image/png",

                transparent:
                    true,

                version:
                    "1.3.0",

                crs:
                    L.CRS.EPSG4326,

                date:
                    observation.date,

                hour:
                    observation.hour

            }
        );


    /*
       At least one WMS tile loaded.
    */

    lightningLayer.on(
        "tileload",
        () => {

            console.log(
                "Bhuvan lightning tile loaded."
            );

            setStatus("ONLINE");

            updateObservationUI(
                observation.date,
                observation.hour
            );

        }
    );


    /*
       Tile failed.
    */

    lightningLayer.on(
        "tileerror",
        (error) => {

            console.error(
                "Bhuvan WMS tile error:",
                error
            );

            setStatus("WMS ERROR");

            updateObservationUI(
                observation.date,
                observation.hour
            );

        }
    );


    lightningLayer.addTo(
        bhuvanMap
    );


    /*
       Update UI immediately.
    */

    updateObservationUI(
        observation.date,
        observation.hour
    );
}


/* =========================================================
   QUERY BHUVAN GRID
========================================================= */

async function queryBhuvan(lat, lon) {

    const gridStatus =
        document.getElementById("grid-status");

    const gridId =
        document.getElementById("grid-id");

    if (gridStatus) {
        gridStatus.textContent =
            "QUERYING";
    }

    if (gridId) {
        gridId.textContent =
            "----";
    }


    try {

        const url =
            `${API_URL}/api/lightning/grid` +
            `?lat=${encodeURIComponent(lat)}` +
            `&lon=${encodeURIComponent(lon)}`;


        console.log(
            "Bhuvan grid request:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Backend HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "Bhuvan grid response:",
            result
        );


        if (
            !result ||
            !result.success ||
            !result.data
        ) {

            throw new Error(
                "Invalid Bhuvan grid response."
            );

        }


        const data =
            result.data;


        /*
           Update coordinates.
        */

        updateLocation(
            data.latitude ?? lat,
            data.longitude ?? lon
        );


        /*
           Update actual Bhuvan grid.
        */

        updateGrid(
            data.grid_id
        );


        /*
           Update marker.
        */

        updateMarker(
            data.latitude ?? lat,
            data.longitude ?? lon
        );


        /*
           Center map.
        */

        bhuvanMap.setView(
            [
                data.latitude ?? lat,
                data.longitude ?? lon
            ],
            8
        );


        if (gridStatus) {
            gridStatus.textContent =
                "SUCCESS ✓";
        }


        updateDashboardPreview(
            data.latitude ?? lat,
            data.longitude ?? lon,
            data.grid_id
        );


    } catch (error) {

        console.error(
            "Bhuvan grid query failed:",
            error
        );


        if (gridStatus) {
            gridStatus.textContent =
                "UNAVAILABLE";
        }


        if (gridId) {
            gridId.textContent =
                "N/A";
        }


        /*
           Important:
           The map can still work even when
           the Python backend isn't running.
        */

        updateLocation(
            lat,
            lon
        );

    }
}


/* =========================================================
   MARKER
========================================================= */

function updateMarker(lat, lon) {

    if (!bhuvanMap) {
        return;
    }


    if (locationMarker) {

        bhuvanMap.removeLayer(
            locationMarker
        );

    }


    locationMarker =
        L.circleMarker(
            [lat, lon],
            {
                radius: 8,
                weight: 2,
                fillOpacity: 0.85
            }
        ).addTo(
            bhuvanMap
        );


    locationMarker.bindPopup(
        `
        <div style="font-family:Inter,sans-serif">

            <strong>
                YOUR LOCATION
            </strong>

            <br>

            ${lat.toFixed(4)}° N

            <br>

            ${lon.toFixed(4)}° E

        </div>
        `
    );

}


/* =========================================================
   LOCATION UI
========================================================= */

function updateLocation(lat, lon) {

    const latitude =
        document.getElementById("latitude");

    const longitude =
        document.getElementById("longitude");


    if (latitude) {

        latitude.textContent =
            `${Number(lat).toFixed(4)}°`;

    }


    if (longitude) {

        longitude.textContent =
            `${Number(lon).toFixed(4)}°`;

    }


    const dashboardCoordinates =
        document.getElementById(
            "dashboardCoordinates"
        );


    if (dashboardCoordinates) {

        dashboardCoordinates.textContent =
            `${Number(lat).toFixed(4)}° N · ${Number(lon).toFixed(4)}° E`;

    }

}


/* =========================================================
   GRID UI
========================================================= */

function updateGrid(gridId) {

    const grid =
        document.getElementById("grid-id");

    if (grid) {

        grid.textContent =
            gridId ?? "N/A";

    }


    const smallGrid =
        document.getElementById(
            "grid-id-small"
        );

    if (smallGrid) {

        smallGrid.textContent =
            gridId ?? "N/A";

    }


    const dashboardGrid =
        document.getElementById(
            "dashboardGrid"
        );

    if (dashboardGrid) {

        dashboardGrid.textContent =
            gridId ?? "N/A";

    }

}


/* =========================================================
   OBSERVATION UI
========================================================= */

function updateObservationUI(date, hour) {

    /*
       Main map footer
    */

    const utcTime =
        document.getElementById(
            "utc-time"
        );

    if (utcTime) {

        utcTime.textContent =
            `${date} ${hour}:00`;

    }


    const updateTime =
        document.getElementById(
            "update-time"
        );

    if (updateTime) {

        updateTime.textContent =
            `${hour}:00 UTC`;

    }


    /*
       Dashboard observation card
    */

    const observationDate =
        document.getElementById(
            "dashboardObservation"
        );

    if (observationDate) {

        observationDate.textContent =
            `${date} ${hour}:00 UTC`;

    }


    /*
       Optional date element
    */

    const observationSmall =
        document.getElementById(
            "observation-time"
        );

    if (observationSmall) {

        observationSmall.textContent =
            `${date} ${hour}:00 UTC`;

    }

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(status) {

    const statusElement =
        document.getElementById(
            "wms-status"
        );

    if (statusElement) {

        statusElement.textContent =
            status;

    }


    /*
       Dashboard right-side status
    */

    const dashboardStatus =
        document.getElementById(
            "bhuvanDataStatus"
        );

    if (dashboardStatus) {

        dashboardStatus.textContent =
            `● ${status}`;

    }


    /*
       Header status
    */

    const headerStatus =
        document.getElementById(
            "bhuvanConnectionStatus"
        );

    if (headerStatus) {

        headerStatus.textContent =
            status;

    }

}


/* =========================================================
   LOADING
========================================================= */

function setLoadingState() {

    const wms =
        document.getElementById(
            "wms-status"
        );

    const grid =
        document.getElementById(
            "grid-id"
        );

    const gridStatus =
        document.getElementById(
            "grid-status"
        );


    if (wms) {
        wms.textContent =
            "CONNECTING";
    }


    if (grid) {
        grid.textContent =
            "----";
    }


    if (gridStatus) {
        gridStatus.textContent =
            "WAITING";
    }

}


/* =========================================================
   DASHBOARD PREVIEW
========================================================= */

function updateDashboardPreview(
    lat,
    lon,
    gridId
) {

    const coordinates =
        document.getElementById(
            "dashboardCoordinates"
        );


    const grid =
        document.getElementById(
            "dashboardGrid"
        );


    if (coordinates) {

        coordinates.textContent =
            `${Number(lat).toFixed(4)}° N · ${Number(lon).toFixed(4)}° E`;

    }


    if (grid) {

        grid.textContent =
            gridId ?? "N/A";

    }

}