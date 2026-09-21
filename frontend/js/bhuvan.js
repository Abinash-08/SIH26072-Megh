const MEGHDHRISHTI_API = "http://127.0.0.1:8000";


/* ============================================
   LIVE BHUVAN CHECK
   ============================================ */

async function runLiveBhuvanCheck() {

    const button =
        document.getElementById("live-bhuvan-btn");

    if (button) {
        button.disabled = true;
        button.innerHTML = "⟳ CONNECTING...";
    }

    showBhuvanLoading();

    try {

        // Get user's current location
        const position = await getCurrentLocation();

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log("LIVE LOCATION");
        console.log("Latitude:", lat);
        console.log("Longitude:", lon);

        // Send location to our Python backend
        const data =
            await getBhuvanGrid(lat, lon);

        if (data) {
            showBhuvanData(data);
        }

    } catch (error) {

        console.error(
            "Live Bhuvan error:",
            error
        );

        showBhuvanError(
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.innerHTML = "⚡ LIVE BHUVAN CHECK";
        }
    }
}


/* ============================================
   GET CURRENT GPS LOCATION
   ============================================ */

function getCurrentLocation() {

    return new Promise(
        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported by this browser."
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
                    maximumAge: 0
                }
            );
        }
    );
}


/* ============================================
   CALL MEGHDHRISHTI BACKEND
   ============================================ */

async function getBhuvanGrid(lat, lon) {

    const url =
        `${MEGHDHRISHTI_API}/api/lightning/grid` +
        `?lat=${encodeURIComponent(lat)}` +
        `&lon=${encodeURIComponent(lon)}`;

    console.log("Calling:", url);

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Backend returned HTTP ${response.status}`
        );
    }

    const result =
        await response.json();

    console.log(
        "Bhuvan API response:",
        result
    );

    if (!result.success) {

        throw new Error(
            "Bhuvan request failed."
        );
    }

    return result.data;
}


/* ============================================
   LOADING UI
   ============================================ */

function showBhuvanLoading() {

    const panel =
        document.getElementById(
            "lightning-data"
        );

    if (!panel) return;

    panel.innerHTML = `

        <div class="lightning-card">

            <div class="lightning-title">
                ⚡ LIGHTNING INTELLIGENCE
            </div>

            <div class="lightning-status loading">
                ⟳ CONNECTING TO BHUVAN...
            </div>

            <p>
                Acquiring current location...
            </p>

        </div>

    `;
}


/* ============================================
   SUCCESS UI
   ============================================ */

function showBhuvanData(data) {

    const panel =
        document.getElementById(
            "lightning-data"
        );

    if (!panel) return;

    const lat =
        Number(data.latitude);

    const lon =
        Number(data.longitude);

    panel.innerHTML = `

        <div class="lightning-card">

            <div class="lightning-header">

                <div class="lightning-title">
                    ⚡ LIGHTNING INTELLIGENCE
                </div>

                <div class="lightning-status">
                    ● LIVE CONNECTED
                </div>

            </div>


            <div class="lightning-section">

                <div class="section-label">
                    CURRENT LOCATION
                </div>

                <div class="coordinates">

                    <div>
                        <span>LATITUDE</span>
                        <strong>
                            ${lat.toFixed(4)}°
                        </strong>
                    </div>

                    <div>
                        <span>LONGITUDE</span>
                        <strong>
                            ${lon.toFixed(4)}°
                        </strong>
                    </div>

                </div>

            </div>


            <div class="lightning-section">

                <div class="section-label">
                    BHUVAN SPATIAL GRID
                </div>

                <div class="grid-id">
                    ${data.grid_id ?? "N/A"}
                </div>

            </div>


            <div class="lightning-section">

                <div class="data-row">
                    <span>DATA SOURCE</span>
                    <strong>NRSC / BHUVAN</strong>
                </div>

                <div class="data-row">
                    <span>WMS SERVICE</span>
                    <strong>ONLINE ✓</strong>
                </div>

                <div class="data-row">
                    <span>GRID QUERY</span>
                    <strong>SUCCESS ✓</strong>
                </div>

                <div class="data-row">
                    <span>SPATIAL MAPPING</span>
                    <strong>SUCCESS ✓</strong>
                </div>

            </div>


            <div class="live-indicator">

                <span class="pulse-dot"></span>

                LIVE DATA CONNECTION ACTIVE

            </div>

        </div>

    `;
}


/* ============================================
   ERROR UI
   ============================================ */

function showBhuvanError(message) {

    const panel =
        document.getElementById(
            "lightning-data"
        );

    if (!panel) return;

    panel.innerHTML = `

        <div class="lightning-card">

            <div class="lightning-title">
                ⚡ LIGHTNING INTELLIGENCE
            </div>

            <div class="lightning-error">
                ● CONNECTION ERROR
            </div>

            <p>
                ${message}
            </p>

            <small>
                Check that the MeghDhristi
                backend is running.
            </small>

        </div>

    `;
}

function openBhuvanPage() {

    window.location.href = "../pages/Bhuvan.html";

}