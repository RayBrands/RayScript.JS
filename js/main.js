//Работа с переменными
/*

*/
const variablesDict = {}; // Хранение переменных проекта в словаре (Почему нет)

//справочник(-функция) для работы с переменными
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
			* args: Массив аргументов, которые находились внутри скобок + возможен массив из команд внутри {}
			
*/
function openBrackets(_text) {
	let result = {
		text: "",
		args: [],
	};

	let argsBracketCount = 0; //Кол-во скобок для аргументов
	let bracketArg = "";
	let skipArgBracketSymbol=1;
	let bracketCommand = "";
	let commandBracketCount = 0;
	let skipCommandBracketSymbol = 1;
	let commandArray = [];
	let firstBracketType = ""; //Определяет какой тип скобок появилась первой
	
	let argCharDict = {
		  "(": 1,
		  "[": 1,
		  ")": -1,
		  "]": -1,
	};
		
	let commandCharDict = {
	  "{": 1,
	  "}": -1,
	};
	
	for (let i = 0; i < _text.length; i++) {
		const char = _text[i];
		
		argsBracketCount += char in argCharDict ? argCharDict[char] : 0;
		commandBracketCount += char in commandCharDict ? commandCharDict[char] : 0;
		
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
							if (bracketCommand.trim() != ''){
								commandArray.push(bracketCommand.trim());
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
					if (bracketCommand.trim() != ''){
								commandArray.push(bracketCommand.trim());
					}
					result.args.push(commandArray);
					commandArray = [];
					firstBracketType = ""
				}
				break;
			//Скобок нет
			default:
				result.text += char;
		}
	};
	result.text.trim();
	return result;
};







function returnReq(req) {return (req)?1:0}; //Нужно для численного значения булевого типа данных

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
        this.commands.set(openBrackets(key).text.toLowerCase(), {
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
var ext = new extensions(); //Инициализация дополнений

function parser(_text) {
	/*
	TODO:
	1)Сделать поддержку переменных
	*/
	//console.log ('parser text = ', _text);
	let bracketsText = openBrackets(_text).text, bracketsArgs = openBrackets(_text).args;
	function hasNestedArray(array) { //Проверка того, что в массиве нет массива
	  return array.some(element => element instanceof Array);
	}
	let funcVar = ext.commands.get(bracketsText.replace(/ /g, "").toLowerCase());
	//console.log(bracketsText);
	if (!isNaN(bracketsText)){
		return parseFloat(bracketsText);
	} else if (typeof funcVar !== 'undefined') {
		if (!hasNestedArray(bracketsArgs)){
			for (let i = 0; i < bracketsArgs.length; i++) {
				bracketsArgs[i] = parser(bracketsArgs[i]);
			}
		}
		//console.log(callFunction(funcVar.func,bracketsArgs));
		return callFunction(funcVar.func,bracketsArgs);
		//let func = 
	};
	return bracketsText==""?"0f".toString():bracketsText;
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

/*Start Base Modules*/
class baseModule{
	getInfo() {
		return {
			id: 'baseBlocks',
			name: 'Базовые блоки',
			//color: '#ff0000', // pure red
			//docsURI: 'https://ya.ru', //Документация к модулю
			description: 'Описание модуля', //Описание модуля
			blocks: [
				{
					text: 'rys',
					opcode: 'rys',
					//type: 'reporter',
					description: 'Выполнение основного кода',
				},
				{
					text: '+',
					opcode: 'summ',
					//type: 'reporter',
					description: 'сумма a и b',
				},
			]
		}
	}
	/*Функции модуля*/
	rys(args){
		//console.log("Вызвана rys");
		//console.log(args);
		if (!Array.isArray(args)) {
			throw new TypeError("Argument must be an array");
		}
		let commandsArray = args[0];
		console.log("rys module commands:" + commandsArray);
		// Перебор элементов массива и вывод их в консоль
		let result;
		for (const commands of commandsArray) {
			
			console.log('rys module: ' + commands);
			result = parser(commands);
		}
		return result;
	}
	summ(args){
		return args[0]+args[1];
	}
}
ext.register(baseModule);

class Base {
	getInfo() {
		return {
			id: 'Base', //Название класса, возможно нахуй не понадобится это
			name: 'Base Operations', //Название модуля
			//color: '#ff0000', // pure red
			//docsURI: 'https://ya.ru', //Документация к модулю
			description: 'Basic functions for operation', //Описание модуля
			blocks: [
				  {
					text: '( ) + ( )',
					opcode: 'add',
					description: 'Возвращает сумму двух чисел'
				  },
				  {
					text: '( ) - ( )',
					opcode: 'subtract',
					description: 'Возвращает разность двух чисел'
				  },
				  {
					text: '( ) * ( )',
					opcode: 'multiply',
					description: 'Возвращает произведение двух чисел'
				  },
				  {
					text: '( ) / ( )',
					opcode: 'divide',
					description: 'Возвращает частное двух чисел'
				  },
				  {
					text: 'length of ( )',
					opcode: 'length',
					description: 'Возвращает длину строки или количество цифр в числе'
				  },
				  {
					text: 'round ( )',
					opcode: 'round',
					description: 'Округляет число до ближайшего целого'
				  },
				  {
					text: 'abs ( )',
					opcode: 'abs',
					description: 'Возвращает абсолютное значение числа'
				  },
				  {
					text: 'floor ( )',
					opcode: 'floor',
					description: 'Округляет число в меньшую сторону'
				  },
				  {
					text: 'sqrt ( )',
					opcode: 'sqrt',
					description: 'Возвращает квадратный корень числа'
				  },
				  {
					text: 'ceil ( )',
					opcode: 'ceil',
					description: 'Округляет число в большую сторону'
				  },
				  {
					text: 'cos ( )',
					opcode: 'cos',
					description: 'Возвращает косинус угла в радианах'
				  },
				  {
					text: 'sin ( )',
					opcode: 'sin',
					description: 'Возвращает синус угла в радианах'
				  },
				  {
					text: 'tan ( )',
					opcode: 'tan',
					description: 'Возвращает тангенс угла в радианах'
				  },
				  {
					text: 'asin ( )',
					opcode: 'asin',
					description: 'Возвращает арксинус числа'
				  },
				  {
					text: 'acos ( )',
					opcode: 'acos',
					description: 'Возвращает арккосинус числа'
				  },
				  {
					text: 'atan ( )',
					opcode: 'atan',
					description: 'Возвращает арктангенс числа'
				  },
				  {
					text: 'ln ( )',
					opcode: 'ln',
					description: 'Возвращает натуральный логарифм числа'
				  },
				  {
					text: 'e^ ( )',
					opcode: 'exp',
					description: 'Возводит число e в степень аргумента'
				  },
				  {
					text: 'log ( )',
					opcode: 'log',
					description: 'Возвращает десятичный логарифм числа'
				  },
				  {
					text: 'random up to ( )',
					opcode: 'random',
					description: 'Генерирует случайное число от 0 до указанного значения'
				  },
				  {
					text: 'trunc ( )',
					opcode: 'trunc',
					description: 'Отбрасывает дробную часть числа, оставляя целую'
				  },
				  {
					text: 'ln ( )',
					opcode: 'ln',
					description: 'Возвращает натуральный логарифм числа (основание e)'
				  },
				  {
					text: 'e^ ( )',
					opcode: 'exp',
					description: 'Возводит число e в степень аргумента, e^a'
				  },
				  {
					text: 'log ( )',
					opcode: 'log10',
					description: 'Возвращает десятичный логарифм числа (основание 10)'
				  },
				  {
					text: '() pow ()',
					opcode: 'power',
					description: 'Возводит число a в степень b'
				  },
				  {
					text: 'random up to ( )',
					opcode: 'random',
					description: 'Генерирует случайное число от 0 до a (не включая a)'
				  },
				  {
					text: 'trunc ( )',
					opcode: 'trunc',
					description: 'Отбрасывает дробную часть числа, оставляя только целую часть'
				  }
			],
		};
	};
	
        // Арифметические операции
        add(args) {
          return args[0] + args[1];
        }
        subtract(args) {
          return args[0] - args[1];
        }
        multiply(args) {
          return args[0] * args[1];
        }
        divide(args) {
          if (args[1] === 0) {
            throw new Error("Деление на ноль");
          }
          return args[0] / args[1];
        }
		power(args) {
          return args[0] ** args[1];
        }
      
        // Функции округления
        floor(args) {
          return Math.floor(args[0]);
        }
        ceil(args) {
          return Math.ceil(args[0]);
        }
        round(args) {
          return Math.round(args[0]);
        }
        trunc(args) {
          return Math.trunc(args[0]);
        }
      
        // Тригонометрические функции
        sin(args) {
          return Math.sin(args[0]);
        }
        cos(args) {
          return Math.cos(args[0]);
        }
        tan(args) {
          return Math.tan(args[0]);
        }
        asin(args) {
          return Math.asin(args[0]);
        }
        acos(args) {
          return Math.acos(args[0]);
        }
        atan(args) {
          return Math.atan(args[0]);
        }
      
        // Логарифмические и экспоненциальные функции
        ln(args) {
          return Math.log(args[0]);
        }
        exp(args) {
          return Math.exp(args[0]);
        }
        log10(args) {
          return Math.log10(args[0]);
        }
      
        // Возведение в степень и корень
        sqrt(args) {
          return Math.sqrt(args[0]);
        }
        pow(args) {
          return Math.pow(args[0], args[1]);
        }
      
        // Другие математические функции
        abs(args) {
          return Math.abs(args[0]);
        }
        random(args) {
          return Math.random() * (args[0] - 0) + 0; // Генерация случайного числа от 0 до args[0]
        }
      
        // Дополнительная функция для демонстрации обработки строк
        length(args) {
          return String(args[0]).length; // Преобразует в строку и возвращает длину
        }
};
ext.register(Base);

//TODO: Переписать данные модули из-за другой работы функции вызова команд и передачи в них аргументов
class StringsExt {
    static extInfo = {
        id: "StringsExt",
        name: "Strings Operations",
        description: "Strings functions for operation",
    };

    static blocksInfo = [
        {
            text: '( ) join ( )',
            opcode: 'joinStrings',
            description: 'Возвращает конкатенацию строк a и b'
        },
        {
            text: '( ) contains ( )',
            opcode: 'containsSubstring',
            description: 'Проверяет, содержит ли строка a подстроку b'
        },
        {
            text: 'lower ( )',
            opcode: 'convertToLowercase',
            description: 'Преобразует строку a в нижний регистр'
        },
        {
            text: 'upper ( )',
            opcode: 'convertToUppercase',
            description: 'Преобразует строку a в верхний регистр'
        },
        {
            text: 'letter ( ) of ( )',
            opcode: 'getCharacterAtIndex',
            description: 'Возвращает символ строки b по индексу a'
        },
        {
            text: 'count ( ) of ( )',
            opcode: 'countSubstrings',
            description: 'Возвращает количество подстрок a в строке b'
        },
        {
            text: 'index ( ) of ( )',
            opcode: 'indexOfSubstring',
            description: 'Возвращает индекс первого вхождения подстроки a в строку b'
        },
        {
            text: 'letters ( ) to ( ) of ( )',
            opcode: 'getSubstringFromRange',
            description: 'Возвращает подстроку c с индексами из диапазона [a..b]'
        },
        {
            text: 'item ( ) split by ( ) of ( )',
            opcode: 'getItemFromSplit',
            description: 'Возвращает подстроку #a из разделения строки c подстрокой b'
        },
        {
            text: 'replace ( ) with ( ) of ( )',
            opcode: 'replaceSubstring',
            description: 'Заменяет все вхождения подстроки a на подстроку b в строке c'
        }
    ];

    getInfo() {
        return {
            ...StringsExt.extInfo,
            blocks: [...StringsExt.blocksInfo],
        };
    }

    joinStrings(firstString, secondString) {
        return firstString.toString() + secondString.toString();
    }

    containsSubstring(mainString, subString) {
        return mainString.includes(subString) ? 1 : 0;
    }

    convertToLowercase(inputString="") {
        return inputString.toString().toLowerCase();
    }

    convertToUppercase(inputString) {
        return inputString.toString().toUpperCase();
    }

    getCharacterAtIndex(index, inputString) {
        if (index < 0 || index >= inputString.toString().length) {
            throw new Error("Index out of bounds");
        }
        return inputString.toString().charAt(index);
    }

    countSubstrings(substring, mainString) {
        if (!substring) {
            throw new Error("Empty substring provided");
        }
        return mainString.toString().split(substring.toString()).length - 1;
    }

    indexOfSubstring(substring, mainString) {
        return mainString.toString().indexOf(substring.toString());
    }

    getSubstringFromRange(startIndex, endIndex, inputString) {
        if (startIndex < 0 || endIndex >= inputString.length || startIndex > endIndex) {
            throw new Error("Invalid range");
        }
        return inputString.substring(startIndex, endIndex + 1);
    }

    getItemFromSplit(index, separator, inputString) {
        const parts = inputString.split(separator);
        if (index < 0 || index >= parts.length) {
            throw new Error("Index out of bounds");
        }
        return parts[index];
    }

    replaceSubstring(oldSubstring, newSubstring, inputString) {
        return inputString.split(oldSubstring).join(newSubstring);
    }

}
ext.register(StringsExt);

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
ext.register(PenModule);

class moduleReq {
	getInfo() {
		return {
			id: 'moduleReq', //Название класса, возможно нахуй не понадобится это
			name: 'Req operations', //Название модуля
			//color: '#ff0000', // pure red
			//docsURI: 'https://ya.ru', //Документация к модулю
			description: 'Basic functions for operation', //Описание модуля
			blocks: [
				{
					text: 'not ()',
					opcode: 'NotFunc',
					//type: 'reporter', //Пока все блоки имеют reporter для IDE
					description: '!(req)'
				},
				{
					text: '!()',
					opcode: 'NotFunc',
					//type: 'reporter', //Пока все блоки имеют reporter для IDE
					description: '!(req)'
				},
					{
					text: 'mod ( ) of ( )',
					opcode: 'ModFunc',
					//type: 'reporter',
					description: 'Сравнение ONE с TWO',
				},
				{
					text: 'trunc with digits ( ) of ( )',
					opcode: 'TruncWithDigits',
					//type: 'reporter',
					description: 'Округление числа до знака запятой'
				},
				{
					text: '( ) < ( )',
					opcode: 'Less',
					//type: 'reporter',
					description: '(a) меньше (b)?'
				},
				{
					text: '( ) > ( )',
					opcode: 'More',
					//type: 'reporter',
					description: '(a) больше (b)?'
				},
				{
					text: '( ) == ( )',
					opcode: 'Equal',
					//type: 'reporter',
					description: '(a) равно (b)?'
				},
				{
					text: '( ) != ( )',
					opcode: 'NotEqual',
					//type: 'reporter',
					description: '(a) не равно (b)?'
				},
				{
					text: '( ) <> ( )',
					opcode: 'NotEqual',
					//type: 'reporter',
					description: '(a) не равно (b)?'
				},
				{
					text: '( ) >< ( )',
					opcode: 'NotEqual',
					//type: 'reporter',
					description: '(a) не равно (b)?'
				},
				{
					text: '( ) <= ( )',
					opcode: 'LessOrEqual',
					//type: 'reporter',
					description: '(a) нменьше или  равно (b)?'
				},
				{
					text: '( ) >= ( )',
					opcode: 'MorOrEqual',
					//type: 'reporter',
					description: '(a) больше или равно (b)?'
				},
				{
					text: '( ) and ( )',
					opcode: 'and_block',
					//type: 'reporter',
					description: '(a) и (b) верно?'
				},
				{
					text: '( ) or ( )',
					opcode: 'or_block',
					//type: 'reporter',
					description: '(a) или (b) верно?'
				},
				{
					text: '( ) nand ( )',
					opcode: 'nand_block',
					//type: 'reporter',
					description: '!((a) и (b) верно?)'
				},
				{
					text: '( ) nor ( )',
					opcode: 'nor_block',
					//type: 'reporter',
					description: '!((a) или (b) верно?)'
				},
				{
					text: '( ) xor ( )',
					opcode: 'xor_block',
					//type: 'reporter',
					description: '(a)  не равно (b)?'
				},
				{
					text: '( ) xnor ( )',
					opcode: 'xnor_block',
					//type: 'reporter',
					description: '(a) равно (b)?'
				},
				{
					text: '( ) indetical ( )',
					opcode: 'Equal',
					//type: 'reporter',
					description: '(a) равно (b)?'
				},
				


			]
		};
	}
	/*
	Функции модуля
	*/
	
	NotFunc(a) {
		//a = 1 или 0;
		if (a == 1){
			return 0;	
		};
		return 1;	
	};
	
	ModFunc(a,b){
		return (b%a); //mod (a) of (b) 
	};

	TruncWithDigits(a,b) {
		  let n = Math.floor(cast.toNumber(b));
		  if (n >= 1) {
			n = 10 ** n;
			if (n !== Infinity) {
			  return Math.trunc(cast.toNumber(a) * n) / n;
			}
			return cast.toNumber(a);
		  }
		  return Math.trunc(cast.toNumber(a));
	};
	
	Less(a,b) {
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return (a<b?1:0); 
	};

	More(a,b) {
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return (a>b?1:0); 
	};
	
	Equal(a,b){
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return(a==b?1:0);
	};

	NotEqual(a,b) {
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return(a!=b?1:0);
	};

	LessOrEqual(a,b) {
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return (a<=b?1:0); 
	};

	MoreOrEqual(a,b) {
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return (a>=b?1:0); 
	};

	and_block(a,b) {
		//a,b = 1 или 0;
		return(a&&b?1:0);
	};

	or_block(a,b) {
		//a,b = 1 или 0;
		return(a||b?1:0);
	};

	nand_block( a, b ) {
      return (!(cast.toBoolean(a) && cast.toBoolean(b))?1:0);
    };

	nor_block(	a, b ) {
      return (!(cast.toBoolean(a) || cast.toBoolean(b))?1:0);

    };

    xor_block( a, b ) {
      return (cast.toBoolean(a) !== cast.toBoolean(b)?1:0);
    };

    xnor_block( a, b ) {
      return (cast.toBoolean(a) === cast.toBoolean(b)?1:0);
    };
};
ext.register(moduleReq);//Регистрация нового модуля "Base"
/*End Modules*/	

//const editTextElement = document.getElementById('editText');
const submitButton = document.getElementById('submitButton');
const outputElement = document.getElementById('output');
const editTextElement = document.querySelector('textarea');

var keys = new Map();
//document.body.innerHTML = "Keys currently pressed: "
window.addEventListener("keydown",
    function(e){
        keys.set(e.keyCode,e.key);
        var keysArray = getNumberArray(keys);
        //document.body.innerHTML = "Keys currently pressed:" + keysArray;
		console.log(keys);
		keys.delete(e.keyCode);
        
		
        if(keysArray.toString() == "17,65"){
            document.body.innerHTML += " Select all!"
        }
		
    },
false);


window.addEventListener('keyup',
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
}

//При нажатии кнопки "submitButton"
submitButton.addEventListener('click', function() { 
	const editTextValue = editTextElement.value;
	// Пример использования
	//let textVar = openBrackets(editTextElement.value).text;
	//let args = openBrackets(editTextElement.value).args;
	const result2 = parser(editTextElement.value);
	myFunction(`${result2}`);
});

//Вывод значения в "output"
function myFunction(text) {
    // Ваш код, использующий текст из editText
    outputElement.innerHTML = 'Program returned: ' + text;
}

const inputText = "(9)+((1)+(1))";
const result = openBrackets(inputText);
variablesDict["var"]=42;
console.log(variablesDict["var"]);
const abc = {"a":123};
abc["b"]=45;

console.log(result);
console.log("Значения в parser:", parser(result.text,result.args));


