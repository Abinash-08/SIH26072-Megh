/* =========================================================
   MEGHDHRISTI — ANALYTICS ENGINE
   2–5 HOUR AI NOWCASTING
========================================================= */

(() => {
    "use strict";

    const state = {
        period: "2h",
        charts: {},
        refreshing: false
    };

    const COLORS = {
        cyan: "#2edbff",
        blue: "#4287ff",
        purple: "#9068ff",
        green: "#21e695",
        yellow: "#ffc928",
        orange: "#ff9f43",
        red: "#ff4d5f",
        text: "#71859b",
        grid: "rgba(130,170,220,.07)"
    };

    /* =====================================================
       2–5 HOUR NOWCAST DATA
    ===================================================== */

    const PERIOD_DATA = {

        "2h": {
            labels: [
                "NOW",
                "+30 MIN",
                "+60 MIN",
                "+90 MIN",
                "+2 HR"
            ],
            accuracy: [
                87.4,
                88.1,
                89.0,
                89.6,
                90.2
            ],
            confidence: [
                88.1,
                88.7,
                89.4,
                90.0,
                90.6
            ]
        },

        "3h": {
            labels: [
                "NOW",
                "+30 MIN",
                "+1 HR",
                "+2 HR",
                "+3 HR"
            ],
            accuracy: [
                87.4,
                88.0,
                88.7,
                89.3,
                89.8
            ],
            confidence: [
                88.1,
                88.6,
                89.1,
                89.7,
                90.1
            ]
        },

        "4h": {
            labels: [
                "NOW",
                "+1 HR",
                "+2 HR",
                "+3 HR",
                "+4 HR"
            ],
            accuracy: [
                87.4,
                87.9,
                88.5,
                89.0,
                89.4
            ],
            confidence: [
                88.1,
                88.5,
                89.0,
                89.4,
                89.8
            ]
        },

        "5h": {
            labels: [
                "NOW",
                "+1 HR",
                "+2 HR",
                "+3 HR",
                "+4 HR",
                "+5 HR"
            ],
            accuracy: [
                87.4,
                87.8,
                88.2,
                88.7,
                89.1,
                89.3
            ],
            confidence: [
                88.1,
                88.4,
                88.8,
                89.2,
                89.5,
                89.7
            ]
        }
    };


    /* =====================================================
       CLOCK
    ===================================================== */

    function updateClock() {

        const clock =
            document.getElementById("navClock");

        if (!clock) return;

        const now = new Date();

        const formatter =
            new Intl.DateTimeFormat("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZone: "Asia/Kolkata"
            });

        clock.textContent =
            `${formatter.format(now)} IST`;
    }


    /* =====================================================
       GRADIENT
    ===================================================== */

    function createGradient(
        ctx,
        topColor,
        bottomColor = "rgba(46,219,255,0)"
    ) {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                330
            );

        gradient.addColorStop(
            0,
            topColor
        );

        gradient.addColorStop(
            1,
            bottomColor
        );

        return gradient;
    }


    /* =====================================================
       COMMON SCALES
    ===================================================== */

    function baseScales() {

        return {

            x: {

                grid: {
                    display: false
                },

                border: {
                    display: false
                },

                ticks: {

                    color:
                        COLORS.text,

                    padding: 8,

                    font: {
                        family: "Inter",
                        size: 11,
                        weight: "600"
                    }
                }
            },

            y: {

                grid: {

                    color:
                        COLORS.grid,

                    drawTicks: false
                },

                border: {
                    display: false
                },

                ticks: {

                    color:
                        COLORS.text,

                    padding: 8,

                    font: {
                        family: "Inter",
                        size: 10,
                        weight: "500"
                    }
                }
            }
        };
    }


    /* =====================================================
       TOOLTIP
    ===================================================== */

    function tooltipOptions() {

        return {

            enabled: true,

            backgroundColor:
                "rgba(4,13,25,.97)",

            titleColor:
                "#dceafa",

            bodyColor:
                "#a1b3c7",

            borderColor:
                "rgba(46,219,255,.25)",

            borderWidth: 1,

            padding: 12,

            displayColors: true,

            cornerRadius: 10,

            titleFont: {

                family:
                    "Space Grotesk",

                size: 12,

                weight: "700"
            },

            bodyFont: {

                family:
                    "Inter",

                size: 11
            }
        };
    }


    /* =====================================================
       DESTROY EXISTING CHART
    ===================================================== */

    function destroyChart(name) {

        if (state.charts[name]) {

            state.charts[name].destroy();

            state.charts[name] = null;
        }
    }


    /* =====================================================
       ACCURACY CHART
    ===================================================== */

    function createAccuracyChart() {

        const canvas =
            document.getElementById(
                "accuracyChart"
            );

        if (!canvas) return;

        if (typeof Chart === "undefined") {

            console.error(
                "Chart.js is not loaded."
            );

            return;
        }

        destroyChart("accuracy");

        const ctx =
            canvas.getContext("2d");

        const data =
            PERIOD_DATA[state.period];


        state.charts.accuracy =
            new Chart(ctx, {

                type: "line",

                data: {

                    labels:
                        data.labels,

                    datasets: [

                        {

                            label:
                                "Prediction Accuracy",

                            data:
                                data.accuracy,

                            borderColor:
                                COLORS.cyan,

                            backgroundColor:
                                createGradient(
                                    ctx,
                                    "rgba(46,219,255,.25)",
                                    "rgba(46,219,255,0)"
                                ),

                            borderWidth: 3,

                            pointRadius: 4,

                            pointHoverRadius: 7,

                            pointBackgroundColor:
                                "#071321",

                            pointBorderColor:
                                COLORS.cyan,

                            pointBorderWidth: 2,

                            tension: 0.42,

                            fill: true
                        },

                        {

                            label:
                                "Model Confidence",

                            data:
                                data.confidence,

                            borderColor:
                                COLORS.purple,

                            backgroundColor:
                                "transparent",

                            borderWidth: 2,

                            borderDash:
                                [7, 6],

                            pointRadius: 3,

                            pointHoverRadius: 6,

                            pointBackgroundColor:
                                "#071321",

                            pointBorderColor:
                                COLORS.purple,

                            pointBorderWidth: 2,

                            tension: 0.42,

                            fill: false
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        mode: "index",

                        intersect: false
                    },

                    plugins: {

                        legend: {

                            position:
                                "top",

                            align:
                                "end",

                            labels: {

                                color:
                                    "#8ea3b8",

                                padding: 18,

                                boxWidth: 12,

                                boxHeight: 7,

                                usePointStyle:
                                    true,

                                font: {

                                    family:
                                        "Inter",

                                    size: 11,

                                    weight: "600"
                                }
                            }
                        },

                        tooltip:
                            tooltipOptions()
                    },

                    scales: {

                        ...baseScales(),

                        y: {

                            ...baseScales().y,

                            min: 70,

                            max: 100,

                            ticks: {

                                ...baseScales().y.ticks,

                                callback:
                                    value =>
                                        `${value}%`
                            }
                        }
                    }
                }
            });
    }


    /* =====================================================
       RISK DISTRIBUTION
    ===================================================== */

    function createRiskChart() {

        const canvas =
            document.getElementById(
                "riskChart"
            );

        if (!canvas) return;

        if (typeof Chart === "undefined")
            return;

        destroyChart("risk");

        state.charts.risk =
            new Chart(canvas, {

                type: "doughnut",

                data: {

                    labels: [
                        "Severe",
                        "High",
                        "Moderate",
                        "Low"
                    ],

                    datasets: [

                        {

                            data: [
                                24,
                                42,
                                21,
                                13
                            ],

                            backgroundColor: [

                                COLORS.red,
                                COLORS.orange,
                                COLORS.yellow,
                                COLORS.cyan
                            ],

                            borderColor:
                                "#071321",

                            borderWidth: 5,

                            hoverOffset: 9
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "72%",

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip:
                            tooltipOptions()
                    }
                }
            });
    }


    /* =====================================================
       PREDICTED VS OBSERVED
    ===================================================== */

    function createValidationChart() {

        const canvas =
            document.getElementById(
                "validationChart"
            );

        if (!canvas) return;

        if (typeof Chart === "undefined")
            return;

        destroyChart("validation");

        const ctx =
            canvas.getContext("2d");


        state.charts.validation =
            new Chart(ctx, {

                type: "line",

                data: {

                    labels: [

                        "NOW",
                        "+1 HR",
                        "+2 HR",
                        "+3 HR",
                        "+4 HR",
                        "+5 HR"
                    ],

                    datasets: [

                        {

                            label:
                                "Predicted",

                            data: [
                                68,
                                74,
                                82,
                                91,
                                76,
                                72
                            ],

                            borderColor:
                                COLORS.cyan,

                            backgroundColor:
                                createGradient(
                                    ctx,
                                    "rgba(46,219,255,.12)",
                                    "rgba(46,219,255,0)"
                                ),

                            borderWidth: 3,

                            tension: 0.38,

                            pointRadius: 4,

                            pointHoverRadius: 7,

                            pointBackgroundColor:
                                "#071321",

                            pointBorderColor:
                                COLORS.cyan,

                            pointBorderWidth: 2,

                            fill: true
                        },

                        {

                            label:
                                "Observed",

                            data: [
                                66,
                                72,
                                79,
                                88,
                                74,
                                70
                            ],

                            borderColor:
                                COLORS.red,

                            backgroundColor:
                                "transparent",

                            borderWidth: 2,

                            borderDash:
                                [7, 6],

                            tension: 0.38,

                            pointRadius: 4,

                            pointHoverRadius: 7,

                            pointBackgroundColor:
                                "#071321",

                            pointBorderColor:
                                COLORS.red,

                            pointBorderWidth: 2
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        mode: "index",

                        intersect: false
                    },

                    plugins: {

                        legend: {

                            position:
                                "top",

                            align:
                                "end",

                            labels: {

                                color:
                                    "#8ea3b8",

                                padding: 18,

                                boxWidth: 12,

                                boxHeight: 7,

                                usePointStyle:
                                    true,

                                font: {

                                    family:
                                        "Inter",

                                    size: 11,

                                    weight: "600"
                                }
                            }
                        },

                        tooltip:
                            tooltipOptions()
                    },

                    scales: {

                        ...baseScales(),

                        y: {

                            ...baseScales().y,

                            min: 20,

                            max: 100,

                            ticks: {

                                ...baseScales().y.ticks,

                                callback:
                                    value =>
                                        `${value}%`
                            }
                        }
                    }
                }
            });
    }


    /* =====================================================
       REGIONAL ACTIVITY
    ===================================================== */

    function createRegionalChart() {

        const canvas =
            document.getElementById(
                "regionalChart"
            );

        if (!canvas) return;

        if (typeof Chart === "undefined")
            return;

        destroyChart("regional");


        state.charts.regional =
            new Chart(canvas, {

                type: "bar",

                data: {

                    labels: [

                        "Bhubaneswar",
                        "Cuttack",
                        "Khordha",
                        "Puri",
                        "Jajpur"
                    ],

                    datasets: [

                        {

                            label:
                                "Storm Activity",

                            data: [
                                91,
                                82,
                                68,
                                57,
                                44
                            ],

                            backgroundColor: [

                                COLORS.red,
                                COLORS.orange,
                                COLORS.yellow,
                                COLORS.cyan,
                                COLORS.purple
                            ],

                            borderRadius: 8,

                            borderSkipped: false
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip:
                            tooltipOptions()
                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            border: {
                                display: false
                            },

                            ticks: {

                                color:
                                    COLORS.text,

                                font: {

                                    family:
                                        "Inter",

                                    size: 10,

                                    weight: "600"
                                }
                            }
                        },

                        y: {

                            beginAtZero: true,

                            max: 100,

                            border: {
                                display: false
                            },

                            grid: {

                                color:
                                    COLORS.grid
                            },

                            ticks: {

                                color:
                                    COLORS.text,

                                font: {

                                    family:
                                        "Inter",

                                    size: 10
                                },

                                callback:
                                    value =>
                                        `${value}%`
                            }
                        }
                    }
                }
            });
    }


    /* =====================================================
       HOURLY SIGNAL
    ===================================================== */

    function buildHourlySignal() {

        const grid =
            document.getElementById(
                "hourlyGrid"
            );

        if (!grid) return;


        const values = [

            {
                time: "NOW",
                value: 82,
                label: "HIGH RISK"
            },

            {
                time: "+2 HR",
                value: 86,
                label: "STORM GROWTH"
            },

            {
                time: "+3 HR",
                value: 91,
                label: "LIGHTNING ↑"
            },

            {
                time: "+4 HR",
                value: 94,
                label: "PEAK RISK"
            },

            {
                time: "+5 HR",
                value: 68,
                label: "WEAKENING"
            }
        ];


        grid.innerHTML =
            values.map(
                (item, index) => {

                    let color =
                        COLORS.cyan;

                    if (item.value >= 90) {

                        color =
                            COLORS.red;

                    } else if (
                        item.value >= 80
                    ) {

                        color =
                            COLORS.orange;

                    } else if (
                        item.value >= 65
                    ) {

                        color =
                            COLORS.yellow;
                    }


                    const height =
                        Math.max(
                            30,
                            item.value * 0.55
                        );


                    return `

                        <div
                            class="forecast-hour
                            ${index === 0 ? "active" : ""}"
                            style="
                                --signal-color:${color};
                                --signal-height:${height}px;
                            "
                        >

                            <span
                                class="forecast-time"
                            >
                                ${item.time}
                            </span>

                            <div
                                class="forecast-bar"
                            >
                                <i></i>
                            </div>

                            <strong>
                                ${item.value}%
                            </strong>

                            <small>
                                ${item.label}
                            </small>

                        </div>

                    `;
                }
            ).join("");
    }


    /* =====================================================
       PERIOD SWITCHING
    ===================================================== */

    function updatePeriod(period) {

        if (!PERIOD_DATA[period])
            return;


        state.period =
            period;


        document
            .querySelectorAll(
                ".period-btn"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.period ===
                        period
                );
            });


        createAccuracyChart();


        const accuracyMap = {

            "2h": "90.2%",

            "3h": "89.8%",

            "4h": "89.4%",

            "5h": "89.3%"
        };


        const accuracyValue =
            document.getElementById(
                "accuracyValue"
            );

        const accuracySummary =
            document.getElementById(
                "accuracySummary"
            );


        if (accuracyValue) {

            accuracyValue.textContent =
                accuracyMap[period];
        }


        if (accuracySummary) {

            accuracySummary.textContent =
                accuracyMap[period];
        }


        updateInsight(period);
    }


    /* =====================================================
       INSIGHT PANEL
    ===================================================== */

    function updateInsight(period) {

        const title =
            document.getElementById(
                "insightTitle"
            );

        const text =
            document.getElementById(
                "insightText"
            );


        if (!title || !text)
            return;


        const insights = {

            "2h": {

                title:
                    "Short-horizon prediction confidence is very high.",

                text:
                    "The model currently shows strong agreement between satellite texture, lightning density and storm-motion signals. The 2-hour window provides the highest operational confidence for immediate warning decisions."
            },

            "3h": {

                title:
                    "Storm structure remains stable through the 3-hour window.",

                text:
                    "AI-derived storm-cell movement and lightning trends remain consistent, supporting reliable short-to-medium range thunderstorm prediction."
            },

            "4h": {

                title:
                    "Confidence remains strong as the forecast horizon expands.",

                text:
                    "The model continues to maintain useful predictive skill at four hours, although uncertainty gradually increases as the forecast extends further from current observations."
            },

            "5h": {

                title:
                    "Five-hour forecasts provide useful early planning intelligence.",

                text:
                    "The extended horizon provides valuable advance warning for developing storm activity, while the model accounts for increasing uncertainty in storm evolution."
            }
        };


        title.textContent =
            insights[period].title;

        text.textContent =
            insights[period].text;
    }


    /* =====================================================
       REFRESH ANALYTICS
    ===================================================== */

    function refreshAnalytics() {

        if (state.refreshing)
            return;


        state.refreshing =
            true;


        const button =
            document.getElementById(
                "refreshAnalytics"
            );

        const status =
            document.getElementById(
                "engineStatus"
            );

        const updated =
            document.getElementById(
                "engineUpdated"
            );


        if (button) {

            button.classList.add(
                "is-refreshing"
            );

            button.disabled =
                true;
        }


        if (status) {

            status.textContent =
                "SYNCING";

            status.style.color =
                COLORS.cyan;
        }


        setTimeout(() => {

            createAccuracyChart();

            createRiskChart();

            createValidationChart();

            createRegionalChart();

            buildHourlySignal();


            if (updated) {

                updated.textContent =
                    "Updated just now";
            }


            if (status) {

                status.textContent =
                    "PROCESSING";

                status.style.color =
                    COLORS.green;
            }


            if (button) {

                button.classList.remove(
                    "is-refreshing"
                );

                button.disabled =
                    false;
            }


            state.refreshing =
                false;

        }, 700);
    }


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    function setupNewsletter() {

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


        if (
            !form ||
            !email ||
            !message
        ) return;


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                if (
                    !email.value.trim()
                ) return;


                message.textContent =
                    "Thanks — you're on the intelligence list.";


                message.style.color =
                    COLORS.green;


                email.value =
                    "";
            }
        );
    }


    /* =====================================================
       FOOTER YEAR
    ===================================================== */

    function setFooterYear() {

        const year =
            document.getElementById(
                "year"
            );


        if (year) {

            year.textContent =
                new Date()
                    .getFullYear();
        }
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init() {

        if (
            typeof Chart !==
            "undefined"
        ) {

            Chart.defaults.font.family =
                "Inter, sans-serif";

            Chart.defaults.color =
                "#71839a";

            Chart.defaults.borderColor =
                "rgba(120,160,190,.10)";
        }


        updateClock();

        setInterval(
            updateClock,
            1000
        );


        createAccuracyChart();

        createRiskChart();

        createValidationChart();

        createRegionalChart();

        buildHourlySignal();


        document
            .querySelectorAll(
                ".period-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        updatePeriod(
                            button.dataset.period
                        );
                    }
                );
            });


        const refreshButton =
            document.getElementById(
                "refreshAnalytics"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refreshAnalytics
            );
        }


        setupNewsletter();

        setFooterYear();

        updateInsight("2h");


        console.log(
            "MEGHDHRISTI Analytics initialized successfully."
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();