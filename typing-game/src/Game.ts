// src/Game.ts
export class Game {
  private words: string[];
  private currentIndex: number;

  constructor(words: string[]) {
    this.words = words;
    this.currentIndex = 0;
  }

  getCurrentWord(): string {
    return this.words[this.currentIndex];
  }

  checkInput(input: string): boolean {
    if (input === this.getCurrentWord()) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  isGameOver(): boolean {
    return this.currentIndex >= this.words.length;
  }
}
