import './style.css';
import Decimal from 'decimal.js';

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

    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e) => {
        clearTimeout(timeout);
        timeout = -1;
        const result = e.data;
        resultContainer.innerHTML = `${result}`;
        //window.MathJax.typeset();
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
            try {
                var x = new Decimal(xInput.value);
                var precision = new Decimal(precisionInput.value).floor();
                hideError();
                calcButton.classList.add("is-loading");
                working = true;
                worker.postMessage([x.toString(), precision.toString()]);
                timeout = setTimeout(() => {
                    showError('Вычисление заняло слишком много времени. Скорее всего, ряд не сходится при этом значении x.');
                    restartWorker();
                    calcButton.classList.remove("is-loading");
                    working = false;
                    timeout = -1;
                }, 120000);
            } catch (error) {
                console.error(error);
                showError("Введенные значения не являются числами.");
            }
        } else {
            showError('Введите оба значения - x и точность.');
        }
    }
};