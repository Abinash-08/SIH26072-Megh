"use strict";

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       YEAR
    ===================================================== */

    const year =
        document.getElementById("year");

    if (year) {
        year.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       ANIMATED COUNTERS
    ===================================================== */

    const counters =
        document.querySelectorAll(".counter");


    counters.forEach((counter) => {

        const target =
            Number(counter.dataset.target);

        if (
            !Number.isFinite(target) ||
            target < 0
        ) {
            counter.textContent = "0";
            return;
        }


        let current = 0;

        const duration = 1200;

        const start =
            performance.now();


        function animate(time) {

            const elapsed =
                time - start;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
             * Ease-out function
             */

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            current =
                Math.round(
                    target * eased
                );


            counter.textContent =
                String(current);


            if (progress < 1) {

                requestAnimationFrame(
                    animate
                );

            }

        }


        requestAnimationFrame(animate);

    });


    /* =====================================================
       LAST UPDATED
    ===================================================== */

    const updated =
        document.getElementById(
            "lastUpdated"
        );


    const stormTime =
        document.getElementById(
            "stormTime"
        );


    function updateTimeLabels() {

        const now =
            new Date();


        const time =
            new Intl.DateTimeFormat(
                "en-IN",
                {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            ).format(now);


        if (updated) {
            updated.textContent =
                time + " IST";
        }


        if (stormTime) {
            stormTime.textContent =
                time + " IST";
        }

    }


    updateTimeLabels();


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const form =
        document.getElementById(
            "newsletterForm"
        );


    const email =
        document.getElementById(
            "newsletterEmail"
        );


    const message =
        document.getElementById(
            "newsletterMessage"
        );


    if (form) {

        form.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                if (!email) return;


                const value =
                    email.value.trim();


                if (!value) {

                    message.textContent =
                        "Please enter your email.";

                    message.style.color =
                        "#ff5573";

                    return;

                }


                /*
                 * Frontend-only demo.
                 * Backend subscription can be connected later.
                 */

                message.textContent =
                    "You're on the MEGHDHRISTI update list.";

                message.style.color =
                    "#21e695";


                email.value = "";

            }
        );

    }


    /* =====================================================
       SIMPLE LIVE DATA SIMULATION
       Temporary frontend demo.
    ===================================================== */

    const metricCounters =
        document.querySelectorAll(
            ".metric-card .counter"
        );


    function simulateData() {

        metricCounters.forEach((counter) => {

            const base =
                Number(
                    counter.dataset.target
                );


            if (!Number.isFinite(base)) {
                return;
            }


            const variation =
                Math.floor(
                    Math.random() * 5
                ) - 2;


            const value =
                Math.max(
                    0,
                    Math.min(
                        100,
                        base + variation
                    )
                );


            counter.textContent =
                value;

        });

    }


    /*
     * Update demo values every 8 seconds.
     * Replace this later with API/WebSocket data.
     */

    setInterval(
        simulateData,
        8000
    );

});

/* =========================================================
   MEGHDHRISTI — AUTO LOCATION DETECTION
========================================================= */

const userLocation =
    document.getElementById("userLocation");

const userCoordinates =
    document.getElementById("userCoordinates");

const locationStatus =
    document.getElementById("locationStatus");

const refreshLocation =
    document.getElementById("refreshLocation");


/*
 * Format coordinates nicely.
 */

function formatCoordinates(latitude, longitude) {

    const latDirection =
        latitude >= 0 ? "N" : "S";

    const lonDirection =
        longitude >= 0 ? "E" : "W";


    return `
        ${Math.abs(latitude).toFixed(4)}° ${latDirection},
        ${Math.abs(longitude).toFixed(4)}° ${lonDirection}
    `;
}


/*
 * Update the UI with detected coordinates.
 */

function updateLocationCoordinates(
    latitude,
    longitude
) {

    if (userCoordinates) {

        userCoordinates.textContent =
            formatCoordinates(
                latitude,
                longitude
            );

    }

}


/*
 * Reverse geocode coordinates
 * into a readable location.
 */

async function reverseGeocode(
    latitude,
    longitude
) {

    try {

        const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&localityLanguage=en`;


        const response =
            await fetch(url);


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
            data.principalSubdivision ||
            "Your Location";


        const state =
            data.principalSubdivision;


        let locationName =
            city;


        if (
            state &&
            state !== city
        ) {

            locationName +=
                `, ${state}`;

        }


        if (userLocation) {

            userLocation.textContent =
                locationName;

            userLocation.classList.add(
                "location-detected"
            );

        }


        if (locationStatus) {

            locationStatus.textContent =
                `Your Location · ${locationName}`;

            locationStatus.classList.add(
                "location-detected"
            );

        }


        return data;

    }
    catch (error) {

        console.warn(
            "MEGHDHRISTI location name lookup failed:",
            error
        );


        /*
         * Coordinates still work even if
         * the location-name service fails.
         */

        if (userLocation) {

            userLocation.textContent =
                "Location detected";

        }


        if (locationStatus) {

            locationStatus.textContent =
                "Location detected";

        }

    }

}


/*
 * Successfully detected position.
 */

function handleLocationSuccess(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;


    console.log(
        "MEGHDHRISTI detected location:",
        latitude,
        longitude
    );


    updateLocationCoordinates(
        latitude,
        longitude
    );
    updateStormVisual(
        latitude,
        longitude
    );

    /*
     * Change button state.
     */

    if (refreshLocation) {

        refreshLocation.classList.remove(
            "loading"
        );

        refreshLocation.classList.add(
            "success"
        );

        refreshLocation.innerHTML =
            `<span>✓</span> Location Detected`;

    }


    /*
     * Reverse geocode.
     */

    reverseGeocode(
        latitude,
        longitude
    );


    /*
     * Store location temporarily.
     * This can later be sent to your backend.
     */

    window.megdhRistiLocation = {

        latitude,

        longitude,

        accuracy:
            position.coords.accuracy,

        timestamp:
            Date.now()

    };


    /*
     * Dispatch an event so other
     * modules can use the location.
     */

    window.dispatchEvent(
        new CustomEvent(
            "meghdhristi:location",
            {
                detail:
                    window.megdhRistiLocation
            }
        )
    );

}


/*
 * Location error.
 */

function handleLocationError(error) {

    console.warn(
        "MEGHDHRISTI location error:",
        error
    );


    let message =
        "Unable to detect location";


    switch (error.code) {

        case error.PERMISSION_DENIED:

            message =
                "Location permission denied";

            break;


        case error.POSITION_UNAVAILABLE:

            message =
                "Location unavailable";

            break;


        case error.TIMEOUT:

            message =
                "Location request timed out";

            break;

    }


    if (userLocation) {

        userLocation.textContent =
            "Location unavailable";

        userLocation.classList.add(
            "location-error"
        );

    }


    if (userCoordinates) {

        userCoordinates.textContent =
            "--";

    }


    if (locationStatus) {

        locationStatus.textContent =
            message;

        locationStatus.classList.add(
            "location-error"
        );

    }


    if (refreshLocation) {

        refreshLocation.classList.remove(
            "loading"
        );

        refreshLocation.innerHTML =
            `<span>◎</span> Try Again`;

    }

}


/*
 * Request location.
 */

function detectUserLocation() {

    if (!navigator.geolocation) {

        handleLocationError({
            code: 2
        });

        return;

    }


    if (refreshLocation) {

        refreshLocation.classList.add(
            "loading"
        );

        refreshLocation.innerHTML =
            `<span>⌁</span> Detecting...`;

    }


    if (locationStatus) {

        locationStatus.textContent =
            "Detecting your location...";

        locationStatus.classList.remove(
            "location-error"
        );

    }


    navigator.geolocation.getCurrentPosition(

        handleLocationSuccess,

        handleLocationError,

        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 300000
        }

    );

}


/*
 * Button.
 */

if (refreshLocation) {

    refreshLocation.addEventListener(
        "click",
        detectUserLocation
    );

}


/*
 * Automatically request location
 * when the dashboard loads.
 */

detectUserLocation();

/* =========================================================
   CENTER STORM VISUAL AROUND USER
========================================================= */

function updateStormVisual(
    latitude,
    longitude
) {

    const stormCell =
        document.querySelector(
            ".storm-cell"
        );


    if (!stormCell) return;


    /*
     * The radar is currently a visual
     * representation, so we keep the
     * cell within the radar bounds.
     */

    const x =
        50 +
        ((longitude % 1) * 8);


    const y =
        48 -
        ((latitude % 1) * 5);


    stormCell.style.left =
        `${Math.max(42, Math.min(68, x))}%`;


    stormCell.style.top =
        `${Math.max(35, Math.min(62, y))}%`;

}