const canvas = document.getElementById("sim-canvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");

// 트랙상의 점 좌표 배열
const points = [
    { x: 10, y: 100 },  // 시작점
    { x: 300, y: 110 }, // 두 번째 점 (고정)
    { x: 500, y: 100 },
    { x: 700, y: 100 },
    { x: 900, y: 100 },
    { x: 1190, y: 100 }  // 종료점
];

let draggingPoint = null;  // 드래그 중인 점
let t = 0;                 // 트랙의 진행 비율 (0 ~ 1)
let velocity = 0;          // 공의 X축 이동 속도
const gravity = 0.0002;    // 중력 가속도
let isAnimating = false;   // 애니메이션 실행 여부
const mass = 1;            // 공의 질량 (단위: kg)

// 마우스 드래그 시작 이벤트 핸들러
function onMouseDown(event) {
    if (isAnimating) return; // 애니메이션 중이면 드래그 비활성화

    const { offsetX, offsetY } = event;
    points.forEach((point, index) => {
        if (index > 0 && index < points.length - 1 && index !== 1) {
            const dx = point.x - offsetX;
            const dy = point.y - offsetY;
            if (Math.sqrt(dx * dx + dy * dy) < 10) {
                draggingPoint = point;
            }
        }
    });
}

// 마우스 이동 이벤트 핸들러
function onMouseMove(event) {
    if (!draggingPoint || isAnimating) return;

    const { offsetY } = event;
    draggingPoint.y = Math.max(50, Math.min(offsetY, canvas.height - 50));
    drawScene(); // 화면 갱신
}

// 마우스 드래그 종료 이벤트 핸들러
function onMouseUp() {
    draggingPoint = null;
}

// 캔버스에 마우스 이벤트 연결
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mouseup", onMouseUp);

// 주어진 트랙의 t 값에서 위치 계산 (Bezier Curve)
function getPointAt(t) {
    const segmentCount = points.length - 1;
    const segment = Math.floor(t * segmentCount);
    const localT = (t * segmentCount) - segment;

    const p0 = points[segment];
    const p1 = points[segment + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p1.x - (p1.x - p0.x) / 3;
    const cpY2 = p1.y;

    const x = (1 - localT) ** 3 * p0.x +
              3 * (1 - localT) ** 2 * localT * cpX1 +
              3 * (1 - localT) * localT ** 2 * cpX2 +
              localT ** 3 * p1.x;

    const y = (1 - localT) ** 3 * p0.y +
              3 * (1 - localT) ** 2 * localT * cpY1 +
              3 * (1 - localT) * localT ** 2 * cpY2 +
              localT ** 3 * p1.y;

    return { x, y };
}

// 주어진 트랙의 t 값에서 기울기 계산
function getSlopeAt(t) {
    const pos = getPointAt(t);
    const nextPos = getPointAt(t + 0.01);
    const deltaX = nextPos.x - pos.x;
    const deltaY = nextPos.y - pos.y;

    if (deltaX === 0) return 0;

    const slope = deltaY / deltaX;
    return slope * gravity;
}

// 글로벌 변수 초기화
let previousPotentialEnergy = mass * gravity * (canvas.height - points[0].y);  // 초기 위치 에너지 저장

// 트랙과 공을 그리는 함수
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Y=100인 빨간색 점선 추가
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 100);
    ctx.lineTo(canvas.width, 100);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // 트랙을 따라 그리기
    ctx.beginPath();
    ctx.moveTo(points[0].x, canvas.height);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
        const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
        const cpY1 = points[i].y;
        const cpX2 = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
        const cpY2 = points[i + 1].y;

        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, points[i + 1].x, points[i + 1].y);
    }

    ctx.lineTo(points[points.length - 1].x, canvas.height);
    ctx.closePath();

    ctx.fillStyle = "lightgray";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = (index === 0 || index === points.length - 1) ? "gray" : (index === 1 ? "darkgray" : "blue");
        ctx.fill();
        ctx.stroke();
    });

    const coasterPos = getPointAt(t);
    ctx.beginPath();
    ctx.arc(coasterPos.x, coasterPos.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.stroke();

    drawEnergyBars(coasterPos);
}

// 에너지 막대 그리기 함수 수정
function drawEnergyBars(position) {
    const height = canvas.height - position.y;

    // 초기 위치에서의 위치 에너지 저장
    const initialPotentialEnergy = mass * gravity * (canvas.height - 100);

    // 현재 위치에서의 위치 에너지 계산
    const currentPotentialEnergy = mass * gravity * height;

    // 운동 에너지 계산: PE_initial - PE_current
    const kineticEnergy = initialPotentialEnergy - currentPotentialEnergy;

    const maxHeight = canvas.height - 50;
    const maxEnergy = mass * gravity * maxHeight;

    const potentialBarHeight = (currentPotentialEnergy / maxEnergy) * 200;
    const kineticBarHeight = (kineticEnergy / maxEnergy) * 200;

    const barWidth = 30;
    const barXOffset = canvas.width - 100;

    // 위치 에너지 막대 그리기
    ctx.fillStyle = "blue";
    ctx.fillRect(barXOffset, canvas.height - potentialBarHeight - 20, barWidth, potentialBarHeight);

    // 수정된 운동 에너지 막대 그리기
    ctx.fillStyle = "green";
    ctx.fillRect(barXOffset + barWidth + 10, canvas.height - kineticBarHeight - 20, barWidth, kineticBarHeight);

    // 레이블 표시
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("PE", barXOffset + 5, canvas.height - potentialBarHeight - 25);
    ctx.fillText("KE", barXOffset + barWidth + 15, canvas.height - kineticBarHeight - 25);

    previousPotentialEnergy = currentPotentialEnergy;  // 이전 PE 값 갱신
}

function animate() {
    if (!isAnimating) return;

    const acceleration = getSlopeAt(t);
    velocity += acceleration;
    t += velocity;

    if (t >= 1 || t <= 0) {
        velocity = 0;
        t = Math.max(0, Math.min(1, t));
    }

    drawScene();
    requestAnimationFrame(animate);
}

startButton.addEventListener("click", () => {
    if (!isAnimating) {
        isAnimating = true;
        t = 0;
        velocity = 0;
        resetButton.disabled = false;
        animate();
    }
});

resetButton.addEventListener("click", () => {
    isAnimating = false;
    t = 0;
    velocity = 0;
    drawScene();
    resetButton.disabled = true;
    startButton.disabled = false;
});

resetButton.disabled = true;
drawScene();
