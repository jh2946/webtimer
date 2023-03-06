import { env } from "../../compile-args";
import { ObjectCache } from "../import/cache";
import { Sitelogger } from "../import/sitelogger";
import { functionToConnect } from "../import/request-handler";

const comp_cache = new ObjectCache<[number, number][]>("composition");
const nett_cache = new ObjectCache<[number, number][]>("nett");
const sitelogger = new Sitelogger(comp_cache, nett_cache);
env.runtime.onConnect.addListener(functionToConnect(sitelogger));
