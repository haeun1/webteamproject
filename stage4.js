console.log("stage4.js 파일 로드됨");

// jQuery가 로드되었는지 확인
if (typeof jQuery === 'undefined') {
    console.error('jQuery가 로드되지 않았습니다!');
} else {
    console.log('jQuery 버전:', jQuery.fn.jquery);
}

// 전역 변수 선언
let canvas, ctx;
let catImg, handImg, ballImages, brickImages;
let centerX, centerY, score, timeLeft;
let balls = [], bricks = [], particles = [];
let lastSpawn = 0, maxBalls = 3;
let gameStarted = false;
let selectedCatTheme = null;
let currentEndImageIndex = 1;
const maxEndImageIndex = 4;
let backgroundImg = new Image(); // 배경 이미지 객체 추가

let paddle = { x: 0, y: 0, width: 80, height: 80, angle: 0 };
let cat = { x: 50, y: 50, size: 80 };

// 벽돌 타입 정의
const brickTypes = {
    '유리컵': {
        images: ['glassCup_1.PNG', 'glassCup_2.PNG'],
        width: 50,
        height: 50,
        breakDelay: 300 // 0.3초
    },
    '접시': {
        images: ['plate2_1.PNG', 'plate2_2.PNG', 'plate2_3.PNG'],
        width: 60,
        height: 60,
        breakDelay: 300 // 0.3초
    },
    '액자': {
        images: ['frame1_1.PNG', 'frame1_2.PNG', 'frame1_3.PNG'],
        width: 90,  // 액자 크기 증가
        height: 90, // 액자 크기 증가
        breakDelay: 300 // 0.3초
    },
    '택배상자': {
        images: ['box1_1.PNG', 'box1_2.PNG', 'box1_3.PNG'],
        width: 100, // 택배상자 크기 증가
        height: 100, // 택배상자 크기 증가
        breakDelay: 300 // 0.3초
    }
};

// 테마에 따른 고양이 이미지 매핑
const catThemeMapping = {
    'cat1': 'paddle1.PNG',
    'cat2': 'paddle2.PNG',
    'cat3': 'paddle3.PNG'
};

// 전역 변수 추가
let lastCatMove = 0;
let catMoveInterval = 10000; // 10초
let finalBallsCreated = false;
let paddleRadius = 280; // 패들이 움직일 원의 반지름 (벽돌 배치 원보다 약간 더 크게)

// 테마에 따른 배경 이미지 매핑
const backgroundThemeMapping = {
    'interior1': 'background1.png',
    'interior2': 'background2.png',
    'interior3': 'background3.png'
};

// 테마에 따른 stage-title 색상 매핑
const titleColorMapping = {
    'interior1': '#617131',
    'interior2': '#878A37',
    'interior3': '#AC9903'
};

// 게임 초기화 함수
function initGame() {
    console.log("게임 초기화 시작");
    
    // 캔버스 초기화
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // 캔버스 크기 설정
    canvas.width = 800;
    canvas.height = 600;
    
    // 캔버스 스타일 설정
    canvas.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    
    // 게임 변수 초기화
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    score = 0;
    timeLeft = 30;
    
    // 선택된 테마 가져오기 및 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    const selectedInteriorTheme = localStorage.getItem('selectedInteriorTheme');
    
    console.log('선택된 고양이 테마:', selectedCatTheme);
    console.log('선택된 인테리어 테마:', selectedInteriorTheme);
    
    // 인테리어 테마 적용
    if (selectedInteriorTheme && backgroundThemeMapping[selectedInteriorTheme]) {
        const backgroundImageName = backgroundThemeMapping[selectedInteriorTheme];
        document.body.style.backgroundImage = `url('./images/${backgroundImageName}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        $('.stage-title').css({
            'color': titleColorMapping[selectedInteriorTheme],
            'border-color': titleColorMapping[selectedInteriorTheme]
        });
        console.log("배경 이미지 설정:", backgroundImageName);
    } else {
        document.body.style.backgroundImage = `url('./images/background1.png')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        $('.stage-title').css({
            'color': '#617131',
            'border-color': '#617131'
        });
        console.log("기본 배경 이미지 설정: background1.png");
    }

    // 이미지 초기화 호출
    initImages();
    
    // 이벤트 리스너 설정
    setupEventListeners();
}

// 이미지 초기화 함수
function initImages() {
    console.log("이미지 초기화 시작");
    
    catImg = new Image();
    handImg = new Image();
    ballImages = [];
    brickImages = {};
    
    let imagesLoaded = 0;
    let imagesFailed = 0;
    let totalImages = 0;
    
    function checkImagesLoaded() {
        imagesLoaded++;
        console.log(`이미지 로드 진행: ${imagesLoaded}/${totalImages}`);
        if (imagesLoaded + imagesFailed >= totalImages) {
            console.log("모든 이미지 로드 완료");
        }
    }
    
    function handleImageError(img, type) {
        console.error(`${type} 이미지 로드 실패:`, img.src);
        imagesFailed++;
        checkImagesLoaded();
    }
    
    // 선택된 테마 가져오기
    const selectedTheme = localStorage.getItem('selectedCatTheme') || 'cat1';
    console.log('Stage4 - 선택된 고양이 테마:', selectedTheme);
    
    // 고양이 이미지 로드 (테마에 따라)
    const catImageName = catThemeMapping[selectedTheme] || 'paddle1.PNG';
    console.log('Stage4 - 로드할 고양이 이미지:', catImageName);
    catImg.onload = () => {
        console.log('Stage4 - 고양이 이미지 로드 성공:', catImg.src);
        checkImagesLoaded();
    };
    catImg.onerror = () => {
        console.error('Stage4 - 고양이 이미지 로드 실패:', catImg.src);
        handleImageError(catImg, "고양이");
    };
    catImg.src = `./paddle_images/${catImageName}`;
    
    // 패들 이미지 로드 (hand.PNG)
    handImg.onload = checkImagesLoaded;
    handImg.onerror = () => handleImageError(handImg, "손");
    handImg.src = "./images/hand.png";
    
    // 공 이미지 로드 (선택된 테마에 따라 하나의 공 이미지만 사용)
    let ballImageIndex = 1; // 기본값
    if (selectedTheme === 'cat2') {
        ballImageIndex = 2;
    } else if (selectedTheme === 'cat3') {
        ballImageIndex = 3;
    }
    
    const ballImg = new Image();
    ballImg.onload = checkImagesLoaded;
    ballImg.onerror = () => handleImageError(ballImg, "공");
    ballImg.src = `./ball_images/ball${ballImageIndex}.PNG`;
    ballImages = [ballImg]; // 하나의 공 이미지만 사용
    
    // 벽돌 이미지 로드
    Object.entries(brickTypes).forEach(([type, data]) => {
        brickImages[type] = [];
        data.images.forEach((imgName, index) => {
            const img = new Image();
            img.onload = () => {
                console.log(`${type} 이미지 ${index + 1} 로드 성공:`, imgName);
                checkImagesLoaded();
            };
            img.onerror = () => {
                console.error(`${type} 이미지 ${index + 1} 로드 실패:`, imgName);
                handleImageError(img, `${type} ${index + 1}`);
            };
            img.src = `./block_images/${imgName}`;
            brickImages[type].push(img);
        });
    });
    
    // 전체 이미지 수 계산
    totalImages = 2 + ballImages.length + Object.values(brickTypes).reduce((sum, type) => sum + type.images.length, 0);
}

// 게임 시작 함수
function startGame() {
    
    console.log("게임 시작 함수 호출됨");
    if (gameStarted) {
        console.log("이미 게임이 시작되어 있음");
        return;
    }
    
    try {
        // 게임 상태 초기화
        gameStarted = true;
        score = 0;
        timeLeft = 30;
        balls = [];
        bricks = [];
        lastCatMove = Date.now();
        finalBallsCreated = false;
        
        // 고양이 초기 위치 설정
        const isLeftSide = Math.random() < 0.5;
        cat.x = isLeftSide ? 50 : canvas.width - cat.size - 50;
        cat.y = Math.random() * (canvas.height - cat.size - 100) + 50;
        
        // 게임 요소 생성
        createBricks();
        createBall();
        
        // 타이머 시작
        const timerInterval = setInterval(() => {
            if (timeLeft > 0 && gameStarted) {
                timeLeft--;
                $('#time-remaining').text(timeLeft);
                
                if (timeLeft === 10 && !finalBallsCreated) {
                    balls = [];
                    for (let i = 0; i < 3; i++) {
                        createBall();
                    }
                    finalBallsCreated = true;
                }
            } else {
                clearInterval(timerInterval);
                if (gameStarted) {
                    gameStarted = false;
                    $('#game-end-modal .intro-image').attr('src', 'scenes_images/stage4_end_1.png');
                    $('#game-end-modal').fadeIn(200, function() {
                        currentEndImageIndex = 1;
                        updateEndArrows();
                        console.log("게임 종료 팝업 표시됨 (시간 초과)");
                    });
                }
            }
        }, 1000);
        
        // 게임 루프 시작
        requestAnimationFrame(gameLoop);
        console.log("게임 루프 시작됨");
    } catch (error) {
        console.error('게임 시작 에러:', error);
        gameStarted = false;
    }
}

// 게임 루프 함수
function gameLoop() {
    if (!gameStarted) return;
    
    try {
        // 화면 클리어 (투명하게)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 게임 요소 업데이트 및 그리기
        updateBalls();
        drawBricks();
        drawCat();
        drawPaddle();
        drawBalls();
        updateScore();
        
        // 고양이 위치 변경 및 공 생성
        const currentTime = Date.now();
        if (currentTime - lastCatMove > catMoveInterval) {
            // 고양이가 왼쪽에 있으면 오른쪽으로, 오른쪽에 있으면 왼쪽으로 이동
            const isLeftSide = cat.x < canvas.width / 2;
            cat.x = isLeftSide ? canvas.width - cat.size - 50 : 50;
            
            // 위아래로만 랜덤하게 이동
            cat.y = Math.random() * (canvas.height - cat.size - 100) + 50; // 50px 마진
            lastCatMove = currentTime;
            
            // 마지막 10초에 3개의 공 생성
            if (timeLeft <= 10 && !finalBallsCreated) {
                // 기존 공 제거
                balls = [];
                // 3개의 새로운 공 생성
                for (let i = 0; i < 3; i++) {
                    createBall();
                }
                finalBallsCreated = true;
            } else if (timeLeft > 10) {
                // 일반적인 경우 하나의 공만 생성
                createBall();
            }
        }
        
        // 다음 프레임 요청
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('게임 루프 에러:', error);
        gameStarted = false;
    }
}

// DOM이 로드되면 게임 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM 로드 완료");
    // 게임 초기화만 하고 자동 시작하지 않음
    initGame();
});

// 게임 종료 이미지 변경 함수
function changeEndImage(index) {
    console.log("changeEndImage 호출됨, index:", index);
    const endImage = $('#game-end-modal .intro-image');
    endImage.fadeOut(200, function() {
        endImage.attr('src', `scenes_images/stage4_end_${index}.png`);
        endImage.fadeIn(200);
        updateEndArrows();
    });
}

// jQuery ready 이벤트
$(document).ready(function() {
    console.log("jQuery ready");
    
    // 현재 이미지 인덱스 관리
    let currentImageIndex = 1;
    const maxImageIndex = 5;  // 인트로 최대 이미지 번호

    // 화살표 표시/숨김 업데이트 함수
    function updateArrows() {
        if (currentImageIndex === 1) {
            $('.left-arrow').css('visibility', 'hidden');
        } else {
            $('.left-arrow').css('visibility', 'visible');
        }

        if (currentImageIndex === maxImageIndex) {
            $('.right-arrow').css('visibility', 'hidden');
            $('#skip-btn').text('게임 시작');
        } else {
            $('.right-arrow').css('visibility', 'visible');
            $('#skip-btn').text('SKIP');
        }
    }

    // SKIP/게임 시작 버튼 클릭 이벤트
    $('#skip-btn').click(function() {
        console.log("SKIP/게임 시작 버튼 클릭됨");
        if ($('#intro-modal').is(':visible')) {
            if (currentImageIndex === maxImageIndex && $(this).text() === '게임 시작') {
                // 마지막 이미지에서 '게임 시작' 버튼을 클릭했을 때만 게임 시작
                $('#intro-modal').fadeOut(200, function() {
                    // 배경음악 재생
                    const bgm = document.getElementById('bgm');
                    bgm.volume = 0.5;
                    bgm.play();
                    
                    console.log("인트로 모달 닫힘, 게임 시작 호출");
                    startGame();
                });
            } else {
                // 마지막 이미지가 아니거나 SKIP 버튼일 때는 마지막 이미지로 이동
                currentImageIndex = maxImageIndex;
                changeImage(currentImageIndex);
            }
        }
    });

    // 게임 종료 팝업의 SKIP/다음 버튼 클릭 이벤트
    $(document).on('click', '#game-end-modal #skip-btn', function() {
        console.log("게임 종료 팝업의 SKIP/다음 버튼 클릭됨");
        $('#game-end-modal').fadeOut(200, function() {
            console.log("게임 종료 팝업이 사라짐");
            setTimeout(function() {
                // 점수 버튼의 텍스트를 바로 설정
                $('.clear-score-btn').text(`수리비: ${score}원`);
                $('#clear-modal').fadeIn(200);
                console.log("스테이지 클리어 팝업 표시됨");
            }, 100);
        });
    });

    // 스테이지 클리어 팝업의 홈으로 버튼 클릭 이벤트
    $(document).on('click', '.clear-home-btn', function() {
        console.log("홈으로 버튼 클릭됨");
        window.location.href = 'home.html';
    });

    // 오른쪽 화살표 클릭 이벤트
    $(document).on('click', '.right-arrow', function() {
        console.log("오른쪽 화살표 클릭됨");
        if ($('#intro-modal').is(':visible')) {
            if (currentImageIndex < maxImageIndex) {
                currentImageIndex++;
                changeImage(currentImageIndex);
            }
        } else if ($('#game-end-modal').is(':visible')) {
            if (currentEndImageIndex < maxEndImageIndex) {
                currentEndImageIndex++;
                changeEndImage(currentEndImageIndex);
            }
        }
    });

    // 왼쪽 화살표 클릭 이벤트
    $(document).on('click', '.left-arrow', function() {
        console.log("왼쪽 화살표 클릭됨");
        if ($('#intro-modal').is(':visible')) {
            if (currentImageIndex > 1) {
                currentImageIndex--;
                changeImage(currentImageIndex);
            }
        } else if ($('#game-end-modal').is(':visible')) {
            if (currentEndImageIndex > 1) {
                currentEndImageIndex--;
                changeEndImage(currentEndImageIndex);
            }
        }
    });

    // 이미지 변경 함수
    function changeImage(index) {
        const introImage = $('.intro-image');
        introImage.fadeOut(200, function() {
            introImage.attr('src', `scenes_images/stage4_${index}.png`);
            introImage.fadeIn(200);
            updateArrows();
        });
    }

    // 인트로 팝업 자동 표시
    $('#intro-modal').fadeIn(200);
    updateArrows();

    // 이미지 초기화는 하되 게임은 시작하지 않음
    initImages();
});

console.log("JS 파일 로드됨");

// 게임 함수들
function createBall() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 2; // 속도에 약간의 랜덤성 추가
    balls.push({
        x: cat.x + cat.size / 2,
        y: cat.y + cat.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        radius: 15,
        imageIndex: 0
    });
}

function createBricks() {
    bricks = [];
    const types = Object.keys(brickTypes);
    const minRadius = 80; // Reduced from 120 to move bricks even more inside
    const maxRadius = 180; // Reduced from 220 to keep bricks closer to center
    const minSpacing = 60; // Minimum spacing between bricks
    
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    while (bricks.length < 15 && attempts < maxAttempts) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const type = types[Math.floor(Math.random() * types.length)];
        const brickType = brickTypes[type];
        
        // Check if position would be valid (inside canvas with margin)
        const margin = 20;
        const adjustedX = Math.max(margin, Math.min(canvas.width - brickType.width - margin, x));
        const adjustedY = Math.max(margin, Math.min(canvas.height - brickType.height - margin, y));
        
        // Check spacing with existing bricks
        let tooClose = false;
        for (const brick of bricks) {
            const dx = adjustedX - brick.x;
            const dy = adjustedY - brick.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minSpacing) {
                tooClose = true;
                break;
            }
        }
        
        if (!tooClose) {
            bricks.push({
                x: adjustedX,
                y: adjustedY,
                w: brickType.width,
                h: brickType.height,
                hp: 2,
                maxHp: 2,
                name: type,
                breakTimer: null,
                isBreaking: false,
                hitCount: 0
            });
        }
        
        attempts++;
    }
}

function drawBricks() {
    bricks.forEach(brick => {
        try {
            const type = brickTypes[brick.name];
            if (type && brickImages[brick.name]) {
                let imgIndex = 0;
                
                if (brick.name === '유리컵' && brick.isBreaking) {
                    imgIndex = 1; // glassCup_2.PNG 사용
                } else if (brick.name === '액자' || brick.name === '택배상자' || brick.name === '접시') {
                    imgIndex = Math.min(brick.hitCount, type.images.length - 1); // 이미지 인덱스 범위 제한
                }
                
                const img = brickImages[brick.name][imgIndex];
                if (img && img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(img, brick.x, brick.y, brick.w, brick.h);
                } else {
                    console.warn(`${brick.name} 이미지 로드 실패:`, type.images[imgIndex]);
                    // 이미지가 로드되지 않은 경우 기본 사각형 그리기
                    ctx.fillStyle = '#ADD8E6';
                    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
                }
            }
        } catch (error) {
            console.error('벽돌 그리기 에러:', error);
            // 에러 발생 시 기본 사각형 그리기
            ctx.fillStyle = '#ADD8E6';
            ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        }
    });
}

function drawPaddle() {
    try {
        const x = centerX + Math.cos(paddle.angle) * paddleRadius;
        const y = centerY + Math.sin(paddle.angle) * paddleRadius;

        if (handImg && handImg.complete && handImg.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(paddle.angle + Math.PI); // 180도 회전
            ctx.drawImage(handImg, -paddle.width / 2, -paddle.height / 2, paddle.width, paddle.height);
            ctx.restore();
        } else {
            // 이미지가 로드되지 않은 경우 기본 사각형 그리기
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x - paddle.width/2, y - paddle.height/2, paddle.width, paddle.height);
        }
    } catch (error) {
        console.error('패들 그리기 에러:', error);
    }
}

function drawBalls() {
    balls.forEach(ball => {
        try {
            const img = ballImages[0]; // 항상 동일한 공 이미지 사용
            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
            } else {
                // 이미지가 로드되지 않은 경우 기본 원 그리기
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.closePath();
            }
        } catch (error) {
            console.error('공 그리기 에러:', error);
            // 에러 발생 시 기본 원 그리기
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.closePath();
        }
    });
}

function drawCat() {
    try {
        if (catImg && catImg.complete && catImg.naturalWidth !== 0) {
            ctx.drawImage(catImg, cat.x, cat.y, cat.size, cat.size);
        } else {
            // 이미지가 로드되지 않은 경우 기본 사각형 그리기
            ctx.fillStyle = '#FFA500';
            ctx.fillRect(cat.x, cat.y, cat.size, cat.size);
        }
    } catch (error) {
        console.error('고양이 그리기 에러:', error);
        // 에러 발생 시 기본 사각형 그리기
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(cat.x, cat.y, cat.size, cat.size);
    }
}

function updateScore() {
    $('#score-box').text(`수리비: ${score}원`);
}

function updateBalls() {
    balls.forEach(ball => {
        // 공의 다음 위치 계산
        const nextX = ball.x + ball.dx;
        const nextY = ball.y + ball.dy;

        // 경계 체크 및 위치 조정
        if (nextX - ball.radius < 0) {
            ball.x = ball.radius;
            ball.dx = Math.abs(ball.dx);
        } else if (nextX + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.dx = -Math.abs(ball.dx);
        } else {
            ball.x = nextX;
        }

        if (nextY - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy = Math.abs(ball.dy);
        } else if (nextY + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.dy = -Math.abs(ball.dy);
        } else {
            ball.y = nextY;
        }

        // 패들 충돌
        const px = centerX + Math.cos(paddle.angle) * paddleRadius;
        const py = centerY + Math.sin(paddle.angle) * paddleRadius;
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
                if (brick.name === '유리컵' && !brick.isBreaking) {
                    brick.hp--;
                    brick.isBreaking = true;
                    score += 100;  // 유리컵 hit price
                    
                    // 0.3초 후 벽돌 제거
                    brick.breakTimer = setTimeout(() => {
                        const index = bricks.indexOf(brick);
                        if (index > -1) {
                            bricks.splice(index, 1);
                            score += 100;  // 유리컵 break bonus
                            checkGameEnd();
                        }
                    }, brickTypes['유리컵'].breakDelay);
                } else if (brick.name === '액자') {
                    brick.hitCount++;
                    score += 300;  // 액자 hit price
                    
                    if (brick.hitCount >= 2 && !brick.isBreaking) {
                        brick.isBreaking = true;
                        brick.breakTimer = setTimeout(() => {
                            const index = bricks.indexOf(brick);
                            if (index > -1) {
                                bricks.splice(index, 1);
                                score += 300;  // 액자 break bonus
                                checkGameEnd();
                            }
                        }, brickTypes['액자'].breakDelay);
                    }
                } else if (brick.name === '택배상자') {
                    brick.hitCount++;
                    score += 500;  // 택배상자 hit price
                    
                    if (brick.hitCount >= 2 && !brick.isBreaking) {
                        brick.isBreaking = true;
                        brick.breakTimer = setTimeout(() => {
                            const index = bricks.indexOf(brick);
                            if (index > -1) {
                                bricks.splice(index, 1);
                                score += 500;  // 택배상자 break bonus
                                checkGameEnd();
                            }
                        }, brickTypes['택배상자'].breakDelay);
                    }
                } else if (brick.name === '접시') {
                    brick.hitCount++;
                    score += 200;  // 접시 hit price
                    
                    if (brick.hitCount >= 2 && !brick.isBreaking) {
                        brick.isBreaking = true;
                        brick.breakTimer = setTimeout(() => {
                            const index = bricks.indexOf(brick);
                            if (index > -1) {
                                bricks.splice(index, 1);
                                score += 200;  // 접시 break bonus
                                checkGameEnd();
                            }
                        }, brickTypes['접시'].breakDelay);
                    }
                }
                ball.dy *= -1;
            }
        });
    });
}

// 게임 종료 체크 함수
function checkGameEnd() {
    if (bricks.length === 0) {
        // 모든 벽돌이 깨졌을 때 1.5초 후에 게임 종료
        setTimeout(() => {
            if (gameStarted) {  // 게임이 아직 진행 중인지 확인
                gameStarted = false;
                // 게임 종료 팝업 표시 전에 이미지 초기화
                $('#game-end-modal .intro-image').attr('src', 'scenes_images/stage4_end_1.png');
                // 게임 종료 팝업 표시
                $('#game-end-modal').fadeIn(200, function() {
                    // 팝업이 표시된 후 화살표 상태 업데이트
                    currentEndImageIndex = 1;
                    updateEndArrows();
                    console.log("게임 종료 팝업 표시됨 (벽돌 파괴)");
                });
            }
        }, 1500);
    }
}

// 마우스 이벤트 리스너
function setupEventListeners() {
    if (!canvas) return;
    
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const dx = e.clientX - rect.left - centerX;
        const dy = e.clientY - rect.top - centerY;
        paddle.angle = Math.atan2(dy, dx);
    });
}

// 게임 종료 화살표 표시/숨김 업데이트 함수
function updateEndArrows() {
    console.log("updateEndArrows 호출됨, currentEndImageIndex:", currentEndImageIndex);
    const leftArrow = $('#game-end-modal .left-arrow');
    const rightArrow = $('#game-end-modal .right-arrow');
    const skipBtn = $('#game-end-modal #skip-btn');
    
    if (currentEndImageIndex === 1) {
        leftArrow.css('visibility', 'hidden');
        skipBtn.text('SKIP');
    } else {
        leftArrow.css('visibility', 'visible');
    }

    if (currentEndImageIndex === maxEndImageIndex) {
        rightArrow.css('visibility', 'hidden');
        skipBtn.text('다음');
    } else {
        rightArrow.css('visibility', 'visible');
        if (currentEndImageIndex !== 1) {
            skipBtn.text('SKIP');
        }
    }
}

