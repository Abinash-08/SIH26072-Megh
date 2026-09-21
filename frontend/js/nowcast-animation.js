/* =========================================================
   MEGHDRISHTI — AI NOWCAST ANIMATION
========================================================= */

class NowcastAnimation {

    constructor(options = {}) {

        this.imageElement =
    document.getElementById("nowcastBaseMap");

this.canvas =
    document.getElementById("nowcastCanvas");

this.canvasContext =
    this.canvas
        ? this.canvas.getContext("2d")
        : null;

        this.slider =
            document.getElementById("nowcastSlider");

        this.timeLabel =
            document.getElementById("nowcastTime");

        this.statusLabel =
            document.getElementById("nowcastStatus");

        this.playButton =
            document.getElementById("playNowcast");

        this.frameNumber =
            document.getElementById(
                "animationFrameNumber"
            );

        this.horizon =
            document.getElementById(
                "animationHorizon"
            );

        this.frameType =
            document.getElementById(
                "animationFrameType"
            );


        /*
         * These are PLACEHOLDER frames.
         *
         * We will replace these with actual
         * radar + ConvLSTM outputs later.
         */

        this.frames = options.frames || [];


        this.currentFrame = 3;

        this.playing = false;

        this.timer = null;

        this.interval =
            options.interval || 900;


        this.init();
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    init() {

        if (!this.slider) return;


        this.slider.max =
            this.frames.length - 1;


        this.slider.value =
            this.currentFrame;


        this.slider.addEventListener(
            "input",
            (event) => {

                this.stop();

                this.showFrame(
                    Number(event.target.value)
                );

            }
        );


        if (this.playButton) {

            this.playButton.addEventListener(
                "click",
                () => {

                    this.togglePlay();

                }
            );

        }


        this.showFrame(
            this.currentFrame
        );

    }

/* =====================================================
   RENDER VIL FRAME
===================================================== */

renderVILFrame(data) {

    if (
        !this.canvas ||
        !this.canvasContext ||
        !Array.isArray(data) ||
        !data.length
    ) {
        return;
    }

    const height = data.length;
    const width = data[0].length;

    /*
     * Render at higher resolution so the
     * 48 × 48 model output appears smoother.
     */
    const SCALE = 8;

    const renderWidth = width * SCALE;
    const renderHeight = height * SCALE;

    if (
        this.canvas.width !== renderWidth ||
        this.canvas.height !== renderHeight
    ) {
        this.canvas.width = renderWidth;
        this.canvas.height = renderHeight;
    }

    const ctx = this.canvasContext;

    ctx.clearRect(
        0,
        0,
        renderWidth,
        renderHeight
    );

    /*
     * Slight blur creates a continuous
     * weather-field appearance.
     */
    ctx.filter = "blur(1.5px)";

    const imageData =
        ctx.createImageData(
            width,
            height
        );

    /*
     * Display range.
     *
     * The model is producing very small
     * VIL values for this MOSDAC sequence,
     * so keep the visual scale sensitive.
     */
    const DISPLAY_MAX = 0.20;

    for (let y = 0; y < height; y++) {

        for (let x = 0; x < width; x++) {

            let value =
                Number(data[y][x]);

            if (!Number.isFinite(value)) {
                value = 0;
            }

            value =
                Math.max(0, value);

            let t =
                Math.min(
                    value / DISPLAY_MAX,
                    1
                );

            /*
             * Boost weak signals.
             */
            t = Math.sqrt(t);

            const i =
                (y * width + x) * 4;

            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;

            /*
             * Transparent background
             */
            if (t < 0.025) {

                a = 0;

            }

            /*
             * Cyan / blue
             */
            else if (t < 0.25) {

                const p =
                    (t - 0.025) /
                    (0.25 - 0.025);

                r = 0;
                g =
                    Math.round(
                        170 + 85 * p
                    );

                b = 255;

                a =
                    Math.round(
                        150 + 70 * p
                    );

            }

            /*
             * Blue → violet
             */
            else if (t < 0.50) {

                const p =
                    (t - 0.25) /
                    (0.50 - 0.25);

                r =
                    Math.round(
                        40 + 120 * p
                    );

                g =
                    Math.round(
                        190 - 120 * p
                    );

                b = 255;

                a = 220;

            }

            /*
             * Violet → magenta
             */
            else if (t < 0.75) {

                const p =
                    (t - 0.50) /
                    (0.75 - 0.50);

                r =
                    Math.round(
                        160 + 95 * p
                    );

                g =
                    Math.round(
                        70 - 45 * p
                    );

                b =
                    Math.round(
                        255 - 80 * p
                    );

                a = 235;

            }

            /*
             * Magenta → orange/red
             */
            else {

                const p =
                    (t - 0.75) /
                    (1 - 0.75);

                r = 255;

                g =
                    Math.round(
                        70 + 180 * p
                    );

                b =
                    Math.round(
                        175 - 175 * p
                    );

                a = 245;
            }

            imageData.data[i] =
                r;

            imageData.data[i + 1] =
                g;

            imageData.data[i + 2] =
                b;

            imageData.data[i + 3] =
                a;
        }
    }

    /*
     * Draw low-resolution field
     * into the enlarged canvas.
     */
    const tempCanvas =
        document.createElement("canvas");

    tempCanvas.width = width;
    tempCanvas.height = height;

    const tempCtx =
        tempCanvas.getContext("2d");

    tempCtx.putImageData(
        imageData,
        0,
        0
    );

    /*
     * Smooth interpolation.
     */
    ctx.imageSmoothingEnabled = true;

    ctx.drawImage(
        tempCanvas,
        0,
        0,
        width,
        height,
        0,
        0,
        renderWidth,
        renderHeight
    );

    /*
     * Reset filter for future drawing.
     */
    ctx.filter = "none";
}

/* =====================================================
   SHOW FRAME
===================================================== */

showFrame(index) {

    if (!this.frames.length) return;


    if (
        index < 0 ||
        index >= this.frames.length
    ) {
        return;
    }


    this.currentFrame = index;


    const frame =
        this.frames[index];


    /* =================================================
       VIL DATA
    ================================================= */

    if (frame.data) {

        this.renderVILFrame(
            frame.data
        );

    }


    /* =================================================
       IMAGE FALLBACK
    ================================================= */

    if (
        this.imageElement &&
        frame.image
    ) {

        this.imageElement.src =
            frame.image;

    }


    /* =================================================
       TIME
    ================================================= */

    if (this.timeLabel) {

        this.timeLabel.textContent =
            frame.label;

    }


    /* =================================================
       OBSERVED / FORECAST
    ================================================= */

    if (this.statusLabel) {

        this.statusLabel.textContent =
            frame.type === "forecast"
                ? "AI FORECAST"
                : "OBSERVED";

    }


    /* =================================================
       FRAME NUMBER
    ================================================= */

    if (this.frameNumber) {

        this.frameNumber.textContent =
            `${index + 1} / ${this.frames.length}`;

    }


    /* =================================================
       HORIZON
    ================================================= */

    if (this.horizon) {

        this.horizon.textContent =
            frame.label;

    }


    /* =================================================
       FRAME TYPE
    ================================================= */

    if (this.frameType) {

        this.frameType.textContent =
            frame.type === "forecast"
                ? "PREDICTED"
                : "OBSERVED";

    }


    /* =================================================
       SLIDER
    ================================================= */

    if (this.slider) {

        this.slider.value =
            index;

    }

}

    /* =====================================================
       PLAY
    ===================================================== */

    play() {

        if (
            this.playing ||
            this.frames.length <= 1
        ) {

            return;

        }


        this.playing = true;


        this.updateButton();


        this.timer =
            setInterval(
                () => {

                    let next =
                        this.currentFrame + 1;


                    /*
                     * When reaching the end,
                     * return to the beginning.
                     */

                    if (
                        next >=
                        this.frames.length
                    ) {

                        next = 0;

                    }


                    this.showFrame(next);

                },

                this.interval
            );

    }


    /* =====================================================
       STOP
    ===================================================== */

    stop() {

        this.playing = false;


        if (this.timer) {

            clearInterval(
                this.timer
            );

            this.timer = null;

        }


        this.updateButton();

    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    togglePlay() {

        if (this.playing) {

            this.stop();

        } else {

            this.play();

        }

    }


    /* =====================================================
       BUTTON
    ===================================================== */

    updateButton() {

        if (!this.playButton) return;


        this.playButton.innerHTML =
            this.playing
                ? "⏸ Pause Nowcast"
                : "▶ Play Nowcast";

    }

}