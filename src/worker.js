import Decimal from 'decimal.js';

onmessage = (e) => {
    const x = e.data[0];
    const precision = e.data[1];
    postMessage(calculateSum(x, precision));
}

function calculateSum(x, precision) {
    const dX = new Decimal(x);
    const dPrecision = new Decimal(1).dividedBy(new Decimal(precision));
    var sum = new Decimal(0.0);
    var n = 1;
    while (true) {
        // var step = (x ** n) / ((4 ** (n - 1)) * (n + 1));
        var step = dX.toPower(n).dividedBy((new Decimal(4).toPower(n - 1)).times(n + 1));
        console.log(`step ${n} = ${step}`);
        sum = sum.plus(step);
        if (step.abs().lessThan(dPrecision)) {
            break;
        }
        
        n += 1;
    }

    return sum.toString();
}
