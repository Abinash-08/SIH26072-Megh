"use strict";

/* =========================================================
   MEGHDHRISTI — ALERT COMMAND CENTER JS

   Handles:
   1. Alert filtering
   2. Alert acknowledgement
   3. Alert detail modal
   4. Critical alert acknowledgement
   5. Refresh simulation
   6. Active alert count
   7. System status rotation
   8. Toast notifications
   9. Footer year
   10. Newsletter interaction

   IMPORTANT:
   Navbar clock is handled ONLY by navbar.js.
========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENT REFERENCES
    ===================================================== */

    const alertCards =
        document.querySelectorAll(".alert-card");

    const alertFilters =
        document.querySelectorAll(".alert-filter");

    const activeAlertCount =
        document.getElementById("activeAlertCount");

    const refreshButton =
        document.getElementById("refreshAlerts");

    const systemState =
        document.getElementById("systemState");

    const lastAlertUpdate =
        document.getElementById("lastAlertUpdate");

    const alertModal =
        document.getElementById("alertModal");

    const modalClose =
        document.getElementById("modalClose");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalSeverity =
        document.getElementById("modalSeverity");

    const modalLocation =
        document.getElementById("modalLocation");

    const modalTime =
        document.getElementById("modalTime");

    const modalRisk =
        document.getElementById("modalRisk");

    const modalMessage =
        document.getElementById("modalMessage");

    const detailAcknowledge =
        document.getElementById("detailAcknowledge");

    const alertToast =
        document.getElementById("alertToast");

    const toastText =
        document.getElementById("toastText");

    const year =
        document.getElementById("year");

    const newsletterForm =
        document.getElementById("newsletterForm");

    const newsletterEmail =
        document.getElementById("newsletterEmail");

    const newsletterMessage =
        document.getElementById("newsletterMessage");


    /* =====================================================
       STATE
    ===================================================== */

    let toastTimer = null;

    let systemStateIndex = 0;

    const systemStates = [
        "ALL STREAMS NOMINAL",
        "RADAR FEED SYNCHRONIZED",
        "LIGHTNING FEED SYNCHRONIZED",
        "AI ALERT ENGINE READY"
    ];


    /* =====================================================
       CURRENT TIME
    ===================================================== */

    function getISTTime() {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit",

                hour12: false
            }
        ).format(new Date());

    }


    /* =====================================================
       UPDATE LAST ALERT TIME
    ===================================================== */

    function updateLastAlertTime() {

        if (!lastAlertUpdate) return;

        lastAlertUpdate.textContent =
            `${getISTTime()} IST`;

    }


    updateLastAlertTime();

    setInterval(
        updateLastAlertTime,
        5000
    );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        if (!alertToast || !toastText) return;


        toastText.textContent = message;


        alertToast.classList.add("show");


        clearTimeout(toastTimer);


        toastTimer = setTimeout(() => {

            alertToast.classList.remove("show");

        }, 2800);

    }


    /* =====================================================
       ACTIVE ALERT COUNT
    ===================================================== */

    function refreshActiveAlertCount() {

        if (!activeAlertCount) return;


        let activeCount = 0;


        alertCards.forEach((card) => {

            if (
                !card.classList.contains("resolved")
            ) {

                activeCount++;

            }

        });


        activeAlertCount.textContent =
            String(activeCount);

    }


    refreshActiveAlertCount();


    /* =====================================================
       ALERT FILTERING
    ===================================================== */

    alertFilters.forEach((filter) => {

        filter.addEventListener("click", () => {


            /* Remove current active state */

            alertFilters.forEach((item) => {

                item.classList.remove("active");

            });


            /* Activate selected filter */

            filter.classList.add("active");


            const filterType =
                filter.dataset.filter;


            /* Filter cards */

            alertCards.forEach((card) => {

                const severity =
                    card.dataset.severity;


                const isResolved =
                    card.classList.contains(
                        "resolved"
                    );


                let shouldShow = true;


                if (filterType === "all") {

                    shouldShow = true;

                }


                else if (filterType === "active") {

                    shouldShow =
                        !isResolved;

                }


                else {

                    shouldShow =
                        severity === filterType;

                }


                card.classList.toggle(
                    "hidden",
                    !shouldShow
                );

            });


            showToast(
                filterType === "all"
                    ? "Showing all alert records."
                    : `Filter applied: ${filter.textContent.trim()}.`
            );

        });

    });


    /* =====================================================
       ALERT CARD — VIEW DETAILS
    ===================================================== */

    const detailButtons =
        document.querySelectorAll(
            ".view-details"
        );


    detailButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const card =
                button.closest(".alert-card");


            if (!card || !alertModal) return;


            /* ---------------------------------------------
               Title
            --------------------------------------------- */

            if (modalTitle) {

                modalTitle.textContent =
                    card.querySelector(
                        ".card-title h3"
                    )?.textContent.trim()
                    || "Alert Details";

            }


            /* ---------------------------------------------
               Severity
            --------------------------------------------- */

            if (modalSeverity) {

                modalSeverity.textContent =
                    card.querySelector(
                        ".severity"
                    )?.textContent.trim()
                    || "ALERT";

            }


            /* ---------------------------------------------
               Location
            --------------------------------------------- */

            if (modalLocation) {

                modalLocation.textContent =
                    card.dataset.location
                    || "Monitoring sector";

            }


            /* ---------------------------------------------
               Time
            --------------------------------------------- */

            if (modalTime) {

                modalTime.textContent =
                    card.querySelector(
                        "time"
                    )?.textContent.trim()
                    || "Just now";

            }


            /* ---------------------------------------------
               Risk
            --------------------------------------------- */

            if (modalRisk) {

                const metric =
                    card.querySelector(
                        ".card-metrics strong"
                    );


                modalRisk.textContent =
                    metric?.textContent.trim()
                    || "High";

            }


            /* ---------------------------------------------
               Detailed message
            --------------------------------------------- */

            if (modalMessage) {

                modalMessage.textContent =
                    card.dataset.message
                    ||
                    "Atmospheric conditions indicate elevated thunderstorm activity. Maintain situational awareness and follow local safety guidance.";

            }


            /* Open modal */

            alertModal.classList.add("open");

            document.body.style.overflow =
                "hidden";

        });

    });


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        if (!alertModal) return;


        alertModal.classList.remove(
            "open"
        );


        document.body.style.overflow =
            "";

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (alertModal) {

        alertModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === alertModal
                ) {

                    closeModal();

                }

            }
        );

    }


    /* Escape key */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                alertModal?.classList.contains(
                    "open"
                )
            ) {

                closeModal();

            }

        }
    );


    /* =====================================================
       ACKNOWLEDGE INDIVIDUAL ALERT
    ===================================================== */

    const acknowledgeButtons =
        document.querySelectorAll(
            ".card-action:not(.view-details)"
        );


    acknowledgeButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const card =
                    button.closest(
                        ".alert-card"
                    );


                if (!card) return;


                const title =
                    card.querySelector(
                        ".card-title h3"
                    )?.textContent.trim()
                    || "Alert";


                const alreadyAcknowledged =
                    button.classList.contains(
                        "done"
                    );


                if (alreadyAcknowledged) {

                    button.classList.remove(
                        "done"
                    );

                    button.textContent =
                        "Acknowledge";


                    card.classList.remove(
                        "resolved"
                    );


                    showToast(
                        `${title} returned to active state.`
                    );

                }

                else {

                    button.classList.add(
                        "done"
                    );

                    button.textContent =
                        "Acknowledged ✓";


                    card.classList.add(
                        "resolved"
                    );


                    showToast(
                        `${title} acknowledged successfully.`
                    );

                }


                refreshActiveAlertCount();

            }
        );

    });


    /* =====================================================
       CRITICAL ALERT ACKNOWLEDGEMENT
    ===================================================== */

    if (detailAcknowledge) {

        detailAcknowledge.addEventListener(
            "click",
            () => {

                const acknowledged =
                    detailAcknowledge.classList.toggle(
                        "done"
                    );


                if (acknowledged) {

                    detailAcknowledge.textContent =
                        "Alert Acknowledged ✓";


                    showToast(
                        "Critical alert acknowledged by operator."
                    );

                }

                else {

                    detailAcknowledge.textContent =
                        "Acknowledge Critical Alert";


                    showToast(
                        "Critical alert marked active again."
                    );

                }

            }
        );

    }


    /* =====================================================
       REFRESH ALERT FEED
    ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => {


                if (
                    refreshButton.classList.contains(
                        "loading"
                    )
                ) {

                    return;

                }


                refreshButton.classList.add(
                    "loading"
                );


                const originalText =
                    refreshButton.textContent;


                refreshButton.textContent =
                    "Refreshing…";


                /* Small realistic refresh delay */

                setTimeout(() => {

                    refreshButton.classList.remove(
                        "loading"
                    );


                    refreshButton.textContent =
                        originalText;


                    updateLastAlertTime();


                    showToast(
                        "Alert feed refreshed successfully."
                    );

                }, 800);

            }
        );

    }


    /* =====================================================
       SYSTEM STATE ROTATION
    ===================================================== */

    if (systemState) {

        setInterval(
            () => {

                systemStateIndex =
                    (
                        systemStateIndex + 1
                    ) %
                    systemStates.length;


                systemState.textContent =
                    systemStates[
                        systemStateIndex
                    ];

            },
            4200
        );

    }


    /* =====================================================
       FOOTER YEAR
    ===================================================== */

    if (year) {

        year.textContent =
            String(
                new Date().getFullYear()
            );

    }


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const email =
                    newsletterEmail?.value.trim();


                if (!email) {

                    return;

                }


                if (newsletterMessage) {

                    newsletterMessage.textContent =
                        "You're on the intelligence list ✓";

                    newsletterMessage.style.color =
                        "#21e695";

                }


                if (newsletterEmail) {

                    newsletterEmail.value =
                        "";

                }


                showToast(
                    "Subscription preference saved."
                );

            }
        );

    }


    /* =====================================================
       INITIALIZATION MESSAGE
    ===================================================== */

    console.log(
        "MEGHDHRISTI Alerts: Command Center initialized."
    );

});