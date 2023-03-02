import { duration } from "./utils";
const dfns = require("date-fns");
import { client_type } from "./browser-definition";

const time = <HTMLElement>document.getElementById("time");

let port = client_type.runtime.connect();

port.onMessage.addListener((message: number) => {
    const time_a = performance.now();
    setInterval(() => {
        let time_b = performance.now();
        time.innerHTML = duration(message + time_b - time_a);
    }, 20);
});

const now = Date.now();

(async () => {
    const tabs = await client_type.tabs.query({active: true, lastFocusedWindow: true});
    port.postMessage({
        func: "simple",
        start: dfns.startOfDay(now),
        end: now,
        urls: [tabs[0].url]
    });
})();