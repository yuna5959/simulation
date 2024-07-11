// 상수
const g = 9.81;  // 중력 가속도 (m/s^2)
const dt = 0.1;  // 시간 간격 (s)

// 변수
let y = 0;  // 초기 높이 (m)
let v = 0;  // 초기 속도 (m/s)
let t = 0;  // 시간 (s)
let isDragging = false;  // 드래그 상태
let speedMeasured = false; // 속도 측정 여부
let measuredSpeed = 0; // 측정된 속도

// 속도 측정기 위치 (지면에서 약간 위)
const groundHeight = 10; // 지면 높이 (픽셀)
const speedMeterHeight = groundHeight + 20; // 지면 위 20 픽셀 위치
const ballRadius = 15; // 공의 반지름 (픽셀)

// 캔버스와 컨텍스트 가져오기
let canvas = document.getElementById('sim-canvas');
let ctx = canvas.getContext('2d');

// 초기 높이 (화면 상단에서 시작)
const initialHeight = (canvas.height - groundHeight - ballRadius) / 10;

// 눈금 그리기 함수
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; // 눈금 색상
    ctx.lineWidth = 1;
    
    // 가로선 그리기
    for (let i = 0; i <= canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // 세로선 그리기
    for (let i = 0; i <= canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
}

// 그리기 함수
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 눈금 그리기
    drawGrid();

    // 지면 그리기
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

    // 속도 측정기 그리기
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, canvas.height - speedMeterHeight - 2, canvas.width, 4);

    // 공 그리기
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - y * 10 - groundHeight - ballRadius, ballRadius, 0, 2 * Math.PI);
    ctx.fill();

    // 현재 높이 표시
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Current Height: ${(y).toFixed(2)} m`, 10, 30);

    // 측정된 속도 표시
    if (speedMeasured) {
        ctx.fillText(`Measured Speed: ${measuredSpeed.toFixed(2)} m/s`, 10, 60);
    }
}

// 업데이트 함수
function update() {
    v += g * dt;
    y -= v * dt;
    t += dt;

    // 속도 측정기 통과 시 속도 측정
    if (!speedMeasured && y * 10 <= canvas.height - speedMeterHeight - groundHeight - ballRadius) {
        measuredSpeed = v;
        speedMeasured = true;
    }

    // 지면에 닿으면 멈춤
    if (y * 10 - ballRadius <= 0) {
        y = ballRadius / 10;
        v = 0;
    }

    draw();

    if (y * 10 + ballRadius < canvas.height - groundHeight) {
        requestAnimationFrame(update);
    }
}

// 마우스 이벤트 핸들러
canvas.addEventListener('mousedown', function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = event.clientY - rect.top;
    let ballY = canvas.height - y * 10 - groundHeight - ballRadius;

    if (Math.abs(mouseY - ballY) < ballRadius) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', function(event) {
    if (isDragging) {
        let rect = canvas.getBoundingClientRect();
        let mouseY = event.clientY - rect.top;
        y = (canvas.height - mouseY - groundHeight - ballRadius) / 10;
        if (y < 0) y = 0;
        draw();
    }
});

canvas.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        v = 0;
        t = 0;
        speedMeasured = false; // 속도 측정 초기화
    }
});

// 시뮬레이션 시작
document.getElementById('start-btn').addEventListener('click', function() {
    y = initialHeight; // 공을 초기 위치로 설정
    v = 0;
    t = 0;
    speedMeasured = false; // 속도 측정 초기화
    update();
});

// 초기 그리기
draw();
