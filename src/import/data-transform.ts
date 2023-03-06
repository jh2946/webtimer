const dfns = require("date-fns");
import { datapoint } from "./utils";

function labelHours(intervals: [number, number][]) {
    let labels: string[] = [];
    let step = 1;
    if (intervals.length > 12) {
        step = 3;
    }
    if (intervals.length > 24) {
        step = 6;
    }
    let isfirst = true;
    for (const interval of intervals) {
        const periodstart = new Date(interval[0]);
        if (isfirst || periodstart.getHours() === 0) {
            labels.push(
                dfns.format(periodstart, "d MMM ")
                + dfns.format(periodstart, "HH:mm")
            );
            isfirst = false;
        }
        else if (periodstart.getHours() % step === 0) {
            labels.push(
                dfns.format(periodstart, "HH:mm")
            );
        }
        else {
            labels.push("");
        }
    }
    return labels;
}

function labelDays(intervals: [number, number][]) {
    let labels: string[] = [];
    let step = 1;
    if (intervals.length > 12) {
        step = 3;
    }
    if (intervals.length > 24) {
        step = 6;
    }
    let isfirst = true;
    for (const interval of intervals) {
        const periodstart = new Date(interval[0]);
        if (isfirst || periodstart.getDate() === 1) {
            labels.push(
                dfns.format(periodstart, "d ")
                + dfns.format(periodstart, "MMM")
            );
            isfirst = false;
        }
        else if ((periodstart.getDate()-1) % step === 0) {
            labels.push(
                dfns.format(periodstart, "d")
            );
        }
        else {
            labels.push("");
        }
    }
    return labels;
}

const labelmap: { [key: string]: Function } = {
    "per-hour": labelHours,
    "per-day": labelDays
}

const itrmap: { [key: string]: Function } = {
    "per-hour": (date: Date) => dfns.addHours(date, 1),
    "per-day": (date: Date) => dfns.addDays(date, 1)
}

const startmap: { [key: string]: Function } = {
    "per-hour": dfns.startOfHour,
    "per-day": dfns.startOfDay
}

export function chartReadable(
    rawdata: { [key: string]: number[] },
    intervals: [number, number][],
    scale: string
) {
    let datasets: datapoint[] = [];
    for (const key in rawdata) {
        datasets.push({
            label: key,
            data: rawdata[key]
        });
    }
    return {
        labels: labelmap[scale](intervals),
        datasets: datasets
    };
}

export function buildQuery(
    start: number,
    end: number,
    scale: string
) {
    let queries: [number, number][] = [];
    const next = itrmap[scale];
    let itr = startmap[scale](new Date(start));
    const cap = new Date(end);
    for (itr; itr <= cap; itr = next(itr)) {
        queries.push([itr.valueOf(), next(itr).valueOf()]);
    }
    return queries;
}
