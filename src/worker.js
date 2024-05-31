onmessage = (e) => {
    console.log("worker: received", e.data);
    const x = e.data[0];
    const precision = e.data[1];
    postMessage(calculateSum(x, precision));
}

function calculateSum(x, precision) {
    const prec = 1.0 / (10 ** precision);
    var sum = 0.0;
    var n = 1;
    while (true) {
        var step = (x ** n) / ((4 ** (n - 1)) * (n + 1));
        sum += step;
        if (step < prec) {
            break;
        }
        n += 1;
    }

    return sum.toFixed(precision);
}