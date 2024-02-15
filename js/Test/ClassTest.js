//Class test
class HelloWorld {
  getInfo() {
    return {
      id: 'helloworld',
      name: 'It works!',
      blocks: [
        {
          opcode: 'hello',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Hello!'
        }
      ]
    };
  }

  hello() {
    return 'World!';
  }
}

Scratch.extensions.register(new HelloWorld());


"class TurboMode {
  getInfo() {
   return {
    id: 'TurboMode',
    name: 'Turbo Mode',
    blocks: [
     {
      opcode: 'set',
      text: 'set turbo mode to [ENABLED]',
      arguments: {
       ENABLED: {
        type: Scratch.ArgumentType.STRING,
        menu: 'ENABLED_MENU'
       }
      }
     }
    ],
    menus: {
     ENABLED_MENU: {
      items: ['on', 'off']
     }
    }
   };
  }
  set(args) {
   console.log("class work" + args.ENABLED);
  }
 }
extensions.register(new TurboMode());"
При этом id самого класса нужен для того, чтобы можно было вызвать функцию id.opcode(args) и передать ей аргументы (в данном примере args{ENABLED=''}), также важно выделить для каждого блока класса её 
сокращённую команду, например command, которая равна тексту блока без пробелов и аргументов внутри неё. menus даёт меню который можно использовать внутри функции, поэтому стоит добавить команду для того, чтобы вывести массив из значений данного меню.