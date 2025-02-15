// Add speed multiplier variables
let currentSpeedMultiplier = getSpeedMultiplier();

function getSpeedMultiplier() {
  return Math.min(window.outerWidth / 1000);
}

class Emoji {
  constructor(element, radius) {
    this.element = element;
    this.radius = radius;
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;

    // Use speed multiplier for initial velocity
    this.dx = (Math.random() - 0.5) * 0.8 * currentSpeedMultiplier;
    this.dy = (Math.random() - 0.5) * 0.8 * currentSpeedMultiplier;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < this.radius || this.x > window.innerWidth - this.radius) this.dx *= -1;
    if (this.y < this.radius || this.y > window.innerHeight - this.radius) this.dy *= -1;

    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

// Modified resize handler
function handleResize() {
  const newSpeedMultiplier = getSpeedMultiplier();
  const ratio = newSpeedMultiplier / currentSpeedMultiplier;
  currentSpeedMultiplier = newSpeedMultiplier;

  emojiInstances.forEach(emoji => {
    // Adjust velocity while maintaining direction
    emoji.dx *= ratio;
    emoji.dy *= ratio;

    // Keep emojis within new boundaries
    emoji.x = Math.max(emoji.radius, Math.min(emoji.x, window.innerWidth - emoji.radius));
    emoji.y = Math.max(emoji.radius, Math.min(emoji.y, window.innerHeight - emoji.radius));
  });
}

function checkCollisions(emojis) {
  for (let i = 0; i < emojis.length; i++) {
    for (let j = i + 1; j < emojis.length; j++) {
      const a = emojis[i];
      const b = emojis[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = a.radius + b.radius;

      if (distance < minDistance) {
        // Collision detected
        const angle = Math.atan2(dy, dx);
        const ax = (minDistance - distance) * Math.cos(angle);
        const ay = (minDistance - distance) * Math.sin(angle);

        a.x += ax * 0.5;
        a.y += ay * 0.5;
        b.x -= ax * 0.5;
        b.y -= ay * 0.5;

        // Bounce effect
        const aVel = Math.sqrt(a.dx * a.dx + a.dy * a.dy);
        const bVel = Math.sqrt(b.dx * b.dx + b.dy * b.dy);

        a.dx = Math.cos(angle) * aVel;
        a.dy = Math.sin(angle) * aVel;
        b.dx = Math.cos(angle + Math.PI) * bVel;
        b.dy = Math.sin(angle + Math.PI) * bVel;
      }
    }
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  } else {
    document.body.classList.toggle('dark-theme', systemDark);
  }
}

document.querySelector('.theme-toggler').addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

const emojis = [
  '💻', '🖥️', '⌨️', '🚀', '⚡', '🔧', '🛠️', '🌐', '🤖', '🧠',
  '📱', '🔌', '💾', '💡', '🧩', '⚙️', '🔨', '🧪', '🔬', '📡',
  '📟', '🎮', '🕹️', '🧮', '📊', '📈', '📚', '🎓', '💎', '⛓️',
  '🌍', '🔑', '🗝️', '⏳', '🕸️', '🎯', '🛡️', '⚠️', '✅', '❌'
];

const emojiInstances = [];
const baseRadius = 25;

function createEmojis() {
  emojis.forEach(emoji => {
    const element = document.createElement('div');
    element.className = 'emoji-bg';
    element.textContent = emoji;
    document.body.appendChild(element);

    const radius = baseRadius + Math.random() * 10;
    const instance = new Emoji(element, radius);

    // Initial position check
    let collision = false;
    do {
      collision = false;
      instance.x = Math.random() * (window.innerWidth - radius * 2) + radius;
      instance.y = Math.random() * (window.innerHeight - radius * 2) + radius;

      for (const other of emojiInstances) {
        const dx = instance.x - other.x;
        const dy = instance.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < instance.radius + other.radius) {
          collision = true;
          break;
        }
      }
    } while (collision);

    emojiInstances.push(instance);
  });
}

function animate() {
  emojiInstances.forEach(emoji => emoji.update());
  checkCollisions(emojiInstances);
  requestAnimationFrame(animate);
}

initializeTheme();
createEmojis();
animate();

window.addEventListener('resize', handleResize);
