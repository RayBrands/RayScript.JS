//old main

//Работа с переменными
/*

*/
const variablesDict = {}; // Объект для хранения переменных

//справочник для работы с переменными
const variables = {
	setValue: (_name,_value) => variablesDict[_name] = _value;

function setValue(_name, _value) {// Функция для установки значения переменной
  
}

// Функция для получения значения переменной
function getValue(_name) {
  return variables[_name];
}

//Раскрытие скобок
/*
На вход принимает функцию со скобками (квадратные и круглые)
На выходе:
text - текст функции без скобок
args - аргументы, которые находились внутри скобок, выводится в виде массива
*/
function openBrackets(text) { 
    const result = {
        text: "",
        args: []
    };

    let currentBracketValue = "";
    let roundBracketCount = 0;
    let squareBracketCount = 0;

    for (let char of text) {
        if (char === '(' && squareBracketCount === 0) {
            roundBracketCount++;
            if (roundBracketCount > 1) {
                currentBracketValue += char;
            }
        } else if (char === ')' && squareBracketCount === 0) {
            roundBracketCount--;
            if (roundBracketCount > 0) {
                currentBracketValue += char;
            } else {
                result.args.push(currentBracketValue.trim());
                currentBracketValue = "";
            }
        } else if (char === '[' && roundBracketCount === 0) {
            squareBracketCount++;
            if (squareBracketCount > 1) {
                currentBracketValue += char;
            }
        } else if (char === ']' && roundBracketCount === 0) {
            squareBracketCount--;
            if (squareBracketCount > 0) {
                currentBracketValue += char;
            } else {
                result.args.push(currentBracketValue.trim());
                currentBracketValue = "";
            }
        } else if (roundBracketCount === 0 && squareBracketCount === 0) {
            result.text += char;
        } else {
            currentBracketValue += char;
        }
    }
	
	if (result.text === "") { //Проверка на то, что всё-таки текст функции есть
        return openBrackets(result.args[0]);
    }
	
	result.text = result.text.replace(/ /g, "")
    return result;
}

function parser(_text, args) {
  const funcDict = {
    '+': (args) => parseFloat(args[0])+parseFloat(args[1]),
    '-': (args) => args.reduce((acc, val) => acc - val)
    // Добавьте другие операторы с их обработчиками
  };

  return funcDict[_text](args);
}
/*
const functionDictionary = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

// Вызов функции по ключу
const result = functionDictionary.add(2, 3);
console.log(result); // Вывод: 5
*/
/*
const operationDictionary = {
    "+": "math",
    "-": "math",
    "*": "math",
    "/": "math",
    "**": "math",
    "pow": "math",
    ">": "req",
    "<": "req",
    "==": "req",
    "!=": "req",
    ">=": "req",
    "<=": "req",
    "<>": "req",
    "><": "req",
    "and": "req",
    "or": "req",
    "nand": "req",
    "nor": "req",
    "xor": "req",
    "xnor": "req",
    "contains": "req",
    "identical": "req",
    "join": "str",
    "=": "var",
    "+=": "var",
    "-=": "var",
    "*=": "var",
    "/=": "var",
    "^=": "var",
    "of": "exp",
    "to": "exp",
    "splitby": "exp",
    "with": "exp"
};
const operationDictionaryExtended = {
    "[lengthof": "math",
    "[roundof": "math",
    "[absof": "math",
    "[floorof": "math",
    "[sqrtof": "math",
    "[ceiling": "math",
    "[cosof": "math",
    "[sinof": "math",
    "[tanof": "math",
    "[asinof": "math",
    "[acosof": "math",
    "[atanof": "math",
    "[lnof": "math",
    "[e^of": "math",
    "[logof": "math",
    "[randomo": "math",
    "[truncof": "math",
    "not": "req",
    "!": "req",
    "item#of": "list",
    "lengthof": "list",
    "contains": "list",
    "item": "list"
};
*/
/*// Пример использования словаря
const operator = "with";
console.log("Тип операции:", operationDictionary[operator]);*/

const editTextElement = document.getElementById('editText');
const submitButton = document.getElementById('submitButton');
const outputElement = document.getElementById('output');

//При нажатии кнопки "sumbitButton"
submitButton.addEventListener('click', function() { 
	const editTextValue = editTextElement.value;
	// Пример использования
	const inputText = "(([trunc with digits (4)] of (4.126795)))";
	//Текст без скобок: text  of func  an 
	//Значения в скобках: ['a', '(a)+(b)', 'list']

	const result = openBrackets(editTextElement.value);
	console.log("Текст без скобок:", result.text);
	console.log("Значения в скобках:", result.args);
	console.log("Parser:", )
	
	myFunction(`Текст без скобок: ${result.text}\nЗначения в скобках: ${result.args.join(', ')}`);
});

//Вывод значения в "output"
function myFunction(text) {
    // Ваш код, использующий текст из editText
    outputElement.innerHTML = 'Received text: ' + text;
}

const inputText = "(9)+(10)";
const result = openBrackets(inputText);
console.log(result);
console.log("Значения в parser:", parser(result.text,result.args));
