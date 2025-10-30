const gameBoard = document.querySelector('.game-board');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let score = 0;
let timer = null;
let timeLeft = 90;
let timerStarted = false;

// Initialization
scoreElement.textContent = score;
timerElement.textContent = formatTime(timeLeft);

fetch('./data/cards.json')
  .then(response => response.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  })
  .catch(err => console.error('Error loading cards:', err));

// Shuffling the array of cards
function shuffleCards() {
  let currentIndex = cards.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
  }
}

// Generating cards on the field
function generateCards() {
  gameBoard.innerHTML = '';
  for (let card of cards) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.setAttribute('data-name', card.name);
    cardElement.innerHTML = `
      <div class='front'>
        <img class='front-image' src="${card.image}" alt="${card.name}">
      </div>
      <div class='back'></div>
    `;
    gameBoard.appendChild(cardElement);
    cardElement.addEventListener('click', flipCard);
  }
}

// Card click handler
function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  // Start timer only on first turn
  if (!timerStarted) {
    startTimer();
    timerStarted = true;
  }

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  scoreElement.textContent = score;
  lockBoard = true;

  checkForMatch();
}

// Checking for a match
function checkForMatch() {
  const isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

// If the cards match
function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();

  // Checking for victory
  const flippedCards = document.querySelectorAll('.flipped');
  if (flippedCards.length === cards.length) {
    clearInterval(timer);
    setTimeout(() => {
      alert('🎉 You won!');
    }, 300);
  }
}

// If the cards don't match
function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

// Resetting the board logic
function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// Restarting the game
function restart() {
  clearInterval(timer);
  timer = null;
  timerStarted = false;
  timeLeft = 90;
  score = 0;
  scoreElement.textContent = score;
  timerElement.textContent = formatTime(timeLeft);

  resetBoard();
  shuffleCards();
  generateCards();
}

// Timer
function startTimer() {
  timerElement.textContent = formatTime(timeLeft);
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      lockBoard = true;
      setTimeout(() => {
        alert('⏰ Time’s up! You lost.');
      }, 300);
    }
  }, 1000);
}

// Formatting time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
