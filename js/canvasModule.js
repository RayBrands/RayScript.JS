/*
Модуль penModule


*/
class CanvasModule {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.targetFPS = 60;
    this.deltaTime = 1 / this.targetFPS;
    this.lastTime = 0;

    this.initCanvas();
    this.animate();
  }

  initCanvas() {
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    window.addEventListener('resize', () => this.adaptCanvasSize());
  }

  adaptCanvasSize() {
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSquare(squareX, squareY, squareSize, rotationAngle, color) {
    this.ctx.save();
    this.ctx.translate(squareX + squareSize / 2, squareY + squareSize / 2);
    this.ctx.rotate((Math.PI / 180) * rotationAngle);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    this.ctx.restore();
  }

  animate(currentTime) {
    requestAnimationFrame((time) => this.animate(time));

    const deltaTime = (currentTime - this.lastTime) / 1000;
    if (deltaTime < 1 / this.targetFPS) return;

    this.clearCanvas();
    // Ваши дополнительные рисования или обновления сцены здесь

    this.lastTime = currentTime;
  }
}

// Пример использования
const canvasModule = new CanvasModule('adaptiveCanvas');