const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBanner = document.querySelector('#startGameBanner');
const startGameBtn = document.querySelector('#startGameEl');

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill()
  }
}

class Projectile {
  constructor (x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill()
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor (x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill()
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  constructor (x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 10, 'white');
const projectiles = [];
const enemies = [];
const particles = [];

function spanEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;

    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    const color = '#'+randomColor;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

let animationId;
let score = 0;

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect  (0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach(particle => {
    if (particle.alpha <= 0) {
      particles.splice(particles.indexOf(particle), 1);
    } else {
    particle.update();
    }
  })
  projectiles.forEach((projectile, index) => {
    projectile.update();

    if (projectile.x + projectile.radius < 0 || 
      projectile.x - projectile.radius > canvas.width || 
      projectile.y + projectile.radius > canvas.height || 
      projectile.y - projectile.radius < 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
    }

    projectiles.forEach((projectile) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        // increase score
        score += 100;
        scoreEl.innerHTML = score;
        for (let i = 0; i < enemy.radius * 2; i++) {
          projectiles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
            x: (Math.random() * 2 - 1) * Math.random() * 6,
            y: (Math.random() * 2 - 1) * Math.random() * 6
          })
        )};
        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, {
            duration: 0.5,
            radius: enemy.radius - 10,
            ease: 'power1.inOut'
          });
          setTimeout(() => {
            projectiles.splice(projectiles.indexOf(projectile), 1);
          }, 0);
        } else {
          score += 250;
          enemies.splice(index, 1);
          projectiles.splice(projectiles.indexOf(projectile), 1);
        }
      }
    });
  })
}

window.addEventListener('click', (e) => {
  const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
  const velocity = {
    x: Math.cos(angle) * 3,
    y: Math.sin(angle) * 3
  };
  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
})

startGameBtn.onclick = () => {
  startGameBanner.style.display = 'none';
  spanEnemies();
  animate();
}
