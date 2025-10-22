// Paintball Mania Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const levelEl = document.getElementById('level');
const splatSound = document.getElementById('splatSound');

const EMOJIS = ['😀','😎','🤩','🥳','😈','👻','🤖','🦄','🐸','🐵','🐙','🍕','🍔','🍩','🍉','🍦','🎈','🎉','💎','⭐'];
const BONUS = ['💰','🍭','🎁','🍀','🧸','🍒'];
let targets = [];
let paintballs = [];
let score = 0;
let timer = 60;
let level = 1;
let gameInterval, timerInterval;
let mouseX = 400, mouseY = 300;
let highScores = JSON.parse(localStorage.getItem('paintballHighScores')) || [];
let gameOver = false;

function randomColor() {
  const colors = ['#ff69b4','#ffb347','#7afcff','#baffc9','#fff740','#ff6f91','#f9f871','#a0e7e5','#b4f8c8','#fbe7c6'];
  return colors[Math.floor(Math.random()*colors.length)];
}

function spawnTargets() {
  targets = [];
  for (let i = 0; i < 5 + level; i++) {
    const isBonus = Math.random() < 0.2;
    targets.push({
      x: Math.random()*700+50,
      y: Math.random()*500+50,
      r: 32,
      emoji: isBonus ? BONUS[Math.floor(Math.random()*BONUS.length)] : EMOJIS[Math.floor(Math.random()*EMOJIS.length)],
      color: randomColor(),
      speed: 0.8 + level*0.3 + (isBonus?0.5:0), // Slower movement
      dx: (Math.random()<0.5?-1:1)*(Math.random()*1.5+0.5),
      dy: (Math.random()<0.5?-1:1)*(Math.random()*1.5+0.5),
      bonus: isBonus
    });
  }
}

function drawTargets() {
  targets.forEach(t => {
    // 3D shadow effect
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    
    // Speed boost glow effect
    if (t.boosted && t.boostTimer > 0) {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      t.boostTimer--;
      if (t.boostTimer <= 0) {
        t.boosted = false;
      }
    }
    
    // Draw emoji with 3D effect
    ctx.font = '32px serif';
    ctx.fillStyle = '#000';
    ctx.fillText(t.emoji, t.x + 2, t.y + 2); // Shadow
    ctx.fillStyle = t.boosted ? '#ff6666' : '#fff';
    ctx.fillText(t.emoji, t.x, t.y); // Main emoji
    ctx.restore();
  });
}

function drawPaintballGun() {
  const gunX = canvas.width / 2;
  const gunY = canvas.height - 80;
  const angle = Math.atan2(mouseY - gunY, mouseX - gunX);
  
  ctx.save();
  ctx.translate(gunX, gunY);
  ctx.rotate(angle);
  
  // Gun barrel with 3D effect
  const gradient = ctx.createLinearGradient(0, -15, 0, 15);
  gradient.addColorStop(0, '#444');
  gradient.addColorStop(0.3, '#666');
  gradient.addColorStop(0.7, '#333');
  gradient.addColorStop(1, '#111');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, -15, 60, 30);
  
  // Barrel tip
  ctx.fillStyle = '#222';
  ctx.fillRect(55, -12, 8, 24);
  
  // Gun body
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(-30, -20, 35, 40);
  
  // Highlight on gun
  ctx.fillStyle = '#ffaa88';
  ctx.fillRect(-28, -18, 8, 36);
  
  ctx.restore();
}

function drawPaintballs() {
  paintballs.forEach(p => {
    ctx.save();
    // 3D paintball effect
    const gradient = ctx.createRadialGradient(p.x-2, p.y-2, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.3, p.color);
    gradient.addColorStop(1, '#333');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Paintball trail
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x - p.vx * 3, p.y - p.vy * 3, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawSplats(x, y, color) {
  ctx.save();
  ctx.globalAlpha = 0.8;
  
  // 3D splat effect with multiple layers
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      let angle = Math.PI * 2 * i / 8;
      let r = (40 + Math.random() * 20) * (1 - layer * 0.2);
      ctx.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, (18 + Math.random() * 8) * (1 - layer * 0.3), 0, Math.PI * 2);
    }
    
    // Different shades for depth
    if (layer === 0) ctx.fillStyle = '#333'; // Shadow
    else if (layer === 1) ctx.fillStyle = color; // Main color
    else ctx.fillStyle = '#fff'; // Highlight
    
    ctx.fill();
  }
  ctx.restore();
}

function moveTargets() {
  targets.forEach(t => {
    t.x += t.dx * t.speed;
    t.y += t.dy * t.speed;
    
    // Wall collision with speed increase
    if (t.x < 32 || t.x > 768) {
      t.dx *= -1;
      t.speed += 0.2; // Increase speed when hitting walls
      showSpeedBoost(t);
    }
    if (t.y < 32 || t.y > 568) {
      t.dy *= -1;
      t.speed += 0.2; // Increase speed when hitting walls
      showSpeedBoost(t);
    }
  });
}

function showSpeedBoost(target) {
  // Visual effect to show speed boost
  target.boosted = true;
  target.boostTimer = 30; // frames to show boost effect
}

function updatePaintballs() {
  for (let i = paintballs.length - 1; i >= 0; i--) {
    let p = paintballs[i];
    p.x += p.vx;
    p.y += p.vy;
    
    // Check collision with targets
    for (let j = 0; j < targets.length; j++) {
      let t = targets[j];
      let dist = Math.hypot(p.x - t.x, p.y - t.y);
      if (dist < t.r + p.size) {
        drawSplats(t.x, t.y, p.color);
        splatSound.currentTime = 0;
        splatSound.play();
        score += t.bonus ? 10 : 3;
        targets.splice(j, 1);
        paintballs.splice(i, 1);
        break;
      }
    }
    
    // Remove paintballs that go off screen
    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      paintballs.splice(i, 1);
    }
  }
}

function saveHighScore(name, score) {
  highScores.push({ name: name, score: score, date: new Date().toLocaleDateString() });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10); // Keep only top 10
  localStorage.setItem('paintballHighScores', JSON.stringify(highScores));
}

function showHighScoreInput() {
  const name = prompt('🎉 New High Score! Enter your name:', 'Player');
  if (name && name.trim()) {
    saveHighScore(name.trim(), score);
  }
  showHighScores();
}

function showHighScores() {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = '36px Comic Sans MS';
  ctx.fillStyle = '#ffd700';
  ctx.fillText('🏆 HIGH SCORES 🏆', 230, 80);
  
  ctx.font = '20px Comic Sans MS';
  ctx.fillStyle = '#fff';
  
  if (highScores.length === 0) {
    ctx.fillText('No high scores yet!', 320, 150);
  } else {
    for (let i = 0; i < Math.min(highScores.length, 8); i++) {
      const hs = highScores[i];
      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
      ctx.fillText(`${medal} ${hs.name}: ${hs.score}`, 250, 150 + i * 30);
    }
  }
  
  ctx.font = '18px Comic Sans MS';
  ctx.fillStyle = '#ffb347';
  ctx.fillText('Click to play again!', 320, 500);
}

function isHighScore(score) {
  return highScores.length < 10 || score > highScores[highScores.length - 1].score;
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', e => {
  if (gameOver) {
    startGame();
    return;
  }
  
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  // Shoot paintball
  const gunX = canvas.width / 2;
  const gunY = canvas.height - 80;
  const angle = Math.atan2(my - gunY, mx - gunX);
  const speed = 12;
  
  paintballs.push({
    x: gunX + Math.cos(angle) * 60,
    y: gunY + Math.sin(angle) * 60,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: randomColor(),
    size: 8
  });
  
  if (targets.length === 0) nextLevel();
});

function nextLevel() {
  level++;
  timer = Math.max(10, timer - 5); // Reduce time by 5 seconds each level, minimum 10 seconds
  spawnTargets();
  levelEl.textContent = 'Level: ' + level;
  timerEl.textContent = 'Time: ' + timer;
  
  // Visual feedback for time reduction
  timerEl.style.color = '#ff6600';
  timerEl.style.transform = 'scale(1.3)';
  setTimeout(() => {
    timerEl.style.color = 'white';
    timerEl.style.transform = 'scale(1)';
  }, 800);
}

function draw() {
  // 3D background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.7, '#98FB98');
  gradient.addColorStop(1, '#F0E68C');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw ground with perspective
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 100);
  ctx.lineTo(canvas.width, canvas.height - 100);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.fill();
  
  drawTargets();
  drawPaintballs();
  drawPaintballGun();
}

function gameLoop() {
  moveTargets();
  updatePaintballs();
  draw();
}

function startGame() {
  score = 0;
  timer = 60;
  level = 1;
  paintballs = [];
  gameOver = false;
  scoreEl.textContent = 'Score: 0';
  timerEl.textContent = 'Time: 60';
  levelEl.textContent = 'Level: 1';
  spawnTargets();
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameInterval = setInterval(gameLoop, 1000/60);
  timerInterval = setInterval(() => {
    timer--;
    timerEl.textContent = 'Time: ' + timer;
    if (timer <= 0) {
      clearInterval(gameInterval);
      clearInterval(timerInterval);
      gameOver = true;
      
      // Check for high score
      if (isHighScore(score)) {
        showHighScoreInput();
      } else {
        ctx.font = '48px Comic Sans MS';
        ctx.fillStyle = '#ff69b4';
        ctx.fillText('Game Over! 🎉', 250, 300);
        ctx.font = '32px Comic Sans MS';
        ctx.fillText('Final Score: '+score, 300, 350);
        ctx.font = '18px Comic Sans MS';
        ctx.fillStyle = '#ffb347';
        ctx.fillText('Click to play again!', 320, 400);
      }
    }
    scoreEl.textContent = 'Score: ' + score;
  }, 1000);
}

window.onload = startGame;

// Button event listeners
document.getElementById('highScoreBtn').addEventListener('click', () => {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameOver = true;
  showHighScores();
});

document.getElementById('newGameBtn').addEventListener('click', () => {
  startGame();
});
