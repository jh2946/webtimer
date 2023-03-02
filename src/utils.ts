const psl = require("psl");

export function getDomain(url: string) {
	try {
		const domain = new URL(url).hostname;
		if (!psl.parse(domain).domain) {
			return url;
		}
		return domain;
	}
	catch (err) {
		if (err instanceof TypeError) {
			return "Other";
		}
		throw err;
	}
}

function zp(n: number) {
    if (n < 10) {
        return `0${n}`;
    }
    return `${n}`;
}

export function duration(ms: number) {
    let sec = Math.floor(ms / 1000);
    let min = Math.floor(sec / 60);
    sec -= min * 60;
    let h = Math.floor(min / 60);
    min -= h * 60;
    if (!h) {
        return `${zp(min)}:${zp(sec)}`;
    }
    return `${zp(h)}:${zp(min)}:${zp(sec)}`;
}