// --- BASE DE DATOS DE PRODUCTOS (30 Ítems variados) ---
const productsCatalog = [
    { name: "Mochila", emoji: "🎒" }, { name: "Cuaderno", emoji: "📓" },
    { name: "Lápiz", emoji: "✏️" }, { name: "Colores", emoji: "🖍️" },
    { name: "Regla", emoji: "📏" }, { name: "Lonchera", emoji: "🍱" },
    { name: "Calculadora", emoji: "🧮" }, { name: "Pelota", emoji: "⚽" },
    { name: "Zapatillas", emoji: "👟" }, { name: "Polo", emoji: "👕" },
    { name: "Casaca", emoji: "🧥" }, { name: "Bicicleta", emoji: "🚲" },
    { name: "Laptop", emoji: "💻" }, { name: "Tablet", emoji: "📱" },
    { name: "Libro", emoji: "📚" }, { name: "USB", emoji: "💾" },
    { name: "Mouse", emoji: "🖱️" }, { name: "Teclado", emoji: "⌨️" },
    { name: "Audífonos", emoji: "🎧" }, { name: "Reloj", emoji: "⌚" },
    { name: "Botella", emoji: "🥤" }, { name: "Maleta", emoji: "🧳" },
    { name: "Impresora", emoji: "🖨️" }, { name: "Parlante", emoji: "🔊" },
    { name: "Casco", emoji: "🪖" }, { name: "Patines", emoji: "🛼" },
    { name: "Linterna", emoji: "🔦" }, { name: "Mesa", emoji: "🪵" },
    { name: "Silla", emoji: "🪑" }, { name: "Balón", emoji: "🏀" }
];

// CONFIGURACIONES DE DIFICULTAD
const difficultyConfig = {
    easy: { discounts: [5, 10, 20], minPrice: 20, maxPrice: 100 },
    medium: { discounts: [15, 25, 30], minPrice: 50, maxPrice: 300 },
    hard: { discounts: [40, 50], minPrice: 100, maxPrice: 1000 }
};

// --- ESTADO GLOBAL DEL JUEGO ---
let gameState = {
    username: "",
    difficulty: "",
    currentProblemIndex: 0,
    currentProblemNumber: 1,
    problems: [],
    points: 0,
    coins: 0,
    stars: 0,
    startTime: null,
    timerInterval: null,
    totalSeconds: 0,
    firstAttemptSuccesses: 0,
    completedProblems: 0,
    totalErrors: 0,
    totalAttempts: 0,
    currentStep: 1,
    currentProblemFirstAttemptFailed: false,
    currentStreak: 0,
    maxStreak: 0
};

// --- MOTOR DE AUDIO NATIVO (Sintetizador Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const bgMusic = new Audio(encodeURI('./fondo de musica.mp3'));
bgMusic.preload = 'auto';
bgMusic.loop = true;
bgMusic.volume = 0.35;
bgMusic.muted = false;
bgMusic.load();

function tryPlayBackgroundMusic() {
    if (!bgMusic) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => {
            console.log('No se pudo reanudar AudioContext:', err);
        });
    }

    bgMusic.muted = false;
    bgMusic.volume = 0.35;
    bgMusic.play()
        .then(() => {
            console.log('bgMusic reproducida con éxito');
            localStorage.setItem('bgMusicPlayed', 'true');
        })
        .catch(err => {
            console.log('Error al reproducir bgMusic:', err);
        });
}

function initializeBackgroundMusic() {
    if (localStorage.getItem('bgMusicPlayed')) {
        return;
    }

    document.addEventListener('pointerdown', tryPlayBackgroundMusic, { once: true });
    document.addEventListener('keydown', tryPlayBackgroundMusic, { once: true });
}

bgMusic.addEventListener('error', (event) => console.log('bgMusic error', event));
bgMusic.addEventListener('playing', () => console.log('bgMusic playing'));
bgMusic.addEventListener('canplaythrough', () => console.log('bgMusic canplaythrough'));

initializeBackgroundMusic();

function playSound(type) {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'win') {
            osc.type = 'sine';
            const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
            notes.forEach((freq, idx) => {
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + (idx * 0.08));
            });
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.7);
        }
    } catch (e) {
        console.log("Audio no iniciado o bloqueado por el navegador.");
    }
}

// --- SISTEMA DE NAVEGACIÓN ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- VALIDACIÓN DE LOGIN ---
document.getElementById('btn-login').addEventListener('click', () => {
    playSound('click');
    tryPlayBackgroundMusic();

    const input = document.getElementById('username');
    let name = input.value.trim();
    const errorDiv = document.getElementById('login-error');
    const validPattern = /^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ ]+$/;

    if (name.length < 3 || name.length > 20 || !validPattern.test(name)) {
        errorDiv.innerText = "❌ El nombre debe tener entre 3 y 20 caracteres y no puede usar símbolos extraños.";
        return;
    }

    errorDiv.innerText = "";
    gameState.username = name;
    showScreen('screen-difficulty');
});

// --- SELECCIÓN DE DIFICULTAD ---
document.querySelectorAll('.diff-card').forEach(card => {
    card.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        gameState.difficulty = card.getAttribute('data-level');
    });
});

document.getElementById('btn-start').addEventListener('click', () => {
    playSound('click');
    tryPlayBackgroundMusic();
    if (!gameState.difficulty) {
        alert("Por favor, selecciona una dificultad para jugar.");
        return;
    }
    initGame();
});

// --- INICIALIZACIÓN DEL JUEGO ---
function initGame() {
    gameState.currentProblemIndex = 0;
    gameState.currentProblemNumber = 1;
    gameState.points = 0;
    gameState.coins = 0;
    gameState.stars = 0;
    gameState.totalSeconds = 0;
    gameState.firstAttemptSuccesses = 0;
    gameState.completedProblems = 0;
    gameState.totalErrors = 0;
    gameState.totalAttempts = 0;
    gameState.currentStreak = 0;
    gameState.maxStreak = 0;
    gameState.problems = generateProblems(gameState.difficulty, 30, gameState.username);

    document.getElementById('dash-user').innerText = gameState.username;
    document.getElementById('dash-diff').innerText = translateDiff(gameState.difficulty);
    updateDashboardMetrics();

    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.totalSeconds++;
    }, 1000);

    loadProblem(0);
    showScreen('screen-game');
}

function translateDiff(diff) {
    if (diff === 'easy') return "🟢 Fácil";
    if (diff === 'medium') return "🟡 Medio";
    return "🔴 Difícil";
}

function generateProblems(diff, count, username = '') {
    const config = difficultyConfig[diff];
    let arr = [];
    const seed = username ? username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Date.now();
    const shuffledCatalog = [...productsCatalog].sort((a, b) => ((a.name.charCodeAt(0) + seed) % 100) - ((b.name.charCodeAt(0) + seed) % 100));
    const productList = shuffledCatalog.slice(0, Math.min(count, shuffledCatalog.length));

    for (let i = 0; i < count; i++) {
        const catalogItem = productList[i];
        const discount = config.discounts[Math.floor(Math.random() * config.discounts.length)];
        let price = 0;

        if (diff === 'easy') {
            price = (Math.floor(Math.random() * 9) + 2) * 10;
        } else if (diff === 'medium') {
            const bases = [40, 60, 80, 100, 120, 160, 200, 240, 300];
            price = bases[Math.floor(Math.random() * bases.length)];
        } else {
            const bases = [150, 200, 250, 350, 400, 500, 600, 750, 800, 900, 1000];
            price = bases[Math.floor(Math.random() * bases.length)];
        }

        const calcMult = price * discount;
        const calcDiv = calcMult / 100;
        const finalPrice = price - calcDiv;

        arr.push({
            name: catalogItem.name,
            emoji: catalogItem.emoji,
            price,
            discount,
            multAns: calcMult,
            divAns: calcDiv,
            finalAns: finalPrice
        });
    }

    return arr;
}

function loadProblem(index) {
    gameState.currentProblemIndex = index;
    gameState.currentProblemNumber = index + 1;
    gameState.currentStep = 1;
    gameState.currentProblemFirstAttemptFailed = false;

    const prob = gameState.problems[index];
    document.getElementById('prod-emoji').innerText = prob.emoji;
    document.getElementById('prod-name').innerText = prob.name;
    document.getElementById('prod-price').innerText = prob.price;
    document.getElementById('prod-discount').innerText = prob.discount;

    clearFeedback();
    document.getElementById('final-price-box').style.display = 'none';

    for (let s = 1; s <= 4; s++) {
        document.getElementById(`step-${s}`).classList.remove('active');
    }

    document.getElementById('step-1').classList.add('active');
    setupStepOptions(prob);
    updateStepSummary(1);
    updateDashboardMetrics();
}

function setupStepOptions(prob) {
    createStepOptions('options-s1', shuffleArray([
        { label: `${prob.price} × ${prob.discount}`, isCorrect: true },
        { label: `${prob.price} × ${Math.max(prob.discount - 5, 1)}`, isCorrect: false },
        { label: `${prob.price + 10} × ${prob.discount}`, isCorrect: false }
    ]), () => advanceStep(2, `✅ Correcto: ${prob.price} × ${prob.discount} = ${prob.multAns}`));

    createStepOptions('options-s2', shuffleArray([
        { label: `${prob.multAns} ÷ 100`, isCorrect: true },
        { label: `${prob.multAns + 50} ÷ 100`, isCorrect: false },
        { label: `${prob.multAns} ÷ 10`, isCorrect: false }
    ]), () => advanceStep(3, `✅ Correcto: ${prob.multAns} ÷ 100 = ${prob.divAns}`));

    const discountValue = prob.divAns;
    createStepOptions('options-s3', shuffleArray([
        { label: `S/${discountValue}`, isCorrect: true },
        { label: `S/${discountValue + 10}`, isCorrect: false },
        { label: `S/${Math.max(discountValue - 5, 1)}`, isCorrect: false }
    ]), () => advanceStep(4, `✅ ¡Excelente! El descuento es de S/${discountValue}`));

    createStepOptions('options-s4', shuffleArray([
        { label: `${prob.price} - ${discountValue}`, isCorrect: true },
        { label: `${prob.price} - ${discountValue + 5}`, isCorrect: false },
        { label: `${prob.price} - ${Math.max(discountValue - 5, 1)}`, isCorrect: false }
    ]), () => finalizeProblem(prob));
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function updateStepSummary(stepNumber) {
    const summary = document.getElementById('step-summary');
    const stepText = {
        1: 'multiplicación',
        2: 'división',
        3: 'descuento',
        4: 'resta'
    };

    summary.innerText = `Paso ${stepNumber}/4 · Operación: ${stepText[stepNumber]}`;
}

function createStepOptions(containerId, options, onCorrect) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-btn';
        button.innerText = option.label;
        button.addEventListener('click', () => handleOptionClick(button, option, onCorrect));
        container.appendChild(button);
    });
}

function handleOptionClick(button, option, onCorrect) {
    gameState.totalAttempts++;

    if (option.isCorrect) {
        playSound('success');
        button.classList.add('correct');
        button.disabled = true;
        const buttons = button.parentElement.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);
        onCorrect();
    } else {
        button.disabled = true;
        button.classList.add('incorrect');
        handleError();
        showFeedback('❌ Esa no es la alternativa correcta, intenta otra vez.', false);
    }
}

function advanceStep(stepNumber, successMessage) {
    showFeedback(successMessage, true);
    setTimeout(() => {
        clearFeedback();
        document.querySelectorAll('.step-block').forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        gameState.currentStep = stepNumber;
        updateStepSummary(stepNumber);
    }, 6000);
}

function finalizeProblem(prob) {
    showFeedback('✅ ¡Operación perfecta!', true);
    const finalPriceBox = document.getElementById('final-price-box');
    document.getElementById('final-price-val').innerText = prob.finalAns;
    finalPriceBox.style.display = 'block';

    gameState.completedProblems += 1;
    if (!gameState.currentProblemFirstAttemptFailed) {
        gameState.points += 100;
        gameState.coins += 10;
        gameState.stars += 1;
        gameState.firstAttemptSuccesses++;
        gameState.currentStreak += 1;
        gameState.maxStreak = Math.max(gameState.maxStreak, gameState.currentStreak);
    } else {
        gameState.currentStreak = 0;
    }

    updateDashboardMetrics();

    setTimeout(() => {
        nextProblem();
    }, 6000);
}

function updateDashboardMetrics() {
    document.getElementById('dash-progress').innerText = `${gameState.currentProblemNumber}/30`;
    document.getElementById('dash-corrects').innerText = gameState.firstAttemptSuccesses;
    document.getElementById('dash-errors').innerText = gameState.totalErrors;
    document.getElementById('dash-streak').innerText = gameState.currentStreak;
    const percent = (gameState.currentProblemIndex / 30) * 100;
    document.getElementById('game-progress-bar').style.width = `${percent}%`;
}

function showFeedback(text, isCorrect) {
    const fb = document.getElementById('step-feedback');
    fb.innerText = text;
    fb.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
}

function clearFeedback() {
    const fb = document.getElementById('step-feedback');
    fb.innerText = '';
    fb.className = 'feedback';
}


function handleError() {
    playSound('error');
    gameState.totalErrors++;
    gameState.currentProblemFirstAttemptFailed = true;
    gameState.currentStreak = 0;
    gameState.points = Math.max(0, gameState.points - 15);
    updateDashboardMetrics();
}

function nextProblem() {
    const nextIndex = gameState.currentProblemIndex + 1;
    if (nextIndex < 30) {
        loadProblem(nextIndex);
    } else {
        endGame();
    }
}

function getEndGamePhrase() {
    const percent = Math.round((gameState.firstAttemptSuccesses / 30) * 100);
    if (percent >= 80 && gameState.maxStreak >= 5) {
        return '¡Impresionante! Seguiste concentrado y lo hiciste muy bien.';
    }
    if (percent >= 60) {
        return 'Muy bien. Con un poco más de práctica, lo dominarás totalmente.';
    }
    return 'Buen esfuerzo. Cada intento te ayuda a mejorar, sigue así.';
}

function endGame() {
    clearInterval(gameState.timerInterval);
    playSound('win');

    let medalIcon = '🎖️';
    let medalName = 'Medalla de Participación';

    if (gameState.maxStreak >= 8) {
        medalIcon = '🥇';
        medalName = 'Medalla de Oro';
    } else if (gameState.maxStreak >= 5) {
        medalIcon = '🥈';
        medalName = 'Medalla de Plata';
    } else if (gameState.maxStreak >= 3) {
        medalIcon = '🥉';
        medalName = 'Medalla de Bronce';
    }

    document.getElementById('res-name').innerText = gameState.username;
    document.getElementById('res-diff').innerText = translateDiff(gameState.difficulty);
    document.getElementById('res-accur').innerText = gameState.firstAttemptSuccesses;
    document.getElementById('res-errors').innerText = gameState.totalErrors;
    document.getElementById('res-max-streak').innerText = gameState.maxStreak;
    document.getElementById('res-medal-icon').innerText = medalIcon;
    document.getElementById('res-medal-name').innerText = medalName;

    document.getElementById('res-final-msg').innerText = `🎉 ¡Felicidades, ${gameState.username}! Elegiste ${translateDiff(gameState.difficulty)}. Aciertos: ${gameState.firstAttemptSuccesses}, Fallas: ${gameState.totalErrors}, Racha máxima: ${gameState.maxStreak}. ${getEndGamePhrase()}`;

    const waitNote = document.getElementById('results-wait-note');
    const resultsGrid = document.querySelector('.results-grid');
    const resultsActions = document.querySelector('.results-actions');

    waitNote.innerText = '⌛ Calculando resultados... espera 5 segundos.';
    resultsGrid.style.visibility = 'hidden';
    resultsActions.style.visibility = 'hidden';
    showScreen('screen-results');

    setTimeout(() => {
        resultsGrid.style.visibility = 'visible';
        resultsActions.style.visibility = 'visible';
        waitNote.innerText = '✅ Aquí están tus resultados. Revisa cada dato con atención.';
    }, 5000);
}

document.getElementById('btn-replay').addEventListener('click', () => {
    playSound('click');
    initGame();
});

document.getElementById('btn-exit').addEventListener('click', () => {
    playSound('click');
    window.close();
});
