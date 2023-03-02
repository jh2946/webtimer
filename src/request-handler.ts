const dfns = require("date-fns");
import { collect } from "./collection";
import { getDomain } from "./utils";
import { client_type } from "./browser-definition";

interface request {
    func: string,

    scale: string,
    start: string,
    end: string,
    now: string,

    urls: string[]
};

interface dataset {
    label: string,
    data: number[]
}

const map: { [key: string]: any } = {
    startOf: {
        "per hour": dfns.startOfHour,
        "per day": dfns.startOfDay
    },
    next: {
        "per hour": dfns.addHours,
        "per day": dfns.addDays
    },
    label: {
        minor: {
            "per hour": "HH:mm",
            "per day": "d"
        },
        major: {
            "per hour": "d MMM",
            "per day": "MMM yyyy"
        }
    },
    is_major: {
        "per hour": (date: Date) => dfns.getHours(date) === 0,
        "per day": (date: Date) => dfns.getDate(date) === 1
    },
    format: {
        "per hour": (minor: string, major: string) => 
            `${major} ${minor}`,
        "per day": (minor: string, major: string) =>
            `${minor} ${major}`
    }
}

async function queryChart(req: request) {
    const start = new Date(req.start);
    const end = new Date(req.end);
    const now = new Date(req.now);
    const startOf = map.startOf[req.scale];
    const next = (date: Date) => map.next[req.scale](date, 1);
    const minor = map.label.minor[req.scale];
    const major = map.label.major[req.scale];
    const is_major = map.is_major[req.scale];
    const major_format = map.format[req.scale];

    let queries: number[][] = [];
    let labels: string[] = [];
    let itr = startOf(start);
    const cap = startOf(end);
    for (itr; itr<=cap; itr=next(itr)) {
        queries.push([itr.valueOf(), next(itr).valueOf()]);
        let label = dfns.format(itr, minor);
        if (itr <= start || is_major(itr)) {
            label = major_format(label, dfns.format(itr, major));
        }
        labels.push(label);
    }
    let lastquery = queries[queries.length-1];
    lastquery[1] = Math.min(
        now.valueOf(),
        lastquery[1]
    );

    const totals = await collect.query(queries);
    let datasets: dataset[] = [];
    for (const url in totals) {
        datasets.push({
            label: url,
            data: totals[url]
        });
    }

    return {
        labels: labels,
        datasets: datasets
    }
}

async function querySimple(req: request) {
    const url = getDomain(req.urls[0]);
    const totals = await collect.query([[
        Number(new Date(req.start)),
        Number(new Date(req.end))
    ]], [url]);
    return totals[url][0];
}

const func_map: { [key: string]: Function } = {
    chart: queryChart,
    simple: querySimple
}

export function connected(port: any) {
    port.onMessage.addListener(async (req: request) => {
        port.postMessage(
            await (func_map[req.func])(req)
        );
    })
}

client_type.runtime.onConnect.addListener(connected);