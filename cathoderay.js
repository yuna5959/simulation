const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const experimentTypeSelect = document.getElementById('experimentType');
const resetButton = document.getElementById('resetButton');

const electrons = [];
const spawnInterval = 5; // 전자 생성 간격
let frameCount = 0;

// 바람개비 정의
const pinwheel = {
    x: 300,
    y: 200,
    angle: 0,
    rotating: false // 바람개비 회전 상태 추가
};

// 장애물 정의
const obstacle = {
    x: 300,
    y: 150,
    size: 50,
    points: 5
};

function createElectron() {
    const experimentType = experimentTypeSelect.value;

    // 전자 생성 위치 설정
    const yPosition = experimentType === "obstacle" 
        ? 50 + Math.random() * 300 // 장애물 실험에서 넓은 범위로 생성
        : 200; // 자석 및 바람개비 실험에서 한 줄로 생성
    return { x: 50, y: yPosition, vx: 2, vy: 0 };
}

function drawElectron(electron) {
    ctx.beginPath();
    ctx.arc(electron.x, electron.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function drawMagnetField() {
    ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    ctx.fillRect(200, 0, 200, canvas.height);

    // +극 표시
    ctx.fillStyle = "red";
    ctx.fillText("+극", 290, canvas.height - 20);

    // -극 표시
    ctx.fillStyle = "blue";
    ctx.fillText("-극", 290, 20);

    ctx.fillStyle = "black";
    ctx.fillText("자석 영역", 210, 20);
}

function drawPinwheel() {
    ctx.save();
    ctx.translate(pinwheel.x, pinwheel.y);
    ctx.rotate(pinwheel.angle);  // 바람개비 회전 로직
    ctx.fillStyle = "orange";
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, -10);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.fill();
        ctx.rotate(Math.PI / 2);
    }
    ctx.restore();
}

function drawObstacle() {
    const { x, y, size, points } = obstacle;
    ctx.fillStyle = "gray";
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (Math.PI / points) * i;
        const radius = i % 2 === 0 ? size : size / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function isElectronColliding(electron) {
    const dx = electron.x - obstacle.x;
    const dy = electron.y - obstacle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obstacle.size; // 충돌 조건
}

function updateElectron(electron) {
    const experimentType = experimentTypeSelect.value;

    if (experimentType === "magnet" && electron.x > 200 && electron.x < 400) {
        electron.vy += 0.05; // 자석 효과로 전자가 휘어짐
    }

    if (experimentType === "obstacle") {
        if (isElectronColliding(electron)) {
            electrons.splice(electrons.indexOf(electron), 1); // 충돌 시 제거
            return;
        }
    }

    electron.x += electron.vx;
    electron.y += electron.vy;

    // 화면 밖으로 나가면 제거
    if (electron.x > canvas.width || electron.y > canvas.height || electron.y < 0) {
        electrons.splice(electrons.indexOf(electron), 1);
    }
}

function resetSimulation() {
    electrons.length = 0; // 전자 배열 초기화
    pinwheel.angle = 0; // 바람개비 초기화
    pinwheel.rotating = false; // 바람개비 회전 상태 초기화
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const experimentType = experimentTypeSelect.value;

    if (experimentType === "magnet") {
        drawMagnetField();
    } else if (experimentType === "pinwheel") {
        drawPinwheel();
    } else if (experimentType === "obstacle") {
        drawObstacle();
    }

    // 전자 생성
    if (frameCount % spawnInterval === 0) {
        electrons.push(createElectron());
    }

    // 전자 업데이트 및 그리기
    electrons.forEach((electron) => {
        updateElectron(electron);
        drawElectron(electron);

        // 바람개비와 충돌한 전자가 있을 때만 회전 시작
        if (experimentType === "pinwheel" && !pinwheel.rotating) {
            const distance = Math.sqrt(Math.pow(electron.x - pinwheel.x, 2) + Math.pow(electron.y - pinwheel.y, 2));
            if (distance < 50) { // 충돌 범위 내로 전자가 들어오면 회전 시작
                pinwheel.rotating = true;
            }
        }
    });

    // 바람개비 회전
    if (experimentType === "pinwheel" && pinwheel.rotating) {
        pinwheel.angle += 0.05; // 바람개비 회전 속도
    }

    frameCount++;
    requestAnimationFrame(animate);
}

resetButton.addEventListener('click', resetSimulation);

animate();