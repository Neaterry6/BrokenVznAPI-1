import fetch from 'node-fetch';

export const gamesService = {
  async trivia(amount = 10, category = '', difficulty = '') {
    try {
      let url = `https://opentdb.com/api.php?amount=${amount}`;
      if (category) url += `&category=${category}`;
      if (difficulty) url += `&difficulty=${difficulty}`;
      const res = await fetch(url);
      const data = await res.json() as any;
      return { results: data?.results || [], category, difficulty };
    } catch { return { results: [], error: 'Trivia unavailable' }; }
  },

  async wordGame(type: 'hangman' | 'scramble' | 'wordle' = 'scramble') {
    try {
      const res = await fetch('https://random-word-api.herokuapp.com/word?number=1');
      const words = await res.json() as string[];
      const word = words?.[0] || 'coding';
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      
      return {
        type,
        original: type === 'wordle' ? null : word,
        scrambled: type === 'scramble' ? scrambled : null,
        length: word.length,
        hints: [`The word has ${word.length} letters`, `Starts with "${word[0]}"`]
      };
    } catch { return { error: 'Word game unavailable' }; }
  },

  async numberFact(number: number) {
    try {
      const res = await fetch(`http://numbersapi.com/${number || 'random'}/trivia`);
      const text = await res.text();
      return { number: number || 'random', fact: text };
    } catch { return { error: 'Number fact unavailable' }; }
  },

  async diceRoll(sides = 6) {
    return { sides, result: Math.floor(Math.random() * sides) + 1 };
  },

  async flipCoin() {
    return { result: Math.random() > 0.5 ? 'heads' : 'tails' };
  },

  async rps(playerChoice: string) {
    const choices = ['rock', 'paper', 'scissors'];
    const computer = choices[Math.floor(Math.random() * 3)];
    const player = playerChoice?.toLowerCase();
    
    let result = 'tie';
    if (player === 'rock' && computer === 'scissors') result = 'win';
    else if (player === 'paper' && computer === 'rock') result = 'win';
    else if (player === 'scissors' && computer === 'paper') result = 'win';
    else if (player !== computer) result = 'lose';
    
    return { player: player || 'unknown', computer, result };
  }
};
