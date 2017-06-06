// Declare the model
calculatorModel = {
    operation: "",
    result: "", 
    display: "",

    clear: function() {
        this.operation = "";
        this.display = this.result = this.result.slice(0, -1); // delete one symbol in the entered line 
    },

    setNumber: function(clickedNumber) {
        let currentResult = this.result, 
            lastSymbol = currentResult.length > 0 ? currentResult[currentResult.length - 1] : '';
        if ((lastSymbol !=='' || clickedNumber !== 0) && lastSymbol!==')'){  // Check the last Symbol in the entered line  
            this.result += clickedNumber;
            this.display = this.result;
        }
    },

    setOperation: function(operationToSet) {
        this.operation = operationToSet;
        let currentResult = this.result, 
            lastSymbol = currentResult.length > 0 ? currentResult[currentResult.length - 1] : '';
            
        switch (this.operation) {
            case "(":
                if (/[\*\/\+\-\(/]/.test(lastSymbol) || lastSymbol==''){ // Check the last symbol in the entered line
                    this.result += operationToSet;
                    this.display = this.result;
                }
                break;

            case ")":                
                let openedBrackets = currentResult.match(/\(/g) || [],
                    closedBrackets = currentResult.match(/\)/g) || [];
                if (  /\d/.test(lastSymbol) || (openedBrackets.length > closedBrackets.length)){ //Check the last symbol in the entered line and count of brackets 
                    this.result += operationToSet;
                    this.display = this.result;
                }
                break;
            default:
                let lastSymbolIsAvaible = /[\d\)]/.test(lastSymbol);
                if (lastSymbolIsAvaible)
                    this.result += this.operation;
                    this.display = this.result; 
                break;
        }
    },

    calculate: function() {        
        let str = `(${this.result})`, // the entered line          
            pos = 0,
            symbol = '',
            prevSymbol = '',
            numbers = [],
            operators = [];


        let readNumber = (s) => {
            let res = "";
            while (pos < s.length && /\d/.test(s[pos]))
                res += s[pos++];                
            
            return res;
        };

        let readOperator = (s) => {
            return s[pos++];
        };

        let getSymbol = (s) => {

            if (pos == s.length) {
                return null;
            } else if (/\d/.test(s[pos])) {
                return readNumber(s);
            } else {
                return readOperator(s);
            }
        };

        let popOperator = (numbers, operators) => {
            let b = numbers.pop();
            let a = numbers.pop();
            switch (operators.pop()) {
                case '+':
                    numbers.push(a + b);
                    break;
                case '-':
                    numbers.push(a - b);
                    break;
                case '*':
                    numbers.push(a * b);
                    break;
                case '/':
                    numbers.push(a / b);
                    break;
            }
        };
        let getPriority = (op) => {
            switch (op) {
                case '(':
                    return -1; // не выталкивает сам и не дает вытолкнуть себя другим
                case '*':
                case '/':
                    return 1;
                case '+':
                case '-':
                    return 2;
                default:
                    throw new Error("Invalid operation");
            }
        };

        let canPop = (op1, operators) => {
            if (operators.length == 0)
                return false;
            let p1 = getPriority(op1);
            let p2 = getPriority(operators[operators.length - 1]);

            return p1 >= 0 && p2 >= 0 && p1 >= p2;
        };

        //main cycl
        do {
            symbol = getSymbol(str);
            if (prevSymbol == '(' && (symbol == '+' || symbol == '-'))
                numbers.push(0);

            if (/[\d]/.test(symbol)) {
                numbers.push(+symbol);
            } else if (symbol == ')') {
                // The closing bracket is an exception to the rule. Extract all operations until the first open bracket
                while (operators.length > 0 && operators[operators.length - 1] != '(')
                    popOperator(numbers, operators);
                operators.pop(); // delete symbol "("
            } else {
                while (canPop(symbol, operators)) // if can extract the operator then extract
                    popOperator(numbers, operators); 

                operators.push(symbol); // throw a new operation on the stack
           }
        
        prevSymbol = symbol;

        }while (symbol !== null)

        return numbers.toString(); // return result of calculate
    }
};

// declare the calculator-module
let calculatorApp = angular.module('calculatorApp', ['calculatorModule']);
let calculatorModule = angular.module('calculatorModule', []);

// Add the calculator-controller to module
calculatorModule.controller('calculatorController', ['$scope', function($scope) {
    $scope.calculator = calculatorModel;
    $scope.numberButtonClicked = function(clickedNumber) {
        if (calculatorModel.result.length < 26) // limit input on display
            calculatorModel.setNumber(clickedNumber);

    };

    $scope.operationButtonClicked = function(clickedOperation) {
        if (calculatorModel.result.length < 26) // limit input on display
            calculatorModel.setOperation(clickedOperation);
    };

    $scope.equalClicked = function() {       
            calculatorModel.display = calculatorModel.calculate();
            calculatorModel.result = '';
    };

    $scope.clearClicked = function() {
        calculatorModel.clear();
    };
}]);