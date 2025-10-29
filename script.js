const gameBoard = document.querySelector('.game-board');
const scoreElement = document.querySelector('.score');
const timerElement = document.querySelector('.timer');

let cards = [];
let firstCard;
let secondCard;
let lockBoard = false;
let score = 0;
let timer;
let timeLeft = 90;

scoreElement.textContent = score;
timerElement.textContent = formatTime(timeLeft);

fetch('./data/cards.json')
  .then(response => response.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
    startTimer();
  });

function shuffleCards() {
  let currentIndex = cards.length;
  let temporaryValue;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.setAttribute('data-name', card.name);
    cardElement.innerHTML = `
      <div class='front'>
        <img class='front-image' src="${card.image}">
      </div>
      <div class='back'></div>
    `;
    gameBoard.appendChild(cardElement);
    cardElement.addEventListener('click', flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

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

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetBoard();

  const flippedCards = document.querySelectorAll('.flipped');
  if (flippedCards.length === cards.length) {
    clearInterval(timer);
    setTimeout(() => {
      alert('🎉 You won!');
    }, 300);
  }
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  scoreElement.textContent = score;
  gameBoard.innerHTML = '';
  generateCards();
  resetTimer();
  startTimer();
}
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

function resetTimer() {
  clearInterval(timer);
  timeLeft = 90;
  timerElement.textContent = formatTime(timeLeft);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
