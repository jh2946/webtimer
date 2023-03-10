import { env } from "../../compile-args";
/*
manages data stored in location id within local storage
as an intermediary, updating local storage to match
its internal data while also allowing other stuff to
access its internal data
*/
export class ObjectCache<T> {

    private id: string;
    private obj: { [key: string]: T } = {};
    private static idset: Set<string> = new Set();
    private loaded = this._init();
    private interval: number;

    constructor(id: string, interval: number = 20000) {
        if (ObjectCache.idset.has(id)) {
            throw new Error(`ObjectCache with id ${id} already exists`);
        }
        ObjectCache.idset.add(id);
        this.id = id;
        this.interval = interval;
    }

    private async _init() {
        const data = (await env.storage.local.get(this.id))[this.id] || "{}";
        this.obj = JSON.parse(data);
        setInterval(async () => {
            let kv: { [key: string]: string } = {};
            kv[this.id] = JSON.stringify(this.obj);
            env.storage.local.set(kv);
        }, this.interval);
    }

    async printrepr() {
        console.log(this.obj);
        await this.loaded;
    }

    async exists(key: string) {
        await this.loaded;
        return key in this.obj;
    }

    async valueOf(key: string) {
        await this.loaded;
        const value = this.obj[key];
        if (value === undefined) {
            throw new Error(`key ${key} does not exist on Cache with id ${this.id}`)
        }
        return value;
    }

    async assignValue(key: string, value: T) {
        await this.loaded;
        this.obj[key] = value;
    }

    async deleteValue(key: string) {
        await this.loaded;
        return delete this.obj[key];
    }

    async getKeys() {
        await this.loaded;
        return Object.keys(this.obj);
    }

}
