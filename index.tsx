import './index.css';

class Calculator {
    private previousOperandTextElement: HTMLElement;
    private currentOperandTextElement: HTMLElement;
    private historyListElement: HTMLElement;

    private currentOperand: string = '';
    private previousOperand: string = '';
    private operation: string | null = null;
    private readyToReset: boolean = false;
    private history: { entry: string, result: string }[] = [];

    constructor(previousOperandTextElement: HTMLElement, currentOperandTextElement: HTMLElement, historyListElement: HTMLElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.historyListElement = historyListElement;
        this.loadHistory();
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.readyToReset = false;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === 'Error') {
             this.clear();
             return;
        }
        if (this.readyToReset) return;
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }
    
    toggleSign() {
        if (this.currentOperand === 'Error' || this.currentOperand === '') return;
        if (this.currentOperand === '0') return;

        if (this.readyToReset) {
            this.readyToReset = false;
        }
        
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.substring(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
        this.updateDisplay();
    }

    appendNumber(number: string) {
        if (this.currentOperand === 'Error') this.clear();
        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.readyToReset) {
            this.currentOperand = number;
            this.readyToReset = false;
        } else {
            if (this.currentOperand === '0' && number !== '.') {
                this.currentOperand = number;
            } else {
                this.currentOperand += number;
            }
        }
        this.updateDisplay();
    }

    chooseOperation(operation: string) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '' && this.previousOperand === '') return;
        
        if (this.currentOperand === '' && this.previousOperand !== '') {
             this.operation = operation;
             this.updateDisplay();
             return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.readyToReset = false;
        this.updateDisplay();
    }

    compute() {
        let computation: number;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '−': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = prev / current; break;
            case 'xʸ': computation = Math.pow(prev, current); break;
            default: return;
        }

        if (!isFinite(computation)) {
            this.handleError();
            return;
        }

        const resultString = this.formatNumber(computation);
        const historyEntry = `${this.previousOperand} ${this.operation?.replace('xʸ','^')} ${this.currentOperand} =`;
        this.addToHistory(historyEntry, resultString);

        this.currentOperand = resultString;
        this.operation = null;
        this.previousOperand = '';
        this.readyToReset = true;
        this.updateDisplay();
    }
    
    handleScientific(func: string) {
        if (this.currentOperand === 'Error') this.clear();
        
        const originalOperand = this.currentOperand;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current) && !['pi', 'e'].includes(func)) return;

        let result: number;
        let historyEntry: string = '';

        const factorial = (n: number): number => {
            if (n < 0 || n % 1 !== 0) return NaN;
            if (n > 170) return Infinity; 
            if (n === 0 || n === 1) return 1;
            return n * factorial(n - 1);
        };
        
        switch(func) {
            case 'sq': result = Math.pow(current, 2); historyEntry = `sq(${originalOperand}) =`; break;
            case 'sqrt': result = Math.sqrt(current); historyEntry = `√(${originalOperand}) =`; break;
            case 'inv': result = 1 / current; historyEntry = `1/(${originalOperand}) =`; break;
            case 'sin': result = Math.sin(current * Math.PI / 180); historyEntry = `sin(${originalOperand}) =`; break;
            case 'cos': result = Math.cos(current * Math.PI / 180); historyEntry = `cos(${originalOperand}) =`; break;
            case 'tan': result = Math.tan(current * Math.PI / 180); historyEntry = `tan(${originalOperand}) =`; break;
            case 'log10': result = Math.log10(current); historyEntry = `log(${originalOperand}) =`; break;
            case 'ln': result = Math.log(current); historyEntry = `ln(${originalOperand}) =`; break;
            case 'fact': result = factorial(current); historyEntry = `fact(${originalOperand}) =`; break;
            case 'pi': this.currentOperand = Math.PI.toString(); this.addToHistory('π =', this.currentOperand); this.readyToReset = true; this.updateDisplay(); return;
            case 'e': this.currentOperand = Math.E.toString(); this.addToHistory('e =', this.currentOperand); this.readyToReset = true; this.updateDisplay(); return;
            case 'pow': this.chooseOperation('xʸ'); return;
            default: return;
        }
        
        if (!isFinite(result) || isNaN(result)) {
            this.handleError();
            return;
        }
        
        const resultString = this.formatNumber(result);
        this.addToHistory(historyEntry, resultString);
        this.currentOperand = resultString;
        this.readyToReset = true;
        this.updateDisplay();
    }

    handleError() {
        this.currentOperand = 'Error';
        this.previousOperand = '';
        this.operation = null;
        this.readyToReset = true;
        this.updateDisplay();
    }

    formatNumber(num: number): string {
        const strNum = num.toString();
        if (strNum.length > 15) {
            return num.toPrecision(10);
        }
        return strNum;
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.currentOperand;
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.previousOperand} ${this.operation.replace('xʸ','^')}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
    
    // --- History Methods ---
    loadHistory() {
        const savedHistory = localStorage.getItem('calculator-history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }
        this.updateHistoryDisplay();
    }

    saveHistory() {
        localStorage.setItem('calculator-history', JSON.stringify(this.history));
    }

    addToHistory(entry: string, result: string) {
        this.history.unshift({ entry, result });
        if (this.history.length > 50) { // Limit history size
            this.history.pop();
        }
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    private setCurrentOperand(value: string) {
        if(value === 'Error') return;
        this.currentOperand = value;
        this.previousOperand = '';
        this.operation = null;
        this.readyToReset = true;
        this.updateDisplay();
    }

    updateHistoryDisplay() {
        this.historyListElement.innerHTML = '';
        if(this.history.length === 0) {
            const li = document.createElement('li');
            li.style.textAlign = 'center';
            li.style.opacity = '0.5';
            li.innerText = 'History is empty';
            this.historyListElement.appendChild(li);
            return;
        }
        this.history.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="opacity: 0.7">${item.entry}</span><br>${item.result}`;
            li.dataset.result = item.result;
            li.addEventListener('click', () => {
                this.setCurrentOperand(item.result);
            });
            this.historyListElement.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const numberButtons = document.querySelectorAll<HTMLButtonElement>('[data-number]');
    const operatorButtons = document.querySelectorAll<HTMLButtonElement>('[data-operator]');
    const equalsButton = document.querySelector<HTMLButtonElement>('[data-action="equals"]');
    const deleteButton = document.querySelector<HTMLButtonElement>('[data-action="delete"]');
    const clearButton = document.querySelector<HTMLButtonElement>('[data-action="clear"]');
    const decimalButton = document.querySelector<HTMLButtonElement>('[data-action="decimal"]');
    const toggleSignButton = document.querySelector<HTMLButtonElement>('[data-action="toggle-sign"]');
    const scientificButtons = document.querySelectorAll<HTMLButtonElement>('[data-sci]');
    
    const previousOperandTextElement = document.querySelector<HTMLElement>('[data-previous-operand]')!;
    const currentOperandTextElement = document.querySelector<HTMLElement>('[data-current-operand]')!;
    const historyListElement = document.getElementById('history-list') as HTMLElement;
    const calculatorElement = document.getElementById('calculator')!;
    const modeToggle = document.getElementById('mode-toggle') as HTMLInputElement;

    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement);

    numberButtons.forEach(button => {
        button.addEventListener('click', () => calculator.appendNumber(button.innerText));
    });

    operatorButtons.forEach(button => {
        button.addEventListener('click', () => calculator.chooseOperation(button.innerText));
    });

    equalsButton?.addEventListener('click', () => calculator.compute());
    clearButton?.addEventListener('click', () => calculator.clear());
    deleteButton?.addEventListener('click', () => calculator.delete());
    decimalButton?.addEventListener('click', () => calculator.appendNumber('.'));
    toggleSignButton?.addEventListener('click', () => calculator.toggleSign());
    
    scientificButtons.forEach(button => {
        button.addEventListener('click', () => calculator.handleScientific(button.dataset.sci!));
    });

    modeToggle.addEventListener('change', () => {
        calculatorElement.classList.toggle('scientific-mode', modeToggle.checked);
    });
    
    document.addEventListener('keydown', (event) => {
        if (event.key >= '0' && event.key <= '9') {
            calculator.appendNumber(event.key);
        } else if (event.key === '.') {
            calculator.appendNumber('.');
        } else if (event.key === 'Enter' || event.key === '=') {
            event.preventDefault(); // prevent form submission
            calculator.compute();
        } else if (event.key === 'Backspace') {
            calculator.delete();
        } else if (event.key === 'Escape') {
            calculator.clear();
        } else if (event.key === '+') {
            calculator.chooseOperation('+');
        } else if (event.key === '-') {
            calculator.chooseOperation('−');
        } else if (event.key === '*') {
            calculator.chooseOperation('×');
        } else if (event.key === '/') {
            calculator.chooseOperation('÷');
        }
    });

    // Theme switcher logic
    const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
    
    const applyTheme = (theme: string) => {
        document.body.dataset.theme = theme;
        localStorage.setItem('calculator-theme', theme);
    };

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // History panel logic
    const historyToggle = document.getElementById('history-toggle') as HTMLButtonElement;
    const calculatorContainer = document.getElementById('calculator-container') as HTMLElement;
    const clearHistoryBtn = document.getElementById('clear-history-btn') as HTMLButtonElement;
    
    historyToggle.addEventListener('click', () => {
        calculatorContainer.classList.toggle('history-visible');
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        calculator.clearHistory();
    });


    // Load initial theme
    const savedTheme = localStorage.getItem('calculator-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDark ? 'dark' : 'light');
    }
});