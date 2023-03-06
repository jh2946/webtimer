import { env } from "../../compile-args";
setInterval(() => chrome.runtime.sendMessage(0), 20000);