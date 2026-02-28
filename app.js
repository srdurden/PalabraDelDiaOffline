const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];
const STATE_PRIORITY = { absent: 1, present: 2, correct: 3 };
const CACHE_BUST_DELAY = 120;
const WIN_PHRASES = {
  1: [
    '¿Pero esto qué es? ¿Un Wordle o una demostración de superpoderes? ¡A la primera!',
    'Has acertado en 1 intento… Esto no es jugar, es dictar la realidad. 👑',
    'La palabra ni apareció: tú la invocaste. Primer intento. Brujería premium.',
    'Acertar a la primera debería pagar impuestos. Lo tuyo es ilegal de lo bueno que es.',
    'Enhorabuena: acabas de humillar al diccionario delante de todo el mundo.',
    '¿Te has metido el Wordle en vena? Porque esto ha sido telepatía con letras.',
    'Primer intento y ya estás en modo ‘oráculo lingüístico’. Se acabó el juego.',
    'La app está revisando si eres humana. Spoiler: no lo eres. ¡Qué barbaridad!',
    'Esto no es intuición: es puntería de francotiradora, pero con vocales.',
    'A la primera… con esa precisión podrías aparcar en Barcelona sin mirar.',
    'El Wordle ha pedido un descanso. Dice que contigo no se puede competir.',
    'Has hecho ‘clic’ y la palabra se rindió. Primera. Sin negociación.',
    'Te doy el trofeo, el diploma y el respeto eterno del abecedario.',
    'Acertar en 1 intento es de gente que lee mentes… o que manda en el universo.',
    'Se acaba de escuchar un ‘¡WOW!’ en la RAE. No preguntes por qué.'
  ],
  2: [
    'Dos intentos… lo justo para que el juego no se deprima. ¡Qué elegancia!',
    'Has tardado 2 porque eres humilde. Podías en 1, pero has querido darle emoción.',
    'Segundo intento y ya estás marcando territorio. Aquí manda tu cerebro.',
    'Esto ha sido: ‘vale, suficiente, ahora gano’. Y ganaste. En 2.',
    'Dos intentos: precisión quirúrgica. Ni un punto de pánico, solo clase.',
    'Has calentado una ronda y luego: ZAS. Victoria con estilo.',
    'El Wordle intentó resistirse… dos segundos. Literalmente.',
    'Tu estrategia: observar, sonreír… y rematar en el segundo. Queen behavior.',
    'En 2 intentos has demostrado que la palabra estaba alquilada a tu nombre.',
    'El juego estaba confiado… hasta que tú dijiste ‘ahora sí’ y se acabó.',
    'Segundo intento: como quien saca el móvil y encuentra cobertura en un sótano. Magia.',
    'La palabra se te escapó 1 vez por cortesía. En 2 ya fue captura total.',
    'Dos intentos y ni sudas. Esto es abuso de talento, pero me encanta.',
    'Has hecho un ‘amago’ y luego gol por la escuadra. En 2. 🥅',
    'Si esto fuera ajedrez, sería mate en 2… pero con consonantes.'
  ],
  3: [
    'Tres intentos… porque te gusta el suspense, pero el final lo firmas tú.',
    'Tercer intento: exactitud de cirujana. Corto, limpio, perfecto.',
    'Has cocinado la palabra a fuego lento y ha salido Michelin. 🍽️',
    'Tres intentos y el juego ya te trata de ‘usted’. Respeto máximo.',
    'Esto no es resolver: es negociar con el abecedario y salir ganando.',
    'Has hecho scouting de letras y luego fichaje estrella en el 3º. Crack.',
    'Tercer intento: la palabra se resistía, pero tú tienes más paciencia que ella.',
    'Te has tomado 3 para que parezca justo. Gracias por tu generosidad con la humanidad.',
    'En 3 intentos has demostrado que el caos también se puede domar.',
    'El Wordle ya estaba nervioso… tú tranquila, tú profesional.',
    'Tres intentos: eficiencia. Ni rápido por prisa, ni lento por duda. Perfecto.',
    'Has mirado la palabra a los ojos y ha dicho: ‘vale, me rindo’.',
    'Esto fue un ‘estudio de caso’ y luego una ejecución impecable. En 3.',
    'Tercer intento: como abrir un tarro difícil. Con técnica y autoridad.',
    'Ganar en 3 es ganar con clase: ni show-off ni drama. Solo excelencia.'
  ],
  4: [
    'Cuarto intento… esto ya era cine, y tú la protagonista.',
    'Has montado una remontada elegante: tensión, giro final y victoria.',
    'En 4 intentos has demostrado que el drama también puede ser eficiente. 🎭',
    'La palabra se escondía… mala idea. Tú tienes linterna y determinación.',
    'Cuarto intento: estrategia de general. Reconocer terreno y atacar perfecto.',
    'Esto fue un ‘te dejo respirar’ y luego te cierro el partido. En 4.',
    'El juego pensó que te pillaba… y tú: ‘ja’. Victoria.',
    'Has jugado con paciencia de monja y precisión de láser. ¡Toma!',
    'Cuatro intentos: la palabra ya estaba haciendo las maletas.',
    'Ese final ha sido tan limpio que debería venir con aplausos enlatados.',
    'En 4 intentos: no es suerte, es control absoluto del caos.',
    'Has ido a por ella como quien busca algo en el bolso: al final siempre aparece.',
    'El Wordle ha intentado asustarte… y tú has bostezado y has ganado.',
    'Cuarto intento: el punto exacto entre ‘uy’ y ‘toma, resuelto’.',
    'Ganar en 4 es de gente que disfruta el viaje… y aun así llega primera.'
  ],
  5: [
    'Quinto intento… aquí ya no gana cualquiera: gana quien tiene nervios de acero. Y tú sobrada.',
    'Esto fue un thriller psicológico… y tú la que escribe el guion. Victoria en 5.',
    'En 5 intentos has demostrado que la presión te alimenta. 😈',
    'Te has paseado por el borde del abismo y has vuelto con la palabra en la mano.',
    'Quinto intento: supervivencia premium. Eso es temple.',
    'El Wordle ya estaba celebrando… hasta que tú dijiste ‘no’. Y ganó tu ‘no’.',
    'Has aguantado el drama como una campeona y has rematado con precisión.',
    'En 5: la palabra se creyó importante… error. Tú más.',
    'Esto fue como encontrar aparcamiento un sábado: milagro, pero con talento.',
    'Quinto intento y ni una lágrima: solo técnica, calma y triunfo.',
    'Has hecho de una situación límite una victoria con estilo. Icono.',
    'La palabra intentó colarse… pero tú la pillaste por el tobillo. Vuelve aquí.',
    'Ganar en 5 es de gente con cabeza fría y corazón caliente. 👏',
    'Esto fue ‘me quedan pocas’ y aun así: ‘me sobran recursos’.',
    'Quinto intento: el juego te puso un examen y tú le devolviste matrícula.'
  ],
  6: [
    '¡ÚLTIMO INTENTO Y LO SACAS! Eso es épica. Eso es leyenda. 🏆',
    'Seis intentos: final de película. Y tú ganando en el último segundo.',
    'La palabra ya se veía libre… y tú: ‘ven aquí’. Captura total en 6.',
    'Esto no es ganar: es RESUCITAR. Victoria en el último. 👏',
    'Último intento y sangre fría: el abecedario te tiene miedo y razón no le falta.',
    'El Wordle estaba confiado… hasta que apareció tu ‘plot twist’.',
    'Seis intentos: tensión máxima, calma absoluta, resultado perfecto. Qué categoría.',
    'El juego te llevó al límite para aprender una lección: contigo no se juega.',
    '¡A la sexta! Eso es remontada histórica, de las que se cuentan en cenas familiares.',
    'Has ganado cuando ya nadie creía… excepto tú. Y ahí está la diferencia.',
    'Último intento: la palabra estaba escondida y tú la sacaste de la oreja. Magia.',
    'Esto ha sido un ‘hold my coffee’ y cierre por todo lo alto.',
    'Seis intentos: porque te gusta ganar con fuegos artificiales. 🎆',
    'El reloj a cero, la grada en silencio… y tú marcando el gol. En 6.',
    'Ganar en el último es para valientes. Y tú vienes con pack completo.'
  ]
};
const LOSE_PHRASES = [
  'Hoy la palabra ha sobrevivido… pero que no se confíe, mañana la cazas. 😈',
  'Ha ganado la palabra por pura suerte. Tú estabas a punto de desmontarla letra a letra.',
  'Esto no es perder: es recopilar datos para la venganza. 📊',
  'La palabra se ha escondido como si pagara alquiler. Tranquila: ya la encontraremos.',
  'Hoy el Wordle se ha salvado… por los pelos. Mañana no sale vivo.',
  'La palabra ha tenido un golpe de suerte y se viene arriba. No la dejes.',
  'No ha salido… pero has dejado el teclado temblando. Eso cuenta como victoria moral.',
  'Esto ha sido un ‘casi’ tan grande que debería contar como medio acierto.',
  'La palabra ha ganado en plan cobarde: escondiéndose entre letras. Muy feo.',
  'Has perdido esta batalla, sí… pero el diccionario ya ha pedido refuerzos.',
  'Hoy no tocaba. Hay días que las palabras vienen con actitud. 💅',
  'La palabra: 1 — Tú: infinitas ganas de revancha. Mañana ajuste de cuentas.',
  'No pasa nada: incluso los genios descansan. Hoy era día de intimidar, no de rematar.',
  'La palabra se ha librado, pero ha quedado señalada. Está en tu lista.',
  'Derrota táctica. Mañana vuelves con más vocales y menos piedad.'
];
const LOSE_PHRASES_CLOSE = [
  '¡Ufffff! Eso estaba a una letra de caer. La palabra ha corrido por su vida.',
  'Te ha faltado una consonante y cero de talento. Mañana cae sí o sí.',
  'Esto ha sido robo con violencia: esa palabra no merecía sobrevivir.',
  'Hoy ha ganado por foto finish. Mañana la dejas sin opciones.',
  'Esa palabra ha salido viva por casualidad. Tú ya la tenías acorralada.'
];

let lastTouchEnd = 0;

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toastEl = document.getElementById('toast');
const helpModal = document.getElementById('helpModal');
const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultWordLink = document.getElementById('resultWordLink');
const resultText = document.getElementById('resultText');

resultWordLink.addEventListener('click', (event) => {
  event.preventDefault();
  window.open(resultWordLink.href, '_blank', 'noopener,noreferrer');
});

const state = {
  dictionary: [],
  dictionarySet: new Set(),
  answer: '',
  row: 0,
  col: 0,
  board: Array.from({ length: MAX_ATTEMPTS }, () => Array(WORD_LENGTH).fill('')),
  locked: false,
  over: false,
  keyStates: new Map(),
  toastTimeout: null
};

function normalizeWord(word) {
  return word
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function loadDictionary() {
  const response = await fetch('palabras.txt', { cache: 'default' });
  if (!response.ok) throw new Error('No se pudo cargar el diccionario.');
  const text = await response.text();
  const words = text
    .split(/\r?\n/)
    .map(normalizeWord)
    .filter((w) => w.length === WORD_LENGTH);

  if (!words.length) throw new Error('El diccionario está vacío.');

  state.dictionary = words;
  state.dictionarySet = new Set(words);
}

function randomAnswer() {
  const randomIndex = Math.floor(Math.random() * state.dictionary.length);
  return state.dictionary[randomIndex];
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getWinMessage(attemptNumber) {
  return randomFrom(WIN_PHRASES[attemptNumber] || WIN_PHRASES[MAX_ATTEMPTS]);
}

function getLoseMessage(lastGuess = '') {
  const letterMatches = [...lastGuess].filter((letter, index) => letter === state.answer[index]).length;
  if (letterMatches >= WORD_LENGTH - 1) {
    return randomFrom(LOSE_PHRASES_CLOSE);
  }
  return randomFrom(LOSE_PHRASES);
}

function buildBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < MAX_ATTEMPTS; r += 1) {
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.row = String(r);
    for (let c = 0; c < WORD_LENGTH; c += 1) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = String(r);
      tile.dataset.col = String(c);
      tile.addEventListener('click', () => {
        if (r !== state.row) return;
        setInsertionPoint(c);
      });
      row.append(tile);
    }
    boardEl.append(row);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = '';
  KEYBOARD_ROWS.forEach((letters, rowIndex) => {
    const row = document.createElement('div');
    row.className = 'key-row';
    row.dataset.row = String(rowIndex);

    letters.forEach((key) => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.dataset.key = key;
      btn.type = 'button';
      btn.textContent = key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '✓' : key;
      btn.addEventListener('click', () => onKey(key));
      row.append(btn);
    });

    keyboardEl.append(row);
  });
}

function tileAt(row, col) {
  return boardEl.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
}

function rowEl(row) {
  return boardEl.querySelector(`.row[data-row="${row}"]`);
}

function showToast(message, duration = 1400) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  window.clearTimeout(state.toastTimeout);
  state.toastTimeout = window.setTimeout(() => toastEl.classList.remove('show'), duration);
}

function vibrate(ms = 40) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function shakeRow(row) {
  const rowNode = rowEl(row);
  rowNode.classList.remove('shake');
  rowNode.offsetWidth;
  rowNode.classList.add('shake');
  setTimeout(() => rowNode.classList.remove('shake'), 460);
}

function updateBoardUI() {
  for (let r = 0; r < MAX_ATTEMPTS; r += 1) {
    for (let c = 0; c < WORD_LENGTH; c += 1) {
      const tile = tileAt(r, c);
      const letter = state.board[r][c];
      tile.textContent = letter;
      tile.classList.toggle('filled', !!letter && r === state.row);
      tile.classList.toggle('active', r === state.row && c === state.col && !state.locked && !state.over);
    }
  }
}

function setInsertionPoint(col) {
  if (state.locked || state.over) return;
  if (col < 0 || col >= WORD_LENGTH) return;
  if (!state.board[state.row][col]) return;
  state.col = col;
  updateBoardUI();
}

function updateKeyState(letter, newState) {
  const prevState = state.keyStates.get(letter);
  if (prevState && STATE_PRIORITY[prevState] >= STATE_PRIORITY[newState]) return;
  state.keyStates.set(letter, newState);
  const key = keyboardEl.querySelector(`.key[data-key="${letter}"]`);
  if (!key) return;
  key.classList.remove('absent', 'present', 'correct');
  key.classList.add(newState);
}

function scoreGuess(guess, answer) {
  const result = Array(WORD_LENGTH).fill('absent');
  const counts = {};

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const a = answer[i];
    counts[a] = (counts[a] || 0) + 1;
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      counts[guess[i]] -= 1;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const letter = guess[i];
    if (result[i] === 'correct') continue;
    if (counts[letter] > 0) {
      result[i] = 'present';
      counts[letter] -= 1;
    }
  }

  return result;
}

function endGame(won) {
  state.over = true;
  state.locked = true;
  resultTitle.textContent = 'Fin del juego';
  resultWordLink.textContent = state.answer;
  resultWordLink.href = `https://dle.rae.es/${encodeURIComponent(state.answer.toLocaleLowerCase('es-ES'))}`;
  resultWordLink.target = '_blank';
  resultWordLink.rel = 'noopener noreferrer';
  const attemptNumber = state.row + 1;
  const lastGuess = state.board[Math.min(state.row, MAX_ATTEMPTS - 1)].join('');
  const message = won ? getWinMessage(attemptNumber) : getLoseMessage(lastGuess);
  resultText.textContent = `\n${message}`;
  setTimeout(() => resultModal.showModal(), 500);
}

function revealGuess(guess, result) {
  return new Promise((resolve) => {
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      const tile = tileAt(state.row, i);
      const letter = guess[i];
      const status = result[i];

      setTimeout(() => {
        tile.classList.add('flip');
        setTimeout(() => {
          tile.classList.remove('filled');
          tile.classList.add(status);
          updateKeyState(letter, status);
        }, CACHE_BUST_DELAY);
      }, i * 280);
    }

    setTimeout(resolve, WORD_LENGTH * 280 + 300);
  });
}

async function submitGuess() {
  if (state.col < WORD_LENGTH) {
    showToast('Faltan letras');
    shakeRow(state.row);
    vibrate();
    return;
  }

  const guess = state.board[state.row].join('');
  if (!state.dictionarySet.has(guess)) {
    showToast('No está en la lista');
    shakeRow(state.row);
    vibrate(80);
    return;
  }

  state.locked = true;
  const result = scoreGuess(guess, state.answer);
  await revealGuess(guess, result);

  if (guess === state.answer) {
    showToast('¡Excelente!');
    endGame(true);
    return;
  }

  state.row += 1;
  state.col = 0;
  state.locked = false;

  if (state.row >= MAX_ATTEMPTS) {
    showToast(`La palabra era ${state.answer}`);
    endGame(false);
  }
}

function addLetter(letter) {
  if (state.col >= WORD_LENGTH) return;
  state.board[state.row][state.col] = letter;
  state.col += 1;
  updateBoardUI();
}

function removeLetter() {
  const currentRow = state.board[state.row];

  if (state.col >= WORD_LENGTH) {
    state.col = WORD_LENGTH - 1;
  }

  if (state.col > 0 && !currentRow[state.col]) {
    state.col -= 1;
  }

  if (!currentRow[state.col]) return;

  currentRow[state.col] = '';
  updateBoardUI();
}

function onKey(key) {
  if (state.locked || state.over) return;
  if (key === 'ENTER') {
    submitGuess();
    return;
  }
  if (key === 'BACKSPACE') {
    removeLetter();
    return;
  }
  if (/^[A-ZÑ]$/.test(key)) {
    addLetter(key);
  }
}

function onPhysicalKey(event) {
  const key = normalizeWord(event.key);

  if (event.key === 'Backspace') {
    event.preventDefault();
    onKey('BACKSPACE');
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    onKey('ENTER');
    return;
  }

  if (/^[A-ZÑ]$/.test(key)) {
    event.preventDefault();
    onKey(key);
  }
}

function resetGame() {
  state.answer = randomAnswer();
  state.row = 0;
  state.col = 0;
  state.over = false;
  state.locked = false;
  state.board = Array.from({ length: MAX_ATTEMPTS }, () => Array(WORD_LENGTH).fill(''));
  state.keyStates = new Map();
  buildBoard();
  buildKeyboard();
  updateBoardUI();
}

async function refreshResources() {
  if (!navigator.onLine) {
    showToast('Sin conexión. Reintenta online.');
    return;
  }

  showToast('Actualizando recursos...');
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'REFRESH_CACHE' });
  }

  try {
    const response = await fetch(`palabras.txt?ts=${Date.now()}`, { cache: 'reload' });
    const text = await response.text();
    const words = text
      .split(/\r?\n/)
      .map(normalizeWord)
      .filter((w) => w.length === WORD_LENGTH);

    if (words.length) {
      state.dictionary = words;
      state.dictionarySet = new Set(words);
      showToast('Recursos actualizados ✅');
      resetGame();
    }
  } catch {
    showToast('No se pudo refrescar');
  }
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('sw.js');
  } catch {
    showToast('Modo offline no disponible');
  }
}

function bindUI() {
  document.getElementById('helpBtn').addEventListener('click', () => helpModal.showModal());
  document.getElementById('closeHelpBtn').addEventListener('click', () => helpModal.close());
  document.getElementById('playBtn').addEventListener('click', () => helpModal.close());
  document.getElementById('refreshBtn').addEventListener('click', refreshResources);
  document.getElementById('forceRefreshBtn').addEventListener('click', refreshResources);
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    resultModal.close();
    resetGame();
  });

  window.addEventListener('keydown', onPhysicalKey);

  document.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) event.preventDefault();
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

async function init() {
  buildBoard();
  buildKeyboard();
  bindUI();
  await registerSW();

  try {
    await loadDictionary();
  } catch (error) {
    showToast('Error cargando diccionario');
    console.error(error);
    return;
  }

  resetGame();
}

init();
