// 전역 변수 선언
let timeLeft = 30;
let timerInterval = null;
let currentEndImageIndex = 1;
const maxEndImageIndex = 6;
let isGameEndModalShown = false;
let currentImageIndex = 1;
const maxImageIndex = 2;

$(document).ready(function () {
    // 테마 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    if (selectedCatTheme && ['cat1', 'cat2', 'cat3'].includes(selectedCatTheme)) {
        changeBallImage(selectedCatTheme);
    }

    // 테마에 따른 배경 이미지 매핑
    const backgroundThemeMapping = {
        interior1: 'background1.png',
        interior2: 'background2.png',
        interior3: 'background3.png',
    };

    const titleColorMapping = {
        interior1: '#617131',
        interior2: '#878A37',
        interior3: '#AC9903',
    };

    const selectedTheme = localStorage.getItem('selectedInteriorTheme');
    if (selectedTheme && backgroundThemeMapping[selectedTheme]) {
        const backgroundImageName = backgroundThemeMapping[selectedTheme];
        document.body.style.backgroundImage = `url('./images/${backgroundImageName}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        $('.stage-title').css({
            color: titleColorMapping[selectedTheme],
            'border-color': titleColorMapping[selectedTheme],
        });
    } else {
        document.body.style.backgroundImage = `url('./images/background1.png')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        $('.stage-title').css({
            color: '#617131',
            'border-color': '#617131',
        });
    }

    // // 캔버스 안내 텍스트
    // const canvas = document.getElementById('game-canvas');
    // const ctx = canvas.getContext('2d');
    // ctx.font = '32px sans-serif';
    // ctx.fillStyle = '#888';
    // ctx.textAlign = 'center';
    // ctx.fillText('여기서 게임이 시작됩니다!', canvas.width / 2, canvas.height / 2);

    // 인트로 팝업
    $('#intro-modal').fadeIn(200);
    updateIntroArrows();
    updateIntroSkipButton();

    $('.left-arrow').click(function () {
        if (currentImageIndex > 1) {
            currentImageIndex--;
            updateIntroImage();
        }
    });

    $('.right-arrow').click(function () {
        if (currentImageIndex < maxImageIndex) {
            currentImageIndex++;
            updateIntroImage();
        }
    });

    $('#skip-btn').click(function () {
        $('#intro-modal').fadeOut(200, function () {
            // 배경음악 재생
            const bgm = document.getElementById('bgm');
            bgm.volume = 0.5;
            bgm.play();
            
            if (typeof setLevelAndStart === 'function') setLevelAndStart();
            startGameTimer();
        });
    });

    // 인트로 관련 함수
    function updateIntroImage() {
        const introImage = $('#intro-modal .intro-image');
        introImage.fadeOut(200, function () {
            introImage.attr('src', `scenes_images/stage3_${currentImageIndex}.png`);
            introImage.fadeIn(200);
            updateIntroArrows();
            updateIntroSkipButton();
        });
    }

    function updateIntroArrows() {
        $('.left-arrow').css('visibility', currentImageIndex === 1 ? 'hidden' : 'visible');
        $('.right-arrow').css('visibility', currentImageIndex === maxImageIndex ? 'hidden' : 'visible');
    }

    function updateIntroSkipButton() {
        $('#skip-btn').text(currentImageIndex === maxImageIndex ? '게임 시작' : 'SKIP');
    }

    // 게임 종료 관련 함수
    function updateEndImage() {
        const endImage = $('#game-end-modal .intro-image');
        endImage.fadeOut(200, function () {
            endImage.attr('src', `scenes_images/stage3_end_${currentEndImageIndex}.png`);
            endImage.fadeIn(200);
            updateEndArrows();
        });
    }

    function updateEndArrows() {
        $('.left-arrow', '#game-end-modal').css('visibility', currentEndImageIndex === 1 ? 'hidden' : 'visible');
        $('.right-arrow', '#game-end-modal').css(
            'visibility',
            currentEndImageIndex === maxEndImageIndex ? 'hidden' : 'visible'
        );
        $('#game-end-modal #skip-btn').text(currentEndImageIndex === maxEndImageIndex ? '다음' : 'SKIP');
    }

    $('#game-end-modal .left-arrow').click(function () {
        if (currentEndImageIndex > 1) {
            currentEndImageIndex--;
            updateEndImage();
        }
    });

    $('#game-end-modal .right-arrow').click(function () {
        if (currentEndImageIndex < maxEndImageIndex) {
            currentEndImageIndex++;
            updateEndImage();
        }
    });

    $('#game-end-modal #skip-btn').click(function () {
        $('#game-end-modal').fadeOut(200, function () {
            setTimeout(() => {
                $('#clear-modal').fadeIn(200);
            }, 100);
        });
    });

    // function startGameTimer() {
    //     $('#time-remaining').text(timeLeft);
    //     timerInterval = setInterval(function () {
    //         timeLeft--;
    //         $('#time-remaining').text(timeLeft);
    //         if (timeLeft <= 0) {
    //             clearInterval(timerInterval);
    //             if (!isGameEndModalShown) {
    //                 isGameEndModalShown = true;
    //                 $('#intro-modal').hide();
    //                 currentEndImageIndex = 1;
    //                 updateEndImage();
    //                 updateEndArrows();
    //                 $('#game-end-modal').fadeIn(200);
    //             }
    //         }
    //     }, 1000);
    // }

    function startGameTimer() {
        $('#time-remaining').text(timeLeft);
        timerInterval = setInterval(function () {
            timeLeft--;
            $('#time-remaining').text(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showClearModal();
            }
        }, 1000);
    }

    function checkGameEnd() {
        if (bricks.length === 0) {
            setTimeout(() => {
                if (!isGameEndModalShown) {
                    isGameEndModalShown = true;
                    $('#intro-modal').hide();
                    currentEndImageIndex = 1;
                    updateEndImage();
                    updateEndArrows();
                    $('#game-end-modal').fadeIn(200);
                }
            }, 1500);
        }
    }

    function showClearModal() {
        $('.clear-score-btn').text(`점수: ${score}`);
        $('#clear-modal').fadeIn(200);
    }

    $('.clear-next-btn').click(function () {
        window.location.href = 'stage4.html';
    });

    $('.clear-home-btn').click(function () {
        window.location.href = 'home.html';
    });

    function getStageLevelFromFilename() {
        const match = window.location.pathname.match(/stage(\d+)/);
        return match ? parseInt(match[1], 10) - 1 : 0;
    }

    function setLevelAndStart() {
        if (typeof currentLevel !== 'undefined') {
            currentLevel = getStageLevelFromFilename();
            brickTypes = levels[currentLevel];
            randomPlaceBricks();
        }
        if (typeof startGame === 'function') startGame();
    }
});

function initGame() {
    console.log('게임 초기화 시작');
    canvas = document.getElementById('game-canvas');
    if (!canvas) return console.error('Canvas element not found!');
    ctx = canvas.getContext('2d');
    if (!ctx) return console.error('Could not get canvas context!');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    score = 0;
    timeLeft = 30;
    setupEventListeners();
    initImages();
}