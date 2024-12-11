const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const simulateButton = document.getElementById('simulateButton');
const resultDiv = document.getElementById('result');

const wavelengthInput = document.getElementById('wavelength');
const metalSelect = document.getElementById('metalSelect');
const intensitySlider = document.getElementById('intensitySlider');
const intensityValue = document.getElementById('intensityValue');

const h = 6.62607015e-34; // 플랑크 상수 (J·s)
const c = 3.0e8; // 빛의 속도 (m/s)
const eV_to_J = 1.60218e-19; // eV -> J 변환

let photons = [];
let electrons = [];
let emitElectrons = false;
let animationId = null;

intensitySlider.addEventListener('input', () => {
    intensityValue.textContent = intensitySlider.value;
});

function calculatePhotonEnergy(wavelength) {
    const lambda = wavelength * 1e-9; // nm -> m
    return (h * c) / lambda;
}

function createPhotons(intensity) {
    photons = [];
    for (let i = 0; i < intensity * 10; i++) {
        photons.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            speedX: 5,
            speedY: 5,
        });
    }
}

function emitElectron(x, y) {
    if (emitElectrons && Math.random() < 0.1) { // 방출 확률 10%
        electrons.push({
            x: x,
            y: y,
            vx: Math.random() * 2 + 1,
            vy: -(Math.random() * 2 + 1),
        });
    }
}

function drawPhotons() {
    ctx.fillStyle = "yellow";
    photons.forEach((photon) => {
        ctx.beginPath();
        ctx.arc(photon.x, photon.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawElectrons() {
    ctx.fillStyle = "blue";
    electrons.forEach((electron) => {
        ctx.beginPath();
        ctx.arc(electron.x, electron.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePhotons() {
    photons.forEach((photon) => {
        photon.x += photon.speedX;
        photon.y += photon.speedY;

        if (photon.x > canvas.width - 300 && photon.y > canvas.height - 150) {
            emitElectron(photon.x, photon.y);
        }
    });
    photons = photons.filter((photon) => photon.x < canvas.width && photon.y < canvas.height);
}

function updateElectrons() {
    electrons.forEach((electron) => {
        electron.x += electron.vx;
        electron.y += electron.vy;
    });
    electrons = electrons.filter(
        (electron) =>
            electron.x > 0 &&
            electron.x < canvas.width &&
            electron.y > 0 &&
            electron.y < canvas.height
    );
}

function drawMetal() {
    ctx.fillStyle = "gray";
    ctx.fillRect(canvas.width - 300, canvas.height - 150, 100, 100);
}

function startSimulation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const wavelength = parseFloat(wavelengthInput.value);
    const workFunction = parseFloat(metalSelect.value);
    const intensity = parseInt(intensitySlider.value);

    const photonEnergy = calculatePhotonEnergy(wavelength);

    if (photonEnergy > workFunction * eV_to_J) {
        emitElectrons = true;
        resultDiv.innerHTML = `전자가 방출되었습니다!`;
    } else {
        emitElectrons = false;
        resultDiv.innerHTML = "광자가 일함수보다 작아 전자가 방출되지 않았습니다.";
    }

    createPhotons(intensity);
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMetal();
    updatePhotons();
    updateElectrons();
    drawPhotons();
    drawElectrons();
    animationId = requestAnimationFrame(animate);
}

function repeatSimulation() {
    startSimulation();
    setTimeout(repeatSimulation, 2000); // 5초 간격으로 반복
}

simulateButton.addEventListener('click', () => {
    repeatSimulation();
    simulateButton.remove(); // 버튼을 제거
});