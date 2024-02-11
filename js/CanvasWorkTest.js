const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById("canvas-container");

// Функция для определения FPS
let fps = 60;
let then = Date.now();

//"Сцена" и её стандартные свойства
let stage = {
	height: 700,
	width: 200,
	scaleWidth: 1,
	scaleHeight: 1,
  scaleMode: 'scaled' //Определение "типа" отрисовки
};

//Тестовые значения
let player = {
  x: 0,
  y: 0
};
//Обновление экрана 
//TODO: Сделать оптимизацию по поводу FPS (Желательно без использования timeout)
function update() {
	
  //Определение DeltaTime
  const now = Date.now();
  const dt = (now - then) / 1000;
  then = now;

  // Очистка холста
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, stage.width, stage.height);
 
  //Тест передвижения игрока на +1 пиксель
  player.x += 1;
  // Отрисовка игрового мира
  ctx.fillStyle = 'red';
  //ctx.rotate((Math.PI / 180) * 10);
  ctx.fillRect(player.x, player.y, 50, 50);
  
  // Обновление игрового мира (логика игры)

  // Отрисовка игрового мира (графика)

  // Ограничение FPS
  setTimeout(update, 1000 / fps);
}

// Функция для изменения размера canvas в зависимости от типа прорисовки
function resizeCanvas() {
  //Сохранение буфера кадра перед изменением размера экрана (Чтобы не было фликов во время изменений размера окна)
  var tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  var tempContext = tempCanvas.getContext("2d");
  tempContext.drawImage(ctx.canvas, 0, 0);
  //Какие действия нужно сделать с основным Canvas
  //canvas.style.transform = `scale(1,2)`;
  //let scaleVar = '2';
  //canvas.style.transform = `scale(${scaleVar},2)`;
  canvas.width = stage.width;
  canvas.height = stage.height;
  //Нарисовать в новом canvas изображение старого кадра
  ctx.drawImage(tempContext.canvas, 0, 0);
  switch (stage.scaleMode) {
    case 'fixed': //Фиксированый размер Сцены, располагается по центру, имеет соотношение 1:1
      canvas.style.transform = "scale(1)";
      break;
    case 'scaled': //Фиксированный размер Сцены, растягивется на весь экран соотношение зависит от размера экрана
      //TODO: Поработать над этим, либо же удалить нахуй
      stage.scaleWidth = window.innerWidth/stage.width
      stage.scaleHeight = window.innerHeight/stage.height
      if (stage.scaleWidth < stage.scaleHeight) {
				canvas.style.transform = `scale(1,${stage.scaleHeight})`;
			} else {
				canvas.style.transform = `scale(${stage.scaleWidth},1)`;
			}
      break;
    case 'adaptive':
      stage.width = window.innerWidth;
      stage.height = window.innerHeight;
      canvas.style.transform = `scale(1)`;
      break;
    case 'adaptive+scale': //Сделать масшабирование, в зависимости от коэффециента
      break;
  };
  canvas.width = stage.width;
  canvas.height = stage.height;
}

// Функция для изменения режима отображения
function changeDisplayMode() {
  switch (stage.scaleMode) {
    case 'fixed':
      // Определённый размер
      stage.scaleMode = 'fixed';
      resizeCanvas();
      break;
    case 'scaled':
      // Масштабирование
      stage.scaleMode = 'scaled';
      resizeCanvas();
      break;
    case 'adaptive':
      // Адаптивный размер
      stage.scaleMode = 'adaptive';
      resizeCanvas();
      break;
  }
}


// Запуск игры
ctx.imageSmoothingEnabled = true;
resizeCanvas();
//changeDisplayMode();
update();

// Обработчики событий
window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (event) => {
  // Обработка нажатия клавиш
  switch (event.keyCode) {
    case 38: // Up arrow
      stage.scaleMode = 'fixed';
      changeDisplayMode();
      break;
    case 40: // Down arrow
      stage.scaleMode = 'scaled';
      changeDisplayMode();
      break;
    case 39: // Right arrow
      stage.scaleMode = 'adaptive';
      changeDisplayMode();
      break;
  }
});
