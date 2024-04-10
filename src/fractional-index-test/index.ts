import fractionalIndex from "fractional-index";


const index = fractionalIndex("a", "b");

console.log(index); // "a"

const index1 = fractionalIndex("a", null);

console.log(index1);

console.log(fractionalIndex("0.3", "0.4"));

function insertNodes(start: string, end: string, count: number): number {
    if (start === end) {
        return count;
    }

    const index = fractionalIndex(start, end);
    // console.log(`calculated index: ${index}`);
    count++;

    return insertNodes(start, index, count);
}

const start = "0.3";
const end = "0.4";
let count = 0;

// count = insertNodes(start, end, count);

// console.log(count);