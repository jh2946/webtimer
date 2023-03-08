import { env } from "../../compile-args";
import { ObjectCache } from "./cache";
import { Sitelogger } from "./sitelogger";
import { chartReadable, buildQuery } from "./data-transform";

interface request {

    func: string,
    /*
    dictates the type of query to be made:

        "composition" from stats.js - queried data will be
        used to show how much time user spends on each
        individual site (chart format)

        "nett" from stats.js - to show how much time user
        spends on the entire browser (chart format)

        "simple" from popup.js - to show how much time user
        has spent, both on a single website and on the entire browser
        (text format)

    */

    scale: string,
    /*
    dictates how wide the query intervals should be:
        "per-hour"
        "per-day"
    */

    urls: string[],
    /*
    specifies for which urls sitelogger has to query time

    if empty, sitelogger queries all data
    */

    start: number,
    // timestamp, in milliseconds, of the first hour/day to query

    end: number
    // last hour/day

}

// returns callback
export function functionToConnect(sitelogger: Sitelogger) {
    return (port: any) => {
        port.onMessage.addListener(async (req: request) => {
            const queries = buildQuery(req.start, req.end, req.scale);
            let response: object;
            let rawdata: { [key: string]: number[] };
            switch(req.func) {
                case "composition":
                    rawdata = await sitelogger.queryComp(queries);
                    response = chartReadable(
                        rawdata, queries, req.scale
                    );
                    break;
                case "nett":
                    rawdata = await sitelogger.queryNett(queries);
                    response = chartReadable(
                        rawdata, queries, req.scale
                    );
                    break;
                case "simple":
                    const sitetimeobj = await sitelogger.queryComp(queries, req.urls);
                    const netttimeobj = await sitelogger.queryNett(queries);
                    let sitetime = 0;
                    if (sitetimeobj[req.urls[0]]) {
                        sitetime = sitetimeobj[req.urls[0]][0];
                    }
                    let netttime = 0;
                    if (netttimeobj.Total) {
                        netttime = netttimeobj.Total[0];
                    }
                    response = {
                        sitetime: sitetime,
                        netttime: netttime
                    };
                    break;
                default:
                    throw new Error(`Invalid req.func: ${req.func}`);
            }
            port.postMessage(response!);
        })
    }
}
