let timerInterval = null;

$(document).ready(function () {
    // 캔버스 안내 텍스트
    // const canvas = document.getElementById('game-canvas');
    // const ctx = canvas.getContext('2d');
    // ctx.font = '32px sans-serif';
    // ctx.fillStyle = '#888';
    // ctx.textAlign = 'center';
    // ctx.fillText('여기서 게임이 시작됩니다!', canvas.width/2, canvas.height/2);

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

    // 배경 이미지 설정
    const selectedTheme = localStorage.getItem('selectedInteriorTheme');
    console.log('선택된 인테리어 테마:', selectedTheme);
    
    if (selectedTheme && backgroundThemeMapping[selectedTheme]) {
        const backgroundImageName = backgroundThemeMapping[selectedTheme];
        document.body.style.backgroundImage = `url('./images/${backgroundImageName}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        // stage-title 색상 설정
        $('.stage-title').css({
            'color': titleColorMapping[selectedTheme],
            'border-color': titleColorMapping[selectedTheme]
        });
        console.log("배경 이미지 설정:", backgroundImageName);
    } else {
        // 기본 배경 이미지 설정
        document.body.style.backgroundImage = `url('./images/background1.png')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        // 기본 stage-title 색상 설정
        $('.stage-title').css({
            'color': '#617131',
            'border-color': '#617131'
        });
        console.log("기본 배경 이미지 설정: background1.png");
    }

    // 저장된 테마 적용
    const selectedCatTheme = localStorage.getItem('selectedCatTheme');
    console.log('stage1에서 읽은 테마:', selectedCatTheme);

    if (selectedCatTheme) {
        if (selectedCatTheme === 'cat1' || selectedCatTheme === 'cat2' || selectedCatTheme === 'cat3') {
            console.log('테마 적용:', selectedCatTheme);
            changeBallImage(selectedCatTheme);
        }
    }

    // 현재 이미지 인덱스 관리
    let currentImageIndex = 1;
    const maxImageIndex = 7;  // 최대 이미지 번호

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

    // 이미지 변경 함수
    function changeImage(index) {
        const introImage = $('.intro-image');
        introImage.fadeOut(200, function() {
            introImage.attr('src', `scenes_images/stage1_${index}.png`);
            introImage.fadeIn(200);
            updateArrows();  // 이미지 변경 후 화살표 상태 업데이트
        });
    }

    // 오른쪽 화살표 클릭 이벤트
    $('.right-arrow').click(function() {
        if (currentImageIndex < maxImageIndex) {
            currentImageIndex++;
            changeImage(currentImageIndex);
        }
    });

    // 왼쪽 화살표 클릭 이벤트
    $('.left-arrow').click(function() {
        if (currentImageIndex > 1) {
            currentImageIndex--;
            changeImage(currentImageIndex);
        }
    });

    // 인트로 팝업 자동 표시
    $('#intro-modal').fadeIn(200);
    updateArrows();  // 초기 화살표 상태 설정

    // SKIP/게임 시작 버튼 클릭 시 즉시 닫힘
    $('#skip-btn').click(function () {
        $('#intro-modal').fadeOut(200, function () {
            // 배경음악 재생
            const bgm = document.getElementById('bgm');
            bgm.volume = 0.5;
            bgm.play();
            
            if (typeof startGame === 'function') startGame();
            startGameTimer();
        });
    });

    // 제한시간 타이머
    let timeLeft = 30;

    function startGameTimer() {
        $('#time-remaining').text(timeLeft);
        timerInterval = setInterval(function () {
            timeLeft--;
            $('#time-remaining').text(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                isGameClear = true;
                cancelAnimationFrame(animationId);
                animationId = null;
                showClearModal();
            }
        }, 1000);
    }

    // 팝업 버튼 동작
    $('.clear-next-btn').click(function () {
        window.location.href = 'stage2.html';
    });
    $('.clear-home-btn').click(function () {
        window.location.href = 'home.html';
    });

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
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        // 이미지 초기화
        initImages();
    }
});
