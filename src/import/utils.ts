const psl = require("psl");

// extracts domain name from input url
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

export function last(arr: any[]) {
    return arr[arr.length-1];
}

function zp(n: number) {
    if (n < 10) {
        return `0${n}`;
    }
    return `${n}`;
}

// transform duration, from milliseconds into
// human readable form
export function duration(ms: number) {
    let sec = Math.floor(ms / 1000);
    let min = Math.floor(sec / 60);
    sec -= min * 60;
    let h = Math.floor(min / 60);
    min -= h * 60;
    if (!h) {
        return `${zp(min)}:${zp(sec)}`; // mm:ss
    }
    return `${zp(h)}:${zp(min)}:${zp(sec)}`; // hh:mm:ss
}

const stepSizes = [
    1000*60,
    1000*60*2,
    1000*60*5,
    1000*60*15,
    1000*60*30,
    1000*60*60,
    1000*60*60*3,
    1000*60*60*6
];

/*
an appropriate interval size for the y-axis of the chart
given some chart data, using the calculation of its
maximum bar height
*/
export function calcStepSize(data: any) {
    let maxBarHeight = 0;
    for (const idx in data.labels) {
        let barHeight = 0;
        for (const point of data.datasets) {
            barHeight += point.data[idx];
        }
        maxBarHeight = Math.max(maxBarHeight, barHeight);
    }
    let selidx=0
    for (selidx; selidx<stepSizes.length; selidx++) {
        if (5*stepSizes[selidx] > maxBarHeight) {
            break;
        }
    }
    return stepSizes[Math.max(selidx-1, 0)];
}
