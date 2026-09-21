/* =========================================================
   MEGHDHRISTI
   LIVE MAP PAGE DETECTOR
========================================================= */

const isLiveMapPage =
    document.body &&
    document.body.classList.contains(
        "live-map-page"
    );

/* =========================================================
   MEGHDHRISTI
   LIVE SATELLITE INTELLIGENCE MAP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /* =====================================================
   FULL LIVE MAP PAGE
===================================================== */

    if (
        document.body.classList.contains(
            "live-map-page"
        )
    ) {

        initMeghdhristiLiveMap();

        return;

    }
    const mapElement =
        document.getElementById("satelliteMap");

    if (!mapElement) {
        console.warn("MEGHDHRISTI: #satelliteMap not found.");
        return;
    }


    /* =====================================================
       DEFAULT INDIA LOCATION
    ===================================================== */

    const DEFAULT_LOCATION = [
        20.5937,
        78.9629
    ];

    const DEFAULT_ZOOM = 5;


    /* =====================================================
       CREATE MAP
    ===================================================== */

    const map = L.map("satelliteMap", {

        zoomControl: true,

        attributionControl: false,

        minZoom: 3,

        maxZoom: 9,

        worldCopyJump: true

    }).setView(
        DEFAULT_LOCATION,
        DEFAULT_ZOOM
    );


    /* =====================================================
       DARK GEOGRAPHIC BASEMAP

       Satellite no-data areas will show this underneath.
    ===================================================== */

    const baseMap = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
            attribution:
                "&copy; OpenStreetMap &copy; CARTO",

            subdomains:
                "abcd",

            maxZoom: 20,

            opacity: 0.95
        }
    );

    baseMap.addTo(map);


    /* =====================================================
       NASA GIBS
    ===================================================== */

    const GIBS_BASE =
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/all";


    /*
     * VIIRS Suomi-NPP True Color
     */

    const SATELLITE_LAYER =
        "VIIRS_SNPP_CorrectedReflectance_TrueColor";


    /* =====================================================
       DATE
    ===================================================== */

    function getDateString(date) {

        const year =
            date.getUTCFullYear();

        const month =
            String(
                date.getUTCMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getUTCDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    /*
     * Start 2 days back because satellite imagery
     * may not be available for today's date yet.
     */

    /*
 * Start from TODAY.
 */

    const initialDate =
        new Date();


    let selectedDate =
        getDateString(initialDate);


    /* =====================================================
       CREATE SATELLITE LAYER
    ===================================================== */

    function createSatelliteLayer(date) {

        const url =
            `${GIBS_BASE}/` +
            `${SATELLITE_LAYER}/` +
            `default/` +
            `${date}/` +
            `GoogleMapsCompatible_Level9/` +
            `{z}/{y}/{x}.jpg`;


        console.log(
            "MEGHDHRISTI Satellite Date:",
            date
        );


        console.log(
            "MEGHDHRISTI Satellite URL:",
            url
        );


        const layer =
            L.tileLayer(url, {

                attribution:
                    "NASA GIBS / VIIRS Suomi-NPP",

                tileSize: 256,

                minZoom: 1,

                maxZoom: 9,

                opacity: 0.94,

                crossOrigin: true

            });


        return layer;

    }


    let satelliteLayer =
        createSatelliteLayer(
            selectedDate
        );

    satelliteLayer.addTo(map);


    /*
     * Check today's imagery.
     *
     * If unavailable, automatically search
     * backwards for the latest available day.
     */

    setTimeout(() => {

        trySatelliteDate(
            selectedDate
        );

    }, 300);

    /* =====================================================
   SATELLITE AVAILABILITY FALLBACK
===================================================== */

    function trySatelliteDate(
        date,
        fallbackDays = 0
    ) {

        const testLayer =
            createSatelliteLayer(date);


        let tileLoaded = false;

        let tileFailed = false;


        /*
         * If at least one tile loads,
         * consider this date available.
         */

        testLayer.once(
            "tileload",
            () => {

                tileLoaded = true;


                console.log(
                    "Satellite imagery available:",
                    date
                );


                /*
                 * Remove current layer.
                 */

                if (
                    satelliteLayer &&
                    map.hasLayer(
                        satelliteLayer
                    )
                ) {

                    map.removeLayer(
                        satelliteLayer
                    );

                }


                /*
                 * Use this date.
                 */

                selectedDate =
                    date;


                satelliteLayer =
                    testLayer;


                satelliteLayer.addTo(
                    map
                );


                updateSatelliteDateUI(
                    date,
                    false
                );

            }
        );


        /*
         * If tiles fail, try previous day.
         */

        testLayer.once(
            "tileerror",
            () => {

                if (tileLoaded) {
                    return;
                }


                tileFailed = true;


                console.warn(
                    "No satellite imagery:",
                    date
                );


                map.removeLayer(
                    testLayer
                );


                /*
                 * Try previous day.
                 */

                if (
                    fallbackDays < 7
                ) {

                    const previous =
                        parseSatelliteDate(
                            date
                        );


                    previous.setUTCDate(
                        previous.getUTCDate() - 1
                    );


                    const previousDate =
                        getDateString(
                            previous
                        );


                    console.log(
                        "Trying previous imagery:",
                        previousDate
                    );


                    trySatelliteDate(
                        previousDate,
                        fallbackDays + 1
                    );

                }

            }
        );


        /*
         * Start loading.
         */

        testLayer.addTo(map);

    }

    /* =====================================================
       SATELLITE DATE UI
    ===================================================== */

    function updateDateUI() {

        const imageryDate =
            document.getElementById(
                "imageryDate"
            );


        const satelliteDate =
            document.getElementById(
                "satelliteDate"
            );


        if (!imageryDate) return;


        const today =
            new Date();


        const todayString =
            getDateString(today);


        if (
            selectedDate ===
            todayString
        ) {

            imageryDate.textContent =
                "TODAY";


            if (satelliteDate) {

                satelliteDate.textContent =
                    "TODAY";

            }

            return;
        }


        const date =
            new Date(
                `${selectedDate}T00:00:00`
            );


        const formatted =
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",

                    month: "short",

                    year: "numeric"
                }
            );


        imageryDate.textContent =
            formatted;


        if (satelliteDate) {

            satelliteDate.textContent =
                formatted.toUpperCase();

        }

    }


    updateDateUI();

    function updateSatelliteDateUI(
        actualDate,
        isToday
    ) {

        const imageryDate =
            document.getElementById(
                "imageryDate"
            );


        const satelliteDate =
            document.getElementById(
                "satelliteDate"
            );


        const date =
            parseSatelliteDate(
                actualDate
            );


        const formatted =
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );


        if (imageryDate) {

            imageryDate.textContent =
                isToday
                    ? "TODAY"
                    : `LATEST · ${formatted}`;

        }


        if (satelliteDate) {

            satelliteDate.textContent =
                isToday
                    ? "TODAY"
                    : formatted.toUpperCase();

        }

    }


    /* =====================================================
       USER LOCATION MARKER
    ===================================================== */

    let userMarker = null;


    const userIcon =
        L.divIcon({

            className:
                "meghdhristi-location-marker",

            html: `
                <div class="location-marker-ring">
                    <div class="location-marker-core"></div>
                </div>
            `,

            iconSize: [
                30,
                30
            ],

            iconAnchor: [
                15,
                15
            ]

        });


    /* =====================================================
       UPDATE MAP LOCATION
    ===================================================== */

    function updateMapLocation(
        latitude,
        longitude
    ) {

        const coordinates = [
            latitude,
            longitude
        ];


        if (!userMarker) {

            userMarker =
                L.marker(
                    coordinates,
                    {
                        icon: userIcon,

                        zIndexOffset: 1000
                    }
                )
                    .addTo(map);

        }
        else {

            userMarker.setLatLng(
                coordinates
            );

        }


        /*
         * Zoom into user's location.
         */

        map.flyTo(
            coordinates,
            6,
            {
                duration: 1.4
            }
        );


        /*
         * Update coordinates.
         */

        const coordinateElement =
            document.getElementById(
                "mapCoordinates"
            );

        /* =====================================================
   UPDATE ACTIVE CELL
===================================================== */

        const activeLocation =
            document.getElementById(
                "userLocation"
            );


        const activeCoordinates =
            document.getElementById(
                "userCoordinates"
            );


        if (activeLocation) {

            activeLocation.textContent =
                "Your Location";

        }


        if (activeCoordinates) {

            const latDirection =
                latitude >= 0
                    ? "N"
                    : "S";


            const lonDirection =
                longitude >= 0
                    ? "E"
                    : "W";


            activeCoordinates.textContent =
                `${Math.abs(latitude).toFixed(4)}° ${latDirection}, ` +
                `${Math.abs(longitude).toFixed(4)}° ${lonDirection}`;

        }

        if (coordinateElement) {

            const latDirection =
                latitude >= 0
                    ? "N"
                    : "S";


            const lonDirection =
                longitude >= 0
                    ? "E"
                    : "W";


            coordinateElement.textContent =
                `${Math.abs(latitude).toFixed(4)}° ${latDirection}, ` +
                `${Math.abs(longitude).toFixed(4)}° ${lonDirection}`;

        }

    }


    /* =====================================================
       REVERSE GEOCODING
    ===================================================== */

    async function getLocationName(
        latitude,
        longitude
    ) {

        try {

            const response =
                await fetch(
                    `https://api.bigdatacloud.net/data/` +
                    `reverse-geocode-client` +
                    `?latitude=${latitude}` +
                    `&longitude=${longitude}` +
                    `&localityLanguage=en`
                );


            if (!response.ok) {

                throw new Error(
                    "Reverse geocoding failed"
                );

            }


            const data =
                await response.json();


            const city =
                data.city ||
                data.locality ||
                "Your Location";


            const state =
                data.principalSubdivision ||
                "";


            const locationName =
                state &&
                    state !== city

                    ? `${city}, ${state}`

                    : city;


            const locationElement =
                document.getElementById(
                    "mapLocation"
                );


            const activeLocation =
                document.getElementById(
                    "userLocation"
                );


            if (locationElement) {

                locationElement.textContent =
                    locationName;

            }


            if (activeLocation) {

                activeLocation.textContent =
                    locationName;

            }

        }
        catch (error) {

            console.warn(
                "MEGHDHRISTI location name error:",
                error
            );

        }

    }


    /* =====================================================
       AUTO LOCATION
    ===================================================== */

    function detectLocation() {

        if (!navigator.geolocation) {

            console.warn(
                "Geolocation is not supported."
            );

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                console.log(
                    "MEGHDHRISTI Location:",
                    latitude,
                    longitude
                );


                updateMapLocation(
                    latitude,
                    longitude
                );


                getLocationName(
                    latitude,
                    longitude
                );

            },

            error => {

                console.warn(
                    "Location unavailable:",
                    error.message
                );

            },

            {

                enableHighAccuracy:
                    true,

                timeout:
                    10000,

                maximumAge:
                    300000

            }

        );

    }


    detectLocation();
    const refreshLocation =
        document.getElementById(
            "refreshLocation"
        );


    if (refreshLocation) {

        refreshLocation.addEventListener(
            "click",
            () => {

                detectLocation();

            }
        );

    }


    /* =====================================================
       LISTEN TO EXISTING APP LOCATION EVENT
    ===================================================== */

    window.addEventListener(
        "meghdhristi:location",
        event => {

            if (!event.detail) return;


            const {
                latitude,
                longitude
            } = event.detail;


            updateMapLocation(
                latitude,
                longitude
            );


            getLocationName(
                latitude,
                longitude
            );

        }
    );

    /* =====================================================
   DATE NAVIGATION
===================================================== */

    function parseSatelliteDate(dateString) {

        const [
            year,
            month,
            day
        ] = dateString
            .split("-")
            .map(Number);

        return new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    }


    function changeSatelliteDate(days) {

        /*
         * Convert the selected date into a UTC date.
         * This prevents timezone-related date skipping.
         */

        const date =
            parseSatelliteDate(
                selectedDate
            );


        /*
         * Move exactly one calendar day.
         */

        date.setUTCDate(
            date.getUTCDate() + days
        );


        const newDate =
            getDateString(date);


        /*
         * Today's UTC date.
         */

        const today =
            new Date();


        const todayString =
            getDateString(today);


        /*
         * Never allow future dates.
         */

        if (
            newDate > todayString
        ) {

            return;

        }


        /*
         * Maximum 30 days backward.
         */

        const oldest =
            new Date();

        oldest.setUTCDate(
            oldest.getUTCDate() - 30
        );


        const oldestString =
            getDateString(oldest);


        if (
            newDate < oldestString
        ) {

            return;

        }


        /*
         * IMPORTANT:
         * Only change the selected date ONCE.
         */

        selectedDate =
            newDate;


        /*
         * Remove old satellite imagery.
         */

        if (
            satelliteLayer &&
            map.hasLayer(satelliteLayer)
        ) {

            map.removeLayer(
                satelliteLayer
            );

        }


        /*
         * Create imagery for exactly
         * the selected date.
         */

        satelliteLayer =
            createSatelliteLayer(
                selectedDate
            );


        satelliteLayer.addTo(
            map
        );


        /*
         * Update the date shown in UI.
         */

        updateDateUI();


        console.log(
            "MEGHDHRISTI DATE:",
            selectedDate
        );

    }

    const previousButton =
        document.getElementById(
            "previousSatelliteDay"
        );


    const nextButton =
        document.getElementById(
            "nextSatelliteDay"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () =>
                changeSatelliteDate(-1)
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () =>
                changeSatelliteDate(1)
        );

    }


    /* =====================================================
       LAYER BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            ".satellite-control"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".satellite-control"
                        )
                        .forEach(
                            item =>
                                item.classList
                                    .remove(
                                        "active"
                                    )
                        );


                    button.classList.add(
                        "active"
                    );


                    const type =
                        button.dataset.layer;


                    /*
                     * Satellite
                     */

                    if (
                        type ===
                        "truecolor"
                    ) {

                        satelliteLayer
                            .setOpacity(
                                0.94
                            );

                    }


                    /*
                     * Clouds
                     *
                     * UI state for now.
                     */

                    if (
                        type ===
                        "clouds"
                    ) {

                        satelliteLayer
                            .setOpacity(
                                1
                            );

                    }


                    /*
                     * Rain
                     *
                     * Will later be connected
                     * to actual precipitation data.
                     */

                    if (
                        type ===
                        "rain"
                    ) {

                        satelliteLayer
                            .setOpacity(
                                0.75
                            );

                    }

                }
            );

        });


    /* =====================================================
       MAP RESIZE
    ===================================================== */

    setTimeout(
        () => {

            map.invalidateSize();

        },
        500
    );


    window.addEventListener(
        "resize",
        () => {

            map.invalidateSize();

        }
    );

});

/* =========================================================
   MEGHDHRISTI
   FULL LIVE MAP ENGINE
========================================================= */

function initMeghdhristiLiveMap() {


    /* =====================================================
       MAP
    ====================================================== */

    const mapElement =
        document.getElementById(
            "satelliteMap"
        );


    if (!mapElement) {

        console.warn(
            "MEGHDHRISTI: Live map element not found."
        );

        return;

    }


    const map =
        L.map(
            mapElement,
            {
                zoomControl: true,

                attributionControl: true,

                minZoom: 3,

                maxZoom: 9
            }
        );


    /*
     * Initial India view.
     *
     * Auto-location will update this.
     */

    map.setView(
        [20.2961, 85.8245],
        6
    );


    /* =====================================================
       BASE MAP
    ====================================================== */

    const baseMap =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors",

                maxZoom: 19,

                opacity: .20
            }
        );


    baseMap.addTo(map);


    /* =====================================================
       NASA GIBS
    ====================================================== */

    const GIBS_BASE =
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/all";


    const TRUE_COLOR =
        "VIIRS_SNPP_CorrectedReflectance_TrueColor";


    const CLOUD_LAYER =
        "VIIRS_SNPP_CorrectedReflectance_BandsM11-I2-I1";


    const createGibsLayer =
        (
            layerName,
            date,
            opacity = .90
        ) => {

            const url =
                `${GIBS_BASE}/` +
                `${layerName}/` +
                `default/` +
                `${date}/` +
                `GoogleMapsCompatible_Level9/` +
                `{z}/{y}/{x}.jpg`;


            return L.tileLayer(
                url,
                {
                    attribution:
                        "NASA GIBS",

                    tileSize: 256,

                    maxZoom: 9,

                    opacity,

                    crossOrigin: true
                }
            );

        };


    /* =====================================================
       DATE
    ====================================================== */

    function getDateString(
        date
    ) {

        const year =
            date.getUTCFullYear();


        const month =
            String(
                date.getUTCMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getUTCDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;

    }


    let selectedDate =
        getDateString(
            new Date()
        );


    /* =====================================================
       SATELLITE LAYER
    ====================================================== */

    let satelliteLayer =
        createGibsLayer(
            TRUE_COLOR,
            selectedDate,
            .92
        );


    satelliteLayer.addTo(
        map
    );


    /* =====================================================
       CLOUD LAYER
    ====================================================== */

    let cloudLayer =
        createGibsLayer(
            CLOUD_LAYER,
            selectedDate,
            .65
        );


    /* =====================================================
       STORM CELL
    ====================================================== */

    let stormMarker =
        null;


    function createStormCell(
        latitude,
        longitude
    ) {

        if (stormMarker) {

            map.removeLayer(
                stormMarker
            );

        }


        const stormIcon =
            L.divIcon({

                className:
                    "meghdhristi-storm-marker",

                html: `

                    <div class="storm-cell-ring">

                        <div class="storm-cell-core">
                        </div>

                    </div>

                `,

                iconSize:
                    [60, 60],

                iconAnchor:
                    [30, 30]

            });


        stormMarker =
            L.marker(
                [
                    latitude,
                    longitude
                ],
                {
                    icon:
                        stormIcon,

                    zIndexOffset:
                        900
                }
            )
                .addTo(map);


        stormMarker.bindTooltip(
            `
                <strong>
                    ACTIVE THUNDERSTORM
                </strong>
                <br>
                NE · 28 km/h
                <br>
                Lightning Risk: HIGH
            `,
            {
                direction:
                    "top",

                className:
                    "meghdhristi-tooltip"
            }
        );

    }


    /*
     * Initial storm cell.
     *
     * This is currently a visual prototype.
     * Later replace with backend/model coordinates.
     */

    createStormCell(
        20.2444,
        85.7916
    );

    /* =====================================================
   STORM MOVEMENT TRAJECTORY
===================================================== */

    const stormTrajectory = [
        [20.2444, 85.7916],
        [20.3300, 85.9400],
        [20.4300, 86.0900],
        [20.5400, 86.2500]
    ];


    const trajectoryLine =
        L.polyline(
            stormTrajectory,
            {
                color: "#31dfff",

                weight: 2,

                opacity: .65,

                dashArray: "7 9",

                lineCap: "round",

                lineJoin: "round"
            }
        )
            .addTo(map);

    const predictedStormPoint =
        L.circleMarker(
            stormTrajectory[
            stormTrajectory.length - 1
            ],
            {
                radius: 6,

                color: "#38ddff",

                weight: 2,

                fillColor: "#38ddff",

                fillOpacity: .85
            }
        )
            .addTo(map);


    predictedStormPoint.bindTooltip(
        "Predicted position · +60 min",
        {
            direction: "top"
        }
    );
    /* =====================================================
       USER LOCATION
    ====================================================== */

    let userMarker =
        null;


    const userIcon =
        L.divIcon({

            className:
                "meghdhristi-location-marker",

            html: `

                <div class="
                    location-marker-ring
                ">

                    <div class="
                        location-marker-core
                    "></div>

                </div>

            `,

            iconSize:
                [30, 30],

            iconAnchor:
                [15, 15]

        });


    function updateUserLocation(
        latitude,
        longitude
    ) {


        if (!userMarker) {

            userMarker =
                L.marker(
                    [
                        latitude,
                        longitude
                    ],
                    {
                        icon:
                            userIcon,

                        zIndexOffset:
                            1000
                    }
                )
                    .addTo(map);

        }
        else {

            userMarker.setLatLng(
                [
                    latitude,
                    longitude
                ]
            );

        }


        map.flyTo(
            [
                latitude,
                longitude
            ],
            7,
            {
                duration:
                    1.4
            }
        );


        const coordinates =
            `${Math.abs(latitude).toFixed(4)}° ` +
            `${latitude >= 0 ? "N" : "S"}, ` +
            `${Math.abs(longitude).toFixed(4)}° ` +
            `${longitude >= 0 ? "E" : "W"}`;


        const coordinateElements = [

            document.getElementById(
                "liveCoordinates"
            ),

            document.getElementById(
                "liveStormCoordinates"
            )

        ];


        coordinateElements
            .forEach(
                element => {

                    if (element) {

                        element.textContent =
                            coordinates;

                    }

                }
            );


        getLiveLocationName(
            latitude,
            longitude
        );

    }


    /* =====================================================
       REVERSE GEOCODING
    ====================================================== */

    async function getLiveLocationName(
        latitude,
        longitude
    ) {

        try {

            const response =
                await fetch(
                    `https://api.bigdatacloud.net/data/` +
                    `reverse-geocode-client` +
                    `?latitude=${latitude}` +
                    `&longitude=${longitude}` +
                    `&localityLanguage=en`
                );


            if (!response.ok) {

                throw new Error(
                    "Location request failed"
                );

            }


            const data =
                await response.json();


            const city =
                data.city ||
                data.locality ||
                "Your Location";


            const state =
                data.principalSubdivision ||
                "";


            const locationName =
                state &&
                    state !== city
                    ? `${city}, ${state}`
                    : city;


            const elements = [

                document.getElementById(
                    "liveLocation"
                ),

                document.getElementById(
                    "liveStormLocation"
                )

            ];


            elements
                .forEach(
                    element => {

                        if (element) {

                            element.textContent =
                                locationName;

                        }

                    }
                );

        }
        catch (error) {

            console.warn(
                "MEGHDHRISTI location:",
                error
            );

        }

    }


    /* =====================================================
       DETECT LOCATION
    ====================================================== */

    function detectLiveLocation() {

        if (
            !navigator.geolocation
        ) {

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                updateUserLocation(
                    latitude,
                    longitude
                );

            },

            error => {

                console.warn(
                    "Location unavailable:",
                    error.message
                );

            },

            {
                enableHighAccuracy:
                    true,

                timeout:
                    10000,

                maximumAge:
                    300000
            }

        );

    }


    detectLiveLocation();


    /* =====================================================
       REFRESH LOCATION
    ====================================================== */

    const refreshButton =
        document.getElementById(
            "liveRefreshLocation"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            detectLiveLocation
        );

    }


    /* =====================================================
       LAYER SWITCHING
    ====================================================== */

    document
        .querySelectorAll(
            ".live-layer-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".live-layer-button"
                            )
                            .forEach(
                                item => {

                                    item.classList
                                        .remove(
                                            "active"
                                        );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        const layerType =
                            button.dataset
                                .liveLayer;


                        /*
                         * Satellite
                         */

                        if (
                            layerType ===
                            "satellite"
                        ) {

                            if (
                                !map.hasLayer(
                                    satelliteLayer
                                )
                            ) {

                                satelliteLayer
                                    .addTo(map);

                            }


                            if (
                                map.hasLayer(
                                    cloudLayer
                                )
                            ) {

                                map.removeLayer(
                                    cloudLayer
                                );

                            }

                        }


                        /*
                         * Clouds
                         */

                        if (
                            layerType ===
                            "clouds"
                        ) {

                            if (
                                !map.hasLayer(
                                    satelliteLayer
                                )
                            ) {

                                satelliteLayer
                                    .addTo(map);

                            }


                            if (
                                !map.hasLayer(
                                    cloudLayer
                                )
                            ) {

                                cloudLayer
                                    .addTo(map);

                            }

                        }


                        /*
                         * Rain
                         *
                         * Placeholder layer.
                         *
                         * Backend rainfall data
                         * will replace this later.
                         */

                        if (
                            layerType ===
                            "rain"
                        ) {

                            satelliteLayer
                                .setOpacity(
                                    .65
                                );

                        }


                        /*
                         * Lightning
                         *
                         * Visual storm-cell mode.
                         */

                        if (
                            layerType ===
                            "lightning"
                        ) {

                            satelliteLayer
                                .setOpacity(
                                    .48
                                );

                        }

                    }
                );

            }
        );


    /* =====================================================
       DATE NAVIGATION
    ====================================================== */

    function parseDate(
        dateString
    ) {

        const [
            year,
            month,
            day
        ] =
            dateString
                .split("-")
                .map(Number);


        return new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    }


    function updateLiveDateUI() {

        const date =
            parseDate(
                selectedDate
            );


        const today =
            getDateString(
                new Date()
            );


        const dateText =
            selectedDate === today
                ? "TODAY"
                : date.toLocaleDateString(
                    "en-IN",
                    {
                        day:
                            "2-digit",

                        month:
                            "short",

                        year:
                            "numeric"
                    }
                );


        const liveDate =
            document.getElementById(
                "liveDate"
            );


        const imageryDate =
            document.getElementById(
                "liveImageryDate"
            );


        if (liveDate) {

            liveDate.textContent =
                dateText;

        }


        if (imageryDate) {

            imageryDate.textContent =
                dateText;

        }

    }


    function changeLiveDate(
        direction
    ) {

        const date =
            parseDate(
                selectedDate
            );


        date.setUTCDate(
            date.getUTCDate() +
            direction
        );


        const newDate =
            getDateString(
                date
            );


        const today =
            getDateString(
                new Date()
            );


        /*
         * No future imagery.
         */

        if (
            newDate >
            today
        ) {

            return;

        }


        /*
         * Keep 30 days history.
         */

        const oldest =
            new Date();


        oldest.setUTCDate(
            oldest.getUTCDate() - 30
        );


        if (
            newDate <
            getDateString(oldest)
        ) {

            return;

        }


        selectedDate =
            newDate;


        /*
         * Rebuild imagery layers.
         */

        map.removeLayer(
            satelliteLayer
        );


        if (
            map.hasLayer(
                cloudLayer
            )
        ) {

            map.removeLayer(
                cloudLayer
            );

        }


        satelliteLayer =
            createGibsLayer(
                TRUE_COLOR,
                selectedDate,
                .92
            );


        cloudLayer =
            createGibsLayer(
                CLOUD_LAYER,
                selectedDate,
                .65
            );


        satelliteLayer.addTo(
            map
        );


        updateLiveDateUI();

    }


    const previousDay =
        document.getElementById(
            "livePreviousDay"
        );


    const nextDay =
        document.getElementById(
            "liveNextDay"
        );


    if (previousDay) {

        previousDay.addEventListener(
            "click",
            () => {

                changeLiveDate(
                    -1
                );

            }
        );

    }


    if (nextDay) {

        nextDay.addEventListener(
            "click",
            () => {

                changeLiveDate(
                    1
                );

            }
        );

    }


    updateLiveDateUI();


    /* =====================================================
       LIVE CLOCK
    ====================================================== */

    function updateLiveClock() {

        const now =
            new Date();


        const time =
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hour12:
                        false,

                    timeZone:
                        "Asia/Kolkata"
                }
            );


        const element =
            document.getElementById(
                "navLiveTime"
            );


        if (element) {

            element.textContent =
                `${time} IST`;

        }

    }


    updateLiveClock();


    setInterval(
        updateLiveClock,
        1000
    );


    /* =====================================================
       RESIZE
    ====================================================== */

    setTimeout(
        () => {

            map.invalidateSize();

        },
        500
    );


    window.addEventListener(
        "resize",
        () => {

            map.invalidateSize();

        }
    );


    console.log(
        "MEGHDHRISTI FULL LIVE MAP INITIALIZED"
    );

}

/* =========================================================
   STORM IMPACT INTERACTION
========================================================= */

function updateStormImpact(data = {}) {

    const values = {

        speed:
            data.speed || "28 km/h",

        direction:
            data.direction || "NE",

        districts:
            data.districts || "3 Districts",

        exposure:
            data.exposure || "~1.2M",

        arrival:
            data.arrival || "18 min",

        confidence:
            data.confidence || 87

    };


    /* MOVEMENT */

    const movement =
        document.querySelector(
            ".impact-stat:nth-child(2) strong"
        );

    if (movement) {

        movement.textContent =
            `${values.direction} · ${values.speed}`;

    }


    /* IMPACT */

    const impact =
        document.querySelector(
            ".impact-stat:nth-child(3) strong"
        );

    if (impact) {

        impact.textContent =
            values.districts;

    }


    /* EXPOSURE */

    const exposure =
        document.querySelector(
            ".impact-stat:nth-child(4) strong"
        );

    if (exposure) {

        exposure.textContent =
            values.exposure;

    }


    /* ARRIVAL */

    const arrival =
        document.querySelector(
            ".impact-detail:nth-child(2) strong"
        );

    if (arrival) {

        arrival.textContent =
            values.arrival;

    }


    /* CONFIDENCE */

    const confidence =
        document.querySelector(
            ".trajectory-confidence strong"
        );

    const confidenceFill =
        document.querySelector(
            ".confidence-fill"
        );


    if (confidence) {

        confidence.textContent =
            `${values.confidence}%`;

    }


    if (confidenceFill) {

        confidenceFill.style.width =
            `${values.confidence}%`;

    }

}

/* =========================================================
   MEGHDHRISTI — INTERACTIVE STORM TRAJECTORY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const nodes =
            Array.from(
                document.querySelectorAll(
                    ".storm-node"
                )
            );

        const buttons =
            Array.from(
                document.querySelectorAll(
                    ".time-button"
                )
            );

        const slider =
            document.getElementById(
                "trajectorySlider"
            );

        const playButton =
            document.getElementById(
                "simulateButton"
            );

        const playIcon =
            document.getElementById(
                "simulateIcon"
            );

        const playText =
            document.getElementById(
                "simulateText"
            );


        if (
            !nodes.length ||
            !slider
        ) {
            return;
        }


        /* =====================================================
           DATA
        ====================================================== */

        const trajectoryData = nodes.map(
            node => ({

                minute:
                    Number(
                        node.dataset.minute
                    ),

                speed:
                    node.dataset.speed,

                confidence:
                    Number(
                        node.dataset.confidence
                    ),

                risk:
                    node.dataset.risk,

                direction:
                    node.dataset.direction,

                location:
                    node.dataset.location

            })
        );


        /* =====================================================
           ELEMENTS
        ====================================================== */

        const selectedTime =
            document.getElementById(
                "selectedTime"
            );

        const selectedLocation =
            document.getElementById(
                "selectedLocation"
            );

        const selectedConfidence =
            document.getElementById(
                "selectedConfidence"
            );

        const selectedSpeed =
            document.getElementById(
                "selectedSpeed"
            );

        const selectedDirection =
            document.getElementById(
                "selectedDirection"
            );

        const selectedRisk =
            document.getElementById(
                "selectedRisk"
            );

        const selectedEta =
            document.getElementById(
                "selectedEta"
            );

        const confidenceBar =
            document.getElementById(
                "confidenceBar"
            );

        const timelineValue =
            document.getElementById(
                "timelineValue"
            );

        const floatingLocation =
            document.getElementById(
                "floatingLocation"
            );

        const floatingDirection =
            document.getElementById(
                "floatingDirection"
            );

        const floatingSpeed =
            document.getElementById(
                "floatingSpeed"
            );

        const floatingRisk =
            document.getElementById(
                "floatingRisk"
            );


        /* =====================================================
           UPDATE UI
        ====================================================== */

        function updateTrajectory(index) {

            const data =
                trajectoryData[index];


            /* selected node */

            nodes.forEach(
                node =>
                    node.classList.remove(
                        "selected"
                    )
            );

            nodes[index]
                .classList.add(
                    "selected"
                );


            /* buttons */

            buttons.forEach(
                button =>
                    button.classList.remove(
                        "active"
                    )
            );

            if (buttons[index]) {

                buttons[index]
                    .classList.add(
                        "active"
                    );

            }


            /* slider */

            slider.value =
                index;


            /* time */

            const timeText =
                data.minute === 0
                    ? "NOW"
                    : `+${data.minute} MIN`;


            selectedTime.textContent =
                timeText;


            timelineValue.textContent =
                data.minute === 0
                    ? "0 MIN"
                    : `+${data.minute} MIN`;


            /* location */

            selectedLocation.textContent =
                data.location;


            floatingLocation.textContent =
                data.location;


            /* confidence */

            selectedConfidence.textContent =
                `${data.confidence}%`;


            confidenceBar.style.width =
                `${data.confidence}%`;


            /* speed */

            selectedSpeed.textContent =
                data.speed;


            floatingSpeed.textContent =
                `${data.speed} km/h`;


            /* direction */

            selectedDirection.textContent =
                `${data.direction} ↗`;


            floatingDirection.textContent =
                data.direction;


            /* risk */

            selectedRisk.textContent =
                data.risk;


            floatingRisk.textContent =
                data.risk;


            /* ETA */

            if (data.minute === 0) {

                selectedEta.textContent =
                    "NOW";

            } else {

                selectedEta.textContent =
                    `${data.minute} min`;

            }


            /* risk styling */

            selectedRisk.style.color =
                data.risk === "SEVERE"
                    ? "#ff4f6e"
                    : data.risk === "HIGH"
                        ? "#ff536f"
                        : "#ffbd4d";


            floatingRisk.style.color =
                selectedRisk.style.color;


            /* move floating card */

            const node =
                nodes[index];

            const left =
                parseFloat(
                    node.style.left
                );

            const top =
                parseFloat(
                    node.style.top
                );


            /*
             * Keep the card away from
             * the node itself.
             */

            const card =
                document.getElementById(
                    "stormFloatingCard"
                );


            if (card) {

                let cardLeft =
                    left + 5;

                let cardTop =
                    top - 2;


                if (left > 65) {

                    cardLeft =
                        left - 18;

                }


                if (top < 30) {

                    cardTop =
                        top + 8;

                }


                card.style.left =
                    `${cardLeft}%`;

                card.style.top =
                    `${cardTop}%`;

            }

        }


        /* =====================================================
           CLICK NODES
        ====================================================== */

        nodes.forEach(
            (node, index) => {

                node.addEventListener(
                    "click",
                    () => {

                        updateTrajectory(
                            index
                        );

                    }
                );

            }
        );


        /* =====================================================
           TIMELINE BUTTONS
        ====================================================== */

        buttons.forEach(
            (button, index) => {

                button.addEventListener(
                    "click",
                    () => {

                        updateTrajectory(
                            index
                        );

                    }
                );

            }
        );


        /* =====================================================
           SLIDER
        ====================================================== */

        slider.addEventListener(
            "input",
            () => {

                updateTrajectory(
                    Number(
                        slider.value
                    )
                );

            }
        );


        /* =====================================================
           PLAY / PAUSE
        ====================================================== */

        let playing = false;

        let playTimer = null;

        let currentIndex = 0;


        function startSimulation() {

            if (playing) {
                return;
            }


            playing = true;

            playButton
                .classList
                .add("playing");


            playIcon.textContent =
                "Ⅱ";


            playText.textContent =
                "PAUSE SIMULATION";


            playTimer =
                setInterval(
                    () => {

                        currentIndex++;


                        if (
                            currentIndex >=
                            trajectoryData.length
                        ) {

                            currentIndex = 0;

                        }


                        updateTrajectory(
                            currentIndex
                        );

                    },
                    1400
                );

        }


        function stopSimulation() {

            playing = false;

            clearInterval(
                playTimer
            );


            playTimer = null;


            playButton
                .classList
                .remove("playing");


            playIcon.textContent =
                "▶";


            playText.textContent =
                "PLAY TRAJECTORY";

        }


        playButton.addEventListener(
            "click",
            () => {

                if (playing) {

                    stopSimulation();

                } else {

                    startSimulation();

                }

            }
        );


        /* =====================================================
           INITIAL STATE
        ====================================================== */

        updateTrajectory(0);


    }
);

/* =========================================================
   MEGHDHRISTI MAP LAYERS
========================================================= */


/* ---------------------------------------------------------
   BASE MAP
--------------------------------------------------------- */

const baseMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"
    }
);


/* ---------------------------------------------------------
   SATELLITE
--------------------------------------------------------- */

const satelliteLayer = L.tileLayer(
    "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/2025-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg",
    {
        opacity: 0.9,

        maxZoom: 8,

        attribution:
            "NASA GIBS"
    }
);


