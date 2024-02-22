//old main

//Работа с переменными
/*

*/
const variablesDict = {}; // Хранение переменных проекта в словаре (Почему нет)

//справочник(-функция) для работы с переменными
//#TODO: Сделать работу с модулями
const variables = { 
	setValue: function (_name,_value) { // Функция для установки значения переменной
		variablesDict[_name] = _value;
		return _value; 
	},
	getValue: function (_name){ // Функция для получения значения переменной
		return variablesDict[_name] ?? 0; //Возвращает значение Zero если нету такой переменной
	}
};


/*
    Функция принимает на вход строку, 
	представляющую собой функцию со скобками (квадратными и круглыми), 
	и разделяет ее на текст функции и аргументы.

    Args:
        text: Строка, представляющая собой функцию со скобками.

    Returns:
        result: Объект с двумя полями:
			* text: Текст функции без скобок.
			* args: Массив аргументов, которые находились внутри скобок.
*/
function openBrackets(text) { 
    const result = {
        text: "",
        args: []
    };

    let currentBracketValue = "";
    let roundBracketCount = 0;
    let squareBracketCount = 0;

    try { //Добавлен обработчик ошибок
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
	} catch (TypeError){
		result.text='0'; //Maybe wrong?
	};
	if (result.text === "") { //Проверка на то, что всё-таки текст функции есть
        return openBrackets(result.args[0]);
    };
	result.text = result.text.replace(/ /g, "")
    return result;
}

function returnReq(req) {return (req)?1:0}; //Нужно для численного значения булевого типа данных

const twoArg = { //Операторы с двумя аргументами
		//math
        '+': (a,b) => (a+b), // Ваш код для операции сложения
        '-': (a,b) => (a-b),
		'*': (a,b) => (a*b),
		'/': (a,b) => (a/b),
		'**': (a,b) => (a**b),
		'pow': (a,b) => (a**b),
		//req
		'>': (a,b) => (returnReq(a>b)),
		'<': (a,b) => (returnReq(a<b)),
		'==': (a,b) => (returnReq(a==b)),
		'>=': (a,b) => (returnReq(a>=b)),
		'<=': (a,b) => (returnReq(a<=b)),
		'<>': (a,b) => (returnReq(a!=b)),
		'!=': (a,b) => (returnReq(a!=b)),
		'><': (a,b) => (returnReq(a!=b)),
		'and': (a,b) => (returnReq(a&&b)),
		'or': (a,b) => (returnReq(a||b)),
		'nand': (a,b) => (returnReq(!(a&&b))),
		'nor': (a,b) => (returnReq(!(a||b))),
		'xor': (a,b) => (returnReq(a!==b)),
		'xnor': (a,b) => (returnReq(a===b)),
		//str
		'join': (a,b) => (''+a+b),
		'contains': (a,b) => (returnReq(a.includes(b))),
		'identical': (a,b) => (returnReq(a===b)),
		'to': (a,b) =>{
			if (b == "uppercase") {
				return (a.toUpperCase())
			} else {
				return (a.toLowerCase())
			}
		}
		//easest
		
		
		
        // Добавьте другие операторы с их обработчиками
    };

function parser(_text, args) {
	var a,b,c=0;
	const oneArg = {
		'!': (a) => (returnReq(!a)),
		'not': (a) => (returnReq(!a))
	};
    
	
    // Если _text - числовое значение, возвращаем его
    if (!isNaN(_text)) {
        return parseFloat(_text);
    } else {
        // Если _text - оператор, выполняем соответствующую операцию
        if (oneArg[_text]) {
			a = parser(openBrackets(args[0]).text,openBrackets(args[0]).args);
            return oneArg[_text](a);
        } else if (twoArg[_text]) {
			a = parser(openBrackets(args[0]).text,openBrackets(args[0]).args);
			b = parser(openBrackets(args[1]).text,openBrackets(args[1]).args);
            return twoArg[_text](a,b);
        } 
		// Если _text не числовое значение и не оператор, возвращаем его как есть
		return _text;
    }
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



/*
 Класс extensions
 
 Принимает модуль, добавляет команды в commands
 
 Добавляет значения блоков в blocks (Распределяя по классам)
 
 modules содержит все подключённые модули а также их описание, color и ссылка на документацию
*/

class extensions {
  constructor() {
    this.commands = new Map();
    this.blocks = new Map();
    this.modules = new Map();
  }

  register(clazz) { //Регистрация нового модуля
    if (isNotClassValid(clazz)) {
      throw new Error('Invalid class: ' + clazz.name);
    }
    const info = clazz.prototype.getInfo();
    const moduleInfo = {
        name: info.name,
        color: info.color, // pure red
        docsURI: info.docsURI, //Документация к модулю
		description: info.description //краткое описание модуля
    }
    this.modules.set(info.id, moduleInfo);

    // Registration code remains the same
    // Регистрация блоков
      for (const block of info.blocks) {
        //Регистрация команд
        const key = block.text.replace(/\s/g, ''); // Ключ без пробелов
        this.commands.set(openBrackets(key).text, {
          id: info.id,
          opcode: block.opcode,
          args: block.args,
		  func: clazz.prototype[block.opcode]  //возможно стоит изменить это
        });
        //Регистрация блоков
        const blocksForClass = this.blocks.get(info.id) || {};
        blocksForClass[block.text] = {
          type: block.type,
          description: block.description,
          args: block.args
        };
        this.blocks.set(info.id, blocksForClass);
      }
      return this;
  }
  
  
}
const ext = new extensions();//Инициализация дополнений
/*Функция, которая вызывает функцию с названием text*/


function callFunction(ext,text, args) {
	//let func = {
	//	id: text.id,
	//	opcode: text.opcode,
	//	args: text.args
	//}
	/*// Проверка, является ли text строкой
	if (typeof text !== 'string') {
		throw new TypeError('text должен быть строкой');
	}
	// Проверка, является ли args массивом
	if (!Array.isArray(args)) {
		throw new TypeError('args должен быть массивом');
	}*/

	//const clazz = ext.modules.get(func.id).clazz; // Получить класс по имени
	//const instance = new clazz(); // Создать экземпляр класса
	const result = text(...args);

	// Получение функции из объекта window
	//const func = window[text];

	/*// Проверка, является ли func функцией
	if (typeof func !== 'function') {
		throw new TypeError(`Функция ${text} не найдена`);
	}*/

	// Вызов функции с аргументами
	return result;
}

function isNotClassValid(clazz) {
  return !(clazz.prototype && clazz.prototype.getInfo && typeof clazz.prototype.getInfo === 'function');
}
/*Modules*/
class HelloWorld {
	getInfo() {
		return {
			id: 'HelloWorld',
			name: 'It works!',
			color: '#ff0000', // pure red
			docsURI: 'https://ya.ru', //Документация к модулю
			description: 'Описание модуля', //Описание модуля
			blocks: [
				{
					text: 'Hello !(var)',
					opcode: 'hello',
					type: 'reporter',
					description: 'Описание блока'
				},
				{
					text: 'world !',
					opcode: 'world',
					type: 'reporter',
					description: 'возвращает значение world!'
				},
				{
					text: '[ONE] strictly equals [TWO]',
					opcode: 'strictlyEquals',
					type: 'boolean',
					description: 'Сравнение ONE с TWO',
				}
			]
		};
	}
	//Функции модуля
	hello() {
		return 'hello';
	};
	world() {
		return 'world';
	};
	strictlyEquals(a,b) {
		console.log(a);
		console.log("next:")
		let clazz = (new HelloWorld)
		console.log(clazz.hello()); //Вызов функции внутри класса
		return (a===b?1:0);
		//return args[0] === args[1];
	};
};
ext.register(HelloWorld);//Регистрация нового модуля "HelloWorld"



const editTextElement = document.getElementById('editText');
const submitButton = document.getElementById('submitButton');
const outputElement = document.getElementById('output');

//При нажатии кнопки "submitButton"
submitButton.addEventListener('click', function() { 
	const editTextValue = editTextElement.value;
	// Пример использования
	const inputText = "(([trunc with digits (4)] of (4.126795)))";
	//Текст без скобок: text  of func  an 
	//Значения в скобках: ['a', '(a)+(b)', 'list']
	
	const result = openBrackets(editTextElement.value);
	console.log("Текст без скобок:", result.text);
	console.log("Значения в скобках:", result.args);
	console.log("Parser:", parser(result.text,result.args));
	console.log();
	let textVar = openBrackets(editTextElement.value).text;
	let args = openBrackets(editTextElement.value).args;
	const result2 = callFunction(ext,ext.commands.get(textVar).func,args)
	myFunction(`Текст без скобок: ${result2}`);
});

//Вывод значения в "output"
function myFunction(text) {
    // Ваш код, использующий текст из editText
    outputElement.innerHTML = 'Received text: ' + text;
}

const inputText = "(9)+((1)+(1))";
const result = openBrackets(inputText);
variablesDict["var"]=42;
console.log(variablesDict["var"]);
const abc = {"a":123};
abc["b"]=45;

console.log(result);
console.log("Значения в parser:", parser(result.text,result.args));
