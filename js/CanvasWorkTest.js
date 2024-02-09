// Определение canvas и контекста
const canvas = document.getElementById('adaptiveCanvas');
const ctx = canvas.getContext('2d');

// Инициализация размеров canvas
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Определение ограничителя FPS
const targetFPS = 500;
const deltaTime = 1 / targetFPS;
let lastTime = 0;

// Параметры квадрата
let squareX = 50;
let squareY = 50;
let squareSize = 100;
let rotationSpeed = 3000; // Угловая скорость вращения в градусах в секунду
let rotationAngle = 0;

// Функция обновления сцены
function update() {
  // Вращение квадрата в зависимости от deltaTime
  rotationAngle += rotationSpeed * deltaTime;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(squareX + squareSize / 2, squareY + squareSize / 2);
  ctx.rotate((Math.PI / 180) * rotationAngle);
  ctx.fillStyle = 'blue';
  ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
  ctx.restore();
  
  
  
}

// Функция адаптации canvas к размеру экрана
function adaptCanvasSize() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

// Основной цикл анимации
function animate(currentTime) {
  requestAnimationFrame(animate);

  // Рассчет deltaTime
  const deltaTime = (currentTime - lastTime) / 1000;

  // Ограничение кадров в секунду
  if (deltaTime < 1 / targetFPS) return;

  // Обновление сцены
  update();

  // Сохранение времени для следующего кадра
  lastTime = currentTime;
}

// Подписка на событие изменения размера окна
window.addEventListener('resize', () => {
  adaptCanvasSize();
});

// Запуск анимации
adaptCanvasSize();
animate();
