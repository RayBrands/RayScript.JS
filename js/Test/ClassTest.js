/*Modules*/
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
					text: '[ ] of ()',
					opcode: 'operatorOf',
					//type: 'reporter', //Пока все блоки имеют reporter для IDE
					description: 'Operator "of"'
				},
				{
					text: '( ) + ( )',
					opcode: 'add',
					//type: 'reporter',
					description: 'Возвращает сумму a и b'
				},
				{
					text: '( ) < ( )',
					opcode: 'less',
					//type: 'reporter',
					description: '(a) меньше (b)?'
				},
				{
					text: 'mod ( ) of ( )',
					opcode: 'modFunc',
					//type: 'reporter',
					description: 'Сравнение ONE с TWO',
				}
			]
		};
	}
	/*
	Функции модуля
	*/
	
	operatorOf(a,b) {
		/*TODO: Реализовать оператор OF
		a - является string, название операции
		b - в основном число либо текст (Для некоторых операций нужно сделать проверку)
		*/
		const functionDictionary = {
		  length: (a, b) => ,
		  subtract: (a, b) => a - b,
		  multiply: (a, b) => a * b,
		  divide: (a, b) => a / b
		};
		return functionDictionary;
	};
	
	add(a,b) {
		//a,b уже имеют тип данных, которым и являются, но нужно всё-равно сделать проверку по типу данных
		return a+b; 
	};
	
	less(a,b) {
		//Условные операторы должны возвращать 1 или 0 вместо true и false
		return (a<b?1:0); 
	};
	//TODO: реализовать другие операторы
	
	modFunc(a,b){
		return (b%a); //mod (a) of (b) 
	}
	
	//тестовая шняга
	test(a,b) {
		console.log(a);
		console.log("next:")
		let clazz = (new HelloWorld)
		console.log(clazz.hello()); //Вызов функции внутри класса
		return (a%b);
		//return args[0] === args[1];
	};
};
//ext.register(Base);//Регистрация нового модуля "Base"