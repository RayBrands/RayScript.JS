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

function isNotClassValid(clazz) {
  return !(clazz.prototype && clazz.prototype.getInfo && typeof clazz.prototype.getInfo === 'function');
}

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
    }
    this.modules.set(info.id, moduleInfo);

    // Registration code remains the same
    // Регистрация блоков
      for (const block of info.blocks) {
        //Регистрация команд
        const key = block.text.replace(/\s/g, ''); // Ключ без пробелов
        this.commands.set(openBrackets(key).text, {
          id: info.id,
          opcode: clazz.prototype[block.opcode], //возможно стоит изменить это
          args: block.args
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

/*Modules*/
class HelloWorld {
  getInfo() {
    return {
      id: 'helloworld',
      name: 'It works!',
      color: '#ff0000', // pure red
      docsURI: 'https://ya.ru', //Документация к модулю
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
          opcode: 'strictlyEquals',
          type: 'boolean',
          text: '[ONE] strictly equals [TWO]',
          args: {
            ONE: {
              type: 'string'
            },
            TWO: {
              type: 'string',
              defaultValue: 'Second value'
            }
          }
        }
      ]
    };
  }

  hello() {
    return 'hello';
  }
  world() {
    return 'world';
  }
  strictlyEquals(args) {
    return args.ONE === args.TWO;
  }
}
ext.register(HelloWorld)


//let extensionsVar = new extensions();
console.log(ext);