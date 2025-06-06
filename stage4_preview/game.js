console.log("JS 실행됨!");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let score = 0;
let timeLeft = 30;
let balls = [];
let bricks = [];
let lastSpawn = 0;
let maxBalls = 3;

// 이미지 불러오기
const catImg = new Image();
catImg.src = "cat.png";

const handImg = new Image();
handImg.src = "hand.png";

// 고양이 위치
let cat = {
  x: 50,
  y: 50,
  size: 80
};

// 벽돌 객체 (랜덤 내구도)
const brickTypes = [
  { name: '유리컵', hp: 1 },
  { name: '그릇', hp: 2 },
  { name: '액자', hp: 2 },
  { name: '택배박스', hp: 3 },
  { name: '노트북', hp: 30 }
];

// 패들 객체
const paddle = {
  x: centerX,
  y: centerY,
  width: 60,
  height: 60,
  angle: 0
};

canvas.addEventListener('mousemove', e => {
  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;
  paddle.angle = Math.atan2(dy, dx);
});

function createBall() {
  const angle = Math.random() * Math.PI * 2;
  balls.push({
    x: cat.x + cat.size / 2,
    y: cat.y + cat.size / 2,
    dx: Math.cos(angle) * 3,
    dy: Math.sin(angle) * 3,
    radius: 8
  });
}

function createBricks() {
  bricks = [];
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 150 + Math.random() * 80;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const type = brickTypes[Math.floor(Math.random() * brickTypes.length)];
    bricks.push({
      x, y, w: 40, h: 40, hp: type.hp, name: type.name
    });
  }
}

function drawBricks() {
  bricks.forEach(b => {
    ctx.fillStyle = '#bbb';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#000';
    ctx.fillText(b.name, b.x + 5, b.y + 25);
  });
}

function drawPaddle() {
  const x = centerX + Math.cos(paddle.angle) * 100;
  const y = centerY + Math.sin(paddle.angle) * 100;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(paddle.angle);
  ctx.drawImage(handImg, -paddle.width / 2, -paddle.height / 2, paddle.width, paddle.height);
  ctx.restore();
}

function updateBalls() {
  balls.forEach(ball => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 벽 반사
    if (ball.x < 0 || ball.x > canvas.width) ball.dx *= -1;
    if (ball.y < 0 || ball.y > canvas.height) ball.dy *= -1;

    // 패들 충돌
    const px = centerX + Math.cos(paddle.angle) * 100;
    const py = centerY + Math.sin(paddle.angle) * 100;
    const dist = Math.hypot(ball.x - px, ball.y - py);
    if (dist < 40) {
      const angle = Math.atan2(ball.y - centerY, ball.x - centerX);
      ball.dx = Math.cos(angle) * 3;
      ball.dy = Math.sin(angle) * 3;
    }

    // 벽돌 충돌
    bricks.forEach((brick, i) => {
      if (
        ball.x > brick.x && ball.x < brick.x + brick.w &&
        ball.y > brick.y && ball.y < brick.y + brick.h
      ) {
        brick.hp--;
        if (brick.hp <= 0) {
          bricks.splice(i, 1);
          score += 1000;
        } else {
          score += 500;
        }
        ball.dy *= -1;
      }
    });
  });
}

function drawBalls() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6666';
    ctx.fill();
    ctx.closePath();
  });
}

function drawCat() {
  ctx.drawImage(catImg, cat.x, cat.y, cat.size, cat.size);
}

function drawHUD() {
  document.getElementById('scoreBoard').innerHTML = `수리비: ${score}원 | 남은 시간: <span id="time">${timeLeft}</span>초`;
}

function gameLoop(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawCat();
  drawPaddle();
  drawBalls();
  updateBalls();
  drawHUD();

  // 10초마다 고양이 위치 변경 + 공 생성
  if (timestamp - lastSpawn > 10000 && balls.length < maxBalls) {
    cat.x = Math.random() * (canvas.width - cat.size);
    cat.y = Math.random() * (canvas.height - cat.size);
    createBall();
    lastSpawn = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

// 시작
createBricks();
createBall();
lastSpawn = performance.now();
requestAnimationFrame(gameLoop);

// 타이머
setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
  } else {
    alert("츄르 엔딩 등장! 고양이는 결국 쓰담쓰담을 받았습니다.");
    location.reload();  // 게임 새로고침
  }
}, 1000);

