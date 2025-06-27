import './index.css';

class Calculator {
    private previousOperandTextElement: HTMLElement;
    private currentOperandTextElement: HTMLElement;
    private currentOperand: string = '';
    private previousOperand: string = '';
    private operation: string | null = null;
    private readyToReset: boolean = false;

    constructor(previousOperandTextElement: HTMLElement, currentOperandTextElement: HTMLElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
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

        this.currentOperand = this.formatNumber(computation);
        this.operation = null;
        this.previousOperand = '';
        this.readyToReset = true;
        this.updateDisplay();
    }
    
    handleScientific(func: string) {
        if (this.currentOperand === 'Error') this.clear();

        const current = parseFloat(this.currentOperand);
        if (isNaN(current) && func !== 'pi' && func !== 'e') return;
        let result: number;

        const factorial = (n: number): number => {
            if (n < 0 || n % 1 !== 0) return NaN;
            if (n > 170) return Infinity; // Prevent call stack overflow and handle large numbers
            if (n === 0 || n === 1) return 1;
            return n * factorial(n - 1);
        };
        
        switch(func) {
            case 'sq': result = Math.pow(current, 2); break;
            case 'sqrt': result = Math.sqrt(current); break;
            case 'inv': result = 1 / current; break;
            case 'sin': result = Math.sin(current * Math.PI / 180); break;
            case 'cos': result = Math.cos(current * Math.PI / 180); break;
            case 'tan': result = Math.tan(current * Math.PI / 180); break;
            case 'log10': result = Math.log10(current); break;
            case 'ln': result = Math.log(current); break;
            case 'fact': result = factorial(current); break;
            case 'pi': this.currentOperand = Math.PI.toString(); this.updateDisplay(); return;
            case 'e': this.currentOperand = Math.E.toString(); this.updateDisplay(); return;
            case 'pow': this.chooseOperation('xʸ'); return;
            default: return;
        }
        
        if (!isFinite(result) || isNaN(result)) {
            this.handleError();
            return;
        }
        
        this.currentOperand = this.formatNumber(result);
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
    const calculatorElement = document.getElementById('calculator')!;
    const modeToggle = document.getElementById('mode-toggle') as HTMLInputElement;

    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

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

    // Load initial theme
    const savedTheme = localStorage.getItem('calculator-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDark ? 'dark' : 'light');
    }
});
