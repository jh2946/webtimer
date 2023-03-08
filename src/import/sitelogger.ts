import { ObjectCache } from "./cache";
import { env } from "../../compile-args";
import { getDomain, last } from "./utils";

/*
returns the size the area of overlap
in the intersection of two time intervals,
in milliseconds
*/
function overlap(
    interval1: [number, number],
    interval2: [number, number]
) {
    return Math.max(0, 
        Math.min(
            interval1[1], interval2[1]
        )
        - Math.max(
            interval1[0], interval2[0]
        ));
}

export class Sitelogger {

    private comp_cache: ObjectCache<[number, number][]>;
    // stores when the user visited specific sites

    private nett_cache: ObjectCache<[number, number][]>;
    // stores when the user used a browser at all

    private leniency = 100;
    private resolution = 20;

    constructor(
        comp_cache: ObjectCache<[number, number][]>,
        nett_cache: ObjectCache<[number, number][]>
    ) {
        this.comp_cache = comp_cache;
        this.nett_cache = nett_cache;
        setInterval(async () => {
            const tabs = await env.tabs.query({ active: true });
            const urls = tabs.map(tab => getDomain(tab.url!));
            this._updateActivity(urls);
        }, this.resolution);
    }

    // tab info is passed in, updates usage time accordingly
    private async _updateActivity(
        urls: string[],
        time: number = Date.now()
    ) {
        for (const url of urls) {
            if (!await this.comp_cache.exists(url)) {
                this.comp_cache.assignValue(url, []);
            }
            let urlsitelog = await this.comp_cache.valueOf(url);
            let lastintvl = last(urlsitelog);
            if (lastintvl
                && (time > lastintvl[1] + this.resolution + this.leniency
                || time < lastintvl[1] + this.resolution - this.leniency) 
            || urlsitelog.length === 0) {
                urlsitelog.push([time, time]);
            }
            else {
                lastintvl[1] = Math.max(
                    lastintvl[0],
                    time
                );
            }
        }

        if (urls.length) {
            if (!await this.nett_cache.exists("nett-log")) {
                this.nett_cache.assignValue("nett-log", []);
            }
            let nettlog = await this.nett_cache.valueOf("nett-log");
            let lastintvl = last(nettlog);
            if (lastintvl
                && (time > lastintvl[1] + this.resolution + this.leniency
                || time < lastintvl[1] + this.resolution - this.leniency) 
            || nettlog.length === 0) {
                nettlog.push([time, time]);
            }
            else {
                lastintvl[1] = Math.max(
                    lastintvl[0],
                    time
                );
            }
        }

    }

    /*
    queries: an array of intervals, each interval being
    in the form of [start, end], where start, end are
    in millisecond timestamp format

    given an array of query intervals q
    and an array of urls [
        "sitename1.com",
        "sitename2.com",
        ...
    ]
    returns data in the form:
    {
        "sitename1.com": a1,
        "sitename2.com": a2,
        ...
    }
    where a1[i] represents the amount of time spent
    using "sitename1.com" in the interval q[i]
    */
    async queryComp(
        queries: [number, number][],
        urls: string[] = []
    ) {
        if (urls.length === 0) {
            urls = await this.comp_cache.getKeys();
        }
        let totals: { [key: string]: number[] } = {};
        for (const url of urls) {
            totals[url] = Array(queries.length).fill(0);
        }
        for (const url of urls) {
            let urlsitelog = await this.comp_cache.valueOf(url);
            for (const idx in queries)
            if (await this.comp_cache.exists(url)) {
                const query = queries[idx];
                for (const interval of urlsitelog) {
                    totals[url][idx] += overlap(interval, query);
                }

            }
        }
        for (const url of urls)
        if (totals[url].every(duration => duration === 0)) {
            delete totals[url];
        }
        return totals;
    }

    /*
    same as queryComp, but member "Total" of the returned
    object is an array where total[i] represents the amount
    of time spent using the browser in the interval q[i]
    */
    async queryNett(
        queries: [number, number][]
    ) {
        let total = Array(queries.length).fill(0);
        let nettlog = await this.nett_cache.valueOf("nett-log");
        for (const idx in queries) {
            const query = queries[idx];
            for (const interval of nettlog) {
                total[idx] += overlap(interval, query);
            }
        }
        return { Total: total };
    }
    
}
