import { env } from "../../compile-args";

export class ObjectCache<T> {

    private id: string;
    private obj: { [key: string]: T } = {};
    private static idset: Set<string> = new Set();
    private loaded = this._init();
    private interval: number;

    constructor(id: string, interval: number = 200) {
        if (ObjectCache.idset.has(id)) {
            throw new Error(`ObjectCache with id ${id} already exists`);
        }
        ObjectCache.idset.add(id);
        this.id = id;
        this.interval = interval;
    }

    private async _init() {
        const data = (await env.storage.local.get(this.id))[this.id] || "{}";
        console.log(data);
        this.obj = JSON.parse(data);
        console.log(this.obj);
        setInterval(() => {
            let kv: { [key: string]: string } = {};
            kv[this.id] = JSON.stringify(this.obj);
            env.storage.local.set(kv);
        }, this.interval);
    }

    async printrepr() {
        await this.loaded;
        console.log(this.obj);
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

    async getKeys() {
        await this.loaded;
        return Object.keys(this.obj);
    }

}
