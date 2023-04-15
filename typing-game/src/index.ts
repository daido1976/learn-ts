// src/index.ts
import { Game } from "./Game";

const words = ["apple", "banana", "cherry", "date", "fig"];
const game = new Game(words);

const currentWordElement = document.getElementById(
  "current-word"
) as HTMLElement;
const inputElement = document.getElementById("input") as HTMLInputElement;
const resultElement = document.getElementById("result") as HTMLElement;

function updateDisplay() {
  if (game.isGameOver()) {
    resultElement.textContent = "Game Over!";
    inputElement.disabled = true;
  } else {
    currentWordElement.textContent = game.getCurrentWord();
  }
}

inputElement.addEventListener("input", () => {
  const input = inputElement.value;
  if (game.checkInput(input)) {
    inputElement.value = "";
    updateDisplay();
  }
});

updateDisplay();
