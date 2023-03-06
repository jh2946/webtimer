import { duration, getDomain } from "../import/utils";
const dfns = require("date-fns");
import { env } from "../../compile-args";

const sitetime = <HTMLElement>document.getElementById("sitetime");
const netttime = <HTMLElement>document.getElementById("netttime");
const taburl = <HTMLElement>document.getElementById("taburl");
const message = <HTMLElement>document.getElementById("message");

let port = env.runtime.connect();

port.onMessage.addListener((response: any) => {
    const time_a = performance.now();
    setInterval(() => {
        let time_b = performance.now();
        sitetime.innerHTML = duration(response.sitetime + time_b - time_a);
        netttime.innerHTML = duration(response.netttime + time_b - time_a);
    }, 20);
});

const now = Date.now();

(async () => {
    const tabs = await env.tabs.query({active: true, lastFocusedWindow: true});
    const current = getDomain(tabs[0].url!);
    let msg = current.slice(0, 20);
    if (current.length > 20) {
        msg += "...";
    }
    msg = `Time spent on site "${msg}" today: `;
    message.innerHTML = msg;
    port.postMessage({
        func: "simple",
        scale: "per-day",
        start: dfns.startOfDay(now),
        end: now,
        urls: [current]
    });
})();
