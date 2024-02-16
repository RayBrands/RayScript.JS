/*Функция, которая вызывает функцию с названием text*/
function callFunctionByName(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Invalid argument: ' + text);
  }

  // **Проверка существования функции:**

  if (typeof window[text] !== 'function') {
    throw new Error('Function not found: ' + text);
  }

  // **Вызов функции:**

  return window[text]();
}

// **Пример использования:**

function hello() {
  console.log('Hello!');
}

function world() {
  console.log('World!');
}

callFunctionByName('hello'); // "Hello!"
callFunctionByName('world'); // "World!"