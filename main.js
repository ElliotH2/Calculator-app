document.addEventListener("DOMContentLoaded", function() {
    const display = this.documentElement.querySelector(".display");
    const numberButton = this.documentElement.querySelectorAll(".numbers")
    const operatorButton = this.documentElement.querySelectorAll(".operators")
    const clearButton = this.documentElement.querySelectorAll(".clear")
    const moreOperatorButtons = this.documentElement.querySelectorAll(".more-operators")
    const historyPanel = document.getElementById("history-panel");

    //helper functions
    function displayText(text) {
        if (text === "X") text = "x";
        display.value += text;
    }
    function setDisplay(value) {
        display.value = value.toString();
    }
    function errorReset() {
        if (display.value === "Error") {
            display.value = "";
        }
    }
    function getExpression() {
        return display.value.replace(/x/g, '*');
    }
    function safeEvaluate(expression) {
    try {
        return math.evaluate(expression);
    } catch {
        return "Error";
        }
    }

    //basic operations
    function handleOperator(operator) {
    errorReset();
    if (operator === "=") {
        const expression = getExpression();
        const result = safeEvaluate(expression);
        if (result !== "Error") {
            setDisplay(result);
            appendHistory(expression.replace(/\*/g, "×"), result);
        } else {
            setDisplay("Error");
        }
    } else if (operator === "√") {
        const num = parseFloat(display.value);
        if (!isNaN(num) && num >= 0) {
            const result = parseFloat(Math.sqrt(num).toFixed(2));
            setDisplay(result);
            appendHistory(`√(${num})`, result);
        } else {
            setDisplay("Error");
        }
    } else if (operator === "%") {
        const num = parseFloat(display.value);
        if (!isNaN(num)) {
            setDisplay(parseFloat((num / 100).toFixed(2)));
        } else {
            setDisplay("Error");
        }
    } else if (operator === "+/-") {
        const num = parseFloat(display.value);
        if (!isNaN(num)) {
            setDisplay(-num);
        }
    } else {
        displayText(operator);
        }
    }

    //History Panel
    const historyButton = document.getElementById("history-btn");
    historyButton.addEventListener("click", () => {
        historyPanel.classList.toggle("show");
    })
    function appendHistory(expression, result) {
        const historyEntry = document.createElement("div");
        historyEntry.textContent = `${expression} = ${result}`;
        historyPanel.appendChild(historyEntry);
        historyEntry.classList.add("history-entry");
    }
    const clearHistoryButton = document.getElementById("clear-hist-btn");
    clearHistoryButton.addEventListener("click", () => {
        const entries = document.querySelectorAll(".history-entry");
        entries.forEach(entry => entry.remove());   
    });

    //logarthmic button input translator
    if (typeof math.ln === "undefined") {
    math.import({
        ln: function (x) {
            return Math.log(x);
        },
        log: function (x) {
            return Math.log10(x)
        }
    }, { override: true });
    }

    //Append to display
    numberButton.forEach(button => {
        button.addEventListener("click", () => {
            errorReset();
            displayText(button.textContent);
        });
    });

    //handle operations
    operatorButton.forEach(button => {
        button.addEventListener("click", () => {
            handleOperator(button.textContent);
        });
    });

    //handle log and trig operations
    moreOperatorButtons.forEach(button => {
        button.addEventListener("click", () => {
            const expression = getExpression();
            const lowTrig = button.textContent.toLowerCase();
            try {
                const result = math.evaluate(`${lowTrig}(${expression})`);
                const roundedFuncs = ["sin", "cos", "tan", "log", "ln"];
                const roundedResult = roundedFuncs.includes(lowTrig)
                    ? math.round(result, 2)
                    : result;
                display.value = roundedResult.toString();
                appendHistory(`${lowTrig}(${expression.replace(/\*/g, "×")})`, roundedResult);
            } catch {
                display.value = "Error";
            }
        });
    });

    clearButton.forEach(button => {
        button.addEventListener("click", () => {
            if (button.textContent === "C") {
                errorReset();
                display.value = display.value.slice(0,-1);
            } else if (button.textContent === "AC") {
                display.value = "";
            }
        });
    });

    //Keyboard
    document.addEventListener("keydown", (event) => {
        const validKeys = "0123456789+-/*^().";
        const key = event.key;
        errorReset();
        if (validKeys.includes(key)) {
            display.value += (key === '*') ? 'x' : key;
        } else if (key === "Enter" || key === "=") {
            event.preventDefault();
            handleOperator("=");
        } else if (key === "%") {
            event.preventDefault();
            handleOperator("%")
        } else if (key === "Backspace") {
            event.preventDefault();
            display.value = display.value.slice(0,-1);
        } else if (key === "Escape") {
            event.preventDefault();
            display.value = "";
        }
    });
});