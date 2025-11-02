const BoardsContainer = document.querySelector('.all-boards');
const statusMessage = document.querySelector('.status-message');
const resetButton = document.querySelector('.reset-button');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');

const rows = 3;
const cols = 3;

let board = [];
let currentSpelare = 'X';
let gameIsActive = true;
let winningCells = [];
let playerNames = { X: 'X', O: 'O' };
let winCounts = { X: 0, O: 0 };

function promptPlayerNames() {
  const nameX = prompt("Ange namn för Spelare X:", "Spelare 1") || "X";
  const nameO = prompt("Ange namn för Spelare O:", "Spelare 2") || "O";
  playerNames.X = nameX;
  playerNames.O = nameO;
}

function updateScores() {
  scoreXDisplay.textContent = `${playerNames.X} (${winCounts.X} vinster)`;
  scoreODisplay.textContent = `${playerNames.O} (${winCounts.O} vinster)`;
}

function randomStartPlayer() {
  currentSpelare = Math.random() < 0.5 ? 'X' : 'O';
}

function createBoard() {
  BoardsContainer.innerHTML = '';
  board = [];

  const boardElement = document.createElement('div');
  boardElement.classList.add('board');

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;

    cell.addEventListener('click', () => {
      if (!gameIsActive || cell.firstChild) return;

      const img = document.createElement('img');
      img.src = currentSpelare === 'X' ? 'x.jpg' : 'o.png'; // byt till rätt bildfil
      img.alt = currentSpelare;
      img.classList.add('symbol');

      cell.appendChild(img);

      if (checkWinner()) {
        winCounts[currentSpelare]++;
        updateScores();
        statusMessage.textContent = `Spelare ${playerNames[currentSpelare]} vinner!`;
        highlightWinner();
        gameIsActive = false;
      } else if (checkDraw()) {
        statusMessage.textContent = `Oavgjort!`;
        gameIsActive = false;
      } else {
        currentSpelare = currentSpelare === 'X' ? 'O' : 'X';
        statusMessage.textContent = `Spelare ${playerNames[currentSpelare]}s tur`;
      }
    });

    boardElement.appendChild(cell);
    board.push(cell);
  }

  BoardsContainer.appendChild(boardElement);
  statusMessage.textContent = `Spelare ${playerNames[currentSpelare]}s tur`;
}

function checkWinner() {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (
      board[a].firstChild &&
      board[b].firstChild &&
      board[c].firstChild &&
      board[a].firstChild.alt === board[b].firstChild.alt &&
      board[a].firstChild.alt === board[c].firstChild.alt
    ) {
      winningCells = line;
      return true;
    }
  }
  return false;
}

function highlightWinner() {
  winningCells.forEach(index => {
    board[index].classList.add('winning-cell');
  });
}

function checkDraw() {
  return board.every(cell => cell.firstChild);
}

function resetBoard() {
  board.forEach(cell => {
    cell.innerHTML = '';
    cell.classList.remove('winning-cell');
  });
  randomStartPlayer();
  gameIsActive = true;
  winningCells = [];
  statusMessage.textContent = `Spelare ${playerNames[currentSpelare]}s tur`;
}

promptPlayerNames();
updateScores();
randomStartPlayer();
createBoard();

resetButton.addEventListener('click', () => {
  resetBoard();
});
