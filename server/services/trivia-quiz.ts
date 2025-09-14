import axios from 'axios';

export interface TriviaQuizRequest {
  category?: string;
  difficulty?: string;
  amount?: number;
  type?: string;
}

export interface TriviaQuizResponse {
  success: boolean;
  questions: TriviaQuestion[];
  total_questions: number;
  category: string;
  difficulty: string;
  creator: string;
  error?: string;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  category: string;
  type: string;
}

export class TriviaQuizService {
  private readonly creator = 'Broken VZN';
  private readonly apiUrl = 'https://opentdb.com/api.php';
  
  private readonly categories = {
    'general': 9,
    'science': 17,
    'history': 23,
    'sports': 21,
    'geography': 22,
    'entertainment': 11,
    'art': 25,
    'animals': 27,
    'vehicles': 28
  };

  async generateQuiz(request: TriviaQuizRequest): Promise<TriviaQuizResponse> {
    try {
      const { 
        category = 'general',
        difficulty = 'easy',
        amount = 5,
        type = 'multiple'
      } = request;

      // Limit amount to reasonable number
      const limitedAmount = Math.min(Math.max(amount, 1), 20);

      // Map category to API category number
      const categoryId = this.categories[category.toLowerCase() as keyof typeof this.categories] || this.categories.general;

      const params = {
        amount: limitedAmount,
        category: categoryId,
        difficulty: difficulty.toLowerCase(),
        type: type === 'boolean' ? 'boolean' : 'multiple'
      };

      const response = await axios.get(this.apiUrl, { params, timeout: 15000 });

      if (response.status === 200 && response.data.response_code === 0) {
        const questions: TriviaQuestion[] = response.data.results.map((q: any) => {
          const options = type === 'boolean' 
            ? ['True', 'False']
            : this.shuffleArray([...q.incorrect_answers, q.correct_answer]);

          return {
            question: this.decodeHTML(q.question),
            options: options.map((opt: string) => this.decodeHTML(opt)),
            correct_answer: this.decodeHTML(q.correct_answer),
            difficulty: q.difficulty,
            category: this.decodeHTML(q.category),
            type: q.type
          };
        });

        return {
          success: true,
          questions,
          total_questions: questions.length,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
          creator: this.creator
        };
      } else {
        // Fallback to local questions if API fails
        return this.getFallbackQuestions(limitedAmount, category, difficulty);
      }

    } catch (error) {
      console.error('Trivia quiz error:', error);
      // Fallback to local questions
      return this.getFallbackQuestions(
        request.amount || 5, 
        request.category || 'general', 
        request.difficulty || 'easy'
      );
    }
  }

  private getFallbackQuestions(amount: number, category: string, difficulty: string): TriviaQuizResponse {
    const fallbackQuestions = [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct_answer: "Paris",
        difficulty: "easy",
        category: "Geography",
        type: "multiple"
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct_answer: "Leonardo da Vinci",
        difficulty: "easy",
        category: "Art",
        type: "multiple"
      },
      {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correct_answer: "Jupiter",
        difficulty: "easy",
        category: "Science",
        type: "multiple"
      },
      {
        question: "In what year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correct_answer: "1945",
        difficulty: "medium",
        category: "History",
        type: "multiple"
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct_answer: "Au",
        difficulty: "medium",
        category: "Science",
        type: "multiple"
      },
      {
        question: "Which sport is played at Wimbledon?",
        options: ["Football", "Tennis", "Cricket", "Rugby"],
        correct_answer: "Tennis",
        difficulty: "easy",
        category: "Sports",
        type: "multiple"
      },
      {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correct_answer: "7",
        difficulty: "easy",
        category: "Geography",
        type: "multiple"
      },
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
        correct_answer: "Vatican City",
        difficulty: "medium",
        category: "Geography",
        type: "multiple"
      }
    ];

    // Filter by difficulty if specified
    let filteredQuestions = fallbackQuestions;
    if (difficulty !== 'any') {
      filteredQuestions = fallbackQuestions.filter(q => 
        q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // If no questions match the difficulty, use all questions
    if (filteredQuestions.length === 0) {
      filteredQuestions = fallbackQuestions;
    }

    // Randomly select questions up to the requested amount
    const selectedQuestions = this.getRandomQuestions(filteredQuestions, amount);

    return {
      success: true,
      questions: selectedQuestions,
      total_questions: selectedQuestions.length,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      creator: this.creator
    };
  }

  private getRandomQuestions(questions: TriviaQuestion[], amount: number): TriviaQuestion[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(amount, shuffled.length));
  }

  private shuffleArray(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private decodeHTML(text: string): string {
    const textarea = { innerHTML: text };
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"');
  }

  getAvailableCategories(): string[] {
    return Object.keys(this.categories);
  }

  getAvailableDifficulties(): string[] {
    return ['easy', 'medium', 'hard'];
  }

  getAvailableTypes(): string[] {
    return ['multiple', 'boolean'];
  }
}

export const triviaQuizService = new TriviaQuizService();