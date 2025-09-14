export interface JokesRequest {
  category?: 'random' | 'tech' | 'dad' | 'programming' | 'general';
  count?: number;
}

export interface JokesResult {
  success: boolean;
  jokes?: string[];
  category?: string;
  count?: number;
  creator: string;
  error?: string;
}

export class JokesService {
  private jokes = {
    general: [
      "My neighbor just gave birth to a baby with no teeth... I guess he's starting life gumming it!",
      "Why did the smart fridge break up with the microwave? It couldn't handle the heat of fast relationships.",
      "My dad tried fixing the car with duct tape and faith. Now we pray before starting it.",
      "Why did the cat join Instagram? To get more pawsitive attention!",
      "My phone autocorrected 'love' to 'live'... Now I'm not sure if she wants to date me or rent me.",
      "I asked my dog what's two minus two. He said nothing. Genius.",
      "Why did the robot get fired? It kept taking power naps during updates.",
      "My uncle says he's on a seafood diet — he sees food and eats it... and wonders why his smart scale ghosted him.",
      "Why did the chicken cross the Wi-Fi? To get to the hotspot on the other side.",
      "I told my little brother bedtime stories about viruses. Now he sleeps with an antivirus USB.",
      "Why did the horse go to therapy? It had too many emotional saddlebags.",
      "My grandma uses TikTok now. Last week she accidentally joined a dance cult.",
      "Why don't laptops ever feel loved? They're always getting shut down.",
      "I bought a new vacuum cleaner. It really sucks, which is exactly what I wanted!",
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "I used to hate facial hair, but then it grew on me.",
      "Why did the coffee file a police report? It got mugged!",
      "I'm reading a book about anti-gravity. It's impossible to put down!"
    ],
    tech: [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
      "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
      "A SQL query goes into a bar, walks up to two tables and asks... 'Can I join you?'",
      "Why do Java developers wear glasses? Because they don't C#!",
      "There are only 10 types of people in the world: those who understand binary and those who don't.",
      "Why did the programmer quit his job? He didn't get arrays!",
      "How do you comfort a JavaScript bug? You console it!",
      "Why are assembly programmers always soaking wet? They work below C-level!",
      "What's the object-oriented way to become wealthy? Inheritance!",
      "Why did the database administrator leave his wife? She had one-to-many relationships!",
      "How do you tell HTML from HTML5? Try it out in Internet Explorer. Did it work? No? It's HTML5.",
      "Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25!",
      "A user interface is like a joke. If you have to explain it, it's not that good.",
      "Why did the web developer walk out of a restaurant in disgust? The seating was table-less.",
      "Programming is like sex: one mistake and you have to support it for the rest of your life."
    ],
    programming: [
      "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code.",
      "Why do programmers hate nature? It has too many bugs!",
      "A programmer is told to 'go to hell.' He finds the worst part of that statement is the 'go to.'",
      "Why did the programmer go broke? Because he used up all his cache!",
      "What's a programmer's favorite hangout place? Foo Bar!",
      "Why don't programmers like to go outside? The sunlight causes too many reflections!",
      "How many software engineers does it take to change a light bulb? None. It's a hardware issue.",
      "Why do programmers prefer iOS development? Because they don't want to deal with Java!",
      "What do you call a programmer from Finland? Nerdic!",
      "Why was the function sad? Because it had no class!",
      "How do you generate a random string? Put a new intern in front of vi and tell them to quit.",
      "Why did the programmer always carry a ladder? To reach the high-level programming languages!",
      "What's the difference between a programmer and a software engineer? About $20,000 a year.",
      "Why do Python programmers prefer snake_case over camelCase? Because they can't C#!",
      "A byte walks into a bar looking miserable. The bartender asks, 'What's wrong?' The byte replies, 'Parity error.' The bartender says, 'Yeah, I thought you looked a bit off.'"
    ],
    dad: [
      "I'm afraid for the calendar. Its days are numbered.",
      "My wife said I should do lunges to stay in shape. That would be a big step forward.",
      "Why do fathers take an extra pair of socks when they go golfing? In case they get a hole in one!",
      "Singing in the shower is fun until you get soap in your mouth. Then it's a soap opera.",
      "What do a tick and the Eiffel Tower have in common? They're both Paris sites.",
      "What do you call a fish wearing a crown? A king fish!",
      "Dad, did you get a haircut? No, I got them all cut!",
      "What do you call a poor Santa Claus? St. Nickel-less.",
      "I used to be a personal trainer. Then I gave my too weak notice.",
      "What did Baby Corn say to Mama Corn? Where's Pop Corn?",
      "I'm so good at sleeping, I can do it with my eyes closed!",
      "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
      "Why don't scientists trust atoms? Because they make up everything!",
      "How do you make a tissue dance? You put a little boogie in it!",
      "What's orange and sounds like a parrot? A carrot!",
      "Why don't eggs tell jokes? They'd crack each other up!"
    ]
  };

  async getJokes(request: JokesRequest = {}): Promise<JokesResult> {
    try {
      const { category = 'random', count = 1 } = request;

      let selectedJokes: string[] = [];

      if (category === 'random') {
        // Get jokes from all categories
        const allJokes = [
          ...this.jokes.general,
          ...this.jokes.tech,
          ...this.jokes.programming,
          ...this.jokes.dad
        ];
        
        selectedJokes = this.getRandomItems(allJokes, count);
      } else if (this.jokes[category as keyof typeof this.jokes]) {
        selectedJokes = this.getRandomItems(this.jokes[category as keyof typeof this.jokes], count);
      } else {
        return {
          success: false,
          error: `Invalid category. Available categories: ${Object.keys(this.jokes).join(', ')}, random`,
          creator: 'Broken VZN'
        };
      }

      return {
        success: true,
        jokes: selectedJokes,
        category,
        count: selectedJokes.length,
        creator: 'Broken VZN'
      };

    } catch (error) {
      console.error('Jokes service error:', error);
      return {
        success: false,
        error: 'Failed to get jokes',
        creator: 'Broken VZN'
      };
    }
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  getAvailableCategories(): string[] {
    return ['random', ...Object.keys(this.jokes)];
  }
}

export const jokesService = new JokesService();