function fn(str) {
    let counter = 0;
    let result = str ?? '';
    function aggregateStr(nextStr) {
        if (typeof nextStr !== 'string') {
            return result;
        }
        if (result !== '') {
            result += ' ';
        }
        result += nextStr;
        counter++;
        return this;
    }
    return {
        fn: aggregateStr,
    };
}

console.log(fn('hello').fn('world').fn('!!!').fn());
console.log(fn('This').fn('is').fn('just').fn('a').fn('test').fn());
