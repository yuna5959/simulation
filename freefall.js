// 상수
const g = 9.81;  // 중력 가속도 (m/s^2)
const dt = 0.1;  // 시간 간격 (s)
const scale = 10;  // 화면에서 높이를 나타낼 비율 (1m = 10px)
let canvas = document.getElementById('sim-canvas');
let ctx = canvas.getContext('2d');
const groundHeight = 50;  // 지면 높이 (픽셀 단위)
let speedMeterPosition = (canvas.height - groundHeight) / scale;
let y = 10;  // 초기 높이 (m) - 예시로 10m로 설정
let v = 0;  // 초기 속도 (m/s)
let t = 0;  // 시간 (s)
let speedMeasured = false;
let measuredSpeed = 0;
let isDragging = false;  // 드래그 상태
let offsetY = 0;  // 드래그된 위치 차이

// 눈금 그리기 함수
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
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
    ctx.arc(canvas.width / 2, canvas.height - (y * scale) - groundHeight, 30, 0, 2 * Math.PI);
    ctx.fill();

    // 현재 높이 표시
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`높이: ${y.toFixed(2)} m`, 10, 30);

    // 실시간 속도 표시
    ctx.fillText(`속도: ${v.toFixed(2)} m/s`, 10, 60);

    // 측정된 속도 표시 (속도 측정 후)
    if (speedMeasured) {
        ctx.fillText(`측정된 속도: ${measuredSpeed.toFixed(2)} m/s`, 10, 90);
    }
}

// 업데이트 함수
function update() {
    v += g * dt;  // 속도 업데이트
    y -= v * dt;  // 높이 업데이트
    t += dt;  // 시간 업데이트

    // 속도 측정기 통과 시 속도 측정
    if (!speedMeasured && y <= 0) {
        measuredSpeed = v;
        speedMeasured = true;
    }

    // 지면에 닿으면 멈춤
    if (y < 0) {
        y = 0;  // 0m가 지면에 해당
        v = 0;  // 속도 초기화
        draw();  // 그리기
        return;
    }

    draw();  // 그리기
    requestAnimationFrame(update);  // 반복적으로 호출하여 애니메이션 업데이트
}

// 마우스 이벤트 핸들러
canvas.addEventListener('mousedown', function(event) {
    // 공이 클릭된 위치인지 확인
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    let ballX = canvas.width / 2;
    let ballY = canvas.height - (y * scale) - groundHeight;

    // 히트박스를 기존 10픽셀에서 30픽셀로 확장
    const hitboxRadius = 30; 
    if (Math.abs(mouseX - ballX) < hitboxRadius && Math.abs(mouseY - ballY) < hitboxRadius) {
        isDragging = true;
        offsetY = mouseY - ballY;  // 공과 마우스의 차이 저장
        cancelAnimationFrame(updateId);  // 드래그 중 애니메이션 멈추기
    }
});


// 마우스가 움직일 때
canvas.addEventListener('mousemove', function(event) {
    if (isDragging) {
        let rect = canvas.getBoundingClientRect();
        let mouseY = event.clientY - rect.top;
        y = Math.max((canvas.height - mouseY - offsetY - groundHeight) / scale, 0);  // 공 위치를 마우스에 맞추기
        draw();  // 드래그 중에도 그리기
    }
});

// 마우스 버튼을 떼었을 때
canvas.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        v = 0;  // 속도 초기화
        t = 0;  // 시간 초기화
        speedMeasured = false;  // 속도 측정 초기화
        measuredSpeed = 0;  // 측정된 속도 초기화
        update();  // 시뮬레이션 시작
    }
});

// 초기 높이 설정 후 시뮬레이션 자동 시작
y = 10;  // 초기 높이 10m로 설정
v = 0;  // 초기 속도
t = 0;  // 초기 시간
speedMeasured = false;  // 속도 측정 초기화
measuredSpeed = 0;  // 측정된 속도 초기화
update();  // 시뮬레이션 시작

// 초기 그리기
draw();
