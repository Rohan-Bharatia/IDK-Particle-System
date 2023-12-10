const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

context.lineCap = "round";
context.lineWidth = 1;

class Particle {
  constructor(effect, col) {
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX = 0;
    this.speedY = 0;
    this.speedMod = Math.random() * 3 + 0.1;
    this.col = [col];
    this.history = [{
      x: this.x,
      y: this.y,
    }];
    this.maxLen = Math.floor(Math.random() * 200 + 1);
    this.timer = this.maxLen * 4;
    this.angle;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.strokeStyle = this.col;
    ctx.fillStyle = this.col;
    
    ctx.beginPath();
    ctx.moveTo(this.history[0].x, this.history[0].y);
    
    for(let i = 0; i < this.history.length; i++) {
      ctx.lineTo(this.history[i].x, this.history[i].y);
    }
    
    ctx.stroke();
    ctx.restore();
  }
  
  update() {
    if(this.timer >= 1) {
      this.timer -= 1;
      
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let idx = y * this.effect.cols + x;
      this.angle = this.effect.flowField[idx];
      
      this.speedX = this.speedMod * Math.cos(this.angle);
      this.speedY = this.speedMod * Math.sin(this.angle);
      
      this.history.push({x: this.x, y: this.y});
      
      if(this.history.length) {
        this.history.shift();
        this.x += this.speedX;
        this.y += this.speedY;
      } else if(this.timer <= 0 && this.history.length >= 2) {
        this.history.shift();
      } else {
        this.reset();
      }
    }
  }
  
  reset() {
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.timer = this.maxLen * 4;
    this.history = [{
      x: this.x,
      y: this.y,
    }];
    this.opacity = 1;
  }
}

class Effect {
  constructor(cvns) {
    this.canvas = cvns;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.particlesNum = 1500;
    this.cellSize = 1;
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.flowField = [];
    this.zoom = 0.009;
    this.curve = 2;
    this.debug = false;
    
    window.addEventListener("keydown", (event) => {
      if(event.key = "d") {
        this.debug = !this.debug;
      }
    });
    window.addEventListener("resize", (event) => {
      this.resize(event.currentTarget.innerWidth, event.currentTarget.innerHeight);
    });
  }
  
  getAngle(x, y) {
    return ((Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve).toFixed(1);
  }
  
  init() {
    for(let x = 0; x < this.cols; x++) {
      for(let y = 0; y <= this.rows; y++) {
        let a = this.getAngle(x * this.cellSize, y * this.cellSize);
        this.flowField.push(a);
      }
    }
    
    for(let i = 0; i < this.particlesNum; i++) {
      let colors = ["#ff0000", "#ff5500", "#ff8500", "#ffce00", "#ffff00", "#afff00", "#70ff00", "#36ff00", "#00ff00", "#00b54a", "#007a85", "#003bca", "#0000ff", "#7a00ff", "#ff00ff", "#ff008f", "#ff0000"];
      
      let color;
      for(let c = 0; c < colors.length; c++) {
        color = colors[c];
        
        this.particles.push(new Particle(this, color));
      }
    }
  }
  
  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.width = w;
    this.height = h;
    this.init();
  }
  
  render(ctx) {
    this.particles.forEach((particle) => {
      particle.draw(ctx);
      particle.update();
    });
    
    if(this.debug) {
      ctx.save();
            
      for(let a = 0; a < this.cols; a++) {
        ctx.beginPath();
        ctx.moveTo(this.cellSize * a, 0);
        ctx.lineTo(this.cellSize * a, this.height);
        ctx.stroke();
      }
      
      for(let b = 0; b < this.rows; b++) {
        ctx.beginPath();
        ctx.moveTo(0, this.cellSize * b);
        ctx.lineTo(this.width, this.cellSize * b);
        ctx.stroke();
      }
    }
    
    ctx.restore();
    this.cellSize += 0.3;
  }
}

const effect = new Effect(canvas);

effect.init();

function loop() {
  effect.render(context);
  
  window.requestAnimationFrame(loop);
}
window.addEventListener("load", () => {
  loop();
});
