/*Modules*/
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
					opcode: 'notFunc',
					//type: 'reporter', //Пока все блоки имеют reporter для IDE
					description: '!(req)'
				},
				{
					text: 'trunc with digits ( ) of ( )',
					opcode: 'truncWithDigits',
					//type: 'reporter',
					description: 'Округление числа до знака запятой'
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
	
	notFunc(a) {
		//a = 1 или 0;
		if (a == 1){
			return 0;	
		};
		return 1;	
	};
	
	truncWithDigits(a,b) {
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