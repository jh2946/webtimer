const bs = require("binary-search");

export const INF = 1e+308;

export function overlap(
    interval1: number[],
    interval2: number[],
) {
    return Math.max(0, 
        Math.min(
            interval1[1], interval2[1]
        )
        - Math.max(
            interval1[0], interval2[0]
        ));
}

export function first(
    table: number[][],
    interval: number[]
) {

    const comparator = (
        element: number[],
        needle: number
    ) => element[1] - needle;

    const index = bs(table, interval[0], comparator);

    if (index < 0) {
        return -1-index;
    }
    return index+1;

}

export function last(
    table: number[][],
    interval: number[]
) {

    const comparator = (
        element: number[],
        needle: number
    ) => element[0] - needle;

    const index = bs(table, interval[1], comparator);

    if (index < 0) {
        return -2-index;
    }
    return index-1;

}