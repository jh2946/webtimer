import * as intvl from "./interval";
import { getDomain } from "./utils";
import { client_type } from "./browser-definition";

function initCollection() {

    let collection: { [key: string]: number[][] };
    let previous: string[];
    let prevtime = 0;

    let unsaved_changes = false;

    const load_complete = (async () => {

        collection = JSON.parse((await client_type.storage.local.get({collection: "{}"})).collection);
        previous = [];
        for (const url in collection) {
            const last = collection[url][collection[url].length-1];
            if (last[1] > intvl.INF/2) {
                previous.push(url);
                prevtime = Math.max(prevtime, last[0]);
            }
            else {
                prevtime = Math.max(prevtime, last[1]);
            }
        }
        return;

    })();

    setInterval(() => {
        if (unsaved_changes) {
            client_type.storage.local.set({collection: JSON.stringify(collection)});
            unsaved_changes = false;
        }
    }, 20000);

    async function addActivity(
        urls: string[],
        time: number
    ) {
        await load_complete;

        if (time < prevtime) {
            console.warn(
                "Time went backwards, apparently...",
                `current time: ${time}`,
                `previous time: ${prevtime}`
            );
        }
        if (time <= prevtime) {
            return;
        }

        for (const url of urls) {
            if (!(url in collection)) {
                unsaved_changes = true;
                collection[url] = [];
            }
            if (!previous.includes(url)) {
                unsaved_changes = true;
                collection[url].push([time, intvl.INF]);
            }
        }
        for (const url of previous) if (!urls.includes(url)) {
            collection[url][collection[url].length-1][1] = time;
            unsaved_changes = true;
        }
        previous = urls;
        prevtime = time;
    }

    async function query(
        queries: number[][],
        urls: string[] = []
    ) {
        await load_complete;

        let totals: { [key: string]: number[] } = {};

        if (urls.length === 0) {
            urls = Object.keys(collection);
        }
        for (const url of urls) {
            totals[url] = Array(queries.length).fill(0);
        }
        for (const q_idx in queries)
        for (const url of urls)
        if (url in collection) {
            let table = collection[url];
            const query = queries[q_idx];
            const lower = intvl.first(table, query);
            const upper = intvl.last(table, query);
            for (let idx=lower; idx<=upper; idx++) {
                totals[url][q_idx] += intvl.overlap(table[idx], query);
            }
        }
        for (const url of urls) {
            if (totals[url].every(duration => duration === 0)) {
                delete totals[url];
            }
        }

        return totals;
    }
    
    const events = [
        client_type.tabs.onUpdated,
        client_type.tabs.onActivated,
        client_type.windows.onRemoved,
        client_type.runtime.onInstalled
    ];
    
    async function update() {
        const tabs = await client_type.tabs.query({active: true});
        const urls = tabs.map(tab => getDomain(tab.url!));
        addActivity(urls, Date.now());
    }
    
    for (const event of events) {
        event.addListener(update);
    }

    return {
        query: query
    };

}

export const collect = initCollection();