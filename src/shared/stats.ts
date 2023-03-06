import Chart from "chart.js/auto";
import { env } from "../../compile-args";
const dfns = require("date-fns");
import { duration, calcStepSize, chartData } from "../import/utils"

const ctx = <HTMLCanvasElement>document.getElementById("ctx");
const view = <HTMLSelectElement>document.getElementById("view");
const scale = <HTMLSelectElement>document.getElementById("scale");
const mode = <HTMLSelectElement>document.getElementById("mode");

const starthour = <HTMLInputElement>document.getElementById("start-hour");
const endhour = <HTMLInputElement>document.getElementById("end-hour");
const startday = <HTMLInputElement>document.getElementById("start-day");
const endday = <HTMLInputElement>document.getElementById("end-day");

const hour: [HTMLInputElement, HTMLInputElement] = [starthour, endhour];
const day: [HTMLInputElement, HTMLInputElement] = [startday, endday];

const scales: { [key: string]: [HTMLInputElement, HTMLInputElement] } = {
    "per-hour": hour,
    "per-day": day
}

function adjustView() {

    for (const row of document.getElementsByClassName("custom-options")) {
        const element = <HTMLElement>row;
        element.hidden = view.value !== "Custom";
    }

    const now = new Date();
    let starthourdate: Date;
    let endhourdate: Date;
    let startdaydate: Date;
    let enddaydate: Date;

    switch(view.value) {

        case "Today":
            scale.value = "per-hour";
            starthourdate = dfns.startOfDay(now);
            endhourdate = dfns.startOfHour(dfns.endOfDay(now));
            break;
        case "Yesterday":
            scale.value = "per-hour";
            starthourdate = dfns.addDays(dfns.startOfDay(now), -1);
            endhourdate = dfns.startOfHour(dfns.endOfDay(starthourdate));
            break;
        case "Last 24 hours":
            scale.value = "per-hour";
            endhourdate = dfns.startOfHour(now);
            starthourdate = dfns.addHours(endhourdate, -24);
            break;
        case "This week":
            scale.value = "per-day";
            startdaydate = dfns.startOfWeek(now, { weekStartsOn: 1 });
            enddaydate = dfns.startOfDay(dfns.endOfWeek(now, { weekStartsOn: 1 }));
            break;
        case "Last week":
            scale.value = "per-day";
            startdaydate = dfns.addWeeks(dfns.startOfWeek(now, { weekStartsOn: 1 }), -1);
            enddaydate = dfns.startOfDay(dfns.endOfWeek(startdaydate, { weekStartsOn: 1 }));
            break;
        case "Last 7 days":
            scale.value = "per-day";
            enddaydate = dfns.startOfDay(now);
            startdaydate = dfns.addDays(enddaydate, -7);
            break;
        case "Custom":
            break;
        default:
            throw new Error(`Invalid view.value: ${view.value}`);

    }
    
    if (starthourdate!) {
        starthour.value = dfns.format(starthourdate!, "yyyy-MM-dd'T'HH:'00'");
    }
    if (endhourdate!) {
        endhour.value = dfns.format(endhourdate!, "yyyy-MM-dd'T'HH:'00'");
    }
    if (startdaydate!) {
        startday.value = dfns.format(startdaydate!, "yyyy-MM-dd");
    }
    if (enddaydate!) {
        endday.value = dfns.format(enddaydate!, "yyyy-MM-dd");
    }

}

function defaultInput() {
    const now = new Date();
    const todaystart = dfns.startOfDay(now);
    const sevenDaysAgo = dfns.addDays(todaystart, -7);
    startday.value = dfns.format(sevenDaysAgo, "yyyy-MM-dd");
    endday.value = dfns.format(todaystart, "yyyy-MM-dd");

    adjustView();
}

function validInput() {

    adjustView();
    for (const p_scale in scales) for (const element of scales[p_scale]) {
        element.hidden = p_scale !== scale.value;
    }

    starthour.value = starthour.value.slice(0, -2) + "00";
    endhour.value = endhour.value.slice(0, -2) + "00";

    return {
        start: new Date(scales[scale.value][0].value),
        end: new Date(scales[scale.value][1].value)
    };
}

const chart = new Chart(ctx, {
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
                    beforeLabel: function(context) {
                        return ` ${context.dataset.label} `;
                    },
                    label: function(context) {
                        return ` ${duration(context.parsed.y)} `;
                    }
                }
            }
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
                ticks: {
                    autoSkip: false,
                    minRotation: 0,
                    maxRotation: 0
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
});

function requestData() {

    const input = validInput();

    const startval = input.start.valueOf();
    const endval = input.end.valueOf();
    if (startval > endval) {
        return;
    }
    
    port.postMessage({
        func: mode.value,
        scale: scale.value,
        start: startval,
        end: endval,
        urls: []
    });

}

function updateChart(response: any) {
    if (!response.labels) {
        return;
    }
    chart.data = response;
    (<any>chart.options.scales!.y!.ticks!).stepSize
        = calcStepSize(<chartData><unknown>chart.data);
    chart.update();
}

let port = env.runtime.connect();

defaultInput();
port.onMessage.addListener(updateChart);
for (const p_scale in scales) for (const element of scales[p_scale]) {
    element.addEventListener("change", requestData);
}
view.addEventListener("change", requestData);
scale.addEventListener("change", requestData);
mode.addEventListener("change", requestData);
requestData();
