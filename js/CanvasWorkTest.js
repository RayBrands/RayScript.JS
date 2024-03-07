const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById("canvas-container");

// Функция для определения FPS
let fps = 6000;
let then = Date.now();

//"Сцена" и её стандартные свойства
let stage = {
	height: 300,
	width: 200,
  scaleMode: 'fixed' //Определение "типа" отрисовки
};

//Тестовые значения
let player = {
  x: 0,
  y: 0,
  xs: 1
};
//Обновление экрана 
//TODO: Сделать оптимизацию по поводу FPS (Желательно без использования timeout)
function update() {
	
  //Определение DeltaTime
  const now = Date.now();
  const dt = (now - then) / 1000;
  if (dt<(1/fps)) return setTimeout(update, (1000 / fps)-dt);
  then = now;

  // Очистка холста
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, stage.width, stage.height);
 
  //Тест передвижения игрока на +1 пиксель
  
  player.x += dt*300*player.xs;
  if (player.x+50 > stage.width){
    player.xs = -1;
    player.x = stage.width - 50;
  } else if (player.x<0) {
    player.xs = 1;
    player.x = 0;
  }
  // Отрисовка игрового мира
  ctx.fillStyle = 'red';
  //ctx.rotate((Math.PI / 180) * 10);
  for (let i = 0;i<=20;i++){
    for (let j =0; j<=20;j++){
      ctx.fillRect(player.x+(60*j), player.y+(60*i), 50, 50);  
    }
      
  }
  
  
  // Обновление игрового мира (логика игры)

  // Отрисовка игрового мира (графика)

  // Ограничение FPS
  update();
}

// Функция для изменения размера canvas в зависимости от типа прорисовки
function resizeCanvas() {
  //Сохранение буфера кадра перед изменением размера экрана (Чтобы не было фликов во время изменений размера окна)
  var tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  var tempContext = tempCanvas.getContext("2d");
  tempContext.drawImage(ctx.canvas, 0, 0);
  //Нарисовать в новом canvas изображение старого кадра
  switch (stage.scaleMode) {
    case 'fixed': //Фиксированый размер Сцены, располагается по центру, имеет соотношение 1:1
      break;
    case 'adaptive': //Windows size = stage size
      stage.width = window.innerWidth;
      stage.height = window.innerHeight;
      break;
  };
  canvas.width = stage.width;
  canvas.height = stage.height;
  ctx.drawImage(tempContext.canvas, 0, 0);
  canvas.style.transform = `scale(1)`;
}

// Функция для изменения режима отображения
function changeDisplayMode() {
  switch (stage.scaleMode) {
    case 'fixed':
      // Определённый размер
      stage.scaleMode = 'fixed';
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
ctx.imageSmoothingEnabled = false;
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
