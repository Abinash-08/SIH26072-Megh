/* =========================================================
   MEGHDHRISTI ANALYTICS CHARTS
========================================================= */

let accuracyChart;
let riskChart;
let validationChart;


/* =========================================================
   GLOBAL CHART CONFIG
========================================================= */

Chart.defaults.color = "#64788e";

Chart.defaults.font.family =
    "Inter, Arial, sans-serif";

Chart.defaults.font.size = 9;


/* =========================================================
   ACCURACY CHART
========================================================= */

function createAccuracyChart(period = "24h") {

    const canvas =
        document.getElementById(
            "accuracyChart"
        );

    if (!canvas) return;


    if (accuracyChart) {

        accuracyChart.destroy();

    }


    let labels;

    let accuracy;

    let confidence;


    if (period === "24h") {

        labels = [
            "00:00",
            "04:00",
            "08:00",
            "12:00",
            "16:00",
            "20:00",
            "Now"
        ];

        accuracy = [
            81,
            83,
            85,
            84,
            87,
            86,
            87
        ];

        confidence = [
            78,
            81,
            83,
            82,
            86,
            85,
            87
        ];

    } else if (period === "7d") {

        labels = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];

        accuracy = [
            82,
            84,
            83,
            86,
            88,
            87,
            89
        ];

        confidence = [
            79,
            82,
            81,
            84,
            87,
            86,
            88
        ];

    } else {

        labels = [
            "Week 1",
            "Week 2",
            "Week 3",
            "Week 4"
        ];

        accuracy = [
            79,
            83,
            86,
            87
        ];

        confidence = [
            77,
            81,
            84,
            87
        ];

    }


    accuracyChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Accuracy",

                            data:
                                accuracy,

                            borderColor:
                                "#2edcff",

                            backgroundColor:
                                "rgba(46,220,255,.08)",

                            fill: true,

                            tension: .42,

                            borderWidth: 2,

                            pointRadius: 3,

                            pointHoverRadius: 6,

                            pointBackgroundColor:
                                "#2edcff",

                            pointBorderColor:
                                "#071423",

                            pointBorderWidth: 2
                        },

                        {
                            label:
                                "Confidence",

                            data:
                                confidence,

                            borderColor:
                                "#8d70ff",

                            backgroundColor:
                                "transparent",

                            fill: false,

                            tension: .42,

                            borderWidth: 2,

                            borderDash: [5, 4],

                            pointRadius: 2,

                            pointHoverRadius: 5,

                            pointBackgroundColor:
                                "#8d70ff"
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: "index"

                    },

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            backgroundColor:
                                "#061322",

                            borderColor:
                                "rgba(46,220,255,.18)",

                            borderWidth: 1,

                            titleColor:
                                "#eaf5ff",

                            bodyColor:
                                "#8fa3b8",

                            padding: 11,

                            displayColors: true

                        }

                    },

                    scales: {

                        x: {

                            grid: {

                                color:
                                    "rgba(255,255,255,.035)"

                            },

                            border: {
                                display: false
                            }

                        },

                        y: {

                            min: 60,

                            max: 100,

                            ticks: {

                                callback:
                                    value =>
                                        value + "%"

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.035)"

                            },

                            border: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}



/* =========================================================
   RISK DONUT
========================================================= */

function createRiskChart() {

    const canvas =
        document.getElementById(
            "riskChart"
        );

    if (!canvas) return;


    if (riskChart) {

        riskChart.destroy();

    }


    riskChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "High",
                        "Moderate",
                        "Low"
                    ],

                    datasets: [

                        {
                            data: [
                                42,
                                35,
                                23
                            ],

                            backgroundColor: [
                                "#ff4967",
                                "#ffbd42",
                                "#25dfff"
                            ],

                            borderColor:
                                "#071321",

                            borderWidth: 5,

                            hoverOffset: 8
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "73%",

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            backgroundColor:
                                "#061322",

                            borderColor:
                                "rgba(255,255,255,.1)",

                            borderWidth: 1,

                            padding: 10

                        }

                    }

                }

            }
        );

}



/* =========================================================
   VALIDATION CHART
========================================================= */

function createValidationChart() {

    const canvas =
        document.getElementById(
            "validationChart"
        );

    if (!canvas) return;


    if (validationChart) {

        validationChart.destroy();

    }


    validationChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: [
                        "00",
                        "10",
                        "20",
                        "30",
                        "40",
                        "50",
                        "60"
                    ],

                    datasets: [

                        {
                            label:
                                "Predicted",

                            data: [
                                35,
                                43,
                                51,
                                64,
                                72,
                                78,
                                69
                            ],

                            borderColor:
                                "#8d70ff",

                            borderWidth: 2,

                            tension: .4,

                            pointRadius: 3,

                            pointBackgroundColor:
                                "#8d70ff"
                        },

                        {
                            label:
                                "Observed",

                            data: [
                                32,
                                45,
                                48,
                                61,
                                75,
                                81,
                                67
                            ],

                            borderColor:
                                "#2edcff",

                            borderWidth: 2,

                            tension: .4,

                            pointRadius: 3,

                            pointBackgroundColor:
                                "#2edcff"
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: "index"

                    },

                    plugins: {

                        legend: {
                            display: true,

                            position: "top",

                            align: "end",

                            labels: {

                                boxWidth: 7,

                                boxHeight: 7,

                                padding: 15,

                                color:
                                    "#657a91",

                                font: {
                                    size: 8
                                }
                            }
                        },

                        tooltip: {

                            backgroundColor:
                                "#061322",

                            padding: 11

                        }

                    },

                    scales: {

                        x: {

                            title: {

                                display: true,

                                text:
                                    "FORECAST MINUTES",

                                color:
                                    "#53677d",

                                font: {
                                    size: 7
                                }

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.035)"

                            },

                            border: {
                                display: false
                            }

                        },

                        y: {

                            title: {

                                display: true,

                                text:
                                    "STORM INTENSITY",

                                color:
                                    "#53677d",

                                font: {
                                    size: 7
                                }

                            },

                            min: 0,

                            max: 100,

                            grid: {

                                color:
                                    "rgba(255,255,255,.035)"

                            },

                            border: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}



/* =========================================================
   INITIALIZE
========================================================= */

function initializeAnalyticsCharts() {

    createAccuracyChart("24h");

    createRiskChart();

    createValidationChart();

}


document.addEventListener(
    "DOMContentLoaded",
    initializeAnalyticsCharts
);