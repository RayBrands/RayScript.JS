//Работа с переменными
/*

*/
const variablesDict = {}; // Хранение переменных проекта в словаре (Почему нет)

const variablesMap = new Map();
function setVarValue(_name, _value) {
  variablesMap.set(_name, _value);
  return _value;
}
function getVarValue(_name) {
  return variablesMap.get(_name) ?? 0;
}

var returnValue = 0; //Кол-во return в функции (Для работы с return (return abc))

/*
    Функция принимает на вход строку, 
	представляющую собой функцию со скобками (квадратными и круглыми), 
	и разделяет ее на текст функции и аргументы.

    Args:
        text: Строка, представляющая собой функцию со скобками.

    Returns:
        result: Объект с двумя полями:
			* text: Текст функции без скобок.
			* args: Массив аргументов, которые находились внутри скобок + возможен массив из команд внутри {}
			
	TODO: сделать квадратные скобки значением массива
*/
var argCharDict = {
		"(": 1,
		"[": 1,
		")": -1,
		"]": -1,
};

var commandCharDict = {
		"{": 1,
		"}": -1,
};
function hasNestedArray(arg) { //Проверка того, что в массиве нет массива
  return arg instanceof Array;
}	
function openBrackets(_text) {
	let result = {
		text: "",
		args: [],
		type: "", //str(str,var,float),func,funcCommands
	};

	let argsBracketCount = 0; //Кол-во скобок для аргументов
	let bracketArg = "";
	let skipArgBracketSymbol=1;
	let bracketCommand = "";
	let commandBracketCount = 0;
	let skipCommandBracketSymbol = 1;
	let commandArray = [];
	let firstBracketType = ""; //Определяет какой тип скобок появилась первой
	
	for (let i = 0; i < _text.length; i++) {
		const char = _text[i];
		
		argsBracketCount += argCharDict[char] ?? 0;
		commandBracketCount += commandCharDict[char] ?? 0;
		
		//Позволяет сохранить другой тип скобок внутри других скобок
		if ((argsBracketCount === 1)&&(commandBracketCount===0)){
			firstBracketType = "args"
		} else if ((argsBracketCount === 0)&&(commandBracketCount===1)){
			firstBracketType = "command"
		}
		
		//TODO: сделать отдельные функции для конкретных операций
		switch (firstBracketType) {
			//Первая скобка - аргумента
			case "args":
				if (argsBracketCount >= 1) { 
					if (skipArgBracketSymbol === 0) {
						bracketArg += char;
						//console.log(char);
					} else { //первая скобка аргумента игнорируется
						skipArgBracketSymbol = 0;
					}
				} else if (skipArgBracketSymbol === 0){ //последняя скобка аргумента
					result.args.push(bracketArg);
					bracketArg = "";
					skipArgBracketSymbol = 1;
					firstBracketType = "" 
				}
				break;
			//Первая скобка - команд
			case "command":
				if (commandBracketCount >= 1){
					if (skipCommandBracketSymbol === 0) {
						if ((char === "\n")&&(commandBracketCount == 1)) {
							//TODO: сделать проверку пустого значения
							if (bracketCommand != ''){
								commandArray.push(bracketCommand);
							}
							bracketCommand = "";
						} else {
							bracketCommand += char;
							//console.log(char);
						}
					} else { //первая командная скобка игнорируется
						skipCommandBracketSymbol = 0;
					}
				} else if (skipCommandBracketSymbol === 0) {
					if (bracketCommand != ''){
								commandArray.push(bracketCommand);
					}
					result.args.push(commandArray);
					commandArray = [];
					skipCommandBracketSymbol = 1;
					firstBracketType = "";
					bracketCommand = "";
				}
				break;
			//Скобок нет
			default:
				result.text += char;
		}
	};
	
	result.text.trim();
	
	//Проверка простых скобок без текста
	//console.log(result.text.replace(/\s/g, ''));
	if ((result.text.replace(/\s/g, '')=="")&&(result.args.length>=1)){
		return openBrackets(result.args[0]);
	}
	if (result.args.length>=1) {
		result.type = "func";
		for (let argArray of result.args){
			result.type = hasNestedArray(argArray)?"funcCommands":result.type;
		}
		
	} else {
		if ((!isNaN(result.text))) {
			result.type = "float";
			result.text = parseFloat(result.text);
		} else { //variablesMap.has(result.text)
			result.type = "str"; //Сделать проверку на числа, и т.п. str,var,float
		}
	}
	return result;
};

function openAllBrackets(_text){
	//console.log(`openAllBrackets:${_text}`);
	let result = {
		text: "",
		args: [],
		type: "", //str(str,var,float),func,funcCommands
	};
	result = openBrackets(_text.replace(/\t/g, "")); //Warning: Все штуки табуляции будут игнорироваться, в том числе и в аргументах
	for (let i = 0; i < result.args.length; i++){
		if (hasNestedArray(result.args[i])){
			let commandsArray = [];
			for (let command of result.args[i]){
				//console.log(`openAllBrackets: in command ${command}`);
				let commandResult = openAllBrackets(command);
				commandsArray.push(commandResult);
			}
			result.args[i] = commandsArray;
		} else {
			result.args[i] = openAllBrackets(result.args[i]);
		}
	}
	return result;
}

function returnReq(req) {return (req)?1:0}; //Нужно для численного значения булевого типа данных

/*
 Класс extensions
 Принимает модуль, добавляет команды в commands
 Добавляет значения блоков в blocks (Распределяя по классам)
 modules содержит все подключённые модули а также их описание, color и ссылка на документацию
*/
//TODO: Сделать проверку кол-ва аргументов,  ??задать тип данных для работы с блоками
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
		
        this.commands.set(openBrackets(key).text.toLowerCase(), {
          id: info.id,
          opcode: block.opcode,
		  type: openBrackets(key).type,
          args: block.args,
		  notVarValue: block.notVarValue,
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
var ext = new extensions(); //Инициализация дополнений

function newParser(_openedBrackets,_notVarValue=false){
	let funcVar,bracketsArgs;
	//console.log(_openedBrackets);
	switch (_openedBrackets.type) {
		case "str":
			//console.log(_notVarValue);
			if (variablesMap.has(_openedBrackets.text)){
				return !_notVarValue?getVarValue(_openedBrackets.text.replace(/ /g, "")):(_openedBrackets.text || "0");
			} else {
				return _openedBrackets.text || "0";
			}
		case "float":
			return _openedBrackets.text
		case "func":
			funcVar = ext.commands.get(_openedBrackets.text.replace(/ /g, "").toLowerCase());
			//console.log(funcVar);
			bracketsArgs = _openedBrackets.args;
			let changeNotVarValue = funcVar.notVarValue;
			bracketsArgs[0] = newParser(bracketsArgs[0],changeNotVarValue===true?true:changeNotVarValue);
			for (let i = 1; i < bracketsArgs.length; i++) {
				bracketsArgs[i] = newParser(bracketsArgs[i]);
			}
			//console.log(bracketsArgs);
			return callFunction(funcVar.func,bracketsArgs);
		case "funcCommands":
			funcVar = ext.commands.get(_openedBrackets.text.replace(/ /g, "").toLowerCase());
			//console.log(funcVar);
			bracketsArgs = _openedBrackets.args;
			let result = callFunction(funcVar.func,bracketsArgs);
			//console.log(result);
			return result;
	};
	return _openedBrackets;
	//return _openedBrackets.text || "0";
}

function parser(_text,_notVarValue=false) {
	/*
	TODO:
	2)Сделать поддержку классов, а также функций внутри кода
	*/
	//console.log ('parser text = ', _text);
	let openedBrackets = openBrackets(_text);
	let bracketsText = openedBrackets.text, bracketsArgs, bracketsType = openedBrackets.type;
	let funcVar;
	let changeNotVarValue;
	
	switch (bracketsType) {
		case "str":
			return bracketsText || "0"
		case "var":
			return !_notVarValue?getVarValue(bracketsText):(bracketsText || "0");
		case "float":
			return bracketsText;
		case "funcCommands":
			bracketsArgs = openedBrackets.args;
			funcVar = ext.commands.get(bracketsText.replace(/ /g, "").toLowerCase());
			changeNotVarValue = funcVar.notVarValue;
			//console.log()
			if (!hasNestedArray([bracketsArgs[0]])){
					bracketsArgs[0] = parser(bracketsArgs[0],changeNotVarValue===true?true:false);
			}
			for (let i = 1; i < bracketsArgs.length; i++) {
				if (!hasNestedArray([bracketsArgs[i]])){
					bracketsArgs[i] = parser(bracketsArgs[i]);
				}
			}
			return callFunction(funcVar.func,bracketsArgs);
		case "func":
			bracketsArgs = openedBrackets.args;
			funcVar = ext.commands.get(bracketsText.replace(/ /g, "").toLowerCase());
			changeNotVarValue = funcVar.notVarValue;
			//console.log()
			bracketsArgs[0] = parser(bracketsArgs[0],changeNotVarValue===true?true:false);
			for (let i = 1; i < bracketsArgs.length; i++) {
				bracketsArgs[i] = parser(bracketsArgs[i]);
			}
			return callFunction(funcVar.func,bracketsArgs);
	}
}


function callFunction(text, ...args) { 
	//TODO: Сделать описание и сделать проверку функций и аргументов, представленных внизу
	const result = text(...args);
	return result;
}
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
	

	// Получение функции из объекта window
	//const func = window[text];

	/*// Проверка, является ли func функцией
	if (typeof func !== 'function') {
		throw new TypeError(`Функция ${text} не найдена`);
	}*/

	// Вызов функции с аргументами
	
//}

function isNotClassValid(clazz) {
  return !(clazz.prototype && clazz.prototype.getInfo && typeof clazz.prototype.getInfo === 'function');
}

function startNewCommandsArray(_commandsArray,_commandReturnValue){
	//console.log("startCommand =" + _commandsArray[0]);
	let result = newParser(_commandsArray[0]);
	//console.log("startCommand. result=" + result);
	if (returnValue!=_commandReturnValue){
		return result;
	} else if (_commandsArray.length>1) {
		return startNewCommandsArray(_commandsArray.slice(1),_commandReturnValue);
	} else {
		return result;
	}
}

function startCommandsArray(_commandsArray,_commandReturnValue){
	if (!Array.isArray(_commandsArray)) {
			throw new TypeError("[TOTAL ERROR] 'func {}' have not array of commands");
	}
	let result = parser(_commandsArray[0]);
	//console.log("result startCommands:");
	//console.log(result);
	if (returnValue!=_commandReturnValue){
		return result;
	} else if (_commandsArray.length>1) {
		return startCommandsArray(_commandsArray.slice(1),_commandReturnValue);
	} else {
		return result;
	}
}

/*Start Base Modules*/
class baseModule{
	getInfo() {
		return {
			id: 'baseBlocks',
			name: 'base commands',
			//color: '#ff0000', // pure red
			//docsURI: 'https://ya.ru', //Документация к модулю
			description: 'Предоставляет базовые операции для работы с кодом', //Описание модуля
			blocks: [
				{
					text: 'return ()',opcode: 'returnFunc',description: 'Останавливает работу куска кода, возвращает значение'
				},
				{
					text: 'rys{ }',opcode: 'rys',description: 'Выполнение кода построчно',
					//type: 'reporter',
				},
				{
					text: 'repeat(){ }',opcode: 'repeatFunc',description: '',
					//type: 'reporter',
				},
				{
					text: 'if () {}',opcode: 'ifFunc',description: 'Выполнение кода слева если условие в первом аргументе True(1)'
				},
				
				{
					text: 'if () {}else{}',opcode: 'ifElseFunc',description: 'Выполнение кода слева если условие в первом аргументе True(1), иначе выполняет условие справа'
				},
				/*
					Математические выражения
				*/
				{
					text: '( ) + ( )',opcode: 'add',description: 'Возвращает сумму двух чисел'
				},
				{
					text: '( ) - ( )',opcode: 'subtract',description: 'Возвращает разность двух чисел'
				},
				{
					text: '( ) * ( )',opcode: 'multiply',description: 'Возвращает произведение двух чисел'
				},
				{
					text: '( ) / ( )',opcode: 'divide',description: 'Возвращает частное двух чисел'
				},
				{
					text: '() ** ()',opcode: 'power',description: 'Возводит число a в степень b'
				},
				{
					text: '() pow ()',opcode: 'power',description: 'Возводит число a в степень b'
				},
				{
					text: '() ^ ()',opcode: 'power',description: 'Возводит число a в степень b'
				},
				//Более сложные
				{
					text: 'round ( )',opcode: 'round',description: 'Округляет число до ближайшего целого'
				},
				{
					text: 'abs ( )',opcode: 'abs',description: 'Возвращает абсолютное значение числа'
				},
				{
					text: 'floor ( )',opcode: 'floor',description: 'Округляет число в меньшую сторону'
				},
				{
					text: 'sqrt ( )',opcode: 'sqrt',description: 'Возвращает квадратный корень числа'
				},
				{
					text: 'ceiling ( )',opcode: 'ceiling',description: 'Округляет число в большую сторону'
				},
				{
					text: 'cos ( )',opcode: 'cos',description: 'Возвращает косинус угла в радианах'
				},
				{
					text: 'sin ( )',opcode: 'sin',description: 'Возвращает синус угла в радианах'
				},
				{
					text: 'tan ( )',opcode: 'tan',description: 'Возвращает тангенс угла в радианах'
				},
				{
					text: 'asin ( )',opcode: 'asin',description: 'Возвращает арксинус числа'
				},
				{
					text: 'acos ( )',opcode: 'acos',description: 'Возвращает арккосинус числа'
				},
				{
					text: 'atan ( )',opcode: 'atan',description: 'Возвращает арктангенс числа'
				},
				{
					text: 'ln ( )',opcode: 'ln',description: 'Возвращает натуральный логарифм числа'
				},
				{
					text: 'e^ ( )',opcode: 'exp',description: 'Возводит число e в степень аргумента'
				},
				{
					text: 'log10 ( )',opcode: 'log10',description: 'Возвращает десятичный логарифм числа'
				},
				{
					text: 'log ( )',opcode: 'ln',description: 'Возвращает натуральный логарифм числа'
				},
				{
					text: 'random( )',opcode: 'random',description: 'Генерирует случайное число от 0 до указанного значения'
				},
				{
					text: 'trunc ( )',opcode: 'trunc',description: 'Отбрасывает дробную часть числа, оставляя целую'
				},
				{
					text: '( ) mod ( )',opcode: 'ModFunc',description: 'Сравнение ONE с TWO',
				},
				{
					text: 'trunc with digits ( ) of ( )',opcode: 'TruncWithDigits',description: 'Округление числа до знака запятой'
				},
				
				/*
					Условные выражения
				*/
				{
					text: '( ) > ( )',opcode: 'More',description: '(a) больше (b)?'
				},
				{
					text: '( ) < ( )',opcode: 'Less',description: '(a) меньше (b)?'
				},
				{
					text: '( ) == ( )',opcode: 'Equal',description: '(a) равно (b)?'
				},
				{
					text: '( ) != ( )',opcode: 'NotEqual',description: '(a) не равно (b)?'
				},
				{
					text: '( ) <> ( )',opcode: 'NotEqual',description: '(a) не равно (b)?'
				},
				{
					text: '( ) >< ( )',opcode: 'NotEqual',description: '(a) не равно (b)?'
				},
				{
					text: '( ) >= ( )',opcode: 'MoreOrEqual',description: '(a) больше или равно (b)?'
				},
				{
					text: '( ) <= ( )',opcode: 'LessOrEqual',description: '(a) нменьше или  равно (b)?'
				},
				{
					text: 'not ()',opcode: 'NotFunc',description: '!(req)'
				},
				{
					text: '!()',opcode: 'NotFunc',description: '!(req)'
				},
				{
					text: '( ) and ( )',opcode: 'and_block',description: '(a) и (b) верно?'
				},
				{
					text: '( ) or ( )',opcode: 'or_block',description: '(a) или (b) верно?'
				},
				{
					text: '( ) nand ( )',opcode: 'nand_block',description: '!((a) и (b) верно?)'
				},
				{
					text: '( ) nor ( )',opcode: 'nor_block',description: '!((a) или (b) верно?)'
				},
				{
					text: '( ) xor ( )',opcode: 'xor_block',description: '(a)  не равно (b)?'
				},
				{
					text: '( ) xnor ( )',opcode: 'xnor_block',description: '(a) равно (b)?'
				},
				{
					text: '( ) contains ( )',opcode: 'containsSubstring',description: 'Проверяет, содержит ли строка a подстроку b'
				},
				/*TODO: add "()in()" block*/
				{
					text: '( ) identical ( )',opcode: 'Equal',description: '(a) равно (b)?'
				},
				{
					text: '( ) is var',opcode: 'isVar',notVarValue: true,description: '(a) является переменной?'
				},
				
				/*
					Работа со строками
				*/
				{
					text: '( ) join ( )',opcode: 'joinStrings',description: 'Возвращает конкатенацию строк a и b'
				},
				{
					text: 'length( )',opcode: 'length',description: 'Возвращает длину строки или количество цифр в числе'
				},
				{
					text: 'lower ( )',opcode: 'convertToLowercase',description: 'Преобразует строку a в нижний регистр'
				},
				{
					text: 'upper ( )',opcode: 'convertToUppercase',description: 'Преобразует строку a в верхний регистр'
				},
				{
					text: 'letter ( ) of ( )',opcode: 'getCharacterAtIndex',description: 'Возвращает символ строки b по индексу a'
				},
				{
					text: 'letters ( ) to ( ) of ( )',opcode: 'getSubstringFromRange',description: 'Возвращает подстроку c с индексами из диапазона [a..b]'
				},
				{
					text: 'item ( ) split by ( ) of ( )',opcode: 'getItemFromSplit',description: 'Возвращает подстроку #a из разделения строки c подстрокой b'
				},
				{
					text: 'replace ( ) with ( ) of ( )',opcode: 'replaceSubstring',description: 'Заменяет все вхождения подстроки a на подстроку b в строке c'
				},
				{
					text: 'count ( ) of ( )',opcode: 'countSubstrings',description: 'Возвращает количество подстрок a в строке b'
				},
				{
					text: 'index ( ) of ( )',opcode: 'indexOfSubstring',description: 'Возвращает индекс первого вхождения подстроки a в строку b'
				},
				
				/*
					Работа с переменными
				*/
				/*{
					text: 'var()',
					opcode: 'getVar',
					notVarValue: true, //Не находить значение переменной
					description: 'Получить значение переменной',
				},*/
				{
					text: '()=()',
					opcode: 'setVar',
					notVarValue: true,
					description: 'Задать значение для переменной',
				},
				{
					text: '()+=()',
					opcode: 'summVar',
					notVarValue: true,
					description: 'Добавить значение для переменной',
				},
				{
					text: '()-=()',
					opcode: 'subtractVar',
					notVarValue: true,
					description: 'Убавить значение для переменной',
				},
				{
					text: '()*=()',
					opcode: 'multiplyVar',
					notVarValue: true,
					description: 'Умножить значение для переменной',
				},
				{
					text: '()/=()',
					opcode: 'divideVar',
					notVarValue: true,
					description: 'Разделить значение для переменной',
				},
				{
					text: '()^=()',
					opcode: 'powerVar',
					notVarValue: true,
					description: 'Разделить значение для переменной',
				},
			]
		}
	}
	
	/*
		Функции модуля
	*/
	
	//Циклы
	
	//TODO: добавить return
	returnFunc(args){
		returnValue++;
		return args[0];
	};
	rys(args){	
		let result;
		let commandReturnValue = returnValue;
		let commandsArray = args[0];
		return startNewCommandsArray(commandsArray,commandReturnValue);
	};
	repeatFunc(args){
		//console.log (`repeat args: `);
		//console.log (args);
		let repeatNum = newParser(args[0]);
		let result;
		let commandReturnValue = returnValue;
		let commandsArray = (args[1]);
		for (let i = 0; i < repeatNum; i++){
			result = startNewCommandsArray(commandsArray,commandReturnValue);
			if (returnValue!=commandReturnValue) {
				returnValue--;
				break;
			}
		};
		return result;
	}
	ifFunc(args){
		//console.log(args);
		if (newParser(args[0])===1) {
			let result;
			let commandsArray = args[1];
			let commandReturnValue = returnValue;
			return startNewCommandsArray(commandsArray,commandReturnValue);
		}
	};
	ifElseFunc(args){
		let result;
		let commandReturnValue = returnValue;
		let commandsArray
		if (newParser(args[0])===1) {
			commandsArray = args[1];
		} else {
			commandsArray = args[2];
		}	
		return startNewCommandsArray(commandsArray,commandReturnValue);
	};
	
	/*
		Математические выражения
	*/
	add(args) {
		return args[0] + args[1];
	};
	subtract(args) {
		return args[0] - args[1];
	};
	multiply(args) {
		return args[0] * args[1];
	};
	divide(args) {
		if (args[1] === 0) {
			throw new Error("Деление на ноль");
		}
		return args[0] / args[1];
	};
	power(args){
        return args[0] ** args[1];
	};
	//Более сложные
	round(args) {
		return Math.round(args[0]);
	};
	abs(args) {
		return Math.abs(args[0]);
	};
	floor(args) {
		return Math.floor(args[0]);
	};
	sqrt(args) {
		return Math.sqrt(args[0]);
	};
	ceiling(args) {
		return Math.ceil(args[0]);
	};
	cos(args) {
		return Math.cos(args[0]);
	};
	sin(args) {
		return Math.sin(args[0]);
	};
	tan(args) {
		return Math.tan(args[0]);
	};
	asin(args) {
		return Math.asin(args[0]);
	};
	acos(args) {
		return Math.acos(args[0]);
	};
	atan(args) {
		return Math.atan(args[0]);
	};
	ln(args) {
		return Math.log(args[0]);
	};
	exp(args) {
		return Math.exp(args[0]);
	};
	log10(args) {
		return Math.log10(args[0]);
	};
	random(args) { //TODO!: Сделать округление до целого числа
		return Math.random() * (args[0] - 0) + 0; // Генерация случайного числа от 0 до args[0]
	};
	trunc(args) {
		return Math.trunc(args[0]);
	};
	ModFunc(args){
		return (args[0]%args[1]);
	};
	TruncWithDigits(args) {
		let n = Math.floor(cast.toNumber(args[1]));
		if (n >= 1) {
			n = 10 ** n;
			if (n !== Infinity) {
				return Math.trunc(cast.toNumber(args[0]) * n) / n;
			}
			return cast.toNumber(args[0]);
		}
		return Math.trunc(cast.toNumber(args[0]));
	};
	
	/*
		Условные выражения
	*/
	More(args) {
		return (args[0]>args[1]?1:0); 
	};
	Less(args) {
		return (args[0]<args[1]?1:0); 
	};
	Equal(args){
		return(args[0]==args[1]?1:0);
	};
	NotEqual(args) {
		return(args[0]!=args[1]?1:0);
	};
	MoreOrEqual(args) {
		return (args[0]>=args[1]?1:0); 
	};
	LessOrEqual(args) {
		return (args[0]<=args[1]?1:0); 
	};
	NotFunc(args) {
		return args[0] == 1? 0:1;	
	};
	and_block(args) {
		return(args[0]&&args[1]?1:0);
	};
	or_block(args) {
		return(args[0]||args[1]?1:0);
	};

	nand_block(args) {
		return (!(cast.toBoolean(args[0]) && cast.toBoolean(args[1]))?1:0);
    };

	nor_block(args) {
		return (!(cast.toBoolean(args[0]) || cast.toBoolean(args[1]))?1:0);
    };

    xor_block(args) {
		return (cast.toBoolean(args[0]) !== cast.toBoolean(args[1])?1:0);
    };

    xnor_block(args) {
		return (cast.toBoolean(args[0]) === cast.toBoolean(args[1])?1:0);
    };
	containsSubstring(args) {
        return (args[0]).toString().includes(args[1].toString()) ? 1 : 0;
    };
	isVar(args){
		//console.log(args);
		//console.log (variablesDict);
		//console.log (args[0]);
		return (variablesMap.has(args[0])?1:0);
	};

//opcode: 'inFunc', //Новый блок

	/*
		Работа со строками
	*/
	joinStrings(args) {
        return args[0].toString() + args[1].toString();
    };
	length(args) {
		return String(args[0]).length; // Преобразует в строку и возвращает длину
	};
	convertToLowercase(args) {
        return args[0].toString().toLowerCase();
    };
    convertToUppercase(args) {
        return args[0].toString().toUpperCase();
    };
	getCharacterAtIndex(args) {
        if (args[0] < 0 || args[0] >= args[1].toString().length) {
            throw new Error("Index out of bounds");
        }
        return args[1].toString().charAt(args[0]);
    };
	getSubstringFromRange(args) {
        if (args[0] < 0 || args[1] >= args[2].length || args[0] > args[1] ) {
            throw new Error("Invalid range");
        }
        return args[2].substring(args[0], args[1] + 1);
    };
	getItemFromSplit(args) {
        const parts = args[2].split(args[1]);
        if (args[0] < 0 || args[0] >= parts.length) {
            throw new Error("Index out of bounds");
        }
        return parts[args[0]];
    };
	replaceSubstring(args) {
        return args[2].split(args[0]).join(args[1]);
    };
	countSubstrings(args) {
        if (!args[0]) {
            throw new Error("Empty substring provided");
        }
        return args[1].toString().split(args[0].toString()).length - 1;
    };
    indexOfSubstring(args) {
        return args[1].toString().indexOf(args[0].toString());
    };

	/*
		Работа с переменными
	*/
	getVar(args){
		getVarValue(args[0]);
	};
	setVar(args){
		return setVarValue(args[0],args[1]);
	};
	summVar(args){
		//console.log(args);
		return setVarValue(args[0],getVarValue(args[0])+args[1]);
	};
	subtractVar(args){
		return setVarValue(args[0],getVarValue(args[0])-args[1]);
	};
	multiplyVar(args){
		return setVarValue(args[0],getVarValue(args[0])*args[1]);
	};
	divideVar(args){
		return setVarValue(args[0],getVarValue(args[0])/args[1]);
	};
	powerVar(args){
		return setVarValue(args[0],getVarValue(args[0])**args[1]);
	};
}
ext.register(baseModule);

/*
class PenModule {
    constructor(canvasId, radiusColorDict = null) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.setRadiusColorDict(radiusColorDict);
    }
  
    setRadiusColorDict(radiusColorDict) {
        const defaultRadiusColorDict = [
          ['radius', 20],
          ['colorFill', 'red'],
          ['colorOutline', 'black'],
          ['widthOutline', 6]
        ];
      
        this.radiusColorMap = new Map(defaultRadiusColorDict);
      
        if (radiusColorDict) {
          for (const [key, value] of radiusColorDict) {
            this.radiusColorMap.set(key, value);
          }
        }
      
        // If any key is missing from radiusColorDict, set its default value
        for (const [key, value] of defaultRadiusColorDict) {
          if (!this.radiusColorMap.has(key)) {
            this.radiusColorMap.set(key, value);
          }
        }
    }
  
    applyDefaultCanvasSize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createCanvas(width = window.innerWidth, height = window.innerHeight) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      document.body.appendChild(this.canvas);
    }
  
    deleteCanvas() {
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  
    drawShape(shapeFunction, x, y, fill = false, outline = true) {
      this.applyDefaultCanvasSize();
      const radius = this.radiusColorMap.get('radius');
      const colorFill = this.radiusColorMap.get('colorFill');
      const colorOutline = this.radiusColorMap.get('colorOutline');
      const widthOutline = this.radiusColorMap.get('widthOutline');
  
      this.ctx.save();
      this.ctx.beginPath();
      shapeFunction.call(this, x, y, radius);
      if (fill && !outline) {
        this.ctx.fillStyle = colorFill;
        this.ctx.fill();
      } else if (!fill && outline){
        this.ctx.lineWidth = widthOutline;
        this.ctx.strokeStyle = colorOutline;
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = colorFill;
        this.ctx.lineWidth = widthOutline;
        this.ctx.strokeStyle = colorOutline;
        this.ctx.fill();
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
  
    drawPoint(pointX, pointY) {
      this.drawShape(this.drawArc, pointX, pointY, true, false);
    }
  
    drawCircle(circleX, circleY, fill = false) {
      this.drawShape(this.drawArc, circleX, circleY, fill);
    }
  
    drawSemiCircle(semiCircleX, semiCircleY, fill = false) {
      this.drawShape(this.drawSemiArc, semiCircleX, semiCircleY, fill);
    }
  
    drawLine(startX, startY, endX, endY) {
      this.applyDefaultCanvasSize();
      const color = this.radiusColorMap.get('colorFill');
      const widthOutline = this.radiusColorMap.get('widthOutline');
      const centerStartX = startX + this.canvas.width / 2;
      const centerStartY = startY + this.canvas.height / 2;
      const centerEndX = endX + this.canvas.width / 2;
      const centerEndY = -1 * endY + this.canvas.height / 2;
  
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(centerStartX, centerStartY);
      this.ctx.lineTo(centerEndX, centerEndY);
      this.ctx.lineWidth = widthOutline;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
      this.ctx.restore();
    }
  
    drawSquare(squareX, squareY, size = 100, fill = false) {
      this.applyDefaultCanvasSize();
      const centerX = squareX + this.canvas.width / 2 + size / 2 * -1;
      const centerY = squareY + this.canvas.height / 2 + size / 2 * -1;
      const color = fill ? this.radiusColorMap.get('colorFill') : this.radiusColorMap.get('colorOutline');
  
      this.ctx.save();
      this.ctx.beginPath();
      if (fill) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(centerX, centerY, size, size);
      } else {
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(centerX, centerY, size, size);
      }
      this.ctx.restore();
    }
  
    drawArc(x, y, radius) {
      const centerX = x + this.canvas.width / 2;
      const centerY = y + this.canvas.height / 2;
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    }
  
    drawSemiArc(x, y, radius) {
      const centerX = x + this.canvas.width / 2;
      const centerY = y + this.canvas.height / 2;
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI, false);
    }
    
    getInfo() {
        return {
          id: 'PenModule',
          name: 'Pen Module',
          description: 'Provides methods to draw shapes on canvas.',
          blocks: [
            {
              text: 'Draw Point at x: [ ] y: [ ]',
              opcode: 'drawPoint',
              description: 'Draws a point on the canvas.'
            },
            {
              text: 'Draw Circle at x: [ ] y: [ ]',
              opcode: 'drawCircle',
              description: 'Draws a circle on the canvas.'
            },
            {
              text: 'Draw Semi-Circle at x: [ ] y: [ ]',
              opcode: 'drawSemiCircle',
              description: 'Draws a semi-circle on the canvas.'
            },
            {
              text: 'Draw Line from (x1: [ ] y1: [ ]) to (x2: [ ] y2: [ ])',
              opcode: 'drawLine',
              description: 'Draws a line on the canvas.'
            },
            {
              text: 'Draw Square at x: [ ] y: [ ] size: [ ]',
              opcode: 'drawSquare',
              description: 'Draws a square on the canvas.'
            },
            {
              text: 'Create Canvas with width: [ ] height: [ ]',
              opcode: 'createCanvas',
              description: 'Creates a new canvas with specified width and height.'
            },
            {
              text: 'Delete Canvas',
              opcode: 'deleteCanvas',
              description: 'Deletes the canvas from the DOM.'
            },
            {
              text: 'Clear Canvas',
              opcode: 'clearCanvas',
              description: 'Clears all drawings on the canvas.'
            }
          ]
        };
    }    
  }
ext.register(PenModule);*/

/*End Modules*/	

//const editTextElement = document.getElementById('editText');
const submitButton = document.getElementById('submitButton');
const outputElement = document.getElementById('output');
const editTextElement = document.querySelector('textarea');

var keys = new Map();
//document.body.innerHTML = "Keys currently pressed: "
/*window.addEventListener("keydown",
    function(e){
        keys.set(e.keyCode,e.key);
        var keysArray = getNumberArray(keys);
        //document.body.innerHTML = "Keys currently pressed:" + keysArray;keysArray;
		//console.log(keys);
		keys.delete(e.keyCode);
        
		
        if(keysArray.toString() == "17,65"){
            document.body.innerHTML += " Select all!"
        }
		
    },
false);*/


/*window.addEventListener('keyup',
    function(e){
        keys.delete(e.keyCode);
        //document.body.innerHTML = "Keys currently pressed: " + getNumberArray(keys);
    },
false);


function getNumberArray(arr){
    var newArr = new Array();
    for(var i = 0; i < arr.length; i++){
        if(typeof arr[i] == "number"){
            newArr[newArr.length] = arr[i];
        }
    }
    return newArr;
}*/

//При нажатии кнопки "submitButton"
submitButton.addEventListener('click', function() { 
	const startTime = Date.now();
	const editTextValue = editTextElement.value;
	// Пример использования
	//let textVar = openBrackets(editTextElement.value).text;
	//let args = openBrackets(editTextElement.value).args;
	const result2 = newParser(openAllBrackets(editTextElement.value));//parser(editTextElement.value);
	
	const endTime = Date.now();
	const executionTime = endTime - startTime;
	myFunction(`${result2}\n\nRunning Time: ${executionTime}`);
});

//Вывод значения в "output"
function myFunction(text) {
    // Ваш код, использующий текст из editText
    outputElement.innerHTML = 'Program returned: ' + text  ;
}