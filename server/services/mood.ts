export interface MoodSuggestionResult {
  success: boolean;
  mood?: string;
  songs?: string[];
  error?: string;
}

export class MoodService {
  private moodSongs = {
    happy: [
      "Happy - Pharrell Williams", "Good Vibes - Chris Janson", "Walking on Sunshine - Katrina and the Waves",
      "Lovely Day - Bill Withers", "Shake It Off - Taylor Swift", "I Wanna Dance with Somebody - Whitney Houston",
      "Best Day of My Life - American Authors", "Hey Ya! - Outkast", "Roar - Katy Perry",
      "Celebrate - Kool & The Gang", "Uptown Funk - Mark Ronson ft. Bruno Mars", "Valerie - Amy Winehouse",
      "Sunshine Day - Osibisa", "September - Earth, Wind & Fire", "Shut Up and Dance - Walk the Moon",
      "Beautiful Day - U2", "All Star - Smash Mouth", "Sugar - Maroon 5", "Life is Wonderful - Jason Mraz",
      "Dance Again - Selena Gomez", "Good Day Sunshine - The Beatles", "Pocketful of Sunshine - Natasha Bedingfield",
      "Cheerleader - OMI", "Can't Stop the Feeling! - Justin Timberlake"
    ],
    sad: [
      "Someone Like You - Adele", "Hurt - Johnny Cash", "Yesterday - The Beatles",
      "Fix You - Coldplay", "Let Her Go - Passenger", "Tears in Heaven - Eric Clapton",
      "Stay With Me - Sam Smith", "Everybody Hurts - R.E.M.", "Back to Black - Amy Winehouse",
      "The Night We Met - Lord Huron", "Jealous - Labrinth", "Goodbye My Lover - James Blunt",
      "Piece by Piece - Kelly Clarkson", "The Sound of Silence - Simon & Garfunkel", "Say Something - A Great Big World",
      "When I Was Your Man - Bruno Mars", "I Will Always Love You - Whitney Houston", "Empty Chairs - Les Misérables"
    ],
    energetic: [
      "Eye of the Tiger - Survivor", "Can't Hold Us - Macklemore & Ryan Lewis", "Stronger - Kanye West",
      "We Will Rock You - Queen", "Don't Stop Me Now - Queen", "Levitating - Dua Lipa",
      "Born This Way - Lady Gaga", "Dance Monkey - Tones and I", "Blinding Lights - The Weeknd",
      "Hall of Fame - The Script", "Lose Yourself - Eminem", "I'm Still Standing - Elton John",
      "Wake Me Up - Avicii", "Raise Your Glass - Pink", "Shake Your Groove Thing - Peaches & Herb"
    ],
    calm: [
      "Weightless - Marconi Union", "Pure Shores - All Saints", "The Scientist - Coldplay",
      "River Flows in You - Yiruma", "Fix You - Coldplay", "Hallelujah - Jeff Buckley",
      "Thinking Out Loud - Ed Sheeran", "Cherry Wine - Hozier", "Let It Go - James Bay",
      "Moon River - Audrey Hepburn", "Fields of Gold - Eva Cassidy", "Golden Hour - Kacey Musgraves",
      "Bloom - The Paper Kites", "Perfect - Ed Sheeran", "Here Comes the Sun - The Beatles"
    ]
  };

  async suggestByMood(mood: string, limit: number = 20): Promise<MoodSuggestionResult> {
    try {
      if (!mood || typeof mood !== "string") {
        return {
          success: false,
          error: "Mood is required and must be a string."
        };
      }

      const suggestions = this.moodSongs[mood.toLowerCase() as keyof typeof this.moodSongs];
      if (!suggestions) {
        return {
          success: false,
          error: `Invalid mood: ${mood}. Try happy, sad, energetic, or calm.`
        };
      }

      const songLimit = limit && parseInt(limit.toString(), 10) ? parseInt(limit.toString(), 10) : 20;
      
      return {
        success: true,
        mood: mood.toLowerCase(),
        songs: suggestions.slice(0, songLimit)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get mood suggestions'
      };
    }
  }
}

export const moodService = new MoodService();