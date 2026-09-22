/* =========================================================
   MEGHDHRISTI — ANALYTICS ENGINE
   2–5 HOUR AI NOWCASTING
========================================================= */
const API_BASE_URL = "http://127.0.0.1:8000";

/* =====================================================
   BACKEND ANALYTICS API
===================================================== */

async function fetchAnalytics() {

    const status =
        document.getElementById("engineStatus");

    const updated =
        document.getElementById("engineUpdated");

    try {

        if (status) {
            status.textContent = "CONNECTING";
            status.style.color = COLORS.cyan;
        }

        const response = await fetch(
            `${API_BASE_URL}/analytics`
        );

        if (!response.ok) {
            throw new Error(
                `Analytics API returned ${response.status}`
            );
        }

        const data = await response.json();

        if (data.status !== "success") {
            throw new Error(
                "Backend returned unsuccessful status"
            );
        }

        state.analyticsData = data;

        updateAnalyticsUI(data);

        if (status) {
            status.textContent = "LIVE";
            status.style.color = COLORS.green;
        }

        if (updated) {
            updated.textContent = "Updated just now";
        }

        console.log(
            "MEGHDRISHTI Analytics API:",
            data
        );

    } catch (error) {

        console.error(
            "Analytics backend error:",
            error
        );

        if (status) {
            status.textContent = "BACKEND OFFLINE";
            status.style.color = COLORS.red;
        }

        if (updated) {
            updated.textContent =
                "Unable to update analytics";
        }
    }
}


function updateRiskDisplay(current, t5, t10) {

    const eventTotal = document.getElementById("eventTotal");

    if (eventTotal) {
        eventTotal.textContent = current.risk_level.toUpperCase();
    }


    const currentRisk = document.getElementById("currentRiskDisplay");

    if (currentRisk) {
        currentRisk.textContent = current.risk_level.toUpperCase();
    }


    const t5Risk = document.getElementById("t5RiskDisplay");

    if (t5Risk && t5) {
        t5Risk.textContent = t5.risk_level.toUpperCase();
    }


    const t10Risk = document.getElementById("t10RiskDisplay");

    if (t10Risk && t10) {
        t10Risk.textContent = t10.risk_level.toUpperCase();
    }

}



function updateRealInsight(
    data,
    current,
    t5,
    t10
) {

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

    const trend =
        data.trend.vil;

    if (trend === "increasing") {

        title.textContent =
            "VIL intensity is increasing in the short forecast.";

        text.textContent =
            `Maximum VIL changes from ${t5.max_vil.toFixed(3)} at T+5 to ${t10.max_vil.toFixed(3)} at T+10.`;

    } else if (
        trend === "decreasing"
    ) {

        title.textContent =
            "VIL intensity is decreasing in the short forecast.";

        text.textContent =
            `Maximum VIL changes from ${t5.max_vil.toFixed(3)} at T+5 to ${t10.max_vil.toFixed(3)} at T+10.`;

    } else {

        title.textContent =
            "VIL intensity remains relatively stable.";

        text.textContent =
            `The T+5 and T+10 maximum VIL values remain close, indicating limited change over the short forecast interval.`;
    }
}
/* =====================================================
   UPDATE ANALYTICS UI FROM BACKEND
===================================================== */

function updateAnalyticsUI(data) {

    const current = data.current;

    const t5 = data.forecast.find(
        item => item.minutes_ahead === 5
    );

    const t10 = data.forecast.find(
        item => item.minutes_ahead === 10
    );

    /* ---------------------------------------------
       CURRENT MAX VIL
    --------------------------------------------- */

    const currentVil =
        document.getElementById("currentVilValue");

    if (currentVil) {
        currentVil.textContent =
            current.max_vil.toFixed(3);
    }


    /* ---------------------------------------------
       T+5 MAX VIL
    --------------------------------------------- */

    const t5Vil =
        document.getElementById("t5VilValue");

    if (t5Vil && t5) {
        t5Vil.textContent =
            t5.max_vil.toFixed(3);
    }


    /* ---------------------------------------------
       T+10 MAX VIL
    --------------------------------------------- */

    const t10Vil =
        document.getElementById("t10VilValue");

    if (t10Vil && t10) {
        t10Vil.textContent =
            t10.max_vil.toFixed(3);
    }


    /* ---------------------------------------------
       VIL TREND
    --------------------------------------------- */

    const trend =
        document.getElementById("vilTrendValue");

    if (trend) {

        const trendText =
            data.trend.vil;

        if (trendText === "increasing") {

            trend.textContent =
                "↑ INCREASING";

        } else if (
            trendText === "decreasing"
        ) {

            trend.textContent =
                "↓ DECREASING";

        } else {

            trend.textContent =
                "→ STABLE";
        }
    }


    /* ---------------------------------------------
       STORM COVERAGE
    --------------------------------------------- */

    const currentCoverage =
        document.getElementById(
            "currentCoverageValue"
        );

    const t5Coverage =
        document.getElementById(
            "t5CoverageValue"
        );

    const t10Coverage =
        document.getElementById(
            "t10CoverageValue"
        );

    if (currentCoverage) {

        currentCoverage.textContent =
            `${current.storm_coverage_percent.toFixed(1)}%`;
    }

    if (t5Coverage && t5) {

        t5Coverage.textContent =
            `${t5.storm_coverage_percent.toFixed(1)}%`;
    }

    if (t10Coverage && t10) {

        t10Coverage.textContent =
            `${t10.storm_coverage_percent.toFixed(1)}%`;
    }


    /* ---------------------------------------------
       CURRENT RISK
    --------------------------------------------- */

    const risk =
        document.getElementById(
            "currentRiskValue"
        );

    if (risk) {

        risk.textContent =
            current.risk_level.toUpperCase();
    }


    /* ---------------------------------------------
       MODEL METRICS
    --------------------------------------------- */

    const mae =
        document.getElementById(
            "maeValue"
        );

    const rmse =
        document.getElementById(
            "rmseValue"
        );

    const pod =
        document.getElementById(
            "podValue"
        );

    const far =
        document.getElementById(
            "farValue"
        );

    const csi =
        document.getElementById(
            "csiValue"
        );

    if (mae) {
        mae.textContent =
            data.model_metrics.test_mae.toFixed(4);
    }

    if (rmse) {
        rmse.textContent =
            data.model_metrics.test_rmse.toFixed(4);
    }

    if (pod) {
        pod.textContent =
            `${data.model_metrics.pod_percent}%`;
    }

    if (far) {
        far.textContent =
            `${data.model_metrics.far_percent}%`;
    }

    if (csi) {
        csi.textContent =
            `${data.model_metrics.csi_percent}%`;
    }

    const validationRmse =
    document.getElementById(
        "validationRmse"
    );

if (validationRmse) {
    validationRmse.textContent =
        data.model_metrics.test_rmse.toFixed(4);
}


    /* ---------------------------------------------
       UPDATE REAL VIL CHART
    --------------------------------------------- */

    updateVilForecastChart(
        current,
        t5,
        t10
    );

    createValidationChart(
    current,
    t5,
    t10
);


createRegionalChart(
    current,
    t5,
    t10
);

buildHourlySignal(
    current,
    t5,
    t10
);
    /* ---------------------------------------------
       UPDATE RISK DISPLAY
    --------------------------------------------- */

    updateRiskDisplay(
        current,
        t5,
        t10
    );

    createRiskChart(
    current,
    t5,
    t10
);


    /* ---------------------------------------------
       UPDATE AI INSIGHT
    --------------------------------------------- */

    updateRealInsight(
        data,
        current,
        t5,
        t10
    );

}


/* =====================================================
   REAL VIL FORECAST CHART
===================================================== */

function updateVilForecastChart(
    current,
    t5,
    t10
) {

    const canvas =
        document.getElementById(
            "accuracyChart"
        );

    if (!canvas) return;

    if (typeof Chart === "undefined") return;

    destroyChart("accuracy");

    const ctx =
        canvas.getContext("2d");

    const labels = [
        "CURRENT",
        "T+5 MIN",
        "T+10 MIN"
    ];

    const values = [
        current.max_vil,
        t5 ? t5.max_vil : null,
        t10 ? t10.max_vil : null
    ];

    state.charts.accuracy =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Maximum VIL",

                        data: values,

                        borderColor:
                            COLORS.cyan,

                        backgroundColor:
                            createGradient(
                                ctx,
                                "rgba(46,219,255,.25)",
                                "rgba(46,219,255,0)"
                            ),

                        borderWidth: 3,

                        pointRadius: 5,

                        pointHoverRadius: 8,

                        pointBackgroundColor:
                            "#071321",

                        pointBorderColor:
                            COLORS.cyan,

                        pointBorderWidth: 2,

                        tension: 0.35,

                        fill: true
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false
                },

                plugins: {

                    legend: {
                        display: true,

                        position: "top",

                        align: "end",

                        labels: {

                            color: "#8ea3b8",

                            usePointStyle: true,

                            padding: 18,

                            font: {
                                family: "Inter",
                                size: 11,
                                weight: "600"
                            }
                        }
                    },

                    tooltip: tooltipOptions()
                },

                scales: {

                    ...baseScales(),

                    y: {

                        ...baseScales().y,

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "VIL",

                            color: COLORS.text,

                            font: {
                                family: "Inter",
                                size: 10,
                                weight: "600"
                            }
                        }
                    }
                }
            }
        });
}



    const state = {
        period: "current",
        charts: {},
        refreshing: false,
        analyticsData: null
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

  

    /* =====================================================
       RISK DISTRIBUTION
    ===================================================== */

    function createRiskChart(current, t5, t10) {

    const canvas = document.getElementById("riskChart");

    if (!canvas || typeof Chart === "undefined") return;

    destroyChart("risk");

    const ctx = canvas.getContext("2d");

    const riskToValue = (risk) => {
        if (!risk) return 0;

        switch (risk.toLowerCase()) {
            case "low":
                return 1;
            case "moderate":
                return 2;
            case "high":
                return 3;
            case "extreme":
                return 4;
            default:
                return 0;
        }
    };

    const values = [
        riskToValue(current?.risk_level),
        riskToValue(t5?.risk_level),
        riskToValue(t10?.risk_level)
    ];

    state.charts.risk = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [
                "CURRENT",
                "T+5 MIN",
                "T+10 MIN"
            ],

            datasets: [{
                data: values,

                backgroundColor: [
                    COLORS.cyan,
                    COLORS.purple,
                    COLORS.green
                ],

                borderColor: "#071321",

                borderWidth: 3,

                hoverOffset: 8
            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "68%",

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            const riskLevels = [
                                current?.risk_level || "--",
                                t5?.risk_level || "--",
                                t10?.risk_level || "--"
                            ];

                            return ` ${riskLevels[context.dataIndex].toUpperCase()}`;

                        }

                    }

                }

            }

        }

    });

}

    /* =====================================================
       PREDICTED VS OBSERVED
    ===================================================== */

    function createValidationChart(current, t5, t10) {

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


    const labels = [
        "CURRENT",
        "T+5 MIN",
        "T+10 MIN"
    ];


    const values = [
        current ? current.max_vil : null,
        t5 ? t5.max_vil : null,
        t10 ? t10.max_vil : null
    ];


    state.charts.validation =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Maximum VIL",

                        data: values,

                        backgroundColor: [
                            COLORS.cyan,
                            COLORS.purple,
                            COLORS.green
                        ],

                        borderRadius: 8,

                        borderSkipped: false
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: true,

                        position: "top",

                        align: "end",

                        labels: {

                            color: "#8ea3b8",

                            usePointStyle: true,

                            padding: 18,

                            font: {

                                family: "Inter",

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

                        beginAtZero: true,

                        title: {

                            display: true,

                            text: "Maximum VIL",

                            color: COLORS.text,

                            font: {

                                family: "Inter",

                                size: 10,

                                weight: "600"
                            }
                        }
                    }
                }
            }
        });
}


    /* =====================================================
       REGIONAL ACTIVITY
    ===================================================== */

    function createRegionalChart(current, t5, t10) {

    const canvas =
        document.getElementById(
            "regionalChart"
        );

    if (!canvas) return;

    if (typeof Chart === "undefined")
        return;

    destroyChart("regional");

    const ctx =
        canvas.getContext("2d");


    const labels = [
        "CURRENT",
        "T+5 MIN",
        "T+10 MIN"
    ];


    const values = [
        current ? current.storm_coverage_percent : null,
        t5 ? t5.storm_coverage_percent : null,
        t10 ? t10.storm_coverage_percent : null
    ];


    state.charts.regional =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label:
                            "Storm Coverage",

                        data:
                            values,

                        backgroundColor: [
                            COLORS.cyan,
                            COLORS.purple,
                            COLORS.green
                        ],

                        borderRadius: 8,

                        borderSkipped: false
                    }

                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip:
                        tooltipOptions()
                },

                scales: {

                    ...baseScales(),

                    y: {

                        ...baseScales().y,

                        beginAtZero: true,

                        title: {

                            display: true,

                            text:
                                "Storm Coverage (%)",

                            color:
                                COLORS.text,

                            font: {

                                family:
                                    "Inter",

                                size: 10,

                                weight: "600"
                            }
                        },

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
       HOURLY SIGNAL
    ===================================================== */

    function buildHourlySignal(current, t5, t10) {

    const grid =
        document.getElementById(
            "hourlyGrid"
        );

    if (!grid) return;


    const values = [

        {
            time: "CURRENT",
            vil: current?.max_vil ?? null,
            coverage: current?.storm_coverage_percent ?? null,
            risk: current?.risk_level ?? "--"
        },

        {
            time: "T+5 MIN",
            vil: t5?.max_vil ?? null,
            coverage: t5?.storm_coverage_percent ?? null,
            risk: t5?.risk_level ?? "--"
        },

        {
            time: "T+10 MIN",
            vil: t10?.max_vil ?? null,
            coverage: t10?.storm_coverage_percent ?? null,
            risk: t10?.risk_level ?? "--"
        }

    ];


    grid.innerHTML =
        values.map(
            (item, index) => {

                const vil =
                    item.vil !== null
                        ? item.vil.toFixed(3)
                        : "--";

                const coverage =
                    item.coverage !== null
                        ? `${item.coverage.toFixed(1)}%`
                        : "--";


                return `

                    <div
                        class="forecast-hour
                        ${index === 0 ? "active" : ""}"
                    >

                        <span class="forecast-time">
                            ${item.time}
                        </span>

                        <div class="forecast-bar">
                            <i
                                style="
                                    height:${Math.max(
                                        10,
                                        Math.min(
                                            100,
                                            (item.vil || 0) * 25
                                        )
                                    )}%;
                                "
                            ></i>
                        </div>

                        <strong>
                            VIL ${vil}
                        </strong>

                        <small>
                            Coverage ${coverage}
                            · ${item.risk.toUpperCase()}
                        </small>

                    </div>

                `;
            }
        ).join("");
}

    /* =====================================================
       PERIOD SWITCHING
    ===================================================== */

    


    /* =====================================================
       INSIGHT PANEL
    ===================================================== */

   


    /* =====================================================
       REFRESH ANALYTICS
    ===================================================== */

    function refreshAnalytics() {

    if (state.refreshing)
        return;

    state.refreshing = true;

    const button =
        document.getElementById(
            "refreshAnalytics"
        );

    const status =
        document.getElementById(
            "engineStatus"
        );

    if (button) {

        button.classList.add(
            "is-refreshing"
        );

        button.disabled = true;
    }

    if (status) {

        status.textContent =
            "SYNCING";

        status.style.color =
            COLORS.cyan;
    }

    fetchAnalytics()
        .finally(() => {

            if (button) {

                button.classList.remove(
                    "is-refreshing"
                );

                button.disabled =
                    false;
            }

            state.refreshing = false;
        });
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

        fetchAnalytics();

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

