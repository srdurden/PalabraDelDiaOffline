const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];
const STATE_PRIORITY = { absent: 1, present: 2, correct: 3 };
const CACHE_BUST_DELAY = 120;

let lastTouchEnd = 0;

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toastEl = document.getElementById('toast');
const helpModal = document.getElementById('helpModal');
const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');

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
    }
  }
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
  resultTitle.textContent = won ? '¡Enhorabuena!' : 'Fin del juego';
  resultText.textContent = won
    ? `Has acertado: ${state.answer}`
    : `La palabra era ${state.answer}`;
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
  if (state.col <= 0) return;
  state.col -= 1;
  state.board[state.row][state.col] = '';
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
