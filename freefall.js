// 상수
const g = 9.81;  // 중력 가속도 (m/s^2)
const dt = 0.016;  // 시간 간격 (s) - 60 FPS에 맞춤

// 캔버스와 컨텍스트 가져오기
let canvas = document.getElementById('sim-canvas');
let ctx = canvas.getContext('2d');

// 속도 측정기 위치 (캔버스 바닥에서 50픽셀 위)
const groundHeight = 50;
const speedMeterHeight = 50; // 속도 측정기의 높이 (픽셀)
const speedMeterPosition = (canvas.height - groundHeight - speedMeterHeight) / 10; // 위치를 미터 단위로 변환

// 변수
let y = 0;  // 초기 높이 (m)
let v = 0;  // 초기 속도 (m/s)
let t = 0;  // 시간 (s)
let initialHeight = 0; // 초기 높이 저장
let isDragging = false;  // 드래그 상태
let speedMeasured = false; // 속도 측정 여부
let measuredSpeed = 0; // 측정된 속도

// 그리기 함수 (변경 없음)

// 업데이트 함수
function update() {
    v += g * dt;
    y -= v * dt;
    t += dt;

    // 속도 측정기 통과 시 속도 측정
    if (!speedMeasured && y <= speedMeterPosition && y > (speedMeterPosition - speedMeterHeight / 10)) {
        measuredSpeed = v;
        speedMeasured = true;
    }

    // 지면에 닿으면 멈춤
    if (y <= 0) {
        y = 0;
        v = 0;
        cancelAnimationFrame(updateId);
    } else {
        updateId = requestAnimationFrame(update);
    }

    draw();
}

// 마우스 이벤트 핸들러 (변경 없음)

// 초기 그리기
draw();

// updateId 변수 추가
let updateId;
