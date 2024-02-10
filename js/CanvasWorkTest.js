const canvas = document.getElementById('adaptiveCanvas');
const ctx = canvas.getContext('2d');

// Функция для определения FPS
let fps = 10;
let then = Date.now();

let player = {
	  x: 0,
	  y: 0
};
	
function update() {
	
  const now = Date.now();
  const dt = (now - then) / 1000;
  then = now;

  // Игровая логика
	



  // Очистка холста
  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  // Обновление игрового мира
  player.x += 1;

  // Отрисовка игрового мира
  ctx.fillStyle = 'red';
  ctx.rotate((Math.PI / 180) * 10);
  ctx.fillRect(player.x, player.y, 50, 50);
  // Обновление игрового мира (логика игры)

  // Отрисовка игрового мира (графика)

  // Ограничение FPS
  setTimeout(update, 1000 / fps);
}

// Функция для изменения размера canvas
let mode = 'fixed'; // 'fixed', 'scaled', 'adaptive'
//"Сцена"
let stage = {
	height: 100,
	width: 100,
	scaleWidth: 1,
	scaleHeight: 1
};

function resizeCanvas() {
	switch (mode) {
		case 'fixed':
			stage.scaleWidth = window.innerWidth/stage.width
			stage.scaleHeight = window.innerHeight/stage.height
			
			if (stage.scaleWidth < stage.scaleHeight) {
				canvas.width = stage.width*stage.scaleWidth;
				canvas.height = stage.height*stage.scaleWidth;
				ctx.scale(stage.scaleWidth,stage.scaleWidth);
			} else {
				canvas.width = stage.width*stage.scaleHeight;
				canvas.height = stage.height*stage.scaleHeight;
				ctx.scale(stage.scaleHeight,stage.scaleHeight);
			}
		  // Определённый размер
		  let dpr = window.devicePixelRatio;
		  ctx.imageSmoothingEnabled = false;
		  ctx.setTransform(stage.scaleHeight, 0, 0, stage.scaleHeight, 0, 0);
		  //window.innerWidth / canvas.width, window.innerHeight / canvas.height);
		  canvas.style.top = (window.innerHeight - canvas.height) / 2 + 'px';
		  canvas.style.left = (window.innerWidth - canvas.width) / 2 + 'px';
		  break;
		case 'scaled':
		  // Масштабирование
		  canvas.width = window.innerWidth;
		  canvas.height = window.innerHeight;
		  ctx.scale(1, 1);
		  break;
		case 'adaptive':
		  // Адаптивный размер
		  canvas.width = window.innerWidth;
		  canvas.height = window.innerHeight;
		  break;
	  }
}


// Функция для изменения режима отображения
function changeDisplayMode() {
  switch (mode) {
    case 'fixed':
      // Определённый размер
      mode = 'fixed';
      resizeCanvas();
      break;
    case 'scaled':
      // Масштабирование
      mode = 'scaled';
      resizeCanvas();
      break;
    case 'adaptive':
      // Адаптивный размер
      mode = 'adaptive';
      resizeCanvas();
      break;
  }
}


// Запуск игры
resizeCanvas();
changeDisplayMode();
update();

// Обработчики событий
window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (event) => {
  // Обработка нажатия клавиш
  switch (event.keyCode) {
    case 38: // Up arrow
      mode = 'fixed';
      changeDisplayMode();
      break;
    case 40: // Down arrow
      mode = 'scaled';
      changeDisplayMode();
      break;
    case 39: // Right arrow
      mode = 'adaptive';
      changeDisplayMode();
      break;
  }
});
