/* =========================================================
   MEGHDHRISHTI INTELLIGENCE
   REAL ATMOSPHERIC OBSERVATIONS
========================================================= */

(() => {

    "use strict";

    let currentLat = null;
    let currentLon = null;
    let currentGrid = null;

    let weatherHistory = [];


    /* =====================================================
       HELPERS
    ===================================================== */

    function get(id) {
        return document.getElementById(id);
    }


    function text(id, value) {

        const node = get(id);

        if (node) {
            node.textContent = value;
        }

    }


    function width(id, value) {

        const node = get(id);

        if (node) {

            node.style.width =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(value) || 0
                    )
                ) + "%";

        }

    }



    /* =====================================================
       INITIALIZATION
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            setupScanButton();

            waitForBhuvanLocation();

        }
    );



    /* =====================================================
       SCAN BUTTON
    ===================================================== */

    function setupScanButton() {

        const button =
            get("mdScanLocation");

        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            async () => {

                button.disabled = true;

                button.textContent =
                    "⚡ SCANNING LOCATION...";


                try {

                    if (
                        typeof window.refreshBhuvan ===
                        "function"
                    ) {

                        await window.refreshBhuvan();

                    }


                    if (
                        currentLat !== null &&
                        currentLon !== null
                    ) {

                        await loadWeather(
                            currentLat,
                            currentLon
                        );

                    }

                } catch (error) {

                    console.error(error);

                }


                button.disabled = false;

                button.textContent =
                    "⚡ SCAN MY LOCATION";

            }
        );

    }



    /* =====================================================
       WAIT FOR BHUVAN
    ===================================================== */

    function waitForBhuvanLocation() {

        const coordinates =
            get("dashboardCoordinates");


        if (!coordinates) {

            setTimeout(
                waitForBhuvanLocation,
                500
            );

            return;

        }


        const observer =
            new MutationObserver(
                readBhuvanLocation
            );


        observer.observe(
            coordinates,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );


        const grid =
            get("dashboardGrid");


        if (grid) {

            observer.observe(
                grid,
                {
                    childList: true,
                    characterData: true,
                    subtree: true
                }
            );

        }


        readBhuvanLocation();

    }



    /* =====================================================
       READ BHUVAN LOCATION
    ===================================================== */

    function readBhuvanLocation() {

        const coordinates =
            get("dashboardCoordinates");

        const grid =
            get("dashboardGrid");


        if (!coordinates) {
            return;
        }


        const value =
            coordinates.textContent.trim();


        /*
         * Example:
         *
         * 20.2444° N · 85.7914° E
         */

        const match =
            value.match(
                /(-?\d+(?:\.\d+)?)°?\s*N.*?(-?\d+(?:\.\d+)?)°?\s*E/i
            );


        if (!match) {
            return;
        }


        const lat =
            Number(match[1]);

        const lon =
            Number(match[2]);


        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
        ) {
            return;
        }


        const newGrid =
            grid
                ? grid.textContent.trim()
                : "--";


        /*
         * Avoid unnecessary API requests.
         */

        const changed =
            lat !== currentLat ||
            lon !== currentLon ||
            newGrid !== currentGrid;


        currentLat = lat;
        currentLon = lon;
        currentGrid = newGrid;


        updateLocationUI(
            lat,
            lon,
            newGrid
        );


        if (changed) {

            loadWeather(
                lat,
                lon
            );

        }

    }



    /* =====================================================
       LOCATION UI
    ===================================================== */

    function updateLocationUI(
        lat,
        lon,
        grid
    ) {

        text(
            "mdCoordinates",
            `${lat.toFixed(4)}° N · ${lon.toFixed(4)}° E`
        );


        text(
            "mdGrid",
            grid || "--"
        );


        text(
            "mdLocation",
            getRegion(lat, lon)
        );


        text(
            "mdMapStatus",
            "ONLINE"
        );

    }



    /* =====================================================
       REGION LABEL
    ===================================================== */

    function getRegion(
        lat,
        lon
    ) {

        if (
            lat >= 18 &&
            lat <= 23 &&
            lon >= 82 &&
            lon <= 88
        ) {

            return "Eastern India";

        }


        if (
            lat >= 8 &&
            lat <= 18 &&
            lon >= 72 &&
            lon <= 81
        ) {

            return "Southern India";

        }


        if (
            lat >= 20 &&
            lat <= 30 &&
            lon >= 68 &&
            lon <= 81
        ) {

            return "Western / Northern India";

        }


        if (
            lat >= 23 &&
            lat <= 31 &&
            lon >= 80 &&
            lon <= 90
        ) {

            return "Northern / Eastern India";

        }


        return "Current GPS Position";

    }



    /* =====================================================
       WEATHER API
    ===================================================== */

    async function loadWeather(
        lat,
        lon
    ) {

        text(
            "mdRiskStatus",
            "FETCHING OBSERVATIONS"
        );


        text(
            "mdTrendDataStatus",
            "FETCHING DATA"
        );


        try {

            const url =
                "https://api.open-meteo.com/v1/forecast" +

                `?latitude=${encodeURIComponent(lat)}` +

                `&longitude=${encodeURIComponent(lon)}` +

                "&current=" +

                [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "pressure_msl",
                    "cloud_cover",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "precipitation"
                ].join(",") +

                "&hourly=" +

                [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "cloud_cover",
                    "wind_speed_10m",
                    "precipitation",
                    "pressure_msl"
                ].join(",") +

                "&past_days=1" +

                "&forecast_days=1" +

                "&timezone=auto";


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Weather API error: " +
                    response.status
                );

            }


            const data =
                await response.json();


            updateAtmosphericSignals(
                data.current
            );


            updateRiskScore(
                data.current
            );


            weatherHistory =
                createHistory(
                    data.hourly
                );


            updateTrend(
                weatherHistory
            );


        } catch (error) {

            console.error(
                "MeghDhrishti weather error:",
                error
            );


            text(
                "mdRiskStatus",
                "DATA ERROR"
            );


            text(
                "mdTrendDataStatus",
                "FEED ERROR"
            );

        }

    }



    /* =====================================================
       ATMOSPHERIC SIGNALS
    ===================================================== */

    function updateAtmosphericSignals(
        data
    ) {

        if (!data) {
            return;
        }


        const cloud =
            Number(
                data.cloud_cover
            );


        const humidity =
            Number(
                data.relative_humidity_2m
            );


        const wind =
            Number(
                data.wind_speed_10m
            );


        const rain =
            Number(
                data.precipitation
            );


        const temperature =
            Number(
                data.temperature_2m
            );


        const pressure =
            Number(
                data.pressure_msl
            );


        /*
         * Lightning:
         *
         * We only show feed availability here.
         * We do NOT convert WMS availability
         * into a fake strike percentage.
         */

        text(
            "mdLightningValue",
            "Bhuvan WMS connected"
        );


        text(
            "mdLightningPercent",
            "LIVE"
        );


        width(
            "mdLightningBar",
            100
        );


        /*
         * Cloud
         */

        text(
            "mdAtmospherePercent",
            Math.round(
                cloud
            ) + "%"
        );


        width(
            "mdAtmosphereBar",
            cloud
        );


        /*
         * Humidity is used as an additional
         * atmospheric indicator.
         *
         * We combine cloud + humidity below.
         */

        const atmosphere =
            Math.round(
                (
                    cloud +
                    humidity
                ) / 2
            );


        text(
            "mdAtmospherePercent",
            atmosphere + "%"
        );


        width(
            "mdAtmosphereBar",
            atmosphere
        );


        /*
         * Radar / satellite are not available
         * from the current frontend API.
         *
         * Keep them explicitly marked as
         * unavailable instead of inventing values.
         */

        text(
            "mdRadarPercent",
            "N/A"
        );


        width(
            "mdRadarBar",
            0
        );


        text(
            "mdSatellitePercent",
            "N/A"
        );


        width(
            "mdSatelliteBar",
            0
        );


        /*
         * Make atmospheric label useful.
         */

        const atmosphereNode =
            get("mdAtmospherePercent");


        if (atmosphereNode) {

            atmosphereNode.title =
                `Cloud ${cloud}% · Humidity ${humidity}%`;

        }


        console.log(
            "Live atmospheric observation:",
            {
                temperature,
                humidity,
                cloud,
                wind,
                rain,
                pressure
            }
        );

    }



    /* =====================================================
       PROTOTYPE RISK SCORE
    ===================================================== */

    function updateRisk(
        data
    ) {

        if (!data) {
            return;
        }


        const cloud =
            Number(
                data.cloud_cover || 0
            );


        const humidity =
            Number(
                data.relative_humidity_2m || 0
            );


        const wind =
            Number(
                data.wind_speed_10m || 0
            );


        const precipitation =
            Number(
                data.precipitation || 0
            );


        /*
         * Transparent atmospheric score.
         *
         * Cloud         25%
         * Humidity      30%
         * Wind          15%
         * Precipitation 30%
         */

        const cloudScore =
            cloud;


        const humidityScore =
            humidity;


        const windScore =
            Math.min(
                100,
                wind * 2.5
            );


        const rainScore =
            Math.min(
                100,
                precipitation * 25
            );


        const score =
            Math.round(
                cloudScore * 0.25 +
                humidityScore * 0.30 +
                windScore * 0.15 +
                rainScore * 0.30
            );


        let label;
        let description;


        if (score >= 75) {

            label = "HIGH";

            description =
                "Elevated atmospheric conditions detected.";

        }

        else if (score >= 50) {

            label = "MODERATE";

            description =
                "Atmospheric conditions show elevated storm potential.";

        }

        else if (score >= 30) {

            label = "LOW";

            description =
                "Some atmospheric activity is present.";

        }

        else {

            label = "MINIMAL";

            description =
                "Current atmospheric indicators are relatively weak.";

        }


        text(
            "mdRiskScore",
            score
        );


        text(
            "mdRiskLabel",
            label
        );


        text(
            "mdRiskDescription",
            description
        );


        text(
            "mdRiskStatus",
            "OBSERVATION READY"
        );


        /*
         * Confidence is based on availability
         * of the four atmospheric variables.
         */

        const variables = [
            data.cloud_cover,
            data.relative_humidity_2m,
            data.wind_speed_10m,
            data.precipitation
        ];


        const available =
            variables.filter(
                value =>
                    value !== null &&
                    value !== undefined &&
                    Number.isFinite(
                        Number(value)
                    )
            ).length;


        const confidence =
            Math.round(
                available / 4 * 100
            );


        text(
            "mdConfidence",
            `${confidence}%`
        );


        width(
            "mdConfidenceBar",
            confidence
        );

    }



    /* =====================================================
       HISTORY
    ===================================================== */

    function createHistory(
        hourly
    ) {

        if (
            !hourly ||
            !hourly.time
        ) {

            return [];

        }


        const result = [];


        const total =
            hourly.time.length;


        /*
         * Last 7 hourly observations.
         */

        const start =
            Math.max(
                0,
                total - 7
            );


        for (
            let i = start;
            i < total;
            i++
        ) {

            const cloud =
                Number(
                    hourly.cloud_cover?.[i] || 0
                );


            const humidity =
                Number(
                    hourly.relative_humidity_2m?.[i] || 0
                );


            const wind =
                Number(
                    hourly.wind_speed_10m?.[i] || 0
                );


            const precipitation =
                Number(
                    hourly.precipitation?.[i] || 0
                );


            const activity =
                Math.round(
                    cloud * 0.30 +
                    humidity * 0.35 +
                    Math.min(
                        100,
                        wind * 2.5
                    ) * 0.15 +
                    Math.min(
                        100,
                        precipitation * 25
                    ) * 0.20
                );


            result.push({
                time:
                    hourly.time[i],

                value:
                    activity
            });

        }


        return result;

    }



    /* =====================================================
       TREND
    ===================================================== */

    function updateTrend(
        history
    ) {

        if (
            !history ||
            history.length < 2
        ) {

            text(
                "mdTrendDataStatus",
                "INSUFFICIENT DATA"
            );

            return;

        }


        const values =
            history.map(
                item => item.value
            );


        drawTrend(
            values
        );


        const first =
            values[0];


        const last =
            values[
                values.length - 1
            ];


        const change =
            last - first;


        let direction;


        if (change > 5) {

            direction = "RISING";

        }

        else if (change < -5) {

            direction = "FALLING";

        }

        else {

            direction = "STABLE";

        }


        text(
            "mdTrendArrow",
            change > 5
                ? "↗"
                : change < -5
                    ? "↘"
                    : "→"
        );


        text(
            "mdTrendLabel",
            direction
        );


        text(
            "mdObservationCount",
            `${values.length} hourly`
        );


        text(
            "mdTrendChange",
            `${change >= 0 ? "+" : ""}${Math.round(change)}%`
        );


        text(
            "mdTrendDataStatus",
            "LIVE ATMOSPHERIC FEED"
        );

    }



    /* =====================================================
       SVG GRAPH
    ===================================================== */

    function drawTrend(
        values
    ) {

        const line =
            get("mdTrendLine");

        const area =
            get("mdTrendArea");

        const points =
            get("mdTrendPoints");


        if (
            !line ||
            !area
        ) {

            return;

        }


        const widthValue = 700;
        const heightValue = 220;


        const coordinates =
            values.map(
                (value, index) => {

                    const x =
                        8 +
                        (
                            index /
                            Math.max(
                                1,
                                values.length - 1
                            )
                        ) *
                        (
                            widthValue - 16
                        );


                    const y =
                        heightValue -
                        8 -
                        (
                            value / 100
                        ) *
                        (
                            heightValue - 16
                        );


                    return {
                        x,
                        y,
                        value
                    };

                }
            );


        const path =
            coordinates
                .map(
                    (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
                )
                .join(" ");


        line.setAttribute(
            "d",
            path
        );


        const first =
            coordinates[0];


        const last =
            coordinates[
                coordinates.length - 1
            ];


        const areaPath =
            path +
            ` L ${last.x} ${heightValue}` +
            ` L ${first.x} ${heightValue}` +
            " Z";


        area.setAttribute(
            "d",
            areaPath
        );


        if (points) {

            points.innerHTML = "";


            coordinates.forEach(
                point => {

                    const circle =
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "circle"
                        );


                    circle.setAttribute(
                        "cx",
                        point.x
                    );


                    circle.setAttribute(
                        "cy",
                        point.y
                    );


                    circle.setAttribute(
                        "r",
                        "4"
                    );


                    circle.setAttribute(
                        "class",
                        "md-trend-point"
                    );


                    points.appendChild(
                        circle
                    );

                }
            );

        }

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.MeghDhrishtiIntelligence = {

        reload: () => {

            if (
                currentLat !== null &&
                currentLon !== null
            ) {

                return loadWeather(
                    currentLat,
                    currentLon
                );

            }

        },

        getLocation: () => ({
            latitude:
                currentLat,

            longitude:
                currentLon,

            grid:
                currentGrid
        })

    };


})();

/* =========================================================
   MEGHDHRISHTI REAL-TIME INTELLIGENCE ENGINE
   =========================================================

   DATA SOURCES

   1. BHUVAN / NRSC
      - Location
      - Grid
      - Lightning WMS

   2. OPEN-METEO
      - Temperature
      - Relative humidity
      - Cloud cover
      - Pressure
      - Wind
      - Precipitation
      - CAPE
      - Lightning density

   IMPORTANT:
   This is a transparent atmospheric scoring layer.
   It is NOT the final trained ML model.
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       STATE
    ===================================================== */

    let latitude = null;
    let longitude = null;
    let gridId = null;

    let lastData = null;
    let history = [];

    let loading = false;



    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    function setText(id, value) {

        const node = $(id);

        if (node) {
            node.textContent = value;
        }

    }


    function setWidth(id, value) {

        const node = $(id);

        if (!node) {
            return;
        }

        const safeValue =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) || 0
                )
            );

        node.style.width =
            `${safeValue}%`;

    }



    /* =====================================================
       INITIALIZATION
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initialiseScanner();

            watchBhuvanLocation();

        }
    );



    /* =====================================================
       SCAN BUTTON
    ===================================================== */

    function initialiseScanner() {

        const button =
            $("mdScanLocation");


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            async () => {

                button.disabled = true;

                button.textContent =
                    "⚡ SCANNING...";


                try {

                    /*
                     * Use existing Bhuvan location scanner
                     * if available.
                     */

                    if (
                        typeof window.refreshBhuvan ===
                        "function"
                    ) {

                        await window.refreshBhuvan();

                    }


                    if (
                        latitude !== null &&
                        longitude !== null
                    ) {

                        await fetchIntelligence(
                            latitude,
                            longitude
                        );

                    }

                }

                catch (error) {

                    console.error(
                        "Scan error:",
                        error
                    );

                }


                button.disabled = false;

                button.textContent =
                    "⚡ SCAN MY LOCATION";

            }
        );

    }



    /* =====================================================
       WATCH BHUVAN COORDINATES
    ===================================================== */

    function watchBhuvanLocation() {

        const coordinateElement =
            $("dashboardCoordinates");


        if (!coordinateElement) {

            setTimeout(
                watchBhuvanLocation,
                500
            );

            return;

        }


        const observer =
            new MutationObserver(
                readBhuvanLocation
            );


        observer.observe(
            coordinateElement,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );


        const gridElement =
            $("dashboardGrid");


        if (gridElement) {

            observer.observe(
                gridElement,
                {
                    childList: true,
                    characterData: true,
                    subtree: true
                }
            );

        }


        /*
         * Read immediately.
         */

        readBhuvanLocation();

    }



    /* =====================================================
       READ BHUVAN LOCATION
    ===================================================== */

    function readBhuvanLocation() {

        const coordinateElement =
            $("dashboardCoordinates");


        const gridElement =
            $("dashboardGrid");


        if (!coordinateElement) {
            return;
        }


        const coordinateText =
            coordinateElement.textContent.trim();


        /*
         * Expected:
         *
         * 20.2444° N · 85.7914° E
         */

        const match =
            coordinateText.match(
                /(-?\d+(?:\.\d+)?)°?\s*N.*?(-?\d+(?:\.\d+)?)°?\s*E/i
            );


        if (!match) {
            return;
        }


        const newLatitude =
            Number(match[1]);


        const newLongitude =
            Number(match[2]);


        if (
            !Number.isFinite(newLatitude) ||
            !Number.isFinite(newLongitude)
        ) {

            return;

        }


        const newGrid =
            gridElement
                ? gridElement.textContent.trim()
                : "--";


        const locationChanged =
            newLatitude !== latitude ||
            newLongitude !== longitude;


        latitude =
            newLatitude;

        longitude =
            newLongitude;

        gridId =
            newGrid;


        updateLocationUI();


        /*
         * Only fetch again if location changed.
         */

        if (locationChanged) {

            fetchIntelligence(
                latitude,
                longitude
            );

        }

    }



    /* =====================================================
       LOCATION UI
    ===================================================== */

    function updateLocationUI() {

        setText(
            "mdCoordinates",
            `${latitude.toFixed(4)}° N · ${longitude.toFixed(4)}° E`
        );


        setText(
            "mdGrid",
            gridId || "--"
        );


        setText(
            "mdLocation",
            identifyRegion(
                latitude,
                longitude
            )
        );


        setText(
            "mdMapStatus",
            "ONLINE"
        );

    }



    /* =====================================================
       REGION
    ===================================================== */

    function identifyRegion(
        lat,
        lon
    ) {

        if (
            lat >= 18 &&
            lat <= 23 &&
            lon >= 82 &&
            lon <= 88
        ) {

            return "Eastern India";

        }


        if (
            lat >= 8 &&
            lat <= 18 &&
            lon >= 72 &&
            lon <= 81
        ) {

            return "Southern India";

        }


        if (
            lat >= 20 &&
            lat <= 30 &&
            lon >= 68 &&
            lon <= 81
        ) {

            return "Western / Northern India";

        }


        if (
            lat >= 23 &&
            lat <= 31 &&
            lon >= 80 &&
            lon <= 90
        ) {

            return "Northern / Eastern India";

        }


        return "Current GPS Position";

    }



    /* =====================================================
       REAL-TIME DATA FETCH
    ===================================================== */

    async function fetchIntelligence(
        lat,
        lon
    ) {

        if (loading) {
            return;
        }


        loading = true;


        setText(
            "mdRiskStatus",
            "UPDATING"
        );


        setText(
            "mdTrendDataStatus",
            "UPDATING"
        );


        try {

            /*
             * IMPORTANT:
             *
             * We intentionally use hourly data rather
             * than the `current=` endpoint.
             *
             * This makes the request more robust and
             * gives us the previous hours for the graph.
             */

            const parameters = [
                "temperature_2m",
                "relative_humidity_2m",
                "pressure_msl",
                "cloud_cover",
                "wind_speed_10m",
                "wind_gusts_10m",
                "wind_direction_10m",
                "precipitation",
                "cape",
                "lightning_density"
            ];


            const url =
                "https://api.open-meteo.com/v1/forecast" +

                `?latitude=${encodeURIComponent(lat)}` +

                `&longitude=${encodeURIComponent(lon)}` +

                `&hourly=${parameters.join(",")}` +

                "&past_hours=12" +

                "&forecast_hours=1" +

                "&timezone=auto";


            console.log(
                "MeghDhrishti API:",
                url
            );


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Open-Meteo HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                !data ||
                !data.hourly
            ) {

                throw new Error(
                    "Invalid weather response"
                );

            }


            /*
             * Save complete response.
             */

            lastData =
                data;


            /*
             * Extract latest hourly observation.
             */

            const latest =
                extractLatestObservation(
                    data.hourly
                );


            if (!latest) {

                throw new Error(
                    "No latest observation"
                );

            }


            /*
             * Build history.
             */

            history =
                buildHistory(
                    data.hourly
                );


            /*
             * Update all panels.
             */

            updateAtmosphericPanel(
                latest
            );


            updateRiskPanel(
                latest
            );


            updateTrendPanel(
                history
            );


            setText(
                "mdRiskStatus",
                "LIVE"
            );


            setText(
                "mdMapStatus",
                "ONLINE"
            );


        }

        catch (error) {

            console.error(
                "MeghDhrishti intelligence error:",
                error
            );


            setText(
                "mdRiskStatus",
                "FEED ERROR"
            );


            setText(
                "mdRiskDescription",
                "Unable to retrieve atmospheric observations."
            );


            setText(
                "mdTrendDataStatus",
                "FEED ERROR"
            );

        }


        finally {

            loading = false;

        }

    }



    /* =====================================================
       EXTRACT LATEST OBSERVATION
    ===================================================== */

    function extractLatestObservation(
        hourly
    ) {

        if (
            !hourly ||
            !hourly.time ||
            hourly.time.length === 0
        ) {

            return null;

        }


        const i =
            hourly.time.length - 1;


        return {

            time:
                hourly.time[i],

            temperature:
                numeric(
                    hourly.temperature_2m?.[i]
                ),

            humidity:
                numeric(
                    hourly.relative_humidity_2m?.[i]
                ),

            pressure:
                numeric(
                    hourly.pressure_msl?.[i]
                ),

            cloud:
                numeric(
                    hourly.cloud_cover?.[i]
                ),

            wind:
                numeric(
                    hourly.wind_speed_10m?.[i]
                ),

            gust:
                numeric(
                    hourly.wind_gusts_10m?.[i]
                ),

            windDirection:
                numeric(
                    hourly.wind_direction_10m?.[i]
                ),

            precipitation:
                numeric(
                    hourly.precipitation?.[i]
                ),

            cape:
                numeric(
                    hourly.cape?.[i]
                ),

            lightning:
                numeric(
                    hourly.lightning_density?.[i]
                )

        };

    }



    /* =====================================================
       NUMBER HELPER
    ===================================================== */

    function numeric(value) {

        const number =
            Number(value);


        return Number.isFinite(number)
            ? number
            : null;

    }



    /* =====================================================
       ATMOSPHERIC PANEL
    ===================================================== */

    function updateAtmosphericPanel(
        data
    ) {

        /*
         * LIGHTNING DENSITY
         */

        if (
            data.lightning !== null
        ) {

            const lightningScore =
                lightningDensityScore(
                    data.lightning
                );


            setText(
                "mdLightningValue",
                `${formatNumber(data.lightning)} flashes/km²/hr`
            );


            setText(
                "mdLightningPercent",
                `${Math.round(lightningScore)}%`
            );


            setWidth(
                "mdLightningBar",
                lightningScore
            );

        }

        else {

            setText(
                "mdLightningValue",
                "Model data unavailable"
            );


            setText(
                "mdLightningPercent",
                "N/A"
            );


            setWidth(
                "mdLightningBar",
                0
            );

        }



        /*
         * CAPE
         */

        const capeScore =
            capeRiskScore(
                data.cape
            );


        setText(
            "mdRadarPercent",
            data.cape !== null
                ? `${Math.round(capeScore)}%`
                : "N/A"
        );


        setWidth(
            "mdRadarBar",
            capeScore
        );



        /*
         * CLOUD + HUMIDITY
         */

        const moistureScore =
            moistureRiskScore(
                data.cloud,
                data.humidity
            );


        setText(
            "mdSatellitePercent",
            `${Math.round(moistureScore)}%`
        );


        setWidth(
            "mdSatelliteBar",
            moistureScore
        );



        /*
         * GENERAL ATMOSPHERE
         */

        const atmosphereScore =
            atmosphereRiskScore(
                data
            );


        setText(
            "mdAtmospherePercent",
            `${Math.round(atmosphereScore)}%`
        );


        setWidth(
            "mdAtmosphereBar",
            atmosphereScore
        );


        /*
         * DATA CONFIDENCE
         */

        const fields = [
            data.temperature,
            data.humidity,
            data.pressure,
            data.cloud,
            data.wind,
            data.precipitation,
            data.cape,
            data.lightning
        ];


        const available =
            fields.filter(
                value =>
                    value !== null
            ).length;


        const confidence =
            Math.round(
                available /
                fields.length *
                100
            );


        setText(
            "mdConfidence",
            `${confidence}%`
        );


        setWidth(
            "mdConfidenceBar",
            confidence
        );

    }



    /* =====================================================
       LIGHTNING DENSITY SCORE
    ===================================================== */

    function lightningDensityScore(
        value
    ) {

        if (
            value === null ||
            value <= 0
        ) {

            return 0;

        }


        /*
         * Logarithmic scaling prevents
         * very large model values from
         * immediately saturating the bar.
         */

        const score =
            (
                Math.log10(
                    1 + value * 1000
                ) / 3
            ) * 100;


        return clamp(
            score
        );

    }



    /* =====================================================
       CAPE SCORE
    ===================================================== */

    function capeRiskScore(
        cape
    ) {

        if (
            cape === null
        ) {

            return 0;

        }


        /*
         * Approximate convective-energy
         * scale for visualization.
         */

        return clamp(
            cape / 25
        );

    }



    /* =====================================================
       MOISTURE SCORE
    ===================================================== */

    function moistureRiskScore(
        cloud,
        humidity
    ) {

        if (
            cloud === null &&
            humidity === null
        ) {

            return 0;

        }


        const cloudValue =
            cloud ?? 0;


        const humidityValue =
            humidity ?? 0;


        return clamp(
            (
                cloudValue * 0.45 +
                humidityValue * 0.55
            )
        );

    }



    /* =====================================================
       ATMOSPHERE SCORE
    ===================================================== */

    function atmosphereRiskScore(
        data
    ) {

        const humidity =
            data.humidity ?? 0;


        const cloud =
            data.cloud ?? 0;


        const wind =
            data.wind ?? 0;


        const precipitation =
            data.precipitation ?? 0;


        const cape =
            data.cape ?? 0;


        const humidityScore =
            humidity;


        const cloudScore =
            cloud;


        const windScore =
            clamp(
                wind / 0.6
            );


        const rainScore =
            clamp(
                precipitation * 20
            );


        const capeScore =
            capeRiskScore(
                cape
            );


        return clamp(
            humidityScore * 0.25 +
            cloudScore * 0.20 +
            windScore * 0.10 +
            rainScore * 0.15 +
            capeScore * 0.30
        );

    }



    /* =====================================================
       RISK PANEL
    ===================================================== */

    function updateRiskPanel(
        data
    ) {

        const score =
            calculateRisk(
                data
            );


        let label;
        let description;


        if (score >= 75) {

            label =
                "HIGH";

            description =
                "Multiple atmospheric indicators are elevated.";

        }

        else if (score >= 55) {

            label =
                "MODERATE";

            description =
                "Atmospheric conditions show increased convective potential.";

        }

        else if (score >= 30) {

            label =
                "LOW";

            description =
                "Some atmospheric activity is present.";

        }

        else {

            label =
                "MINIMAL";

            description =
                "Current atmospheric indicators are relatively weak.";

        }


        setText(
            "mdRiskScore",
            Math.round(score)
        );


        setText(
            "mdRiskLabel",
            label
        );


        setText(
            "mdRiskDescription",
            description
        );


        setText(
            "mdRiskStatus",
            "LIVE"
        );



        /*
         * Ring progress.
         */

        const ring =
            $("mdRiskRing");


        if (ring) {

            ring.style.background =
                `conic-gradient(
                    currentColor ${score}%,
                    rgba(255,255,255,.10) ${score}% 100%
                )`;

        }

    }



    /* =====================================================
       RISK CALCULATION
    ===================================================== */

    function calculateRisk(
        data
    ) {

        const lightning =
            lightningDensityScore(
                data.lightning
            );


        const cape =
            capeRiskScore(
                data.cape
            );


        const moisture =
            moistureRiskScore(
                data.cloud,
                data.humidity
            );


        const atmosphere =
            atmosphereRiskScore(
                data
            );


        /*
         * Weighted composite.
         *
         * Lightning density = 35%
         * CAPE              = 25%
         * Moisture          = 20%
         * Atmosphere        = 20%
         */

        return clamp(
            lightning * 0.35 +
            cape * 0.25 +
            moisture * 0.20 +
            atmosphere * 0.20
        );

    }



    /* =====================================================
       BUILD HISTORY
    ===================================================== */

    function buildHistory(
        hourly
    ) {

        if (
            !hourly ||
            !hourly.time
        ) {

            return [];

        }


        const result = [];


        for (
            let i = 0;
            i < hourly.time.length;
            i++
        ) {

            const observation = {

                time:
                    hourly.time[i],

                lightning:
                    numeric(
                        hourly.lightning_density?.[i]
                    ),

                cape:
                    numeric(
                        hourly.cape?.[i]
                    ),

                cloud:
                    numeric(
                        hourly.cloud_cover?.[i]
                    ),

                humidity:
                    numeric(
                        hourly.relative_humidity_2m?.[i]
                    ),

                wind:
                    numeric(
                        hourly.wind_speed_10m?.[i]
                    ),

                precipitation:
                    numeric(
                        hourly.precipitation?.[i]
                    )

            };


            const value =
                calculateRisk(
                    observation
                );


            result.push({

                time:
                    observation.time,

                value:
                    value

            });

        }


        /*
         * Keep last 7 points.
         */

        return result.slice(-7);

    }



    /* =====================================================
       TREND PANEL
    ===================================================== */

    function updateTrendPanel(
        data
    ) {

        if (
            !data ||
            data.length < 2
        ) {

            setText(
                "mdTrendDataStatus",
                "INSUFFICIENT DATA"
            );

            return;

        }


        const values =
            data.map(
                item => item.value
            );


        drawChart(
            values
        );


        const first =
            values[0];


        const last =
            values[
                values.length - 1
            ];


        const change =
            last - first;


        let direction;


        if (change > 5) {

            direction =
                "RISING";

        }

        else if (change < -5) {

            direction =
                "FALLING";

        }

        else {

            direction =
                "STABLE";

        }


        setText(
            "mdTrendArrow",
            change > 5
                ? "↗"
                : change < -5
                    ? "↘"
                    : "→"
        );


        setText(
            "mdTrendLabel",
            direction
        );


        setText(
            "mdObservationCount",
            `${data.length} hourly`
        );


        setText(
            "mdTrendChange",
            `${change >= 0 ? "+" : ""}${Math.round(change)}%`
        );


        setText(
            "mdTrendDataStatus",
            "LIVE MODEL FEED"
        );

    }



    /* =====================================================
       DRAW TREND
    ===================================================== */

    function drawChart(
        values
    ) {

        const line =
            $("mdTrendLine");

        const area =
            $("mdTrendArea");

        const points =
            $("mdTrendPoints");


        if (
            !line ||
            !area
        ) {

            return;

        }


        const width =
            700;

        const height =
            220;


        const padding =
            10;


        const coordinates =
            values.map(
                (value, index) => {

                    const x =
                        padding +
                        (
                            index /
                            Math.max(
                                1,
                                values.length - 1
                            )
                        ) *
                        (
                            width -
                            padding * 2
                        );


                    const y =
                        height -
                        padding -
                        (
                            clamp(value) /
                            100
                        ) *
                        (
                            height -
                            padding * 2
                        );


                    return {
                        x,
                        y
                    };

                }
            );


        const path =
            coordinates
                .map(
                    (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
                )
                .join(" ");


        line.setAttribute(
            "d",
            path
        );


        const first =
            coordinates[0];


        const last =
            coordinates[
                coordinates.length - 1
            ];


        area.setAttribute(
            "d",
            path +
            ` L ${last.x} ${height}` +
            ` L ${first.x} ${height} Z`
        );


        if (points) {

            points.innerHTML = "";


            coordinates.forEach(
                point => {

                    const circle =
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "circle"
                        );


                    circle.setAttribute(
                        "cx",
                        point.x
                    );


                    circle.setAttribute(
                        "cy",
                        point.y
                    );


                    circle.setAttribute(
                        "r",
                        "4"
                    );


                    circle.setAttribute(
                        "class",
                        "md-trend-point"
                    );


                    points.appendChild(
                        circle
                    );

                }
            );

        }

    }



    /* =====================================================
       UTILITY
    ===================================================== */

    function clamp(
        value
    ) {

        return Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );

    }


    function formatNumber(
        value
    ) {

        if (
            value === null ||
            !Number.isFinite(value)
        ) {

            return "--";

        }


        if (Math.abs(value) < 0.01) {

            return value.toExponential(2);

        }


        return value.toFixed(3);

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.MeghDhrishtiIntelligence = {

        refresh: () => {

            if (
                latitude !== null &&
                longitude !== null
            ) {

                return fetchIntelligence(
                    latitude,
                    longitude
                );

            }

        },


        getState: () => ({

            latitude,

            longitude,

            gridId,

            latest:
                lastData,

            history

        })

    };


})();