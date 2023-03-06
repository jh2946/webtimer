import { env } from "../../compile-args";
import { ObjectCache } from "./cache";
import { Sitelogger } from "./sitelogger";
import { chartReadable, buildQuery } from "./data-transform";

interface request {

    func: string,

    scale: string,
    urls: string[],
    start: number,
    end: number

}

export function functionToConnect(sitelogger: Sitelogger) {
    return (port: any) => {
        port.onMessage.addListener(async (req: request) => {
            const queries = buildQuery(req.start, req.end, req.scale);
            let response: object;
            let rawdata: { [key: string]: number[] };
            console.log(req);
            switch(req.func) {
                case "composition":
                    rawdata = await sitelogger.queryComp(queries);
                    response = chartReadable(
                        rawdata, queries, req.scale
                    );
                    console.log(rawdata, response);
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
                    console.log(response);
                    break;
                default:
                    throw new Error(`Invalid req.func: ${req.func}`);
            }
            port.postMessage(response!);
        })
    }
}
