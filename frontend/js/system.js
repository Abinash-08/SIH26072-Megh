/* =========================================================
   MEGHDHRISTI — SYSTEM INTELLIGENCE + PUBLIC WARNING CENTER
   Clean replacement for system.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    const formatRecipients = (value) =>
        Number(value || 0).toLocaleString("en-IN");

    const getISTTime = () => {
        return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(new Date()) + " IST";
    };

    /* =====================================================
       CLOCK + YEAR
    ===================================================== */

    const navClock = $("navClock");
    const year = $("year");
    const diagnosticTime = $("diagnosticTime");

    function updateClock() {
        if (navClock) navClock.textContent = getISTTime();
    }

    if (year) year.textContent = new Date().getFullYear();

    updateClock();
    window.setInterval(updateClock, 1000);

    if (diagnosticTime) {
        diagnosticTime.textContent = "just now";
    }

    /* =====================================================
       RESOURCE SIMULATION
    ===================================================== */

    const cpuValue = $("cpuValue");
    const gpuValue = $("gpuValue");
    const memoryValue = $("memoryValue");
    const cpuBar = $("cpuBar");
    const gpuBar = $("gpuBar");
    const memoryBar = $("memoryBar");

    let cpu = 38;
    let gpu = 61;
    let memory = 47;

    function updateResources() {
        cpu = clamp(cpu + (Math.random() - 0.5) * 8, 25, 55);
        gpu = clamp(gpu + (Math.random() - 0.5) * 6, 48, 72);
        memory = clamp(memory + (Math.random() - 0.5) * 3, 40, 56);

        const values = [
            [cpu, cpuValue, cpuBar],
            [gpu, gpuValue, gpuBar],
            [memory, memoryValue, memoryBar]
        ];

        values.forEach(([value, text, bar]) => {
            const rounded = Math.round(value);
            if (text) text.textContent = `${rounded}%`;
            if (bar) bar.style.width = `${rounded}%`;
        });
    }

    updateResources();
    window.setInterval(updateResources, 2500);

    /* =====================================================
       DATA FRESHNESS
    ===================================================== */

    const freshness = $("freshnessValue");
    let freshnessValue = 18;

    function updateFreshness() {
        freshnessValue = clamp(
            freshnessValue + Math.floor(Math.random() * 5) - 2,
            12,
            28
        );

        if (freshness) freshness.textContent = freshnessValue;
    }

    updateFreshness();
    window.setInterval(updateFreshness, 3000);

    /* =====================================================
       EVENT LOG
    ===================================================== */

    const refreshButton = $("refreshEvents");
    const eventLog = $("systemEventLog");

    const liveEvents = [
        {
            type: "green",
            title: "Radar ingestion synchronized",
            description: "Latest Doppler observation batch processed successfully"
        },
        {
            type: "cyan",
            title: "Nowcast inference completed",
            description: "Storm trajectory updated with current atmospheric inputs"
        },
        {
            type: "purple",
            title: "Model heartbeat acknowledged",
            description: "Production inference node responding normally"
        },
        {
            type: "green",
            title: "Lightning feed synchronized",
            description: "Electrical activity stream processed successfully"
        },
        {
            type: "yellow",
            title: "Prediction cache refreshed",
            description: "Short-term forecast cache updated"
        }
    ];

    function refreshEvents() {
        if (!eventLog) return;

        const event =
            liveEvents[Math.floor(Math.random() * liveEvents.length)];

        const item = document.createElement("div");
        item.className = "system-event";

        item.innerHTML = `
            <span class="event-indicator ${event.type}"></span>
            <div>
                <strong>${event.title}</strong>
                <span>${event.description}</span>
            </div>
            <time>now</time>
        `;

        eventLog.prepend(item);

        const events = eventLog.querySelectorAll(".system-event");
        if (events.length > 6) {
            events[events.length - 1].remove();
        }

        if (refreshButton) {
            refreshButton.textContent = "✓ Updated";
            window.setTimeout(() => {
                refreshButton.textContent = "↻ Refresh";
            }, 1200);
        }
    }

    if (refreshButton) {
        refreshButton.addEventListener("click", refreshEvents);
    }

    /* =====================================================
       PIPELINE NODE INTERACTION
    ===================================================== */

    const pipelineNodes = document.querySelectorAll(".pipeline-node");

    pipelineNodes.forEach((node) => {
        node.addEventListener("click", () => {
            pipelineNodes.forEach((n) => n.classList.remove("selected"));
            node.classList.add("selected");
        });
    });

    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const newsletter = $("newsletterForm");
    const newsletterMessage = $("newsletterMessage");

    if (newsletter) {
        newsletter.addEventListener("submit", (event) => {
            event.preventDefault();

            if (newsletterMessage) {
                newsletterMessage.textContent = "You're on the list.";
                newsletterMessage.style.color = "#21e695";
            }

            newsletter.reset();
        });
    }

    /* =====================================================
       PUBLIC WARNING SYSTEM
    ===================================================== */

    const smsTextarea = $("smsTextarea");
    const sendSms = $("sendSms");
    const generateSms = $("generateSms");
    const previewMassSms = $("previewMassSms");
    const smsSendStatus = $("smsSendStatus");

    const summaryZone = $("summaryZone");
    const summaryRecipients = $("summaryRecipients");
    const summaryLanguage = $("summaryLanguage");

    const headerCounter = document.querySelector(
        ".sms-counter span"
    );

    const editorCounter = $("smsCharacterCount");

    const previewMessage = $("smsMessage");
    const previewRecipients = $("previewRecipients");
    const previewRisk = $("previewRisk");
    const previewLanguage = $("previewLanguage");
    const previewEta = $("previewEta");
    const previewLocation = $("previewLocation");
    const previewMessageTime = $("previewMessageTime");
    const previewTime = $("previewTime");
    const rightDispatchButton = $("rightDispatchButton");

    const previewAlertTitle = document.querySelector(
        ".sms-bubble-header strong"
    );

    const previewAlertIcon = document.querySelector(
        ".alert-symbol"
    );

    const previewLanguageLabel = document.querySelector(
        ".sms-bubble-header small"
    );

    /* -----------------------------------------------------
       STATE
    ----------------------------------------------------- */

    const zoneRecipients = {
        "Bhubaneswar Metro": 24860,
        "Cuttack Corridor": 18420,
        "Khordha Region": 31760,
        "Puri Coastal Zone": 14280,
        "Odisha — All High Risk Zones": 184620
    };

    const state = {
        zone: "Bhubaneswar Metro",
        language: "english",
        eta: "15 minutes",
        severity: "WARNING",
        template: "thunderstorm"
    };

    /* =====================================================
       BUILD MISSING CONFIGURATION CONTROLS

       The original HTML had JavaScript references to
       smsZone/language/ETA/severity controls that did not
       actually exist in the page. We create them here so the
       existing composer becomes fully functional.
    ===================================================== */

    const composer = document.querySelector(".sms-preview-area");
    const templateLibrary = document.querySelector(".message-library");

    if (composer && templateLibrary && !$("smsControlBar")) {
        const controls = document.createElement("div");
        controls.id = "smsControlBar";
        controls.className = "sms-control-bar";

        controls.innerHTML = `
            <div class="sms-control">
                <label for="smsZone">TARGET ZONE</label>
                <select id="smsZone">
                    <option value="Bhubaneswar Metro">Bhubaneswar Metro</option>
                    <option value="Cuttack Corridor">Cuttack Corridor</option>
                    <option value="Khordha Region">Khordha Region</option>
                    <option value="Puri Coastal Zone">Puri Coastal Zone</option>
                    <option value="Odisha — All High Risk Zones">Odisha — All High Risk Zones</option>
                </select>
            </div>

            <div class="sms-control">
                <label>WARNING ETA</label>
                <div class="sms-choice-row eta-selector">
                    <button type="button" class="eta-option active" data-eta="15 minutes">15 min</button>
                    <button type="button" class="eta-option" data-eta="30 minutes">30 min</button>
                    <button type="button" class="eta-option" data-eta="45 minutes">45 min</button>
                </div>
            </div>

            <div class="sms-control">
                <label>SEVERITY</label>
                <div class="sms-choice-row severity-selector">
                    <button type="button" class="severity-option" data-severity="WATCH">
                        <span class="severity-dot watch"></span> Watch
                    </button>
                    <button type="button" class="severity-option active" data-severity="WARNING">
                        <span class="severity-dot warning"></span> Warning
                    </button>
                    <button type="button" class="severity-option danger" data-severity="DANGER">
                        <span class="severity-dot danger"></span> Critical
                    </button>
                </div>
            </div>

            <div class="sms-control">
                <label>LANGUAGE</label>
                <div class="sms-choice-row language-selector">
                    <button type="button" class="language-option active" data-language="english">
                        <span>EN</span> English
                    </button>
                    <button type="button" class="language-option" data-language="hindi">
                        <span>हि</span> Hindi
                    </button>
                </div>
            </div>
        `;

        composer.insertBefore(controls, templateLibrary);
    }

    const smsZone = $("smsZone");

    /* =====================================================
       STATUS
    ===================================================== */

    function showMassStatus(type, message) {
        if (!smsSendStatus) return;

        smsSendStatus.className = `sms-send-status ${type || ""}`.trim();

        smsSendStatus.innerHTML =
            type === "success"
                ? `<span class="status-check">✓</span>${message}`
                : type === "error"
                    ? `<span class="status-check error-mark">!</span>${message}`
                    : `<span class="status-check">✓</span>${message}`;
    }

    /* =====================================================
       MESSAGE GENERATION
    ===================================================== */

    function getSeverityText() {
        if (state.severity === "DANGER") {
            return state.language === "hindi" ? "गंभीर चेतावनी" : "CRITICAL ALERT";
        }

        if (state.severity === "WATCH") {
            return state.language === "hindi" ? "मौसम निगरानी" : "WEATHER WATCH";
        }

        return state.language === "hindi" ? "चेतावनी" : "WARNING ALERT";
    }

    function generateMassMessage() {
        const zone = state.zone;
        const eta = state.eta;

        let message = "";

        if (state.language === "hindi") {
            if (state.template === "lightning") {
                message =
                    `मेघदृष्टि बिजली चेतावनी: ${zone} में अगले ${eta} में बिजली गिरने की संभावना बहुत अधिक है। कृपया घर के अंदर रहें और खुले स्थानों, पेड़ों तथा बिजली के उपकरणों से दूर रहें।`;
            } else if (state.template === "safety") {
                message =
                    `मेघदृष्टि सुरक्षा सूचना: ${zone} में खराब मौसम की संभावना है। कृपया सुरक्षित स्थान पर रहें, खुले क्षेत्रों से बचें और आधिकारिक मौसम निर्देशों का पालन करें।`;
            } else {
                message =
                    `मेघदृष्टि ${getSeverityText()}: ${zone} में अगले ${eta} में आंधी-तूफान और बिजली गिरने की संभावना है। घर के अंदर रहें और पेड़ों, खुले स्थानों तथा बिजली के उपकरणों से दूर रहें।`;
            }
        } else {
            if (state.template === "lightning") {
                message =
                    `MEGHDHRISTI LIGHTNING ALERT: High probability of lightning activity in ${zone} within ${eta}. Stay indoors and avoid open areas, trees and electrical equipment. Follow official advisories.`;
            } else if (state.template === "safety") {
                message =
                    `MEGHDHRISTI SAFETY ADVISORY: Severe weather may affect ${zone}. Please move to a safe indoor location, avoid open areas and follow official weather advisories.`;
            } else {
                message =
                    `MEGHDHRISTI ${getSeverityText()}: Thunderstorm with lightning is expected across ${zone} within ${eta}. Stay indoors, avoid open areas, trees and electrical equipment. Follow official advisories.`;
            }
        }

        if (smsTextarea) {
            smsTextarea.value = message.slice(0, 320);
        }

        updateSmsPreview();
        updateRightPreview();
    }

    /* =====================================================
       PREVIEW
    ===================================================== */

    function updateSmsPreview() {
        const message = smsTextarea ? smsTextarea.value : "";

        if (previewMessage) {
            previewMessage.textContent =
                message || "Emergency weather alert will appear here.";
        }

        const length = message.length;

        if (editorCounter) {
            editorCounter.textContent = length;
        }

        if (headerCounter) {
            headerCounter.textContent = length;
        }
    }

    function updatePreviewClock() {
        const time = getISTTime();

        if (previewMessageTime) previewMessageTime.textContent = time;
        if (previewTime) previewTime.textContent = time;
    }

    function updateRightPreview() {
        const recipients = zoneRecipients[state.zone] || 0;

        if (previewRecipients) {
            previewRecipients.textContent = formatRecipients(recipients);
        }

        if (previewRisk) {
            previewRisk.textContent =
                state.severity === "DANGER"
                    ? "CRITICAL"
                    : state.severity;
        }

        if (previewLanguage) {
            previewLanguage.textContent =
                state.language === "hindi" ? "HI" : "EN";
        }

        if (previewEta) {
            previewEta.textContent =
                state.eta.replace(" minutes", " MIN");
        }

        if (previewLocation) {
            previewLocation.textContent = state.zone;
        }

        if (summaryZone) {
            summaryZone.textContent = state.zone;
        }

        if (summaryRecipients) {
            summaryRecipients.textContent = formatRecipients(recipients);
        }

        if (summaryLanguage) {
            summaryLanguage.textContent =
                state.language === "hindi" ? "Hindi" : "English";
        }

        if (previewAlertTitle) {
            if (state.template === "lightning") {
                previewAlertTitle.textContent = "LIGHTNING WARNING";
            } else if (state.template === "safety") {
                previewAlertTitle.textContent = "SAFETY ADVISORY";
            } else {
                previewAlertTitle.textContent =
                    state.severity === "DANGER"
                        ? "CRITICAL WEATHER ALERT"
                        : state.severity === "WATCH"
                            ? "WEATHER WATCH"
                            : "WEATHER WARNING";
            }
        }

        if (previewAlertIcon) {
            previewAlertIcon.textContent =
                state.template === "lightning" ? "⚡" :
                state.template === "safety" ? "🛡" :
                "⛈";
        }

        if (previewLanguageLabel) {
            previewLanguageLabel.textContent =
                state.language === "hindi"
                    ? "MEGHDHRISTI · HINDI"
                    : "MEGHDHRISTI · ENGLISH";
        }

        updateSmsPreview();
        updatePreviewClock();
    }

    /* =====================================================
       CONTROL BINDINGS
    ===================================================== */

    if (smsZone) {
        smsZone.value = state.zone;

        smsZone.addEventListener("change", () => {
            state.zone = smsZone.value;
            generateMassMessage();
        });
    }

    document.querySelectorAll(".language-option").forEach((button) => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".language-option")
                .forEach((b) => b.classList.remove("active"));

            button.classList.add("active");
            state.language = button.dataset.language || "english";
            generateMassMessage();
        });
    });

    document.querySelectorAll(".eta-option").forEach((button) => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".eta-option")
                .forEach((b) => b.classList.remove("active"));

            button.classList.add("active");
            state.eta = button.dataset.eta || "15 minutes";
            generateMassMessage();
        });
    });

    document.querySelectorAll(".severity-option").forEach((button) => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".severity-option")
                .forEach((b) => b.classList.remove("active"));

            button.classList.add("active");
            state.severity = button.dataset.severity || "WARNING";
            generateMassMessage();
        });
    });

    document.querySelectorAll(".message-template").forEach((button) => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".message-template")
                .forEach((b) => b.classList.remove("active"));

            button.classList.add("active");

            state.template =
                button.dataset.template || "thunderstorm";

            const label = $("messageTypeLabel");
            if (label) {
                label.textContent =
                    state.template === "custom"
                        ? "CUSTOM"
                        : "TEMPLATE";
            }

            generateMassMessage();
        });
    });

    if (smsTextarea) {
        smsTextarea.addEventListener("input", () => {
            updateSmsPreview();
            updateRightPreview();
        });
    }

    if (generateSms) {
        generateSms.addEventListener("click", () => {
            generateMassMessage();
            showMassStatus(
                "",
                "Warning regenerated from the current live configuration."
            );
        });
    }

    if (previewMassSms) {
        previewMassSms.addEventListener("click", () => {
            updateRightPreview();

            if (smsTextarea) {
                smsTextarea.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                smsTextarea.focus();
            }

            showMassStatus(
                "",
                "Preview synchronized with the current alert configuration."
            );
        });
    }

    /* =====================================================
       DISPATCH

       Demo-safe fallback:
       - If window.MEGHDHRISTI_API_BASE exists, POST to it.
       - Otherwise simulate a successful gateway response.
    ===================================================== */

    let dispatchInProgress = false;

    async function dispatchMassAlert() {
        if (dispatchInProgress) return;

        const zone = state.zone;
        const recipients = zoneRecipients[zone] || 0;
        const message = smsTextarea ? smsTextarea.value.trim() : "";

        if (!message) {
            showMassStatus(
                "error",
                "Create or write a warning message before dispatch."
            );

            if (smsTextarea) smsTextarea.focus();
            return;
        }

        if (message.length > 320) {
            showMassStatus(
                "error",
                "Message exceeds the 320-character limit."
            );
            return;
        }

        const confirmed = window.confirm(
            `MEGHDHRISTI MASS ALERT\n\n` +
            `Target: ${zone}\n` +
            `Recipients: ${formatRecipients(recipients)}\n` +
            `Language: ${state.language === "hindi" ? "Hindi" : "English"}\n` +
            `Severity: ${state.severity}\n` +
            `ETA: ${state.eta}\n\n` +
            `Proceed with dispatch?`
        );

        if (!confirmed) return;

        dispatchInProgress = true;

        if (sendSms) {
            sendSms.disabled = true;
            sendSms.classList.add("sending");
            sendSms.textContent =
                `◌ Dispatching to ${formatRecipients(recipients)}...`;
        }

        if (rightDispatchButton) {
            rightDispatchButton.disabled = true;
            rightDispatchButton.classList.add("sending");
            rightDispatchButton.innerHTML =
                `<span>◌</span> Dispatching... <b>→</b>`;
        }

        showMassStatus(
            "",
            "Connecting to mass notification gateway..."
        );

        const payload = {
            zone,
            recipients,
            language: state.language,
            severity: state.severity,
            eta: state.eta,
            template: state.template,
            message
        };

        try {
            const apiBase =
                typeof window.MEGHDHRISTI_API_BASE === "string"
                    ? window.MEGHDHRISTI_API_BASE.replace(/\/$/, "")
                    : "";

            if (apiBase) {
                const response = await fetch(
                    `${apiBase}/api/alerts/mass`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Gateway returned HTTP ${response.status}`
                    );
                }
            } else {
                await new Promise((resolve) =>
                    window.setTimeout(resolve, 1800)
                );
            }

            showMassStatus(
                "success",
                `${formatRecipients(recipients)} recipients notified successfully.`
            );

            if (sendSms) {
                sendSms.textContent = "✓ Mass Alert Dispatched";
            }

            if (rightDispatchButton) {
                rightDispatchButton.innerHTML =
                    `<span>✓</span> Mass Alert Dispatched <b>→</b>`;
            }

            /* Add a real audit entry to the event log. */
            if (eventLog) {
                const item = document.createElement("div");
                item.className = "system-event";
                item.innerHTML = `
                    <span class="event-indicator green"></span>
                    <div>
                        <strong>Public warning dispatched</strong>
                        <span>${formatRecipients(recipients)} recipients · ${zone} · ${state.language === "hindi" ? "Hindi" : "English"}</span>
                    </div>
                    <time>now</time>
                `;
                eventLog.prepend(item);

                const events = eventLog.querySelectorAll(".system-event");
                if (events.length > 6) {
                    events[events.length - 1].remove();
                }
            }

            window.setTimeout(() => {
                if (sendSms) {
                    sendSms.textContent = "⚡ Dispatch Mass Alert";
                }

                if (rightDispatchButton) {
                    rightDispatchButton.innerHTML =
                        `<span>⚡</span> Dispatch Mass Alert <b>→</b>`;
                }
            }, 3000);
        } catch (error) {
            console.error("MEGHDHRISTI dispatch error:", error);

            showMassStatus(
                "error",
                "Dispatch failed. Check the notification gateway and try again."
            );

            if (sendSms) {
                sendSms.textContent = "⚠ Retry Dispatch";
            }

            if (rightDispatchButton) {
                rightDispatchButton.innerHTML =
                    `<span>⚠</span> Retry Dispatch <b>→</b>`;
            }
        } finally {
            dispatchInProgress = false;

            if (sendSms) {
                sendSms.disabled = false;
                sendSms.classList.remove("sending");
            }

            if (rightDispatchButton) {
                rightDispatchButton.disabled = false;
                rightDispatchButton.classList.remove("sending");
            }
        }
    }

    if (sendSms) {
        sendSms.addEventListener("click", dispatchMassAlert);
    }

    if (rightDispatchButton) {
        rightDispatchButton.addEventListener(
            "click",
            dispatchMassAlert
        );
    }

    /* =====================================================
       VISIBILITY
    ===================================================== */

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            updateClock();
            updatePreviewClock();
        }
    });

    /* =====================================================
       INITIALIZE
    ===================================================== */

    generateMassMessage();
    updateRightPreview();
    updatePreviewClock();

    console.log(
        "%cMEGHDHRISTI SYSTEM INTELLIGENCE",
        "color:#2edbff;font-size:16px;font-weight:800"
    );

    console.log(
        "System observability + public warning center initialized."
    );
});
