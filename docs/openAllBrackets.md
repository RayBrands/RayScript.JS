# openAllBrackets(_text)
Функция openAllBrackets (155 строк)
TODO: сделать работу с [массивами]
 
 ----
 
 **args:**
	`_text` -> текст кода RayScript

**functions:**

| Функция  | Описание |
|-|-|
|`openCommandBracket(_text)`|Cоздаёт массив из комманд внутри {} скобок|
|`openTypeBrackets(_text, _charOpenBracket, _charClosedBracket)`|Раскрывает скобки (_charOpenBracket, _charClosedBracket), возвращает весь текст внутри скобок, иначе предупреждает о том, что текст не в скобках (предупреждение)|
|`сaseArgBracket()`|Вставляет значение  аргумента в массив аргументов result.args|
|`caseCommandBracket()`|Вставляет значение массива команд в массив команд result.commands |
|` getType():`|Возвращает тип открытых скобок (funcCommands, func, str, float). Удаляет ненужные return значения (args, commands, text) |

 **return:**
	`type`  		-> тип данных открытых скобок (funcCommands, func, str, float)
	`text?`  		-> текст строки/команды
	`args?`  		-> массив из аргументов
	`commands?` 	-> массив из массива команд
	`value?` 		-> float значение text