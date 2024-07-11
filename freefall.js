// 상수
const g = 9.81;  // 중력 가속도 (m/s^2)
const dt = 0.1;  // 시간 간격 (s)

// 캔버스와 컨텍스트 가져오기
let canvas = document.getElementById('sim-canvas');
let ctx = canvas.getContext('2d');

// 속도 측정기 위치 (캔버스 바닥에서 50픽셀 위)
const groundHeight = 50;
const speedMeterPosition = (canvas.height - groundHeight) / 10; // 위치를 미터 단위로 변환

// 변수
let y = 0;  // 초기 높이 (m)
let v = 0;  // 초기 속도 (m/s)
let t = 0;  // 시간 (s)
let initialHeight = 0; // 초기 높이 저장
let isDragging = false;  // 드래그 상태
let speedMeasured = false; // 속도 측정 여부
let measuredSpeed = 0; // 측정된 속도

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
    ctx.fillRect(0, canvas.height - groundHeight - 2, canvas.width, 4);

    // 공 그리기
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - (y + groundHeight / 10) * 10, 10, 0, 2 * Math.PI);
    ctx.fill();

    // 현재 높이 표시
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`높이: ${y.toFixed(2)} m`, 10, 30);

    // 측정된 속도 표시
    if (speedMeasured) {
        ctx.fillText(`측정 속도: ${measuredSpeed.toFixed(2)} m/s`, 10, 60);
    }
}

// 업데이트 함수
function update() {
    v += g * dt;
    y -= v * dt;
    t += dt;

    // 속도 측정기 통과 시 속도 측정
    if (!speedMeasured && y <= 0) {
        measuredSpeed = v;
        speedMeasured = true;
    }

    // 지면에 닿으면 멈춤
    if (y < 0) {
        y = 0;
        v = 0;
        draw();
        return;
    }

    draw();
    requestAnimationFrame(update);
}

// 마우스 이벤트 핸들러
canvas.addEventListener('mousedown', function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = event.clientY - rect.top;
    let ballY = canvas.height - (y + groundHeight / 10) * 10;

    if (Math.abs(mouseY - ballY) < 10) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', function(event) {
    if (isDragging) {
        let rect = canvas.getBoundingClientRect();
        let mouseY = event.clientY - rect.top;
        y = (canvas.height - mouseY - groundHeight) / 10;
        if (y < 0) y = 0;
        draw();
    }
});

canvas.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        initialHeight = y;
        v = 0;
        t = 0;
        speedMeasured = false; // 속도 측정 초기화
    }
});

// 시뮬레이션 시작
document.getElementById('start-btn').addEventListener('click', function() {
    y = initialHeight;
    v = 0;
    t = 0;
    speedMeasured = false; // 속도 측정 초기화
    update();
});

// 초기 그리기
draw();