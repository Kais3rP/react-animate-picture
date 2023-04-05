export default class AnimatePicture {
  constructor({ src, canvasRef, canvasStateRef, color }) {
    // CANVAS
    this.canvas = canvasRef.current;
    this.context = null;
    this.color = color;
    this.setSize();
    // SETTINGS
    this.setSettings();
    // DATA
    this.points = [];
    this.mouse = { x: -1000, y: -1000, down: false };
    // ANIMATION REF
    this.animation = null;
    // MISC
    this.imageInput = null;
    this.bgImage = null;
    this.bgContextPixelData = null;
    this.data = src;
    this.canvasState = canvasStateRef;
  }

  init() {
    // Set up the visual canvas
    this.context = this.canvas.getContext("2d");
    this.context.globalCompositeOperation = "lighter";
    this.canvas.style.display = "block";

    this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
    this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
    this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
    this.canvas.addEventListener("mouseout", this.mouseOut.bind(this), false);

    window.onresize = this.onWindowResize.bind(this);

    // Load initial input image
    this.loadData(this.data);
  }

  setSize() {
    this.canvas.width = this.canvas.parentNode.getBoundingClientRect().width;
    this.canvas.height = this.canvas.parentNode.getBoundingClientRect().height;
  }

  /* Optimized to give good performance on different screen sizes */

  setSettings() {
    this.density =
      this.canvas.width < 600 ? 12 : this.canvas.width < 1000 ? 20 : 30;
    this.drawDistance = 1;
    this.baseRadius =
      this.canvas.width < 600 ? 6 : this.canvas.width < 1000 ? 10 : 15;
    this.maxLineThickness = 10;
    this.reactionSensitivity = 5;
    this.lineThickness = 100;
  }

  preparePoints() {
    // Clear the current points
    this.points = [];

    const colors = this.bgContextPixelData.data;

    for (let i = 0; i < this.canvas.height; i += this.density) {
      for (let j = 0; j < this.canvas.width; j += this.density) {
        const pixelPosition = (j + i * this.bgContextPixelData.width) * 4;

        // Dont use whiteish pixels
        if (
          (colors[pixelPosition] > 200 &&
            colors[pixelPosition + 1] > 200 &&
            colors[pixelPosition + 2] > 200) ||
          colors[pixelPosition + 3] === 0
        ) {
          continue;
        }

        const color =
          this.color ||
          `rgba(${colors[pixelPosition]},${colors[pixelPosition + 1]},${
            colors[pixelPosition + 2]
          },1)`;
        this.points.push({
          x: j,
          y: i,
          originalX: j,
          originalY: i,
          color: color,
        });
      }
    }
  }

  updatePoints() {
    for (let i = 0; i < this.points.length; i++) {
      let distance;
      const currentPoint = this.points[i];
      const r = Math.random() * 255;
      const g = Math.random() * 255;
      const b = Math.random() * 255;

      currentPoint.color = `rgb(${r},${g},${b})`;
      const theta = Math.atan2(
        currentPoint.y - this.mouse.y,
        currentPoint.x - this.mouse.x
      );

      if (this.mouse.down) {
        distance =
          (this.reactionSensitivity * 200) /
          Math.sqrt(
            (this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
              (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y)
          );
      } else {
        distance =
          (this.reactionSensitivity * 100) /
          Math.sqrt(
            (this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
              (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y)
          );
      }

      currentPoint.x +=
        Math.cos(theta) * distance +
        (currentPoint.originalX - currentPoint.x) * 0.05;
      currentPoint.y +=
        Math.sin(theta) * distance +
        (currentPoint.originalY - currentPoint.y) * 0.05;
    }
  }

  drawLines() {
    let currentPoint, otherPoint, distance;

    for (let i = 0; i < this.points.length; i++) {
      currentPoint = this.points[i];

      // Draw the dot.
      this.context.fillStyle = currentPoint.color;
      this.context.strokeStyle = currentPoint.color;

      for (let j = 0; j < this.points.length; j++) {
        // Distaqnce between two points.
        otherPoint = this.points[j];

        if (otherPoint === currentPoint) {
          continue;
        }

        distance = Math.sqrt(
          (otherPoint.x - currentPoint.x) * (otherPoint.x - currentPoint.x) +
            (otherPoint.y - currentPoint.y) * (otherPoint.y - currentPoint.y)
        );

        if (distance <= this.drawDistance) {
          this.context.lineWidth =
            (1 - distance / this.drawDistance) *
            this.maxLineThickness *
            this.lineThickness;
          this.context.beginPath();
          this.context.moveTo(currentPoint.x, currentPoint.y);
          this.context.lineTo(otherPoint.x, otherPoint.y);
          this.context.stroke();
        }
      }
    }
  }

  drawPoints() {
    for (let i = 0; i < this.points.length; i++) {
      const currentPoint = this.points[i];

      // Draw the dot.
      this.context.fillStyle = currentPoint.color;
      this.context.strokeStyle = currentPoint.color;
      this.context.beginPath();
      this.context.arc(
        currentPoint.x,
        currentPoint.y,
        this.baseRadius,
        0,
        Math.PI * 2,
        true
      );
      this.context.closePath();
      this.context.fill();
    }
  }

  draw() {
    this.animation = requestAnimationFrame(this.draw.bind(this));
    if (!this.canvasState.current.visible) return;
    console.log("RENDERING Canvas", this.canvasState.current);
    this.clear();
    this.updatePoints();
    this.drawLines();
    this.drawPoints();
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    /* Resetting canvas width to perform the clear is slow and not well supported */
    // this.canvas.width = this.canvas.width;
  }

  loadData(data) {
    const that = this;
    this.bgImage = new Image();
    this.bgImage.src = data;
    this.bgImage.onload = function () {
      that.drawImageToBackground();
    };
  }

  drawImageToBackground() {
    let newWidth, newHeight;
    const smallerWidth = this.canvas.width - this.canvas.width / 10;
    const smallerHeight = this.canvas.height - this.canvas.height / 10;

    // If the image is too big for the screen... scale it down.
    if (
      this.bgImage.width > smallerWidth ||
      this.bgImage.height > smallerHeight
    ) {
      const maxRatio = Math.max(
        this.bgImage.width / smallerWidth,
        this.bgImage.height / smallerHeight
      );
      newWidth = this.bgImage.width / maxRatio;
      newHeight = this.bgImage.height / maxRatio;
    } else {
      newWidth = this.bgImage.width;
      newHeight = this.bgImage.height;
    }

    // Draw to background canvas
    this.context = this.canvas.getContext("2d");
    this.context.drawImage(
      this.bgImage,
      (this.canvas.width - newWidth) / 2,
      (this.canvas.height - newHeight) / 2,
      newWidth,
      newHeight
    );
    /* Make sure canvas has width height or it throws */
    if (this.canvas.width !== 0 && this.canvas.height !== 0) {
      this.bgContextPixelData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.preparePoints();
      this.draw();
    }
  }

  mouseDown(e) {
    this.mouse.down = true;
  }

  mouseUp(e) {
    this.mouse.down = false;
  }

  mouseMove(e) {
    this.mouse.x = e.offsetX || e.layerX - this.canvas.offsetLeft;
    this.mouse.y = e.offsetY || e.layerY - this.canvas.offsetTop;
  }

  mouseOut(e) {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
    this.mouse.down = false;
  }

  onWindowResize() {
    cancelAnimationFrame(this.animation);
    this.setSize();
    this.setSettings();
    this.drawImageToBackground();
  }

  cancel() {
    window.cancelAnimationFrame(this.animation);
  }
}
