const gameBoard = document.querySelector('.game-board');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');
const restartButton = document.querySelector('.restart-button');

const INITIAL_TIME = 90;
const FLIP_BACK_DELAY = 1000;
const ALERT_DELAY = 300;

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
let timer = null;
let timeLeft = INITIAL_TIME;
let timerStarted = false;

// Initialization
scoreElement.textContent = score;
timerElement.textContent = formatTime(timeLeft);

// Fetch cards
fetch('data/cards.json')
  .then(response => response.json())
  .then(data => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  })
  .catch(err => console.error('Error loading cards:', err));

// Shuffle cards array
function shuffleCards() {
  let currentIndex = cards.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
  }
}

// Generate cards on board
function generateCards() {
  gameBoard.innerHTML = '';
  for (const card of cards) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.setAttribute('data-name', card.name);
    cardElement.setAttribute('aria-pressed', 'false');
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src="${card.image}" alt="${card.name}">
      </div>
      <div class="back"></div>
    `;
    gameBoard.appendChild(cardElement);
  }
}

// Delegated click handler for cards
gameBoard.addEventListener('click', (e) => {
  const clickedCard = e.target.closest('.card');
  if (!clickedCard) return;
  flipCard(clickedCard);
});

// Flip card logic
function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains('flipped')) return;

  // Start timer only on first user click
  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  card.classList.add('flipped');
  card.setAttribute('aria-pressed', 'true');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  score++;
  scoreElement.textContent = score;
  lockBoard = true;

  checkForMatch();
}

// Check for match
function checkForMatch() {
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;
  if (isMatch) {
    disableCards();
  } else {
    unflipCards();
  }
}

// Disable matched cards
function disableCards() {
  firstCard.removeAttribute('aria-pressed');
  secondCard.removeAttribute('aria-pressed');
  resetBoard();
  checkVictory();
}

// Unflip unmatched cards
function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    firstCard.setAttribute('aria-pressed', 'false');
    secondCard.classList.remove('flipped');
    secondCard.setAttribute('aria-pressed', 'false');
    resetBoard();
  }, FLIP_BACK_DELAY);
}

// Reset board state
function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Restart game
restartButton.addEventListener('click', restart);
function restart() {
  clearInterval(timer);
  timer = null;
  timerStarted = false;
  timeLeft = INITIAL_TIME;
  score = 0;

  scoreElement.textContent = score;
  timerElement.textContent = formatTime(timeLeft);

  resetBoard();
  shuffleCards();
  generateCards();
}

// Start countdown timer
function startTimer() {
  timerElement.textContent = formatTime(timeLeft);
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      lockBoard = true;
      showEndGameAlert('⏰ Time’s up! You lost.');
    }
  }, 1000);
}

// Check victory condition
function checkVictory() {
  const flippedCards = document.querySelectorAll('.card.flipped');
  if (flippedCards.length === cards.length) {
    clearInterval(timer);
    showEndGameAlert('🎉 You won!');
  }
}

// Show end-game alert
function showEndGameAlert(message) {
  setTimeout(() => alert(message), ALERT_DELAY);
}

// Format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
