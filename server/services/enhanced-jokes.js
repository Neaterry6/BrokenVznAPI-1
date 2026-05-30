export class EnhancedJokesService {
    creator = 'Broken VZN';
    jokes = [
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
        "My brother thought 5G would make his hair grow. Now he stands next to towers and prays.",
        "I asked Alexa to tell me a joke. She roasted me instead.",
        "Why did the goat bring a ladder to the bar? Because he heard the drinks were on the house.",
        "My cousin named her Wi-Fi 'GetYourOwnNet'. Now neighbors just use mobile data.",
        "Why did the dog sit in the shade? It didn't want to be a hot dog.",
        "My family argued about who left the fridge open — even Alexa took sides.",
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "I told my computer a joke about UDP. I don't know if it got it.",
        "Why don't scientists trust atoms? Because they make up everything!",
        "I've got a great joke about construction, but I'm still working on it.",
        "Why did the developer go broke? Because he used up all his cache!",
        "My code doesn't always work, but when it does, I don't know why.",
        "Why did the function break up with the variable? It wasn't returning the love.",
        "I named my hard drive 'dat ass' so once a month my computer asks if I want to back dat ass up.",
        "There are only 10 types of people in the world: those who understand binary and those who don't.",
        "Why did the programmer quit his job? He didn't get arrays (a raise).",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
        "Why do Java developers wear glasses? Because they can't C#!",
        "I would tell you a joke about UDP, but you might not get it.",
        "Why was the developer unhappy at their job? They wanted arrays but got objects instead.",
        "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
        "I invented a new word: Plagiarism!",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
        "Parallel lines have so much in common. It's a shame they'll never meet.",
        "Why don't scientists trust stairs? Because they're always up to something!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "Why don't eggs tell jokes? They'd crack each other up!",
        "What do you call a fake noodle? An impasta!",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "I used to hate facial hair, but then it grew on me.",
        "Why can't a bicycle stand up by itself? It's two tired!",
        "What do you call a fish wearing a crown? A king fish!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        "Why did the coffee file a police report? It got mugged!",
        "What's orange and sounds like a parrot? A carrot!",
        "Why don't skeletons fight each other? They don't have the guts!",
        "What do you call a sleeping bull? A bulldozer!"
    ];
    async getRandomJoke() {
        try {
            const randomIndex = Math.floor(Math.random() * this.jokes.length);
            const selectedJoke = this.jokes[randomIndex];
            return {
                success: true,
                joke: selectedJoke,
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                joke: '',
                creator: this.creator,
                error: 'Failed to get joke'
            };
        }
    }
    async getJokeByCategory(category) {
        try {
            // Filter jokes based on category keywords
            let filteredJokes = this.jokes;
            const categoryLower = category.toLowerCase();
            if (categoryLower.includes('tech') || categoryLower.includes('programming') || categoryLower.includes('computer')) {
                filteredJokes = this.jokes.filter(joke => joke.toLowerCase().includes('computer') ||
                    joke.toLowerCase().includes('code') ||
                    joke.toLowerCase().includes('program') ||
                    joke.toLowerCase().includes('developer') ||
                    joke.toLowerCase().includes('wifi') ||
                    joke.toLowerCase().includes('alexa') ||
                    joke.toLowerCase().includes('5g') ||
                    joke.toLowerCase().includes('laptop') ||
                    joke.toLowerCase().includes('usb') ||
                    joke.toLowerCase().includes('binary') ||
                    joke.toLowerCase().includes('java') ||
                    joke.toLowerCase().includes('arrays'));
            }
            else if (categoryLower.includes('animal')) {
                filteredJokes = this.jokes.filter(joke => joke.toLowerCase().includes('dog') ||
                    joke.toLowerCase().includes('cat') ||
                    joke.toLowerCase().includes('horse') ||
                    joke.toLowerCase().includes('chicken') ||
                    joke.toLowerCase().includes('goat') ||
                    joke.toLowerCase().includes('fish') ||
                    joke.toLowerCase().includes('bull'));
            }
            else if (categoryLower.includes('dad') || categoryLower.includes('pun')) {
                filteredJokes = this.jokes.filter(joke => joke.includes('?') || joke.includes('Why'));
            }
            if (filteredJokes.length === 0) {
                filteredJokes = this.jokes; // fallback to all jokes
            }
            const randomIndex = Math.floor(Math.random() * filteredJokes.length);
            const selectedJoke = filteredJokes[randomIndex];
            return {
                success: true,
                joke: selectedJoke,
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                joke: '',
                creator: this.creator,
                error: 'Failed to get joke by category'
            };
        }
    }
}
export const enhancedJokesService = new EnhancedJokesService();
