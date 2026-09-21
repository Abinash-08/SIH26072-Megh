"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");
    const themeButton = document.getElementById("themeButton");

    /*
     * Mobile navigation
     */

    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });


        /*
         * Close mobile menu after navigation
         */

        const mobileLinks =
            mobileMenu.querySelectorAll("a");

        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("open");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /*
     * Small visual mode interaction
     *
     * This does NOT change the whole theme yet.
     * It simply toggles an enhanced-glow mode.
     */

    if (themeButton) {

        themeButton.addEventListener("click", () => {

            document.body.classList.toggle(
                "enhanced-glow"
            );

            const enabled =
                document.body.classList.contains(
                    "enhanced-glow"
                );

            themeButton.setAttribute(
                "aria-pressed",
                String(enabled)
            );

        });

    }


    /*
     * Automatically detect the current page
     * and highlight the correct navbar item.
     */

    const currentPath =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const navLinks =
        document.querySelectorAll(
            ".nav-link, .mobile-link"
        );


    navLinks.forEach((link) => {

        const href =
            link.getAttribute("href");

        if (!href) return;

        const linkPath =
            href
                .split("/")
                .pop()
                .toLowerCase();


        link.classList.remove("active");


        if (
            linkPath === currentPath ||
            (currentPath === "" &&
             linkPath === "index.html")
        ) {

            link.classList.add("active");

        }

    });

});
/* =========================================================
   REAL-TIME IST CLOCK
========================================================= */

const clock =
    document.getElementById("navClock");


function updateLiveClock() {

    if (!clock) {

        console.warn(
            "MEGHDHRISTI: #navClock not found."
        );

        return;

    }


    const now = new Date();


    const timeFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit",

                hour12: false
            }
        );


    const currentTime =
        timeFormatter.format(now);


    clock.textContent =
        `${currentTime} IST`;

}


/*
 * Run immediately.
 */

updateLiveClock();


/*
 * Update every second.
 */

setInterval(
    updateLiveClock,
    1000
);

