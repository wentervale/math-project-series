import './style.scss';

const xInput = document.getElementById("x");
const precisionInput = document.getElementById("precision");
const calcButton = document.getElementById("calculate");
const mainBox = document.getElementById("mainBox");
const resultContainer = document.getElementById("resultContainer");

var worker;
var working = false;
var timeout = -1;

function restartWorker() {
    if (worker) {
        worker.terminate();
    }

    worker = new Worker(new URL('./worker.js', import.meta.url));
    
    worker.onmessage = (e) => {
        clearTimeout(timeout);
        timeout = -1;
        const result = e.data;
        resultContainer.innerHTML = `\\(\\approx{${result}}\\)`;
        window.MathJax.typeset();
        calcButton.classList.remove("is-loading");
        working = false;
    };
}

restartWorker();

function showError(msg) {
    var error = document.getElementById('error');
    if (!error) {
        error = document.createElement('div');
        error.id = "error";
        mainBox.appendChild(error);
    }
    
    error.innerHTML = `
    <div class="message is-danger"">
      <div class="message-header">
        <p>Ошибка!</p>
      </div>
      <div class="message-body">
        ${msg}
      </div>
    </div>
    `;
}

function hideError() {
    const errorChild = document.getElementById("error");
    if (errorChild) {
        mainBox.removeChild(errorChild);
    }
}

calcButton.onclick = (e) => {
    if (!working) {
        if (xInput.value.trim() && precisionInput.value.trim()) {
            var x = Number(xInput.value);
            var precision = Math.floor(Number(precisionInput.value));
            console.log(x, precision);
            if (!isNaN(x) && !isNaN(precision)) {
                if (precision >= 0 && precision <= 20) {
                    hideError();
                    calcButton.classList.add("is-loading");
                    working = true;
                    worker.postMessage([x, precision]);
                    timeout = setTimeout(() => {
                        showError('Вычисление заняло слишком много времени. Скорее всего, ряд не сходится при этом значении x.');
                        restartWorker();
                        calcButton.classList.remove("is-loading");
                        working = false;
                        timeout = -1;
                    }, 10000);
                } else {
                    showError('Точность должна входить в интервал от 0 до 20 включительно.');
                }
            } else {
                showError('Введенное значение не является числом.');
            }
        } else {
            showError('Введите оба значения - x и точность.');
        }
    }
};