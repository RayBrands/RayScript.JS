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
    args: [],
  };

  let currentBracketValue = "";
  let roundBracketCount = 0;
  let squareBracketCount = 0;
  let curlyBracketCount = 0;
  let currentLevel = 0;

  try {
    for (let char of text) {
      if (char === "(" && squareBracketCount === 0 && curlyBracketCount === 0) {
        roundBracketCount++;
        if (currentLevel === 0) {
          currentBracketValue += char;
        }
        currentLevel++;
      } else if (char === ")" && squareBracketCount === 0 && curlyBracketCount === 0) {
        roundBracketCount--;
        currentLevel--;
        if (currentLevel === 0) {
          if (roundBracketCount > 0) {
            currentBracketValue += char;
          } else {
            if (currentBracketValue.trim() !== "") {
              result.args.push(currentBracketValue.trim());
            }
            currentBracketValue = "";
          }
        }
      } else if (char === "[" && roundBracketCount === 0 && curlyBracketCount === 0) {
        squareBracketCount++;
        if (currentLevel === 0) {
          currentBracketValue += char;
        }
        currentLevel++;
      } else if (char === "]" && roundBracketCount === 0 && curlyBracketCount === 0) {
        squareBracketCount--;
        currentLevel--;
        if (currentLevel === 0) {
          if (squareBracketCount > 0) {
            currentBracketValue += char;
          } else {
            if (currentBracketValue.trim() !== "") {
              result.args.push(currentBracketValue.trim());
            }
            currentBracketValue = "";
          }
        }
      } else if (char === "{" && roundBracketCount === 0 && squareBracketCount === 0) {
        curlyBracketCount++;
        if (currentLevel === 0) {
          // Не добавлять первую фигурную скобку
          if (char !== "{") {
            currentBracketValue += char;
          }
        }
        currentLevel++;
      } else if (char === "}" && roundBracketCount === 0 && squareBracketCount === 0) {
        curlyBracketCount--;
        currentLevel--;
        if (currentLevel === 0) {
          if (curlyBracketCount > 0) {
            currentBracketValue += char;
          } else {
            // Разделить аргументы по символу \n
            const args = currentBracketValue.trim().split(/\n/);
            for (const arg of args) {
              result.args.push(arg.trim());
            }
            currentBracketValue = "";
          }
        }
      } else if (currentLevel === 0) {
        result.text += char;
      } else {
        currentBracketValue += char;
      }
    }
  } catch (TypeError) {
    result.text = "0"; // Handle potential errors (optional)
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
//window.ext = new extensions();//Инициализация дополнений
/*Функция, которая вызывает функцию с названием text*/

var ext = new extensions(); // Объявление глобальной переменной
var globalVariable = 'Глобальная переменная';

function exampleFunction() {
    console.log(ext); // Можно использовать глобальную переменную внутри функции
}

function parser(_text) {
	let bracketsText = openBrackets(_text).text.replace(/ /g, "").toLowerCase(), bracketsArgs = openBrackets(_text).args;
	
	/*var a,b,c=0;
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
    }*/
	let funcVar = ext.commands.get(bracketsText);
	console.log(bracketsText);
	if (!isNaN(bracketsText)){
		return parseFloat(bracketsText);
	} else if (typeof funcVar !== 'undefined') {
		for (let i = 0; i < bracketsArgs.length; i++) {
			bracketsArgs[i] = parser(bracketsArgs[i]);
		}
		console.log(callFunction(funcVar.func,bracketsArgs));
		return callFunction(funcVar.func,bracketsArgs);
		//let func = 
	};
	
	return bracketsText==""?"0f".toString():bracketsText;
	
}


function callFunction(text, args) { //TODO: Сделать описание и сделать проверку функций и аргументов
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

/*Start Base Modules*/
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
	const result2 = callFunction(ext.commands.get(textVar).func,args)
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


