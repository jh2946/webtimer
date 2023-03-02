import Chart from "chart.js/auto";
const dfns = require("date-fns");
import { duration } from "./utils";
import { client_type } from "./browser-definition";

const ctx = <HTMLCanvasElement>document.getElementById("ctx");
const scale = <HTMLSelectElement>document.getElementById("scale");

interface scalemap {
    start: HTMLInputElement,
    end: HTMLInputElement;
}
const scales: { [key: string]: scalemap } = {
    "per hour": {
        start: <HTMLInputElement>document.getElementById("start-hour"),
        end: <HTMLInputElement>document.getElementById("end-hour")
    },
    "per day": {
        start: <HTMLInputElement>document.getElementById("start-day"),
        end: <HTMLInputElement>document.getElementById("end-day")
    }
}

let chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: <string[]>[],
        datasets: []
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return "";
                    },
                    label: function(context) {
                        return ` ${duration(context.parsed.y)} `;
                    },
                    afterLabel: function(context) {
                        return ` ${context.dataset.label} `;
                    }
                }
            }
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    autoSkip: false
                }
            },
            y: {
                stacked: true,
                ticks: {
                    stepSize: 1000*60,
                    callback: function(value, index, ticks) {
                        return duration(Number(value));
                    }
                }
            }
        }
    }
})

let port = client_type.runtime.connect();

interface dataset {
    label: string,
    data: number[]
}
interface chartData {
    labels: string[],
    datasets: dataset[]
}

function defaultInput() {
    const now = new Date();
    scales["per hour"].start.value = dfns.format(now, "yyyy-MM-dd'T'HH:'00'");
    scales["per hour"].end.value = dfns.format(now, "yyyy-MM-dd'T'HH:'00'");
    scales["per day"].start.value = dfns.format(now, "yyyy-MM-dd");
    scales["per day"].end.value = dfns.format(now, "yyyy-MM-dd");
}

function validInput() {
    for (const p_scale in scales) {
        if (p_scale === scale.value) {
            scales[p_scale].start.hidden = false;
            scales[p_scale].end.hidden = false;
        }
        else {
            scales[p_scale].start.hidden = true;
            scales[p_scale].end.hidden = true;
        }
    }

    const startHour = scales["per hour"].start;
    startHour.value = startHour.value.slice(0, -2) + "00";
    const endHour = scales["per hour"].end;
    endHour.value = endHour.value.slice(0, -2) + "00";

    return {
        start: new Date(scales[scale.value].start.value),
        end: new Date(scales[scale.value].end.value)
    };
}

function requestData() {

    const input = validInput();
    
    const startval = input.start;
    const tenttve_endval = input.end;
    const now = new Date();
    const endval = new Date(Math.min(
        tenttve_endval.valueOf(), now.valueOf()
    ));
    if (startval > endval) {
        return;
    }
    port.postMessage({
        func: "chart",
        scale: scale.value,
        start: startval,
        end: endval,
        now: now
    });
}

function updateChart(message: chartData) {
    chart.data = message;
    chart.update();
}

defaultInput();
port.onMessage.addListener(updateChart);
for (const p_scale in scales) {
    scales[p_scale].start.addEventListener("change", requestData);
    scales[p_scale].end.addEventListener("change", requestData);
}
scale.addEventListener("change", requestData);
requestData();