const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const BASE_SPEED_X = 5;
const BASE_SPEED_Y = -5;
let bricks = [];
const paddleHeight = 70;
const paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let ballRadius = 15;
let x = canvas.width / 2;
let y = canvas.height - 100;
let dx = BASE_SPEED_X;
let dy = BASE_SPEED_Y;
let isGameOver = false;
let isGameClear = false;
let isRespawning = false;
let gameStarted = false;
let score = 0;
let animationId = null;
let isPowerUp = false;
let powerUpTimeout = null;

// 공 이미지 관리
const ballImages = {
    ball1: new Image(),
    ball2: new Image(),
    ball3: new Image(),
};
ballImages.ball1.src = 'ball_images/ball1.PNG';
ballImages.ball2.src = 'ball_images/ball2.PNG';
ballImages.ball3.src = 'ball_images/ball3.PNG';
let currentBallImage = ballImages.ball1; // 기본값으로 ball1 설정

// paddle 이미지 관리
const paddleImages = {
    paddle1: new Image(),
    paddle2: new Image(),
    paddle3: new Image(),
};

// 이미지 로드 에러 처리
function handleImageError(img) {
    console.log('이미지 로드 실패:', img.src);
    return false;
}

// 이미지 로드 설정
paddleImages.paddle1.onerror = () => handleImageError(paddleImages.paddle1);
paddleImages.paddle2.onerror = () => handleImageError(paddleImages.paddle2);
paddleImages.paddle3.onerror = () => handleImageError(paddleImages.paddle3);

paddleImages.paddle1.src = 'paddle_images/paddle1.PNG';
paddleImages.paddle2.src = 'paddle_images/paddle2.PNG';
paddleImages.paddle3.src = 'paddle_images/paddle3.PNG';

let currentPaddleImage = paddleImages.paddle1; // 기본값으로 paddle1 설정

// 테마 선택에 따른 공과 paddle 이미지 변경 함수
function changeBallImage(theme) {
    console.log('changeBallImage 호출됨, 테마:', theme);
    switch (theme) {
        case 'cat1':
            console.log('ball1, paddle1 이미지로 변경');
            currentBallImage = ballImages.ball1;
            currentPaddleImage = paddleImages.paddle1;
            break;
        case 'cat2':
            console.log('ball2, paddle2 이미지로 변경');
            currentBallImage = ballImages.ball2;
            currentPaddleImage = paddleImages.paddle2;
            break;
        case 'cat3':
            console.log('ball3, paddle3 이미지로 변경');
            currentBallImage = ballImages.ball3;
            currentPaddleImage = paddleImages.paddle3;
            break;
        default:
            console.log('기본 ball1, paddle1 이미지로 변경');
            currentBallImage = ballImages.ball1;
            currentPaddleImage = paddleImages.paddle1;
    }
}

const levels = [
    [
        { img: 'block_images/glassCup_1.PNG', scale: 0.2, hp: 1, name: '유리컵' },
        { img: 'block_images/plate1_1.PNG', scale: 0.2, hp: 1, name: '그릇' },
        { img: 'block_images/frame2_1.PNG', scale: 0.4, hp: 1, name: '액자' },
    ],
    [
        { img: 'block_images/glassCup_1.PNG', scale: 0.2, hp: 1, name: '유리컵' },
        { img: 'block_images/plate2_1.PNG', scale: 0.2, hp: 2, name: '그릇' },
        { img: 'block_images/frame1_1.PNG', scale: 0.4, hp: 2, name: '액자' },
        { img: 'block_images/box1_1.PNG', scale: 0.4, hp: 3, name: '택배박스' },
    ],
    [
        { img: 'block_images/glassCup_1.PNG', scale: 0.2, hp: 1, name: '유리컵' },
        { img: 'block_images/plate2_1.PNG', scale: 0.2, hp: 2, name: '그릇' },
        { img: 'block_images/frame1_1.PNG', scale: 0.4, hp: 2, name: '액자' },
        { img: 'block_images/box1_1.PNG', scale: 0.4, hp: 3, name: '택배박스' },
        { img: 'block_images/notebook1.PNG', scale: 0.6, hp: 30, name: '노트북' },
    ],
];
let currentLevel = 0;
let brickTypes = levels[currentLevel];

const brickImages = {};
let imagesToLoad = 0;
let imagesLoaded = 0;

// 깨지는 이미지도 미리 로드
const breakImages = [
    // stage1 이미지
    'block_images/glassCup_2.PNG',
    'block_images/plate1_2.PNG',
    'block_images/frame2_2.PNG',
    // stage2 이미지
    'block_images/plate2_2.PNG',
    'block_images/plate2_3.PNG',
    'block_images/frame1_2.PNG',
    'block_images/frame1_3.PNG',
    'block_images/box1_2.PNG',
    'block_images/box1_3.PNG',
    'block_images/chur.PNG',

    //stage3 이미지
    'block_images/notebook2.PNG',
    'block_images/notebook3.PNG',
    'block_images/notebook11.PNG',
    'block_images/notebook22.PNG',
    'block_images/notebook33.PNG',
];

const loadImages = () => {
    console.log('이미지 로딩중');
    return new Promise((resolve, reject) => {
        let totalImages = [...levels.flat().map((type) => type.img), ...breakImages];
        imagesToLoad = totalImages.length;
        imagesLoaded = 0;

        totalImages.forEach((imgPath) => {
            if (!brickImages[imgPath]) {
                const image = new Image();
                image.src = imgPath;
                console.log(imgPath);

                image.onload = () => {
                    imagesLoaded++;
                    if (imagesLoaded === imagesToLoad) {
                        resolve(); // 모든 이미지가 로드되면 resolve 호출
                    }
                };

                image.onerror = (e) => {
                    console.error('❌ 이미지 로드 실패:', imgPath, e);
                    imagesLoaded++; // 실패한 이미지도 카운트
                    if (imagesLoaded === imagesToLoad) {
                        resolve(); // 모든 이미지가 로드되면 resolve 호출
                    }
                };

                brickImages[imgPath] = image;
            }
        });
    });
};

// 사용 예
loadImages().then(() => {
    randomPlaceBricks(); // 모든 이미지가 로드된 후 벽돌 배치
});

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    // document.addEventListener('mousemove', mouseMoveHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    $('#restartBtn').click(restartGame);
    draw();
}

//캔버스를 cell단위로 나눔
const cellSize = 5;
const gridRows = Math.floor(canvas.height / cellSize);
const gridCols = Math.floor(canvas.width / cellSize);
const brickAreaRows = Math.floor(gridRows * 0.4);
let grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));

function canPlaceBrick(row, col, brickW, brickH) {
    if (row + brickH > brickAreaRows || col + brickW > gridCols) return false;
    for (let i = 0; i < brickH; i++) {
        for (let j = 0; j < brickW; j++) {
            if (grid[row + i][col + j] !== 0) return false;
        }
    }
    return true;
}

function placeBrick(row, col, brickW, brickH, brickObj) {
    for (let i = 0; i < brickH; i++) {
        for (let j = 0; j < brickW; j++) {
            grid[row + i][col + j] = 1;
        }
    }
    bricks.push({
        x: col * cellSize,
        y: row * cellSize,
        w: brickW * cellSize,
        h: brickH * cellSize,
        img: brickObj.img,
        status: 1,
        hp: brickObj.hp,
        name: brickObj.name,
    });
}

function randomPlaceBricks() {
    grid = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));

    // ✅ notebook1을 가장 먼저 중앙 상단에 고정 배치
    const notebook = brickTypes.find((type) => type.img.includes('notebook1'));
    if (notebook) {
        const img = brickImages[notebook.img];
        const scale = notebook.scale || 1;
        const brickW = Math.ceil((img.naturalWidth * scale) / cellSize);
        const brickH = Math.ceil((img.naturalHeight * scale) / cellSize);

        const col = Math.floor((gridCols - brickW) / 2); // 중앙 열
        const row = 1; // 위쪽에서 두 번째 줄 (0은 너무 경계일 수 있음)

        placeBrick(row, col, brickW, brickH, notebook);
    }

    // ✅ notebook을 제외한 나머지 타입 필터링
    const nonNotebookTypes = brickTypes.filter((type) => !type.img.includes('notebook'));

    for (let type of nonNotebookTypes) {
        const img = brickImages[type.img];
        const scale = type.scale || 1;
        const brickW = Math.ceil((img.naturalWidth * scale) / cellSize);
        const brickH = Math.ceil((img.naturalHeight * scale) / cellSize);

        let placed = false;
        let tries = 0;
        while (!placed && tries < 100) {
            const row = Math.floor(Math.random() * (brickAreaRows - brickH));
            const col = Math.floor(Math.random() * (gridCols - brickW));
            if (canPlaceBrick(row, col, brickW, brickH)) {
                placeBrick(row, col, brickW, brickH, type);
                placed = true;
            }
            tries++;
        }
    }

    // ✅ 나머지 벽돌 랜덤 배치
    for (let n = 0; n < 1000; n++) {
        let type = nonNotebookTypes[Math.floor(Math.random() * nonNotebookTypes.length)];
        let img = brickImages[type.img];
        let scale = type.scale || 1;
        let brickW = Math.ceil((img.naturalWidth * scale) / cellSize);
        let brickH = Math.ceil((img.naturalHeight * scale) / cellSize);
        let tries = 0;
        let placed = false;

        while (tries < 100 && !placed) {
            let row = Math.floor(Math.random() * (brickAreaRows - brickH));
            let col = Math.floor(Math.random() * (gridCols - brickW));
            if (canPlaceBrick(row, col, brickW, brickH)) {
                placeBrick(row, col, brickW, brickH, type);
                placed = true;
            }
            tries++;
        }

        if (!placed) break;
    }
}

function drawBricks() {
    for (let brick of bricks) {
        if (brick.status === 1) {
            let img = brickImages[brick.img];
            if (img && img.complete && img.naturalWidth && img.naturalHeight) {
                ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h);
            } else {
                ctx.fillStyle = '#888';
                ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
            }
        } else if (brick.status === 2) {
            // 깨지는 중인 상태일 때
            let breakImg = brickImages[brick.breakImg];
            if (breakImg && breakImg.complete && breakImg.naturalWidth && breakImg.naturalHeight) {
                ctx.drawImage(breakImg, brick.x, brick.y, brick.w, brick.h);
            }
        }
    }
}

function drawBall() {
    if (currentBallImage.complete) {
        ctx.drawImage(currentBallImage, x - ballRadius, y - ballRadius, ballRadius * 2, ballRadius * 2);
    } else {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddle() {
    if (currentPaddleImage && currentPaddleImage.complete && !currentPaddleImage.naturalWidth) {
        // 이미지가 로드되지 않은 경우 기본 사각형으로 표시
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
        ctx.fillStyle = '#3a8dde';
        ctx.fill();
        ctx.closePath();
    } else if (currentPaddleImage && currentPaddleImage.complete) {
        // 이미지가 성공적으로 로드된 경우
        ctx.drawImage(currentPaddleImage, paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
    } else {
        // 이미지 로드 중인 경우 기본 사각형으로 표시
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);
        ctx.fillStyle = '#3a8dde';
        ctx.fill();
        ctx.closePath();
    }
}

function showClearModal() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    clearInterval(timerInterval); // 타이머도 정지
    $('.clear-score-btn').text(`점수: ${score}`);
    $('#clear-modal').fadeIn(200);
}

function collisionDetection() {
    for (let brick of bricks) {
        if (brick.status === 1) {
            if (x > brick.x && x < brick.x + brick.w && y > brick.y && y < brick.y + brick.h) {
                const overlapLeft = Math.abs(x + ballRadius - brick.x);
                const overlapRight = Math.abs(brick.x + brick.w - (x - ballRadius));
                const overlapTop = Math.abs(y + ballRadius - brick.y);
                const overlapBottom = Math.abs(brick.y + brick.h - (y - ballRadius));

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                    // 좌우 충돌: 수평 방향 반전
                    dx = -dx;
                } else {
                    // 상하 충돌: 수직 방향 반전
                    dy = -dy;
                }

                // speed 유지
                const speed = Math.sqrt(dx * dx + dy * dy);
                const angleVariation = (Math.random() - 0.5) * (Math.PI / 12); // ±15도 흔들림
                const angle = Math.atan2(dy, dx) + angleVariation;

                dx = speed * Math.cos(angle);
                dy = speed * Math.sin(angle);

                if (isPowerUp) {
                    brick.hp -= 2;
                } else {
                    brick.hp--;
                }

                // stage1의 벽돌 처리
                if (brick.img.includes('glassCup_1')) {
                    if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/glassCup_2.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                } else if (brick.img.includes('plate1_1')) {
                    if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/plate1_2.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                } else if (brick.img.includes('frame2_1')) {
                    if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/frame2_2.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                }

                // plate2 계열
                else if (brick.img === 'block_images/plate2_1.PNG') {
                    if (brick.hp === 1) {
                        brick.img = 'block_images/plate2_2.PNG';
                    } else if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/plate2_3.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                } else if (brick.img === 'block_images/plate2_2.PNG') {
                    if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/plate2_3.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                }
                // frame1 계열
                else if (brick.img === 'block_images/frame1_1.PNG') {
                    if (brick.hp === 1) {
                        brick.img = 'block_images/frame1_2.PNG';
                    } else if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/frame1_3.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                } else if (brick.img === 'block_images/frame1_2.PNG') {
                    if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/frame1_3.PNG';
                        brick.status = 2;
                        setTimeout(() => {
                            brick.status = 0;
                        }, 300);
                    }
                }
                // box1 계열
                else if (brick.img === 'block_images/box1_1.PNG') {
                    if (brick.hp === 2) {
                        brick.img = 'block_images/box1_2.PNG';
                    } else if (brick.hp === 1) {
                        brick.img = 'block_images/box1_3.PNG';
                    } else if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/chur.PNG';
                        brick.status = 2;
                        // chur를 얻으면 파워업 활성화
                        isPowerUp = true;
                        // 이전 파워업 타이머가 있다면 취소
                        if (powerUpTimeout) {
                            clearTimeout(powerUpTimeout);
                        }
                        // 5초 후 파워업 비활성화
                        powerUpTimeout = setTimeout(() => {
                            isPowerUp = false;
                            powerUpTimeout = null;
                        }, 5000);
                        setTimeout(() => {
                            brick.status = 0;
                        }, 500);
                    }
                } else if (brick.img === 'block_images/box1_2.PNG') {
                    if (brick.hp === 1) {
                        brick.img = 'block_images/box1_3.PNG';
                    } else if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/chur.PNG';
                        brick.status = 2;
                        // chur를 얻으면 파워업 활성화
                        isPowerUp = true;
                        // 이전 파워업 타이머가 있다면 취소
                        if (powerUpTimeout) {
                            clearTimeout(powerUpTimeout);
                        }
                        // 5초 후 파워업 비활성화
                        powerUpTimeout = setTimeout(() => {
                            isPowerUp = false;
                            powerUpTimeout = null;
                        }, 5000);
                        setTimeout(() => {
                            brick.status = 0;
                        }, 500);
                    }
                } else if (brick.img === 'block_images/box1_3.PNG') {
                    if (brick.hp <= 0) {
                        brick.breakImg = 'block_images/chur.PNG';
                        brick.status = 2;
                        // chur를 얻으면 파워업 활성화
                        isPowerUp = true;
                        // 이전 파워업 타이머가 있다면 취소
                        if (powerUpTimeout) {
                            clearTimeout(powerUpTimeout);
                        }
                        // 5초 후 파워업 비활성화
                        powerUpTimeout = setTimeout(() => {
                            isPowerUp = false;
                            powerUpTimeout = null;
                        }, 5000);
                        setTimeout(() => {
                            brick.status = 0;
                        }, 500);
                    }
                } else if (brick.img.startsWith('block_images/notebook')) {
                    score += 1;
                    $('#score-box').text(score);

                    if (!brick.notebookLevel) brick.notebookLevel = 1;
                    if (!brick.notebookHitCount) brick.notebookHitCount = 0;

                    const originalImg = `block_images/notebook${brick.notebookLevel}.PNG`;
                    const flashImg = `block_images/notebook${brick.notebookLevel}${brick.notebookLevel}.PNG`;

                    // 임시로 flash 이미지로 변경
                    brick.img = flashImg;

                    // 원래 이미지로 되돌리기
                    setTimeout(() => {
                        brick.img = originalImg;
                    }, 100); // 100ms 동안만 효과 보여줌

                    // notebook 레벨 업 처리
                    brick.notebookHitCount++;
                    if (brick.notebookLevel < 3 && brick.notebookHitCount >= 10) {
                        brick.notebookLevel++;
                        brick.notebookHitCount = 0;
                        brick.img = `block_images/notebook${brick.notebookLevel}.PNG`;
                    }

                    // notebook3이면 깨짐
                    // if (brick.notebookLevel === 3 && brick.hp <= 0) {
                    //     brick.breakImg = 'block_images/notebook_4.PNG';
                    //     brick.status = 2;
                    //     setTimeout(() => {
                    //         brick.status = 0;
                    //     }, 300);
                    // }
                }

                // 벽돌이 깨질 때, 해당 벽돌의 최초 hp만큼 점수 증가
                if (brick.hp <= 0) {
                    let maxHp = 1;
                    if (currentLevel === 1) {
                        // stage2일 때
                        if (brick.img.includes('glassCup_1')) {
                            maxHp = 1; // 유리컵: 1점
                        } else if (brick.img.includes('plate2_')) {
                            maxHp = 2; // 그릇: 2점
                        } else if (brick.img.includes('frame1_')) {
                            maxHp = 2; // 액자: 2점
                        } else if (brick.img.includes('box1_')) {
                            maxHp = 3; // 택배박스: 3점
                        }
                    } else {
                        // stage1일 때는 기존 로직 유지
                        const found = levels[currentLevel].find((t) => t.img === brick.img);
                        if (found) maxHp = found.hp;
                    }
                    score += maxHp;
                    $('#score-box').text('점수: ' + score);
                }

                if (isAllBricksCleared()) {
                    setTimeout(() => {
                        console.log('1.5초간 기다립니다.');
                        isGameClear = true;
                        showClearModal(); // 클리어 모달 띄움
                        cancelAnimationFrame(animationId); // 애니메이션 중단
                        animationId = null;
                        if (currentLevel === 2) {
                            clearInterval(timerInterval); // 타이머도 정지 (stage2일 때만)
                        }
                    }, 1500);
                }
            }
        }
    }
}

function isAllBricksCleared() {
    //모든 brick의 hp가 0이라면 true 반환
    return bricks.every((brick) => brick.status === 0 || brick.hp <= 0);
}

function draw() {
    if (isGameClear || isGameOver) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        return;
    }
    // if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(draw);

    if (isGameClear || isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 파워업 상태일 때 캔버스 테두리 그리기
    if (isPowerUp) {
        ctx.strokeStyle = '#FFD700'; // 노란색
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        // 빛나는 효과를 위한 box-shadow 추가
        canvas.style.boxShadow = '0 0 20px #FFD700, 0 0 40px rgba(255, 215, 0, 0.5)';
    } else {
        // 파워업이 아닐 때는 box-shadow 제거
        canvas.style.boxShadow = 'none';
    }

    drawBricks();
    if (!isRespawning) drawBall();
    drawPaddle();
    collisionDetection();
    if (timeLeft <= 0) {
        isGameOver = true;
        console.log('게임 오버');
        showClearModal();
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (isRespawning) return;

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;

    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius - paddleHeight - 8) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            isRespawning = true;
            setTimeout(() => {
                x = canvas.width / 2;
                y = canvas.height - paddleHeight - 15;
                dx = BASE_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
                dy = BASE_SPEED_Y;
                paddleX = (canvas.width - paddleWidth) / 2;
                isRespawning = false;
            }, 3000);
            return;
        }
    }

    x += dx;
    y += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
}

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;

    /***************************마우스가 닿아도 벽돌이 깨짐, 시작*******************************/
    // let relativeY = e.clientY - canvas.getBoundingClientRect().top;

    // if (relativeX > 0 && relativeX < canvas.width) {
    //     paddleX = relativeX - paddleWidth / 2;
    // }

    // for (let brick of bricks) {
    //     if (brick.status === 1) {
    //         if (
    //             relativeX >= brick.x &&
    //             relativeX <= brick.x + brick.w &&
    //             relativeY >= brick.y &&
    //             relativeY <= brick.y + brick.h
    //         ) {
    //             brick.hp--;
    //             if (brick.hp <= 0) {
    //                 brick.status = 2;
    //                 brick.breakStartTime = Date.now();
    //                 if (brick.img.includes('glassCup_1')) {
    //                     brick.breakImg = 'block_images/glassCup_2.PNG';
    //                 } else if (brick.img.includes('plate1_1')) {
    //                     brick.breakImg = 'block_images/plate1_2.PNG';
    //                 } else if (brick.img.includes('frame2_1')) {
    //                     brick.breakImg = 'block_images/frame2_2.PNG';
    //                 }
    //                 setTimeout(() => {
    //                     brick.status = 0;
    //                 }, 300);

    //                 const maxHp = levels[currentLevel].find((t) => t.img === brick.img).hp;
    //                 score += maxHp;
    //                 $('#score-box').text(score);

    //                 if (isAllBricksCleared()) {
    //                     setTimeout(() => {
    //                         isGameClear = true;
    //                         showClearModal();
    //                         cancelAnimationFrame(animationId);
    //                         animationId = null;
    //                     }, 3000);
    //                 }
    //             }
    //         }
    //     }
    // }
    /***************************마우스가 닿아도 벽돌이 깨짐, 끝*******************************/
}

function restartGame() {
    isGameOver = false;
    isGameClear = false;
    isPowerUp = false;
    if (powerUpTimeout) {
        clearTimeout(powerUpTimeout);
        powerUpTimeout = null;
    }
    x = canvas.width / 2;
    y = canvas.height - paddleHeight - 15;
    dx = BASE_SPEED_X * (Math.random() > 0.5 ? 1 : -1);
    dy = BASE_SPEED_Y;
    paddleX = (canvas.width - paddleWidth) / 2;
    currentLevel = 0;
    brickTypes = levels[currentLevel];
    bricks = [];
    randomPlaceBricks();
    $('#restartBtn').hide();
    score = 0;
    $('#score-box').text(score);
    draw();
}
